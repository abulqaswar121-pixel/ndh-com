import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { AnimatedBlobs } from "@/components/site/AnimatedBlobs";
import { Reveal } from "@/components/site/Reveal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { submitProjectQuote } from "@/lib/scoping.functions";
import { toast } from "sonner";
import { CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/start-project")({
  head: () => ({
    meta: [
      { title: "Start a Project — Scope your build in 2 minutes | NDH" },
      { name: "description", content: "Tell us what you need. Our team scopes, prices, and assigns the right specialists — usually within 24 hours." },
      { property: "og:title", content: "Start a project with NDH" },
      { property: "og:description", content: "Get a fast, accurate scope and quote from the NDH bureau." },
    ],
    links: [{ rel: "canonical", href: "/start-project" }],
  }),
  component: StartProjectPage,
});

const PROJECT_TYPES = [
  "Website / Web App",
  "Mobile App",
  "Brand & Design",
  "Marketing Campaign",
  "Content & Video",
  "Custom Software",
  "Other",
];
const SERVICES = [
  "UI/UX Design", "Web Development", "Mobile Development", "Branding",
  "SEO", "Paid Ads", "Social Media", "Content Writing", "Video Production",
  "Photography", "AI / Automation", "Consulting",
];
const BUDGETS = ["Under ₦500k", "₦500k – ₦2M", "₦2M – ₦5M", "₦5M – ₦15M", "₦15M+", "Not sure yet"];
const TIMELINES = ["ASAP (within 2 weeks)", "1 month", "1–3 months", "3–6 months", "Flexible"];

type State = {
  project_type: string;
  services: string[];
  budget_range: string;
  timeline: string;
  description: string;
  name: string;
  email: string;
  phone: string;
  company: string;
};

