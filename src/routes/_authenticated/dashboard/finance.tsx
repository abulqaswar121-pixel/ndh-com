import { createFileRoute } from "@tanstack/react-router";
import { FinanceShell } from "@/components/dashboard/finance/FinanceShell";

export const Route = createFileRoute("/_authenticated/dashboard/finance")({
  component: () => <FinanceShell />,
});