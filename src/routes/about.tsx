import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Section } from "@/components/site/Section";
import { Reveal, Stagger, StaggerItem } from "@/components/site/Reveal";
import { Button } from "@/components/ui/button";
import { HeartHandshake, Compass, Target, Sparkles, MapPin, ShieldCheck, Clock, Users, Award } from "lucide-react";
import aboutTeam from "@/assets/about-hero-team.jpg";
import officeWorkspace from "@/assets/office-workspace-premium.jpg";
import servicesOverview from "@/assets/services-bureau-overview.jpg";
import logoNew from "@/assets/ndh-logo-new.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [
    { title: "About NDH — Official Bureau for Digital Excellence" },
    { name: "description", content: "NDH is a managed digital bureau + AI academy. 80 services, 40 AI courses, vetted talent network, escrow, QA, QR-verified certificates. Nigeria to Worldwide. Official, not marketplace." },
  ]}),
  component: AboutPage,
});

const values = [
  { icon: Sparkles, title: "Craft", desc: "Every deliverable reviewed against written quality bar. No vibes, no excuses. Source files included." },
  { icon: HeartHandshake, title: "Trust", desc: "Paystack escrow, milestones, named PM, QA sign-off, NDA. Funds released only on approval." },
  { icon: Compass, title: "Opportunity", desc: "Sustainable careers for vetted African talent — Junior T1 to Elite T5, weekly payouts, no client hunting." },
  { icon: Target, title: "Outcomes", desc: "We measure success by outcomes clients report — conversion lift, revenue, not hours logged." },
];

const stats = [
  { k: "Services Handled", v: "80" },
  { k: "AI Courses", v: "40" },
  { k: "Talent Tiers", v: "T1–T5" },
  { k: "Escrow Protection", v: "100%" },
  { k: "Global Reach", v: "Worldwide" },
  { k: "Founded", v: "2024" },
];

