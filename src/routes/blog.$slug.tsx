import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Section } from "@/components/site/Section";
import { UnsplashImg } from "@/components/site/UnsplashImg";
import { ArrowLeft } from "lucide-react";
import { getBlogPost } from "@/lib/content/blog.functions";

export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ params }) => {
    const post = await getBlogPost({ data: { slug: params.slug } });
    if (!post) throw notFound();
    return { post };
  },
  head: ({ loaderData }) => {
    const p = loaderData?.post;
    if (!p) return { meta: [{ title: "Article — NDH" }] };
    return {
      meta: [
        { title: `${p.title} — NDH Blog` },
        { name: "description", content: p.excerpt },
        { property: "og:title", content: p.title },
        { property: "og:description", content: p.excerpt },
        { property: "og:type", content: "article" },
      ],
    };
  },
  notFoundComponent: () => (
    <SiteLayout>
      <Section>
        <div className="mx-auto max-w-xl text-center">
          <h1 className="text-3xl font-bold">Article not found</h1>
          <p className="mt-2 text-muted-foreground">This post may have been unpublished.</p>
          <Link to="/blog" className="mt-6 inline-block text-sm font-semibold text-primary">← Back to blog</Link>
        </div>
      </Section>
    </SiteLayout>
  ),
  errorComponent: ({ error }) => (
    <SiteLayout><Section><p className="text-center text-sm text-muted-foreground">{error.message}</p></Section></SiteLayout>
  ),
  component: BlogPostPage,
});

function renderMd(md: string) {
  return md.split("\n\n").map((block, i) => {
    if (block.startsWith("# ")) return <h1 key={i} className="mt-8 text-2xl font-semibold tracking-tight">{block.slice(2)}</h1>;
    if (block.startsWith("## ")) return <h2 key={i} className="mt-8 text-xl font-semibold tracking-tight">{block.slice(3)}</h2>;
    return <p key={i} className="mt-4 text-[15px] leading-7 text-foreground/80">{block}</p>;
  });
}

function BlogPostPage() {
  const { post } = Route.useLoaderData();
  return (
    <SiteLayout>
      <section className="border-b border-border bg-background">
        <div className="mx-auto max-w-3xl px-6 py-12">
          <Link to="/blog" className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to blog
          </Link>
          <div className="mt-6 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">{post.tag}</div>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{post.title}</h1>
          <p className="mt-4 text-base text-muted-foreground">{post.excerpt}</p>
          <div className="mt-4 text-xs text-muted-foreground">{post.author} · {post.read_minutes} min read</div>
        </div>
      </section>
      <Section>
        <div className="mx-auto max-w-3xl">
          <div className="overflow-hidden rounded-lg border border-border">
            <UnsplashImg q={post.cover_query} alt={post.title} w={1400} h={800} sig={post.slug} className="h-full w-full object-cover" />
          </div>
          <article className="mx-auto mt-8 max-w-[68ch]">
            {renderMd(post.body_md || post.excerpt)}
          </article>
        </div>
      </Section>
    </SiteLayout>
  );
}