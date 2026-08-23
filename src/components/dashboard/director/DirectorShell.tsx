import { useEffect, useState } from "react";
import { DashboardShell, type NavItem } from "@/components/dashboard/Sidebar";
import {
  LayoutDashboard, BookOpen, ClipboardCheck, BarChart3, Award, DollarSign, MessageSquare, Settings, GraduationCap
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useRouterState } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CourseEditorPanel } from "./CourseEditor";
import { useServerFn } from "@tanstack/react-start";
import {
  signCertificate, upsertCalendarEntry, deleteCalendarEntry, upsertTuitionPrice,
} from "@/lib/director/director.functions";
import { reviewProjectSubmission } from "@/lib/academy/ai.functions";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Final portal per handoff: Director → Courses · Progress · Certificates queue · Pricing + Project Reviews
const NAV: NavItem[] = [
  { label: "Dashboard", to: "/dashboard/academy-director", icon: LayoutDashboard },
  { label: "Courses", to: "/dashboard/academy-director", search: { tab: "ai-schools" }, icon: BookOpen },
  { label: "Project Reviews", to: "/dashboard/academy-director", search: { tab: "project-reviews" }, icon: ClipboardCheck },
  { label: "Progress", to: "/dashboard/academy-director", search: { tab: "progress" }, icon: BarChart3 },
  { label: "Certificates", to: "/dashboard/academy-director", search: { tab: "certs" }, icon: Award },
  { label: "Pricing", to: "/dashboard/academy-director", search: { tab: "tuition" }, icon: DollarSign },
  { label: "Messages", to: "/dashboard/academy-director", search: { tab: "messages" }, icon: MessageSquare },
  { label: "Settings", to: "/dashboard/academy-director", search: { tab: "settings" }, icon: Settings },
];

export function DirectorShell({ title = "Academy Director" }: { title?: string }) {
  const search = useRouterState({ select: (r) => r.location.search as { tab?: string } });
  const tab = search.tab ?? "overview";
  return (
    <DashboardShell title={title} items={NAV}>
      {tab === "overview" && <Overview />}
      {tab === "ai-schools" && <CourseEditorPanel />}
      {tab === "project-reviews" && <ProjectReviews />}
      {tab === "progress" && <ProgressTab />}
      {tab === "certs" && <CertApprovals />}
      {tab === "tuition" && <TuitionManager />}
      {tab === "messages" && <Card className="p-6 text-sm text-muted-foreground">Use platform inbox.</Card>}
      {tab === "settings" && <Card className="p-6 text-sm text-muted-foreground">Account settings — manage via your profile.</Card>}
      {/* Legacy tabs redirected but keep fallback for deep links */}
      {["departments","hods","instructors","students","courses","calendar","reports"].includes(tab) && <CourseEditorPanel />}
    </DashboardShell>
  );
}

