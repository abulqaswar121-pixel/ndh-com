import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  CheckCircle2, Circle, Lock, Loader2, ArrowLeft, FileText, GraduationCap, Sparkles,
} from "lucide-react";
import {
  markLessonWatched, startExam, submitExam, generateProjectBrief, submitProject,
} from "@/lib/academy/ai.functions";

export const Route = createFileRoute("/_authenticated/academy/learn/$slug")({
  component: LearnPage,
});

type Lesson = { id: string; title: string; video_url: string | null; notes: string | null; position: number };
type Course = { id: string; slug: string; name: string; description: string | null };

function youtubeEmbed(url: string | null): string | null {
  if (!url) return null;
  const m = url.match(/(?:v=|youtu\.be\/|embed\/)([\w-]{11})/);
  return m ? `https://www.youtube.com/embed/${m[1]}` : url;
}

function LearnPage() {
  const { slug } = Route.useParams();
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [watched, setWatched] = useState<Set<string>>(new Set());
  const [activeIdx, setActiveIdx] = useState(0);
  const [enrolled, setEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"lessons" | "exam" | "project">("lessons");

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: c } = await supabase.from("academy_courses")
        .select("id, slug, name, description").eq("slug", slug).maybeSingle();
      if (!c) { setLoading(false); return; }
      setCourse(c as Course);
      const [{ data: ls }, { data: enr }, { data: prog }] = await Promise.all([
        supabase.from("academy_lessons").select("id, title, video_url, notes, position")
          .eq("course_id", c.id).order("position"),
        supabase.from("enrollments").select("id, status").eq("student_id", user.id).eq("course_id", c.id).maybeSingle(),
        supabase.from("academy_lesson_progress").select("lesson_id").eq("user_id", user.id),
      ]);
      setLessons((ls as Lesson[]) ?? []);
      setEnrolled(!!enr && enr.status === "active");
      setWatched(new Set((prog ?? []).map((p) => p.lesson_id)));
      setLoading(false);
    })();
  }, [user, slug]);

  const markWatched = useServerFn(markLessonWatched);
  const active = lessons[activeIdx];
  const pct = lessons.length ? Math.round((watched.size / lessons.length) * 100) : 0;
  const allWatched = lessons.length > 0 && watched.size >= lessons.length;

  const handleMark = async () => {
    if (!active || !course) return;
    if (watched.has(active.id)) return;
    try {
      await markWatched({ data: { lessonId: active.id, courseId: course.id } });
      setWatched((s) => new Set(s).add(active.id));
      toast.success("Lesson complete");
      if (activeIdx < lessons.length - 1) setActiveIdx(activeIdx + 1);
    } catch (e) { toast.error((e as Error).message); }
  };

  if (loading) {
    return <div className="grid min-h-screen place-items-center"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }
  if (!course) {
    return <div className="mx-auto max-w-xl p-10 text-center">
      <h1 className="text-xl font-bold">Course not found</h1>
      <Link to="/academy" className="mt-4 inline-block text-primary underline">Back to Academy</Link>
    </div>;
  }
  if (!enrolled) {
    return <div className="mx-auto max-w-xl p-10 text-center">
      <Lock className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
      <h1 className="text-xl font-bold">Enrol to start learning</h1>
      <Link to="/academy" className="mt-4 inline-block text-primary underline">Choose a plan</Link>
    </div>;
  }

  return (
    <div className="min-h-screen bg-secondary/20">
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-background/90 px-4 backdrop-blur">
        <Link to="/dashboard/student" search={{ tab: "courses" }} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> My Courses
        </Link>
        <div className="truncate text-sm font-semibold">{course.name}</div>
        <div className="hidden items-center gap-2 sm:flex">
          <span className="text-xs text-muted-foreground">{pct}%</span>
          <Progress value={pct} className="w-28" />
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-4">
        <div className="mb-4 flex gap-2 border-b">
          {(["lessons", "exam", "project"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              disabled={t !== "lessons" && !allWatched}
              className={`border-b-2 px-4 py-2 text-sm font-medium transition ${
                tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground"
              } disabled:opacity-40`}
            >
              {t === "lessons" && "Lessons"}
              {t === "exam" && "Exam"}
              {t === "project" && "Project"}
              {t !== "lessons" && !allWatched && " (locked)"}
            </button>
          ))}
        </div>

        {tab === "lessons" && (
          <div className="grid gap-4 md:grid-cols-[280px_1fr]">
            <Card className="max-h-[70vh] overflow-y-auto p-2">
              {lessons.map((l, i) => {
                const done = watched.has(l.id);
                const isActive = i === activeIdx;
                return (
                  <button key={l.id} onClick={() => setActiveIdx(i)}
                    className={`flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm ${isActive ? "bg-primary text-primary-foreground" : "hover:bg-secondary"}`}>
                    {done ? <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" /> : <Circle className="h-4 w-4 shrink-0" />}
                    <span className="flex-1 truncate">{i + 1}. {l.title}</span>
                  </button>
                );
              })}
              {lessons.length === 0 && <p className="p-4 text-sm text-muted-foreground">No lessons yet.</p>}
            </Card>
            <div>
              {active ? (
                <>
                  <h1 className="text-xl font-bold">{active.title}</h1>
                  {youtubeEmbed(active.video_url) ? (
                    <div className="mt-3 aspect-video overflow-hidden rounded-xl border bg-black">
                      <iframe src={youtubeEmbed(active.video_url)!} className="h-full w-full" allowFullScreen title={active.title} />
                    </div>
                  ) : (
                    <p className="mt-4 text-sm text-muted-foreground">Video coming soon.</p>
                  )}
                  {active.notes && <div className="mt-4 whitespace-pre-wrap rounded-xl border bg-card p-4 text-sm">{active.notes}</div>}
                  <div className="mt-4 flex justify-end">
                    <Button onClick={handleMark} disabled={watched.has(active.id)}>
                      {watched.has(active.id) ? "Completed" : "Mark complete & continue"}
                    </Button>
                  </div>
                </>
              ) : <p className="text-muted-foreground">Pick a lesson.</p>}
            </div>
          </div>
        )}

        {tab === "exam" && allWatched && <ExamPanel courseId={course.id} />}
        {tab === "project" && allWatched && <ProjectPanel courseId={course.id} />}
      </div>
    </div>
  );
}

