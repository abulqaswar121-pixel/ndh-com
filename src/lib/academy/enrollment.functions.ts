import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type ApplyInput = {
  courseSlug: string;
  personalInfo: {
    fullName: string;
    phone: string;
    country: string;
    city?: string;
    dateOfBirth?: string;
    gender?: string;
  };
  educationBackground: {
    highestLevel: string;
    institution?: string;
    fieldOfStudy?: string;
    yearsExperience?: string;
  };
  motivationEssay: string;
  amount: number; // numeric amount in payment currency
  currency: string; // ISO code e.g. NGN, USD
};

/**
 * Create / upsert the student's application + enrolment row,
 * insert a pending tuition payment, and return a Paystack checkout URL.
 */
export const initEnrollmentPayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: ApplyInput) => {
    if (!d?.courseSlug) throw new Error("courseSlug required");
    if (!d?.personalInfo?.fullName) throw new Error("Full name required");
    if (!d?.personalInfo?.phone) throw new Error("Phone required");
    if (!d?.personalInfo?.country) throw new Error("Country required");
    if (!d?.educationBackground?.highestLevel) throw new Error("Education level required");
    if (!d?.motivationEssay || d.motivationEssay.trim().length < 30) {
      throw new Error("Motivation essay must be at least 30 characters");
    }
    if (!d?.amount || d.amount <= 0) throw new Error("Invalid amount");
    if (!d?.currency) throw new Error("Currency required");
    return d;
  })
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // Resolve course
    const { data: course, error: cErr } = await supabase
      .from("courses")
      .select("id, slug, program_name, program_type, tuition_ngn, duration, is_published")
      .eq("slug", data.courseSlug)
      .maybeSingle();
    if (cErr || !course) throw new Error("Course not found");
    if (!course.is_published) throw new Error("Course is not open for enrolment");

    // Caller profile (for email + name)
    const { data: profile } = await supabase
      .from("profiles")
      .select("email, full_name")
      .eq("id", userId)
      .maybeSingle();
    if (!profile?.email) throw new Error("Profile email missing");

    // Ensure student profile + role exist (privileged)
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("students").upsert(
      {
        user_id: userId,
        program_type: course.program_type,
        program_name: course.program_name,
      },
      { onConflict: "user_id" },
    );
    await supabaseAdmin
      .from("user_roles")
      .upsert({ user_id: userId, role: "student" }, { onConflict: "user_id,role", ignoreDuplicates: true });

    // Re-use any existing enrolment for the same student+course; otherwise create one.
    const { data: existing } = await supabase
      .from("enrollments")
      .select("id, status, payment_status")
      .eq("student_id", userId)
      .eq("course_id", course.id)
      .maybeSingle();
    if (existing && existing.status === "active") {
      throw new Error("You're already enrolled in this course");
    }

    let enrollmentId = existing?.id as string | undefined;
    if (!enrollmentId) {
      const { data: created, error: eErr } = await supabase
        .from("enrollments")
        .insert({
          student_id: userId,
          course_id: course.id,
          status: "pending",
          payment_status: "pending",
          progress: 0,
          personal_info: data.personalInfo,
          education_background: data.educationBackground,
          motivation_essay: data.motivationEssay,
        })
        .select("id")
        .single();
      if (eErr || !created) throw new Error(eErr?.message || "Could not create enrolment");
      enrollmentId = created.id;
    } else {
      await supabase
        .from("enrollments")
        .update({
          personal_info: data.personalInfo,
          education_background: data.educationBackground,
          motivation_essay: data.motivationEssay,
        })
        .eq("id", enrollmentId);
    }

    const currency = (data.currency || "NGN").toUpperCase();
    const amountMinor = Math.round(Number(data.amount) * 100);
    const reference = `NDH-ENR-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

    const { error: payErr } = await supabase.from("payments").insert({
      client_id: userId,
      enrollment_id: enrollmentId,
      amount: data.amount,
      currency,
      gateway: "paystack",
      transaction_ref: reference,
      status: "pending",
    });
    if (payErr) throw new Error(payErr.message);

    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) throw new Error("PAYSTACK_SECRET_KEY not configured");

    const resp = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        email: profile.email,
        amount: amountMinor,
        currency,
        reference,
        metadata: {
          kind: "enrollment",
          enrollment_id: enrollmentId,
          course_id: course.id,
          course_slug: course.slug,
          student_id: userId,
          program_name: course.program_name,
        },
      }),
    });

    const json = (await resp.json()) as {
      status?: boolean;
      message?: string;
      data?: { authorization_url: string; reference: string };
    };
    if (!resp.ok || !json?.status || !json.data?.authorization_url) {
      throw new Error(json?.message || "Paystack init failed");
    }

    return {
      authorization_url: json.data.authorization_url,
      reference: json.data.reference,
      enrollmentId,
    };
  });