import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Section } from "@/components/site/Section";
import { Button } from "@/components/ui/button";
import * as Icons from "lucide-react";
import { ArrowRight } from "lucide-react";
import { AnimatedBlobs } from "@/components/site/AnimatedBlobs";
import { Reveal, Stagger, StaggerItem } from "@/components/site/Reveal";
import { UnsplashImg } from "@/components/site/UnsplashImg";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PortfolioGrid } from "@/routes/index";

export const Route = createFileRoute("/services")({
  head: () => ({ meta: [
    { title: "Services — Najeeb Digital Hub" },
    { name: "description", content: "Design, development, content, marketing, media and AI services delivered by NDH's in-house talent." },
    { property: "og:title", content: "NDH Services" },
    { property: "og:description", content: "Full digital stack, one trusted partner." },
  ]}),
  component: ServicesPage,
});

type Cat = { icon: string; title: string; q: string; items: string[]; image_url?: string };

const QUERIES: Record<string, string> = {
  Design: "graphic design workspace creative",
  Development: "developer coding screen react",
  "Content Writing": "writer laptop notes coffee",
  "Digital Marketing": "marketing analytics dashboard screen",
  "Media Production": "video editor production studio camera",
  "AI & Tech Services": "artificial intelligence dashboard tech",
};

const portfolio = [
  { q: "fintech mobile app ui design", title: "Fintech app rebrand", tag: "Design", client: "Neobank, Lagos", scope: "Brand refresh, product UI, design system", outcome: "Doubled activation on the redesigned onboarding.", details: "A full visual refresh of a Nigerian neobank — new mark, colour system, a token-driven UI kit, and a redesigned onboarding + wallet experience shipped in six weeks." },
  { q: "ecommerce website laptop", title: "Lagos retail e-commerce", tag: "Development", client: "Multi-brand retailer, Lagos", scope: "Headless commerce build, payments, logistics", outcome: "22% conversion lift and 3× faster page loads.", details: "A headless ecommerce platform with Paystack + Flutterwave, courier integrations and an internal fulfilment dashboard. Handles peak Black Friday traffic on autoscaling infra." },
  { q: "content marketing blog laptop", title: "B2B content engine", tag: "Content", client: "African SaaS scale-up", scope: "Editorial strategy, SEO, weekly production", outcome: "Organic sessions up 5.1× in 9 months.", details: "A managed content programme — pillar strategy, keyword research, ghostwritten founder essays and weekly SEO articles reviewed by an in-house editor." },
  { q: "social media manager phone", title: "DTC growth campaign", tag: "Marketing", client: "Beauty DTC, UK + Nigeria", scope: "Paid social, creators, landing pages", outcome: "3.4 ROAS at scale across Meta and TikTok.", details: "Coordinated creator seeding, weekly ad iteration and geo-targeted landing pages across two markets. Full analytics and weekly PM report." },
  { q: "video production studio lights", title: "Brand documentary", tag: "Media", client: "African VC firm", scope: "Concept, direction, production, edit", outcome: "500k+ organic views across LinkedIn and YouTube.", details: "A cinematic 12-minute documentary on Africa's next generation of founders — shot in Lagos and Nairobi and cut into a launch trailer plus 30 short-form clips." },
  { q: "ai dashboard data visualization", title: "Sales AI agent", tag: "AI & Tech", client: "B2B SaaS, London", scope: "Lead qualification agent, CRM sync", outcome: "42% more qualified meetings booked in month one.", details: "A production AI agent that qualifies inbound leads, drafts personalised replies and syncs the entire thread into HubSpot. Weekly evaluation dashboard included." },
];

function ServicesPage() {
  const [cats, setCats] = useState<Cat[]>([]);
  useEffect(() => {
    supabase.from("services")
      .select("name,icon,included,image_url")
      .eq("published", true)
      .order("display_order", { ascending: true })
      .then(({ data }) => {
        setCats((data || []).map((r) => ({
          icon: r.icon || "Sparkles",
          title: r.name,
          q: QUERIES[r.name] || r.name.toLowerCase(),
          items: Array.isArray(r.included) ? (r.included as string[]) : [],
          image_url: r.image_url || undefined,
        })));
      });
  }, []);
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
          {cats.map((c) => {
            const IconEl = (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[c.icon] || Icons.Sparkles;
            return (
            <StaggerItem key={c.title}>
              <div className="group h-full overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-1 hover:shadow-glow">
                <div className="aspect-[16/10] overflow-hidden">
                 {c.image_url ? (
                   <img src={c.image_url} alt={`${c.title} services at Najeeb Digital Hub`} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                 ) : (
                   <UnsplashImg q={c.q} alt={`${c.title} services at Najeeb Digital Hub`} w={800} h={500} sig={c.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                 )}
                </div>
                <div className="p-6">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-brand text-white shadow-glow">
                    <IconEl className="h-5 w-5" />
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
            );
          })}
        </Stagger>
      </Section>

      <Section eyebrow="Portfolio" title="A taste of what NDH ships.">
        <PortfolioGrid items={portfolio} />
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