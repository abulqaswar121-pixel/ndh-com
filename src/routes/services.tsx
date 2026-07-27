import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Section } from "@/components/site/Section";
import { Button } from "@/components/ui/button";
import * as Icons from "lucide-react";
import { ArrowRight, Search, SlidersHorizontal } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/services")({
  head: () => ({ meta: [
    { title: "Services — Najeeb Digital Hub" },
    { name: "description", content: "Design, development, content, marketing, media and AI services delivered by NDH's in-house talent." },
    { property: "og:title", content: "NDH Services" },
    { property: "og:description", content: "Full digital stack, one trusted partner." },
  ]}),
  component: ServicesPage,
});

type Cat = { icon: string; title: string; q: string; items: string[]; image_url?: string };

function ServicesPage() {
  const [cats, setCats] = useState<Cat[]>([]);
  const [q, setQ] = useState("");
  const [activeCat, setActiveCat] = useState<string>("All");
  const navigate = useNavigate();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const initial = params.get("q");
    if (initial) setQ(initial);
  }, []);

  useEffect(() => {
    supabase.from("services")
      .select("name,icon,included,image_url")
      .eq("published", true)
      .order("display_order", { ascending: true })
      .then(({ data, error }) => {
        if (error || !data || data.length === 0) {
          toast("No services available right now.");
          setCats([]);
          return;
        }
        setCats(data.map((r) => ({
          icon: r.icon || "Sparkles",
          title: r.name,
          q: r.name.toLowerCase(),
          items: Array.isArray(r.included) ? (r.included as string[]) : [],
          image_url: r.image_url || undefined,
        })));
      });
  }, []);

  const chips = useMemo(() => ["All", ...cats.map((c) => c.title)], [cats]);
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return cats.filter((c) => {
      if (activeCat !== "All" && c.title !== activeCat) return false;
      if (!needle) return true;
      return (
        c.title.toLowerCase().includes(needle) ||
        c.items.some((i) => i.toLowerCase().includes(needle))
      );
    });
  }, [cats, q, activeCat]);

  return (
    <SiteLayout>
      {/* Masthead */}
      <section className="border-b border-border bg-background">
        <div className="mx-auto max-w-7xl px-6 py-14 sm:py-16">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Services marketplace</div>
          <h1 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl">
            Browse services. Brief a project. Get matched.
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
            Design, engineering, marketing, and media — delivered by vetted specialists and managed by a project manager.
          </p>
          <form
            onSubmit={(e) => { e.preventDefault(); }}
            className="mt-6 flex max-w-2xl items-center gap-2 rounded-full border border-border bg-card p-1.5"
          >
            <div className="pl-3 text-muted-foreground"><Search className="h-4 w-4" /></div>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search services (e.g. logo, landing page, SEO article)…"
              aria-label="Search services"
              className="flex-1 bg-transparent px-2 py-2 text-sm focus:outline-none"
            />
            <Button
              type="button"
              variant="brand"
              className="rounded-full px-5"
              onClick={() => navigate({ to: "/start-project" })}
            >
              Start a project
            </Button>
          </form>
        </div>
      </section>

      <Section>
        <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
          {/* Filter rail */}
          <aside className="lg:sticky lg:top-24 lg:h-fit">
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              <SlidersHorizontal className="h-3.5 w-3.5" /> Categories
            </div>
            <div className="flex flex-wrap gap-2 lg:flex-col">
              {chips.map((c) => (
                <button
                  key={c}
                  onClick={() => setActiveCat(c)}
                  className={`rounded-md border px-3 py-1.5 text-left text-sm transition-colors ${
                    activeCat === c
                      ? "border-primary/40 bg-secondary text-foreground"
                      : "border-border bg-card text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </aside>

          {/* Grid */}
          <div>
            {filtered.length === 0 ? (
              <div className="rounded-lg border border-border bg-card p-10 text-center text-sm text-muted-foreground">
                No services match your search. Try a different keyword or category.
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {filtered.map((c) => {
                  const IconEl = (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[c.icon] || Icons.Sparkles;
                  return (
                    <div
                      key={c.title}
                      className="group flex h-full flex-col rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary/40"
                    >
                      <div className="flex items-center gap-3">
                        <div className="grid h-10 w-10 place-items-center rounded-md bg-secondary text-primary">
                          <IconEl className="h-5 w-5" />
                        </div>
                        <div className="text-base font-semibold">{c.title}</div>
                      </div>
                      {c.items.length > 0 && (
                        <ul className="mt-4 space-y-1.5 text-sm text-muted-foreground">
                          {c.items.slice(0, 5).map((i) => (
                            <li key={i} className="flex gap-2">
                              <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary/60" />
                              {i}
                            </li>
                          ))}
                        </ul>
                      )}
                      <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
                        <span className="text-xs text-muted-foreground">Custom scope · Quote in 4h</span>
                        <Link
                          to="/start-project"
                          className="inline-flex items-center gap-1 text-sm font-semibold text-primary"
                        >
                          Brief a project
                          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </Section>

      <Section>
        <div className="rounded-lg border border-border bg-secondary/40 p-8 text-center">
          <h3 className="text-2xl font-semibold tracking-tight">Not sure what you need?</h3>
          <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
            Send us a brief. A project manager scopes it for free and responds within 4 business hours.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <Link to="/start-project"><Button variant="brand">Start a project</Button></Link>
            <Link to="/contact"><Button variant="outline">Talk to us</Button></Link>
          </div>
        </div>
      </Section>
    </SiteLayout>
  );
}