function Overview() {
  const [stats, setStats] = useState({ courses: 0, students: 0, pendingReviews: 0, pendingCerts: 0 });
  useEffect(() => {
    (async () => {
      const [c, e, reviews, certs] = await Promise.all([
        supabase.from("academy_courses").select("id", { count: "exact", head: true }),
        supabase.from("enrollments").select("id", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("academy_project_submissions").select("id", { count: "exact", head: true }).eq("status", "submitted"),
        supabase.from("certificates").select("id", { count: "exact", head: true }).in("status", ["pending", "director_signed"]),
      ]);
      setStats({
        courses: c.count ?? 0,
        students: e.count ?? 0,
        pendingReviews: reviews.count ?? 0,
        pendingCerts: certs.count ?? 0,
      });
    })();
  }, []);
  const cards = [
    { label: "AI Courses", value: stats.courses },
    { label: "Active students", value: stats.students },
    { label: "Projects awaiting review", value: stats.pendingReviews },
    { label: "Certificates queue", value: stats.pendingCerts },
  ];
  return (
    <div>
      <div className="mb-4">
        <h1 className="text-2xl font-extrabold tracking-tight">Academy Director Overview</h1>
        <p className="text-sm text-muted-foreground">Courses · Progress · Project Reviews · Certificates · Pricing</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label} className="p-5">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">{c.label}</div>
            <div className="mt-2 text-3xl font-extrabold">{c.value}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ========== NEW: Project Reviews Tab (Handoff 5A) ==========
type ProjectRow = {
  id: string;
  user_id: string;
  course_id: string;
  brief: string;
  content: string | null;
  file_url: string | null;
  ai_score: number | null;
  ai_verdict: string | null;
  ai_feedback: any;
  status: string;
  director_note: string | null;
  created_at: string;
  profiles?: { full_name: string | null; email: string | null } | null;
  academy_courses?: { name: string; slug: string } | null;
};

function ProjectReviews() {
  const [rows, setRows] = useState<ProjectRow[]>([]);
  const [filter, setFilter] = useState<"submitted" | "all">("submitted");
  const [selected, setSelected] = useState<ProjectRow | null>(null);
  const [note, setNote] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const reviewFn = useServerFn(reviewProjectSubmission);

  const load = async () => {
    let q = supabase.from("academy_project_submissions")
      .select("id,user_id,course_id,brief,content,file_url,ai_score,ai_verdict,ai_feedback,status,director_note,created_at")
      .order("created_at", { ascending: false }).limit(100);
    if (filter === "submitted") q = q.eq("status", "submitted");
    const { data } = await q;
    const list = (data as any[]) || [];
    // Enrich with profile and course names
    if (list.length) {
      const userIds = [...new Set(list.map(r => r.user_id))];
      const courseIds = [...new Set(list.map(r => r.course_id))];
      const [{ data: profiles }, { data: courses }] = await Promise.all([
        supabase.from("profiles").select("id,full_name,email").in("id", userIds),
        supabase.from("academy_courses").select("id,name,slug").in("id", courseIds),
      ]);
      const pMap = new Map((profiles || []).map((p: any) => [p.id, p]));
      const cMap = new Map((courses || []).map((c: any) => [c.id, c]));
      setRows(list.map(r => ({ ...r, profiles: pMap.get(r.user_id), academy_courses: cMap.get(r.course_id) })) as any);
    } else setRows([]);
  };

  useEffect(() => { load(); }, [filter]);

  const act = async (row: ProjectRow, approve: boolean) => {
    setBusyId(row.id);
    try {
      await reviewFn({ data: { submissionId: row.id, approve, note: note || undefined } });
      toast.success(approve ? "Approved & certificate issued + emailed" : "Rejected & student notified to revise");
      setSelected(null); setNote(""); load();
    } catch (e: any) { toast.error(e.message); }
    finally { setBusyId(null); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Project Reviews — {filter === "submitted" ? "Awaiting" : "All"}</h2>
        <div className="flex gap-2">
          <Button size="sm" variant={filter==="submitted"?"default":"outline"} onClick={() => setFilter("submitted")}>Submitted</Button>
          <Button size="sm" variant={filter==="all"?"default":"outline"} onClick={() => setFilter("all")}>All</Button>
        </div>
      </div>
      <Card className="overflow-hidden">
        <div className="divide-y divide-border">
          {rows.map(r => (
            <div key={r.id} className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold">{r.academy_courses?.name || r.course_id.slice(0,8)}</span>
                    <Badge variant={r.status==="submitted"?"default": r.status==="approved"?"secondary" : "destructive"}>{r.status}</Badge>
                    {r.ai_score != null && <Badge variant="outline">AI {r.ai_score}/100 · {r.ai_verdict}</Badge>}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">{r.profiles?.full_name || r.profiles?.email || r.user_id.slice(0,8)} · {new Date(r.created_at).toLocaleString()}</div>
                  <div className="mt-2 text-sm line-clamp-3">{r.brief?.slice(0,200)}...</div>
                  {r.content && <div className="mt-2 rounded bg-secondary/40 p-2 text-sm whitespace-pre-wrap line-clamp-4">{r.content.slice(0,400)}</div>}
                  {r.ai_feedback && <div className="mt-2 text-xs text-muted-foreground">AI feedback: {Array.isArray((r.ai_feedback as any)?.bullets) ? (r.ai_feedback as any).bullets.join(" · ") : JSON.stringify(r.ai_feedback).slice(0,200)}</div>}
                  {r.file_url && <a href={r.file_url} target="_blank" rel="noreferrer" className="mt-2 inline-block text-xs text-primary underline">Open file/deliverable</a>}
                </div>
                <Button size="sm" onClick={() => { setSelected(r); setNote(r.director_note || ""); }}>Review</Button>
              </div>
            </div>
          ))}
          {!rows.length && <div className="p-10 text-center text-sm text-muted-foreground">No project submissions {filter==="submitted" ? "awaiting review" : ""}.</div>}
        </div>
      </Card>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Review — {selected?.academy_courses?.name}</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid gap-2 text-sm">
                <div><span className="font-semibold">Student:</span> {selected.profiles?.full_name} ({selected.profiles?.email})</div>
                <div><span className="font-semibold">Course:</span> {selected.academy_courses?.name}</div>
                <div><span className="font-semibold">AI Verdict:</span> {selected.ai_score ?? "—"}/100 — {selected.ai_verdict || "no verdict"}</div>
              </div>
              <div><Label>Brief</Label><div className="rounded border bg-secondary/20 p-3 text-sm whitespace-pre-wrap">{selected.brief}</div></div>
              <div><Label>Submission content</Label><div className="rounded border bg-card p-3 text-sm whitespace-pre-wrap">{selected.content || "(no content)"}</div></div>
              {selected.file_url && <div><a href={selected.file_url} target="_blank" className="text-sm text-primary underline">View attached file</a></div>}
              <div><Label>Director note (for reject, or approval note)</Label><Textarea rows={4} value={note} onChange={(e) => setNote(e.target.value)} placeholder="E.g., Great work, minor typo on page 2, but approved. OR: Please add mockups and improve contrast." /></div>
              <DialogFooter className="flex gap-2">
                <Button variant="outline" onClick={() => setSelected(null)}>Cancel</Button>
                <Button variant="destructive" disabled={busyId===selected.id} onClick={() => act(selected, false)}>{busyId===selected.id ? "Processing…" : "Reject & request revision"}</Button>
                <Button variant="brand" disabled={busyId===selected.id} onClick={() => act(selected, true)}>{busyId===selected.id ? "Processing…" : "Approve & issue certificate"}</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ========== NEW: Progress Tab (Handoff 5A) ==========
function ProgressTab() {
  const [courses, setCourses] = useState<{ id: string; name: string }[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    supabase.from("academy_courses").select("id,name").order("name").then(({ data }) => setCourses((data as any[]) || []));
  }, []);

  useEffect(() => {
    if (!selectedCourse) return;
    (async () => {
      // Fetch enrollments for this course
      const { data: enrolls } = await supabase.from("enrollments").select("id,student_id,progress,status,created_at").eq("course_id", selectedCourse).order("progress", { ascending: false }).limit(100);
      const list = (enrolls as any[]) || [];
      if (!list.length) { setRows([]); return; }
      const userIds = [...new Set(list.map(r => r.student_id))];
      const [{ data: profiles }, { data: lessonsCount }, { data: examAttempts }, { data: projects }, { data: certs }] = await Promise.all([
        supabase.from("profiles").select("id,full_name,email").in("id", userIds),
        supabase.from("academy_lessons").select("id", { count: "exact", head: true }).eq("course_id", selectedCourse),
        supabase.from("academy_exam_attempts").select("user_id,total_score,passed").eq("course_id", selectedCourse),
        supabase.from("academy_project_submissions").select("user_id,status,ai_score").eq("course_id", selectedCourse),
        supabase.from("certificates").select("student_id,status").eq("course_id", selectedCourse),
      ]);
      const pMap = new Map((profiles || []).map((p: any) => [p.id, p]));
      const examMap = new Map((examAttempts || []).map((e: any) => [e.user_id, e]));
      const projMap = new Map((projects || []).map((p: any) => [p.user_id, p]));
      const certMap = new Map((certs || []).map((c: any) => [c.student_id, c]));
      // Calculate watched % via academy_lesson_progress
      const { data: lessonIds } = await supabase.from("academy_lessons").select("id").eq("course_id", selectedCourse);
      const ids = (lessonIds || []).map((l: any) => l.id);
      let watchedMap = new Map<string, number>();
      if (ids.length) {
        const { data: watched } = await supabase.from("academy_lesson_progress").select("user_id,lesson_id").in("lesson_id", ids);
        const countByUser: Record<string, number> = {};
        (watched || []).forEach((w: any) => { countByUser[w.user_id] = (countByUser[w.user_id] || 0) + 1; });
        Object.entries(countByUser).forEach(([uid, cnt]) => watchedMap.set(uid, Math.round((cnt / ids.length) * 100)));
      }
      setRows(list.map(e => ({
        ...e,
        profile: pMap.get(e.student_id),
        watchedPct: watchedMap.get(e.student_id) ?? e.progress ?? 0,
        exam: examMap.get(e.student_id),
        project: projMap.get(e.student_id),
        cert: certMap.get(e.student_id),
      })));
    })();
  }, [selectedCourse]);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Student Progress per Course</h2>
      <div className="flex gap-2">
        <Select value={selectedCourse} onValueChange={setSelectedCourse}>
          <SelectTrigger className="w-64"><SelectValue placeholder="Select course" /></SelectTrigger>
          <SelectContent>{courses.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      {selectedCourse ? (
        <Card className="overflow-hidden">
          <div className="border-b p-3 text-sm font-semibold">Progress ({rows.length} students)</div>
          <div className="divide-y">
            {rows.map(r => (
              <div key={r.id} className="grid grid-cols-6 gap-2 p-3 text-xs items-center">
                <div className="col-span-2 truncate"><span className="font-semibold">{r.profile?.full_name || r.profile?.email || r.student_id.slice(0,8)}</span><div className="text-muted-foreground truncate">{r.profile?.email}</div></div>
                <div>Watched: {r.watchedPct}%</div>
                <div>Exam: {r.exam ? `${r.exam.total_score?.toFixed(0) ?? "—"}${r.exam.passed ? " ✓" : ""}` : "—"}</div>
                <div>Project: {r.project ? `${r.project.status}${r.project.ai_score ? ` (${r.project.ai_score})` : ""}` : "—"}</div>
                <div>Cert: {r.cert ? r.cert.status : "—"}</div>
              </div>
            ))}
            {!rows.length && <div className="p-6 text-sm text-muted-foreground">No enrollments for this course yet.</div>}
          </div>
        </Card>
      ) : <div className="text-sm text-muted-foreground">Select a course to view progress across lessons, exams, projects and certificates.</div>}
    </div>
  );
}

function CertApprovals() {
  const [rows, setRows] = useState<Array<{ id: string; certificate_number: string; status: string; student_id: string; course_id: string; director_signed_at: string | null; founder_signed_at: string | null }>>([]);
  const sign = useServerFn(signCertificate);
  const load = () =>
    supabase.from("certificates").select("id,certificate_number,status,student_id,course_id,director_signed_at,founder_signed_at")
      .in("status", ["pending", "director_signed"]).order("issue_date", { ascending: false })
      .then(({ data }) => setRows((data as never) || []));
  useEffect(() => { load(); }, []);
  async function act(id: string, as: "director" | "founder") {
    try { await sign({ data: { certificate_id: id, as } }); toast.success("Signed"); load(); }
    catch (e) { toast.error((e as Error).message); }
  }
  return (
    <Card className="overflow-hidden">
      <div className="border-b border-border p-4 text-sm font-semibold">Certificates awaiting signature ({rows.length})</div>
      <div className="divide-y divide-border">
        {rows.map((r) => (
          <div key={r.id} className="flex items-center justify-between p-4 text-sm">
            <div>
              <div className="font-mono">{r.certificate_number}</div>
              <div className="text-xs text-muted-foreground">
                Director: {r.director_signed_at ? "✓" : "—"} · Founder: {r.founder_signed_at ? "✓" : "—"}
              </div>
            </div>
            <div className="flex gap-2">
              {!r.director_signed_at && <Button size="sm" onClick={() => act(r.id, "director")}>Sign as Director</Button>}
              {r.director_signed_at && !r.founder_signed_at && (
                <Button size="sm" variant="default" onClick={() => act(r.id, "founder")}>Sign as Founder</Button>
              )}
            </div>
          </div>
        ))}
        {!rows.length && <div className="p-6 text-sm text-muted-foreground">Nothing pending.</div>}
      </div>
    </Card>
  );
}

function TuitionManager() {
  const [courses, setCourses] = useState<Array<{ id: string; name: string }>>([]);
  const [prices, setPrices] = useState<Array<{ id: string; course_id: string; region: string; currency: string; amount: number }>>([]);
  const [form, setForm] = useState({ course_id: "", region: "NG", currency: "NGN", amount: "" });
  const upsert = useServerFn(upsertTuitionPrice as any);
  const load = async () => {
    const [c, p] = await Promise.all([
      supabase.from("academy_courses").select("id,name").order("name"),
      supabase.from("academy_pricing").select("id,course_id,region,currency,amount").order("course_id"),
    ]);
    setCourses((c.data as any[]) || []);
    setPrices((p.data as any[]) || []);
  };
  useEffect(() => { load(); }, []);

  async function save() {
    if (!form.course_id || !form.amount) return toast.error("Course and amount required");
    try {
      // Try new academy_pricing table, fallback to tuition_prices
      const { supabase: sb } = await import("@/integrations/supabase/client.server").then(() => ({ supabase: null })).catch(() => ({ supabase: null }));
      // Use direct supabase insert for academy_pricing
      const { error } = await supabase.from("academy_pricing").upsert({
        course_id: form.course_id,
        region: form.region,
        currency: form.currency,
        amount: parseFloat(form.amount),
      } as any, { onConflict: "course_id,region" });
      if (error) throw error;
      toast.success("Saved"); setForm({ course_id: "", region: "NG", currency: "NGN", amount: "" }); load();
    } catch (e: any) {
      // Fallback to old tuition manager
      try {
        const { data } = await supabase.from("academy_pricing").select("*").limit(1);
        toast.error(e.message || "Save failed");
      } catch { toast.error((e as Error).message); }
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card className="p-4 lg:col-span-2">
        <div className="mb-3 text-sm font-semibold">Regional pricing (academy_pricing) — defaults: NG ₦4,900–9,900 · US $9–19</div>
        <div className="divide-y divide-border">
          {prices.map((p) => {
            const c = courses.find((x) => x.id === p.course_id);
            return (
              <div key={p.id} className="flex items-center justify-between py-3 text-sm">
                <div>
                  <div className="font-medium">{c?.name || p.course_id.slice(0, 8)}</div>
                  <div className="text-xs text-muted-foreground">{p.region} · {p.currency} {Number(p.amount).toLocaleString()}</div>
                </div>
                <Badge variant="secondary">{p.region}</Badge>
              </div>
            );
          })}
          {!prices.length && <div className="py-4 text-sm text-muted-foreground">No regional prices — using global defaults.</div>}
        </div>
      </Card>
      <Card className="p-4">
        <div className="mb-3 text-sm font-semibold">Add / update price</div>
        <div className="grid gap-3">
          <div>
            <Label>Course</Label>
            <Select value={form.course_id} onValueChange={(v) => setForm({ ...form, course_id: v })}>
              <SelectTrigger><SelectValue placeholder="Select course" /></SelectTrigger>
              <SelectContent>{courses.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div><Label>Region (NG/US/UK/EU/CA)</Label><Input value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value.toUpperCase() })} /></div>
            <div><Label>Currency</Label><Input value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value.toUpperCase() })} /></div>
          </div>
          <div><Label>Amount</Label><Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="6900" /></div>
          <Button onClick={save}>Save price</Button>
        </div>
      </Card>
    </div>
  );
}
