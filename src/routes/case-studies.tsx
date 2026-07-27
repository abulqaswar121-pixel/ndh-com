import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Section } from "@/components/site/Section";
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
      <section className="border-b border-border bg-background py-20">
        <div className="mx-auto max-w-7xl px-6">
          <Reveal>
            <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Case Studies</div>
            <h1 className="mt-3 max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">Selected work</h1>
            <p className="mt-4 max-w-2xl text-muted-foreground">A curated look at recent client engagements across design, engineering, marketing and content.</p>
          </Reveal>
        </div>
      </section>
      <Section>
        {isLoading ? (
          <p className="text-center text-sm text-muted-foreground">Loading case studies…</p>
        ) : items.length === 0 ? (
          <div className="mx-auto max-w-xl rounded-xl border border-dashed border-border bg-card p-10 text-center">
            <div className="text-sm font-semibold">Case studies coming soon</div>
            <p className="mt-2 text-sm text-muted-foreground">We're preparing a set of detailed client stories for publication. In the meantime, talk to a project manager about comparable work.</p>
            <Link to="/contact" className="mt-4 inline-block text-sm font-semibold text-primary">Contact us →</Link>
          </div>
        ) : (
          <Stagger className="grid gap-6 md:grid-cols-2">
            {items.map((c) => (
              <StaggerItem key={c.slug}>
                <Link to="/case-studies/$slug" params={{ slug: c.slug }} className="group block h-full overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-primary/40">
                  {c.cover_image && (
                    <div className="aspect-[16/9] overflow-hidden">
                      <img src={c.cover_image} alt={c.title} loading="lazy" decoding="async" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    </div>
                  )}
                  <div className="p-6">
                    {c.industry && <div className="text-xs font-semibold uppercase tracking-widest text-primary">{c.industry}</div>}
                    <h3 className="mt-2 text-xl font-semibold leading-snug">{c.title}</h3>
                    {c.client_name && <div className="mt-1 text-xs text-muted-foreground">Client: {c.client_name}</div>}
                    <p className="mt-3 text-sm text-muted-foreground">{c.summary}</p>
                    {c.services && c.services.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {c.services.slice(0, 4).map((s: string) => <span key={s} className="rounded-full border border-border px-2 py-0.5 text-[10px] font-medium text-muted-foreground">{s}</span>)}
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