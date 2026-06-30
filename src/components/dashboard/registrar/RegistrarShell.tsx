import { useEffect, useState } from "react";
import { DashboardShell, type NavItem } from "@/components/dashboard/Sidebar";
import {
  LayoutDashboard, Inbox, CalendarDays, FileText, GraduationCap, Settings, Plus, Check, X, Trash2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useRouterState } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { useServerFn } from "@tanstack/react-start";
import {
  decideApplication, upsertExam, deleteExam, generateTranscript,
} from "@/lib/registrar/registrar.functions";
import { toast } from "sonner";

const NAV: NavItem[] = [
  { label: "Dashboard", to: "/dashboard/registrar", icon: LayoutDashboard },
  { label: "Admissions Queue", to: "/dashboard/registrar", search: { tab: "admissions" }, icon: Inbox },
  { label: "Exam Schedules", to: "/dashboard/registrar", search: { tab: "exams" }, icon: CalendarDays },
  { label: "Transcripts", to: "/dashboard/registrar", search: { tab: "transcripts" }, icon: FileText },
  { label: "Graduates", to: "/dashboard/registrar", search: { tab: "graduates" }, icon: GraduationCap },
  { label: "Settings", to: "/dashboard/registrar", search: { tab: "settings" }, icon: Settings },
];

export function RegistrarShell() {
  const search = useRouterState({ select: (r) => r.location.search as { tab?: string } });
  const tab = search.tab ?? "overview";
  return (
    <DashboardShell title="Registrar" items={NAV}>
      {tab === "overview" && <Overview />}
      {tab === "admissions" && <Admissions />}
      {tab === "exams" && <Exams />}
      {tab === "transcripts" && <Transcripts />}
      {tab === "graduates" && <Graduates />}
      {tab === "settings" && <Card className="p-6 text-sm text-muted-foreground">Manage from your profile.</Card>}
    </DashboardShell>
  );
}

function Overview() {
  const [s, setS] = useState({ pending: 0, accepted: 0, exams: 0, transcripts: 0, graduates: 0 });
  useEffect(() => {
    (async () => {
      const [p, a, e, t, g] = await Promise.all([
        supabase.from("admissions_applications").select("id", { count: "exact", head: true }).in("status", ["submitted", "under_review"]),
        supabase.from("admissions_applications").select("id", { count: "exact", head: true }).eq("status", "accepted"),
        supabase.from("exam_schedules").select("id", { count: "exact", head: true }).gte("starts_at", new Date().toISOString()),
        supabase.from("transcripts").select("id", { count: "exact", head: true }),
        supabase.from("enrollments").select("id", { count: "exact", head: true }).eq("status", "completed"),
      ]);
      setS({ pending: p.count ?? 0, accepted: a.count ?? 0, exams: e.count ?? 0, transcripts: t.count ?? 0, graduates: g.count ?? 0 });
    })();
  }, []);
  const cards = [
    { label: "Pending applications", value: s.pending },
    { label: "Accepted (intake)", value: s.accepted },
    { label: "Upcoming exams", value: s.exams },
    { label: "Transcripts issued", value: s.transcripts },
    { label: "Graduates", value: s.graduates },
  ];
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {cards.map((c) => (
        <Card key={c.label} className="p-5">
          <div className="text-xs uppercase tracking-widest text-muted-foreground">{c.label}</div>
          <div className="mt-2 text-3xl font-extrabold">{c.value}</div>
        </Card>
      ))}
    </div>
  );
}

type Application = {
  id: string; full_name: string; email: string; phone: string | null;
  country: string | null; intake: string | null; status: string;
  prior_education: string | null; decision_notes: string | null;
  course_id: string | null; created_at: string;
};

