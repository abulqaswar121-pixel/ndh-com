import { createFileRoute, redirect } from "@tanstack/react-router";
export const Route = createFileRoute("/admin/academy")({
  beforeLoad: () => { throw redirect({ to: "/dashboard/academy-director" }); },
});
