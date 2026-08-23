import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Section } from "@/components/site/Section";
import { Button } from "@/components/ui/button";
import { listSchoolsWithCourses } from "@/lib/academy/schools.functions";
import { GraduationCap, Award, Sparkles, PenLine, Palette, Film, Megaphone, Cpu, Briefcase, Globe, CheckCircle2 } from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "@/components/site/Reveal";

export const Route = createFileRoute("/academy")({
  component: AcademyPage,
  head: () => ({
    meta: [
      { title: "NDH Academy — 6 AI Schools, 40 AI Courses, No Coming Soon" },
      { name: "description", content: "Learn 40 AI skills you can implement tomorrow, curated from YouTube. 6 schools, regional fair pricing NG ₦4,900-9,900 US $9-19, QR-verified certificates, talent pipeline, worldwide." },
    ],
  }),
});

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  PenLine, Palette, Film, Megaphone, Cpu, Briefcase,
};

const REGIONS = [
  { code: "NG", label: "Nigeria", currency: "NGN", symbol: "₦", desc: "Fair pricing Nigeria" },
  { code: "US", label: "United States", currency: "USD", symbol: "$", desc: "Global" },
  { code: "UK", label: "United Kingdom", currency: "GBP", symbol: "£", desc: "Global" },
  { code: "EU", label: "Europe", currency: "EUR", symbol: "€", desc: "Global" },
  { code: "CA", label: "Canada", currency: "CAD", symbol: "C$", desc: "Global" },
] as const;

const SCHOOLS_FALLBACK = [
  { id: "writing", name: "School of AI Writing", description: "Copy, SEO, scripts, email, e-books — write that sells", icon: "PenLine" },
  { id: "design", name: "School of AI Design", description: "Brand, UI/UX, illustration, packaging, presentation — design with AI", icon: "Palette" },
  { id: "media", name: "School of AI Media", description: "Video editing, generation, podcast, music, voiceover, thumbnails", icon: "Film" },
  { id: "marketing", name: "School of AI Marketing", description: "Social media, paid ads, email, SEO, research, funnel", icon: "Megaphone" },
  { id: "tech", name: "School of AI Tech", description: "Prompt engineering, AI agents n8n, no-code apps Lovable, automation, chatbots", icon: "Cpu" },
  { id: "business", name: "School of AI Business Support", description: "VA, customer support, project management, data analysis, CRM", icon: "Briefcase" },
];

