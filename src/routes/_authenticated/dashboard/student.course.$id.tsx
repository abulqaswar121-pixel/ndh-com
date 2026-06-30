import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft, CheckCircle2, Circle, FileText, PlayCircle, Loader2, Lock, BookOpen, Save,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard/student/course/$id")({
  component: CoursePlayerPage,
});

type Lesson = { id: string; title: string; type: "video" | "pdf" | "text"; position: number; duration_minutes: number | null; is_preview: boolean };
type ModuleRow = { id: string; title: string; position: number; lessons: Lesson[] };
type Course = { id: string; program_name: string; program_type: string; cover_image: string | null };
type LessonFull = Lesson & { content_url: string | null; content_text: string | null; description: string | null };

function CoursePlayerPage() {
  const { id: courseId } = useParams({ from: "/_authenticated/dashboard/student/course/$id" });
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<ModuleRow[]>([]);
  const [enrolled, setEnrolled] = useState(false);
  const [progressPct, setProgressPct] = useState(0);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [lesson, setLesson] = useState<LessonFull | null>(null);
  const [lessonLoading, setLessonLoading] = useState(false);
  const [notes, setNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load course + modules + lessons + progress
  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: c }, { data: mods }, { data: enr }, { data: prog }] = await Promise.all([
        supabase.from("courses").select("id,program_name,program_type,cover_image").eq("id", courseId).maybeSingle(),
        supabase
          .from("modules")
          .select("id,title,position,lessons(id,title,type,position,duration_minutes,is_preview)")
          .eq("course_id", courseId)
          .order("position"),
        supabase.from("enrollments").select("id,status,progress").eq("student_id", user.id).eq("course_id", courseId).maybeSingle(),
        supabase.from("lesson_progress").select("lesson_id,completed").eq("student_id", user.id).eq("course_id", courseId),
      ]);
      setCourse(c as Course | null);
      const sorted = ((mods as unknown as ModuleRow[]) || []).map((m) => ({
        ...m,
        lessons: (m.lessons || []).slice().sort((a, b) => a.position - b.position),
      }));
      setModules(sorted);
      setEnrolled(!!enr && enr.status === "active");
      setProgressPct(enr?.progress || 0);
      setCompletedIds(new Set((prog || []).filter((p) => p.completed).map((p) => p.lesson_id)));
      const first = sorted.flatMap((m) => m.lessons)[0];
      if (first) setActiveLessonId(first.id);
      setLoading(false);
    })();
  }, [user, courseId]);

  // Load lesson content when active changes (uses RPC for access gating)
  useEffect(() => {
    if (!activeLessonId || !user) return;
    setLessonLoading(true);
    setLesson(null);
    setNotes("");
    (async () => {
      const { data, error } = await supabase.rpc("get_lesson_content", { _lesson_id: activeLessonId });
      if (error) toast.error(error.message);
      setLesson((data as unknown as LessonFull) || null);
      const { data: lp } = await supabase
        .from("lesson_progress")
        .select("notes")
        .eq("student_id", user.id)
        .eq("lesson_id", activeLessonId)
        .maybeSingle();
      setNotes(lp?.notes || "");
      setLessonLoading(false);
    })();
  }, [activeLessonId, user]);

  const allLessons = useMemo(() => modules.flatMap((m) => m.lessons), [modules]);
  const totalLessons = allLessons.length;
  const computedPct = totalLessons ? Math.round((completedIds.size / totalLessons) * 100) : 0;

  const recomputeAndSaveProgress = async (newCompleted: Set<string>) => {
    if (!user) return;
    const pct = totalLessons ? Math.round((newCompleted.size / totalLessons) * 100) : 0;
    setProgressPct(pct);
    await supabase
      .from("enrollments")
      .update({ progress: pct, ...(pct >= 100 ? { completed_at: new Date().toISOString() } : {}) })
      .eq("student_id", user.id)
      .eq("course_id", courseId);
  };

  const markComplete = async () => {
    if (!user || !activeLessonId) return;
    const isCompleted = completedIds.has(activeLessonId);
    const newCompleted = new Set(completedIds);
    if (isCompleted) newCompleted.delete(activeLessonId);
    else newCompleted.add(activeLessonId);
    setCompletedIds(newCompleted);
    const { error } = await supabase.from("lesson_progress").upsert(
      {
        student_id: user.id,
        course_id: courseId,
        lesson_id: activeLessonId,
        completed: !isCompleted,
        completed_at: !isCompleted ? new Date().toISOString() : null,
        notes,
      },
      { onConflict: "student_id,lesson_id" },
    );
    if (error) { toast.error(error.message); return; }
    await recomputeAndSaveProgress(newCompleted);
    toast.success(isCompleted ? "Marked incomplete" : "Lesson completed");
    // Auto-advance
    if (!isCompleted) {
      const idx = allLessons.findIndex((l) => l.id === activeLessonId);
      const next = allLessons[idx + 1];
      if (next) setActiveLessonId(next.id);
    }
  };

  const saveNotes = async () => {
    if (!user || !activeLessonId) return;
    setSavingNotes(true);
    const { error } = await supabase.from("lesson_progress").upsert(
      {
        student_id: user.id,
        course_id: courseId,
        lesson_id: activeLessonId,
        completed: completedIds.has(activeLessonId),
        notes,
      },
      { onConflict: "student_id,lesson_id" },
    );
    setSavingNotes(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Notes saved");
  };

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="mx-auto max-w-2xl p-10 text-center">
        <h1 className="text-2xl font-bold">Course not found</h1>
        <Link to="/dashboard/student" className="mt-4 inline-block text-primary underline">Back to dashboard</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/30">
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 px-5 backdrop-blur">
        <Link to="/dashboard/student" search={{ tab: "courses" }} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> My Courses
        </Link>
        <div className="min-w-0 truncate text-sm font-semibold">{course.program_name}</div>
        <div className="hidden items-center gap-2 sm:flex">
          <div className="text-xs text-muted-foreground">{computedPct}% complete</div>
          <Progress value={computedPct} className="w-32" />
        </div>
      </header>

      <div className="grid gap-0 lg:grid-cols-[320px_1fr]">
        {/* Module sidebar */}
        <aside className="border-b border-border bg-card lg:h-[calc(100vh-4rem)] lg:overflow-y-auto lg:border-b-0 lg:border-r">
          <div className="p-4">
            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Course content</div>
            <div className="mt-1 text-sm font-bold">{modules.length} modules · {totalLessons} lessons</div>
          </div>
          <div className="space-y-1 px-2 pb-6">
            {modules.map((m) => (
              <div key={m.id}>
                <div className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">{m.title}</div>
                {m.lessons.map((l) => {
                  const done = completedIds.has(l.id);
                  const active = activeLessonId === l.id;
                  const locked = !enrolled && !l.is_preview;
                  return (
                    <button
                      key={l.id}
                      disabled={locked}
                      onClick={() => setActiveLessonId(l.id)}
                      className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition ${
                        active ? "bg-gradient-brand text-white" : "hover:bg-secondary"
                      } ${locked ? "opacity-50" : ""}`}
                    >
                      {locked ? <Lock className="h-4 w-4 shrink-0" /> : done ? <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" /> : <Circle className="h-4 w-4 shrink-0" />}
                      <span className="flex-1 truncate">{l.title}</span>
                      <span className="text-[10px] opacity-70">{l.duration_minutes || 0}m</span>
                    </button>
                  );
                })}
              </div>
            ))}
            {modules.length === 0 && (
              <div className="px-3 py-8 text-center text-sm text-muted-foreground">
                Curriculum is being prepared by your instructor.
              </div>
            )}
          </div>
        </aside>

        {/* Content viewer */}
        <main className="p-5 lg:p-8">
          {lessonLoading ? (
            <div className="flex h-64 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : !lesson ? (
            <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
              <Lock className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
              <p className="text-muted-foreground">
                {enrolled ? "Select a lesson to begin." : "Enroll to unlock this lesson."}
              </p>
            </div>
          ) : (
            <div className="mx-auto max-w-4xl space-y-6">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-primary">Lesson</div>
                <h1 className="text-2xl font-extrabold">{lesson.title}</h1>
                {lesson.description && <p className="mt-2 text-sm text-muted-foreground">{lesson.description}</p>}
              </div>

              {/* Content by type */}
              {lesson.type === "video" && lesson.content_url && (
                <div className="overflow-hidden rounded-2xl border border-border bg-black">
                  <video src={lesson.content_url} controls className="aspect-video w-full" />
                </div>
              )}
              {lesson.type === "pdf" && lesson.content_url && (
                <div className="overflow-hidden rounded-2xl border border-border">
                  <iframe src={lesson.content_url} className="h-[70vh] w-full" title={lesson.title} />
                </div>
              )}
              {lesson.type === "text" && lesson.content_text && (
                <article className="prose prose-invert max-w-none rounded-2xl border border-border bg-card p-6 text-sm leading-relaxed">
                  {lesson.content_text.split("\n").map((p, i) => <p key={i}>{p}</p>)}
                </article>
              )}
              {!lesson.content_url && !lesson.content_text && (
                <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
                  <PlayCircle className="mx-auto mb-3 h-10 w-10" />
                  Content for this lesson is coming soon.
                </div>
              )}

              {/* Notes + Actions */}
              <div className="rounded-2xl border border-border bg-card p-5">
                <div className="mb-3 flex items-center gap-2 text-sm font-bold">
                  <FileText className="h-4 w-4" /> Your notes
                </div>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={5}
                  placeholder="Jot down key takeaways…"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
                />
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <Button variant="outline" onClick={saveNotes} disabled={savingNotes}>
                    {savingNotes ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save notes
                  </Button>
                  <Button variant="brand" onClick={markComplete}>
                    {completedIds.has(lesson.id) ? <><Circle className="h-4 w-4" /> Mark incomplete</> : <><CheckCircle2 className="h-4 w-4" /> Mark complete & continue</>}
                  </Button>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-card p-5">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 font-bold"><BookOpen className="h-4 w-4" /> Course progress</div>
                  <div className="text-muted-foreground">{completedIds.size} / {totalLessons} lessons · {progressPct}%</div>
                </div>
                <Progress value={progressPct} className="mt-3" />
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}