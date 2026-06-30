import { createFileRoute } from "@tanstack/react-router";
import { HodShell } from "@/components/dashboard/hod/HodShell";

export const Route = createFileRoute("/_authenticated/dashboard/hod")({
  component: HodShell,
});