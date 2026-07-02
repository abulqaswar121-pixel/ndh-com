import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

const BASE_URL = "https://ndh.com.ng";

interface SitemapEntry {
  path: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries: SitemapEntry[] = [
          { path: "/", changefreq: "weekly", priority: "1.0" },
          { path: "/services", changefreq: "weekly", priority: "0.9" },
          { path: "/academy", changefreq: "weekly", priority: "0.9" },
          { path: "/academy/certificate-programs", changefreq: "weekly", priority: "0.8" },
          { path: "/academy/diploma-programs", changefreq: "weekly", priority: "0.8" },
          { path: "/academy/professional-programs", changefreq: "weekly", priority: "0.8" },
          { path: "/about", changefreq: "monthly", priority: "0.6" },
          { path: "/team", changefreq: "monthly", priority: "0.6" },
          { path: "/contact", changefreq: "monthly", priority: "0.6" },
          { path: "/blog", changefreq: "weekly", priority: "0.7" },
          { path: "/faq", changefreq: "monthly", priority: "0.5" },
          { path: "/careers", changefreq: "weekly", priority: "0.6" },
          { path: "/verify", changefreq: "monthly", priority: "0.4" },
          { path: "/privacy", changefreq: "yearly", priority: "0.3" },
          { path: "/terms", changefreq: "yearly", priority: "0.3" },
          { path: "/login", changefreq: "yearly", priority: "0.3" },
          { path: "/signup", changefreq: "yearly", priority: "0.3" },
        ];

        // Dynamic: published blog posts
        try {
          const { createClient } = await import("@supabase/supabase-js");
          const sb = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
            auth: { persistSession: false, autoRefreshToken: false },
          });
          const { data } = await sb
            .from("blog_posts")
            .select("slug, updated_at")
            .eq("published", true);
          if (data) {
            for (const row of data as Array<{ slug: string; updated_at?: string }>) {
              entries.push({ path: `/blog/${row.slug}`, changefreq: "monthly", priority: "0.6" });
            }
          }
        } catch {}

        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ].filter(Boolean).join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});