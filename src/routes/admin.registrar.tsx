import { createFileRoute, redirect } from "@tanstack/react-router";
export const Route = createFileRoute("/admin/registrar")({
  beforeLoad: () => { throw redirect({ to: "/dashboard/registrar" }); },
});
