import { createFileRoute, redirect } from "@tanstack/react-router";
export const Route = createFileRoute("/admin/operations")({
  beforeLoad: () => { throw redirect({ to: "/dashboard/super-admin" }); },
});
