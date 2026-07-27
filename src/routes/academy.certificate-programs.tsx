import { createFileRoute, redirect } from "@tanstack/react-router";
export const Route = createFileRoute("/academy/certificate-programs")({
  beforeLoad: () => { throw redirect({ to: "/academy" }); },
});
import { ProgramCategoryPage } from "@/components/academy/ProgramCategoryPage";

export const Route = createFileRoute("/academy/certificate-programs")({
  head: () => ({ meta: [
    { title: "Certificate Programs (3 Months) — NDH Academy" },
    { name: "description", content: "Eight 3-month certificate programs in design, content, tech, marketing and AI — ₦45,000 tuition." },
    { property: "og:title", content: "NDH Academy — Certificate Programs" },
    { property: "og:description", content: "Short, intensive 3-month programs with verifiable certificates." },
  ]}),
  component: () => (
    <ProgramCategoryPage
      programType="certificate"
      tier="Certificate Programs"
      duration="3-month"
      blurb="Focused, intensive training to give you a marketable skill quickly. Eight programs, all delivered live + recorded with weekly shipped projects."
    />
  ),
});