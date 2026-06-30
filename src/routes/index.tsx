import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight, Sparkles, Palette, Code2, PenTool, Megaphone, Clapperboard, Brain,
  ShieldCheck, Clock, Globe2, Award, Quote, CheckCircle2,
  Send,
} from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Section } from "@/components/site/Section";
import { Counter } from "@/components/site/Counter";
import { Button } from "@/components/ui/button";
import { VideoHero } from "@/components/site/VideoHero";
import { AnimatedBlobs } from "@/components/site/AnimatedBlobs";
import { TypingHeadline } from "@/components/site/TypingHeadline";
import { Reveal, Stagger, StaggerItem } from "@/components/site/Reveal";
import { UnsplashImg } from "@/components/site/UnsplashImg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Najeeb Digital Hub (NDH) — Digital Excellence, Delivered" },
      { name: "description", content: "Premium digital services bureau and online academy — design, development, content, marketing, media and AI for global clients." },
      { property: "og:title", content: "Najeeb Digital Hub (NDH)" },
      { property: "og:description", content: "Where Digital Excellence Meets Opportunity." },
    ],
  }),
  component: Index,
});

const services = [
  { icon: Palette, title: "Design", desc: "Brand identity, UI/UX, social creatives." },
  { icon: Code2, title: "Development", desc: "Web apps, mobile, ecommerce, APIs." },
  { icon: PenTool, title: "Content Writing", desc: "Articles, copy, scripts, SEO." },
  { icon: Megaphone, title: "Digital Marketing", desc: "Ads, SEO, social, growth." },
  { icon: Clapperboard, title: "Media Production", desc: "Video, motion, podcast, photo." },
  { icon: Brain, title: "AI & Tech Services", desc: "Automation, agents, integrations." },
];

const steps = [
  { n: "01", title: "Submit a Task", desc: "Tell us your goal, tier and timeline. No price guesswork." },
  { n: "02", title: "We Match & Build", desc: "A dedicated Project Manager assigns vetted in-house talents and oversees quality." },
  { n: "03", title: "Review & Deliver", desc: "We QA, refine and hand over polished work — directly to you." },
];

const features = [
  { icon: ShieldCheck, title: "Vetted talents only", desc: "Tier 1–5 in-house pros, never random freelancers." },
  { icon: Clock, title: "Managed delivery", desc: "PMs run timelines, QA and revisions for you." },
  { icon: Globe2, title: "Built for global clients", desc: "Pay in your local currency from anywhere." },
  { icon: Award, title: "Academy-grade quality", desc: "Our own NDH Academy trains the next generation." },
];

const testimonials = [
  { name: "Aisha Bello", role: "Founder, Lagos", quote: "NDH felt like an in-house team. Fast, sharp, and zero drama.", q: "hijabi woman professional nigeria" },
  { name: "James Rowe", role: "Operations, London", quote: "The PM model is gold — one contact, world-class delivery.", q: "british businessman portrait" },
  { name: "Tunde Adeyemi", role: "CEO, Abuja", quote: "From brand to web to ads, every piece felt premium.", q: "african businessman portrait suit" },
  { name: "Maryam Ibrahim", role: "Brand Manager, Dubai", quote: "World-class output with zero project management overhead.", q: "muslim woman professional office" },
];

// A reliable Mixkit MP4 used as the looping hero bg video.
const HERO_VIDEO = "https://assets.mixkit.co/videos/4828/4828-720.mp4";

