import { createFileRoute, redirect } from "@tanstack/react-router";
export const Route = createFileRoute("/academy/certificate-programs")({
  beforeLoad: () => { throw redirect({ to: "/academy" }); },
});
