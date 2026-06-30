import { createFileRoute } from "@tanstack/react-router";
import { DashboardStub } from "@/components/site/DashboardStub";
export const Route = createFileRoute("/student")({
  head: () => ({ meta: [{ title: "Student Portal — NDH Academy" }] }),
  component: () => (
    <DashboardStub
      role="NDH Academy · Student Portal"
      title="Your learning, your career."
      accent="teal"
      description="My courses, live classes, assignments, exams, grades, certificates and a forum — all in one academy dashboard."
      features={[
        "My courses with progress tracking",
        "Course player (video, notes, PDFs)",
        "Live class schedule with reminders",
        "Assignments, tests & exams",
        "Grades, transcripts & GPA",
        "Certificates (PDF + QR verification)",
        "Discussion forum & instructor messaging",
        "Digital student ID card + tuition payments",
      ]}
    />
  ),
});