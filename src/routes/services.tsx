import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Section } from "@/components/site/Section";
import { Button } from "@/components/ui/button";
import { Palette, Code2, PenTool, Megaphone, Clapperboard, Brain, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/services")({
  head: () => ({ meta: [
    { title: "Services — Najeeb Digital Hub" },
    { name: "description", content: "Design, development, content, marketing, media and AI services delivered by NDH's in-house talent." },
    { property: "og:title", content: "NDH Services" },
    { property: "og:description", content: "Full digital stack, one trusted partner." },
  ]}),
  component: ServicesPage,
});

const cats = [
  { icon: Palette, title: "Design", items: ["Brand identity & logo", "UI/UX design", "Social media creatives", "Print & packaging"] },
  { icon: Code2, title: "Development", items: ["Websites & landing pages", "Web apps & SaaS", "Mobile apps", "Ecommerce & APIs"] },
  { icon: PenTool, title: "Content Writing", items: ["SEO articles", "Brand copy", "Email & newsletters", "Scripts & ghostwriting"] },
  { icon: Megaphone, title: "Digital Marketing", items: ["Meta & Google ads", "SEO & content strategy", "Social media management", "Influencer campaigns"] },
  { icon: Clapperboard, title: "Media Production", items: ["Video production & editing", "Motion graphics", "Photography", "Podcasts"] },
  { icon: Brain, title: "AI & Tech Services", items: ["Workflow automation", "Custom AI agents", "Data dashboards", "Integrations"] },
];

function ServicesPage() {
  return (
    <SiteLayout>
      <section className="relative bg-hero py-20 text-white">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-xs font-semibold uppercase tracking-widest text-white/70">Services</div>
          <h1 className="mt-3 max-w-3xl text-4xl font-extrabold sm:text-5xl">Everything you need to grow online — under one roof.</h1>
          <p className="mt-4 max-w-2xl text-white/75">Six service lines, delivered by vetted in-house talents and managed by a dedicated Project Manager.</p>
        </div>
      </section>

      <Section>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {cats.map((c) => (
            <div key={c.title} className="group rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:shadow-glow">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-brand text-white shadow-glow">
                <c.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-lg font-bold">{c.title}</h3>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                {c.items.map((i) => <li key={i} className="flex gap-2"><span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-gradient-brand" />{i}</li>)}
              </ul>
              <Link to="/contact" className="mt-6 inline-flex items-center gap-1 text-sm font-semibold">
                Request a Quote <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-16 rounded-3xl border border-border bg-secondary/50 p-8 text-center">
          <h3 className="text-2xl font-extrabold">Not sure what you need?</h3>
          <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">Send us a brief — a PM will scope it for free and respond within 24 hours with a tailored plan.</p>
          <Link to="/contact" className="mt-5 inline-block"><Button variant="brand" size="lg">Talk to a PM</Button></Link>
        </div>
      </Section>
    </SiteLayout>
  );
}