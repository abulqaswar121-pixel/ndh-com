import { createFileRoute, useNavigate, useRouterState } from "@tanstack/react-router";
import { DashboardShell, type NavItem } from "@/components/dashboard/Sidebar";
import { LayoutDashboard, ListTodo, Upload, Wallet, Award, BarChart3, MessageSquare, GraduationCap, Settings as SettingsIcon } from "lucide-react";
import { useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ensureTalentProfile } from "@/lib/talent/talent.functions";
import { TalentOverview } from "@/components/dashboard/talent/Overview";
import { MyTasks } from "@/components/dashboard/talent/MyTasks";
import { TalentEarnings } from "@/components/dashboard/talent/Earnings";
import { TalentTier } from "@/components/dashboard/talent/Tier";
import { TalentPerformance } from "@/components/dashboard/talent/Performance";
import { TalentMessages } from "@/components/dashboard/talent/Messages";
import { TalentAcademy } from "@/components/dashboard/talent/Academy";
import { TalentSettings } from "@/components/dashboard/talent/Settings";

export const Route = createFileRoute("/_authenticated/dashboard/talent")({
  validateSearch: (s: Record<string, unknown>) => ({ tab: (s.tab as string) || undefined, task: (s.task as string) || undefined }),
  component: TalentDashboardPage,
});

const NAV: NavItem[] = [
  { label: "Dashboard", to: "/dashboard/talent", icon: LayoutDashboard },
  { label: "My Tasks", to: "/dashboard/talent", search: { tab: "tasks" }, icon: ListTodo },
  { label: "Submit Work", to: "/dashboard/talent", search: { tab: "submit" }, icon: Upload },
  { label: "My Earnings", to: "/dashboard/talent", search: { tab: "earnings" }, icon: Wallet },
  { label: "My Tier & Rank", to: "/dashboard/talent", search: { tab: "tier" }, icon: Award },
  { label: "My Performance", to: "/dashboard/talent", search: { tab: "performance" }, icon: BarChart3 },
  { label: "Messages", to: "/dashboard/talent", search: { tab: "messages" }, icon: MessageSquare },
  { label: "NDH Academy", to: "/dashboard/talent", search: { tab: "academy" }, icon: GraduationCap },
  { label: "Settings", to: "/dashboard/talent", search: { tab: "settings" }, icon: SettingsIcon },
];

function TalentDashboardPage() {
  const search = useRouterState({ select: (r) => r.location.search as { tab?: string } });
  const navigate = useNavigate();
  const tab = search.tab ?? "overview";
  const ensure = useServerFn(ensureTalentProfile);

  useEffect(() => { (ensure as any)().catch(() => {}); // eslint-disable-next-line
  }, []);

  const go = (t?: string) => navigate({ to: "/dashboard/talent", search: t ? { tab: t } : {} });

  return (
    <DashboardShell title="Talent Portal" items={NAV}>
      {tab === "overview" && <TalentOverview onTasks={() => go("tasks")} />}
      {(tab === "tasks" || tab === "submit") && <MyTasks />}
      {tab === "earnings" && <TalentEarnings />}
      {tab === "tier" && <TalentTier />}
      {tab === "performance" && <TalentPerformance />}
      {tab === "messages" && <TalentMessages />}
      {tab === "academy" && <TalentAcademy />}
      {tab === "settings" && <TalentSettings />}
    </DashboardShell>
  );
}