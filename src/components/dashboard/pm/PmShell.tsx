import { useEffect, useState } from "react";
import { DashboardShell, type NavItem } from "@/components/dashboard/Sidebar";
import { LayoutDashboard, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { InviteTalentDialog } from "@/components/dashboard/InviteTalentDialog";
import { useRouterState, useNavigate } from "@tanstack/react-router";

const NAV: NavItem[] = [
  { label: "Dashboard", to: "/dashboard/pm", icon: LayoutDashboard },
  { label: "Talents", to: "/dashboard/pm", search: { tab: "talents" }, icon: Users },
];

export function PmShell({ title = "PM Portal" }: { title?: string }) {
  const search = useRouterState({ select: (r) => r.location.search as { tab?: string } });
  const tab = search.tab ?? "overview";
  const navigate = useNavigate();
  const _nav = NAV.map((n) => ({ ...n, to: title === "Admin Portal" ? "/dashboard/admin" : "/dashboard/pm" }));
  void navigate;
  return (
    <DashboardShell title={title} items={_nav as NavItem[]}>
      {tab === "overview" ? <Overview /> : <TalentsList />}
    </DashboardShell>
  );
}

function Overview() {
  const [tasks, setTasks] = useState<any[]>([]);
  useEffect(() => {
    supabase.from("tasks").select("id,title,status,service_category,tier,deadline,assigned_talent_id")
      .order("created_at", { ascending: false }).limit(20).then(({ data }) => setTasks(data || []));
  }, []);
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">PM Dashboard</h1>
          <p className="text-sm text-muted-foreground">Manage inbound tasks and assign work to talents.</p>
        </div>
        <InviteTalentDialog />
      </div>
      <div className="rounded-2xl border border-border bg-card">
        <div className="border-b border-border px-5 py-3 text-sm font-bold">Recent tasks</div>
        {tasks.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">No tasks yet.</p>
        ) : (
          <ul className="divide-y divide-border">
            {tasks.map((t) => (
              <li key={t.id} className="flex items-center justify-between px-5 py-3 text-sm">
                <div>
                  <div className="font-semibold">{t.title}</div>
                  <div className="text-xs capitalize text-muted-foreground">{t.service_category} · {t.tier} · {t.status.replace("_", " ")}</div>
                </div>
                <div className="text-xs text-muted-foreground">{t.deadline || "flexible"}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function TalentsList() {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => {
    supabase.from("talents")
      .select("user_id, tier, status, availability, tasks_completed, approval_rate, skills, profiles:profiles!talents_user_id_fkey(full_name,email)" as any)
      .order("created_at", { ascending: false }).then(({ data }) => setRows(data || []));
  }, []);
  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Talents</h1>
          <p className="text-sm text-muted-foreground">All invited and active talents.</p>
        </div>
        <InviteTalentDialog />
      </div>
      <div className="rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase text-muted-foreground">
            <tr><th className="px-5 py-2">Name</th><th className="px-5 py-2">Tier</th><th className="px-5 py-2">Status</th><th className="px-5 py-2">Availability</th><th className="px-5 py-2">Tasks done</th><th className="px-5 py-2">Approval</th></tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((r) => (
              <tr key={r.user_id}>
                <td className="px-5 py-3">
                  <div className="font-semibold">{r.profiles?.full_name || "—"}</div>
                  <div className="text-xs text-muted-foreground">{r.profiles?.email}</div>
                </td>
                <td className="px-5 py-3">Tier {r.tier}</td>
                <td className="px-5 py-3 capitalize">{r.status}</td>
                <td className="px-5 py-3 capitalize">{r.availability}</td>
                <td className="px-5 py-3">{r.tasks_completed}</td>
                <td className="px-5 py-3">{r.approval_rate}%</td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={6} className="px-5 py-8 text-center text-sm text-muted-foreground">No talents yet. Invite one above.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}