import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Section } from "@/components/site/Section";
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
      <section className="border-b border-border bg-background">
        <div className="mx-auto max-w-7xl px-6 py-14 sm:py-16">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Blog &amp; resources</div>
          <h1 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl">Sharp ideas on digital work.</h1>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
            Playbooks, guides and field notes from the NDH team — on design, engineering, marketing, and building for the modern web.
          </p>
        </div>
      </section>
      <Section>
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {cats.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
                  cat === c
                    ? "border-primary/40 bg-secondary text-foreground"
                    : "border-border bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="relative max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              aria-label="Search blog articles"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search articles…"
              className="w-full rounded-md border border-border bg-card py-2 pl-9 pr-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <Link
              key={p.slug}
              to="/blog/$slug"
              params={{ slug: p.slug }}
              className="group block h-full overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-primary/40"
            >
              <div className="aspect-[16/9] overflow-hidden border-b border-border">
                <UnsplashImg q={p.cover_query} alt={p.title} w={800} h={500} sig={p.slug} className="h-full w-full object-cover" />
              </div>
              <div className="p-5">
                <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">{p.tag}</div>
                <h3 className="mt-2 text-base font-semibold leading-snug tracking-tight">{p.title}</h3>
                <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{p.excerpt}</p>
                <div className="mt-3 text-xs text-muted-foreground">{p.read_minutes} min read</div>
              </div>
            </Link>
          ))}
        </div>
        {!isLoading && filtered.length === 0 && <p className="mt-10 text-center text-sm text-muted-foreground">No articles match your search.</p>}
        {isLoading && <p className="mt-10 text-center text-sm text-muted-foreground">Loading articles…</p>}
      </Section>
    </SiteLayout>
  );
}