import { createFileRoute, redirect } from "@tanstack/react-router";
export const Route = createFileRoute("/admin/pm")({
  beforeLoad: () => { throw redirect({ to: "/dashboard/pm" }); },
});
