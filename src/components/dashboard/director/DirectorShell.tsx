import { useEffect, useState } from "react";
import { DashboardShell, type NavItem } from "@/components/dashboard/Sidebar";
import {
  LayoutDashboard, Building2, Users, GraduationCap, BookOpen, CalendarDays,
  Award, DollarSign, BarChart3, MessageSquare, Settings, UserCog, ClipboardSignature,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useRouterState } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { InviteHodDialog } from "./InviteHodDialog";
import { CourseEditorPanel } from "./CourseEditor";
import { useServerFn } from "@tanstack/react-start";
import {
  signCertificate, upsertCalendarEntry, deleteCalendarEntry, upsertTuitionPrice,
} from "@/lib/director/director.functions";
import { toast } from "sonner";

const NAV: NavItem[] = [
  { label: "Dashboard", to: "/dashboard/academy-director", icon: LayoutDashboard },
  { label: "All Departments", to: "/dashboard/academy-director", search: { tab: "departments" }, icon: Building2 },
  { label: "All HODs", to: "/dashboard/academy-director", search: { tab: "hods" }, icon: UserCog },
  { label: "All Instructors", to: "/dashboard/academy-director", search: { tab: "instructors" }, icon: Users },
  { label: "All Students", to: "/dashboard/academy-director", search: { tab: "students" }, icon: GraduationCap },
  { label: "All Courses", to: "/dashboard/academy-director", search: { tab: "courses" }, icon: BookOpen },
  { label: "AI Schools Editor", to: "/dashboard/academy-director", search: { tab: "ai-schools" }, icon: GraduationCap },
  { label: "Academic Calendar", to: "/dashboard/academy-director", search: { tab: "calendar" }, icon: CalendarDays },
  { label: "Certificate Approvals", to: "/dashboard/academy-director", search: { tab: "certs" }, icon: ClipboardSignature },
  { label: "Tuition & Pricing", to: "/dashboard/academy-director", search: { tab: "tuition" }, icon: DollarSign },
  { label: "Reports & Analytics", to: "/dashboard/academy-director", search: { tab: "reports" }, icon: BarChart3 },
  { label: "Messages", to: "/dashboard/academy-director", search: { tab: "messages" }, icon: MessageSquare },
  { label: "Settings", to: "/dashboard/academy-director", search: { tab: "settings" }, icon: Settings },
];

export function DirectorShell({ title = "Academy Director" }: { title?: string }) {
  const search = useRouterState({ select: (r) => r.location.search as { tab?: string } });
  const tab = search.tab ?? "overview";
  return (
    <DashboardShell title={title} items={NAV}>
      {tab === "overview" && <Overview />}
      {tab === "departments" && <DepartmentsList />}
      {tab === "hods" && <HodsList />}
      {tab === "instructors" && <PeopleByRole role="instructor" label="Instructors" />}
      {tab === "students" && <PeopleByRole role="student" label="Students" />}
      {tab === "courses" && <CoursesAll />}
      {tab === "ai-schools" && <CourseEditorPanel />}
      {tab === "calendar" && <Calendar />}
      {tab === "certs" && <CertApprovals />}
      {tab === "tuition" && <TuitionManager />}
      {tab === "reports" && <ReportsPlaceholder />}
      {tab === "messages" && <Card className="p-6 text-sm text-muted-foreground">Use platform inbox.</Card>}
      {tab === "settings" && <Card className="p-6 text-sm text-muted-foreground">Account settings — manage via your profile.</Card>}
    </DashboardShell>
  );
}