const COURSES_FALLBACK = [
  // Writing 6
  { id: "ai-copywriting", school_id: "writing", name: "AI Copywriting", description: "Ads, landing pages, emails that convert with ChatGPT AIDA/PAS", prices: { NG: 4900, US: 10, UK: 9, EU: 9, CA: 12 } },
  { id: "ai-blog-seo", school_id: "writing", name: "AI Blogging & SEO", description: "Rank with AI — keyword research, SurferSEO, 1500+ words", prices: { NG: 4900, US: 10, UK: 9, EU: 9, CA: 12 } },
  { id: "ai-email", school_id: "writing", name: "AI Email & Newsletter", description: "Emails that get opened & clicked with AI", prices: { NG: 4900, US: 10, UK: 9, EU: 9, CA: 12 } },
  { id: "ai-scriptwriting", school_id: "writing", name: "AI Scriptwriting", description: "YouTube, TikTok, Podcast scripts with AI", prices: { NG: 4900, US: 10, UK: 9, EU: 9, CA: 12 } },
  { id: "ai-technical-writing", school_id: "writing", name: "AI Technical Writing", description: "Docs, API docs, user guides with AI", prices: { NG: 4900, US: 10, UK: 9, EU: 9, CA: 12 } },
  { id: "ai-ghostwriting", school_id: "writing", name: "AI Ghostwriting & E-books", description: "Ghostwrite books, LinkedIn, e-books with AI", prices: { NG: 6900, US: 12, UK: 10, EU: 10, CA: 12 } },
  // Design 7
  { id: "ai-graphic-design", school_id: "design", name: "AI Graphic Design", description: "Midjourney + Canva AI + Firefly — logos, brand kits, social", prices: { NG: 6900, US: 15, UK: 12, EU: 12, CA: 15 } },
  { id: "ai-branding", school_id: "design", name: "AI Branding & Identity", description: "Complete brand system with AI — logo, palette, guidelines", prices: { NG: 6900, US: 15, UK: 12, EU: 12, CA: 15 } },
  { id: "ai-ui-ux", school_id: "design", name: "AI UI/UX Design", description: "Figma AI + Uizard + Galileo — landing pages, dashboards", prices: { NG: 6900, US: 15, UK: 12, EU: 12, CA: 15 } },
  { id: "ai-illustration", school_id: "design", name: "AI Illustration & Icons", description: "Icons, illustrations, mascots with AI", prices: { NG: 4900, US: 10, UK: 9, EU: 9, CA: 12 } },
  { id: "ai-packaging", school_id: "design", name: "AI Packaging & Mockups", description: "Box, label, pouch, 3D mockups with AI", prices: { NG: 6900, US: 12, UK: 10, EU: 10, CA: 12 } },
  { id: "ai-presentation", school_id: "design", name: "AI Presentation Design", description: "Tome + Gamma — pitch decks that close", prices: { NG: 4900, US: 10, UK: 9, EU: 9, CA: 12 } },
  { id: "ai-logo-gen", school_id: "design", name: "AI Logo Generation", description: "Fast logos with Midjourney + Vectorizer", prices: { NG: 4900, US: 10, UK: 9, EU: 9, CA: 12 } },
  // Media 8
  { id: "ai-video-editing", school_id: "media", name: "AI Video Editing", description: "Descript AI — edit by transcript, filler removal, captions", prices: { NG: 6900, US: 15, UK: 12, EU: 12, CA: 15 } },
  { id: "ai-video-gen", school_id: "media", name: "AI Video Generation", description: "Runway Gen-3, Sora, Kling — cinematic video from image", prices: { NG: 6900, US: 15, UK: 12, EU: 12, CA: 15 } },
  { id: "ai-photo-retouch", school_id: "media", name: "AI Photo Retouching", description: "Firefly, Photoroom — background removal, retouch", prices: { NG: 4900, US: 10, UK: 9, EU: 9, CA: 12 } },
  { id: "ai-podcast", school_id: "media", name: "AI Podcast Production", description: "Adobe Podcast — noise removal, edit, show notes", prices: { NG: 4900, US: 10, UK: 9, EU: 9, CA: 12 } },
  { id: "ai-music", school_id: "media", name: "AI Music Generation", description: "Suno, Udio — jingles, podcast intro", prices: { NG: 4900, US: 10, UK: 9, EU: 9, CA: 12 } },
  { id: "ai-voice-cloning", school_id: "media", name: "AI Voice Cloning & Dubbing", description: "ElevenLabs — clone voice, dub videos", prices: { NG: 6900, US: 12, UK: 10, EU: 10, CA: 12 } },
  { id: "ai-thumbnail", school_id: "media", name: "AI Thumbnail & Shorts", description: "Thumbnails that click, shorts from long via OpusClip", prices: { NG: 4900, US: 10, UK: 9, EU: 9, CA: 12 } },
  { id: "ai-animation", school_id: "media", name: "AI Animation & Avatar", description: "HeyGen, D-ID, Pika — avatar videos, animation", prices: { NG: 6900, US: 12, UK: 10, EU: 10, CA: 12 } },
  // Marketing 7
  { id: "ai-social-media", school_id: "marketing", name: "AI Social Media Management", description: "30-day calendar with ChatGPT + Canva AI + Make auto-post", prices: { NG: 6900, US: 12, UK: 10, EU: 10, CA: 12 } },
  { id: "ai-paid-ads", school_id: "marketing", name: "AI Paid Ads — Meta & Google", description: "AdCreative.ai + ChatGPT — ROAS campaigns", prices: { NG: 6900, US: 15, UK: 12, EU: 12, CA: 15 } },
  { id: "ai-email-marketing", school_id: "marketing", name: "AI Email Marketing Automation", description: "Brevo/Mailchimp + AI flows welcome, abandoned, winback", prices: { NG: 6900, US: 12, UK: 10, EU: 10, CA: 12 } },
  { id: "ai-seo-auto", school_id: "marketing", name: "AI SEO Automation", description: "SurferSEO + AI — rank higher", prices: { NG: 6900, US: 12, UK: 10, EU: 10, CA: 12 } },
  { id: "ai-market-research", school_id: "marketing", name: "AI Market Research", description: "Competitor + customer research with AI", prices: { NG: 4900, US: 10, UK: 9, EU: 9, CA: 12 } },
  { id: "ai-influencer", school_id: "marketing", name: "AI Influencer Outreach", description: "Find influencers, personalize outreach with AI", prices: { NG: 6900, US: 12, UK: 10, EU: 10, CA: 12 } },
  { id: "ai-funnel", school_id: "marketing", name: "AI Funnel Building", description: "Lead magnet, email sequence, checkout with AI", prices: { NG: 6900, US: 12, UK: 10, EU: 10, CA: 12 } },
  // Tech 8
  { id: "prompt-engineering", school_id: "tech", name: "Prompt Engineering Masterclass", description: "ChatGPT, Claude, Gemini prompts that 10x output", prices: { NG: 4900, US: 10, UK: 9, EU: 9, CA: 12 } },
  { id: "ai-agents-n8n", school_id: "tech", name: "Build AI Agents with n8n", description: "No-code AI agents Telegram + Supabase + GPT that see, speak, email", prices: { NG: 9900, US: 19, UK: 16, EU: 16, CA: 19 } },
  { id: "no-code-ai-apps", school_id: "tech", name: "No-Code AI Apps with Lovable", description: "Ship products with Lovable + Supabase + Paystack no-code", prices: { NG: 9900, US: 19, UK: 16, EU: 16, CA: 19 } },
  { id: "ai-workflow-auto", school_id: "tech", name: "AI Workflow Automation", description: "Zapier, Make, n8n + AI — save 15h/week", prices: { NG: 6900, US: 12, UK: 10, EU: 10, CA: 12 } },
  { id: "ai-chatbot", school_id: "tech", name: "AI Chatbot for WhatsApp & Website", description: "ManyChat, Voiceflow — FAQs, order tracking, lead capture", prices: { NG: 6900, US: 12, UK: 10, EU: 10, CA: 12 } },
  { id: "ai-app-deploy", school_id: "tech", name: "AI App Deployment & API", description: "Deploy Next.js + Supabase + domain + SSL", prices: { NG: 6900, US: 12, UK: 10, EU: 10, CA: 12 } },
  { id: "ai-code-assistant", school_id: "tech", name: "AI Code Assistant", description: "Cursor + Copilot — code 10x faster", prices: { NG: 6900, US: 12, UK: 10, EU: 10, CA: 12 } },
  { id: "ai-gpt-store", school_id: "tech", name: "Build Your Own GPT Store", description: "Custom GPTs + Assistant API + knowledge base", prices: { NG: 6900, US: 12, UK: 10, EU: 10, CA: 12 } },
  // Business 4
  { id: "ai-va", school_id: "business", name: "AI Virtual Assistant", description: "Modern VA with AI — inbox, calendar, research, data entry", prices: { NG: 4900, US: 10, UK: 9, EU: 9, CA: 12 } },
  { id: "ai-customer-support", school_id: "business", name: "AI Customer Support", description: "Intercom Fin — AI answers 80% tickets", prices: { NG: 6900, US: 12, UK: 10, EU: 10, CA: 12 } },
  { id: "ai-project-mgmt", school_id: "business", name: "AI Project Management", description: "Notion AI + ClickUp AI — manage projects", prices: { NG: 4900, US: 10, UK: 9, EU: 9, CA: 12 } },
  { id: "ai-data-entry", school_id: "business", name: "AI Data Entry & Analysis", description: "Excel AI + ChatGPT Code Interpreter — automate data", prices: { NG: 4900, US: 10, UK: 9, EU: 9, CA: 12 } },
];

