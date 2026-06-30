import { useEffect, useState } from "react";
import { DashboardShell, type NavItem } from "@/components/dashboard/Sidebar";
import {
  LayoutDashboard, BookOpen, GraduationCap, Users, FileCheck2,
  Award, BarChart3, MessageSquare, Settings, ClipboardCheck, Building2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useRouterState } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useServerFn } from "@tanstack/react-start";
import { decideCurriculum } from "@/lib/hod/hod.functions";
import { toast } from "sonner";

const NAV: NavItem[] = [
  { label: "Dashboard", to: "/dashboard/hod", icon: LayoutDashboard },
  { label: "My Department", to: "/dashboard/hod", search: { tab: "dept" }, icon: Building2 },
  { label: "Courses", to: "/dashboard/hod", search: { tab: "courses" }, icon: BookOpen },
  { label: "Instructors", to: "/dashboard/hod", search: { tab: "instructors" }, icon: Users },
  { label: "Students", to: "/dashboard/hod", search: { tab: "students" }, icon: GraduationCap },
  { label: "Grading Oversight", to: "/dashboard/hod", search: { tab: "grading" }, icon: ClipboardCheck },
  { label: "Curriculum", to: "/dashboard/hod", search: { tab: "curriculum" }, icon: FileCheck2 },
  { label: "Recommend Graduates", to: "/dashboard/hod", search: { tab: "recommend" }, icon: Award },
  { label: "Reports", to: "/dashboard/hod", search: { tab: "reports" }, icon: BarChart3 },
  { label: "Messages", to: "/dashboard/hod", search: { tab: "messages" }, icon: MessageSquare },
  { label: "Settings", to: "/dashboard/hod", search: { tab: "settings" }, icon: Settings },
];

export function HodShell() {
  const search = useRouterState({ select: (r) => r.location.search as { tab?: string } });
  const tab = search.tab ?? "overview";
  const { user } = useAuth();
  const [dept, setDept] = useState<{ id: string; name: string; slug: string } | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: p } = await supabase.from("profiles").select("department_id").eq("id", user.id).maybeSingle();
      if (p?.department_id) {
        const { data: d } = await supabase.from("departments").select("id,name,slug").eq("id", p.department_id).maybeSingle();
        setDept(d || null);
      }
    })();
  }, [user]);

  return (
    <DashboardShell title="HOD Portal" items={NAV}>
      {dept && (
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-gradient-brand px-3 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-glow">
          {dept.name} Department
        </div>
      )}
      {!dept && (
        <Card className="mb-4 p-4 text-sm text-muted-foreground">
          You have not been assigned to a department yet. Ask the Academy Director or Super Admin to assign you.
        </Card>
      )}
      {tab === "overview" && <Overview deptId={dept?.id} />}
      {tab === "dept" && <Overview deptId={dept?.id} />}
      {tab === "courses" && <CoursesList deptId={dept?.id} />}
      {tab === "instructors" && <InstructorsList deptId={dept?.id} />}
      {tab === "students" && <StudentsList deptId={dept?.id} />}
      {tab === "grading" && <GradingPlaceholder />}
      {tab === "curriculum" && <CurriculumQueue deptId={dept?.id} />}
      {tab === "recommend" && <RecommendList deptId={dept?.id} />}
      {tab === "reports" && <ReportsList deptId={dept?.id} />}
      {tab === "messages" && <Card className="p-6 text-sm text-muted-foreground">Messages center is shared with the platform inbox.</Card>}
      {tab === "settings" && <Card className="p-6 text-sm text-muted-foreground">Account settings — manage via your profile.</Card>}
    </DashboardShell>
  );
}

