import { createFileRoute } from "@tanstack/react-router";
import { RoleStub } from "@/components/dashboard/RoleStub";

export const Route = createFileRoute("/_authenticated/dashboard/talent")({
  component: () => <RoleStub title="Talent Portal" subtitle="Active briefs, deliverables, payroll and ratings." />,
});