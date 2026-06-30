import { createFileRoute } from "@tanstack/react-router";
import { DashboardStub } from "@/components/site/DashboardStub";
export const Route = createFileRoute("/admin/academy")({
  head: () => ({ meta: [{ title: "Academy Director — NDH" }] }),
  component: () => (
    <DashboardStub
      role="Academy Director"
      title="Run NDH Academy end-to-end."
      accent="teal"
      description="Programs, cohorts, instructors, registrar and student affairs in one console."
      features={[
        "Program & cohort management",
        "Instructor assignment & performance",
        "Curriculum & accreditation",
        "Tuition pricing per region",
        "Graduation & certification pipeline",
        "Student-to-talent pool conversion",
      ]}
    />
  ),
});