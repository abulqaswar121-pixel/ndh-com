import { createFileRoute, redirect } from "@tanstack/react-router";
export const Route = createFileRoute("/academy/professional-programs")({
  beforeLoad: () => { throw redirect({ to: "/academy" }); },
});
