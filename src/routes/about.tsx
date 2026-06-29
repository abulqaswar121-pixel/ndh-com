import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Section } from "@/components/site/Section";
import { HeartHandshake, Compass, Target, Sparkles } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [
    { title: "About — Najeeb Digital Hub" },
    { name: "description", content: "Our story, vision and the team behind NDH." },
    { property: "og:title", content: "About NDH" },
    { property: "og:description", content: "A bureau model built to deliver world-class digital work from Nigeria, for the world." },
  ]}),
  component: AboutPage,
});

const values = [
  { icon: Sparkles, title: "Excellence", desc: "We obsess over craft, polish and delivery." },
  { icon: HeartHandshake, title: "Trust", desc: "Escrow, QA and clear PMs — no surprises." },
  { icon: Compass, title: "Opportunity", desc: "We open real careers for African digital talent." },
  { icon: Target, title: "Outcomes", desc: "We measure ourselves by what your business achieves." },
];

function AboutPage() {
  return (
    <SiteLayout>
      <section className="bg-hero py-20 text-white">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-xs font-semibold uppercase tracking-widest text-white/70">About NDH</div>
          <h1 className="mt-3 max-w-3xl text-4xl font-extrabold sm:text-5xl">A digital bureau and academy built for the next generation.</h1>
          <p className="mt-4 max-w-2xl text-white/75">We bridge global demand for great digital work with Africa's best emerging talent — and we train the rest.</p>
        </div>
      </section>

      <Section eyebrow="Our story" title="From a small studio to a multi-department bureau.">
        <div className="prose prose-neutral max-w-none text-foreground/80 dark:prose-invert">
          <p>Najeeb Digital Hub started with a simple belief: African creators and engineers can produce work that competes anywhere in the world — if they are properly trained, properly managed and properly paid.</p>
          <p>Today, NDH operates as a managed digital bureau with a sister academy. Clients across Nigeria, the UK, US, Canada, Europe and the UAE send us briefs; our Project Managers translate them into work; our vetted in-house talents deliver; our QA ships it. Meanwhile, NDH Academy continuously trains the next wave of professionals.</p>
        </div>
      </Section>

      <Section eyebrow="What we believe" title="Our values">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((v) => (
            <div key={v.title} className="rounded-2xl border border-border bg-card p-6">
              <v.icon className="h-6 w-6 text-[oklch(0.65_0.19_252)]" />
              <h3 className="mt-4 font-bold">{v.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{v.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section eyebrow="Founder" title="Built with vision and discipline.">
        <div className="grid items-center gap-8 md:grid-cols-[200px_1fr]">
          <div className="grid h-48 w-48 place-items-center rounded-3xl bg-gradient-brand text-5xl font-black text-white shadow-glow">NA</div>
          <div>
            <div className="text-xl font-bold">Najeeb — Founder & CEO</div>
            <p className="mt-3 max-w-2xl text-muted-foreground">"We're building NDH like a serious tech company — measurable quality, fair pay for talents, and outcomes our clients can feel."</p>
          </div>
        </div>
      </Section>
    </SiteLayout>
  );
}