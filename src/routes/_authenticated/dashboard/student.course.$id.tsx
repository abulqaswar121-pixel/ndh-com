import { createFileRoute, redirect } from "@tanstack/react-router";

// Retired: superseded by /academy/learn/$slug per handoff 6
export const Route = createFileRoute("/_authenticated/dashboard/student/course/$id")({
  beforeLoad: () => { throw redirect({ to: "/dashboard/student", search: { tab: "courses" } }); },
});
