import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight, Sparkles, Palette, Code2, PenTool, Megaphone, Clapperboard, Brain,
  ShieldCheck, Clock, Globe2, Award, Quote, CheckCircle2,
  ChevronDown, Heart, Target, Rocket,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Section } from "@/components/site/Section";
import { Counter } from "@/components/site/Counter";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { VideoHero } from "@/components/site/VideoHero";
import { AnimatedBlobs } from "@/components/site/AnimatedBlobs";
import { TypingHeadline } from "@/components/site/TypingHeadline";
import { Reveal, Stagger, StaggerItem } from "@/components/site/Reveal";
import { Parallax } from "@/components/site/Parallax";
import { UnsplashImg } from "@/components/site/UnsplashImg";
import { InstallAppSection } from "@/components/site/InstallApp";
import testimonialAisha from "@/assets/testimonial-aisha-bello-founder.jpg";
import testimonialChinedu from "@/assets/testimonial-chinedu-okafor-founder.jpg";
import testimonialJames from "@/assets/testimonial-james-rowe-operator.jpg";
import testimonialMaryam from "@/assets/testimonial-maryam-ibrahim-brand-manager.jpg";
import testimonialSarah from "@/assets/testimonial-sarah-mitchell-marketer.jpg";
import testimonialTunde from "@/assets/testimonial-tunde-adeyemi-ceo.jpg";

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
  { n: "01", title: "Sign Up & Brief", desc: "Create your account and tell us your goal, tier and timeline." },
  { n: "02", title: "We Match & Build", desc: "A dedicated Project Manager assigns the right in-house specialists and oversees quality end-to-end." },
  { n: "03", title: "Review & Deliver", desc: "We QA, refine and hand over polished work — directly to you." },
];

const features = [
  { icon: ShieldCheck, title: "Vetted talents only", desc: "Tier 1–5 in-house pros, never random freelancers." },
  { icon: Clock, title: "Managed delivery", desc: "PMs run timelines, QA and revisions for you." },
  { icon: Globe2, title: "Built for global clients", desc: "Pay in your local currency from anywhere." },
  { icon: Award, title: "Academy-grade quality", desc: "Our own NDH Academy trains the next generation." },
];

const testimonials = [
  { name: "Aisha Bello", role: "Founder, Lagos", quote: "NDH felt like an in-house team. Fast, sharp, and zero drama.", image: testimonialAisha, full: "We came to NDH with a half-baked fintech idea and a tight deadline. Within 48 hours we had a PM, a designer and a full-stack dev on our project. They shipped a beautiful onboarding flow in three weeks, handled every revision without complaint, and even flagged growth ideas we hadn't thought about. It genuinely felt like we'd hired an in-house team overnight." },
  { name: "James Rowe", role: "Operations, London", quote: "The PM model is gold — one contact, world-class delivery.", image: testimonialJames, full: "I've worked with a dozen agencies and freelancers over the years. NDH is the first that gave me one accountable PM who actually ran the project. No chasing, no missed deadlines, no ambiguous quotes. Just weekly updates, clean handoffs and premium output — from London to Sokoto and back." },
  { name: "Tunde Adeyemi", role: "CEO, Abuja", quote: "From brand to web to ads, every piece felt premium.", image: testimonialTunde, full: "We rebranded our entire retail chain with NDH — new identity, new site, launch campaign across Meta and Google. Every deliverable felt considered and premium. Six months in, our online revenue has more than doubled and the team still supports us on retainer." },
  { name: "Maryam Ibrahim", role: "Brand Manager, Dubai", quote: "World-class output with zero project management overhead.", image: testimonialMaryam, full: "As a brand manager I usually spend half my week managing vendors. NDH removed that entire burden. Their PM absorbed briefs, ran QA and delivered polished work I could take straight to our CEO. The Dubai launch was our smoothest ever." },
  { name: "Chinedu Okafor", role: "Founder, Enugu", quote: "Their PMs treated my product like their own. Shipped fast.", image: testimonialChinedu, full: "The energy at NDH is different. Their PM genuinely cared about my product — asked hard questions, pushed back on weak ideas, and delivered features faster than teams five times the size. We're on our third project together." },
  { name: "Sarah Mitchell", role: "Marketing, Toronto", quote: "Best agency-feel I've had at startup pricing. Hire them.", image: testimonialSarah, full: "I've worked with Toronto and NYC agencies that charged 5x and delivered less. NDH gave me a strategist, designer and paid-media lead — all coordinated by one PM — for a fraction of the price. Our CPA dropped 38% in the first quarter." },
];

