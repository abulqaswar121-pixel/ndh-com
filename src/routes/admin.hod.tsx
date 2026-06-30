import { createFileRoute } from "@tanstack/react-router";
import { DashboardStub } from "@/components/site/DashboardStub";
export const Route = createFileRoute("/admin/hod")({
  head: () => ({ meta: [{ title: "HOD Dashboards — NDH" }] }),
  component: () => (
    <DashboardStub
      role="Heads of Department"
      title="Own your department's standard."
      accent="purple"
      description="HOD dashboards for Design, Development, Content, Marketing and Media."
      features={[
        "Team roster & tier progression",
        "Quality metrics & QA outcomes",
        "Capacity planning",
        "Talent recruitment requests",
        "Internal training assignment",
        "Cross-department collaboration",
      ]}
    />
  ),
});