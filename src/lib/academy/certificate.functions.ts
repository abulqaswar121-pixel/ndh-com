import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Issues a certificate for the caller's completed enrolment.
 * Requires progress = 100 and an active enrolment. Idempotent — returns the
 * existing certificate if one already exists.
 */
export const issueCertificate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { enrollmentId: string; grade?: string }) => {
    if (!d?.enrollmentId) throw new Error("enrollmentId required");
    return d;
  })
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: enr, error: eErr } = await supabase
      .from("enrollments")
      .select("id, student_id, course_id, progress, status")
      .eq("id", data.enrollmentId)
      .maybeSingle();
    if (eErr || !enr) throw new Error("Enrolment not found");
    if (enr.student_id !== userId) throw new Error("Forbidden");
    if ((enr.progress ?? 0) < 100) throw new Error("Course not fully completed yet");
    if (enr.status !== "active") throw new Error("Enrolment is not active");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Idempotent: return existing certificate if any
    const { data: existing } = await supabaseAdmin
      .from("certificates")
      .select("id, certificate_number, pdf_url, verification_token")
      .eq("student_id", userId)
      .eq("course_id", enr.course_id)
      .maybeSingle();
    if (existing) {
      return await withSignedUrl(supabaseAdmin, existing);
    }

    // Fetch course + student profile
    const [{ data: course }, { data: profile }] = await Promise.all([
      supabaseAdmin.from("courses").select("program_name, program_type").eq("id", enr.course_id!).maybeSingle(),
      supabaseAdmin.from("profiles").select("full_name, email").eq("id", userId).maybeSingle(),
    ]);
    if (!course) throw new Error("Course missing");
    const studentName = profile?.full_name || "NDH Graduate";

    // Allocate certificate number + verification token
    const { data: numRow } = await supabaseAdmin.rpc("next_certificate_number");
    const certificateNumber = (numRow as string) ||
      `NDH-CERT-${new Date().getFullYear()}-${Math.floor(Math.random() * 1_000_000).toString().padStart(6, "0")}`;
    const verificationToken = crypto.randomUUID();
    const verifyUrl = `https://ndh.com.ng/verify/${certificateNumber}`;
    const issueDate = new Date();
    const grade = data.grade || "Pass";

    // Render PDF
    const { renderCertificatePdf } = await import("./certificate.server");
    const bytes = await renderCertificatePdf({
      studentName,
      programName: course.program_name,
      programType: course.program_type || "Certificate",
      certificateNumber,
      grade,
      issueDate,
      verifyUrl,
    });

    // Upload to storage at <userId>/<certificateNumber>.pdf
    const path = `${userId}/${certificateNumber}.pdf`;
    const { error: upErr } = await supabaseAdmin.storage
      .from("certificates")
      .upload(path, bytes, { contentType: "application/pdf", upsert: true });
    if (upErr) throw new Error(`Storage upload failed: ${upErr.message}`);

    // Insert row
    const { data: inserted, error: insErr } = await supabaseAdmin
      .from("certificates")
      .insert({
        student_id: userId,
        course_id: enr.course_id,
        certificate_number: certificateNumber,
        grade,
        verification_token: verificationToken,
        pdf_url: path,
        qr_code: verifyUrl,
        issue_date: issueDate.toISOString(),
      })
      .select("id, certificate_number, pdf_url, verification_token")
      .single();
    if (insErr || !inserted) throw new Error(insErr?.message || "Failed to save certificate");

    // Notify in-app
    await supabaseAdmin.from("notifications").insert({
      user_id: userId,
      type: "certificate_issued",
      title: "Your certificate is ready 🎓",
      body: `Certificate ${certificateNumber} for ${course.program_name} is available to download.`,
      link: "/dashboard/student?tab=certificates",
    });

    // Email
    if (profile?.email) {
      const { sendSystemEmail } = await import("@/lib/email/send-system.server");
      const { data: signed } = await supabaseAdmin.storage
        .from("certificates").createSignedUrl(path, 60 * 60 * 24 * 7);
      await sendSystemEmail(supabaseAdmin, "certificate_issued", profile.email, {
        studentName,
        programName: course.program_name,
        certificateNumber,
        grade,
        issueDate: issueDate.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" }),
        verifyUrl,
        downloadUrl: signed?.signedUrl || verifyUrl,
      });
    }

    return await withSignedUrl(supabaseAdmin, inserted);
  });

async function withSignedUrl(
  admin: Awaited<ReturnType<typeof import("@/integrations/supabase/client.server")["supabaseAdmin"] extends infer T ? () => T : never>> | any,
  cert: { id: string; certificate_number: string; pdf_url: string | null; verification_token: string | null },
) {
  let downloadUrl: string | null = null;
  if (cert.pdf_url) {
    const { data } = await admin.storage.from("certificates").createSignedUrl(cert.pdf_url, 60 * 60 * 24 * 7);
    downloadUrl = data?.signedUrl ?? null;
  }
  return {
    id: cert.id,
    certificateNumber: cert.certificate_number,
    downloadUrl,
    verifyUrl: `/verify/${cert.certificate_number}`,
  };
}

/** Generate a fresh signed URL for a student's existing certificate PDF. */
export const getCertificateDownloadUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { certificateId: string }) => {
    if (!d?.certificateId) throw new Error("certificateId required");
    return d;
  })
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: cert } = await supabase
      .from("certificates")
      .select("id, pdf_url, student_id")
      .eq("id", data.certificateId)
      .maybeSingle();
    if (!cert || cert.student_id !== userId) throw new Error("Forbidden");
    if (!cert.pdf_url) throw new Error("No PDF on file");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: signed, error } = await supabaseAdmin.storage
      .from("certificates").createSignedUrl(cert.pdf_url, 60 * 60);
    if (error || !signed) throw new Error("Signed URL failed");
    return { url: signed.signedUrl };
  });