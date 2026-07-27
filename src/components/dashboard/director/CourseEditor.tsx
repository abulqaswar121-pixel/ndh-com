import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Trash2, CheckCircle2, XCircle } from "lucide-react";
import { listCoursesForEditor, getCourseFull, saveCourse } from "@/lib/academy/schools.functions";

const REGIONS = ["NG", "US", "UK", "EU", "CA"] as const;

type Lesson = { id?: string; position: number; title: string; video_url?: string; notes?: string };
type QuizQ = { id?: string; position: number; question: string; options: string[]; correct_index: number };

export function CourseEditorPanel() {
  const list = useServerFn(listCoursesForEditor);
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["academy-editor-list"], queryFn: () => list() });
  const [openId, setOpenId] = useState<string | null>(null);

  const bySchool: Record<string, typeof data extends { courses: infer C } ? C : never> = {} as never;
  (data?.courses ?? []).forEach((c) => { (bySchool[c.school_id] ||= [] as never).push(c as never); });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-extrabold tracking-tight">AI Schools — Course Management</h2>
        <p className="text-sm text-muted-foreground">Fill in lessons, assignments, quizzes and capstone projects per course.</p>
      </div>
      {(data?.schools ?? []).map((s) => (
        <div key={s.id}>
          <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">{s.name}</div>
          <div className="grid gap-3 md:grid-cols-2">
            {(bySchool[s.id] ?? []).map((c) => (
              <Card key={c.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-bold">{c.name}</div>
                    <div className="mt-1 flex flex-wrap gap-1">
                      <Badge variant={c.has_lessons ? "default" : "secondary"}>Lessons {c.has_lessons ? <CheckCircle2 className="ml-1 h-3 w-3" /> : <XCircle className="ml-1 h-3 w-3" />}</Badge>
                      <Badge variant={c.has_quiz ? "default" : "secondary"}>Quiz</Badge>
                      <Badge variant={c.has_project ? "default" : "secondary"}>Project</Badge>
                      <Badge variant={c.is_published ? "default" : "outline"}>{c.is_published ? "Published" : "Draft"}</Badge>
                    </div>
                  </div>
                  <Button size="sm" onClick={() => setOpenId(c.id)}>Edit</Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ))}
      {openId && (
        <EditDialog
          courseId={openId}
          onClose={() => setOpenId(null)}
          onSaved={() => qc.invalidateQueries({ queryKey: ["academy-editor-list"] })}
        />
      )}
    </div>
  );
}

function EditDialog({ courseId, onClose, onSaved }: { courseId: string; onClose: () => void; onSaved: () => void }) {
  const load = useServerFn(getCourseFull);
  const save = useServerFn(saveCourse);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [published, setPublished] = useState(false);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [assignment, setAssignment] = useState("");
  const [quiz, setQuiz] = useState<QuizQ[]>([]);
  const [project, setProject] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await load({ data: { slug: "" } }).catch(() => null);
      // load by id via a slug-agnostic path: fetch through list & then fetch full via a small hack
      // simpler: refetch via direct id — reuse getCourseFull only accepts slug, so we need slug.
      void res;
      // Fetch by direct query using the id from the parent list — do it inline:
      const mod = await import("@/integrations/supabase/client");
      const { data: c } = await mod.supabase.from("academy_courses").select("*").eq("id", courseId).maybeSingle();
      if (!c) { setLoading(false); return; }
      setName(c.name); setDescription(c.description ?? "");
      setPrices((c.region_prices as Record<string, number>) ?? {});
      setPublished(c.is_published);
      const [{ data: ls }, { data: asg }, { data: qs }, { data: pr }] = await Promise.all([
        mod.supabase.from("academy_lessons").select("*").eq("course_id", courseId).order("position"),
        mod.supabase.from("academy_assignments").select("*").eq("course_id", courseId).maybeSingle(),
        mod.supabase.from("academy_quiz_questions").select("*").eq("course_id", courseId).order("position"),
        mod.supabase.from("academy_projects").select("*").eq("course_id", courseId).maybeSingle(),
      ]);
      setLessons((ls ?? []).map((l) => ({ id: l.id, position: l.position, title: l.title, video_url: l.video_url ?? "", notes: l.notes ?? "" })));
      setAssignment(asg?.instructions ?? "");
      setQuiz((qs ?? []).map((q) => ({ id: q.id, position: q.position, question: q.question, options: (q.options as string[]) ?? ["", "", "", ""], correct_index: q.correct_index })));
      setProject(pr?.brief ?? "");
      setLoading(false);
    })();
  }, [courseId, load]);

  const submit = async () => {
    setSaving(true);
    try {
      await save({ data: {
        course_id: courseId,
        name, description,
        region_prices: prices,
        is_published: published,
        lessons: lessons.map((l, i) => ({ ...l, position: i })),
        assignment,
        quiz: quiz.map((q, i) => ({ ...q, position: i })),
        project,
      }});
      toast.success("Course saved");
      onSaved();
      onClose();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[92vh] max-w-4xl overflow-y-auto">
        <DialogHeader><DialogTitle>Edit course</DialogTitle></DialogHeader>
        {loading ? (
          <div className="p-6 text-sm text-muted-foreground">Loading…</div>
        ) : (
          <div className="space-y-6">
            <div className="grid gap-3 md:grid-cols-2">
              <div><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
              <div className="flex items-end gap-2">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} /> Published
                </label>
              </div>
            </div>
            <div><Label>Description</Label><Textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} /></div>

            <div>
              <Label>Pricing per region</Label>
              <div className="mt-2 grid gap-2 md:grid-cols-5">
                {REGIONS.map((r) => (
                  <div key={r}>
                    <div className="text-xs text-muted-foreground">{r}</div>
                    <Input type="number" value={prices[r] ?? 0} onChange={(e) => setPrices({ ...prices, [r]: Number(e.target.value) })} />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <Label>Lessons</Label>
                <Button size="sm" variant="outline" onClick={() => setLessons([...lessons, { position: lessons.length, title: "" }])}><Plus className="mr-1 h-3 w-3" />Add</Button>
              </div>
              <div className="mt-2 space-y-2">
                {lessons.map((l, i) => (
                  <Card key={i} className="p-3">
                    <div className="grid gap-2 md:grid-cols-[1fr_1fr_auto]">
                      <Input placeholder="Lesson title" value={l.title} onChange={(e) => { const n = [...lessons]; n[i] = { ...l, title: e.target.value }; setLessons(n); }} />
                      <Input placeholder="Video URL" value={l.video_url ?? ""} onChange={(e) => { const n = [...lessons]; n[i] = { ...l, video_url: e.target.value }; setLessons(n); }} />
                      <Button size="icon" variant="ghost" onClick={() => setLessons(lessons.filter((_, x) => x !== i))}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                    <Textarea className="mt-2" rows={2} placeholder="Notes" value={l.notes ?? ""} onChange={(e) => { const n = [...lessons]; n[i] = { ...l, notes: e.target.value }; setLessons(n); }} />
                  </Card>
                ))}
              </div>
            </div>

            <div><Label>Assignment brief</Label><Textarea rows={4} value={assignment} onChange={(e) => setAssignment(e.target.value)} /></div>

            <div>
              <div className="flex items-center justify-between">
                <Label>Quiz questions</Label>
                <Button size="sm" variant="outline" onClick={() => setQuiz([...quiz, { position: quiz.length, question: "", options: ["", "", "", ""], correct_index: 0 }])}><Plus className="mr-1 h-3 w-3" />Add</Button>
              </div>
              <div className="mt-2 space-y-2">
                {quiz.map((q, i) => (
                  <Card key={i} className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <Input placeholder="Question" value={q.question} onChange={(e) => { const n = [...quiz]; n[i] = { ...q, question: e.target.value }; setQuiz(n); }} />
                      <Button size="icon" variant="ghost" onClick={() => setQuiz(quiz.filter((_, x) => x !== i))}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                    <div className="mt-2 grid gap-2 md:grid-cols-2">
                      {q.options.map((opt, oi) => (
                        <label key={oi} className="flex items-center gap-2">
                          <input type="radio" name={`q-${i}`} checked={q.correct_index === oi} onChange={() => { const n = [...quiz]; n[i] = { ...q, correct_index: oi }; setQuiz(n); }} />
                          <Input placeholder={`Option ${oi + 1}`} value={opt} onChange={(e) => { const n = [...quiz]; const opts = [...q.options]; opts[oi] = e.target.value; n[i] = { ...q, options: opts }; setQuiz(n); }} />
                        </label>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            <div><Label>Capstone project brief</Label><Textarea rows={4} value={project} onChange={(e) => setProject(e.target.value)} /></div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button variant="brand" onClick={submit} disabled={saving}>{saving ? "Saving…" : "Save course"}</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}