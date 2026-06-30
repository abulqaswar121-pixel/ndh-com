import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/dashboard/admin/AdminShell";

export const Route = createFileRoute("/_authenticated/dashboard/super-admin")({
  component: () => <AdminShell title="Super Admin Portal" isSuper />,
});