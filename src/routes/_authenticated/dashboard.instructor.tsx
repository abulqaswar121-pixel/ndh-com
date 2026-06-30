import { createFileRoute } from "@tanstack/react-router";
import { RoleStub } from "@/components/dashboard/RoleStub";

export const Route = createFileRoute("/_authenticated/dashboard/instructor")({
  component: () => <RoleStub title="Instructor Portal" subtitle="Cohorts, lessons and grading." />,
});