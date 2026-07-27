import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { generateText, Output, NoObjectGeneratedError } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";

const MODEL = "google/gemini-3.6-flash";

function ai() {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("LOVABLE_API_KEY missing");
  return createLovableAiGatewayProvider(key)(MODEL);
}

async function requireEnrollment(supabase: any, userId: string, courseId: string) {
  const { data } = await supabase
    .from("enrollments").select("id, status, progress")
    .eq("student_id", userId).eq("course_id", courseId).maybeSingle();
  if (!data || data.status !== "active") throw new Error("Not enrolled");
  return data;
}

async function getCourseContext(supabase: any, courseId: string) {
  const { data: course } = await supabase
    .from("academy_courses")
    .select("id, name, description, learning_objectives, project_theme")
    .eq("id", courseId).maybeSingle();
  if (!course) throw new Error("Course not found");
  const { data: lessons } = await supabase
    .from("academy_lessons").select("title, notes").eq("course_id", courseId).order("position");
  return { course, lessons: lessons ?? [] };
}

/** Start an AI-generated exam. Returns paper (without correct answers). */
export const startExam = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { courseId: string }) => {
    if (!d?.courseId) throw new Error("courseId required");
    return d;
  })
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await requireEnrollment(supabase, userId, data.courseId);
    const { course, lessons } = await getCourseContext(supabase, data.courseId);

    const outline = lessons.map((l: any) => `- ${l.title}`).join("\n");
    const objectives = (course.learning_objectives ?? []).join("\n- ");
    const prompt = `You are an AI exam setter for the course "${course.name}".
Course description: ${course.description ?? ""}
Learning objectives:\n- ${objectives}
Lessons covered:\n${outline}

Create a UNIQUE, fair 45-minute exam:
- 5 multiple-choice questions (4 options each; exactly one correct)
- 3 short-answer questions (2-3 sentence expected answers)
- 1 essay question (300-500 words)

Return JSON only. Do not include explanations.`;

    const schema = z.object({
      mcq: z.array(z.object({
        q: z.string(),
        options: z.array(z.string()).length(4),
        correct_index: z.number().int().min(0).max(3),
      })).length(5),
      short: z.array(z.object({
        q: z.string(),
        model_answer: z.string(),
      })).length(3),
      essay: z.object({
        q: z.string(),
        rubric: z.array(z.string()),
      }),
    });

    let parsed: z.infer<typeof schema>;
    try {
      const { experimental_output } = await generateText({
        model: ai(),
        prompt,
        experimental_output: Output.object({ schema }),
      }) as any;
      parsed = experimental_output;
    } catch (err) {
      if (NoObjectGeneratedError.isInstance(err)) {
        try { parsed = JSON.parse(err.text ?? "{}"); }
        catch { throw new Error("AI exam generation failed. Try again."); }
      } else throw err;
    }

    // Paper for the student — no correct answers or model answers exposed
    const paper = {
      mcq: parsed.mcq.map((m) => ({ q: m.q, options: m.options })),
      short: parsed.short.map((s) => ({ q: s.q })),
      essay: { q: parsed.essay.q },
    };
    // Answer key retained server-side
    const answer_key = {
      mcq: parsed.mcq.map((m) => m.correct_index),
      short: parsed.short.map((s) => s.model_answer),
      essay_rubric: parsed.essay.rubric,
    };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: attempt, error } = await supabaseAdmin
      .from("academy_exam_attempts")
      .insert({ user_id: userId, course_id: data.courseId, paper, answer_key })
      .select("id, paper, started_at").single();
    if (error) throw new Error(error.message);
    return { attemptId: attempt.id, paper: attempt.paper, startedAt: attempt.started_at };
  });