function Overview({ deptId }: { deptId?: string }) {
  const [stats, setStats] = useState({ courses: 0, instructors: 0, students: 0, pendingApprovals: 0, recommendations: 0 });
  useEffect(() => {
    if (!deptId) return;
    (async () => {
      const [c, ccr, recs] = await Promise.all([
        supabase.from("courses").select("id", { count: "exact", head: true }).eq("department_id", deptId),
        supabase.from("courses").select("id", { count: "exact", head: true }).eq("department_id", deptId).eq("curriculum_status", "pending_approval"),
        supabase.from("graduate_recommendations").select("id", { count: "exact", head: true }).eq("department_id", deptId),
      ]);
      const { data: courseIds } = await supabase.from("courses").select("id, instructor_id").eq("department_id", deptId);
      const instructorIds = new Set((courseIds || []).map((r) => r.instructor_id).filter(Boolean));
      const ids = (courseIds || []).map((r) => r.id);
      let students = 0;
      if (ids.length) {
        const { count } = await supabase.from("enrollments").select("id", { count: "exact", head: true }).in("course_id", ids);
        students = count ?? 0;
      }
      setStats({
        courses: c.count ?? 0,
        instructors: instructorIds.size,
        students,
        pendingApprovals: ccr.count ?? 0,
        recommendations: recs.count ?? 0,
      });
    })();
  }, [deptId]);

  const cards = [
    { label: "Courses", value: stats.courses },
    { label: "Instructors", value: stats.instructors },
    { label: "Students enrolled", value: stats.students },
    { label: "Curriculum pending", value: stats.pendingApprovals },
    { label: "Recommendations sent", value: stats.recommendations },
  ];
  return (
    <div>
      <h1 className="mb-1 text-2xl font-extrabold tracking-tight">Department overview</h1>
      <p className="mb-6 text-sm text-muted-foreground">Live snapshot of your department's academy operations.</p>
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

function CoursesList({ deptId }: { deptId?: string }) {
  const [rows, setRows] = useState<Array<{ id: string; program_name: string; program_type: string; is_published: boolean; curriculum_status: string }>>([]);
  useEffect(() => {
    if (!deptId) return;
    supabase.from("courses").select("id,program_name,program_type,is_published,curriculum_status")
      .eq("department_id", deptId).order("created_at", { ascending: false })
      .then(({ data }) => setRows((data as never) || []));
  }, [deptId]);
  return (
    <Card className="overflow-hidden">
      <div className="border-b border-border p-4 text-sm font-semibold">Courses ({rows.length})</div>
      <div className="divide-y divide-border">
        {rows.map((r) => (
          <div key={r.id} className="flex items-center justify-between p-4">
            <div>
              <div className="font-medium">{r.program_name}</div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground">{r.program_type}</div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={r.is_published ? "default" : "secondary"}>{r.is_published ? "Published" : "Draft"}</Badge>
              <Badge variant="outline">{r.curriculum_status.replace("_", " ")}</Badge>
            </div>
          </div>
        ))}
        {!rows.length && <div className="p-6 text-sm text-muted-foreground">No courses in this department yet.</div>}
      </div>
    </Card>
  );
}

function InstructorsList({ deptId }: { deptId?: string }) {
  const [rows, setRows] = useState<Array<{ id: string; full_name: string | null; email: string | null }>>([]);
  useEffect(() => {
    if (!deptId) return;
    (async () => {
      const { data: courses } = await supabase.from("courses").select("instructor_id").eq("department_id", deptId);
      const ids = Array.from(new Set((courses || []).map((c) => c.instructor_id).filter(Boolean))) as string[];
      if (!ids.length) return setRows([]);
      const { data: profs } = await supabase.from("profiles").select("id,full_name,email").in("id", ids);
      setRows((profs as never) || []);
    })();
  }, [deptId]);
  return (
    <Card className="overflow-hidden">
      <div className="border-b border-border p-4 text-sm font-semibold">Instructors ({rows.length})</div>
      <div className="divide-y divide-border">
        {rows.map((r) => (
          <div key={r.id} className="flex items-center justify-between p-4">
            <div>
              <div className="font-medium">{r.full_name || "Unnamed"}</div>
              <div className="text-xs text-muted-foreground">{r.email}</div>
            </div>
          </div>
        ))}
        {!rows.length && <div className="p-6 text-sm text-muted-foreground">No instructors yet.</div>}
      </div>
    </Card>
  );
}

function StudentsList({ deptId }: { deptId?: string }) {
  const [rows, setRows] = useState<Array<{ id: string; student_id: string; course_id: string; status: string; progress_percentage: number | null }>>([]);
  useEffect(() => {
    if (!deptId) return;
    (async () => {
      const { data: courses } = await supabase.from("courses").select("id").eq("department_id", deptId);
      const ids = (courses || []).map((c) => c.id);
      if (!ids.length) return setRows([]);
      const { data } = await supabase.from("enrollments")
        .select("id,student_id,course_id,status,progress_percentage")
        .in("course_id", ids).order("created_at", { ascending: false }).limit(200);
      setRows((data as never) || []);
    })();
  }, [deptId]);
  return (
    <Card className="overflow-hidden">
      <div className="border-b border-border p-4 text-sm font-semibold">Students ({rows.length})</div>
      <div className="divide-y divide-border">
        {rows.map((r) => (
          <div key={r.id} className="flex items-center justify-between p-4 text-sm">
            <div className="font-mono text-xs">{r.student_id.slice(0, 8)}…</div>
            <Badge variant="outline">{r.status}</Badge>
            <div className="text-muted-foreground">{r.progress_percentage ?? 0}%</div>
          </div>
        ))}
        {!rows.length && <div className="p-6 text-sm text-muted-foreground">No students enrolled yet.</div>}
      </div>
    </Card>
  );
}

function CurriculumQueue({ deptId }: { deptId?: string }) {
  const [rows, setRows] = useState<Array<{ id: string; program_name: string; curriculum_status: string }>>([]);
  const decide = useServerFn(decideCurriculum);
  const load = async () => {
    if (!deptId) return;
    const { data } = await supabase.from("courses")
      .select("id,program_name,curriculum_status")
      .eq("department_id", deptId)
      .in("curriculum_status", ["pending_approval", "needs_revision"])
      .order("updated_at", { ascending: false });
    setRows((data as never) || []);
  };
  useEffect(() => { load(); }, [deptId]);

  async function act(id: string, decision: "approved" | "needs_revision") {
    try {
      await decide({ data: { course_id: id, decision } });
      toast.success(`Curriculum ${decision === "approved" ? "approved" : "sent back"}`);
      load();
    } catch (e) { toast.error((e as Error).message); }
  }

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-border p-4 text-sm font-semibold">Curriculum approvals ({rows.length})</div>
      <div className="divide-y divide-border">
        {rows.map((r) => (
          <div key={r.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <div className="font-medium">{r.program_name}</div>
              <Badge variant="outline">{r.curriculum_status.replace("_", " ")}</Badge>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => act(r.id, "needs_revision")}>Send back</Button>
              <Button size="sm" onClick={() => act(r.id, "approved")}>Approve</Button>
            </div>
          </div>
        ))}
        {!rows.length && <div className="p-6 text-sm text-muted-foreground">Nothing waiting for approval.</div>}
      </div>
    </Card>
  );
}

function RecommendList({ deptId }: { deptId?: string }) {
  const [rows, setRows] = useState<Array<{ id: string; student_id: string; recommended_tier: string; status: string; justification: string; created_at: string }>>([]);
  useEffect(() => {
    if (!deptId) return;
    supabase.from("graduate_recommendations")
      .select("id,student_id,recommended_tier,status,justification,created_at")
      .eq("department_id", deptId).order("created_at", { ascending: false })
      .then(({ data }) => setRows((data as never) || []));
  }, [deptId]);
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-border p-4">
        <div className="text-sm font-semibold">Graduate recommendations ({rows.length})</div>
        <Button size="sm" disabled title="Recommend from a student profile page (coming next sub-phase)">New recommendation</Button>
      </div>
      <div className="divide-y divide-border">
        {rows.map((r) => (
          <div key={r.id} className="p-4 text-sm">
            <div className="mb-1 flex items-center justify-between">
              <div className="font-mono text-xs">{r.student_id.slice(0, 8)}…</div>
              <div className="flex gap-2">
                <Badge variant="secondary">{r.recommended_tier}</Badge>
                <Badge variant={r.status === "approved" ? "default" : r.status === "rejected" ? "destructive" : "outline"}>
                  {r.status}
                </Badge>
              </div>
            </div>
            <p className="text-muted-foreground">{r.justification}</p>
          </div>
        ))}
        {!rows.length && <div className="p-6 text-sm text-muted-foreground">No recommendations yet.</div>}
      </div>
    </Card>
  );
}