function Overview() {
  const [stats, setStats] = useState({ courses: 0, students: 0, instructors: 0, hods: 0, pendingCerts: 0 });
  useEffect(() => {
    (async () => {
      const [c, e, i, h, certs] = await Promise.all([
        supabase.from("courses").select("id", { count: "exact", head: true }),
        supabase.from("enrollments").select("id", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("user_roles").select("user_id", { count: "exact", head: true }).eq("role", "instructor"),
        supabase.from("user_roles").select("user_id", { count: "exact", head: true }).eq("role", "hod"),
        supabase.from("certificates").select("id", { count: "exact", head: true }).in("status", ["pending", "director_signed"]),
      ]);
      setStats({
        courses: c.count ?? 0,
        students: e.count ?? 0,
        instructors: i.count ?? 0,
        hods: h.count ?? 0,
        pendingCerts: certs.count ?? 0,
      });
    })();
  }, []);
  const cards = [
    { label: "Active students", value: stats.students },
    { label: "Courses", value: stats.courses },
    { label: "Instructors", value: stats.instructors },
    { label: "HODs", value: stats.hods },
    { label: "Certificates awaiting signature", value: stats.pendingCerts },
  ];
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Academy overview</h1>
          <p className="text-sm text-muted-foreground">Whole-academy snapshot across every department.</p>
        </div>
        <InviteHodDialog />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
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

function DepartmentsList() {
  const [rows, setRows] = useState<Array<{ id: string; name: string; slug: string; hod_id: string | null }>>([]);
  useEffect(() => {
    supabase.from("departments").select("id,name,slug,hod_id").order("name")
      .then(({ data }) => setRows((data as never) || []));
  }, []);
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-border p-4">
        <div className="text-sm font-semibold">Departments ({rows.length})</div>
        <InviteHodDialog />
      </div>
      <div className="divide-y divide-border">
        {rows.map((r) => (
          <div key={r.id} className="flex items-center justify-between p-4">
            <div>
              <div className="font-medium">{r.name}</div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground">{r.slug}</div>
            </div>
            <Badge variant={r.hod_id ? "default" : "outline"}>{r.hod_id ? "HOD assigned" : "No HOD"}</Badge>
          </div>
        ))}
      </div>
    </Card>
  );
}

function HodsList() {
  const [rows, setRows] = useState<Array<{ id: string; full_name: string | null; email: string | null; department_id: string | null }>>([]);
  useEffect(() => {
    (async () => {
      const { data: ur } = await supabase.from("user_roles").select("user_id").eq("role", "hod");
      const ids = (ur || []).map((r) => r.user_id);
      if (!ids.length) return setRows([]);
      const { data: profs } = await supabase.from("profiles").select("id,full_name,email,department_id").in("id", ids);
      setRows((profs as never) || []);
    })();
  }, []);
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-border p-4">
        <div className="text-sm font-semibold">HODs ({rows.length})</div>
        <InviteHodDialog />
      </div>
      <div className="divide-y divide-border">
        {rows.map((r) => (
          <div key={r.id} className="flex items-center justify-between p-4 text-sm">
            <div>
              <div className="font-medium">{r.full_name || "Unnamed"}</div>
              <div className="text-xs text-muted-foreground">{r.email}</div>
            </div>
            <Badge variant="outline">{r.department_id ? "Dept set" : "No dept"}</Badge>
          </div>
        ))}
        {!rows.length && <div className="p-6 text-sm text-muted-foreground">No HODs yet — invite one above.</div>}
      </div>
    </Card>
  );
}

