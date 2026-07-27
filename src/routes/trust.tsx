import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Section } from "@/components/site/Section";
import { ShieldCheck, BadgeCheck, Lock, Timer, FileCheck2, MessageSquare } from "lucide-react";

export const Route = createFileRoute("/trust")({
  head: () => ({
    meta: [
      { title: "Trust & Safety — Najeeb Digital Hub" },
      { name: "description", content: "How NDH vets talent, protects payments, runs quality assurance, and handles disputes." },
      { property: "og:title", content: "Trust & Safety — NDH" },
      { property: "og:description", content: "Vetting, quality assurance, secure payments, and dispute handling at Najeeb Digital Hub." },
    ],
  }),
  component: TrustPage,
});

const pillars = [
  { icon: BadgeCheck, title: "Talent vetting", body: "Every talent completes a portfolio review, a live task assessment, and a communication interview before entering the roster. Tiers are re-evaluated quarterly against delivered work." },
  { icon: ShieldCheck, title: "Quality assurance", body: "A project manager scopes each brief, reviews every deliverable, and runs revision rounds before hand-off. You are not the QA layer — we are." },
  { icon: Lock, title: "Secure payments", body: "Funds are held per milestone and released only after you approve the work. Refunds follow our published Refund Policy." },
  { icon: Timer, title: "Response commitment", body: "Every account gets a written response within 4 business hours (Mon–Sat). Active projects get same-day status updates." },
  { icon: FileCheck2, title: "Confidentiality", body: "NDAs are signed on request. Talent only sees the scope for their assigned task, not client-identifying details, unless you approve." },
  { icon: MessageSquare, title: "Dispute handling", body: "If a deliverable misses spec, escalate in-thread. The PM re-briefs the talent or reassigns at no cost. Unresolved disputes go to founder review within 48 hours." },
];

function TrustPage() {
  return (
    <SiteLayout>
      <section className="border-b border-border bg-secondary/40">
        <div className="mx-auto max-w-4xl px-6 py-16 text-center">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Trust & Safety</div>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">How we keep your work — and your money — safe.</h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">This page is maintained by Najeeb Digital Hub. It describes the controls we enforce today, not certifications we hold.</p>
        </div>
      </section>
      <Section>
        <div className="grid gap-4 sm:grid-cols-2">
          {pillars.map((p) => (
            <div key={p.title} className="rounded-lg border border-border bg-card p-6">
              <div className="grid h-9 w-9 place-items-center rounded-md bg-secondary text-primary"><p.icon className="h-4 w-4" /></div>
              <div className="mt-4 text-sm font-semibold">{p.title}</div>
              <p className="mt-1.5 text-sm text-muted-foreground">{p.body}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 rounded-lg border border-border bg-secondary/40 p-6 text-sm text-muted-foreground">
          Questions or a specific concern? Reach us at <a href="mailto:support@ndh.com.ng" className="font-semibold text-primary hover:underline">support@ndh.com.ng</a> or via the <Link to="/contact" className="font-semibold text-primary hover:underline">contact page</Link>.
        </div>
      </Section>
    </SiteLayout>
  );
}