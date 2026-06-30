import { createFileRoute } from "@tanstack/react-router";
import { AffairsShell } from "@/components/dashboard/affairs/AffairsShell";

export const Route = createFileRoute("/_authenticated/dashboard/student-affairs")({
  component: () => <AffairsShell />,
});