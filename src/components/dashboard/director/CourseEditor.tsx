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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Plus, Trash2, CheckCircle2, XCircle, ArrowUp, ArrowDown, GripVertical, Lightbulb, Target } from "lucide-react";
import { listCoursesForEditor, saveCourse } from "@/lib/academy/schools.functions";

const REGIONS = ["NG", "US", "UK", "EU", "CA"] as const;
const REGION_LABELS: Record<string, string> = { NG: "Nigeria ₦", US: "US $", UK: "UK £", EU: "EU €", CA: "CA C$" };
const DEFAULT_PRICING: Record<string, { min: number; max: number; suggested: number }> = {
  NG: { min: 4900, max: 9900, suggested: 6900 },
  US: { min: 9, max: 19, suggested: 12 },
  UK: { min: 8, max: 16, suggested: 10 },
  EU: { min: 8, max: 16, suggested: 10 },
  CA: { min: 12, max: 22, suggested: 15 },
};

type Lesson = { id?: string; position: number; title: string; video_url?: string; notes?: string };
type QuizQ = { id?: string; position: number; question: string; options: string[]; correct_index: number };

export function CourseEditorPanel() {
  const list = useServerFn(listCoursesForEditor);
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["academy-editor-list"], queryFn: () => list() });
  const [openId, setOpenId] = useState<string | null>(null);

  type Course = NonNullable<typeof data>["courses"][number];
  const bySchool: Record<string, Course[]> = {};
  (data?.courses ?? []).forEach((c) => { (bySchool[c.school_id] ||= []).push(c); });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-extrabold tracking-tight">AI Schools — Course Management</h2>
        <p className="text-sm text-muted-foreground">Fill in lessons, learning objectives, project themes, quizzes and capstone projects per course. Pricing defaults: NG ₦4,900–9,900 · Africa $5–12 · Global $9–19</p>
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
  const save = useServerFn(saveCourse);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("general");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [published, setPublished] = useState(false);
  const [learningObjectives, setLearningObjectives] = useState<string[]>([""]);
  const [projectTheme, setProjectTheme] = useState("");
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [assignment, setAssignment] = useState("");
  const [quiz, setQuiz] = useState<QuizQ[]>([]);
  const [project, setProject] = useState("");
  const [saving, setSaving] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      const mod = await import("@/integrations/supabase/client");
      const { data: c } = await mod.supabase.from("academy_courses").select("*").eq("id", courseId).maybeSingle();
      if (!c) { setLoading(false); return; }
      setName(c.name); setDescription(c.description ?? "");
      setPrices((c.region_prices as Record<string, number>) ?? {});
      setPublished(c.is_published);
      setLearningObjectives((c.learning_objectives as string[])?.length ? (c.learning_objectives as string[]) : ["", "", "", ""]);
      setProjectTheme(c.project_theme ?? "");
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
  }, [courseId]);

  const moveLesson = (from: number, to: number) => {
    if (to < 0 || to >= lessons.length) return;
    const copy = [...lessons];
    const [moved] = copy.splice(from, 1);
    copy.splice(to, 0, moved);
    setLessons(copy);
  };

  const handleDragStart = (idx: number) => setDragIndex(idx);
  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === idx) return;
  };
  const handleDrop = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (dragIndex === null) return;
    moveLesson(dragIndex, idx);
    setDragIndex(null);
  };

  const submit = async () => {
    // Validate learning objectives
    const filteredLO = learningObjectives.map(s => s.trim()).filter(Boolean);
    if (filteredLO.length < 4) {
      toast.error("Add at least 4 learning objectives (feeds AI exam)");
      setActiveTab("objectives");
      return;
    }
    if (filteredLO.length > 8) {
      toast.error("Maximum 8 learning objectives");
      return;
    }
    if (!projectTheme.trim()) {
      toast.error("Project theme required (feeds AI brief)");
      setActiveTab("theme");
      return;
    }
    setSaving(true);
    try {
      await save({ data: {
        course_id: courseId,
        name, description,
        region_prices: prices,
        is_published: published,
        learning_objectives: filteredLO,
        project_theme: projectTheme,
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
      <DialogContent className="max-h-[92vh] max-w-5xl overflow-y-auto">
        <DialogHeader><DialogTitle>Edit course — {name}</DialogTitle></DialogHeader>
        {loading ? (
          <div className="p-6 text-sm text-muted-foreground">Loading…</div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="flex w-full flex-wrap justify-start">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="objectives">Objectives {learningObjectives.filter(Boolean).length >=4 ? "✓" : ""}</TabsTrigger>
              <TabsTrigger value="lessons">Lessons ({lessons.length})</TabsTrigger>
              <TabsTrigger value="theme">Project Theme</TabsTrigger>
              <TabsTrigger value="quiz">Quiz</TabsTrigger>
              <TabsTrigger value="capstone">Capstone</TabsTrigger>
              <TabsTrigger value="pricing">Pricing</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4 pt-4">
              <div className="grid gap-3 md:grid-cols-2">
                <div><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
                <div className="flex items-end gap-2">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} /> Published
                  </label>
                </div>
              </div>
              <div><Label>Description</Label><Textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Course overview..." /></div>
              <div><Label>Assignment brief (optional)</Label><Textarea rows={3} value={assignment} onChange={(e) => setAssignment(e.target.value)} placeholder="General assignment instructions..." /></div>
            </TabsContent>

            <TabsContent value="objectives" className="space-y-4 pt-4">
              <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-3">
                <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="text-sm">
                  <div className="font-semibold text-blue-900">Learning Objectives — feeds AI exam generation</div>
                  <div className="text-blue-700">Add 4–8 clear, measurable objectives. Example: "Build responsive landing pages with Tailwind CSS". These are used to generate AI exam questions.</div>
                </div>
              </div>
              <div className="space-y-2">
                {learningObjectives.map((obj, i) => (
                  <div key={i} className="flex gap-2">
                    <span className="mt-2 text-xs font-semibold text-muted-foreground">{i+1}.</span>
                    <Input value={obj} onChange={(e) => { const n=[...learningObjectives]; n[i]=e.target.value; setLearningObjectives(n); }} placeholder={`Objective ${i+1} — e.g., Understand AI prompt engineering fundamentals`} />
                    <Button size="icon" variant="ghost" onClick={() => setLearningObjectives(learningObjectives.filter((_, x) => x!==i))}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" disabled={learningObjectives.length>=8} onClick={() => setLearningObjectives([...learningObjectives, ""])}><Plus className="mr-1 h-3 w-3" />Add objective</Button>
                <span className="text-xs text-muted-foreground self-center">{learningObjectives.filter(Boolean).length}/8 (min 4)</span>
              </div>
            </TabsContent>

            <TabsContent value="lessons" className="space-y-4 pt-4">
              <div className="flex items-center justify-between">
                <Label>Lessons — drag to reorder</Label>
                <Button size="sm" variant="outline" onClick={() => setLessons([...lessons, { position: lessons.length, title: "" }])}><Plus className="mr-1 h-3 w-3" />Add Lesson</Button>
              </div>
              <div className="space-y-2">
                {lessons.map((l, i) => (
                  <Card
                    key={i}
                    draggable
                    onDragStart={() => handleDragStart(i)}
                    onDragOver={(e) => handleDragOver(e, i)}
                    onDrop={(e) => handleDrop(e, i)}
                    className={`p-3 ${dragIndex===i ? "opacity-50 ring-2 ring-primary" : ""}`}
                  >
                    <div className="flex items-start gap-2">
                      <div className="cursor-grab pt-2"><GripVertical className="h-4 w-4 text-muted-foreground" /></div>
                      <div className="flex-1 space-y-2">
                        <div className="grid gap-2 md:grid-cols-[1fr_1fr_auto_auto]">
                          <Input placeholder={`Lesson ${i+1} title`} value={l.title} onChange={(e) => { const n=[...lessons]; n[i]={...l, title:e.target.value}; setLessons(n); }} />
                          <Input placeholder="YouTube URL (e.g. https://youtu.be/...)" value={l.video_url ?? ""} onChange={(e) => { const n=[...lessons]; n[i]={...l, video_url:e.target.value}; setLessons(n); }} />
                          <div className="flex gap-1">
                            <Button size="icon" variant="ghost" disabled={i===0} onClick={() => moveLesson(i, i-1)}><ArrowUp className="h-4 w-4" /></Button>
                            <Button size="icon" variant="ghost" disabled={i===lessons.length-1} onClick={() => moveLesson(i, i+1)}><ArrowDown className="h-4 w-4" /></Button>
                          </div>
                          <Button size="icon" variant="ghost" onClick={() => setLessons(lessons.filter((_, x) => x!==i))}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                        <Textarea rows={2} placeholder="Notes / transcript / resources" value={l.notes ?? ""} onChange={(e) => { const n=[...lessons]; n[i]={...l, notes:e.target.value}; setLessons(n); }} />
                      </div>
                    </div>
                  </Card>
                ))}
                {lessons.length===0 && <div className="rounded border border-dashed p-8 text-center text-sm text-muted-foreground">No lessons yet. Add your first lesson.</div>}
              </div>
            </TabsContent>

            <TabsContent value="theme" className="space-y-4 pt-4">
              <div className="flex items-start gap-3 rounded-lg border border-purple-200 bg-purple-50 p-3">
                <Target className="h-5 w-5 text-purple-600 mt-0.5" />
                <div className="text-sm">
                  <div className="font-semibold text-purple-900">Project Theme — feeds AI brief generation</div>
                  <div className="text-purple-700">Describe the capstone domain. Example: "Design a SaaS landing page for a fintech startup targeting small businesses in Nigeria". AI uses this to generate unique project briefs per student.</div>
                </div>
              </div>
              <div><Label>Project Theme</Label><Textarea rows={5} value={projectTheme} onChange={(e) => setProjectTheme(e.target.value)} placeholder="E.g., Build a complete brand identity system for a sustainable fashion brand including logo, color palette, typography, and social templates. Should be doable in 2-3 days." /></div>
              <div><Label>Capstone Project Brief Template (fallback if AI fails)</Label><Textarea rows={6} value={project} onChange={(e) => setProject(e.target.value)} placeholder="Detailed brief that will be used as fallback. Include deliverables, evaluation criteria, timeline." /></div>
            </TabsContent>

            <TabsContent value="quiz" className="space-y-4 pt-4">
              <div className="flex items-center justify-between">
                <Label>Quiz Questions</Label>
                <Button size="sm" variant="outline" onClick={() => setQuiz([...quiz, { position: quiz.length, question: "", options: ["", "", "", ""], correct_index: 0 }])}><Plus className="mr-1 h-3 w-3" />Add Question</Button>
              </div>
              <div className="space-y-2">
                {quiz.map((q, i) => (
                  <Card key={i} className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <Input placeholder={`Question ${i+1}`} value={q.question} onChange={(e) => { const n=[...quiz]; n[i]={...q, question:e.target.value}; setQuiz(n); }} />
                      <Button size="icon" variant="ghost" onClick={() => setQuiz(quiz.filter((_, x) => x!==i))}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                    <div className="mt-2 grid gap-2 md:grid-cols-2">
                      {q.options.map((opt, oi) => (
                        <label key={oi} className="flex items-center gap-2">
                          <input type="radio" name={`q-${i}`} checked={q.correct_index===oi} onChange={() => { const n=[...quiz]; n[i]={...q, correct_index:oi}; setQuiz(n); }} />
                          <Input placeholder={`Option ${oi+1}`} value={opt} onChange={(e) => { const n=[...quiz]; const opts=[...q.options]; opts[oi]=e.target.value; n[i]={...q, options:opts}; setQuiz(n); }} />
                        </label>
                      ))}
                    </div>
                  </Card>
                ))}
                {quiz.length===0 && <div className="rounded border border-dashed p-6 text-center text-sm text-muted-foreground">No quiz yet. AI can also generate quiz from learning objectives if empty.</div>}
              </div>
            </TabsContent>

            <TabsContent value="capstone" className="space-y-4 pt-4">
              <div><Label>Capstone Brief (AI fallback)</Label><Textarea rows={8} value={project} onChange={(e) => setProject(e.target.value)} /></div>
              <div className="text-xs text-muted-foreground">This brief is used if AI generation fails. Otherwise AI generates unique brief per student using Project Theme + Learning Objectives.</div>
            </TabsContent>

            <TabsContent value="pricing" className="space-y-4 pt-4">
              <div className="rounded-lg border bg-secondary/30 p-3 text-sm">
                <div className="font-semibold">Pricing defaults (editable per course)</div>
                <div className="text-muted-foreground">Nigeria ₦4,900–9,900 · Africa $5–12 · Global $9–19. Set per region below; leave empty to use global default.</div>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                {REGIONS.map((r) => (
                  <Card key={r} className="p-4">
                    <div className="text-sm font-semibold">{REGION_LABELS[r]}</div>
                    <div className="mt-1 text-xs text-muted-foreground">Suggested: {DEFAULT_PRICING[r].suggested} (range {DEFAULT_PRICING[r].min}-{DEFAULT_PRICING[r].max})</div>
                    <Input type="number" className="mt-2" value={prices[r] ?? ""} placeholder={`${DEFAULT_PRICING[r].suggested}`} onChange={(e) => setPrices({ ...prices, [r]: Number(e.target.value) })} />
                  </Card>
                ))}
              </div>
            </TabsContent>

            <div className="flex justify-end gap-2 pt-6 border-t">
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button variant="brand" onClick={submit} disabled={saving}>{saving ? "Saving…" : "Save course"}</Button>
            </div>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
