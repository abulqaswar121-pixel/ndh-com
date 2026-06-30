import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertStaff(supabase: any, userId: string) {
  const { data: a } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
  const { data: s } = await supabase.rpc("has_role", { _user_id: userId, _role: "super_admin" });
  if (!a && !s) throw new Error("Forbidden");
}

export const submitApplication = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      full_name: z.string().min(2).max(160),
      email: z.string().email(),
      phone: z.string().max(40).optional(),
      country: z.string().max(80).optional(),
      course_id: z.string().uuid().optional(),
      intake: z.string().max(40).optional(),
      prior_education: z.string().max(2000).optional(),
      documents: z.array(z.object({ name: z.string(), url: z.string() })).optional(),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("admissions_applications").insert({
      ...data,
      applicant_id: context.userId,
      status: "submitted",
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const decideApplication = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      id: z.string().uuid(),
      status: z.enum(["under_review", "accepted", "rejected", "waitlist"]),
      decision_notes: z.string().max(2000).optional(),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertStaff(context.supabase, context.userId);
    const { error } = await context.supabase
      .from("admissions_applications")
      .update({
        status: data.status,
        decision_notes: data.decision_notes ?? null,
        decided_by: context.userId,
        decided_at: new Date().toISOString(),
      })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const upsertExam = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      id: z.string().uuid().optional(),
      course_id: z.string().uuid().nullable().optional(),
      title: z.string().min(2).max(160),
      starts_at: z.string(),
      duration_minutes: z.number().int().min(15).max(600),
      venue: z.string().max(200).optional(),
      mode: z.enum(["online", "in_person", "hybrid"]).default("online"),
      proctor: z.string().max(160).optional(),
      capacity: z.number().int().positive().optional(),
      notes: z.string().max(2000).optional(),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertStaff(context.supabase, context.userId);
    const payload = { ...data, created_by: context.userId };
    if (data.id) {
      const { error } = await context.supabase.from("exam_schedules").update(payload).eq("id", data.id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await context.supabase.from("exam_schedules").insert(payload);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const deleteExam = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertStaff(context.supabase, context.userId);
    const { error } = await context.supabase.from("exam_schedules").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const generateTranscript = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      student_id: z.string().uuid(),
      gpa: z.number().min(0).max(5).optional(),
      notes: z.string().max(2000).optional(),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertStaff(context.supabase, context.userId);
    const transcriptNumber = `NDH-TR-${new Date().getFullYear()}-${Math.floor(Math.random() * 1_000_000).toString().padStart(6, "0")}`;
    const { data: row, error } = await context.supabase
      .from("transcripts")
      .insert({
        student_id: data.student_id,
        transcript_number: transcriptNumber,
        gpa: data.gpa ?? null,
        notes: data.notes ?? null,
        generated_by: context.userId,
      })
      .select("id, transcript_number")
      .single();
    if (error) throw new Error(error.message);
    return row;
  });