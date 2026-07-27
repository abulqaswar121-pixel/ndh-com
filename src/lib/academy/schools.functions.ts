import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

function publicClient() {
  const key = process.env.SUPABASE_PUBLISHABLE_KEY!;
  return createClient<Database>(process.env.SUPABASE_URL!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

export const listSchoolsWithCourses = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const [{ data: schools }, { data: courses }, { data: pricing }] = await Promise.all([
    sb.from("schools").select("id,slug,name,description,icon,display_order").order("display_order"),
    sb.from("academy_courses").select("id,school_id,slug,name,description,region_prices,display_order").eq("is_published", true).order("display_order"),
    sb.from("academy_pricing").select("region,tier,currency,amount"),
  ]);
  return { schools: schools ?? [], courses: courses ?? [], pricing: pricing ?? [] };
});

export const getCourseFull = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string }) => d)
  .handler(async ({ data }) => {
    const sb = publicClient();
    const { data: course } = await sb.from("academy_courses").select("*").eq("slug", data.slug).maybeSingle();
    if (!course) return null;
    const [{ data: lessons }, { data: assignment }, { data: quiz }, { data: project }] = await Promise.all([
      sb.from("academy_lessons").select("*").eq("course_id", course.id).order("position"),
      sb.from("academy_assignments").select("*").eq("course_id", course.id).maybeSingle(),
      sb.from("academy_quiz_questions").select("*").eq("course_id", course.id).order("position"),
      sb.from("academy_projects").select("*").eq("course_id", course.id).maybeSingle(),
    ]);
    return { course, lessons: lessons ?? [], assignment, quiz: quiz ?? [], project };
  });

type SaveInput = {
  course_id: string;
  name?: string;
  description?: string;
  region_prices?: Record<string, number>;
  is_published?: boolean;
  lessons?: Array<{ id?: string; position: number; title: string; video_url?: string; notes?: string }>;
  assignment?: string;
  quiz?: Array<{ id?: string; position: number; question: string; options: string[]; correct_index: number }>;
  project?: string;
};

export const saveCourse = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: SaveInput) => d)
  .handler(async ({ data, context }) => {
    const sb = context.supabase;
    const { data: allowed } = await sb.rpc("has_role", { _user_id: context.userId, _role: "super_admin" });
    const { data: admin } = await sb.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    const { data: hod } = await sb.rpc("has_role", { _user_id: context.userId, _role: "hod" });
    if (!allowed && !admin && !hod) throw new Error("Forbidden");

    const update: Record<string, unknown> = {};
    if (data.name !== undefined) update.name = data.name;
    if (data.description !== undefined) update.description = data.description;
    if (data.region_prices !== undefined) update.region_prices = data.region_prices;
    if (data.is_published !== undefined) update.is_published = data.is_published;
    if (Object.keys(update).length) {
      const { error } = await sb.from("academy_courses").update(update).eq("id", data.course_id);
      if (error) throw error;
    }

    if (data.lessons) {
      await sb.from("academy_lessons").delete().eq("course_id", data.course_id);
      if (data.lessons.length) {
        const rows = data.lessons.map((l) => ({
          course_id: data.course_id,
          position: l.position,
          title: l.title,
          video_url: l.video_url || null,
          notes: l.notes || null,
        }));
        const { error } = await sb.from("academy_lessons").insert(rows);
        if (error) throw error;
      }
    }

    if (data.assignment !== undefined) {
      await sb.from("academy_assignments").delete().eq("course_id", data.course_id);
      if (data.assignment.trim()) {
        const { error } = await sb.from("academy_assignments").insert({ course_id: data.course_id, instructions: data.assignment });
        if (error) throw error;
      }
    }

    if (data.quiz) {
      await sb.from("academy_quiz_questions").delete().eq("course_id", data.course_id);
      if (data.quiz.length) {
        const rows = data.quiz.map((q) => ({
          course_id: data.course_id,
          position: q.position,
          question: q.question,
          options: q.options,
          correct_index: q.correct_index,
        }));
        const { error } = await sb.from("academy_quiz_questions").insert(rows);
        if (error) throw error;
      }
    }

    if (data.project !== undefined) {
      await sb.from("academy_projects").delete().eq("course_id", data.course_id);
      if (data.project.trim()) {
        const { error } = await sb.from("academy_projects").insert({ course_id: data.course_id, brief: data.project });
        if (error) throw error;
      }
    }

    return { ok: true };
  });

export const listCoursesForEditor = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const sb = context.supabase;
    const [{ data: schools }, { data: courses }, { data: lessons }, { data: quizzes }, { data: projects }] = await Promise.all([
      sb.from("schools").select("id,slug,name").order("display_order"),
      sb.from("academy_courses").select("id,school_id,slug,name,is_published").order("display_order"),
      sb.from("academy_lessons").select("course_id"),
      sb.from("academy_quiz_questions").select("course_id"),
      sb.from("academy_projects").select("course_id"),
    ]);
    const has = (arr: Array<{ course_id: string }> | null, id: string) => (arr ?? []).some((r) => r.course_id === id);
    return {
      schools: schools ?? [],
      courses: (courses ?? []).map((c) => ({
        ...c,
        has_lessons: has(lessons, c.id),
        has_quiz: has(quizzes, c.id),
        has_project: has(projects, c.id),
      })),
    };
  });