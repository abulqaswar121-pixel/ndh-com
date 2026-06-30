import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { DashboardShell, type NavItem } from "@/components/dashboard/Sidebar";
import {
  LayoutDashboard, Plus, ListTodo, MessageSquare, Wallet, Settings as SettingsIcon, Bell,
} from "lucide-react";
import { useRouterState } from "@tanstack/react-router";
import { ClientOverview } from "@/components/dashboard/client/Overview";
import { SubmitTaskWizard } from "@/components/dashboard/client/SubmitTaskWizard";
import { MyTasks } from "@/components/dashboard/client/MyTasks";
import { ClientMessages } from "@/components/dashboard/client/Messages";
import { ClientBilling } from "@/components/dashboard/client/Billing";
import { ClientSettings } from "@/components/dashboard/client/Settings";
import { ClientNotifications } from "@/components/dashboard/client/Notifications";

export const Route = createFileRoute("/_authenticated/dashboard/client")({
  validateSearch: (s: Record<string, unknown>) => ({
    tab: (s.tab as string) || undefined,
    task: (s.task as string) || undefined,
  }),
  component: ClientDashboardPage,
});

const NAV: NavItem[] = [
  { label: "Dashboard", to: "/dashboard/client", icon: LayoutDashboard },
  { label: "Submit a Task", to: "/dashboard/client", search: { tab: "submit" }, icon: Plus },
  { label: "My Tasks", to: "/dashboard/client", search: { tab: "tasks" }, icon: ListTodo },
  { label: "Messages", to: "/dashboard/client", search: { tab: "messages" }, icon: MessageSquare },
  { label: "Billing & Invoices", to: "/dashboard/client", search: { tab: "billing" }, icon: Wallet },
  { label: "Notifications", to: "/dashboard/client", search: { tab: "notifications" }, icon: Bell },
  { label: "Profile Settings", to: "/dashboard/client", search: { tab: "settings" }, icon: SettingsIcon },
];

function ClientDashboardPage() {
  const search = useRouterState({ select: (r) => r.location.search as { tab?: string; task?: string } });
  const navigate = useNavigate();
  const tab = search.tab ?? "overview";

  const go = (t?: string) => navigate({ to: "/dashboard/client", search: t ? { tab: t } : {} });

  return (
    <DashboardShell title="Client Portal" items={NAV}>
      {tab === "overview" && <ClientOverview onSubmit={() => go("submit")} onSeeTasks={() => go("tasks")} />}
      {tab === "submit" && <SubmitTaskWizard onDone={() => go("tasks")} />}
      {tab === "tasks" && <MyTasks />}
      {tab === "messages" && <ClientMessages />}
      {tab === "billing" && <ClientBilling />}
      {tab === "notifications" && <ClientNotifications />}
      {tab === "settings" && <ClientSettings />}
    </DashboardShell>
  );
}