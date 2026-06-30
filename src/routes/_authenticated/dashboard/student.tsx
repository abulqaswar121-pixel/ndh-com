import { createFileRoute } from "@tanstack/react-router";
import { RoleStub } from "@/components/dashboard/RoleStub";

export const Route = createFileRoute("/_authenticated/dashboard/student")({
  component: () => <RoleStub title="Student Portal" subtitle="Your courses, lessons, exams and certificates." />,
});