import { createFileRoute } from "@tanstack/react-router";
import { PmShell } from "@/components/dashboard/pm/PmShell";

export const Route = createFileRoute("/_authenticated/dashboard/super-admin")({
  component: () => <PmShell title="Super Admin Portal" />,
});