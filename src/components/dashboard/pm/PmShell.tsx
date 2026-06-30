import { useEffect, useMemo, useState } from "react";
import { DashboardShell, type NavItem } from "@/components/dashboard/Sidebar";
import {
  LayoutDashboard, Inbox, ListChecks, Eye, Truck, CheckCircle2,
  Users, MessageSquare, FileText, BarChart3, Settings, Send,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useRouterState } from "@tanstack/react-router";
import { InviteTalentDialog } from "@/components/dashboard/InviteTalentDialog";
import { PmTaskDialog } from "./PmTaskDialog";

const NAV: NavItem[] = [
  { label: "Dashboard", to: "/dashboard/pm", icon: LayoutDashboard },
  { label: "Incoming", to: "/dashboard/pm", search: { tab: "incoming" }, icon: Inbox },
  { label: "Active", to: "/dashboard/pm", search: { tab: "active" }, icon: ListChecks },
  { label: "QA Review", to: "/dashboard/pm", search: { tab: "qa" }, icon: Eye },
  { label: "Delivered", to: "/dashboard/pm", search: { tab: "delivered" }, icon: Truck },
  { label: "Completed", to: "/dashboard/pm", search: { tab: "completed" }, icon: CheckCircle2 },
  { label: "My Talents", to: "/dashboard/pm", search: { tab: "talents" }, icon: Users },
  { label: "Messages", to: "/dashboard/pm", search: { tab: "messages" }, icon: MessageSquare },
  { label: "Quotes Sent", to: "/dashboard/pm", search: { tab: "quotes" }, icon: FileText },
  { label: "Performance", to: "/dashboard/pm", search: { tab: "performance" }, icon: BarChart3 },
  { label: "Settings", to: "/dashboard/pm", search: { tab: "settings" }, icon: Settings },
];

export function PmShell({ title = "PM Portal" }: { title?: string }) {
  const search = useRouterState({ select: (r) => r.location.search as { tab?: string } });
  const tab = search.tab ?? "overview";
  const { user } = useAuth();
  const [dept, setDept] = useState<{ id: string; name: string; slug: string } | null>(null);
  const [openTask, setOpenTask] = useState<string | null>(null);
  const [refreshTick, setRefreshTick] = useState(0);

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

  const open = (id: string) => setOpenTask(id);
  const bump = () => setRefreshTick((n) => n + 1);

  return (
    <DashboardShell title={title} items={NAV}>
      <DeptBadge dept={dept} />
      {tab === "overview"   && <Overview deptId={dept?.id} onOpen={open} key={`o-${refreshTick}`} />}
      {tab === "incoming"   && <TaskList deptId={dept?.id} statuses={["pending"]} title="Incoming tasks" onOpen={open} key={`i-${refreshTick}`} />}
      {tab === "active"     && <TaskList deptId={dept?.id} statuses={["quoted","in_progress","revision_required"]} title="Active tasks" onOpen={open} key={`a-${refreshTick}`} />}
      {tab === "qa"         && <TaskList deptId={dept?.id} statuses={["submitted_qa","in_review"]} title="QA review queue" onOpen={open} key={`q-${refreshTick}`} />}
      {tab === "delivered"  && <TaskList deptId={dept?.id} statuses={["delivered"]} title="Delivered to client" onOpen={open} key={`d-${refreshTick}`} />}
      {tab === "completed"  && <TaskList deptId={dept?.id} statuses={["completed"]} title="Completed tasks" onOpen={open} key={`c-${refreshTick}`} />}
      {tab === "talents"    && <MyTalents deptId={dept?.id} />}
      {tab === "messages"   && <MessagesPage userId={user?.id} />}
      {tab === "quotes"     && <QuotesSent pmId={user?.id} />}
      {tab === "performance"&& <Performance deptId={dept?.id} />}
      {tab === "settings"   && <SettingsPage userId={user?.id} />}

      <PmTaskDialog taskId={openTask} onClose={() => setOpenTask(null)} onChanged={bump} />
    </DashboardShell>
  );
}

function DeptBadge({ dept }: { dept: { name: string } | null }) {
  if (!dept) return null;
  return (
    <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-gradient-brand px-3 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-glow">
      {dept.name} Department
    </div>
  );
}

