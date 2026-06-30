import { createFileRoute } from "@tanstack/react-router";
import { DashboardStub } from "@/components/site/DashboardStub";
export const Route = createFileRoute("/client")({
  head: () => ({ meta: [{ title: "Client Portal — NDH" }] }),
  component: () => (
    <DashboardStub
      role="Client Portal"
      title="Your projects, in one place."
      accent="blue"
      description="Submit new tasks, track delivery status, message your PM and manage invoices."
      features={[
        "Submit new tasks via multi-step wizard",
        "Track tasks (Pending → In Progress → Review → Delivered → Completed)",
        "Direct messaging with your Project Manager only",
        "Billing & invoices with downloadable receipts",
        "Profile settings (company, billing, preferences)",
        "Notifications and status updates",
      ]}
    />
  ),
});