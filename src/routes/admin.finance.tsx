import { createFileRoute } from "@tanstack/react-router";
import { DashboardStub } from "@/components/site/DashboardStub";
export const Route = createFileRoute("/admin/finance")({
  head: () => ({ meta: [{ title: "Finance Admin — NDH" }] }),
  component: () => (
    <DashboardStub
      role="Finance Admin"
      title="Money in. Money out. Audit-ready."
      accent="navy"
      description="Client invoicing, escrow holds, weekly talent payroll and academy tuition reconciliation."
      features={[
        "Client invoices & receipts",
        "Escrow ledger per task",
        "Weekly talent payroll runs",
        "Tuition collection (multi-currency)",
        "Revenue & expense reports",
        "Tax exports",
      ]}
    />
  ),
});