function Admissions() {
  const [rows, setRows] = useState<Application[]>([]);
  const [filter, setFilter] = useState<string>("submitted");
  const decide = useServerFn(decideApplication);
  const load = async () => {
    let q = supabase.from("admissions_applications").select("*").order("created_at", { ascending: false });
    if (filter !== "all") q = q.eq("status", filter);
    const { data } = await q;
    setRows((data as Application[]) || []);
  };
  useEffect(() => { load(); }, [filter]);

  const act = async (id: string, status: "accepted" | "rejected" | "under_review" | "waitlist") => {
    try {
      await decide({ data: { id, status } });
      toast.success(`Application ${status.replace("_", " ")}`);
      load();
    } catch (e: any) { toast.error(e.message); }
  };

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-lg font-bold">Admissions queue</h3>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="submitted">Submitted</SelectItem>
            <SelectItem value="under_review">Under review</SelectItem>
            <SelectItem value="accepted">Accepted</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="waitlist">Waitlist</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {rows.length === 0 ? (
        <div className="text-sm text-muted-foreground">No applications.</div>
      ) : (
        <div className="grid gap-3">
          {rows.map((r) => (
            <div key={r.id} className="rounded-lg border border-border p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="font-semibold">{r.full_name}</div>
                  <div className="text-xs text-muted-foreground">{r.email} · {r.phone || "—"} · {r.country || "—"}</div>
                  <div className="mt-1 text-xs text-muted-foreground">Intake: {r.intake || "—"} · Submitted {new Date(r.created_at).toLocaleDateString()}</div>
                  {r.prior_education && <div className="mt-2 text-sm">{r.prior_education}</div>}
                </div>
                <Badge variant="outline">{r.status}</Badge>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => act(r.id, "under_review")}>Mark under review</Button>
                <Button size="sm" onClick={() => act(r.id, "accepted")}><Check className="mr-1 h-4 w-4" /> Accept</Button>
                <Button size="sm" variant="outline" onClick={() => act(r.id, "waitlist")}>Waitlist</Button>
                <Button size="sm" variant="destructive" onClick={() => act(r.id, "rejected")}><X className="mr-1 h-4 w-4" /> Reject</Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

type Exam = { id: string; title: string; starts_at: string; duration_minutes: number; venue: string | null; mode: string; proctor: string | null; capacity: number | null; course_id: string | null };
type Course = { id: string; program_name: string };

function Exams() {
  const [rows, setRows] = useState<Exam[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Exam | null>(null);
  const upsert = useServerFn(upsertExam);
  const del = useServerFn(deleteExam);

  const load = async () => {
    const [{ data: r }, { data: c }] = await Promise.all([
      supabase.from("exam_schedules").select("*").order("starts_at", { ascending: true }),
      supabase.from("courses").select("id, program_name").order("program_name"),
    ]);
    setRows((r as Exam[]) || []);
    setCourses((c as Course[]) || []);
  };
  useEffect(() => { load(); }, []);

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold">Exam schedules</h3>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setEditing(null); }}>
          <DialogTrigger asChild><Button size="sm"><Plus className="mr-1 h-4 w-4" /> Schedule exam</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? "Edit exam" : "Schedule exam"}</DialogTitle></DialogHeader>
            <ExamForm
              courses={courses}
              initial={editing}
              onSubmit={async (v) => {
                try {
                  await upsert({ data: { ...v, id: editing?.id } });
                  toast.success("Exam saved");
                  setOpen(false); setEditing(null); load();
                } catch (e: any) { toast.error(e.message); }
              }}
            />
          </DialogContent>
        </Dialog>
      </div>
      {rows.length === 0 ? (
        <div className="text-sm text-muted-foreground">No exams scheduled.</div>
      ) : (
        <div className="grid gap-3">
          {rows.map((e) => (
            <div key={e.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-4">
              <div>
                <div className="font-semibold">{e.title}</div>
                <div className="text-xs text-muted-foreground">
                  {new Date(e.starts_at).toLocaleString()} · {e.duration_minutes} min · {e.mode}
                  {e.venue ? ` · ${e.venue}` : ""}{e.proctor ? ` · Proctor: ${e.proctor}` : ""}
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => { setEditing(e); setOpen(true); }}>Edit</Button>
                <Button size="sm" variant="destructive" onClick={async () => {
                  if (!confirm("Delete this exam?")) return;
                  try { await del({ data: { id: e.id } }); toast.success("Deleted"); load(); } catch (er: any) { toast.error(er.message); }
                }}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function ExamForm({ courses, initial, onSubmit }: {
  courses: Course[]; initial: Exam | null;
  onSubmit: (v: { course_id: string | null; title: string; starts_at: string; duration_minutes: number; venue?: string; mode: "online" | "in_person" | "hybrid"; proctor?: string; capacity?: number; notes?: string }) => Promise<void>;
}) {
  const [title, setTitle] = useState(initial?.title || "");
  const [courseId, setCourseId] = useState<string>(initial?.course_id || "");
  const [startsAt, setStartsAt] = useState(initial ? initial.starts_at.slice(0, 16) : "");
  const [duration, setDuration] = useState(initial?.duration_minutes ?? 90);
  const [venue, setVenue] = useState(initial?.venue || "");
  const [mode, setMode] = useState<"online" | "in_person" | "hybrid">((initial?.mode as any) || "online");
  const [proctor, setProctor] = useState(initial?.proctor || "");
  const [capacity, setCapacity] = useState<number | undefined>(initial?.capacity ?? undefined);
  const [busy, setBusy] = useState(false);

  return (
    <form
      className="grid gap-3"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        try {
          await onSubmit({
            course_id: courseId || null,
            title,
            starts_at: new Date(startsAt).toISOString(),
            duration_minutes: Number(duration),
            venue: venue || undefined,
            mode,
            proctor: proctor || undefined,
            capacity: capacity || undefined,
          });
        } finally { setBusy(false); }
      }}
    >
      <div><Label>Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} required /></div>
      <div>
        <Label>Course</Label>
        <Select value={courseId} onValueChange={setCourseId}>
          <SelectTrigger><SelectValue placeholder="(Optional)" /></SelectTrigger>
          <SelectContent>{courses.map((c) => <SelectItem key={c.id} value={c.id}>{c.program_name}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><Label>Starts at</Label><Input type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} required /></div>
        <div><Label>Duration (min)</Label><Input type="number" min={15} value={duration} onChange={(e) => setDuration(Number(e.target.value))} required /></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Mode</Label>
          <Select value={mode} onValueChange={(v) => setMode(v as any)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="online">Online</SelectItem>
              <SelectItem value="in_person">In person</SelectItem>
              <SelectItem value="hybrid">Hybrid</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div><Label>Capacity</Label><Input type="number" value={capacity ?? ""} onChange={(e) => setCapacity(e.target.value ? Number(e.target.value) : undefined)} /></div>
      </div>
      <div><Label>Venue / Link</Label><Input value={venue} onChange={(e) => setVenue(e.target.value)} /></div>
      <div><Label>Proctor</Label><Input value={proctor} onChange={(e) => setProctor(e.target.value)} /></div>
      <DialogFooter>
        <Button type="submit" disabled={busy}>{busy ? "Saving…" : "Save exam"}</Button>
      </DialogFooter>
    </form>
  );
}

type Transcript = { id: string; transcript_number: string; student_id: string; gpa: number | null; created_at: string };

function Transcripts() {
  const [rows, setRows] = useState<Transcript[]>([]);
  const [open, setOpen] = useState(false);
  const [studentId, setStudentId] = useState("");
  const [gpa, setGpa] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [names, setNames] = useState<Record<string, string>>({});
  const gen = useServerFn(generateTranscript);

  const load = async () => {
    const { data } = await supabase.from("transcripts").select("*").order("created_at", { ascending: false }).limit(200);
    const list = (data as Transcript[]) || [];
    setRows(list);
    const ids = Array.from(new Set(list.map((r) => r.student_id)));
    if (ids.length) {
      const { data: ps } = await supabase.from("profiles").select("id, full_name, email").in("id", ids);
      const map: Record<string, string> = {};
      (ps || []).forEach((p: any) => { map[p.id] = p.full_name || p.email; });
      setNames(map);
    }
  };
  useEffect(() => { load(); }, []);

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold">Transcripts</h3>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm"><Plus className="mr-1 h-4 w-4" /> Issue transcript</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Issue transcript</DialogTitle></DialogHeader>
            <form
              className="grid gap-3"
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  await gen({ data: { student_id: studentId, gpa: gpa ? Number(gpa) : undefined, notes: notes || undefined } });
                  toast.success("Transcript issued");
                  setOpen(false); setStudentId(""); setGpa(""); setNotes(""); load();
                } catch (er: any) { toast.error(er.message); }
              }}
            >
              <div><Label>Student user ID</Label><Input value={studentId} onChange={(e) => setStudentId(e.target.value)} required /></div>
              <div><Label>GPA (optional)</Label><Input type="number" step="0.01" min={0} max={5} value={gpa} onChange={(e) => setGpa(e.target.value)} /></div>
              <div><Label>Notes</Label><Textarea value={notes} onChange={(e) => setNotes(e.target.value)} /></div>
              <DialogFooter><Button type="submit">Issue</Button></DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      {rows.length === 0 ? (
        <div className="text-sm text-muted-foreground">No transcripts issued yet.</div>
      ) : (
        <div className="grid gap-2">
          {rows.map((t) => (
            <div key={t.id} className="flex items-center justify-between rounded-lg border border-border p-3">
              <div>
                <div className="font-semibold">{t.transcript_number}</div>
                <div className="text-xs text-muted-foreground">{names[t.student_id] || t.student_id} · GPA {t.gpa ?? "—"} · {new Date(t.created_at).toLocaleDateString()}</div>
              </div>
              <Badge variant="outline">Issued</Badge>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function Graduates() {
  const [rows, setRows] = useState<Array<{ id: string; student_id: string; course_id: string; name?: string; course?: string; completed_at?: string }>>([]);
  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("enrollments")
        .select("id, student_id, course_id, completed_at")
        .eq("status", "completed")
        .order("completed_at", { ascending: false })
        .limit(200);
      const list = (data as any[]) || [];
      const sids = Array.from(new Set(list.map((r) => r.student_id)));
      const cids = Array.from(new Set(list.map((r) => r.course_id)));
      const [ps, cs] = await Promise.all([
        sids.length ? supabase.from("profiles").select("id, full_name, email").in("id", sids) : Promise.resolve({ data: [] }),
        cids.length ? supabase.from("courses").select("id, program_name").in("id", cids) : Promise.resolve({ data: [] }),
      ]);
      const sMap: Record<string, string> = {};
      (ps.data as any[] || []).forEach((p) => { sMap[p.id] = p.full_name || p.email; });
      const cMap: Record<string, string> = {};
      (cs.data as any[] || []).forEach((c) => { cMap[c.id] = c.program_name; });
      setRows(list.map((r) => ({ ...r, name: sMap[r.student_id], course: cMap[r.course_id] })));
    })();
  }, []);
  return (
    <Card className="p-6">
      <h3 className="mb-4 text-lg font-bold">Graduates</h3>
      {rows.length === 0 ? (
        <div className="text-sm text-muted-foreground">No graduates yet.</div>
      ) : (
        <div className="grid gap-2">
          {rows.map((r) => (
            <div key={r.id} className="flex items-center justify-between rounded-lg border border-border p-3">
              <div>
                <div className="font-semibold">{r.name || r.student_id}</div>
                <div className="text-xs text-muted-foreground">{r.course} · Completed {r.completed_at ? new Date(r.completed_at).toLocaleDateString() : "—"}</div>
              </div>
              <Badge>Graduate</Badge>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}