import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Section } from "@/components/site/Section";
import { Button } from "@/components/ui/button";
import { Palette, Code2, PenTool, Megaphone, Clapperboard, Brain, ArrowRight } from "lucide-react";
import { AnimatedBlobs } from "@/components/site/AnimatedBlobs";
import { Reveal, Stagger, StaggerItem } from "@/components/site/Reveal";
import { UnsplashImg } from "@/components/site/UnsplashImg";

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
  { icon: Palette, title: "Design", q: "graphic design workspace creative", items: ["Brand identity & logo", "UI/UX design", "Social media creatives", "Print & packaging"] },
  { icon: Code2, title: "Development", q: "developer coding screen react", items: ["Websites & landing pages", "Web apps & SaaS", "Mobile apps", "Ecommerce & APIs"] },
  { icon: PenTool, title: "Content Writing", q: "writer laptop notes coffee", items: ["SEO articles", "Brand copy", "Email & newsletters", "Scripts & ghostwriting"] },
  { icon: Megaphone, title: "Digital Marketing", q: "marketing analytics dashboard screen", items: ["Meta & Google ads", "SEO & content strategy", "Social media management", "Influencer campaigns"] },
  { icon: Clapperboard, title: "Media Production", q: "video editor production studio camera", items: ["Video production & editing", "Motion graphics", "Photography", "Podcasts"] },
  { icon: Brain, title: "AI & Tech Services", q: "artificial intelligence dashboard tech", items: ["Workflow automation", "Custom AI agents", "Data dashboards", "Integrations"] },
];

const portfolio = [
  { q: "fintech mobile app ui design", title: "Fintech app rebrand", tag: "Design" },
  { q: "ecommerce website laptop", title: "Lagos retail e-commerce", tag: "Development" },
  { q: "content marketing blog laptop", title: "B2B content engine", tag: "Content" },
  { q: "social media manager phone", title: "DTC growth campaign", tag: "Marketing" },
  { q: "video production studio lights", title: "Brand documentary", tag: "Media" },
  { q: "ai dashboard data visualization", title: "Sales AI agent", tag: "AI & Tech" },
];

function ServicesPage() {
  return (
    <SiteLayout>
      <section className="relative isolate overflow-hidden bg-hero py-24 text-white">
        <AnimatedBlobs />
        <div className="relative mx-auto max-w-7xl px-6">
          <Reveal>
            <div className="text-xs font-semibold uppercase tracking-widest text-white/70">Services</div>
            <h1 className="mt-3 max-w-3xl text-4xl font-extrabold sm:text-5xl">Everything you need to grow online — <span className="text-gradient-brand">under one roof.</span></h1>
            <p className="mt-4 max-w-2xl text-white/75">Six service lines, delivered by vetted in-house talents and managed by a dedicated Project Manager.</p>
          </Reveal>
        </div>
      </section>

      <Section>
        <Stagger className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {cats.map((c) => (
            <StaggerItem key={c.title}>
              <div className="group h-full overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-1 hover:shadow-glow">
                <div className="aspect-[16/10] overflow-hidden">
                  <UnsplashImg q={c.q} alt={c.title} w={800} h={500} sig={c.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                </div>
                <div className="p-6">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-brand text-white shadow-glow">
                    <c.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-lg font-bold">{c.title}</h3>
                  <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                    {c.items.map((i) => <li key={i} className="flex gap-2"><span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-gradient-brand" />{i}</li>)}
                  </ul>
                  <Link to="/signup" className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-foreground">
                    Get Started <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </Section>

      <Section eyebrow="Portfolio" title="A taste of what NDH ships.">
        <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {portfolio.map((p) => (
            <StaggerItem key={p.title}>
              <div className="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-border">
                <UnsplashImg q={p.q} alt={p.title} w={800} h={600} sig={p.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute bottom-0 p-5 text-white">
                  <div className="text-xs font-semibold uppercase tracking-widest text-white/70">{p.tag}</div>
                  <div className="mt-1 text-lg font-bold">{p.title}</div>
                </div>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </Section>

      <Section>
        <div className="rounded-3xl border border-border bg-secondary/50 p-8 text-center">
          <h3 className="text-2xl font-extrabold">Not sure what you need?</h3>
          <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">Send us a brief — a PM will scope it for free and respond within 24 hours with a tailored plan.</p>
          <Link to="/signup" className="mt-5 inline-block"><Button variant="brand" size="lg">Sign up to brief us</Button></Link>
        </div>
      </Section>
    </SiteLayout>
  );
}