/** Submit exam answers. AI grades short + essay; MCQ auto-graded. */
export const submitExam = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: {
    attemptId: string;
    answers: { mcq: number[]; short: string[]; essay: string };
  }) => {
    if (!d?.attemptId) throw new Error("attemptId required");
    return d;
  })
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: attempt } = await supabaseAdmin
      .from("academy_exam_attempts")
      .select("id, user_id, course_id, paper, answer_key, submitted_at")
      .eq("id", data.attemptId).maybeSingle();
    if (!attempt || attempt.user_id !== userId) throw new Error("Not found");
    if (attempt.submitted_at) throw new Error("Already submitted");

    const key: any = attempt.answer_key;
    const paper: any = attempt.paper;

    // MCQ score
    const mcqCorrect = (data.answers.mcq ?? []).reduce(
      (acc, ans, i) => acc + (ans === key.mcq[i] ? 1 : 0), 0,
    );
    const mcqScore = (mcqCorrect / key.mcq.length) * 40; // 40%

    // AI grades short answers + essay
    const gradePrompt = `Grade this student's answers strictly but fairly.

Short answer questions (score each 0-10):
${paper.short.map((s: any, i: number) =>
  `Q${i + 1}: ${s.q}\nModel answer: ${key.short[i]}\nStudent: ${data.answers.short?.[i] ?? "(blank)"}`).join("\n\n")}

Essay question (score 0-30 based on this rubric):
Q: ${paper.essay.q}
Rubric:\n- ${(key.essay_rubric ?? []).join("\n- ")}
Student answer: ${data.answers.essay ?? "(blank)"}

Return JSON with numeric scores and short feedback.`;

    const gradeSchema = z.object({
      short_scores: z.array(z.number().min(0).max(10)).length(3),
      essay_score: z.number().min(0).max(30),
      feedback: z.string(),
    });

    let grade: z.infer<typeof gradeSchema>;
    try {
      const { experimental_output } = await generateText({
        model: ai(),
        prompt: gradePrompt,
        experimental_output: Output.object({ schema: gradeSchema }),
      }) as any;
      grade = experimental_output;
    } catch (err) {
      if (NoObjectGeneratedError.isInstance(err)) {
        try { grade = JSON.parse(err.text ?? "{}"); }
        catch { grade = { short_scores: [0, 0, 0], essay_score: 0, feedback: "Auto-grading failed" }; }
      } else throw err;
    }

    const shortTotal = grade.short_scores.reduce((a, b) => a + b, 0) * (30 / 30); // 30%
    const essayTotal = grade.essay_score; // 30%
    const total = mcqScore + shortTotal + essayTotal;
    const passed = total >= 60;

    await supabaseAdmin.from("academy_exam_attempts").update({
      answers: data.answers,
      mcq_score: mcqScore,
      ai_short_score: shortTotal,
      ai_essay_score: essayTotal,
      total_score: total,
      passed,
      submitted_at: new Date().toISOString(),
    }).eq("id", data.attemptId);

    return { total, passed, feedback: grade.feedback };
  });

/** Generate a unique AI project brief for this student. */
export const generateProjectBrief = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { courseId: string }) => {
    if (!d?.courseId) throw new Error("courseId required");
    return d;
  })
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await requireEnrollment(supabase, userId, data.courseId);

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: existing } = await supabaseAdmin
      .from("academy_project_submissions")
      .select("id, brief, status, ai_score, ai_feedback, ai_verdict")
      .eq("user_id", userId).eq("course_id", data.courseId)
      .in("status", ["draft", "submitted", "approved"])
      .maybeSingle();
    if (existing) return existing;

    const { course } = await getCourseContext(supabase, data.courseId);
    const prompt = `Design a UNIQUE, practical capstone project brief for a student who just finished the "${course.name}" course.
Theme: ${course.project_theme ?? course.description ?? course.name}

The brief should:
- Be doable in 1-3 days
- Have a clear deliverable (text, document link, or file)
- Include 3-5 evaluation criteria the student should hit
- Feel fresh — vary scenarios, industries, or angles so no two students get the same brief.

Return a single markdown-formatted brief (200-350 words).`;

    const { text } = await generateText({ model: ai(), prompt });
    const { data: inserted, error } = await supabaseAdmin
      .from("academy_project_submissions")
      .insert({ user_id: userId, course_id: data.courseId, brief: text, status: "draft" })
      .select("id, brief, status, ai_score, ai_feedback, ai_verdict").single();
    if (error) throw new Error(error.message);
    return inserted;
  });

