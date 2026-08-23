import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Globe, Award, Clock, BookOpen, Sparkles } from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "@/components/site/Reveal";
import { Link } from "@tanstack/react-router";

type Course = { id: string; slug: string; name: string; description: string | null; prices: any };

const FALLBACK_40 = [
  { id: "ai-copywriting", name: "AI Copywriting", desc: "Ads, landing pages, emails that convert with ChatGPT AIDA/PAS", school: "AI Writing", price: 4900 },
  { id: "ai-graphic-design", name: "AI Graphic Design", desc: "Midjourney + Canva AI + Firefly", school: "AI Design", price: 6900 },
  { id: "ai-video-editing", name: "AI Video Editing", desc: "Descript + Runway Gen-3", school: "AI Media", price: 6900 },
  { id: "ai-voice-cloning", name: "AI Voice Cloning & Dubbing", desc: "ElevenLabs clone voice", school: "AI Media", price: 6900 },
  { id: "ai-agents-n8n", name: "Build AI Agents with n8n", desc: "No-code AI agents Telegram + Supabase", school: "AI Tech", price: 9900 },
  { id: "prompt-engineering", name: "Prompt Engineering Masterclass", desc: "ChatGPT, Claude, Gemini prompts 10x", school: "AI Tech", price: 4900 },
  { id: "ai-social-media", name: "AI Social Media Management", desc: "30-day calendar ChatGPT + Canva AI", school: "AI Marketing", price: 6900 },
  { id: "no-code-ai-apps", name: "No-Code AI Apps with Lovable", desc: "Ship products Lovable + Supabase", school: "AI Tech", price: 9900 },
];

export function BrowseCourses() {
  const [q, setQ] = useState("");
  const [courses, setCourses] = useState<any[]>(FALLBACK_40);
  const [tier, setTier] = useState("all");

  useEffect(() => {
    supabase.from("academy_courses").select("id,slug,name,description").eq("is_published", true).limit(40).then(({ data }) => {
      if (data && data.length > 0) {
        setCourses(data.map((c: any) => ({ id: c.id, name: c.name, desc: c.description, school: "AI Academy", price: 6900 })));
      }
    });
  }, []);

  const filtered = useMemo(() => {
    const needle = q.toLowerCase();
    return courses.filter(c => !needle || c.name.toLowerCase().includes(needle) || c.desc.toLowerCase().includes(needle));
  }, [courses, q]);

  return (
    <div className="space-y-6">
      <Reveal>
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-3 py-1 text-xs text-muted-foreground"><Globe className="h-3.5 w-3.5" /> Worldwide • 40 AI Courses • No Coming Soon • All Available • Fair Pricing NG ₦4,900-9,900 Global $9-19</div>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight">Browse 40 AI Courses — Worldwide Academy</h1>
          <p className="mt-1 text-sm text-muted-foreground">Curated from YouTube, implement tomorrow. 6 schools, 40 courses, QR-verified certificates, talent pipeline to earn. Fair pricing worldwide, no coming soon.</p>
        </div>
      </Reveal>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search 40 AI courses worldwide — e.g. Midjourney, n8n, Sora..." value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
        </div>
        <div className="flex gap-2 text-xs">
          <span className="rounded-full border bg-secondary/50 px-3 py-1.5">6 Schools • Worldwide</span>
          <span className="rounded-full border bg-secondary/50 px-3 py-1.5">40 Courses • No Coming Soon</span>
          <span className="rounded-full border bg-secondary/50 px-3 py-1.5">From ₦4,900 • $9 • Fair</span>
        </div>
      </div>

      <Stagger className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((c) => (
          <StaggerItem key={c.id}>
            <div className="group flex h-full flex-col rounded-2xl border bg-card p-5 shadow-sm transition hover:border-primary/20 hover:shadow-md">
              <div className="flex items-start justify-between gap-2">
                <div className="text-sm font-bold leading-tight">{c.name}</div>
                <Badge variant="secondary" className="text-xs">₦{c.price} • ${Math.round(c.price/500)} • Worldwide</Badge>
              </div>
              <div className="mt-1 text-xs text-muted-foreground">{c.school} • Worldwide • QR Verified • 8 YouTube lessons</div>
              <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{c.desc}</p>
              <div className="mt-3 flex flex-wrap gap-1">
                <span className="rounded-full border bg-secondary/30 px-2 py-0.5 text-[10px]">AI exam + project</span>
                <span className="rounded-full border bg-secondary/30 px-2 py-0.5 text-[10px]">Talent pipeline</span>
              </div>
              <div className="mt-4 flex items-center justify-between border-t pt-3">
                <span className="text-xs text-muted-foreground">Fair pricing • Worldwide</span>
                <Link to="/academy" className="text-xs font-semibold text-primary">Enroll worldwide →</Link>
              </div>
            </div>
          </StaggerItem>
        ))}
      </Stagger>

      <Reveal>
        <div className="rounded-2xl border border-dashed bg-secondary/20 p-8 text-center">
          <Sparkles className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-3 text-sm font-medium">40 AI Courses — All Categorized, Fair Pricing Worldwide, No Coming Soon</p>
          <p className="text-xs text-muted-foreground">Nigeria ₦4,900-9,900 • Africa $5-12 • Global $9-19 • All 40 available now, curated from YouTube, implement tomorrow, QR-verified, talent pipeline worldwide. Trusted worldwide.</p>
          <div className="mt-4 flex justify-center gap-2">
            <Link to="/academy"><Button size="sm" variant="brand">Explore Academy Worldwide — 40 Courses</Button></Link>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
