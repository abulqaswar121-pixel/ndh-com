import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Section } from "@/components/site/Section";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

const faqs = [
  { q: "How is NDH different from a freelance marketplace?", a: "We are a managed bureau. You never have to find or chase a freelancer — your PM does that." },
  { q: "Do I talk to talents directly?", a: "No. To protect quality, talents only communicate with their PM. You only talk to your PM." },
  { q: "How much does a project cost?", a: "Quotes are tailored to your brief and tier. Submit a task and a PM will respond within 24 hours." },
  { q: "Which currencies do you accept?", a: "We bill in NGN, USD, GBP, EUR, CAD and AED depending on your region." },
  { q: "How are talents paid?", a: "Talents are paid weekly to their bank accounts after QA-approved delivery." },
  { q: "Are NDH Academy certificates verifiable?", a: "Yes — every certificate has a unique ID and QR code, verifiable at /verify." },
];

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — Najeeb Digital Hub" },
      { name: "description", content: "Answers to common questions about NDH services, academy and talents." },
      { property: "og:title", content: "Frequently Asked Questions · Najeeb Digital Hub" },
      { property: "og:description", content: "How NDH's managed bureau works, project pricing across regions, PM-only communication, talent payouts, and how to verify NDH Academy certificates." },
    ],
    scripts: [{
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      }),
    }],
  }),
  component: FaqPage,
});

function FaqPage() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <SiteLayout>
      <section className="bg-hero py-20 text-white">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-xs font-semibold uppercase tracking-widest text-white/70">FAQ</div>
          <h1 className="mt-3 text-4xl font-extrabold sm:text-5xl">Frequently asked questions.</h1>
        </div>
      </section>
      <Section>
        <div className="mx-auto max-w-3xl divide-y divide-border rounded-2xl border border-border bg-card">
          {faqs.map((f, i) => (
            <button key={f.q} onClick={() => setOpen(open === i ? null : i)} className="block w-full px-6 py-5 text-left">
              <div className="flex items-center justify-between gap-4">
                <span className="font-semibold">{f.q}</span>
                <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${open === i ? "rotate-180" : ""}`} />
              </div>
              {open === i && <p className="mt-3 text-sm text-muted-foreground">{f.a}</p>}
            </button>
          ))}
        </div>
      </Section>
    </SiteLayout>
  );
}