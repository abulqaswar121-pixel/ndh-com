import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Section } from "@/components/site/Section";
import { useQuery } from "@tanstack/react-query";
import { listPublicTalents } from "@/lib/talent-portfolio.functions";
import { Button } from "@/components/ui/button";
import { talentCodeFor, tierLabel } from "@/lib/talent-id";
import { ShieldCheck, Clock, Search } from "lucide-react";

export const Route = createFileRoute("/talent/")({
  head: () => ({
    meta: [
      { title: "Talent Directory — Meet the NDH bureau | NDH" },
      { name: "description", content: "Browse public profiles of NDH designers, engineers, marketers, and creators available for projects." },
      { property: "og:title", content: "NDH Talent Directory" },
      { property: "og:description", content: "Vetted specialists across design, engineering, marketing, and content." },
    ],
    links: [{ rel: "canonical", href: "/talent" }],
  }),
  component: TalentDirectoryPage,
});

function TalentDirectoryPage() {
  const { data: items = [], isLoading } = useQuery({
    queryKey: ["public-talents"],
    queryFn: () => listPublicTalents(),
  });
  const [q, setQ] = useState("");
  const [tier, setTier] = useState<string>("All");

  const tiers = useMemo(() => {
    const set = new Set<string>();
    items.forEach((t) => { if (t.tier != null) set.add(String(t.tier)); });
    return ["All", ...Array.from(set).sort()];
  }, [items]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return items.filter((t) => {
      if (tier !== "All" && String(t.tier) !== tier) return false;
      if (!needle) return true;
      return (
        (t.headline ?? "").toLowerCase().includes(needle) ||
        (t.skills ?? []).some((s) => s.toLowerCase().includes(needle))
      );
    });
  }, [items, q, tier]);

  return (
    <SiteLayout>
      <section className="border-b border-border bg-background">
        <div className="mx-auto max-w-7xl px-6 py-14 sm:py-16">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Talent directory</div>
          <h1 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl">
            Vetted specialists, referenced by Talent ID.
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
            NDH runs a private roster. Talent is presented by role, tier and skills — identities stay protected until you engage. Reference any specialist in your brief using their Talent ID.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-primary" /> Interviewed &amp; tested</span>
            <span className="inline-flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-primary" /> Typical response &lt; 4h</span>
          </div>
        </div>
      </section>

      <Section>
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by role or skill…"
              className="w-full rounded-md border border-border bg-card py-2 pl-9 pr-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {tiers.map((t) => (
              <button
                key={t}
                onClick={() => setTier(t)}
                className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
                  tier === t
                    ? "border-primary/40 bg-secondary text-foreground"
                    : "border-border bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                {t === "All" ? "All tiers" : tierLabel(/^\d+$/.test(t) ? Number(t) : t)}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <p className="text-center text-sm text-muted-foreground">Loading talent…</p>
        ) : filtered.length === 0 ? (
          <div className="rounded-lg border border-border bg-card p-10 text-center text-sm text-muted-foreground">
            No talent matches these filters yet. Try broadening your search or brief a project — a PM will match you directly.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((t) => {
              const code = talentCodeFor(t.user_id, t.headline ?? undefined);
              return (
                <div
                  key={t.user_id}
                  className="flex h-full flex-col rounded-lg border border-border bg-card p-5"
                >
                  <div className="flex items-start justify-between">
                    <div className="font-mono text-xs font-semibold text-primary">{code}</div>
                    {t.tier && (
                      <span className="rounded-full border border-border bg-secondary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                        {tierLabel(t.tier)}
                      </span>
                    )}
                  </div>
                  <div className="mt-3 text-base font-semibold">
                    {t.headline || "Specialist"}
                  </div>
                  {t.skills && t.skills.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {t.skills.slice(0, 5).map((s) => (
                        <span key={s} className="rounded-md bg-secondary px-2 py-0.5 text-[11px] font-medium text-muted-foreground">{s}</span>
                      ))}
                    </div>
                  )}
                  <div className="mt-4 grid grid-cols-2 gap-2 border-t border-border pt-3 text-xs text-muted-foreground">
                    <div>
                      <div className="text-[10px] uppercase tracking-wide">Experience</div>
                      <div className="mt-0.5 font-medium text-foreground">
                        {typeof t.years_experience === "number" ? `${t.years_experience}+ yrs` : "—"}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-wide">Availability</div>
                      <div className="mt-0.5 font-medium text-foreground">
                        {t.hourly_rate ? "Open to briefs" : "By request"}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <Link to="/talent/$slug" params={{ slug: t.public_slug! }} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">View profile</Button>
                    </Link>
                    <Link
                      to="/start-project"
                      search={{ ref: code } as never}
                      className="flex-1"
                    >
                      <Button variant="brand" size="sm" className="w-full">Request</Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Section>
    </SiteLayout>
  );
}