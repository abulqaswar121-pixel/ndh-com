import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Section } from "@/components/site/Section";
import { AnimatedBlobs } from "@/components/site/AnimatedBlobs";
import { Reveal } from "@/components/site/Reveal";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/submit-task")({
  head: () => ({ meta: [
    { title: "Submit a Task — NDH" },
    { name: "description", content: "Tell NDH about your project. Pick a tier, set your budget, attach files — your PM responds within 24 hours." },
    { property: "og:title", content: "Submit a Task to NDH" },
    { property: "og:url", content: "/submit-task" },
  ], links: [{ rel: "canonical", href: "/submit-task" }]}),
  component: SubmitTaskPage,
});

const services = ["Design", "Development", "Content", "Marketing", "Media", "AI & Tech"];
const tiers = [
  { name: "Basic", desc: "Solid execution, one round of revisions." },
  { name: "Pro", desc: "Premium craft, senior talent, two rounds." },
  { name: "Premium", desc: "Elite tier, full PM treatment, unlimited polish." },
];

function SubmitTaskPage() {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [data, setData] = useState({ service: "Design", tier: "Pro", budget: "1000-2500", negotiable: true, desc: "", deadline: "", email: "", name: "" });

  const set = <K extends keyof typeof data>(k: K, v: (typeof data)[K]) => setData((d) => ({ ...d, [k]: v }));
  const steps = ["Service", "Tier", "Budget", "Brief", "Submit"];

  return (
    <SiteLayout>
      <section className="relative isolate overflow-hidden bg-hero py-24 text-white">
        <AnimatedBlobs />
        <div className="relative mx-auto max-w-7xl px-6">
          <Reveal>
            <div className="text-xs font-semibold uppercase tracking-widest text-white/70">Submit a Task</div>
            <h1 className="mt-3 max-w-3xl text-4xl font-extrabold sm:text-5xl">Brief us. We deliver.</h1>
            <p className="mt-4 max-w-2xl text-white/75">A PM scopes your task for free and responds within 24 hours. Full client portal access opens in Phase 2.</p>
          </Reveal>
        </div>
      </section>

      <Section>
        <div className="mx-auto max-w-3xl">
          {/* Progress */}
          <div className="mb-8 flex items-center gap-2">
            {steps.map((s, i) => (
              <div key={s} className="flex flex-1 items-center gap-2">
                <div className={`grid h-8 w-8 place-items-center rounded-full text-xs font-bold ${i <= step ? "bg-gradient-brand text-white shadow-glow" : "bg-secondary text-muted-foreground"}`}>
                  {i + 1}
                </div>
                <div className="hidden text-xs font-semibold sm:block">{s}</div>
                {i < steps.length - 1 && <div className={`h-px flex-1 ${i < step ? "bg-gradient-brand" : "bg-border"}`} />}
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
            {done ? (
              <div className="text-center">
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-gradient-brand text-white"><CheckCircle2 className="h-7 w-7" /></div>
                <h3 className="mt-4 text-xl font-bold">Brief received.</h3>
                <p className="mt-2 text-sm text-muted-foreground">A Project Manager will reach out within 24 hours.</p>
                <Link to="/" className="mt-6 inline-block"><Button variant="brand">Back to home</Button></Link>
              </div>
            ) : (
              <>
                {step === 0 && (
                  <div className="grid gap-3 sm:grid-cols-3">
                    {services.map((s) => (
                      <button type="button" key={s} onClick={() => set("service", s)} className={`rounded-xl border p-4 text-left transition ${data.service === s ? "border-[oklch(0.65_0.19_252)] bg-secondary/60" : "border-border hover:border-[oklch(0.65_0.19_252)]/40"}`}>
                        <div className="font-bold">{s}</div>
                      </button>
                    ))}
                  </div>
                )}
                {step === 1 && (
                  <div className="grid gap-3 sm:grid-cols-3">
                    {tiers.map((t) => (
                      <button type="button" key={t.name} onClick={() => set("tier", t.name)} className={`rounded-xl border p-4 text-left transition ${data.tier === t.name ? "border-[oklch(0.65_0.19_252)] bg-secondary/60" : "border-border hover:border-[oklch(0.65_0.19_252)]/40"}`}>
                        <div className="font-bold">{t.name}</div>
                        <div className="mt-1 text-xs text-muted-foreground">{t.desc}</div>
                      </button>
                    ))}
                  </div>
                )}
                {step === 2 && (
                  <div className="grid gap-4">
                    <div>
                      <label className="text-sm font-medium">Budget range (USD)</label>
                      <select value={data.budget} onChange={(e) => set("budget", e.target.value)} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm">
                        <option value="under-500">Under $500</option>
                        <option value="500-1000">$500 – $1,000</option>
                        <option value="1000-2500">$1,000 – $2,500</option>
                        <option value="2500-5000">$2,500 – $5,000</option>
                        <option value="5000-plus">$5,000+</option>
                      </select>
                    </div>
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={data.negotiable} onChange={(e) => set("negotiable", e.target.checked)} />
                      Open to negotiation
                    </label>
                  </div>
                )}
                {step === 3 && (
                  <div className="grid gap-4">
                    <div>
                      <label className="text-sm font-medium">Project brief</label>
                      <textarea rows={5} value={data.desc} onChange={(e) => set("desc", e.target.value)} placeholder="Goal, audience, references, deliverables." className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Deadline (optional)</label>
                      <input type="date" value={data.deadline} onChange={(e) => set("deadline", e.target.value)} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm" />
                    </div>
                  </div>
                )}
                {step === 4 && (
                  <div className="grid gap-4">
                    <div className="rounded-xl border border-border bg-secondary/40 p-4 text-sm">
                      <div><span className="text-muted-foreground">Service:</span> <strong>{data.service}</strong></div>
                      <div><span className="text-muted-foreground">Tier:</span> <strong>{data.tier}</strong></div>
                      <div><span className="text-muted-foreground">Budget:</span> <strong>{data.budget}</strong> {data.negotiable && <em className="text-muted-foreground">(negotiable)</em>}</div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="text-sm font-medium">Your name</label>
                        <input value={data.name} onChange={(e) => set("name", e.target.value)} required className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm" />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Email</label>
                        <input type="email" value={data.email} onChange={(e) => set("email", e.target.value)} required className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm" />
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-6 flex items-center justify-between">
                  <Button type="button" variant="outline" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>Back</Button>
                  {step < steps.length - 1 ? (
                    <Button type="button" variant="brand" onClick={() => setStep((s) => s + 1)}>Next <ArrowRight className="h-4 w-4" /></Button>
                  ) : (
                    <Button type="button" variant="brand" onClick={() => setDone(true)}>Submit brief</Button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </Section>
    </SiteLayout>
  );
}