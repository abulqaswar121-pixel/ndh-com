import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Section } from "@/components/site/Section";

export const Route = createFileRoute("/refunds")({
  head: () => ({
    meta: [
      { title: "Refund Policy — Najeeb Digital Hub" },
      { name: "description", content: "How refunds work for NDH projects and Academy enrollments." },
      { property: "og:title", content: "Refund Policy — NDH" },
      { property: "og:description", content: "Milestone-based refunds for bureau projects. Cooling-off period for Academy enrollments." },
    ],
  }),
  component: RefundsPage,
});

function RefundsPage() {
  return (
    <SiteLayout>
      <section className="border-b border-border bg-secondary/40">
        <div className="mx-auto max-w-4xl px-6 py-16">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Refund Policy</div>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Fair, milestone-based refunds.</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">Last updated {new Date().getFullYear()}. This policy applies to all NDH bureau projects and Academy enrollments.</p>
        </div>
      </section>
      <Section>
        <div className="prose mx-auto max-w-3xl text-sm text-muted-foreground">
          <h2 className="text-lg font-semibold text-foreground">Bureau projects</h2>
          <p>Payments are collected per milestone. If a milestone is not delivered or fails to meet the written scope, you may request rework or a refund of the outstanding milestone amount within 7 days of delivery.</p>
          <ul className="mt-3 list-disc space-y-1 pl-5">
            <li><b className="text-foreground">Before work begins:</b> full refund, minus any payment-processor fees.</li>
            <li><b className="text-foreground">In progress:</b> unused milestone funds refunded within 10 business days.</li>
            <li><b className="text-foreground">Delivered work:</b> two revision rounds included; further rework is quoted separately.</li>
          </ul>
          <h2 className="mt-8 text-lg font-semibold text-foreground">Academy enrollments</h2>
          <p>Cohort programs offer a 7-day cooling-off period from your enrollment date. Self-paced certificates are refundable if you have completed less than 20% of the material within 14 days.</p>
          <h2 className="mt-8 text-lg font-semibold text-foreground">How to request a refund</h2>
          <p>Email <a className="font-semibold text-primary" href="mailto:support@ndh.com.ng">support@ndh.com.ng</a> with your order or enrollment ID. We respond within 4 business hours and complete valid refunds within 10 business days.</p>
          <p className="mt-8">Related: <Link to="/trust" className="font-semibold text-primary">Trust & Safety</Link> · <Link to="/terms" className="font-semibold text-primary">Terms of Service</Link></p>
        </div>
      </Section>
    </SiteLayout>
  );
}