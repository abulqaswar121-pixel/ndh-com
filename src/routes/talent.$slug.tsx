import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { AnimatedBlobs } from "@/components/site/AnimatedBlobs";
import { getPublicTalent } from "@/lib/talent-portfolio.functions";
import { Github, Linkedin, Globe, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/talent/$slug")({
  loader: async ({ params }) => {
    const t = await getPublicTalent({ data: { slug: params.slug } });
    if (!t) throw notFound();
    return t;
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.profile?.full_name ?? "Talent"}${loaderData.headline ? ` — ${loaderData.headline}` : ""} | NDH` },
          { name: "description", content: loaderData.bio?.slice(0, 155) ?? "NDH talent portfolio." },
          { property: "og:title", content: `${loaderData.profile?.full_name ?? "Talent"} on NDH` },
          { property: "og:description", content: loaderData.headline ?? "NDH talent portfolio." },
          ...(loaderData.profile?.avatar_url ? [{ property: "og:image" as const, content: loaderData.profile.avatar_url }] : []),
        ]
      : [{ title: "Talent — NDH" }],
  }),
  errorComponent: () => <SiteLayout><div className="mx-auto max-w-3xl p-12 text-center">Failed to load profile.</div></SiteLayout>,
  notFoundComponent: () => <SiteLayout><div className="mx-auto max-w-3xl p-12 text-center"><h1 className="text-2xl font-bold">Talent not found</h1><p className="mt-2 text-muted-foreground">This profile may be private or does not exist.</p><Link to="/talent" className="mt-4 inline-block text-primary underline">Back to directory</Link></div></SiteLayout>,
  component: TalentDetailPage,
});

function TalentDetailPage() {
  const t = Route.useLoaderData();
  return (
    <SiteLayout>
      <section className="relative isolate overflow-hidden bg-hero py-20 text-white">
        <AnimatedBlobs />
        <div className="relative mx-auto flex max-w-5xl flex-col items-center px-6 text-center sm:flex-row sm:text-left">
          {t.profile?.avatar_url ? (
            <img src={t.profile.avatar_url} alt="" className="h-28 w-28 rounded-full border-4 border-white/20 object-cover" />
          ) : (
            <div className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-white/20 bg-white/10 text-4xl font-bold">
              {(t.profile?.full_name ?? "?").slice(0, 1).toUpperCase()}
            </div>
          )}
          <div className="mt-6 sm:ml-8 sm:mt-0">
            <h1 className="text-3xl font-extrabold sm:text-4xl">{t.profile?.full_name ?? "Talent"}</h1>
            {t.headline && <p className="mt-2 text-white/80">{t.headline}</p>}
            <div className="mt-3 flex flex-wrap items-center justify-center gap-3 text-sm text-white/70 sm:justify-start">
              {t.profile?.country && <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {t.profile.country}</span>}
              {typeof t.years_experience === "number" && <span>{t.years_experience}+ yrs experience</span>}
              {t.availability && <span className="rounded-full bg-white/15 px-2 py-0.5 text-xs">{t.availability}</span>}
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-6 py-12">
        <div className="grid gap-8 lg:grid-cols-3">
          <aside className="space-y-6">
            {t.skills && t.skills.length > 0 && (
              <div className="rounded-2xl border border-border bg-card p-6">
                <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Skills</h3>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {t.skills.map((s: string) => <span key={s} className="rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold">{s}</span>)}
                </div>
              </div>
            )}
            <div className="rounded-2xl border border-border bg-card p-6">
              <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Links</h3>
              <div className="mt-3 space-y-2 text-sm">
                {t.portfolio_url && <a href={t.portfolio_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-primary hover:underline"><Globe className="h-4 w-4" /> Website</a>}
                {t.github_url && <a href={t.github_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-primary hover:underline"><Github className="h-4 w-4" /> GitHub</a>}
                {t.linkedin_url && <a href={t.linkedin_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-primary hover:underline"><Linkedin className="h-4 w-4" /> LinkedIn</a>}
                {!t.portfolio_url && !t.github_url && !t.linkedin_url && <p className="text-xs text-muted-foreground">No external links.</p>}
              </div>
            </div>
            <Link to="/start-project" className="block">
              <Button className="w-full">Hire the bureau</Button>
            </Link>
          </aside>
          <div className="lg:col-span-2">
            {t.bio && (
              <div className="rounded-2xl border border-border bg-card p-6">
                <h2 className="text-xl font-bold">About</h2>
                <p className="mt-3 whitespace-pre-line text-sm text-muted-foreground">{t.bio}</p>
              </div>
            )}
            {t.items && t.items.length > 0 && (
              <div className="mt-6">
                <h2 className="text-xl font-bold">Portfolio</h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {t.items.map((it: {
                    id: string; title: string; description: string | null;
                    image_url: string | null; link_url: string | null; tags: string[] | null;
                  }) => (
                    <a key={it.id} href={it.link_url ?? "#"} target={it.link_url ? "_blank" : undefined} rel="noreferrer" className="group block overflow-hidden rounded-2xl border border-border bg-card transition hover:-translate-y-1 hover:shadow-elegant">
                      {it.image_url && <img src={it.image_url} alt={it.title} loading="lazy" className="aspect-[16/9] w-full object-cover transition group-hover:scale-105" />}
                      <div className="p-4">
                        <div className="font-semibold">{it.title}</div>
                        {it.description && <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{it.description}</p>}
                        {it.tags && it.tags.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {it.tags.slice(0, 4).map((tg: string) => <span key={tg} className="rounded-full bg-secondary px-1.5 py-0.5 text-[10px] font-semibold">{tg}</span>)}
                          </div>
                        )}
                      </div>
                    </a>
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