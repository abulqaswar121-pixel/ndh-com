import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Section } from "@/components/site/Section";
import { Button } from "@/components/ui/button";
import { listSchoolsWithCourses } from "@/lib/academy/schools.functions";
import { GraduationCap, Award, Sparkles, PenLine, Palette, Film, Megaphone, Cpu, Briefcase } from "lucide-react";

export const Route = createFileRoute("/academy")({
  component: AcademyPage,
  head: () => ({
    meta: [
      { title: "NDH Academy — 6 AI Schools, 23 Courses" },
      { name: "description", content: "Learn AI-powered skills across Writing, Design, Media, Marketing, Tech, and Business Support. Certify. Earn." },
      { property: "og:title", content: "NDH Academy — 6 AI Schools" },
      { property: "og:description", content: "Master AI skills that pay. Learn → Certify → Earn." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  PenLine, Palette, Film, Megaphone, Cpu, Briefcase,
};

const REGIONS = [
  { code: "NG", label: "Nigeria", currency: "NGN", symbol: "₦" },
  { code: "US", label: "United States", currency: "USD", symbol: "$" },
  { code: "UK", label: "United Kingdom", currency: "GBP", symbol: "£" },
  { code: "EU", label: "Europe", currency: "EUR", symbol: "€" },
  { code: "CA", label: "Canada", currency: "CAD", symbol: "C$" },
] as const;

function detectRegion(): string {
  if (typeof navigator === "undefined") return "NG";
  const lang = navigator.language.toUpperCase();
  if (lang.includes("NG")) return "NG";
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
  const bySchool = useMemo(() => {
    const map: Record<string, typeof data extends { courses: infer C } ? C : never> = {} as never;
    (data?.courses ?? []).forEach((c) => { (map[c.school_id] ||= [] as never).push(c as never); });
    return map;
  }, [data]);

  const priceFor = (tier: string) => data?.pricing.find((p) => p.region === region && p.tier === tier);
  const fmt = (amt: number) => `${regionMeta.symbol}${amt.toLocaleString()}`;

  return (
    <SiteLayout>
      <section className="relative isolate overflow-hidden bg-hero text-white">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, oklch(0.1 0.06 268 / 0.9), oklch(0.08 0.05 268 / 0.98))" }} />
        <div className="relative mx-auto max-w-7xl px-6 py-24 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" /> NDH Academy
          </div>
          <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
            Six AI Schools.<br/><span className="text-[oklch(0.78_0.13_180)]">Twenty-three ways to earn.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-white/80">
            Learn → Certify → Earn. Master AI-powered skills and join our talent pool for real, paid work.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm">
            <span className="inline-flex items-center gap-1.5"><GraduationCap className="h-4 w-4 text-[oklch(0.78_0.13_180)]" /> AI-first curriculum</span>
            <span className="inline-flex items-center gap-1.5"><Award className="h-4 w-4 text-[oklch(0.78_0.13_180)]" /> Verifiable certificates</span>
            <span className="inline-flex items-center gap-1.5"><Sparkles className="h-4 w-4 text-[oklch(0.78_0.13_180)]" /> Talent pool pipeline</span>
          </div>
        </div>
      </section>

      <Section>
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl font-extrabold tracking-tight">Choose your school</h2>
            <p className="mt-1 text-sm text-muted-foreground">Six focused schools. Twenty-three courses. Real skills.</p>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Region</label>
            <select value={region} onChange={(e) => setRegion(e.target.value)} className="rounded-lg border border-border bg-background px-3 py-2 text-sm">
              {REGIONS.map((r) => <option key={r.code} value={r.code}>{r.label}</option>)}
            </select>
          </div>
        </div>

        <div className="space-y-16">
          {(data?.schools ?? []).map((school) => {
            const Icon = ICONS[school.icon || "Sparkles"] || Sparkles;
            const courses = bySchool[school.id] ?? [];
            return (
              <div key={school.id}>
                <div className="mb-6 flex items-start gap-4">
                  <div className="grid h-12 w-12 place-items-center rounded-xl bg-[oklch(0.65_0.19_252)]/10 text-[oklch(0.65_0.19_252)]">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-display text-2xl font-extrabold tracking-tight">{school.name}</h3>
                    <p className="text-sm text-muted-foreground">{school.description}</p>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {courses.map((c) => {
                    const prices = c.region_prices as Record<string, number> | null;
                    const amt = prices?.[region];
                    return (
                      <div key={c.id} className="group rounded-2xl border border-border bg-card p-5 transition hover:border-[oklch(0.65_0.19_252)]/40 hover:shadow-lg">
                        <div className="text-base font-bold">{c.name}</div>
                        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{c.description}</p>
                        <div className="mt-4 flex items-center justify-between">
                          <span className="text-sm font-semibold">{amt ? fmt(amt) : "Contact us"}</span>
                          <span className="text-xs text-[oklch(0.65_0.19_252)] opacity-0 transition group-hover:opacity-100">Coming soon →</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      <Section className="bg-secondary/30">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="font-display text-3xl font-extrabold tracking-tight">Simple, regional pricing</h2>
          <p className="mt-2 text-sm text-muted-foreground">Take one course, a full school, or unlock everything.</p>
        </div>
        <div className="mx-auto mt-8 grid max-w-5xl gap-4 md:grid-cols-3">
          {(["single", "school", "full"] as const).map((tier) => {
            const p = priceFor(tier);
            const labels = { single: "Single Course", school: "Full School", full: "All Access" };
            const desc = {
              single: "One course of your choice",
              school: "All courses in one school",
              full: "All 23 courses across 6 schools",
            };
            return (
              <div key={tier} className={`rounded-2xl border p-6 ${tier === "school" ? "border-[oklch(0.65_0.19_252)] bg-card shadow-lg" : "border-border bg-card"}`}>
                <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{labels[tier]}</div>
                <div className="mt-2 font-display text-3xl font-extrabold">
                  {p ? `${regionMeta.symbol}${Number(p.amount).toLocaleString()}` : "—"}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{desc[tier]}</p>
                <Button variant={tier === "school" ? "brand" : "outline"} className="mt-5 w-full" disabled>
                  Enrolment opens soon
                </Button>
              </div>
            );
          })}
        </div>
      </Section>
    </SiteLayout>
  );
}
