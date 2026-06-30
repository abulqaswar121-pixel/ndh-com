import { createFileRoute, redirect } from "@tanstack/react-router";
export const Route = createFileRoute("/talent")({ beforeLoad: () => { throw redirect({ to: "/dashboard/talent" }); } });
