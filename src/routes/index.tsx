import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Search, Palette, Code2, PenTool, Megaphone, Clapperboard, Brain, Camera, LineChart, BadgeCheck, Lock, Timer, Globe, Sparkles, ArrowUpRight } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Reveal, Stagger, StaggerItem } from "@/components/site/Reveal";
import officeWorkspace from "@/assets/office-workspace-premium.jpg";
import servicesOverview from "@/assets/services-bureau-overview.jpg";
import academyStudents from "@/assets/academy-students-ai.jpg";
import aboutTeam from "@/assets/about-hero-team.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Najeeb Digital Hub [NDH] — The Bureau for Digital Excellence — Official Worldwide" },
      { name: "description", content: "Official bureau for digital services. 80 services handled, 40 AI courses curated from YouTube, vetted talent network, escrow, QA, QR-verified. HQ Nigeria, serving worldwide." },
    ],
  }),
  component: Index,
});

const servicesPreview = [
  { icon: Palette, title: "Brand & Identity", items: 12 },
  { icon: Code2, title: "Development", items: 15 },
  { icon: PenTool, title: "Content & Writing", items: 10 },
  { icon: Megaphone, title: "Marketing & Growth", items: 12 },
  { icon: Clapperboard, title: "Video & Media", items: 12 },
  { icon: Camera, title: "Photo & Podcast", items: 8 },
  { icon: LineChart, title: "Data & Business", items: 10 },
  { icon: Brain, title: "AI & Automation", items: 29 },
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
      <style>{`
        @keyframes marqueeTrust {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee-trust {
          display: flex;
          width: max-content;
          animation: marqueeTrust 60s linear infinite;
        }
        .animate-marquee-trust:hover { animation-play-state: paused; }
      `}</style>

      {/* HERO — Professional with images, no dashboard mock revealing internal stats */}
      <section className="border-b border-border bg-background">
        <div className="mx-auto max-w-7xl px-6 py-12 sm:py-20">
          <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <Reveal>
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-3 py-1 text-xs font-medium tracking-wide text-muted-foreground">
                  <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" /> Official Bureau • Est. 2024 • Nigeria • Worldwide • 80 Services • 40 AI Courses
                </div>
                <h1 className="mt-6 text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                  The Bureau for<br />Digital Excellence.
                </h1>
                <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
                  We are not a freelance marketplace. We are a <span className="font-semibold text-foreground">managed bureau</span> that handles 80 digital services and trains 40 AI skills curated from YouTube. Clients brief, PM assigns vetted talent, QA, escrow delivery — no roulette. Trusted worldwide.
                </p>
                <form onSubmit={submit} className="mt-6 flex max-w-xl items-center gap-2 rounded-xl border border-border bg-card p-1.5 shadow-sm">
                  <div className="pl-3 text-muted-foreground"><Search className="h-4 w-4" /></div>
                  <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search 80 services — brand identity, landing page, AI automation..." className="flex-1 bg-transparent px-2 py-2.5 text-sm focus:outline-none" />
                  <Button type="submit" variant="brand" size="sm" className="rounded-lg">Search</Button>
                </form>
                <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><BadgeCheck className="h-3.5 w-3.5 text-primary" /> Vetted Talent Network</span>
                  <span className="inline-flex items-center gap-1"><Lock className="h-3.5 w-3.5 text-primary" /> Paystack Escrow Worldwide</span>
                  <span className="inline-flex items-center gap-1"><Timer className="h-3.5 w-3.5 text-primary" /> Quote in 4h • Worldwide TZ</span>
                </div>
                <div className="mt-6 flex flex-wrap gap-2">
                  <Link to="/start-project"><Button variant="brand">Start a Project <ArrowRight className="h-4 w-4" /></Button></Link>
                  <Link to="/about"><Button variant="outline">About NDH — Official</Button></Link>
                </div>
                <div className="mt-6 grid grid-cols-3 gap-2 text-xs">
                  <div className="rounded-xl border bg-card p-3 text-center"><div className="text-lg font-bold">100%</div><div className="text-muted-foreground">Escrow Protected</div></div>
                  <div className="rounded-xl border bg-card p-3 text-center"><div className="text-lg font-bold">80</div><div className="text-muted-foreground">Services Handled</div></div>
                  <div className="rounded-xl border bg-card p-3 text-center"><div className="text-lg font-bold">40</div><div className="text-muted-foreground">AI Courses Curated</div></div>
                </div>
              </div>
            </Reveal>
            <Reveal delay={0.2}>
              <div className="relative">
                <div className="absolute -inset-3 rounded-3xl bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-teal-500/10 blur-2xl" />
                <div className="relative overflow-hidden rounded-3xl border border-border shadow-xl">
                  <img src={officeWorkspace} alt="Premium Bureau Workspace" className="aspect-[4/3] w-full object-cover" />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                    <div className="text-sm font-semibold text-white">Official Bureau Workspace — HQ Nigeria • Serving Worldwide</div>
                    <div className="text-xs text-white/70">80 services, 40 AI courses, vetted talent network, escrow, QA, QR-verified</div>
                  </div>
                </div>
                <div className="absolute -bottom-4 -right-4 hidden rounded-xl border bg-card p-3 shadow-lg sm:block">
                  <div className="flex items-center gap-2">
                    <img src={aboutTeam} alt="Team" className="h-10 w-10 rounded-full object-cover" />
                    <div>
                      <div className="text-xs font-bold">Vetted Team Worldwide</div>
                      <div className="text-[10px] text-muted-foreground">Nigeria → Worldwide</div>
                    </div>
                    <div className="ml-2 h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  </div>
                </div>
                <div className="absolute -top-3 -left-3 hidden rounded-xl border bg-card p-2 shadow-lg sm:block">
                  <img src={servicesOverview} alt="Services" className="h-16 w-24 rounded-lg object-cover" />
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* TRUST BAR — Moving marquee, not static */}
      <section className="border-b border-border bg-[#0A0E2A] text-white overflow-hidden">
        <div className="animate-marquee-trust py-3 text-xs tracking-wide">
          <div className="flex items-center gap-8 px-4">
            <span className="inline-flex items-center gap-2"><Globe className="h-3 w-3 text-teal-400" /> Worldwide • Remote-first • Nigeria → Worldwide • HQ Nigeria</span>
            <span className="opacity-30">•</span>
            <span>80 Services • Brand Identity • UI/UX • Web Dev • Mobile MVP • Content SEO • Meta Ads • Video Editing • AI Agents • E-commerce</span>
            <span className="opacity-30">•</span>
            <span>40 AI Courses • Prompt Engineering • AI Graphic Design • AI Video • AI Copywriting • AI Automation • n8n • Lovable • Chatbots</span>
            <span className="opacity-30">•</span>
            <span>Vetted Talent Network T1-T5 • Escrow Paystack • QA on every task • NDA • Fixed-Quote Guarantee • Fast Response Worldwide TZ</span>
            <span className="opacity-30">•</span>
          </div>
          <div className="flex items-center gap-8 px-4" aria-hidden>
            <span className="inline-flex items-center gap-2"><Globe className="h-3 w-3 text-teal-400" /> Worldwide • Remote-first • Nigeria → Worldwide • HQ Nigeria</span>
            <span className="opacity-30">•</span>
            <span>80 Services • Brand Identity • UI/UX • Web Dev • Mobile MVP • Content SEO • Meta Ads • Video Editing • AI Agents • E-commerce</span>
            <span className="opacity-30">•</span>
            <span>40 AI Courses • Prompt Engineering • AI Graphic Design • AI Video • AI Copywriting • AI Automation • n8n • Lovable • Chatbots</span>
            <span className="opacity-30">•</span>
            <span>Vetted Talent Network T1-T5 • Escrow Paystack • QA on every task • NDA • Fixed-Quote Guarantee • Fast Response Worldwide TZ</span>
            <span className="opacity-30">•</span>
          </div>
        </div>
      </section>

      {/* SERVICES — Official, 80 but show 8 categories */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <Reveal>
            <div className="flex items-end justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary"><Sparkles className="h-3.5 w-3.5" /> 80 Services • One Bureau • Worldwide</div>
                <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Every digital service in the world, handled officially.</h2>
                <p className="mt-3 max-w-2xl text-sm text-muted-foreground">From brand identity to AI agents, from landing page to SaaS boilerplate. Search 80, get fixed quote in 4h worldwide, escrow secured.</p>
              </div>
              <Link to="/services" className="hidden items-center gap-1 text-sm font-semibold text-primary sm:inline-flex">Browse all 80 worldwide <ArrowRight className="h-4 w-4" /></Link>
            </div>
          </Reveal>
          <Stagger className="mt-10 grid gap-px rounded-2xl border border-border bg-border">
            {servicesPreview.map((c) => (
              <StaggerItem key={c.title}>
                <Link to="/services" className="group flex h-full flex-col bg-card p-6 transition hover:bg-secondary/40">
                  <div className="flex items-center justify-between">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#0A0E2A] text-white"><c.icon className="h-5 w-5" /></div>
                    <span className="rounded-full border bg-secondary/50 px-2 py-0.5 text-xs text-muted-foreground">{c.items} services • Worldwide</span>
                  </div>
                  <div className="mt-4 text-base font-semibold tracking-tight">{c.title}</div>
                  <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground group-hover:text-foreground">Explore worldwide <ArrowRight className="h-3 w-3 transition group-hover:translate-x-0.5" /></div>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
          <div className="mt-8 flex justify-center sm:hidden"><Link to="/services"><Button variant="outline" className="w-full">Browse all 80 services worldwide</Button></Link></div>
        </div>
      </section>

      {/* HOW WE OPERATE — Official with images */}
      <section className="border-y border-border bg-secondary/30 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <Reveal>
            <div className="mx-auto max-w-3xl text-center">
              <div className="text-xs font-bold uppercase tracking-widest text-primary">How We Operate • Official Bureau • Worldwide</div>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Official bureau process — 3 steps, no freelancer roulette.</h2>
            </div>
          </Reveal>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              { n: "01", t: "Brief in 2 minutes — Worldwide", d: "Client submits project type, services multi, description, files. Free, no card. PM reviews instantly in your timezone. Worldwide TZ coverage." },
              { n: "02", t: "PM scopes + assigns — Worldwide", d: "PM gives fixed quote in 4h worldwide, assigns vetted anonymous talent ID NDH-XXXX for privacy. Client never sees talent real name, never chats directly — PM handles." },
              { n: "03", t: "Escrow + QA + Delivery — Worldwide", d: "Money held Paystack escrow per milestone. Talent works, PM QA + revision, delivers source files + docs + QA sign-off. Release on approval. NDA + fixed-quote guarantee worldwide." },
            ].map((s, i) => (
              <Reveal key={s.n} delay={i * 0.1}>
                <div className="h-full rounded-2xl border bg-card p-6 shadow-sm transition hover:shadow-md">
                  <div className="text-xs font-mono text-muted-foreground">{s.n} • WORLDWIDE</div>
                  <div className="mt-3 text-base font-semibold tracking-tight">{s.t}</div>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{s.d}</p>
                  <div className="mt-4 h-1 w-12 rounded-full bg-primary/20" />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ACADEMY — 40 Courses, no coming soon, pricing */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
            <Reveal>
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary">Academy • 40 AI Courses • 6 Schools • Worldwide • No Coming Soon</div>
                <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">Learn AI you can implement tomorrow — curated from YouTube, worldwide curriculum.</h2>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">Each course: 6 learning objectives (feeds AI exam), project theme (feeds AI unique brief per student), 8 real YouTube tutorials, AI grading, Director approval, QR-verified certificate, talent pipeline to earn. From Prompt Engineering to AI Agents n8n to Sora video. Pricing fair worldwide: Nigeria ₦4,900-9,900, Africa $5-12, Global $9-19.</p>
                <div className="mt-6 grid grid-cols-2 gap-2 text-xs">
                  {["AI Writing 6 Courses", "AI Design 7 Courses", "AI Media 8 Courses", "AI Marketing 7 Courses", "AI Tech 8 Courses", "AI Business 4 Courses"].map((s) => <span key={s} className="rounded-full border bg-secondary/30 px-3 py-1.5 text-center font-medium">{s} • Worldwide</span>)}
                </div>
                <div className="mt-6 flex flex-wrap gap-2">
                  <Link to="/academy"><Button variant="brand">Explore 40 AI Courses — Worldwide</Button></Link>
                  <Link to="/verify"><Button variant="outline">Verify Certificate QR Worldwide</Button></Link>
                </div>
                <div className="mt-6 rounded-xl border bg-card p-4">
                  <div className="text-xs font-bold uppercase tracking-widest">Pricing — Correct & Fair Worldwide</div>
                  <div className="mt-3 grid grid-cols-3 gap-3 text-xs">
                    <div><div className="font-bold">Nigeria</div><div className="text-muted-foreground">₦4,900-9,900</div></div>
                    <div><div className="font-bold">Africa</div><div className="text-muted-foreground">$5-12</div></div>
                    <div><div className="font-bold">Global</div><div className="text-muted-foreground">$9-19 • Fair</div></div>
                  </div>
                  <div className="mt-2 text-[10px] text-muted-foreground">All regions fair, editable per course in academy_pricing. No coming soon — all 40 available.</div>
                </div>
              </div>
            </Reveal>
            <Reveal delay={0.2}>
              <div className="space-y-3">
                <img src={academyStudents} alt="Academy Students AI Learning" className="aspect-video w-full rounded-2xl object-cover ring-1 ring-border" />
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    { school: "AI Design", course: "AI Graphic Design — Midjourney + Canva AI", price: "₦6,900 / $15" },
                    { school: "AI Media", course: "AI Video Editing — Descript + Runway Gen-3", price: "₦6,900 / $15" },
                    { school: "AI Writing", course: "AI Copywriting — ChatGPT AIDA/PAS", price: "₦4,900 / $10" },
                    { school: "AI Tech", course: "Build AI Agents with n8n + Supabase", price: "₦9,900 / $19" },
                  ].map((c) => (
                    <div key={c.course} className="rounded-xl border bg-card p-4 shadow-sm transition hover:shadow-md">
                      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{c.school} • Worldwide</div>
                      <div className="mt-1 text-sm font-semibold leading-tight">{c.course}</div>
                      <div className="mt-2 flex items-center justify-between"><span className="text-xs font-bold">{c.price} • Fair</span><span className="text-[10px] text-muted-foreground">8 YouTube lessons • Worldwide</span></div>
                    </div>
                  ))}
                </div>
                <Link to="/academy" className="flex w-full items-center justify-center gap-1 rounded-xl border bg-secondary/30 p-3 text-sm font-semibold hover:bg-secondary/50">View all 40 AI courses worldwide — Categorized <ArrowRight className="h-4 w-4" /></Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* FINAL CTA — Official Worldwide 10T */}
      <section className="border-t border-border bg-[#0A0E2A] py-16 text-white sm:py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mx-auto flex justify-center"><img src={officeWorkspace} alt="Bureau Workspace" className="h-20 w-32 rounded-xl object-cover ring-1 ring-white/10" /></div>
            <h2 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">Official bureau for teams that can't afford freelancer roulette — worldwide.</h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-white/60">80 services handled, 40 AI courses curated from YouTube, vetted talent network T1-T5, escrow via Paystack, QA on every task, QR-verified certificates, talent pipeline. HQ Nigeria, serving worldwide Nigeria to worldwide clients, all timezones. Fast Response worldwide. Official, not marketplace.</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link to="/start-project"><Button size="lg" className="bg-white text-black hover:bg-white/90">Start a Project — Free scoping worldwide • 4h quote</Button></Link>
              <Link to="/about"><Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10">About NDH — Official Worldwide</Button></Link>
            </div>
            <div className="mt-6 flex flex-wrap justify-center gap-4 text-xs text-white/40">
              <span>✓ Free scoping worldwide</span><span>✓ Fixed quote in 4h worldwide</span><span>✓ Source files + NDA</span><span>✓ Paystack escrow worldwide</span><span>✓ Fixed-Quote Guarantee worldwide</span>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
