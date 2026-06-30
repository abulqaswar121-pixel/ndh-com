import { createFileRoute } from "@tanstack/react-router";
import { RegistrarShell } from "@/components/dashboard/registrar/RegistrarShell";

export const Route = createFileRoute("/_authenticated/dashboard/registrar")({
  component: () => <RegistrarShell />,
});