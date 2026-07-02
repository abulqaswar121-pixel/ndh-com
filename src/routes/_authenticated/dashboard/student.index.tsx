import { createFileRoute, useNavigate, useRouterState } from "@tanstack/react-router";
import { DashboardShell, type NavItem } from "@/components/dashboard/Sidebar";
import { LayoutDashboard, BookOpen, Award, Settings as SettingsIcon, Compass } from "lucide-react";
import { StudentOverview } from "@/components/dashboard/student/Overview";
import { MyCourses } from "@/components/dashboard/student/MyCourses";
import { Certificates } from "@/components/dashboard/student/Certificates";
import { StudentSettings } from "@/components/dashboard/student/Settings";
import { BrowseCourses } from "@/components/dashboard/student/BrowseCourses";

export const Route = createFileRoute("/_authenticated/dashboard/student/")({
  validateSearch: (s: Record<string, unknown>) => ({ tab: (s.tab as string) || undefined }),
  component: StudentDashboardPage,
});

const NAV: NavItem[] = [
  { label: "Dashboard", to: "/dashboard/student", icon: LayoutDashboard },
  { label: "Browse Courses", to: "/dashboard/student", search: { tab: "browse" }, icon: Compass },
  { label: "My Courses", to: "/dashboard/student", search: { tab: "courses" }, icon: BookOpen },
  { label: "Certificates", to: "/dashboard/student", search: { tab: "certificates" }, icon: Award },
  { label: "Settings", to: "/dashboard/student", search: { tab: "settings" }, icon: SettingsIcon },
];

function StudentDashboardPage() {
  const search = useRouterState({ select: (r) => r.location.search as { tab?: string } });
  const navigate = useNavigate();
  const tab = search.tab ?? "overview";

  return (
    <DashboardShell title="Student Portal" items={NAV}>
      {tab === "overview" && <StudentOverview onBrowse={() => navigate({ to: "/dashboard/student", search: { tab: "browse" } })} />}
      {tab === "browse" && <BrowseCourses />}
      {tab === "courses" && <MyCourses />}
      {tab === "certificates" && <Certificates />}
      {tab === "settings" && <StudentSettings />}
    </DashboardShell>
  );
}