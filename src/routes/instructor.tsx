import { createFileRoute } from "@tanstack/react-router";
import { DashboardStub } from "@/components/site/DashboardStub";
export const Route = createFileRoute("/instructor")({
  head: () => ({ meta: [{ title: "Instructor Portal — NDH Academy" }] }),
  component: () => (
    <DashboardStub
      role="NDH Academy · Instructor"
      title="Teach. Grade. Mentor."
      accent="purple"
      description="Manage your cohorts, post lessons, grade assignments, run live classes and message students."
      features={[
        "My cohorts & rosters",
        "Lesson planner with video upload",
        "Assignment & exam authoring",
        "Grade book with auto-GPA",
        "Live class scheduling & attendance",
        "Student messaging & office hours",
      ]}
    />
  ),
});