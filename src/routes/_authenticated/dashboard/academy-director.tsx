import { createFileRoute } from "@tanstack/react-router";
import { DirectorShell } from "@/components/dashboard/director/DirectorShell";

export const Route = createFileRoute("/_authenticated/dashboard/academy-director")({
  component: () => <DirectorShell />,
});