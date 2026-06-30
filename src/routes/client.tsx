import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, Inbox, MessageSquare, Receipt, Settings } from "lucide-react";

export const Route = createFileRoute("/client")({
  head: () => ({ meta: [{ title: "Client Dashboard — NDH" }, { name: "robots", content: "noindex" }] }),
  component: ClientDashboard,
});

const services = ["Design", "Development", "Content", "Marketing", "Media", "AI & Tech"];
const tiers = [
  { name: "Basic", desc: "Solid execution, one round of revisions." },
  { name: "Pro", desc: "Premium craft, senior talent, two rounds." },
  { name: "Premium", desc: "Elite tier, full PM treatment, unlimited polish." },
];

function ClientDashboard() {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [data, setData] = useState({ service: "Design", tier: "Pro", budget: "1000-2500", negotiable: true, desc: "", deadline: "", email: "", name: "" });
  const set = <K extends keyof typeof data>(k: K, v: (typeof data)[K]) => setData((d) => ({ ...d, [k]: v }));
  const steps = ["Service", "Tier", "Budget", "Brief", "Submit"];

  return (
    <SiteLayout>
      <section className="border-b border-border bg-secondary/40 py-10">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Client Dashboard</div>
          <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">Welcome back.</h1>
          <p className="mt-2 text-muted-foreground">Submit a new task, track work, message your PM and view invoices.</p>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-12 lg:grid-cols-[260px_1fr]">
        <aside className="space-y-1">
          {[
            { icon: Inbox, label: "Submit a Task", active: true },
            { icon: CheckCircle2, label: "My Projects" },
            { icon: MessageSquare, label: "Messages" },
            { icon: Receipt, label: "Invoices" },
            { icon: Settings, label: "Settings" },
          ].map((i) => (
            <button key={i.label} className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${i.active ? "bg-gradient-brand text-white shadow-glow" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}>
              <i.icon className="h-4 w-4" /> {i.label}
            </button>
          ))}
        </aside>

        <main>
          <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
            <div className="mb-8 flex items-center gap-2">
              {steps.map((s, i) => (
                <div key={s} className="flex flex-1 items-center gap-2">
                  <div className={`grid h-8 w-8 place-items-center rounded-full text-xs font-bold ${i <= step ? "bg-gradient-brand text-white shadow-glow" : "bg-secondary text-muted-foreground"}`}>{i + 1}</div>
                  <div className="hidden text-xs font-semibold sm:block">{s}</div>
                  {i < steps.length - 1 && <div className={`h-px flex-1 ${i < step ? "bg-gradient-brand" : "bg-border"}`} />}
                </div>
              ))}
            </div>

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
                      <label className="text-sm font-medium">Budget range</label>
                      <select value={data.budget} onChange={(e) => set("budget", e.target.value)} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm">
                        <option value="under-500">Under ₦750k</option>
                        <option value="500-1000">₦750k – ₦1.5m</option>
                        <option value="1000-2500">₦1.5m – ₦4m</option>
                        <option value="2500-5000">₦4m – ₦8m</option>
                        <option value="5000-plus">₦8m+</option>
                      </select>
                    </div>
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={data.negotiable} onChange={(e) => set("negotiable", e.target.checked)} /> Open to negotiation
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
                  <div className="rounded-xl border border-border bg-secondary/40 p-4 text-sm">
                    <div><span className="text-muted-foreground">Service:</span> <strong>{data.service}</strong></div>
                    <div><span className="text-muted-foreground">Tier:</span> <strong>{data.tier}</strong></div>
                    <div><span className="text-muted-foreground">Budget:</span> <strong>{data.budget}</strong> {data.negotiable && <em className="text-muted-foreground">(negotiable)</em>}</div>
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
        </main>
      </div>
    </SiteLayout>
  );
}