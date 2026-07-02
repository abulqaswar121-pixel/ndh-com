import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Section } from "@/components/site/Section";
import { AnimatedBlobs } from "@/components/site/AnimatedBlobs";
import { Reveal, Stagger, StaggerItem } from "@/components/site/Reveal";
import { UnsplashImg } from "@/components/site/UnsplashImg";
import { Search } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { listBlogPosts } from "@/lib/content/blog.functions";

export const Route = createFileRoute("/blog")({
  head: () => ({ meta: [
    { title: "Blog & Resources — NDH" },
    { name: "description", content: "Insights on design, technology, marketing, content and the future of digital work in Africa." },
    { property: "og:title", content: "NDH Blog & Resources" },
    { property: "og:description", content: "Sharp ideas from the NDH team." },
  ]}),
  component: BlogPage,
});

const cats = ["All", "Freelancing Tips", "Digital Skills", "Academy Updates", "NDH News"];

function BlogPage() {
  const [cat, setCat] = useState("All");
  const [q, setQ] = useState("");
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["blog-posts"],
    queryFn: () => listBlogPosts(),
  });
  const filtered = posts.filter(
    (p) => (cat === "All" || p.tag === cat) && (q === "" || p.title.toLowerCase().includes(q.toLowerCase())),
  );
  return (
    <SiteLayout>
      <section className="relative isolate overflow-hidden bg-hero py-24 text-white">
        <AnimatedBlobs />
        <div className="relative mx-auto max-w-7xl px-6">
          <Reveal>
            <div className="text-xs font-semibold uppercase tracking-widest text-white/70">Blog & Resources</div>
            <h1 className="mt-3 max-w-3xl text-4xl font-extrabold sm:text-5xl">Ideas from the NDH team.</h1>
          </Reveal>
        </div>
      </section>
      <Section>
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {cats.map((c) => (
              <button key={c} onClick={() => setCat(c)} className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition ${cat === c ? "border-transparent bg-gradient-brand text-white shadow-glow" : "border-border bg-secondary/40 text-muted-foreground hover:text-foreground"}`}>{c}</button>
            ))}
          </div>
          <div className="relative max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
           <input aria-label="Search blog articles" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search articles…" className="w-full rounded-full border border-border bg-background py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-[oklch(0.65_0.19_252)]/30" />
          </div>
        </div>
        <Stagger className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <StaggerItem key={p.slug}>
              <Link to="/blog/$slug" params={{ slug: p.slug }} className="group block h-full overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-1 hover:shadow-elegant">
                <div className="aspect-[16/10] overflow-hidden">
                  <UnsplashImg q={p.cover_query} alt={p.title} w={800} h={500} sig={p.slug} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                </div>
                <div className="p-6">
                  <div className="text-xs font-semibold uppercase tracking-widest text-[oklch(0.65_0.19_252)]">{p.tag}</div>
                  <h3 className="mt-2 text-lg font-bold leading-snug">{p.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{p.excerpt}</p>
                  <div className="mt-3 text-xs text-muted-foreground">{p.read_minutes} min read</div>
                </div>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
        {!isLoading && filtered.length === 0 && <p className="mt-10 text-center text-sm text-muted-foreground">No articles match your search.</p>}
        {isLoading && <p className="mt-10 text-center text-sm text-muted-foreground">Loading articles…</p>}
      </Section>
    </SiteLayout>
  );
}