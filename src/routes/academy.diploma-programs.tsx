import { createFileRoute } from "@tanstack/react-router";
import { ProgramCategoryPage } from "@/components/academy/ProgramCategoryPage";

export const Route = createFileRoute("/academy/diploma-programs")({
  head: () => ({ meta: [
    { title: "Diploma Programs (6 Months) — NDH Academy" },
    { name: "description", content: "Eight 6-month diploma programs across digital marketing, design, dev, data and more — ₦120,000 tuition." },
    { property: "og:title", content: "NDH Academy — Diploma Programs" },
    { property: "og:description", content: "Two-semester diploma programs with assessments, capstone projects and verifiable credentials." },
  ]}),
  component: () => (
    <ProgramCategoryPage
      programType="diploma"
      tier="Diploma Programs"
      duration="6-month"
      blurb="Comprehensive two-semester training combining theory and hands-on projects. Graduates qualify for the NDH talent pool."
    />
  ),
});