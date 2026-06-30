import { createFileRoute, redirect } from "@tanstack/react-router";
export const Route = createFileRoute("/admin/finance")({
  beforeLoad: () => { throw redirect({ to: "/dashboard/finance" }); },
});
