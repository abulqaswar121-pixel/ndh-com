import { createFileRoute } from "@tanstack/react-router";
import { DashboardStub } from "@/components/site/DashboardStub";
export const Route = createFileRoute("/talent")({
  head: () => ({ meta: [{ title: "Talent Portal — NDH" }] }),
  component: () => (
    <DashboardStub
      role="Talent Portal · invite-only"
      title="Deliver. Earn. Grow your tier."
      accent="purple"
      description="Access your assigned tasks, submit work, track earnings and tier progress. Client identity is masked end-to-end."
      features={[
        "Assigned tasks queue with deadlines",
        "Submit deliverables and revisions",
        "Weekly payroll & earnings history",
        "Tier progression: Junior → Elite (Tier 1–5)",
        "Performance score & QA feedback",
        "PM messaging only — client identity hidden",
      ]}
    />
  ),
});