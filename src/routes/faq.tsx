import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Section } from "@/components/site/Section";
import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type Faq = { q: string; a: string };

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — Najeeb Digital Hub" },
      { name: "description", content: "Answers to common questions about NDH services, academy and talents." },
      { property: "og:title", content: "Frequently Asked Questions · Najeeb Digital Hub" },
      { property: "og:description", content: "How NDH's managed bureau works, project pricing across regions, PM-only communication, talent payouts, and how to verify NDH Academy certificates." },
    ],
  }),
  component: FaqPage,
});

function FaqPage() {
  const [open, setOpen] = useState<number | null>(0);
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    supabase.from("faq_items")
      .select("question,answer")
      .eq("published", true)
      .order("display_order", { ascending: true })
      .then(({ data }) => {
        setFaqs((data || []).map((r) => ({ q: r.question, a: r.answer })));
        setLoading(false);
      });
  }, []);
  return (
    <SiteLayout>
      <section className="bg-hero py-20 text-white">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-xs font-semibold uppercase tracking-widest text-white/70">FAQ</div>
          <h1 className="mt-3 text-4xl font-extrabold sm:text-5xl">Frequently asked questions.</h1>
        </div>
      </section>
      <Section>
        <div className="mx-auto max-w-3xl divide-y divide-border rounded-2xl border border-border bg-card">
          {loading && (
            <div className="p-8 text-center text-sm text-muted-foreground">Loading…</div>
          )}
          {faqs.map((f, i) => (
            <button key={f.q} onClick={() => setOpen(open === i ? null : i)} className="block w-full px-6 py-5 text-left">
              <div className="flex items-center justify-between gap-4">
                <span className="font-semibold">{f.q}</span>
                <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${open === i ? "rotate-180" : ""}`} />
              </div>
              {open === i && <p className="mt-3 text-sm text-muted-foreground">{f.a}</p>}
            </button>
          ))}
        </div>
      </Section>
    </SiteLayout>
  );
}