import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { getPublicTalent } from "@/lib/talent-portfolio.functions";
import { ShieldCheck, Clock, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { talentCodeFor, tierLabel } from "@/lib/talent-id";

export const Route = createFileRoute("/talent/$slug")({
  loader: async ({ params }) => {
    const t = await getPublicTalent({ data: { slug: params.slug } });
    if (!t) throw notFound();
    return t;
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${talentCodeFor(loaderData.user_id, loaderData.headline)} — ${loaderData.headline ?? "NDH Talent"} | NDH` },
          { name: "description", content: (loaderData.headline ?? "NDH vetted specialist.").slice(0, 155) },
          { property: "og:title", content: `${talentCodeFor(loaderData.user_id, loaderData.headline)} — NDH Talent` },
          { property: "og:description", content: loaderData.headline ?? "NDH vetted specialist." },
        ]
      : [{ title: "Talent — NDH" }],
  }),
  errorComponent: () => <SiteLayout><div className="mx-auto max-w-3xl p-12 text-center">Failed to load profile.</div></SiteLayout>,
  notFoundComponent: () => <SiteLayout><div className="mx-auto max-w-3xl p-12 text-center"><h1 className="text-2xl font-bold">Talent not found</h1><p className="mt-2 text-muted-foreground">This profile may be private or does not exist.</p><Link to="/talent" className="mt-4 inline-block text-primary underline">Back to directory</Link></div></SiteLayout>,
  component: TalentDetailPage,
});

function TalentDetailPage() {
  const t = Route.useLoaderData();
  const code = talentCodeFor(t.user_id, t.headline ?? undefined);
  return (
    <SiteLayout>
      <section className="border-b border-border bg-background">
        <div className="mx-auto max-w-5xl px-6 py-14">
          <Link to="/talent" className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground">
            ← Talent directory
          </Link>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className="font-mono text-sm font-semibold text-primary">{code}</span>
            {t.tier != null && (
              <span className="rounded-full border border-border bg-secondary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                {tierLabel(t.tier as never)}
              </span>
            )}
          </div>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            {t.headline || "NDH Vetted Specialist"}
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
            Reference this specialist in your brief with the Talent ID above. Identity is confirmed after engagement and NDA.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-6 py-12">
        <div className="grid gap-8 lg:grid-cols-3">
          <aside className="space-y-6">
            {t.skills && t.skills.length > 0 && (
              <div className="rounded-lg border border-border bg-card p-5">
                <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Skills</h3>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {t.skills.map((s: string) => (
                    <span key={s} className="rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-muted-foreground">{s}</span>
                  ))}
                </div>
              </div>
            )}
            <div className="rounded-lg border border-border bg-card p-5">
              <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">At a glance</h3>
              <dl className="mt-3 space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Briefcase className="h-4 w-4 text-primary" />
                  <span>
                    {typeof t.years_experience === "number" ? `${t.years_experience}+ years experience` : "Experience on request"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4 text-primary" />
                  <span>{t.availability ?? "Availability on request"}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  <span>Vetted &amp; NDA-covered</span>
                </div>
              </dl>
            </div>
            <Link to="/start-project" search={{ ref: code } as never} className="block">
              <Button variant="brand" className="w-full">Request {code}</Button>
            </Link>
          </aside>
          <div className="lg:col-span-2">
            {t.bio && (
              <div className="rounded-lg border border-border bg-card p-6">
                <h2 className="text-lg font-semibold">About this specialist</h2>
                <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{t.bio}</p>
              </div>
            )}
            {t.items && t.items.length > 0 && (
              <div className="mt-6">
                <h2 className="text-lg font-semibold">Sample work</h2>
                <p className="mt-1 text-xs text-muted-foreground">Sanitized case snippets — industries and outcomes only. Client names are withheld.</p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {t.items.map((it: {
                    id: string; title: string; description: string | null;
                    image_url: string | null; link_url: string | null; tags: string[] | null;
                  }) => (
                    <div key={it.id} className="overflow-hidden rounded-lg border border-border bg-card">
                      {it.image_url && <img src={it.image_url} alt={it.title} loading="lazy" className="aspect-[16/9] w-full object-cover" />}
                      <div className="p-4">
                        <div className="text-sm font-semibold">{it.title}</div>
                        {it.description && <p className="mt-1 line-clamp-3 text-xs text-muted-foreground">{it.description}</p>}
                        {it.tags && it.tags.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {it.tags.slice(0, 4).map((tg: string) => <span key={tg} className="rounded-md bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">{tg}</span>)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}