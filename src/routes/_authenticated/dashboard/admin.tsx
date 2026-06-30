import { createFileRoute } from "@tanstack/react-router";
import { PmShell } from "@/components/dashboard/pm/PmShell";

export const Route = createFileRoute("/_authenticated/dashboard/admin")({
  component: () => <PmShell title="Admin Portal" />,
});