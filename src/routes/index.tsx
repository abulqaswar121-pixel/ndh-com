import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight, Search, Palette, Code2, PenTool, Megaphone, Clapperboard, Brain,
  Camera, LineChart, ShieldCheck, BadgeCheck, Lock, Timer, ChevronDown,
} from "lucide-react";
import { useState } from "react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Section } from "@/components/site/Section";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Najeeb Digital Hub — Hire vetted digital talent" },
      { name: "description", content: "Hire vetted digital talent across design, engineering, marketing and media. Managed delivery, secure payments, quality-checked work." },
      { property: "og:title", content: "Najeeb Digital Hub" },
      { property: "og:description", content: "Vetted digital talent, managed delivery, secure payments." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const categories = [
  { icon: Palette, title: "Design", desc: "Brand, UI/UX, social" },
  { icon: Code2, title: "Development", desc: "Web, mobile, APIs" },
  { icon: PenTool, title: "Writing", desc: "Copy, SEO, scripts" },
  { icon: Megaphone, title: "Marketing", desc: "Ads, SEO, growth" },
  { icon: Clapperboard, title: "Video & Motion", desc: "Edit, motion, ads" },
  { icon: Camera, title: "Photo & Media", desc: "Photography, podcast" },
  { icon: LineChart, title: "Data & Analytics", desc: "Dashboards, reports" },
  { icon: Brain, title: "AI & Automation", desc: "Agents, integrations" },
];

const steps = [
  { n: "01", title: "Brief your project", desc: "Post a project or search the talent directory. It's free to get started." },
  { n: "02", title: "Get matched", desc: "A project manager scopes your brief and assigns vetted specialists within 24 hours." },
  { n: "03", title: "Review and pay", desc: "Approve milestones as they ship. Payments release only when you sign off." },
];

const why = [
  { icon: BadgeCheck, title: "Vetted specialists", desc: "Every talent is interviewed, tested, and tiered before entering the roster." },
  { icon: ShieldCheck, title: "Quality-checked delivery", desc: "A PM runs QA, revisions, and hand-off — you never chase a freelancer." },
  { icon: Lock, title: "Secure payments", desc: "Funds are held per milestone and released only after you approve the work." },
  { icon: Timer, title: "Predictable timelines", desc: "Response &lt; 4 business hours. Clear scopes and dates before we start." },
];

function Index() {
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({ to: "/services", search: q ? { q } as any : {} });
  };

  return (
    <SiteLayout>
      {/* HERO — search-first */}
      <section className="border-b border-border bg-background">
        <div className="mx-auto max-w-5xl px-6 py-20 text-center sm:py-28">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Vetted digital talent · Managed delivery</div>
          <h1 className="mx-auto mt-4 max-w-3xl text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
            Hire vetted digital talent for your next project.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">
            Design, engineering, marketing, and media specialists — matched, managed, and quality-checked by NDH.
          </p>
          <form onSubmit={submit} className="mx-auto mt-8 flex max-w-2xl items-center gap-2 rounded-full border border-border bg-card p-1.5 shadow-elegant">
            <div className="pl-4 text-muted-foreground"><Search className="h-4 w-4" /></div>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Try “logo design”, “landing page”, “SEO article”…"
              aria-label="Search services"
              className="flex-1 bg-transparent px-2 py-2 text-sm focus:outline-none"
            />
            <Button type="submit" variant="brand" className="rounded-full px-5">Search</Button>
          </form>
          <div className="mx-auto mt-6 flex max-w-2xl flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><BadgeCheck className="h-3.5 w-3.5 text-primary" /> Vetted talent</span>
            <span className="inline-flex items-center gap-1.5"><Lock className="h-3.5 w-3.5 text-primary" /> Secure payments</span>
            <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-primary" /> Quality-checked delivery</span>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <Section eyebrow="Browse categories" title="Find the right specialist for your work.">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((c) => (
            <Link
              key={c.title}
              to="/services"
              className="group flex items-start gap-3 rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/50"
            >
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-secondary text-primary">
                <c.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold">{c.title}</div>
                <div className="text-xs text-muted-foreground">{c.desc}</div>
              </div>
              <ArrowRight className="ml-auto h-4 w-4 self-center text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
            </Link>
          ))}
        </div>
      </Section>

      {/* HOW IT WORKS */}
      <Section eyebrow="How it works" title="From brief to delivery in three steps.">
        <div className="grid gap-4 md:grid-cols-3">
          {steps.map((s) => (
            <div key={s.n} className="rounded-lg border border-border bg-card p-6">
              <div className="text-xs font-semibold text-primary">{s.n}</div>
              <div className="mt-2 text-base font-semibold">{s.title}</div>
              <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* WHY — bento */}
      <Section eyebrow="Why NDH" title="Built for teams that can't afford freelancer roulette.">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {why.map((f) => (
            <div key={f.title} className="rounded-lg border border-border bg-card p-6">
              <div className="grid h-9 w-9 place-items-center rounded-md bg-secondary text-primary">
                <f.icon className="h-4 w-4" />
              </div>
              <div className="mt-4 text-sm font-semibold">{f.title}</div>
              <p className="mt-1.5 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ACADEMY TEASER */}
      <Section>
        <div className="grid items-center gap-8 rounded-xl border border-border bg-secondary/40 p-8 lg:grid-cols-[1fr_auto]">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">NDH Academy</div>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Train with the same standards our bureau delivers.</h3>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Six AI-focused schools. Certificate, diploma, and professional tracks with mentorship, projects, and career support.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/academy"><Button variant="brand">Explore Academy <ArrowRight className="h-4 w-4" /></Button></Link>
            <Link to="/verify"><Button variant="outline">Verify a certificate</Button></Link>
          </div>
        </div>
      </Section>

      {/* CTA */}
      <Section>
        <div className="rounded-xl border border-border bg-primary p-10 text-primary-foreground sm:p-14">
          <div className="grid items-center gap-6 lg:grid-cols-[1fr_auto]">
            <div>
              <h3 className="text-2xl font-semibold sm:text-3xl">Ready to brief your project?</h3>
              <p className="mt-2 max-w-xl text-sm text-primary-foreground/80">Scope for free. A PM responds within 4 business hours.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link to="/start-project"><Button variant="hero" size="lg">Post a project <ArrowRight className="h-4 w-4" /></Button></Link>
              <Link to="/talent"><Button variant="outline" size="lg" className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white">Browse talent</Button></Link>
            </div>
          </div>
        </div>
      </Section>
    </SiteLayout>
  );
}