import founderAsset from "@/assets/founder-ceo.png.asset.json";

const team = [
  { name: "Ataurrahman Najeeb Ahmad", role: "Founder & CEO", q: "african software engineer coding office", image: founderAsset.url },
  { name: "Hamza Suleiman", role: "Head of Academy", q: "nigerian muslim man tech lecturer laptop classroom" },
  { name: "Grace Adebayo", role: "Head of Design", q: "portrait african black woman designer face smiling" },
  { name: "Halima Suleiman", role: "Head of Tech", q: "portrait african woman hijab developer laptop face" },
  { name: "Saleem Mujahid Basheer", role: "Head of Marketing", q: "nigerian muslim man digital marketer analytics dashboard laptop" },
  { name: "Hassan Al'amin Hassan", role: "Head of Operations", q: "nigerian muslim man tech operations manager laptop office" },
];

const programs = [
  { tier: "Certificate", duration: "4–8 weeks", q: "african student learning graphic design laptop online course", desc: "Short, focused skill-ups in design, code, content, marketing and media.", to: "/academy" as const },
  { tier: "Diploma", duration: "3–6 months", q: "african adult professionals coding bootcamp mentor laptop office", desc: "Career-ready diplomas with mentorship, projects and capstone.", to: "/academy" as const },
  { tier: "Professional", duration: "6–12 months", q: "african tech professionals cohort training workshop office", desc: "Elite, cohort-based training. Top grads earn a seat in the NDH talent pool.", to: "/academy" as const },
];

const portfolio = [
  { tag: "Web", title: "Fintech onboarding flow", q: "fintech mobile app ui design", client: "Neobank startup, Lagos", scope: "UX research, UI design, React Native build", outcome: "Reduced onboarding drop-off by 42% and cut KYC time from 9 minutes to under 3.", details: "We designed and shipped a full onboarding experience for a Nigerian neobank — BVN capture, tiered KYC, biometric login and a delightful first-run tour. Delivered in 6 weeks with a PM, product designer and two React Native engineers." },
  { tag: "Brand", title: "Ramadan rebrand for retail", q: "luxury brand identity packaging", client: "Multi-store retail chain, Kano", scope: "Brand strategy, identity system, packaging, in-store signage", outcome: "Launch weekend traffic up 3.1×; social mentions up 6×.", details: "A full seasonal rebrand across 14 stores — new mark, packaging system, print collateral and a coordinated in-store rollout. Every asset shipped from a single NDH creative pod in 5 weeks." },
  { tag: "Marketing", title: "Diaspora launch campaign", q: "social media campaign creative", client: "African skincare DTC brand", scope: "Meta + TikTok ads, influencer seeding, landing pages", outcome: "£142k in first-30-day revenue at a 3.4 ROAS.", details: "A diaspora-focused launch across the UK, US and Canada — creator seeding, paid social, geo-targeted landing pages and a full analytics setup. Managed end-to-end by one NDH growth PM." },
  { tag: "Product", title: "EdTech course platform", q: "edtech web app dashboard", client: "Vocational training provider, Abuja", scope: "Full-stack platform, payments, certificates", outcome: "10k learners onboarded in the first cohort with 94% uptime.", details: "A complete LMS: course authoring, live classes, quizzes, Paystack + Stripe billing, verifiable QR certificates and an admin analytics dashboard. Built on TypeScript, React and Supabase in 10 weeks." },
  { tag: "Media", title: "Founder podcast series", q: "podcast studio recording african", client: "African VC firm", scope: "Studio production, editing, distribution, socials", outcome: "Reached #4 in Nigerian Business on Apple Podcasts in season 1.", details: "A 12-episode founder interview series. NDH handled everything: guest coordination, in-studio recording, audio + video editing, show notes, cover art, distribution across Spotify/Apple and short-form clips for LinkedIn and X." },
  { tag: "AI", title: "Customer-support assistant", q: "ai chatbot dashboard interface", client: "B2B SaaS, London", scope: "RAG assistant, knowledge sync, human handoff", outcome: "Deflected 61% of tier-1 tickets in month one.", details: "A production-grade support assistant integrated into their web app and Slack. Ingests docs and past tickets, answers with citations, escalates to humans cleanly and reports weekly deflection metrics." },
];

