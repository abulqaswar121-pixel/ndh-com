import { createFileRoute, redirect } from "@tanstack/react-router";
export const Route = createFileRoute("/academy/diploma-programs")({
  beforeLoad: () => { throw redirect({ to: "/academy" }); },
});