function ExamPanel({ courseId }: { courseId: string }) {
  const start = useServerFn(startExam);
  const submit = useServerFn(submitExam);
  const [paper, setPaper] = useState<any>(null);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [mcq, setMcq] = useState<number[]>([]);
  const [shortA, setShortA] = useState<string[]>(["", "", ""]);
  const [essay, setEssay] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ total: number; passed: boolean; feedback: string } | null>(null);

  const begin = async () => {
    setBusy(true);
    try {
      const r = await start({ data: { courseId } });
      setAttemptId(r.attemptId); setPaper(r.paper);
      setMcq(new Array(r.paper.mcq.length).fill(-1));
    } catch (e) { toast.error((e as Error).message); }
    finally { setBusy(false); }
  };

  const send = async () => {
    if (!attemptId) return;
    setBusy(true);
    try {
      const r = await submit({ data: { attemptId, answers: { mcq, short: shortA, essay } } });
      setResult(r);
    } catch (e) { toast.error((e as Error).message); }
    finally { setBusy(false); }
  };

  if (result) {
    return <Card className="p-6">
      <div className="flex items-center gap-3">
        {result.passed ? <CheckCircle2 className="h-8 w-8 text-emerald-500" /> : <Circle className="h-8 w-8 text-muted-foreground" />}
        <div>
          <div className="text-lg font-bold">{result.passed ? "You passed!" : "Not quite there"}</div>
          <div className="text-sm text-muted-foreground">Score: {Math.round(result.total)}/100</div>
        </div>
      </div>
      <p className="mt-4 whitespace-pre-wrap text-sm">{result.feedback}</p>
      {result.passed && <p className="mt-4 text-sm">Next: submit your capstone project in the Project tab.</p>}
    </Card>;
  }

  if (!paper) {
    return <Card className="p-6 text-center">
      <Sparkles className="mx-auto mb-3 h-8 w-8 text-primary" />
      <h2 className="text-lg font-bold">AI-graded exam</h2>
      <p className="mt-1 text-sm text-muted-foreground">A unique 45-minute exam will be generated for you: 5 multiple-choice, 3 short-answer, 1 essay.</p>
      <Button className="mt-4" onClick={begin} disabled={busy}>{busy ? "Generating…" : "Start exam"}</Button>
    </Card>;
  }

  return <div className="space-y-6">
    {paper.mcq.map((m: any, i: number) => (
      <Card key={i} className="p-4">
        <div className="text-xs font-semibold text-muted-foreground">MCQ {i + 1}</div>
        <p className="mt-1 font-medium">{m.q}</p>
        <div className="mt-3 space-y-2">
          {m.options.map((o: string, oi: number) => (
            <label key={oi} className="flex items-center gap-2 text-sm">
              <input type="radio" name={`mcq-${i}`} checked={mcq[i] === oi}
                onChange={() => { const n = [...mcq]; n[i] = oi; setMcq(n); }} />{o}
            </label>
          ))}
        </div>
      </Card>
    ))}
    {paper.short.map((s: any, i: number) => (
      <Card key={`s${i}`} className="p-4">
        <div className="text-xs font-semibold text-muted-foreground">Short answer {i + 1}</div>
        <p className="mt-1 font-medium">{s.q}</p>
        <Textarea rows={3} className="mt-2" value={shortA[i]}
          onChange={(e) => { const n = [...shortA]; n[i] = e.target.value; setShortA(n); }} />
      </Card>
    ))}
    <Card className="p-4">
      <div className="text-xs font-semibold text-muted-foreground">Essay</div>
      <p className="mt-1 font-medium">{paper.essay.q}</p>
      <Textarea rows={8} className="mt-2" value={essay} onChange={(e) => setEssay(e.target.value)} />
    </Card>
    <div className="flex justify-end"><Button onClick={send} disabled={busy}>{busy ? "Submitting…" : "Submit exam"}</Button></div>
  </div>;
}