function AboutPage() {
  return (
    <SiteLayout>
      {/* Hero — Professional, company not person */}
      <section className="border-b border-border bg-background">
        <div className="mx-auto max-w-7xl px-6 py-12 sm:py-16">
          <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <Reveal>
              <div className="flex items-center gap-3">
                <img src={logoNew} alt="NDH Logo" className="h-9 w-9 rounded-full ring-1 ring-border" />
                <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">About • Official Bureau • Est. 2024</div>
              </div>
              <h1 className="mt-4 max-w-2xl text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                A managed bureau<br />for companies that<br />can't afford freelancer roulette.
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
                Najeeb Digital Hub (NDH) is a premium digital services bureau and AI academy. We handle <span className="font-semibold text-foreground">80 digital services</span> — from brand identity to AI agents — through vetted anonymous talents (NDH-DS-1234), project managers, escrow via Paystack, and QA. We also train 40 AI skills you can learn from YouTube today and implement tomorrow, with QR-verified certificates and talent pipeline.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                <div className="inline-flex items-center gap-2 rounded-full border bg-secondary/50 px-3 py-1 text-xs"><ShieldCheck className="h-3.5 w-3.5" /> Escrow Secured</div>
                <div className="inline-flex items-center gap-2 rounded-full border bg-secondary/50 px-3 py-1 text-xs"><Clock className="h-3.5 w-3.5" /> Quote in 4h</div>
                <div className="inline-flex items-center gap-2 rounded-full border bg-secondary/50 px-3 py-1 text-xs"><Users className="h-3.5 w-3.5" /> Vetted Talent Network</div>
              </div>
            </Reveal>
            <Reveal delay={0.2}>
              <div className="relative">
                <img src={aboutTeam} alt="NDH Team Working" className="aspect-[4/3] w-full rounded-2xl object-cover shadow-lg ring-1 ring-border" />
                <div className="absolute bottom-3 left-3 rounded-full bg-black/60 px-3 py-1 text-xs text-white backdrop-blur">NDH Bureau Team • Collaborative • Premium</div>
              </div>
            </Reveal>
          </div>

          {/* Stats Grid */}
          <div className="mt-12 grid grid-cols-2 gap-px rounded-2xl border bg-border sm:grid-cols-3 lg:grid-cols-6">
            {stats.map((s) => (
              <div key={s.k} className="bg-card p-4 text-center">
                <div className="text-xl font-bold tracking-tight">{s.v}</div>
                <div className="mt-1 text-[10px] uppercase tracking-widest text-muted-foreground">{s.k}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story — Professional company story, not just person */}
      <Section eyebrow="Our Story" title="Built in Nigeria, serving clients worldwide.">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <Reveal>
            <img src={officeWorkspace} alt="Office Workspace Premium" className="aspect-video w-full rounded-2xl object-cover ring-1 ring-border" />
          </Reveal>
          <Reveal delay={0.1}>
            <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
              <p><span className="font-semibold text-foreground">2024:</span> Najeeb started NDH as solo developer/designer in Nigeria, tired of clients chasing freelancers on Upwork who disappear after payment. He saw talented Africans with skills but no pipeline, and students paying for courses with certificates but no jobs.</p>
              <p><span className="font-semibold text-foreground">Idea:</span> What if we act as a bureau, not a marketplace? Client briefs NDH, PM scopes in 4h with fixed quote, assigns vetted anonymous talent ID, QA, delivers, escrow releases. Talent gets steady work without hunting clients. Students learn AI skills from YouTube curation, pass AI exam + project, Director approves, QR-verified certificate, join talent pool.</p>
              <p><span className="font-semibold text-foreground">Now:</span> 80 services catalog, 40 AI courses, vetted talent network T1-T5, fixed-quote delivery, Paystack escrow, PM + QA on every task, 7-day invite-only for PM/Talent/Director, public signup only client/student.</p>
              <div className="pt-2">
                <Link to="/contact"><Button variant="brand" size="sm">Talk to our team</Button></Link>
              </div>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* How we operate — Official */}
      <Section eyebrow="How we operate" title="Official bureau process — 3 steps, no chaos.">
        <div className="grid gap-6 md:grid-cols-3">
          <Reveal><div className="rounded-xl border bg-card p-6"><div className="text-xs font-mono text-muted-foreground">01 • BRIEF</div><div className="mt-2 font-semibold">Submit brief in 2 minutes</div><p className="mt-2 text-sm text-muted-foreground leading-relaxed">Project type, services multi, budget Under ₦500k to 15M+ + negotiation toggle, timeline, files. Free, no card. PM reviews instantly.</p></div></Reveal>
          <Reveal delay={0.1}><div className="rounded-xl border bg-card p-6"><div className="text-xs font-mono text-muted-foreground">02 • MATCH & SCOPE</div><div className="mt-2 font-semibold">PM scopes in 4h, fixed quote, assigns talent ID</div><p className="mt-2 text-sm text-muted-foreground leading-relaxed">You get SOW, milestones, quote. Talent assigned anonymous NDH-DS-1234 for privacy/bias protection. Client never chats talent directly.</p></div></Reveal>
          <Reveal delay={0.2}><div className="rounded-xl border bg-card p-6"><div className="text-xs font-mono text-muted-foreground">03 • ESCROW + QA + DELIVERY</div><div className="mt-2 font-semibold">Funds held Paystack, released on approval</div><p className="mt-2 text-sm text-muted-foreground leading-relaxed">Talent works, PM QA + revision, delivers source files + docs + QA sign-off. You approve, escrow releases. Post-support available.</p></div></Reveal>
        </div>
      </Section>

      {/* Services Overview Image */}
      <Section eyebrow="What we handle" title="80 services — visual overview.">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <Reveal><img src={servicesOverview} alt="Services Bureau Flat Lay" className="aspect-[16/10] w-full rounded-2xl object-cover ring-1 ring-border" /></Reveal>
          <Reveal delay={0.1}>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground leading-relaxed">Design, Development, Content, Marketing, Video & Media, Photo & Podcast, Data, Business Support, AI & Automation — 80 total. Each service has included 5 bullets what client gets, starting price, featured flag. Public site shows 12 featured first, rest searchable.</p>
              <ul className="grid grid-cols-2 gap-2 text-xs">
                {["Brand Identity", "UI/UX Design", "Website Dev", "Mobile MVP", "Content SEO", "Meta Ads", "Video Editing", "AI Agents n8n", "WhatsApp Chatbot", "E-commerce Setup"].map((s) => <li key={s} className="rounded-lg border bg-secondary/40 px-3 py-2">{s}</li>)}
              </ul>
              <Link to="/services"><Button variant="outline" size="sm">Browse all 80 services</Button></Link>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* Values */}
      <Section eyebrow="What we believe" title="Values — 10T standard.">
        <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((v) => (
            <StaggerItem key={v.title}>
              <div className="h-full rounded-xl border bg-card p-6 hover:shadow-sm transition">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-[#0A0E2A] text-white"><v.icon className="h-5 w-5" /></div>
                <h3 className="mt-4 font-semibold tracking-tight">{v.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </Section>

      {/* Coverage */}
      <Section eyebrow="Coverage" title="Nigeria to Worldwide — official.">
        <div className="grid gap-6 lg:grid-cols-2">
          <Reveal>
            <div className="rounded-xl border bg-card p-6">
              <div className="flex items-center gap-2 text-primary"><MapPin className="h-4 w-4" /><span className="text-xs font-semibold uppercase tracking-widest">Client regions</span></div>
              <ul className="mt-4 grid grid-cols-2 gap-3 text-sm">
                {["Nigeria","United Kingdom","United States","Canada","Germany","France","Netherlands","United Arab Emirates"].map((c) => <li key={c} className="rounded-lg border bg-secondary/40 px-3 py-2 font-medium">{c}</li>)}
              </ul>
              <p className="mt-4 text-xs text-muted-foreground">Headquartered Nigeria. All engagements run in client's business hours.</p>
            </div>
          </Reveal>
          <div className="rounded-xl border bg-card p-6">
            <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Working languages & currencies</div>
            <ul className="mt-4 grid grid-cols-2 gap-3 text-sm">
              {["English","French","Arabic","USD","GBP","EUR","NGN"].map((c) => <li key={c} className="rounded-lg border bg-secondary/40 px-3 py-2 font-medium">{c}</li>)}
            </ul>
            <p className="mt-4 text-xs text-muted-foreground">Contracts/invoices in USD, GBP, EUR, NGN via Paystack. Fast Response.</p>
          </div>
        </div>
      </Section>

      <Section eyebrow="Ready to start" title="Talk to our project managers — official bureau.">
        <div className="flex flex-wrap items-center gap-3">
          <Link to="/start-project"><Button variant="brand">Start a Project — Free scoping</Button></Link>
          <Link to="/contact"><Button variant="outline">Contact — WhatsApp 24h</Button></Link>
        </div>
      </Section>
    </SiteLayout>
  );
}
