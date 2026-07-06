import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Section } from "@/components/site/Section";
import { AnimatedBlobs } from "@/components/site/AnimatedBlobs";
import { Reveal, Stagger, StaggerItem } from "@/components/site/Reveal";
import { useQuery } from "@tanstack/react-query";
import { listPublicTalents } from "@/lib/talent-portfolio.functions";

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
  return (
    <SiteLayout>
      <section className="relative isolate overflow-hidden bg-hero py-24 text-white">
        <AnimatedBlobs />
        <div className="relative mx-auto max-w-7xl px-6">
          <Reveal>
            <div className="text-xs font-semibold uppercase tracking-widest text-white/70">Talent</div>
            <h1 className="mt-3 max-w-3xl text-4xl font-extrabold sm:text-5xl">Meet the bureau.</h1>
            <p className="mt-4 max-w-2xl text-white/75">Public profiles from the NDH talent pool. Browse skills, portfolios and availability.</p>
          </Reveal>
        </div>
      </section>
      <Section>
        {isLoading ? (
          <p className="text-center text-sm text-muted-foreground">Loading talent…</p>
        ) : items.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground">Public profiles will appear here as talents publish them.</p>
        ) : (
          <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((t) => (
              <StaggerItem key={t.user_id}>
                <Link to="/talent/$slug" params={{ slug: t.public_slug! }} className="group block h-full overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:shadow-elegant">
                  <div className="flex items-center gap-4">
                    {t.profile?.avatar_url ? (
                      <img src={t.profile.avatar_url} alt="" className="h-14 w-14 rounded-full object-cover" />
                    ) : (
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
                        {(t.profile?.full_name ?? "?").slice(0, 1).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div className="font-bold">{t.profile?.full_name ?? "Talent"}</div>
                      {t.headline && <div className="text-xs text-muted-foreground">{t.headline}</div>}
                    </div>
                  </div>
                  {t.bio && <p className="mt-4 line-clamp-3 text-sm text-muted-foreground">{t.bio}</p>}
                  {t.skills && t.skills.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1">
                      {t.skills.slice(0, 6).map((s) => <span key={s} className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold">{s}</span>)}
                    </div>
                  )}
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        )}
      </Section>
    </SiteLayout>
  );
}