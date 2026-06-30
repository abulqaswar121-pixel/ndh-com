import { createFileRoute } from "@tanstack/react-router";
import { ProgramCategoryPage } from "@/components/academy/ProgramCategoryPage";

export const Route = createFileRoute("/academy/professional-programs")({
  head: () => ({ meta: [
    { title: "Professional Programs (12 Months) — NDH Academy" },
    { name: "description", content: "Five 12-month professional programs equivalent to a year-long industry apprenticeship — ₦250,000 tuition." },
    { property: "og:title", content: "NDH Academy — Professional Programs" },
    { property: "og:description", content: "Year-long advanced programs with internship at the NDH Bureau and a capstone project." },
  ]}),
  component: () => (
    <ProgramCategoryPage
      programType="professional"
      tier="Professional Programs"
      duration="12-month"
      blurb="Advanced, in-depth training equivalent to a year-long industry apprenticeship. Includes specialization, mentorship and an NDH Bureau internship."
    />
  ),
});