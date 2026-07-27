import { createFileRoute, redirect } from "@tanstack/react-router";

// Solo-founder mode: HOD is consolidated into Admin.
export const Route = createFileRoute("/_authenticated/dashboard/hod")({
  beforeLoad: () => { throw redirect({ to: "/dashboard/admin", search: { tab: undefined } }); },
});