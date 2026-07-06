import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Section } from "@/components/site/Section";
import { AnimatedBlobs } from "@/components/site/AnimatedBlobs";
import { Reveal, Stagger, StaggerItem } from "@/components/site/Reveal";
import { useQuery } from "@tanstack/react-query";
import { listCaseStudies } from "@/lib/content/case-studies.functions";

export const Route = createFileRoute("/case-studies")({
  head: () => ({
    meta: [
      { title: "Case Studies — Real client outcomes | NDH" },
      { name: "description", content: "Real projects, real results. See how NDH helps brands ship products, grow audiences, and win their markets." },
      { property: "og:title", content: "NDH Case Studies" },
      { property: "og:description", content: "Selected work from the NDH team." },
      { property: "og:url", content: "/case-studies" },
    ],
    links: [{ rel: "canonical", href: "/case-studies" }],
  }),
  component: CaseStudiesPage,
});

function CaseStudiesPage() {
  const { data: items = [], isLoading } = useQuery({
    queryKey: ["case-studies"],
    queryFn: () => listCaseStudies(),
  });
  return (
    <SiteLayout>
      <section className="relative isolate overflow-hidden bg-hero py-24 text-white">
        <AnimatedBlobs />
        <div className="relative mx-auto max-w-7xl px-6">
          <Reveal>
            <div className="text-xs font-semibold uppercase tracking-widest text-white/70">Case Studies</div>
            <h1 className="mt-3 max-w-3xl text-4xl font-extrabold sm:text-5xl">Real projects. Real outcomes.</h1>
            <p className="mt-4 max-w-2xl text-white/75">A selection of work from our bureau — spanning design, engineering, marketing and content.</p>
          </Reveal>
        </div>
      </section>
      <Section>
        {isLoading ? (
          <p className="text-center text-sm text-muted-foreground">Loading case studies…</p>
        ) : items.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground">Case studies coming soon.</p>
        ) : (
          <Stagger className="grid gap-6 md:grid-cols-2">
            {items.map((c) => (
              <StaggerItem key={c.slug}>
                <Link to="/case-studies/$slug" params={{ slug: c.slug }} className="group block h-full overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-1 hover:shadow-elegant">
                  {c.cover_image && (
                    <div className="aspect-[16/9] overflow-hidden">
                      <img src={c.cover_image} alt={c.title} loading="lazy" decoding="async" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    </div>
                  )}
                  <div className="p-6">
                    {c.industry && <div className="text-xs font-semibold uppercase tracking-widest text-[oklch(0.65_0.19_252)]">{c.industry}</div>}
                    <h3 className="mt-2 text-xl font-bold leading-snug">{c.title}</h3>
                    {c.client_name && <div className="mt-1 text-xs text-muted-foreground">Client: {c.client_name}</div>}
                    <p className="mt-3 text-sm text-muted-foreground">{c.summary}</p>
                    {c.services && c.services.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {c.services.slice(0, 4).map((s: string) => <span key={s} className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold">{s}</span>)}
                      </div>
                    )}
                  </div>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        )}
      </Section>
    </SiteLayout>
  );
}