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
  type Course = NonNullable<typeof data>["courses"][number];
  const bySchool = useMemo(() => {
    const map: Record<string, Course[]> = {};
    (data?.courses ?? []).forEach((c) => { (map[c.school_id] ||= []).push(c); });
    return map;
  }, [data]);

  const priceFor = (tier: string) => data?.pricing.find((p) => p.region === region && p.tier === tier);
  const fmt = (amt: number) => `${regionMeta.symbol}${amt.toLocaleString()}`;

  return (
    <SiteLayout>
      <section className="border-b border-border bg-background">
        <div className="mx-auto max-w-7xl px-6 py-14 sm:py-16">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            <Sparkles className="h-3.5 w-3.5" /> NDH Academy
          </div>
          <h1 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl">
            Six AI schools. Twenty-three practical courses.
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
            Learn AI-powered skills across writing, design, media, marketing, tech and business support. Certify, then join our talent pool for real, paid work.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><GraduationCap className="h-3.5 w-3.5 text-primary" /> AI-first curriculum</span>
            <span className="inline-flex items-center gap-1.5"><Award className="h-3.5 w-3.5 text-primary" /> Verifiable certificates</span>
            <span className="inline-flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5 text-primary" /> Talent pool pipeline</span>
          </div>
        </div>
      </section>

      <Section>
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Choose your school</h2>
            <p className="mt-1 text-sm text-muted-foreground">Six focused schools. Twenty-three courses. Real skills.</p>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Region</label>
            <select value={region} onChange={(e) => setRegion(e.target.value)} className="rounded-md border border-border bg-card px-3 py-2 text-sm">
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
                  <div className="grid h-11 w-11 place-items-center rounded-md bg-secondary text-primary">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold tracking-tight sm:text-2xl">{school.name}</h3>
                    <p className="text-sm text-muted-foreground">{school.description}</p>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {courses.map((c) => {
                    const prices = c.region_prices as Record<string, number> | null;
                    const amt = prices?.[region];
                    return (
                      <div key={c.id} className="group rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary/40">
                        <div className="text-base font-semibold">{c.name}</div>
                        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{c.description}</p>
                        <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                          <span className="text-sm font-semibold">{amt ? fmt(amt) : "Contact us"}</span>
                          <span className="text-xs text-primary opacity-0 transition group-hover:opacity-100">Coming soon →</span>
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

      <Section className="bg-secondary/40">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Simple, regional pricing</h2>
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
              <div key={tier} className={`rounded-lg border p-6 ${tier === "school" ? "border-primary/40 bg-card" : "border-border bg-card"}`}>
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{labels[tier]}</div>
                <div className="mt-2 text-3xl font-semibold tracking-tight">
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