function StartProjectPage() {
  const navigate = useNavigate();
  const submit = useServerFn(submitProjectQuote);
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [s, setS] = useState<State>({
    project_type: "", services: [], budget_range: "", timeline: "",
    description: "", name: "", email: "", phone: "", company: "",
  });

  const steps = ["Project", "Services", "Budget", "Timeline", "Details", "Contact"];
  const total = steps.length;
  const progress = useMemo(() => Math.round(((step + 1) / total) * 100), [step, total]);

  const canNext = () => {
    if (step === 0) return !!s.project_type;
    if (step === 1) return s.services.length > 0;
    if (step === 2) return !!s.budget_range;
    if (step === 3) return !!s.timeline;
    if (step === 4) return s.description.trim().length >= 10;
    if (step === 5) return s.name.trim().length >= 2 && /\S+@\S+\.\S+/.test(s.email);
    return true;
  };

  const toggleSvc = (v: string) =>
    setS((p) => ({ ...p, services: p.services.includes(v) ? p.services.filter((x) => x !== v) : [...p.services, v] }));

  const onSubmit = async () => {
    if (!canNext()) return;
    setSubmitting(true);
    try {
      await submit({ data: {
        name: s.name, email: s.email, phone: s.phone, company: s.company,
        project_type: s.project_type, services: s.services,
        budget_range: s.budget_range, timeline: s.timeline, description: s.description,
      } });
      setDone(true);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SiteLayout>
      <section className="relative isolate overflow-hidden bg-hero py-20 text-white">
        <AnimatedBlobs />
        <div className="relative mx-auto max-w-4xl px-6">
          <Reveal>
            <div className="text-xs font-semibold uppercase tracking-widest text-white/70">Start a Project</div>
            <h1 className="mt-3 text-4xl font-extrabold sm:text-5xl">Let's scope your project.</h1>
            <p className="mt-4 max-w-2xl text-white/75">Six quick questions. We'll come back within 24 hours with a scope, timeline, and price.</p>
          </Reveal>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-6 py-12">
        {done ? (
          <div className="rounded-2xl border border-border bg-card p-10 text-center">
            <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-500" />
            <h2 className="mt-4 text-2xl font-bold">Thanks, {s.name.split(" ")[0]}!</h2>
            <p className="mt-2 text-muted-foreground">We've received your project. Our team will review and reach out to <span className="font-semibold text-foreground">{s.email}</span> within 24 hours.</p>
            <div className="mt-6 flex justify-center gap-3">
              <Button variant="outline" onClick={() => navigate({ to: "/" })}>Back to home</Button>
              <Button onClick={() => navigate({ to: "/services" })}>Explore services</Button>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
            <div className="mb-6">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Step {step + 1} of {total} — {steps[step]}</span>
                <span>{progress}%</span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary">
                <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>

            {step === 0 && (
              <div>
                <h2 className="text-xl font-bold">What kind of project is it?</h2>
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {PROJECT_TYPES.map((t) => (
                    <button key={t} type="button" onClick={() => setS((p) => ({ ...p, project_type: t }))}
                      className={`rounded-xl border p-4 text-left transition ${s.project_type === t ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}>
                      <div className="font-semibold">{t}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 1 && (
              <div>
                <h2 className="text-xl font-bold">Which services do you need?</h2>
                <p className="mt-1 text-sm text-muted-foreground">Pick all that apply.</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {SERVICES.map((sv) => (
                    <button key={sv} type="button" onClick={() => toggleSvc(sv)}
                      className={`rounded-full border px-4 py-2 text-sm transition ${s.services.includes(sv) ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary/50"}`}>
                      {sv}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <h2 className="text-xl font-bold">What's your budget range?</h2>
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {BUDGETS.map((b) => (
                    <button key={b} type="button" onClick={() => setS((p) => ({ ...p, budget_range: b }))}
                      className={`rounded-xl border p-4 text-left transition ${s.budget_range === b ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}>
                      {b}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <h2 className="text-xl font-bold">When do you need it done?</h2>
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {TIMELINES.map((t) => (
                    <button key={t} type="button" onClick={() => setS((p) => ({ ...p, timeline: t }))}
                      className={`rounded-xl border p-4 text-left transition ${s.timeline === t ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 4 && (
              <div>
                <h2 className="text-xl font-bold">Tell us more.</h2>
                <p className="mt-1 text-sm text-muted-foreground">Goals, audience, references, must-haves — anything helps.</p>
                <Textarea rows={8} className="mt-4" placeholder="We want to build a marketplace for..."
                  value={s.description} onChange={(e) => setS((p) => ({ ...p, description: e.target.value }))} />
                <div className="mt-1 text-xs text-muted-foreground">{s.description.trim().length}/10 minimum</div>
              </div>
            )}

            {step === 5 && (
              <div>
                <h2 className="text-xl font-bold">How can we reach you?</h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label>Full name*</Label>
                    <Input className="mt-1" value={s.name} onChange={(e) => setS((p) => ({ ...p, name: e.target.value }))} />
                  </div>
                  <div>
                    <Label>Email*</Label>
                    <Input type="email" className="mt-1" value={s.email} onChange={(e) => setS((p) => ({ ...p, email: e.target.value }))} />
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input className="mt-1" value={s.phone} onChange={(e) => setS((p) => ({ ...p, phone: e.target.value.replace(/[^\d+\-\s]/g, "") }))} />
                  </div>
                  <div>
                    <Label>Company</Label>
                    <Input className="mt-1" value={s.company} onChange={(e) => setS((p) => ({ ...p, company: e.target.value }))} />
                  </div>
                </div>
              </div>
            )}

            <div className="mt-8 flex items-center justify-between">
              <Button variant="outline" disabled={step === 0} onClick={() => setStep((n) => Math.max(0, n - 1))}>
                <ChevronLeft className="mr-1 h-4 w-4" /> Back
              </Button>
              {step < total - 1 ? (
                <Button disabled={!canNext()} onClick={() => setStep((n) => Math.min(total - 1, n + 1))}>
                  Next <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              ) : (
                <Button disabled={!canNext() || submitting} onClick={onSubmit}>
                  {submitting ? "Submitting…" : "Submit project"}
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </SiteLayout>
  );
}