/** Submit project. AI evaluates. Director countersigns to issue certificate. */
export const submitProject = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { submissionId: string; content: string; fileUrl?: string }) => {
    if (!d?.submissionId) throw new Error("submissionId required");
    if (!d.content || d.content.trim().length < 50) throw new Error("Add at least a short write-up");
    return d;
  })
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: sub } = await supabaseAdmin
      .from("academy_project_submissions")
      .select("id, user_id, course_id, brief, status")
      .eq("id", data.submissionId).maybeSingle();
    if (!sub || sub.user_id !== userId) throw new Error("Not found");
    if (sub.status === "approved") throw new Error("Already approved");

    const prompt = `You are an AI reviewer. Evaluate this project submission against the brief.

BRIEF:\n${sub.brief}

SUBMISSION:\n${data.content}

Grade 0-100. Verdict is one of: pass (>=70), revise (40-69), fail (<40).
Give 3-5 specific feedback bullets.`;

    const schema = z.object({
      score: z.number().min(0).max(100),
      verdict: z.enum(["pass", "revise", "fail"]),
      bullets: z.array(z.string()),
    });

    let evalRes: z.infer<typeof schema>;
    try {
      const { experimental_output } = await generateText({
        model: ai(), prompt,
        experimental_output: Output.object({ schema }),
      }) as any;
      evalRes = experimental_output;
    } catch (err) {
      if (NoObjectGeneratedError.isInstance(err)) {
        try { evalRes = JSON.parse(err.text ?? "{}"); }
        catch { evalRes = { score: 0, verdict: "revise", bullets: ["AI evaluation failed. A director will review manually."] }; }
      } else throw err;
    }

    await supabaseAdmin.from("academy_project_submissions").update({
      content: data.content,
      file_url: data.fileUrl ?? null,
      ai_score: evalRes.score,
      ai_verdict: evalRes.verdict,
      ai_feedback: { bullets: evalRes.bullets },
      status: evalRes.verdict === "pass" ? "submitted" : "draft",
    }).eq("id", data.submissionId);

    return { score: evalRes.score, verdict: evalRes.verdict, bullets: evalRes.bullets };
  });

/** Director/Admin approves a project → queues certificate for signing. */
export const reviewProjectSubmission = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { submissionId: string; approve: boolean; note?: string }) => {
    if (!d?.submissionId) throw new Error("submissionId required");
    return d;
  })
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: isDir } = await supabase.rpc("has_role", { _user_id: userId, _role: "hod" });
    const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
    const { data: isSuper } = await supabase.rpc("has_role", { _user_id: userId, _role: "super_admin" });
    if (!isDir && !isAdmin && !isSuper) throw new Error("Only directors/admins may review");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("academy_project_submissions").update({
      status: data.approve ? "approved" : "rejected",
      director_note: data.note ?? null,
      reviewed_by: userId,
      reviewed_at: new Date().toISOString(),
    }).eq("id", data.submissionId);

    return { ok: true };
  });

/** Mark a lesson as watched. Recomputes progress on the enrollment. */
export const markLessonWatched = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { lessonId: string; courseId: string }) => {
    if (!d?.lessonId || !d?.courseId) throw new Error("lessonId & courseId required");
    return d;
  })
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await supabase.from("academy_lesson_progress")
      .upsert({ user_id: userId, lesson_id: data.lessonId }, { onConflict: "user_id,lesson_id" });

    // Recompute progress %
    const [{ count: total }, { count: done }] = await Promise.all([
      supabase.from("academy_lessons").select("id", { count: "exact", head: true }).eq("course_id", data.courseId),
      supabase.from("academy_lesson_progress").select("lesson_id", { count: "exact", head: true }).eq("user_id", userId)
        .in("lesson_id",
          (await supabase.from("academy_lessons").select("id").eq("course_id", data.courseId)).data?.map((l: any) => l.id) ?? [],
        ),
    ]);
    const progress = total ? Math.round(((done ?? 0) / total) * 100) : 0;
    await supabase.from("enrollments").update({ progress })
      .eq("student_id", userId).eq("course_id", data.courseId);
    return { progress };
  });