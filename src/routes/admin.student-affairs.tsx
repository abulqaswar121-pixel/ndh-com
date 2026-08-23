import { createFileRoute, redirect } from "@tanstack/react-router";
export const Route = createFileRoute("/admin/student-affairs")({
  beforeLoad: () => { throw redirect({ to: "/dashboard/academy-director" }); },
});
