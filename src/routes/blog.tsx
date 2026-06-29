import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Section } from "@/components/site/Section";

export const Route = createFileRoute("/blog")({
  head: () => ({ meta: [
    { title: "Blog & Resources — NDH" },
    { name: "description", content: "Insights on design, technology, marketing, content and the future of digital work in Africa." },
    { property: "og:title", content: "NDH Blog & Resources" },
    { property: "og:description", content: "Sharp ideas from the NDH team." },
  ]}),
  component: BlogPage,
});

const posts = [
  { tag: "Strategy", title: "Why founders hire bureaus, not freelancers", excerpt: "The hidden cost of managing 5 freelancers vs. one PM." },
  { tag: "Design", title: "Brand systems that scale on a budget", excerpt: "A quick guide to tokens, type and color discipline." },
  { tag: "Academy", title: "Inside the NDH Diploma program", excerpt: "How we structure six months of intensive learning." },
  { tag: "Marketing", title: "What's working in Meta ads in 2026", excerpt: "Creative, audience and budget patterns from real campaigns." },
  { tag: "Tech", title: "Picking the right stack for your MVP", excerpt: "A pragmatic framework for first-time founders." },
  { tag: "Career", title: "How to make Tier 5 (Elite) at NDH", excerpt: "Metrics, mindset and craft from our top talents." },
];

function BlogPage() {
  return (
    <SiteLayout>
      <section className="bg-hero py-20 text-white">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-xs font-semibold uppercase tracking-widest text-white/70">Blog & Resources</div>
          <h1 className="mt-3 max-w-3xl text-4xl font-extrabold sm:text-5xl">Ideas from the NDH team.</h1>
        </div>
      </section>
      <Section>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => (
            <article key={p.title} className="group overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-1 hover:shadow-elegant">
              <div className="h-40 bg-gradient-brand opacity-90" />
              <div className="p-6">
                <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{p.tag}</div>
                <h3 className="mt-2 text-lg font-bold leading-snug">{p.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{p.excerpt}</p>
              </div>
            </article>
          ))}
        </div>
        <p className="mt-10 text-center text-sm text-muted-foreground">More articles coming soon.</p>
      </Section>
    </SiteLayout>
  );
}