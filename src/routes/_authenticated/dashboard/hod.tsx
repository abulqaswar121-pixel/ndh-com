import { createFileRoute, redirect } from "@tanstack/react-router";

// Collapsed per handoff 5C -> academy-director
export const Route = createFileRoute("/_authenticated/dashboard/hod")({
  beforeLoad: () => { throw redirect({ to: "/dashboard/academy-director", search: { tab: undefined } }); },
});