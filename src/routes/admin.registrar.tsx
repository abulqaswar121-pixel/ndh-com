import { createFileRoute } from "@tanstack/react-router";
import { DashboardStub } from "@/components/site/DashboardStub";
export const Route = createFileRoute("/admin/registrar")({
  head: () => ({ meta: [{ title: "Registrar — NDH Academy" }] }),
  component: () => (
    <DashboardStub
      role="Academy Registrar"
      title="Records. Results. Transcripts."
      accent="navy"
      description="Admissions, transcripts, grade approvals and certificate issuance."
      features={[
        "Admissions queue & decisions",
        "Student records & transcripts",
        "Grade approval workflow",
        "Certificate issuance with QR",
        "Public verification database",
        "Transfer & withdrawal handling",
      ]}
    />
  ),
});