import { createFileRoute } from "@tanstack/react-router";
import { RoleStub } from "@/components/dashboard/RoleStub";

export const Route = createFileRoute("/_authenticated/dashboard/admin")({
  component: () => <RoleStub title="Admin Portal" subtitle="Users, departments, finance and academy." />,
});