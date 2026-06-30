import { createFileRoute } from "@tanstack/react-router";
import { InstructorShell } from "@/components/dashboard/instructor/InstructorShell";

export const Route = createFileRoute("/_authenticated/dashboard/instructor")({
  component: InstructorShell,
  validateSearch: (s: Record<string, unknown>) => ({
    tab: (s.tab as string) ?? undefined,
    course: (s.course as string) ?? undefined,
  }),
});