function detectRegion(): string {
  if (typeof navigator === "undefined") return "NG";
  const lang = navigator.language.toUpperCase();
  if (lang.includes("GB") || lang.includes("UK")) return "UK";
  if (lang.includes("CA")) return "CA";
  if (lang.includes("US")) return "US";
  if (/DE|FR|ES|IT|NL|PT|SE|FI|DK|PL|IE/.test(lang)) return "EU";
  return "NG";
}

function AcademyPage() {
  const fetchData = useServerFn(listSchoolsWithCourses);
  const { data } = useQuery({ queryKey: ["academy-schools"], queryFn: () => fetchData() });
  const [region, setRegion] = useState<string>("NG");
  useEffect(() => { setRegion(detectRegion()); }, []);

  const regionMeta = REGIONS.find((r) => r.code === region) ?? REGIONS[0];
  const useFallback = !data || (data.courses?.length ?? 0) === 0;
  const schools = useFallback ? SCHOOLS_FALLBACK : (data?.schools ?? []);
  const allCourses = useFallback ? COURSES_FALLBACK : [];

  const bySchool = useMemo(() => {
    const map: Record<string, typeof COURSES_FALLBACK> = {};
    if (useFallback) {
      allCourses.forEach((c) => { (map[c.school_id] ||= []).push(c as any); });
    } else {
      (data?.courses ?? []).forEach((c: any) => { (map[c.school_id] ||= []).push({ ...c, prices: c.region_prices } as any); });
    }
    return map;
  }, [data, useFallback]);

  const fmt = (amt: number) => `${regionMeta.symbol}${amt.toLocaleString()}`;

  return (
    <SiteLayout>
      <section className="border-b border-border bg-[#0A0E2A] text-white">
        <div className="mx-auto max-w-7xl px-6 py-14 sm:py-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs tracking-wide text-white/70"><Globe className="h-3.5 w-3.5 text-teal-400" /> NDH Academy • 40 AI Courses • 6 Schools • No Coming Soon — All Available</div>
          <h1 className="mt-4 max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl">Six AI schools. Forty practical courses you can implement tomorrow.</h1>
          <p className="mt-3 max-w-2xl text-sm text-white/60">Learn AI-powered skills curated from YouTube, not theory. Each course: 6 learning objectives, project theme, 8 YouTube videos, AI exam + project grading, Director approval, QR-verified certificate, talent pipeline. Fair pricing worldwide — Nigeria ₦4,900-9,900, Global $9-19.</p>
          <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-white/50">
            <span className="inline-flex items-center gap-1.5"><GraduationCap className="h-3.5 w-3.5 text-teal-400" /> AI-first curriculum</span>
            <span className="inline-flex items-center gap-1.5"><Award className="h-3.5 w-3.5 text-blue-400" /> QR-verified</span>
            <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-purple-400" /> Talent pipeline • Worldwide</span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1"><span>Region:</span><select value={region} onChange={(e) => setRegion(e.target.value)} className="bg-transparent text-white outline-none"><option value="NG" className="text-black">Nigeria ₦</option><option value="US" className="text-black">US $</option><option value="UK" className="text-black">UK £</option><option value="EU" className="text-black">EU €</option><option value="CA" className="text-black">CA C$</option></select></span>
          </div>
        </div>
      </section>

      <Section>
        <div className="mb-10">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Choose your school — 40 courses, categorized, fairly priced worldwide</h2>
          <p className="mt-2 text-sm text-muted-foreground">No coming soon — all 40 available now. Curated from YouTube, implement tomorrow. Fair pricing: NG/EU/US/UK/CA.</p>
        </div>

        <div className="space-y-16">
          {schools.map((school: any) => {
            const Icon = (ICONS as any)[school.icon || "Sparkles"] || Sparkles;
            const courses = bySchool[school.id] ?? [];
            return (
              <div key={school.id}>
                <div className="mb-6 flex items-start gap-4">
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-[#0A0E2A] text-white"><Icon className="h-6 w-6" /></div>
                  <div><h3 className="text-xl font-bold tracking-tight sm:text-2xl">{school.name}</h3><p className="text-sm text-muted-foreground">{school.description} • {courses.length} courses</p></div>
                </div>
                <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {courses.map((c: any) => {
                    const price = (c.prices ?? c.region_prices ?? {})[region] ?? (c.prices?.NG ?? 6900);
                    return (
                      <StaggerItem key={c.id}>
                        <div className="group flex h-full flex-col rounded-2xl border bg-card p-5 shadow-sm transition hover:border-primary/20 hover:shadow-md">
                          <div className="flex items-start justify-between gap-2">
                            <div className="text-base font-semibold leading-tight">{c.name}</div>
                            <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-bold">{fmt(price)}</span>
                          </div>
                          <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{c.description}</p>
                          <div className="mt-3 flex flex-wrap gap-1">
                            <span className="rounded-full border bg-secondary/30 px-2 py-0.5 text-[10px]">8 YouTube lessons</span>
                            <span className="rounded-full border bg-secondary/30 px-2 py-0.5 text-[10px]">AI exam + project</span>
                            <span className="rounded-full border bg-secondary/30 px-2 py-0.5 text-[10px]">QR Verified</span>
                          </div>
                          <div className="mt-4 flex items-center justify-between border-t pt-3 text-xs">
                            <span className="text-muted-foreground">Fair pricing • {regionMeta.label}</span>
                            <Link to="/academy" className="font-semibold text-primary">Enroll now →</Link>
                          </div>
                        </div>
                      </StaggerItem>
                    );
                  })}
                </Stagger>
              </div>
            );
          })}
        </div>
      </Section>

      <Section className="bg-secondary/30">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Fair pricing worldwide — no coming soon, all 40 available</h2>
            <p className="mx-auto mt-2 max-w-2xl text-sm text-muted-foreground">Nigeria ₦4,900-9,900 • Africa $5-12 • Global $9-19 — correct, fair, editable per course. Paystack, USD, GBP, EUR, NGN. All courses available now, no waiting.</p>
          </div>
          <div className="mx-auto mt-8 grid max-w-4xl gap-4 md:grid-cols-3">
            <div className="rounded-2xl border bg-card p-6">
              <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Nigeria Fair</div>
              <div className="mt-2 text-3xl font-bold">₦4,900 — ₦9,900</div>
              <p className="mt-1 text-xs text-muted-foreground">Most popular in Nigeria. Paystack + transfer. Certificate + talent pipeline worldwide.</p>
              <div className="mt-4 flex items-center gap-1 text-xs text-green-600"><CheckCircle2 className="h-3.5 w-3.5" /> 40 courses available • No coming soon</div>
            </div>
            <div className="rounded-2xl border border-primary/20 bg-card p-6 shadow-sm">
              <div className="text-xs font-bold uppercase tracking-widest text-primary">Global Fair • Most Popular</div>
              <div className="mt-2 text-3xl font-bold">$9 — $19</div>
              <p className="mt-1 text-xs text-muted-foreground">US/UK/EU/CA fair. Stripe/PayPal. Worldwide access. Same certificate worldwide, QR-verified.</p>
              <div className="mt-4 flex items-center gap-1 text-xs text-green-600"><CheckCircle2 className="h-3.5 w-3.5" /> All 40 categorized</div>
            </div>
            <div className="rounded-2xl border bg-card p-6">
              <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Africa Fair</div>
              <div className="mt-2 text-3xl font-bold">$5 — $12</div>
              <p className="mt-1 text-xs text-muted-foreground">Africa fair pricing, mobile money, Paystack. Same quality worldwide.</p>
              <div className="mt-4 flex items-center gap-1 text-xs text-green-600"><CheckCircle2 className="h-3.5 w-3.5" /> 6 schools • 40 courses</div>
            </div>
          </div>
          <div className="mt-8 text-center"><Link to="/signup"><Button variant="brand" size="lg">Join Academy Worldwide — 40 Courses Available Now</Button></Link></div>
        </div>
      </Section>
    </SiteLayout>
  );
}
