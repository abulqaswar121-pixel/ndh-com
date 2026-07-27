import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Section } from "@/components/site/Section";
import { Reveal, Stagger, StaggerItem } from "@/components/site/Reveal";
import { Button } from "@/components/ui/button";
import { HeartHandshake, Compass, Target, Sparkles, MapPin } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [
    { title: "About — Najeeb Digital Hub" },
    { name: "description", content: "A managed digital bureau and academy connecting global clients with vetted African talent." },
    { property: "og:title", content: "About NDH" },
    { property: "og:description", content: "A managed digital bureau built to deliver reliable digital work to clients worldwide." },
  ]}),
  component: AboutPage,
});

const values = [
  { icon: Sparkles, title: "Craft", desc: "Every deliverable is reviewed against a written quality bar." },
  { icon: HeartHandshake, title: "Trust", desc: "Escrow, milestones and named project managers on every engagement." },
  { icon: Compass, title: "Opportunity", desc: "We build sustainable careers for vetted African digital talent." },
  { icon: Target, title: "Outcomes", desc: "We measure success by the outcomes our clients report, not by hours." },
];

function AboutPage() {
  return (
    <SiteLayout>
      <section className="border-b border-border bg-background py-20">
        <div className="mx-auto max-w-7xl px-6">
          <Reveal>
            <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">About</div>
            <h1 className="mt-3 max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">A managed digital bureau and academy.</h1>
            <p className="mt-4 max-w-2xl text-muted-foreground">Najeeb Digital Hub connects global clients with vetted African talent through project managers, escrowed milestones and a written quality bar — and trains the next generation through NDH Academy.</p>
          </Reveal>
        </div>
      </section>

      <Section eyebrow="Our approach" title="How we operate">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-3 text-sm text-foreground/80">
            <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">01 · Brief</div>
            <p>A project manager scopes your brief with a written statement of work, milestones and a fixed quote — usually within 4 business hours.</p>
          </div>
          <div className="space-y-3 text-sm text-foreground/80">
            <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">02 · Deliver</div>
            <p>A vetted team executes against the SOW. You review incremental milestones; funds are held in escrow and released on approval.</p>
          </div>
          <div className="space-y-3 text-sm text-foreground/80">
            <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">03 · Handover</div>
            <p>Every deliverable ships with source files, documentation and a written QA sign-off. Post-delivery support is available on request.</p>
          </div>
        </div>
      </Section>

      <Section eyebrow="What we believe" title="Our values">
        <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((v) => (
            <StaggerItem key={v.title}>
              <div className="h-full rounded-xl border border-border bg-card p-6">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary"><v.icon className="h-5 w-5" /></div>
                <h3 className="mt-4 font-semibold">{v.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{v.desc}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </Section>

      <Section eyebrow="Coverage" title="Where we work">
        <div className="grid gap-6 lg:grid-cols-2">
          <Reveal>
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center gap-2 text-primary"><MapPin className="h-4 w-4" /><span className="text-xs font-semibold uppercase tracking-widest">Client regions</span></div>
              <ul className="mt-4 grid grid-cols-2 gap-3 text-sm">
                {["Nigeria","United Kingdom","United States","Canada","Germany","France","Netherlands","United Arab Emirates"].map((c) => (
                  <li key={c} className="rounded-lg border border-border bg-secondary/40 px-3 py-2 font-medium">{c}</li>
                ))}
              </ul>
              <p className="mt-4 text-xs text-muted-foreground">Headquartered in Nigeria. All engagements run in the client's business hours.</p>
            </div>
          </Reveal>
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Working languages</div>
            <ul className="mt-4 grid grid-cols-2 gap-3 text-sm">
              {["English","French","Arabic","Hausa"].map((c) => (
                <li key={c} className="rounded-lg border border-border bg-secondary/40 px-3 py-2 font-medium">{c}</li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-muted-foreground">Contracts and invoices are issued in USD, GBP, EUR or NGN.</p>
          </div>
        </div>
      </Section>

      <Section eyebrow="Ready to start" title="Talk to a project manager">
        <div className="flex flex-wrap items-center gap-3">
          <Link to="/start-project"><Button variant="brand">Start a project</Button></Link>
          <Link to="/contact"><Button variant="outline">Get in touch</Button></Link>
        </div>
      </Section>
    </SiteLayout>
  );
}