function Index() {
  return (
    <SiteLayout>
      {/* HERO with video bg */}
      <VideoHero
        videoSrc={HERO_VIDEO}
        posterQuery="african team office collaboration digital"
        posterAlt="NDH team collaborating"
      >
        <AnimatedBlobs />
        <div className="relative mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:py-40">
          <Reveal>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-white/85 backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" /> Digital Bureau · Academy · Talent
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <h1 className="mt-5 max-w-4xl text-4xl font-extrabold leading-[1.04] tracking-tight text-white sm:text-6xl lg:text-7xl">
              Where <span className="text-gradient-brand">Digital Excellence</span> Meets{" "}
              <span className="block">
                <TypingHeadline
                  phrases={["Opportunity.", "Global Brands.", "African Talent.", "Real Results."]}
                  className="text-gradient-brand"
                />
              </span>
            </h1>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-6 max-w-2xl text-base text-white/80 sm:text-lg">
              NDH delivers design, development, content, marketing and media for ambitious brands worldwide — managed end-to-end by our vetted in-house talents. Train at NDH Academy. Get hired into the bureau.
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/submit-task"><Button variant="brand" size="xl">Submit a Task <ArrowRight className="h-4 w-4" /></Button></Link>
              <Link to="/talent-application"><Button variant="hero" size="xl">Apply to Join Talent Pool</Button></Link>
              <Link to="/academy"><Button variant="hero" size="xl">Enroll in Academy</Button></Link>
            </div>
          </Reveal>
          <Reveal delay={0.4}>
            <div className="mt-10 flex flex-wrap items-center gap-6 text-xs text-white/65">
              <span className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-[oklch(0.78_0.13_180)]" /> Escrow protected</span>
              <span className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-[oklch(0.78_0.13_180)]" /> Vetted in-house talents</span>
              <span className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-[oklch(0.78_0.13_180)]" /> 18+ countries served</span>
            </div>
          </Reveal>
        </div>

        {/* Stats */}
        <div className="relative border-t border-white/10">
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-y-6 px-6 py-10 text-center sm:grid-cols-4">
            {[
              { to: 1200, suffix: "+", label: "Tasks Delivered" },
              { to: 180, suffix: "+", label: "Vetted Talents" },
              { to: 850, suffix: "+", label: "Academy Students" },
              { to: 18, suffix: "", label: "Countries Served" },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-3xl font-extrabold text-white sm:text-5xl"><Counter to={s.to} suffix={s.suffix} /></div>
                <div className="mt-1 text-xs uppercase tracking-widest text-white/60">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </VideoHero>

      {/* SERVICES */}
      <Section eyebrow="What we do" title="A full digital stack, one trusted partner." subtitle="Six service lines, one dedicated PM. You brief us. We deliver.">
        <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <StaggerItem key={s.title}>
              <Link
                to="/services"
                className="group relative block h-full overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-2 hover:rotate-[-0.4deg] hover:shadow-glow"
              >
                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-brand text-white shadow-glow transition-transform duration-300 group-hover:scale-110">
                  <s.icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
                <div className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-foreground/80 group-hover:text-foreground">
                  Request a quote <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
                <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gradient-brand opacity-0 blur-2xl transition-opacity group-hover:opacity-30" />
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      </Section>

      {/* HOW IT WORKS */}
      <Section eyebrow="How it works" title="A bureau model, not a marketplace." subtitle="You never have to chase a freelancer. Our PMs run every project end-to-end." center>
        <Stagger className="grid gap-5 md:grid-cols-3">
          {steps.map((s, i) => (
            <StaggerItem key={s.n}>
              <div className="relative h-full rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:shadow-elegant">
                <div className="text-gradient-brand text-5xl font-black">{s.n}</div>
                <h3 className="mt-3 text-lg font-bold">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
                {i < steps.length - 1 && (
                  <div className="absolute right-4 top-8 hidden text-muted-foreground md:block"><ArrowRight className="h-5 w-5" /></div>
                )}
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </Section>

      {/* WHY */}
      <Section eyebrow="Why NDH" title="Built like a tech company. Run like a studio.">
        <div className="grid items-center gap-10 lg:grid-cols-[1fr_1fr]">
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl border border-border shadow-elegant">
              <UnsplashImg q="african team meeting laptop diverse" alt="NDH team" w={1200} h={900} className="h-full w-full object-cover" />
            </div>
          </Reveal>
          <Stagger className="grid gap-5 sm:grid-cols-2">
            {features.map((f) => (
              <StaggerItem key={f.title}>
                <div className="h-full rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:shadow-elegant">
                  <div className="grid h-10 w-10 place-items-center rounded-lg bg-gradient-brand text-white shadow-glow">
                    <f.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 font-bold">{f.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </Section>

      {/* ACADEMY PROMO */}
      <section className="relative mx-6 my-10 overflow-hidden rounded-3xl border border-border">
        <UnsplashImg q="african students laptop graduation" alt="NDH Academy students" w={1600} h={900} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A0E2A]/95 via-[#0A0E2A]/80 to-transparent" />
        <div className="relative mx-auto grid max-w-7xl gap-8 px-6 py-16 text-white md:grid-cols-2 md:py-24">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-widest">
              <Sparkles className="h-3.5 w-3.5" /> NDH Academy
            </div>
            <h2 className="mt-4 text-3xl font-extrabold sm:text-4xl">Learn. Get certified. Get hired by NDH.</h2>
            <p className="mt-4 max-w-lg text-white/75">
              Real curricula across Design, Tech, Content, Marketing and Media. Top graduates earn a seat in our talent pool.
            </p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-white/70">
              <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1">Learn</span><ArrowRight className="h-4 w-4 self-center" />
              <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1">Get Certified</span><ArrowRight className="h-4 w-4 self-center" />
              <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1">Join Talent Pool</span><ArrowRight className="h-4 w-4 self-center" />
              <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1">Earn</span>
            </div>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/academy"><Button variant="brand" size="lg">Explore Academy</Button></Link>
              <Link to="/verify"><Button variant="hero" size="lg">Verify a Certificate</Button></Link>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <Section eyebrow="Loved by founders" title="Trusted across Nigeria and the diaspora." center>
        <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {testimonials.map((t) => (
            <StaggerItem key={t.name}>
              <div className="h-full rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:shadow-elegant">
                <Quote className="h-6 w-6 text-[oklch(0.62_0.21_290)]" />
                <p className="mt-3 text-sm text-foreground/90">"{t.quote}"</p>
                <div className="mt-5 flex items-center gap-3">
                  <UnsplashImg q={t.q} alt={t.name} w={80} h={80} sig={t.name} className="h-10 w-10 rounded-full object-cover" />
                  <div>
                    <div className="text-sm font-semibold">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.role}</div>
                  </div>
                </div>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </Section>

      {/* CTA / Newsletter */}
      <section className="mx-6 mb-16 overflow-hidden rounded-3xl bg-hero p-10 text-white">
        <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-2 md:items-center">
          <div>
            <h3 className="text-2xl font-extrabold sm:text-3xl">Ready to build something exceptional?</h3>
            <p className="mt-3 text-white/75">Tell us your goal — a PM gets back within 24 hours with a tailored plan.</p>
          </div>
          <form
            onSubmit={(e) => { e.preventDefault(); }}
            className="flex flex-col gap-3 sm:flex-row"
          >
            <input type="email" required placeholder="you@company.com" className="flex-1 rounded-lg border border-white/15 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-[oklch(0.65_0.19_252)]" />
            <Button type="submit" variant="brand" size="xl">Get started <Send className="h-4 w-4" /></Button>
          </form>
        </div>
      </section>
    </SiteLayout>
  );
}
