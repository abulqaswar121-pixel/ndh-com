import { createFileRoute, redirect } from "@tanstack/react-router";
export const Route = createFileRoute("/admin/hod")({
  beforeLoad: () => { throw redirect({ to: "/dashboard/hod" }); },
});
