import { createFileRoute } from "@tanstack/react-router";
import { DashboardStub } from "@/components/site/DashboardStub";
export const Route = createFileRoute("/admin/pm")({
  head: () => ({ meta: [{ title: "PM Dashboards — NDH" }] }),
  component: () => (
    <DashboardStub
      role="Project Managers"
      title="Run every engagement, every department."
      accent="blue"
      description="Department-specific PM dashboards for Design, Development, Content, Marketing and Media."
      features={[
        "Design PM — briefs, files, QA",
        "Development PM — sprints, repos, deploys",
        "Content PM — editorial calendar & drafts",
        "Marketing PM — campaigns & reporting",
        "Media PM — production pipeline",
        "Cross-department escalation & talent assignment",
      ]}
    />
  ),
});