const faqs = [
  { q: "How fast can NDH start on my project?", a: "Most projects kick off within 48 hours of sign-up. A PM scopes your brief for free and lines up the right talent." },
  { q: "Do you work with international clients?", a: "Yes — we serve clients in Nigeria, the UK, US, Canada, Europe and the UAE. Pay in your local currency." },
  { q: "How is NDH different from Fiverr or Upwork?", a: "We're a managed bureau, not a marketplace. You get one PM and an in-house team — no freelancer roulette." },
  { q: "What does NDH Academy cost?", a: "Pricing varies by program and country. Certificates start small; diplomas and professional tracks include mentorship and projects." },
  { q: "Can I hire NDH for a one-off task?", a: "Absolutely. Sign up, brief us, and we'll deliver. Retainers are also available." },
  { q: "Is my work confidential?", a: "Always. We sign NDAs on request and our talents only see the project, not your personal contact." },
];

// Tech / coding hero video (Pexels, hotlink-safe)
const HERO_VIDEO = "https://videos.pexels.com/video-files/3130284/3130284-uhd_2560_1440_30fps.mp4";

function Index() {
  return (
    <SiteLayout>
      {/* HERO */}
      <VideoHero videoSrc={HERO_VIDEO} posterQuery="african team office collaboration digital" posterAlt="NDH team collaborating">
        <AnimatedBlobs />
        <div className="relative mx-auto flex min-h-[88vh] max-w-7xl flex-col justify-center px-6 py-24 sm:py-32">
          <Reveal>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-white/85 backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" /> Digital Bureau · Academy · Talent
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <h1 className="mt-5 max-w-4xl text-4xl font-extrabold leading-[1.04] tracking-tight text-white sm:text-6xl lg:text-7xl">
              Where <span className="text-gradient-brand">Digital Excellence</span> Meets{" "}
              <span className="block">
                <TypingHeadline phrases={["Opportunity.", "Global Brands.", "African Talent.", "Real Results."]} className="text-gradient-brand" />
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
              <Link to="/signup"><Button variant="brand" size="xl">Sign Up <ArrowRight className="h-4 w-4" /></Button></Link>
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
          <div className="mt-12 flex justify-center text-white/50"><ChevronDown className="h-6 w-6 animate-bounce" /></div>
        </div>

        {/* Stats */}
        <div className="relative border-t border-white/10">
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-y-6 px-6 py-10 text-center sm:grid-cols-4">
            <HomepageStats />
          </div>
        </div>
      </VideoHero>

      {/* SERVICES */}
      <Section eyebrow="What we do" title="A full digital stack, one trusted partner." subtitle="Six service lines, one dedicated PM. You brief us. We deliver.">
        <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <StaggerItem key={s.title}>
              <Link to="/services" className="group relative block h-full overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-2 hover:rotate-[-0.4deg] hover:shadow-glow">
                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-brand text-white shadow-glow transition-transform duration-300 group-hover:scale-110">
                  <s.icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
                <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gradient-brand opacity-0 blur-2xl transition-opacity group-hover:opacity-30" />
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
        <div className="mt-10 text-center">
          <Link to="/services"><Button variant="brand" size="lg">See All Services <ArrowRight className="h-4 w-4" /></Button></Link>
        </div>
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
              <Parallax offset={50} className="h-full w-full">
                <UnsplashImg q="african team meeting laptop diverse" alt="NDH team" w={1200} h={900} className="h-full w-full object-cover" />
              </Parallax>
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

      {/* ABOUT */}
      <Section eyebrow="About NDH" title="Born in Sokoto. Built for the world.">
        <div className="grid gap-10 lg:grid-cols-2">
          <Reveal>
            <div className="space-y-5 text-muted-foreground">
              <p className="text-lg leading-relaxed text-foreground/90">
                Najeeb Digital Hub started as a small studio in Sokoto with one belief: African talent deserves a stage as global as its ambition.
              </p>
              <p>Today, NDH is a full digital services bureau and an academy — delivering premium work for clients across Nigeria and the diaspora while training the next generation of creators, coders and marketers.</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-border bg-card p-5">
                  <Target className="h-5 w-5 text-[oklch(0.65_0.19_252)]" />
                  <div className="mt-3 font-bold">Our Mission</div>
                  <p className="mt-1 text-sm text-muted-foreground">Make world-class digital work accessible — and turn talent into livelihood.</p>
                </div>
                <div className="rounded-xl border border-border bg-card p-5">
                  <Rocket className="h-5 w-5 text-[oklch(0.62_0.21_290)]" />
                  <div className="mt-3 font-bold">Our Vision</div>
                  <p className="mt-1 text-sm text-muted-foreground">Africa's most trusted digital bureau, exporting craft to every continent.</p>
                </div>
              </div>
              <Link to="/about" className="inline-flex items-center gap-1 text-sm font-semibold text-foreground hover:underline">
                Read full story <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="relative overflow-hidden rounded-3xl border border-border shadow-elegant">
              <Parallax offset={40} className="h-full w-full">
                <UnsplashImg q="nigerian tech startup office lagos developers collaborating computers" alt="NDH tech bureau in Nigeria" w={1000} h={1200} className="h-full w-full object-cover" />
              </Parallax>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* TEAM PREVIEW */}
      <Section eyebrow="Our team" title="The people behind NDH." subtitle="Diverse leaders from across Nigeria, united by one craft standard." center>
        <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {team.map((m) => (
            <StaggerItem key={m.name}>
              <div className="group overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-1 hover:shadow-glow">
                <div className="aspect-[4/5] overflow-hidden">
                  {"image" in m && (m as { image?: string }).image ? (
                    <img src={(m as { image: string }).image} alt={m.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  ) : (
                    <UnsplashImg q={m.q} alt={m.name} w={600} h={750} sig={m.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  )}
                </div>
                <div className="p-5">
                  <div className="font-bold">{m.name}</div>
                  <div className="text-sm text-muted-foreground">{m.role}</div>
                </div>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
        <div className="mt-10 text-center">
          <Link to="/team"><Button variant="outline" size="lg">Meet the Full Team <ArrowRight className="h-4 w-4" /></Button></Link>
        </div>
      </Section>

      {/* ACADEMY PREVIEW */}
      <Section eyebrow="NDH Academy" title="Learn. Get certified. Get hired." subtitle="Three program tiers, real projects, real careers." center>
        <Stagger className="grid gap-5 md:grid-cols-3">
          {programs.map((p) => (
            <StaggerItem key={p.tier}>
              <Link to={p.to} className="group relative block h-full overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-2 hover:shadow-glow">
                <div className="relative aspect-[16/9] overflow-hidden">
                  <Parallax offset={20} className="absolute inset-0">
                    <UnsplashImg q={p.q} alt={p.tier} w={800} h={450} sig={p.tier} className="h-[115%] w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  </Parallax>
                </div>
                <div className="p-6">
                  <div className="inline-flex rounded-full bg-gradient-brand px-3 py-1 text-xs font-bold uppercase tracking-widest text-white">{p.tier}</div>
                  <div className="mt-3 text-sm text-muted-foreground">{p.duration}</div>
                  <p className="mt-3 text-sm">{p.desc}</p>
                </div>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
        <div className="mt-10 text-center">
          <Link to="/academy"><Button variant="brand" size="lg">Explore Academy <ArrowRight className="h-4 w-4" /></Button></Link>
        </div>
      </Section>

      {/* PORTFOLIO */}
      <Section eyebrow="Portfolio" title="A taste of what NDH ships.">
        <PortfolioGrid items={portfolio} />
        <div className="mt-10 text-center">
          <Link to="/services"><Button variant="outline" size="lg">See All Work <ArrowRight className="h-4 w-4" /></Button></Link>
        </div>
      </Section>

      {/* TESTIMONIALS */}
      <Section eyebrow="Loved by founders" title="Trusted across Nigeria and the diaspora." center>
        <TestimonialsCarousel />
      </Section>

      {/* FAQ */}
      <Section eyebrow="FAQ" title="Quick answers to common questions." center>
        <div className="mx-auto max-w-3xl space-y-3">
          {faqs.map((f, i) => (
            <FaqItem key={f.q} q={f.q} a={f.a} defaultOpen={i === 0} />
          ))}
        </div>
      </Section>

      {/* PWA install */}
      <InstallAppSection />

      {/* FINAL CTA */}
      <section className="relative mx-6 my-10 overflow-hidden rounded-3xl border border-border bg-hero p-10 text-white sm:p-16">
        <AnimatedBlobs />
        <div className="relative mx-auto max-w-3xl text-center">
          <Heart className="mx-auto h-8 w-8 text-[oklch(0.78_0.13_180)]" />
          <h3 className="mt-4 text-3xl font-extrabold sm:text-5xl">Ready to build something exceptional?</h3>
          <p className="mx-auto mt-4 max-w-2xl text-white/80">Create your free NDH account in 30 seconds. A Project Manager responds within 24 hours.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/signup"><Button variant="brand" size="xl">Sign Up <ArrowRight className="h-4 w-4" /></Button></Link>
            <Link to="/academy"><Button variant="hero" size="xl">Enroll in Academy</Button></Link>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

function TestimonialsCarousel() {
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<typeof testimonials[number] | null>(null);
  useEffect(() => {
    const id = setInterval(() => setI((v) => (v + 1) % testimonials.length), 4500);
    return () => clearInterval(id);
  }, []);
  const visible = [0, 1, 2].map((o) => testimonials[(i + o) % testimonials.length]);
  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((t) => (
          <button
            key={t.name + i}
            type="button"
            onClick={() => setPicked(t)}
            className="h-full animate-fade-in rounded-2xl border border-border bg-card p-6 text-left transition-all hover:-translate-y-1 hover:shadow-elegant"
          >
            <Quote className="h-6 w-6 text-[oklch(0.62_0.21_290)]" />
            <p className="mt-3 text-sm text-foreground/90">"{t.quote}"</p>
            <div className="mt-5 flex items-center gap-3">
              <img src={t.image} alt={t.name} width={768} height={768} loading="lazy" className="h-12 w-12 rounded-full object-cover" />
              <div>
                <div className="text-sm font-semibold">{t.name}</div>
                <div className="text-xs text-muted-foreground">{t.role}</div>
              </div>
            </div>
            <div className="mt-4 text-xs font-semibold text-[oklch(0.65_0.19_252)]">Read full story →</div>
          </button>
        ))}
      </div>
      <Dialog open={!!picked} onOpenChange={(o) => !o && setPicked(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          {picked && (
            <>
              <DialogHeader className="items-center text-center">
                <img src={picked.image} alt={picked.name} className="h-20 w-20 rounded-full object-cover" />
                <DialogTitle>{picked.name}</DialogTitle>
                <DialogDescription>{picked.role}</DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <Quote className="h-6 w-6 text-[oklch(0.62_0.21_290)]" />
                <p className="text-sm leading-relaxed text-foreground/90">"{picked.full}"</p>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

type PortfolioItem = {
  tag: string; title: string; q: string;
  client?: string; scope?: string; outcome?: string; details?: string;
  image_url?: string;
};

export function PortfolioGrid({ items }: { items: PortfolioItem[] }) {
  const [picked, setPicked] = useState<PortfolioItem | null>(null);
  return (
    <>
      <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((p) => (
          <StaggerItem key={p.title}>
            <button
              type="button"
              onClick={() => setPicked(p)}
              className="group relative block aspect-[4/3] w-full overflow-hidden rounded-2xl border border-border text-left"
            >
              <Parallax offset={24} className="absolute inset-0">
                {p.image_url ? (
                  <img src={p.image_url} alt={p.title} loading="lazy" className="h-[115%] w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                ) : (
                  <UnsplashImg q={p.q} alt={p.title} w={800} h={600} sig={p.title} className="h-[115%] w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                )}
              </Parallax>
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
              <div className="absolute bottom-0 p-5 text-white">
                <div className="text-xs font-semibold uppercase tracking-widest text-white/70">{p.tag}</div>
                <div className="mt-1 text-lg font-bold">{p.title}</div>
                <div className="mt-2 text-xs font-semibold text-white/80">View case →</div>
              </div>
            </button>
          </StaggerItem>
        ))}
      </Stagger>
      <Dialog open={!!picked} onOpenChange={(o) => !o && setPicked(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
          {picked && (
            <>
              <div className="relative aspect-[16/9] w-full overflow-hidden">
                {picked.image_url ? (
                  <img src={picked.image_url} alt={picked.title} className="h-full w-full object-cover" />
                ) : (
                  <UnsplashImg q={picked.q} alt={picked.title} w={1200} h={675} sig={picked.title} className="h-full w-full object-cover" />
                )}
              </div>
              <div className="space-y-4 p-6">
                <DialogHeader className="space-y-1">
                  <div className="text-xs font-semibold uppercase tracking-widest text-[oklch(0.65_0.19_252)]">{picked.tag}</div>
                  <DialogTitle className="text-2xl">{picked.title}</DialogTitle>
                  {picked.client && <DialogDescription>{picked.client}</DialogDescription>}
                </DialogHeader>
                {picked.details && <p className="text-sm leading-relaxed text-foreground/90">{picked.details}</p>}
                <div className="grid gap-3 sm:grid-cols-2">
                  {picked.scope && (
                    <div className="rounded-xl border border-border bg-card p-4">
                      <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Scope</div>
                      <div className="mt-1 text-sm">{picked.scope}</div>
                    </div>
                  )}
                  {picked.outcome && (
                    <div className="rounded-xl border border-border bg-card p-4">
                      <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Outcome</div>
                      <div className="mt-1 text-sm">{picked.outcome}</div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function FaqItem({ q, a, defaultOpen }: { q: string; a: string; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <div className="rounded-2xl border border-border bg-card">
      <button onClick={() => setOpen((v) => !v)} className="flex w-full items-center justify-between gap-4 p-5 text-left">
        <span className="font-semibold">{q}</span>
        <ChevronDown className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="px-5 pb-5 text-sm text-muted-foreground">{a}</div>}
    </div>
  );
}

function HomepageStats() {
  const fallback = [
    { label: "Tasks Delivered", value: 1200, suffix: "+" },
    { label: "Vetted Talents", value: 180, suffix: "+" },
    { label: "Academy Students", value: 850, suffix: "+" },
    { label: "Countries Served", value: 18, suffix: "" },
  ];
  const { data } = useQuery({
    queryKey: ["homepage_stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("homepage_stats")
        .select("label,value,suffix,display_order")
        .eq("published", true)
        .order("display_order", { ascending: true });
      if (error) return fallback;
      return (data && data.length > 0)
        ? data.map((r) => ({ label: r.label, value: Number(r.value) || 0, suffix: r.suffix || "" }))
        : fallback;
    },
  });
  const stats = data || fallback;
  return (
    <>
      {stats.slice(0, 4).map((s) => (
        <div key={s.label}>
          <div className="text-3xl font-extrabold text-white sm:text-5xl">
            <Counter to={s.value} suffix={s.suffix} />
          </div>
          <div className="mt-1 text-xs uppercase tracking-widest text-white/60">{s.label}</div>
        </div>
      ))}
    </>
  );
}