import { useEffect, useMemo, useState } from "react";
import { DashboardShell, type NavItem } from "@/components/dashboard/Sidebar";
import { LayoutDashboard, BookOpen, Layers, ClipboardList, Video, Users as UsersIcon, GraduationCap } from "lucide-react";
import { useRouterState, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  upsertModule, deleteModule, upsertLesson, deleteLesson,
  upsertAssignment, gradeSubmission, upsertLiveClass, deleteLiveClass,
  getInstructorCourses, getCourseRoster,
} from "@/lib/instructor/instructor.functions";

type Course = { id: string; program_name: string; slug: string | null; program_type: string; cover_image: string | null; is_published: boolean; students_count: number | null; curriculum_status: string; instructor_id: string | null };
type Module = { id: string; course_id: string; title: string; description: string | null; position: number };
type Lesson = { id: string; module_id: string; title: string; type: "video"|"pdf"|"text"; content_url: string | null; content_text: string | null; duration_minutes: number | null; position: number; is_preview: boolean };
type Assignment = { id: string; course_id: string; title: string; instructions: string | null; max_score: number; due_at: string | null };
type Submission = { id: string; assignment_id: string; student_id: string; content: string | null; files: any; score: number | null; feedback: string | null; status: string; submitted_at: string };
type LiveClass = { id: string; course_id: string; title: string; description: string | null; meeting_url: string | null; starts_at: string; duration_minutes: number; recording_url: string | null };
type RosterRow = { student_id: string; full_name: string | null; email: string | null; progress: number; enrolled_at: string; status: string };

const NAV: NavItem[] = [
  { label: "Dashboard", to: "/dashboard/instructor", icon: LayoutDashboard },
  { label: "My Courses", to: "/dashboard/instructor", search: { tab: "courses" }, icon: BookOpen },
  { label: "Course Builder", to: "/dashboard/instructor", search: { tab: "builder" }, icon: Layers },
  { label: "Assignments", to: "/dashboard/instructor", search: { tab: "assignments" }, icon: ClipboardList },
  { label: "Live Classes", to: "/dashboard/instructor", search: { tab: "live" }, icon: Video },
  { label: "Students", to: "/dashboard/instructor", search: { tab: "students" }, icon: UsersIcon },
];

