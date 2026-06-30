import { createFileRoute } from "@tanstack/react-router";
import { RoleStub } from "@/components/dashboard/RoleStub";

export const Route = createFileRoute("/_authenticated/dashboard/hod")({
  component: () => <RoleStub title="HOD Portal" subtitle="Department-wide pipeline, QA and capacity." />,
});