function PeopleByRole({ role, label }: { role: "instructor" | "student"; label: string }) {
  const [rows, setRows] = useState<Array<{ id: string; full_name: string | null; email: string | null }>>([]);
  useEffect(() => {
    (async () => {
      const { data: ur } = await supabase.from("user_roles").select("user_id").eq("role", role);
      const ids = (ur || []).map((r) => r.user_id);
      if (!ids.length) return setRows([]);
      const { data: profs } = await supabase.from("profiles").select("id,full_name,email").in("id", ids).limit(500);
      setRows((profs as never) || []);
    })();
  }, [role]);
  return (
    <Card className="overflow-hidden">
      <div className="border-b border-border p-4 text-sm font-semibold">{label} ({rows.length})</div>
      <div className="divide-y divide-border">
        {rows.map((r) => (
          <div key={r.id} className="flex items-center justify-between p-4 text-sm">
            <div className="font-medium">{r.full_name || "Unnamed"}</div>
            <div className="text-xs text-muted-foreground">{r.email}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function CoursesAll() {
  const [rows, setRows] = useState<Array<{ id: string; program_name: string; program_type: string; curriculum_status: string; is_published: boolean }>>([]);
  useEffect(() => {
    supabase.from("courses").select("id,program_name,program_type,curriculum_status,is_published")
      .order("created_at", { ascending: false })
      .then(({ data }) => setRows((data as never) || []));
  }, []);
  return (
    <Card className="overflow-hidden">
      <div className="border-b border-border p-4 text-sm font-semibold">All courses ({rows.length})</div>
      <div className="divide-y divide-border">
        {rows.map((r) => (
          <div key={r.id} className="flex items-center justify-between p-4">
            <div>
              <div className="font-medium">{r.program_name}</div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground">{r.program_type}</div>
            </div>
            <div className="flex gap-2">
              <Badge variant={r.is_published ? "default" : "secondary"}>{r.is_published ? "Published" : "Draft"}</Badge>
              <Badge variant="outline">{r.curriculum_status.replace("_", " ")}</Badge>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function Calendar() {
  const [rows, setRows] = useState<Array<{ id: string; title: string; kind: string; starts_at: string; ends_at: string; notes: string | null; department_id: string | null }>>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ id: "", title: "", kind: "event" as const, starts_at: "", ends_at: "", notes: "", department_id: "" });
  const upsert = useServerFn(upsertCalendarEntry);
  const del = useServerFn(deleteCalendarEntry);
  const load = () =>
    supabase.from("academic_calendar").select("id,title,kind,starts_at,ends_at,notes,department_id")
      .order("starts_at", { ascending: false }).limit(100)
      .then(({ data }) => setRows((data as never) || []));
  useEffect(() => { load(); }, []);

  async function save() {
    if (!form.title || !form.starts_at || !form.ends_at) return toast.error("Title, start and end are required");
    try {
      await upsert({
        data: {
          id: form.id || undefined,
          title: form.title, kind: form.kind,
          starts_at: form.starts_at, ends_at: form.ends_at,
          notes: form.notes || undefined,
          department_id: form.department_id || null,
        },
      });
      toast.success("Saved"); setOpen(false);
      setForm({ id: "", title: "", kind: "event", starts_at: "", ends_at: "", notes: "", department_id: "" });
      load();
    } catch (e) { toast.error((e as Error).message); }
  }
  async function remove(id: string) {
    if (!confirm("Delete this entry?")) return;
    try { await del({ data: { id } }); toast.success("Deleted"); load(); } catch (e) { toast.error((e as Error).message); }
  }

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-border p-4">
        <div className="text-sm font-semibold">Academic calendar ({rows.length})</div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm">New entry</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Calendar entry</DialogTitle></DialogHeader>
            <div className="grid gap-3">
              <div><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
              <div>
                <Label>Kind</Label>
                <Select value={form.kind} onValueChange={(v) => setForm({ ...form, kind: v as never })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["semester", "exam", "holiday", "break", "graduation", "event"].map((k) =>
                      <SelectItem key={k} value={k}>{k}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Starts</Label><Input type="date" value={form.starts_at} onChange={(e) => setForm({ ...form, starts_at: e.target.value })} /></div>
                <div><Label>Ends</Label><Input type="date" value={form.ends_at} onChange={(e) => setForm({ ...form, ends_at: e.target.value })} /></div>
              </div>
              <div><Label>Notes</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={save}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <div className="divide-y divide-border">
        {rows.map((r) => (
          <div key={r.id} className="flex items-center justify-between p-4 text-sm">
            <div>
              <div className="font-medium">{r.title}</div>
              <div className="text-xs text-muted-foreground">{r.kind} · {r.starts_at} → {r.ends_at}</div>
              {r.notes && <div className="mt-1 text-xs text-muted-foreground">{r.notes}</div>}
            </div>
            <Button size="sm" variant="ghost" onClick={() => remove(r.id)}>Delete</Button>
          </div>
        ))}
        {!rows.length && <div className="p-6 text-sm text-muted-foreground">No calendar entries yet.</div>}
      </div>
    </Card>
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
  const [courses, setCourses] = useState<Array<{ id: string; program_name: string; tuition_ngn: number }>>([]);
  const [prices, setPrices] = useState<Array<{ id: string; course_id: string; country_code: string; currency: string; amount: number; active: boolean }>>([]);
  const [form, setForm] = useState({ course_id: "", country_code: "default", currency: "NGN", amount: "" });
  const upsert = useServerFn(upsertTuitionPrice);
  const load = async () => {
    const [c, p] = await Promise.all([
      supabase.from("courses").select("id,program_name,tuition_ngn").order("program_name"),
      supabase.from("tuition_prices").select("id,course_id,country_code,currency,amount,active").order("course_id"),
    ]);
    setCourses((c.data as never) || []);
    setPrices((p.data as never) || []);
  };
  useEffect(() => { load(); }, []);

  async function save() {
    if (!form.course_id || !form.amount) return toast.error("Course and amount required");
    try {
      await upsert({
        data: {
          course_id: form.course_id, country_code: form.country_code,
          currency: form.currency, amount: parseFloat(form.amount), active: true,
        },
      });
      toast.success("Saved");
      setForm({ course_id: "", country_code: "default", currency: "NGN", amount: "" });
      load();
    } catch (e) { toast.error((e as Error).message); }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card className="p-4 lg:col-span-2">
        <div className="mb-3 text-sm font-semibold">Tuition prices ({prices.length})</div>
        <div className="divide-y divide-border">
          {prices.map((p) => {
            const c = courses.find((x) => x.id === p.course_id);
            return (
              <div key={p.id} className="flex items-center justify-between py-3 text-sm">
                <div>
                  <div className="font-medium">{c?.program_name || p.course_id.slice(0, 8)}</div>
                  <div className="text-xs text-muted-foreground">{p.country_code.toUpperCase()} · {p.currency} {p.amount.toLocaleString()}</div>
                </div>
                <Badge variant={p.active ? "default" : "secondary"}>{p.active ? "Active" : "Off"}</Badge>
              </div>
            );
          })}
          {!prices.length && <div className="py-4 text-sm text-muted-foreground">No prices set — defaults come from each course's tuition_ngn.</div>}
        </div>
      </Card>
      <Card className="p-4">
        <div className="mb-3 text-sm font-semibold">Add / update price</div>
        <div className="grid gap-3">
          <div>
            <Label>Course</Label>
            <Select value={form.course_id} onValueChange={(v) => setForm({ ...form, course_id: v })}>
              <SelectTrigger><SelectValue placeholder="Select course" /></SelectTrigger>
              <SelectContent>{courses.map((c) => <SelectItem key={c.id} value={c.id}>{c.program_name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div><Label>Country</Label><Input value={form.country_code} onChange={(e) => setForm({ ...form, country_code: e.target.value })} placeholder="NG, US, GB…" /></div>
            <div><Label>Currency</Label><Input value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} /></div>
          </div>
          <div><Label>Amount</Label><Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></div>
          <Button onClick={save}>Save price</Button>
        </div>
      </Card>
    </div>
  );
}

function ReportsPlaceholder() {
  return <Card className="p-6 text-sm text-muted-foreground">Academy-wide analytics dashboard ships in Phase 9 polish (charts, exports).</Card>;
}