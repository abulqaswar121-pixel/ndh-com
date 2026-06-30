import { createFileRoute } from "@tanstack/react-router";
import { DashboardStub } from "@/components/site/DashboardStub";
export const Route = createFileRoute("/admin/operations")({
  head: () => ({ meta: [{ title: "Operations Manager — NDH" }] }),
  component: () => (
    <DashboardStub
      role="Operations Manager"
      title="Make the bureau run on time."
      accent="blue"
      description="Cross-department delivery, PM coordination and weekly ops reviews."
      features={[
        "All active tasks (cross-department)",
        "PM assignment & escalation",
        "Delivery KPIs",
        "Capacity & utilisation",
        "Weekly ops review",
        "Incident management",
      ]}
    />
  ),
});