/* ---------------- Overview ---------------- */

function Overview({ deptId, onOpen }: { deptId?: string; onOpen: (id: string) => void }) {
  const [stats, setStats] = useState({ incoming: 0, active: 0, qa: 0, delivered: 0, completedWk: 0, revenueMo: 0, talents: 0, avgDays: 0 });
  const [recent, setRecent] = useState<any[]>([]);

  useEffect(() => {
    if (!deptId) return;
    const load = async () => {
      const week = new Date(Date.now() - 7 * 864e5).toISOString();
      const month = new Date(Date.now() - 30 * 864e5).toISOString();
      const counts = async (statuses: string[]) => {
        const { count } = await supabase.from("tasks").select("id", { count: "exact", head: true })
          .eq("department_id", deptId).in("status", statuses as any);
        return count || 0;
      };
      const incoming = await counts(["pending"]);
      const active = await counts(["quoted", "in_progress", "revision_required"]);
      const qa = await counts(["submitted_qa", "in_review"]);
      const delivered = await counts(["delivered"]);
      const { count: cw } = await supabase.from("tasks").select("id", { count: "exact", head: true })
        .eq("department_id", deptId).eq("status", "completed").gte("completed_at", week);
      const { data: pays } = await (supabase.from("payments") as any).select("amount,paid_at,task_id,tasks!inner(department_id)")
        .gte("paid_at", month).eq("status", "paid").eq("tasks.department_id", deptId);
      const revenueMo = (pays || []).reduce((s: number, p: any) => s + Number(p.amount || 0), 0);
      const { count: tCount } = await supabase.from("talents").select("user_id", { count: "exact", head: true }).eq("department_id", deptId);
      const { data: done } = await supabase.from("tasks")
        .select("created_at,completed_at").eq("department_id", deptId).eq("status", "completed").not("completed_at", "is", null).limit(50);
      const days = (done || []).map((t: any) => (new Date(t.completed_at).getTime() - new Date(t.created_at).getTime()) / 864e5);
      const avg = days.length ? days.reduce((a, b) => a + b, 0) / days.length : 0;
      setStats({ incoming, active, qa, delivered, completedWk: cw || 0, revenueMo, talents: tCount || 0, avgDays: Math.round(avg * 10) / 10 });

      const { data: r } = await supabase.from("tasks")
        .select("id,title,status,tier,deadline,created_at,first_response_due_at")
        .eq("department_id", deptId).order("created_at", { ascending: false }).limit(8);
      setRecent(r || []);
    };
    load();
    const ch = supabase.channel(`pm-ov-${deptId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "tasks", filter: `department_id=eq.${deptId}` }, load)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [deptId]);

  const cards = [
    { k: "Incoming", v: stats.incoming, tone: "from-blue-500/20" },
    { k: "Active", v: stats.active, tone: "from-purple-500/20" },
    { k: "QA pending", v: stats.qa, tone: "from-amber-500/20" },
    { k: "Delivered", v: stats.delivered, tone: "from-teal-500/20" },
    { k: "Completed (wk)", v: stats.completedWk, tone: "from-emerald-500/20" },
    { k: "Revenue (mo)", v: `₦${stats.revenueMo.toLocaleString()}`, tone: "from-indigo-500/20" },
    { k: "Active talents", v: stats.talents, tone: "from-pink-500/20" },
    { k: "Avg days", v: stats.avgDays, tone: "from-cyan-500/20" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Welcome back</h1>
        <p className="text-sm text-muted-foreground">Your department snapshot, live.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.k} className={`rounded-2xl border border-border bg-gradient-to-br ${c.tone} to-card p-4`}>
            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{c.k}</div>
            <div className="mt-1 text-2xl font-extrabold tracking-tight">{c.v as any}</div>
          </div>
        ))}
      </div>
      <div className="rounded-2xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <div className="text-sm font-bold">Recent activity</div>
        </div>
        {recent.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">No tasks yet.</p>
        ) : (
          <ul className="divide-y divide-border">
            {recent.map((t) => (
              <li key={t.id} className="flex items-center justify-between px-5 py-3 text-sm">
                <button onClick={() => onOpen(t.id)} className="text-left">
                  <div className="font-semibold">{t.title}</div>
                  <div className="text-xs capitalize text-muted-foreground">{t.tier} · {t.status.replace("_", " ")}</div>
                </button>
                <SlaPill task={t} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function SlaPill({ task }: { task: any }) {
  if (!task.first_response_due_at || task.status !== "pending") return <span className="text-xs text-muted-foreground">{task.deadline || "flexible"}</span>;
  const ms = new Date(task.first_response_due_at).getTime() - Date.now();
  const hrs = ms / 3.6e6;
  const tone = hrs < 0 ? "bg-red-500/20 text-red-600" : hrs < 6 ? "bg-amber-500/20 text-amber-600" : "bg-emerald-500/20 text-emerald-600";
  const label = hrs < 0 ? `${Math.abs(Math.round(hrs))}h overdue` : `${Math.round(hrs)}h to respond`;
  return <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${tone}`}>{label}</span>;
}

/* ---------------- Task list (Incoming / Active / QA / Delivered / Completed) ---------------- */

function TaskList({ deptId, statuses, title, onOpen }: { deptId?: string; statuses: string[]; title: string; onOpen: (id: string) => void }) {
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    if (!deptId) return;
    const load = async () => {
      const { data } = await supabase.from("tasks")
        .select("id,title,status,tier,deadline,created_at,client_id,assigned_talent_id,first_response_due_at,quoted_amount,quoted_currency")
        .eq("department_id", deptId).in("status", statuses as any).order("created_at", { ascending: false });
      // join client name
      const clientIds = Array.from(new Set((data || []).map((t: any) => t.client_id).filter(Boolean)));
      const profMap: Record<string, string> = {};
      if (clientIds.length) {
        const { data: p } = await supabase.from("profiles").select("id,full_name,email").in("id", clientIds);
        (p || []).forEach((x: any) => { profMap[x.id] = x.full_name || x.email; });
      }
      setRows((data || []).map((t: any) => ({ ...t, client_name: profMap[t.client_id] || "—" })));
    };
    load();
    const ch = supabase.channel(`pm-list-${deptId}-${statuses.join(",")}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "tasks", filter: `department_id=eq.${deptId}` }, load)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [deptId, statuses.join(",")]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold tracking-tight">{title}</h1>
      <div className="rounded-2xl border border-border bg-card">
        {rows.length === 0 ? (
          <p className="p-10 text-center text-sm text-muted-foreground">Nothing here.</p>
        ) : (
          <ul className="divide-y divide-border">
            {rows.map((t) => (
              <li key={t.id} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
                <button onClick={() => onOpen(t.id)} className="min-w-0 flex-1 text-left">
                  <div className="truncate font-semibold">{t.title}</div>
                  <div className="text-xs text-muted-foreground">{t.client_name} · {t.tier} · {t.deadline || "flexible"}</div>
                </button>
                <div className="hidden text-xs text-muted-foreground sm:block">
                  {t.quoted_amount ? `${t.quoted_currency || "NGN"} ${Number(t.quoted_amount).toLocaleString()}` : "—"}
                </div>
                <SlaPill task={t} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

/* ---------------- My Talents ---------------- */

function MyTalents({ deptId }: { deptId?: string }) {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => {
    if (!deptId) return;
    supabase.from("talents")
      .select("user_id, tier, status, availability, tasks_completed, approval_rate, skills, profiles:profiles!talents_user_id_fkey(full_name,email)" as any)
      .eq("department_id", deptId)
      .then(({ data }) => setRows(data || []));
  }, [deptId]);

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">My Talents</h1>
          <p className="text-sm text-muted-foreground">Your department's talent pool.</p>
        </div>
        <InviteTalentDialog />
      </div>
      <div className="rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase text-muted-foreground"><tr>
            <th className="px-5 py-2">Talent</th><th className="px-5 py-2">Tier</th><th className="px-5 py-2">Avail.</th>
            <th className="px-5 py-2">Done</th><th className="px-5 py-2">Approval</th><th className="px-5 py-2">Skills</th>
          </tr></thead>
          <tbody className="divide-y divide-border">
            {rows.map((r) => (
              <tr key={r.user_id}>
                <td className="px-5 py-3">
                  <div className="font-semibold">{r.profiles?.full_name || "—"}</div>
                  <div className="text-xs text-muted-foreground">{r.profiles?.email}</div>
                </td>
                <td className="px-5 py-3">Tier {r.tier}</td>
                <td className="px-5 py-3 capitalize">{r.availability}</td>
                <td className="px-5 py-3">{r.tasks_completed}</td>
                <td className="px-5 py-3">{r.approval_rate}%</td>
                <td className="px-5 py-3">
                  <div className="flex flex-wrap gap-1">
                    {(r.skills || []).slice(0, 4).map((s: string) => <span key={s} className="rounded-full bg-secondary px-2 py-0.5 text-[10px]">{s}</span>)}
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={6} className="px-5 py-10 text-center text-sm text-muted-foreground">No talents in this department yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------------- Messages ---------------- */

function MessagesPage({ userId }: { userId?: string }) {
  const [convos, setConvos] = useState<any[]>([]);
  useEffect(() => {
    if (!userId) return;
    (async () => {
      const { data } = await supabase.from("messages")
        .select("id,content,sender_id,receiver_id,task_id,created_at")
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .order("created_at", { ascending: false }).limit(100);
      const byTask: Record<string, any> = {};
      for (const m of (data || [])) {
        const k = m.task_id as string | null;
        if (k && !byTask[k]) byTask[k] = m;
      }
      const taskIds = Object.keys(byTask);
      const { data: tasks } = taskIds.length
        ? await supabase.from("tasks").select("id,title,client_id,assigned_talent_id").in("id", taskIds)
        : { data: [] };
      const t = Object.fromEntries((tasks || []).map((x: any) => [x.id, x]));
      setConvos(taskIds.map((id) => ({ ...byTask[id], task: t[id] })));
    })();
  }, [userId]);
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold tracking-tight">Messages</h1>
      <div className="rounded-2xl border border-border bg-card">
        {convos.length === 0
          ? <p className="p-8 text-center text-sm text-muted-foreground">No conversations yet.</p>
          : <ul className="divide-y divide-border">
              {convos.map((c) => (
                <li key={c.id} className="px-5 py-3 text-sm">
                  <div className="font-semibold">{c.task?.title || "Task"}</div>
                  <div className="truncate text-xs text-muted-foreground">{c.content}</div>
                  <div className="text-[10px] uppercase text-muted-foreground">{new Date(c.created_at).toLocaleString()}</div>
                </li>
              ))}
            </ul>}
      </div>
    </div>
  );
}

/* ---------------- Quotes Sent ---------------- */

function QuotesSent({ pmId }: { pmId?: string }) {
  const [rows, setRows] = useState<any[]>([]);
  const [filter, setFilter] = useState<string>("all");
  useEffect(() => {
    if (!pmId) return;
    supabase.from("quotes")
      .select("id,amount,currency,status,delivery_days,notes,created_at,task_id,tasks(title)" as any)
      .eq("pm_id", pmId).order("created_at", { ascending: false })
      .then(({ data }) => setRows(data || []));
  }, [pmId]);
  const list = useMemo(() => filter === "all" ? rows : rows.filter((r) => r.status === filter), [rows, filter]);
  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between">
        <h1 className="text-2xl font-extrabold tracking-tight">Quotes sent</h1>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="rounded-lg border border-border bg-background px-3 py-2 text-sm">
          <option value="all">All</option><option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option><option value="expired">Expired</option><option value="cancelled">Cancelled</option>
        </select>
      </div>
      <div className="rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase text-muted-foreground"><tr>
            <th className="px-5 py-2">Task</th><th className="px-5 py-2">Amount</th><th className="px-5 py-2">Days</th><th className="px-5 py-2">Status</th><th className="px-5 py-2">Sent</th>
          </tr></thead>
          <tbody className="divide-y divide-border">
            {list.map((r: any) => (
              <tr key={r.id}>
                <td className="px-5 py-3 font-semibold">{r.tasks?.title || "—"}</td>
                <td className="px-5 py-3">{r.currency} {Number(r.amount).toLocaleString()}</td>
                <td className="px-5 py-3">{r.delivery_days || "—"}</td>
                <td className="px-5 py-3 capitalize">{r.status}</td>
                <td className="px-5 py-3 text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
            {list.length === 0 && <tr><td colSpan={5} className="px-5 py-10 text-center text-sm text-muted-foreground">No quotes match.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------------- Performance ---------------- */

function Performance({ deptId }: { deptId?: string }) {
  const [m, setM] = useState({ delivered: 0, revenue: 0, onTime: 0, revisionRate: 0, satisfaction: 0 });
  useEffect(() => {
    if (!deptId) return;
    (async () => {
      const month = new Date(Date.now() - 30 * 864e5).toISOString();
      const { data: delivered } = await supabase.from("tasks")
        .select("id,deadline,completed_at,revision_count").eq("department_id", deptId).eq("status", "completed").gte("completed_at", month);
      const total = (delivered || []).length;
      const onTime = (delivered || []).filter((t: any) => !t.deadline || !t.completed_at || new Date(t.completed_at) <= new Date(t.deadline)).length;
      const revs = (delivered || []).filter((t: any) => (t.revision_count || 0) > 0).length;
      const { data: pays } = await (supabase.from("payments") as any)
        .select("amount,paid_at,tasks!inner(department_id)")
        .gte("paid_at", month).eq("status", "paid").eq("tasks.department_id", deptId);
      const revenue = (pays || []).reduce((s: number, p: any) => s + Number(p.amount || 0), 0);
      const { data: revs2 } = await (supabase.from("reviews") as any)
        .select("rating,task_id,tasks!inner(department_id)").eq("tasks.department_id", deptId);
      const sat = revs2 && revs2.length ? revs2.reduce((s: number, r: any) => s + Number(r.rating || 0), 0) / revs2.length : 0;
      setM({
        delivered: total, revenue,
        onTime: total ? Math.round((onTime / total) * 100) : 0,
        revisionRate: total ? Math.round((revs / total) * 100) : 0,
        satisfaction: Math.round(sat * 10) / 10,
      });
    })();
  }, [deptId]);

  const cells = [
    { k: "Delivered (30d)", v: m.delivered },
    { k: "Revenue (30d)", v: `₦${m.revenue.toLocaleString()}` },
    { k: "On-time rate", v: `${m.onTime}%` },
    { k: "Revision rate", v: `${m.revisionRate}%` },
    { k: "Client satisfaction", v: `${m.satisfaction}/5` },
  ];
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold tracking-tight">Performance</h1>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {cells.map((c) => (
          <div key={c.k} className="rounded-2xl border border-border bg-card p-4">
            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{c.k}</div>
            <div className="mt-1 text-2xl font-extrabold">{c.v as any}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Settings ---------------- */

function SettingsPage({ userId }: { userId?: string }) {
  const [p, setP] = useState<any>({});
  useEffect(() => { if (userId) supabase.from("profiles").select("*").eq("id", userId).maybeSingle().then(({ data }) => setP(data || {})); }, [userId]);
  const save = async () => {
    await supabase.from("profiles").update({ full_name: p.full_name, phone: p.phone, working_hours: p.working_hours, auto_reply: p.auto_reply }).eq("id", userId!);
  };
  return (
    <div className="max-w-xl space-y-4">
      <h1 className="text-2xl font-extrabold tracking-tight">Settings</h1>
      <div className="space-y-3 rounded-2xl border border-border bg-card p-5">
        <Field label="Full name" value={p.full_name || ""} onChange={(v) => setP({ ...p, full_name: v })} />
        <Field label="Phone" value={p.phone || ""} onChange={(v) => setP({ ...p, phone: v })} />
        <Field label="Working hours" value={p.working_hours || ""} onChange={(v) => setP({ ...p, working_hours: v })} placeholder="e.g. 9am-6pm WAT" />
        <label className="block">
          <span className="text-sm font-medium">Auto-reply</span>
          <textarea value={p.auto_reply || ""} onChange={(e) => setP({ ...p, auto_reply: e.target.value })} rows={3}
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
        </label>
        <button onClick={save} className="rounded-lg bg-gradient-brand px-4 py-2 text-sm font-bold text-white shadow-glow">Save</button>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      <input value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
    </label>
  );
}