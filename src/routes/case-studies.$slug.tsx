import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Section } from "@/components/site/Section";
import { AnimatedBlobs } from "@/components/site/AnimatedBlobs";
import { ArrowLeft } from "lucide-react";
import { getCaseStudy } from "@/lib/content/case-studies.functions";

export const Route = createFileRoute("/case-studies/$slug")({
  loader: async ({ params }) => {
    const cs = await getCaseStudy({ data: { slug: params.slug } });
    if (!cs) throw notFound();
    return { cs };
  },
  head: ({ loaderData }) => {
    const c = loaderData?.cs;
    if (!c) return { meta: [{ title: "Case study — NDH" }] };
    return {
      meta: [
        { title: `${c.title} — NDH Case Study` },
        { name: "description", content: c.summary },
        { property: "og:title", content: c.title },
        { property: "og:description", content: c.summary },
        { property: "og:type", content: "article" },
        ...(c.cover_image ? [{ property: "og:image", content: c.cover_image }] : []),
      ],
    };
  },
  notFoundComponent: () => (
    <SiteLayout>
      <Section>
        <div className="mx-auto max-w-xl text-center">
          <h1 className="text-3xl font-bold">Case study not found</h1>
          <Link to="/case-studies" className="mt-6 inline-block text-sm font-semibold text-[oklch(0.65_0.19_252)]">← Back to case studies</Link>
        </div>
      </Section>
    </SiteLayout>
  ),
  errorComponent: ({ error }) => (
    <SiteLayout><Section><p className="text-center text-sm text-muted-foreground">{error.message}</p></Section></SiteLayout>
  ),
  component: CaseStudyPage,
});

function CaseStudyPage() {
  const { cs } = Route.useLoaderData();
  return (
    <SiteLayout>
      <section className="relative isolate overflow-hidden bg-hero py-20 text-white">
        <AnimatedBlobs />
        <div className="relative mx-auto max-w-4xl px-6">
          <Link to="/case-studies" className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-white/70 hover:text-white">
            <ArrowLeft className="h-3.5 w-3.5" /> All case studies
          </Link>
          {cs.industry && <div className="mt-4 text-xs font-semibold uppercase tracking-widest text-white/70">{cs.industry}</div>}
          <h1 className="mt-3 text-4xl font-extrabold sm:text-5xl">{cs.title}</h1>
          {cs.client_name && <p className="mt-2 text-sm text-white/70">Client: {cs.client_name}</p>}
          <p className="mt-4 max-w-2xl text-white/85">{cs.summary}</p>
        </div>
      </section>
      {cs.cover_image && (
        <Section className="!pt-8">
          <div className="mx-auto max-w-5xl overflow-hidden rounded-3xl border border-border shadow-elegant">
            <img src={cs.cover_image} alt={cs.title} className="h-full w-full object-cover" />
          </div>
        </Section>
      )}
      <Section className="!pt-6">
        <div className="mx-auto grid max-w-4xl gap-8">
          {cs.challenge && <Block title="The challenge" body={cs.challenge} />}
          {cs.solution && <Block title="What we did" body={cs.solution} />}
          {cs.results && <Block title="Results" body={cs.results} />}
          {cs.services && cs.services.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Services</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {cs.services.map((s: string) => <span key={s} className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold">{s}</span>)}
              </div>
            </div>
          )}
        </div>
      </Section>
    </SiteLayout>
  );
}

function Block({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <h2 className="text-2xl font-bold">{title}</h2>
      <div className="mt-3 whitespace-pre-wrap text-muted-foreground">{body}</div>
    </div>
  );
}