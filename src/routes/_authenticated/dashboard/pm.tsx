import { createFileRoute } from "@tanstack/react-router";
import { RoleStub } from "@/components/dashboard/RoleStub";

export const Route = createFileRoute("/_authenticated/dashboard/pm")({
  component: () => <RoleStub title="PM Portal" subtitle="Inbound briefs, quotes and talent assignment." />,
});