function ReportsList({ deptId }: { deptId?: string }) {
  const [rows, setRows] = useState<Array<{ id: string; period_start: string; period_end: string; metrics: Record<string, unknown> }>>([]);
  useEffect(() => {
    if (!deptId) return;
    supabase.from("department_reports").select("id,period_start,period_end,metrics")
      .eq("department_id", deptId).order("period_end", { ascending: false }).limit(20)
      .then(({ data }) => setRows((data as never) || []));
  }, [deptId]);
  return (
    <Card className="overflow-hidden">
      <div className="border-b border-border p-4 text-sm font-semibold">Weekly reports</div>
      <div className="divide-y divide-border">
        {rows.map((r) => (
          <div key={r.id} className="p-4 text-sm">
            <div className="font-medium">{r.period_start} → {r.period_end}</div>
            <pre className="mt-2 overflow-x-auto rounded-md bg-secondary/40 p-3 text-xs">{JSON.stringify(r.metrics, null, 2)}</pre>
          </div>
        ))}
        {!rows.length && <div className="p-6 text-sm text-muted-foreground">Weekly reports will appear here after the first run.</div>}
      </div>
    </Card>
  );
}

function GradingPlaceholder() {
  return (
    <Card className="p-6 text-sm text-muted-foreground">
      Grading oversight uses the assignments and tests pipeline shipping in Phase 8 (Instructor portal). Once instructors grade submissions, you will review and approve them here.
    </Card>
  );
}