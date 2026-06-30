import { createFileRoute } from "@tanstack/react-router";
import { DashboardStub } from "@/components/site/DashboardStub";
export const Route = createFileRoute("/admin/student-affairs")({
  head: () => ({ meta: [{ title: "Student Affairs — NDH Academy" }] }),
  component: () => (
    <DashboardStub
      role="Student Affairs"
      title="Support every student."
      accent="teal"
      description="Welfare, discipline, scholarships, IDs and student communication."
      features={[
        "Student welfare tickets",
        "Scholarship management",
        "Student ID issuance",
        "Conduct & discipline",
        "Cohort-wide announcements",
        "Alumni network",
      ]}
    />
  ),
});