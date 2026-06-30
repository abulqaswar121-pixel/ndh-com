import { createFileRoute } from "@tanstack/react-router";
import { DashboardStub } from "@/components/site/DashboardStub";
export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Super Admin — NDH" }] }),
  component: () => (
    <DashboardStub
      role="Super Admin"
      title="The whole company, at a glance."
      accent="navy"
      description="Org-wide controls: users, roles, departments, finance, academy and operations."
      features={[
        "Org metrics & live operations feed",
        "User & role management (Bureau + Academy)",
        "Department configuration",
        "Finance overview & payouts",
        "Academy enrollment & cohort stats",
        "Audit logs & security",
      ]}
    />
  ),
});