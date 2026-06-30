import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/dashboard/admin/AdminShell";

export const Route = createFileRoute("/_authenticated/dashboard/admin")({
  component: () => <AdminShell title="Admin Portal" />,
});