export function InstructorShell() {
  const search = useRouterState({ select: (r) => r.location.search as { tab?: string; course?: string } });
  const navigate = useNavigate();
  const tab = search.tab ?? "overview";
  const getCourses = useServerFn(getInstructorCourses);
  const [courses, setCourses] = useState<Course[]>([]);
  const [activeCourseId, setActiveCourseId] = useState<string | null>(search.course ?? null);

  useEffect(() => {
    (getCourses as any)().then((rows: Course[]) => {
      setCourses(rows);
      if (!activeCourseId && rows[0]) setActiveCourseId(rows[0].id);
    }).catch((e: any) => toast.error(e.message ?? "Failed to load courses"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeCourse = courses.find((c) => c.id === activeCourseId) ?? null;

  return (
    <DashboardShell title="Instructor Portal" items={NAV}>
      {courses.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-6">
          <CoursePicker
            courses={courses}
            value={activeCourseId}
            onChange={(id) => { setActiveCourseId(id); navigate({ to: "/dashboard/instructor", search: { tab, course: id } as any }); }}
          />
          {tab === "overview" && <Overview course={activeCourse} />}
          {tab === "courses" && <MyCourses courses={courses} />}
          {tab === "builder" && activeCourse && <Builder course={activeCourse} />}
          {tab === "assignments" && activeCourse && <Assignments course={activeCourse} />}
          {tab === "live" && activeCourse && <Live course={activeCourse} />}
          {tab === "students" && activeCourse && <Roster course={activeCourse} />}
        </div>
      )}
    </DashboardShell>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-border bg-card p-10 text-center shadow-elegant">
      <GraduationCap className="mx-auto h-12 w-12 text-muted-foreground" />
      <h2 className="mt-4 text-2xl font-extrabold">No courses assigned yet</h2>
      <p className="mt-2 text-sm text-muted-foreground">An academy director or HOD must assign you to a course before you can begin teaching. Please contact your department head.</p>
    </div>
  );
}

function CoursePicker({ courses, value, onChange }: { courses: Course[]; value: string | null; onChange: (id: string) => void }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Course:</span>
      <Select value={value ?? undefined} onValueChange={onChange}>
        <SelectTrigger className="w-72"><SelectValue placeholder="Select a course" /></SelectTrigger>
        <SelectContent>
          {courses.map((c) => <SelectItem key={c.id} value={c.id}>{c.program_name}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}

function Overview({ course }: { course: Course | null }) {
  const [stats, setStats] = useState({ modules: 0, lessons: 0, assignments: 0, pending: 0, students: 0, live: 0 });
  useEffect(() => {
    if (!course) return;
    (async () => {
      const [m, a, l, s] = await Promise.all([
        supabase.from("modules").select("id", { count: "exact", head: true }).eq("course_id", course.id),
        supabase.from("assignments").select("id", { count: "exact", head: true }).eq("course_id", course.id),
        supabase.from("live_classes").select("id", { count: "exact", head: true }).eq("course_id", course.id),
        supabase.from("enrollments").select("id", { count: "exact", head: true }).eq("course_id", course.id).eq("status", "active"),
      ]);
      const { data: mods } = await supabase.from("modules").select("id").eq("course_id", course.id);
      const modIds = (mods ?? []).map((x) => x.id);
      const { count: lessonsCount } = modIds.length ? await supabase.from("lessons").select("id", { count: "exact", head: true }).in("module_id", modIds) : { count: 0 } as any;
      const { data: assigns } = await supabase.from("assignments").select("id").eq("course_id", course.id);
      const aIds = (assigns ?? []).map((x) => x.id);
      const { count: pending } = aIds.length ? await supabase.from("assignment_submissions").select("id", { count: "exact", head: true }).in("assignment_id", aIds).eq("status", "submitted") : { count: 0 } as any;
      setStats({ modules: m.count ?? 0, lessons: lessonsCount ?? 0, assignments: a.count ?? 0, pending: pending ?? 0, students: s.count ?? 0, live: l.count ?? 0 });
    })();
  }, [course]);
  if (!course) return null;
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Kpi label="Active students" value={stats.students} />
      <Kpi label="Modules" value={stats.modules} />
      <Kpi label="Lessons" value={stats.lessons} />
      <Kpi label="Assignments" value={stats.assignments} />
      <Kpi label="Pending grading" value={stats.pending} accent />
      <Kpi label="Live classes" value={stats.live} />
    </div>
  );
}

function Kpi({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className={`rounded-xl border border-border bg-card p-5 shadow-elegant ${accent && value > 0 ? "ring-2 ring-[oklch(0.65_0.19_252)]" : ""}`}>
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-2 text-3xl font-extrabold">{value}</div>
    </div>
  );
}

function MyCourses({ courses }: { courses: Course[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {courses.map((c) => (
        <div key={c.id} className="overflow-hidden rounded-2xl border border-border bg-card shadow-elegant">
          {c.cover_image && <img src={c.cover_image} alt={c.program_name} className="h-32 w-full object-cover" loading="lazy" />}
          <div className="p-4">
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="text-[10px] uppercase">{c.program_type}</Badge>
              <Badge variant={c.is_published ? "default" : "outline"}>{c.is_published ? "Published" : "Draft"}</Badge>
            </div>
            <h3 className="mt-3 font-bold">{c.program_name}</h3>
            <p className="mt-1 text-xs text-muted-foreground">Curriculum: {c.curriculum_status} · {c.students_count ?? 0} enrolled</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------- BUILDER ----------
function Builder({ course }: { course: Course }) {
  const [modules, setModules] = useState<Module[]>([]);
  const [lessonsByModule, setLessonsByModule] = useState<Record<string, Lesson[]>>({});
  const [editingModule, setEditingModule] = useState<Partial<Module> | null>(null);
  const [editingLesson, setEditingLesson] = useState<Partial<Lesson> & { module_id: string } | null>(null);
  const upM = useServerFn(upsertModule); const delM = useServerFn(deleteModule);
  const upL = useServerFn(upsertLesson); const delL = useServerFn(deleteLesson);

  const load = async () => {
    const { data: mods } = await supabase.from("modules").select("*").eq("course_id", course.id).order("position");
    setModules((mods ?? []) as Module[]);
    if (mods && mods.length) {
      const { data: lessons } = await supabase.from("lessons").select("*").in("module_id", mods.map((m) => m.id)).order("position");
      const grouped: Record<string, Lesson[]> = {};
      (lessons ?? []).forEach((l: any) => { (grouped[l.module_id] ??= []).push(l); });
      setLessonsByModule(grouped);
    } else setLessonsByModule({});
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [course.id]);

  const saveModule = async () => {
    if (!editingModule?.title) return;
    try {
      await (upM as any)({ data: { id: editingModule.id, course_id: course.id, title: editingModule.title, description: editingModule.description, position: editingModule.position ?? modules.length } });
      toast.success("Module saved"); setEditingModule(null); load();
    } catch (e: any) { toast.error(e.message); }
  };
  const removeModule = async (id: string) => {
    if (!confirm("Delete this module and all its lessons?")) return;
    try { await (delM as any)({ data: { id, course_id: course.id } }); toast.success("Deleted"); load(); }
    catch (e: any) { toast.error(e.message); }
  };
  const saveLesson = async () => {
    if (!editingLesson?.title || !editingLesson.type) return;
    try {
      const list = lessonsByModule[editingLesson.module_id] ?? [];
      await (upL as any)({ data: {
        id: editingLesson.id, course_id: course.id, module_id: editingLesson.module_id,
        title: editingLesson.title, description: (editingLesson as any).description,
        type: editingLesson.type, content_url: editingLesson.content_url || null,
        content_text: editingLesson.content_text || null,
        duration_minutes: editingLesson.duration_minutes ? Number(editingLesson.duration_minutes) : undefined,
        position: editingLesson.position ?? list.length, is_preview: !!editingLesson.is_preview,
      } });
      toast.success("Lesson saved"); setEditingLesson(null); load();
    } catch (e: any) { toast.error(e.message); }
  };
  const removeLesson = async (id: string) => {
    if (!confirm("Delete this lesson?")) return;
    try { await (delL as any)({ data: { id, course_id: course.id } }); toast.success("Deleted"); load(); }
    catch (e: any) { toast.error(e.message); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Curriculum</h2>
        <Button variant="brand" onClick={() => setEditingModule({ position: modules.length })}>+ Add Module</Button>
      </div>
      {modules.length === 0 && <p className="text-sm text-muted-foreground">No modules yet. Start by adding your first module.</p>}
      {modules.map((m) => (
        <div key={m.id} className="rounded-xl border border-border bg-card p-5 shadow-elegant">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-bold">{m.position + 1}. {m.title}</h3>
              {m.description && <p className="mt-1 text-sm text-muted-foreground">{m.description}</p>}
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setEditingModule(m)}>Edit</Button>
              <Button size="sm" variant="ghost" onClick={() => removeModule(m.id)}>Delete</Button>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {(lessonsByModule[m.id] ?? []).map((l) => (
              <div key={l.id} className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 p-3">
                <div className="text-sm">
                  <span className="font-semibold">{l.position + 1}.</span> {l.title}{" "}
                  <Badge variant="outline" className="ml-2 text-[10px] uppercase">{l.type}</Badge>
                  {l.is_preview && <Badge variant="secondary" className="ml-1 text-[10px]">Preview</Badge>}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={() => setEditingLesson(l)}>Edit</Button>
                  <Button size="sm" variant="ghost" onClick={() => removeLesson(l.id)}>Delete</Button>
                </div>
              </div>
            ))}
            <Button size="sm" variant="outline" onClick={() => setEditingLesson({ module_id: m.id, type: "video", position: (lessonsByModule[m.id] ?? []).length })}>+ Add Lesson</Button>
          </div>
        </div>
      ))}

      <Dialog open={!!editingModule} onOpenChange={(o) => !o && setEditingModule(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingModule?.id ? "Edit module" : "New module"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Title</Label><Input value={editingModule?.title ?? ""} onChange={(e) => setEditingModule({ ...editingModule, title: e.target.value })} /></div>
            <div><Label>Description</Label><Textarea value={editingModule?.description ?? ""} onChange={(e) => setEditingModule({ ...editingModule, description: e.target.value })} /></div>
            <div><Label>Position</Label><Input type="number" value={editingModule?.position ?? 0} onChange={(e) => setEditingModule({ ...editingModule, position: Number(e.target.value) })} /></div>
          </div>
          <DialogFooter><Button variant="brand" onClick={saveModule}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingLesson} onOpenChange={(o) => !o && setEditingLesson(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{editingLesson?.id ? "Edit lesson" : "New lesson"}</DialogTitle></DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2"><Label>Title</Label><Input value={editingLesson?.title ?? ""} onChange={(e) => setEditingLesson({ ...editingLesson!, title: e.target.value })} /></div>
            <div>
              <Label>Type</Label>
              <Select value={editingLesson?.type ?? "video"} onValueChange={(v) => setEditingLesson({ ...editingLesson!, type: v as any })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="text">Text</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Duration (min)</Label><Input type="number" value={editingLesson?.duration_minutes ?? ""} onChange={(e) => setEditingLesson({ ...editingLesson!, duration_minutes: Number(e.target.value) })} /></div>
            {editingLesson?.type !== "text" && (
              <div className="sm:col-span-2"><Label>Content URL (video/PDF)</Label><Input value={editingLesson?.content_url ?? ""} onChange={(e) => setEditingLesson({ ...editingLesson!, content_url: e.target.value })} placeholder="https://..." /></div>
            )}
            {editingLesson?.type === "text" && (
              <div className="sm:col-span-2"><Label>Lesson text</Label><Textarea rows={8} value={editingLesson?.content_text ?? ""} onChange={(e) => setEditingLesson({ ...editingLesson!, content_text: e.target.value })} /></div>
            )}
            <div className="sm:col-span-2 flex items-center gap-2">
              <input id="preview" type="checkbox" checked={!!editingLesson?.is_preview} onChange={(e) => setEditingLesson({ ...editingLesson!, is_preview: e.target.checked })} />
              <Label htmlFor="preview">Free preview (visible without enrollment)</Label>
            </div>
          </div>
          <DialogFooter><Button variant="brand" onClick={saveLesson}>Save lesson</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ---------- ASSIGNMENTS ----------
function Assignments({ course }: { course: Course }) {
  const [items, setItems] = useState<Assignment[]>([]);
  const [editing, setEditing] = useState<Partial<Assignment> | null>(null);
  const [grading, setGrading] = useState<Assignment | null>(null);
  const up = useServerFn(upsertAssignment);

  const load = async () => {
    const { data } = await supabase.from("assignments").select("*").eq("course_id", course.id).order("created_at", { ascending: false });
    setItems((data ?? []) as Assignment[]);
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [course.id]);

  const save = async () => {
    if (!editing?.title) return;
    try {
      await (up as any)({ data: {
        id: editing.id, course_id: course.id, title: editing.title,
        instructions: editing.instructions ?? undefined,
        max_score: editing.max_score ?? 100,
        due_at: editing.due_at ? new Date(editing.due_at).toISOString() : undefined,
      } });
      toast.success("Assignment saved"); setEditing(null); load();
    } catch (e: any) { toast.error(e.message); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Assignments</h2>
        <Button variant="brand" onClick={() => setEditing({ max_score: 100 })}>+ New Assignment</Button>
      </div>
      {items.length === 0 && <p className="text-sm text-muted-foreground">No assignments yet.</p>}
      <div className="grid gap-3">
        {items.map((a) => (
          <div key={a.id} className="rounded-xl border border-border bg-card p-5 shadow-elegant">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-bold">{a.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">Max score: {a.max_score} · Due: {a.due_at ? new Date(a.due_at).toLocaleString() : "No deadline"}</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setGrading(a)}>Review submissions</Button>
                <Button size="sm" variant="ghost" onClick={() => setEditing(a)}>Edit</Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing?.id ? "Edit assignment" : "New assignment"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Title</Label><Input value={editing?.title ?? ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} /></div>
            <div><Label>Instructions</Label><Textarea rows={5} value={editing?.instructions ?? ""} onChange={(e) => setEditing({ ...editing, instructions: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Max score</Label><Input type="number" value={editing?.max_score ?? 100} onChange={(e) => setEditing({ ...editing, max_score: Number(e.target.value) })} /></div>
              <div><Label>Due date</Label><Input type="datetime-local" value={editing?.due_at ? new Date(editing.due_at).toISOString().slice(0, 16) : ""} onChange={(e) => setEditing({ ...editing, due_at: e.target.value })} /></div>
            </div>
          </div>
          <DialogFooter><Button variant="brand" onClick={save}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {grading && <GradingDialog assignment={grading} onClose={() => setGrading(null)} />}
    </div>
  );
}

function GradingDialog({ assignment, onClose }: { assignment: Assignment; onClose: () => void }) {
  const [subs, setSubs] = useState<(Submission & { student_name?: string })[]>([]);
  const [active, setActive] = useState<Submission | null>(null);
  const [score, setScore] = useState<number>(0);
  const [feedback, setFeedback] = useState("");
  const grade = useServerFn(gradeSubmission);
  const load = async () => {
    const { data } = await supabase.from("assignment_submissions").select("*").eq("assignment_id", assignment.id).order("submitted_at", { ascending: false });
    const list = (data ?? []) as Submission[];
    if (list.length) {
      const { data: ps } = await supabase.from("profiles").select("id, full_name").in("id", list.map((s) => s.student_id));
      const nameMap: Record<string, string> = {};
      (ps ?? []).forEach((p: any) => (nameMap[p.id] = p.full_name));
      setSubs(list.map((s) => ({ ...s, student_name: nameMap[s.student_id] ?? "Student" })));
    } else setSubs([]);
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [assignment.id]);
  const save = async () => {
    if (!active) return;
    try { await (grade as any)({ data: { submission_id: active.id, score, feedback } }); toast.success("Graded"); setActive(null); load(); }
    catch (e: any) { toast.error(e.message); }
  };
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader><DialogTitle>Submissions — {assignment.title}</DialogTitle></DialogHeader>
        {active ? (
          <div className="space-y-3">
            <div className="rounded-lg border border-border bg-secondary/30 p-3 text-sm">
              <div className="font-semibold">{(active as any).student_name}</div>
              <p className="mt-2 whitespace-pre-wrap">{active.content || "—"}</p>
              {Array.isArray(active.files) && active.files.length > 0 && (
                <ul className="mt-2 list-disc pl-5">{active.files.map((f: any, i: number) => <li key={i}><a className="text-[oklch(0.65_0.19_252)] underline" href={f.url} target="_blank" rel="noreferrer">{f.name ?? f.url}</a></li>)}</ul>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Score (max {assignment.max_score})</Label><Input type="number" max={assignment.max_score} value={score} onChange={(e) => setScore(Number(e.target.value))} /></div>
            </div>
            <div><Label>Feedback</Label><Textarea rows={4} value={feedback} onChange={(e) => setFeedback(e.target.value)} /></div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setActive(null)}>Back</Button>
              <Button variant="brand" onClick={save}>Save grade</Button>
            </DialogFooter>
          </div>
        ) : subs.length === 0 ? (
          <p className="text-sm text-muted-foreground">No submissions yet.</p>
        ) : (
          <div className="space-y-2">
            {subs.map((s) => (
              <div key={s.id} className="flex items-center justify-between rounded-lg border border-border bg-card p-3">
                <div>
                  <div className="text-sm font-semibold">{s.student_name}</div>
                  <div className="text-xs text-muted-foreground">Submitted {new Date(s.submitted_at).toLocaleString()} · {s.status}{s.score != null ? ` · ${s.score}/${assignment.max_score}` : ""}</div>
                </div>
                <Button size="sm" variant="outline" onClick={() => { setActive(s); setScore(s.score ?? 0); setFeedback(s.feedback ?? ""); }}>
                  {s.status === "graded" ? "Re-grade" : "Grade"}
                </Button>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ---------- LIVE CLASSES ----------
function Live({ course }: { course: Course }) {
  const [items, setItems] = useState<LiveClass[]>([]);
  const [editing, setEditing] = useState<Partial<LiveClass> | null>(null);
  const up = useServerFn(upsertLiveClass); const del = useServerFn(deleteLiveClass);
  const load = async () => {
    const { data } = await supabase.from("live_classes").select("*").eq("course_id", course.id).order("starts_at", { ascending: false });
    setItems((data ?? []) as LiveClass[]);
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [course.id]);
  const save = async () => {
    if (!editing?.title || !editing.starts_at) return;
    try {
      await (up as any)({ data: {
        id: editing.id, course_id: course.id, title: editing.title, description: editing.description ?? undefined,
        meeting_url: editing.meeting_url || null, starts_at: new Date(editing.starts_at).toISOString(),
        duration_minutes: editing.duration_minutes ?? 60, recording_url: editing.recording_url || null,
      } });
      toast.success("Saved"); setEditing(null); load();
    } catch (e: any) { toast.error(e.message); }
  };
  const remove = async (id: string) => {
    if (!confirm("Delete this class?")) return;
    try { await (del as any)({ data: { id, course_id: course.id } }); toast.success("Deleted"); load(); }
    catch (e: any) { toast.error(e.message); }
  };
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Live Classes</h2>
        <Button variant="brand" onClick={() => setEditing({ duration_minutes: 60 })}>+ Schedule Class</Button>
      </div>
      {items.length === 0 && <p className="text-sm text-muted-foreground">No live classes scheduled.</p>}
      <div className="grid gap-3">
        {items.map((c) => (
          <div key={c.id} className="rounded-xl border border-border bg-card p-5 shadow-elegant">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-bold">{c.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{new Date(c.starts_at).toLocaleString()} · {c.duration_minutes} min</p>
                {c.meeting_url && <a href={c.meeting_url} target="_blank" rel="noreferrer" className="mt-1 inline-block text-xs text-[oklch(0.65_0.19_252)] underline">Join link</a>}
                {c.recording_url && <a href={c.recording_url} target="_blank" rel="noreferrer" className="mt-1 ml-3 inline-block text-xs text-[oklch(0.65_0.19_252)] underline">Recording</a>}
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setEditing(c)}>Edit</Button>
                <Button size="sm" variant="ghost" onClick={() => remove(c.id)}>Delete</Button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing?.id ? "Edit class" : "Schedule class"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Title</Label><Input value={editing?.title ?? ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} /></div>
            <div><Label>Description</Label><Textarea value={editing?.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Starts at</Label><Input type="datetime-local" value={editing?.starts_at ? new Date(editing.starts_at).toISOString().slice(0, 16) : ""} onChange={(e) => setEditing({ ...editing, starts_at: e.target.value })} /></div>
              <div><Label>Duration (min)</Label><Input type="number" value={editing?.duration_minutes ?? 60} onChange={(e) => setEditing({ ...editing, duration_minutes: Number(e.target.value) })} /></div>
            </div>
            <div><Label>Meeting URL (Zoom/Meet)</Label><Input value={editing?.meeting_url ?? ""} onChange={(e) => setEditing({ ...editing, meeting_url: e.target.value })} placeholder="https://zoom.us/..." /></div>
            <div><Label>Recording URL (after class)</Label><Input value={editing?.recording_url ?? ""} onChange={(e) => setEditing({ ...editing, recording_url: e.target.value })} /></div>
          </div>
          <DialogFooter><Button variant="brand" onClick={save}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ---------- ROSTER ----------
function Roster({ course }: { course: Course }) {
  const [rows, setRows] = useState<RosterRow[]>([]);
  const getRoster = useServerFn(getCourseRoster);
  useEffect(() => {
    (getRoster as any)({ data: { course_id: course.id } }).then((d: RosterRow[]) => setRows(d))
      .catch((e: any) => toast.error(e.message));
  }, [course.id, getRoster]);
  return (
    <div className="rounded-xl border border-border bg-card shadow-elegant">
      <div className="border-b border-border p-4"><h2 className="text-lg font-bold">Students enrolled — {rows.length}</h2></div>
      {rows.length === 0 ? <p className="p-5 text-sm text-muted-foreground">No students enrolled yet.</p> : (
        <table className="w-full text-sm">
          <thead className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr><th className="p-3">Student</th><th className="p-3">Email</th><th className="p-3">Progress</th><th className="p-3">Status</th><th className="p-3">Enrolled</th></tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.student_id} className="border-b border-border last:border-0">
                <td className="p-3 font-semibold">{r.full_name ?? "—"}</td>
                <td className="p-3 text-muted-foreground">{r.email ?? "—"}</td>
                <td className="p-3">{r.progress}%</td>
                <td className="p-3"><Badge variant={r.status === "active" ? "default" : "outline"}>{r.status}</Badge></td>
                <td className="p-3 text-muted-foreground">{new Date(r.enrolled_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}