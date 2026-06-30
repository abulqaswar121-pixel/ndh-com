import { createFileRoute } from "@tanstack/react-router";
import { RoleStub } from "@/components/dashboard/RoleStub";

export const Route = createFileRoute("/_authenticated/dashboard/super-admin")({
  component: () => <RoleStub title="Super Admin Portal" subtitle="Platform-wide controls and roles." />,
});