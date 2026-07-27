import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/dashboard/registrar")({
  beforeLoad: () => { throw redirect({ to: "/dashboard/academy-director", search: { tab: undefined } }); },
});