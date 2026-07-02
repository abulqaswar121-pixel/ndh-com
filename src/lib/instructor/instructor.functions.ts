import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertCourseOwner(supabase: any, userId: string, courseId: string) {
  const { data: c } = await supabase.from("courses").select("instructor_id").eq("id", courseId).maybeSingle();
  if (!c) throw new Error("Course not found");
  if (c.instructor_id === userId) return;
  const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
  const { data: isSuper } = await supabase.rpc("has_role", { _user_id: userId, _role: "super_admin" });
  const { data: isHod } = await supabase.rpc("has_role", { _user_id: userId, _role: "hod" });
  if (!isAdmin && !isSuper && !isHod) throw new Error("Forbidden");
}

// ---- Modules ----
const moduleInput = z.object({
  id: z.string().uuid().optional(),
  course_id: z.string().uuid(),
  title: z.string().min(2).max(200),
  description: z.string().max(2000).optional(),
  position: z.number().int().min(0).default(0),
});
export const upsertModule = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => moduleInput.parse(d))
  .handler(async ({ data, context }) => {
    await assertCourseOwner(context.supabase, context.userId, data.course_id);
    if (data.id) {
      const { error } = await context.supabase.from("modules").update({
        title: data.title, description: data.description ?? null, position: data.position,
      }).eq("id", data.id);
      if (error) throw new Error(error.message);
      return { ok: true, id: data.id };
    }
    const { data: ins, error } = await context.supabase.from("modules").insert({
      course_id: data.course_id, title: data.title, description: data.description ?? null, position: data.position,
    }).select("id").single();
    if (error) throw new Error(error.message);
    return { ok: true, id: ins.id as string };
  });

export const deleteModule = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid(), course_id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertCourseOwner(context.supabase, context.userId, data.course_id);
    const { error } = await context.supabase.from("modules").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---- Lessons ----
const lessonInput = z.object({
  id: z.string().uuid().optional(),
  course_id: z.string().uuid(),
  module_id: z.string().uuid(),
  title: z.string().min(2).max(200),
  description: z.string().max(2000).optional(),
  type: z.enum(["video", "pdf", "text"]),
  content_url: z.string().url().optional().nullable(),
  content_text: z.string().optional().nullable(),
  duration_minutes: z.number().int().min(0).max(600).optional(),
  position: z.number().int().min(0).default(0),
  is_preview: z.boolean().default(false),
});
export const upsertLesson = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => lessonInput.parse(d))
  .handler(async ({ data, context }) => {
    await assertCourseOwner(context.supabase, context.userId, data.course_id);
    const payload = {
      module_id: data.module_id, title: data.title, description: data.description ?? null,
      type: data.type, content_url: data.content_url ?? null, content_text: data.content_text ?? null,
      duration_minutes: data.duration_minutes ?? null, position: data.position, is_preview: data.is_preview,
    };
    if (data.id) {
      const { error } = await context.supabase.from("lessons").update(payload).eq("id", data.id);
      if (error) throw new Error(error.message);
      return { ok: true, id: data.id };
    }
    const { data: ins, error } = await context.supabase.from("lessons").insert(payload).select("id").single();
    if (error) throw new Error(error.message);
    return { ok: true, id: ins.id as string };
  });

export const deleteLesson = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid(), course_id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertCourseOwner(context.supabase, context.userId, data.course_id);
    const { error } = await context.supabase.from("lessons").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---- Assignments ----
const assignmentInput = z.object({
  id: z.string().uuid().optional(),
  course_id: z.string().uuid(),
  module_id: z.string().uuid().optional().nullable(),
  title: z.string().min(2).max(200),
  instructions: z.string().max(5000).optional(),
  max_score: z.number().int().min(1).max(1000).default(100),
  due_at: z.string().datetime().optional().nullable(),
});
export const upsertAssignment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => assignmentInput.parse(d))
  .handler(async ({ data, context }) => {
    await assertCourseOwner(context.supabase, context.userId, data.course_id);
    const payload = {
      course_id: data.course_id, module_id: data.module_id ?? null, title: data.title,
      instructions: data.instructions ?? null, max_score: data.max_score,
      due_at: data.due_at ?? null, created_by: context.userId,
    };
    if (data.id) {
      const { error } = await context.supabase.from("assignments").update(payload).eq("id", data.id);
      if (error) throw new Error(error.message);
      return { ok: true, id: data.id };
    }
    const { data: ins, error } = await context.supabase.from("assignments").insert(payload).select("id").single();
    if (error) throw new Error(error.message);
    return { ok: true, id: ins.id as string };
  });

const gradeInput = z.object({
  submission_id: z.string().uuid(),
  score: z.number().int().min(0),
  feedback: z.string().max(2000).optional(),
});
export const gradeSubmission = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => gradeInput.parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("assignment_submissions").update({
      score: data.score, feedback: data.feedback ?? null,
      status: "graded", graded_by: context.userId, graded_at: new Date().toISOString(),
    }).eq("id", data.submission_id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---- Live classes ----
const liveInput = z.object({
  id: z.string().uuid().optional(),
  course_id: z.string().uuid(),
  title: z.string().min(2).max(200),
  description: z.string().max(2000).optional(),
  meeting_url: z.string().url().optional().nullable(),
  starts_at: z.string().datetime(),
  duration_minutes: z.number().int().min(15).max(480).default(60),
  recording_url: z.string().url().optional().nullable(),
});
export const upsertLiveClass = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => liveInput.parse(d))
  .handler(async ({ data, context }) => {
    await assertCourseOwner(context.supabase, context.userId, data.course_id);
    const payload = {
      course_id: data.course_id, title: data.title, description: data.description ?? null,
      meeting_url: data.meeting_url ?? null, starts_at: data.starts_at,
      duration_minutes: data.duration_minutes, recording_url: data.recording_url ?? null,
      created_by: context.userId,
    };
    if (data.id) {
      const { error } = await context.supabase.from("live_classes").update(payload).eq("id", data.id);
      if (error) throw new Error(error.message);
      return { ok: true, id: data.id };
    }
    const { data: ins, error } = await context.supabase.from("live_classes").insert(payload).select("id").single();
    if (error) throw new Error(error.message);
    return { ok: true, id: ins.id as string };
  });

export const deleteLiveClass = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid(), course_id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertCourseOwner(context.supabase, context.userId, data.course_id);
    const { error } = await context.supabase.from("live_classes").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---- Read helpers ----
export const getInstructorCourses = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("courses")
      .select("id, program_name, slug, program_type, cover_image, is_published, students_count, curriculum_status, instructor_id, tuition_ngn")
      .eq("instructor_id", context.userId)
      .order("program_name");
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const getCourseRoster = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ course_id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await context.supabase.rpc("get_course_roster", { _course_id: data.course_id });
    if (error) throw new Error(error.message);
    return rows ?? [];
  });