function ProjectPanel({ courseId }: { courseId: string }) {
  const gen = useServerFn(generateProjectBrief);
  const send = useServerFn(submitProject);
  const [sub, setSub] = useState<any>(null);
  const [content, setContent] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    (async () => {
      try { const r = await gen({ data: { courseId } }); setSub(r); }
      catch (e) { toast.error((e as Error).message); }
    })();
  }, [gen, courseId]);

  const submit = async () => {
    setBusy(true);
    try { const r = await send({ data: { submissionId: sub.id, content } }); setResult(r); }
    catch (e) { toast.error((e as Error).message); }
    finally { setBusy(false); }
  };

  if (!sub) return <Card className="p-6"><Loader2 className="mx-auto h-6 w-6 animate-spin" /></Card>;
  if (sub.status === "approved") return <Card className="p-6 text-center">
    <GraduationCap className="mx-auto mb-3 h-10 w-10 text-emerald-500" />
    <h2 className="text-lg font-bold">Approved — your certificate is being issued</h2>
    <p className="mt-2 text-sm text-muted-foreground">Check the Certificates tab in your dashboard.</p>
  </Card>;

  return <div className="space-y-4">
    <Card className="p-6">
      <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary">
        <FileText className="h-4 w-4" /> Your unique project brief
      </div>
      <div className="whitespace-pre-wrap text-sm">{sub.brief}</div>
    </Card>
    {result ? (
      <Card className="p-6">
        <div className="flex items-center gap-3">
          <Badge variant={result.verdict === "pass" ? "default" : "secondary"}>{result.verdict.toUpperCase()}</Badge>
          <span className="text-sm font-semibold">Score {Math.round(result.score)}/100</span>
        </div>
        <ul className="mt-4 list-disc space-y-1 pl-5 text-sm">
          {result.bullets.map((b: string, i: number) => <li key={i}>{b}</li>)}
        </ul>
        {result.verdict === "pass"
          ? <p className="mt-4 text-sm">Sent to the Academy Director for countersign. You'll be notified when the certificate is ready.</p>
          : <p className="mt-4 text-sm">Revise and resubmit above.</p>}
      </Card>
    ) : (
      <>
        <Textarea rows={10} placeholder="Paste your write-up or link to your deliverable…"
          value={content} onChange={(e) => setContent(e.target.value)} />
        <div className="flex justify-end"><Button onClick={submit} disabled={busy || content.length < 50}>
          {busy ? "Submitting…" : "Submit for AI review"}
        </Button></div>
      </>
    )}
  </div>;
}