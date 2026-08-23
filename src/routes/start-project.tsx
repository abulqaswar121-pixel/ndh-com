import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Reveal } from "@/components/site/Reveal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { submitProjectQuote } from "@/lib/scoping.functions";
import { toast } from "sonner";
import { CheckCircle2, ChevronLeft, ChevronRight, Globe, ShieldCheck, Clock, Lock, Sparkles } from "lucide-react";

export const Route = createFileRoute("/start-project")({
  head: () => ({
    meta: [
      { title: "Start a Project — 2 Steps, Free Scoping Worldwide | NDH" },
      { name: "description", content: "Tell us what you need in 2 minutes. Worldwide official bureau. PM scopes in 4h any timezone, no budget talk upfront — discuss inside dashboard." },
    ],
  }),
  component: StartProjectPage,
});

const PROJECT_TYPES = ["Website / Web App","Mobile App","Brand & Design","Marketing Campaign","Content & Video","AI Automation","Custom Software","Other"];
const SERVICES = ["Brand Identity","UI/UX Design","Web Development","Mobile App","Content SEO","Paid Ads","Social Media","Video Editing","AI Agent","E-commerce","No-Code AI Apps","Workflow Automation"];

type State = { project_type: string; services: string[]; description: string; name: string; email: string; phone: string; company: string; };

function StartProjectPage() {
  const navigate = useNavigate();
  const submit = useServerFn(submitProjectQuote);
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [s, setS] = useState<State>({ project_type: "", services: [], description: "", name: "", email: "", phone: "", company: "" });

  const steps = ["What you need", "Details", "Contact"];
  const total = steps.length;
  const progress = useMemo(() => Math.round(((step+1)/total)*100), [step,total]);
  const canNext = () => {
    if (step===0) return !!s.project_type && s.services.length>0;
    if (step===1) return s.description.trim().length>=10;
    if (step===2) return s.name.trim().length>=2 && /\S+@\S+\.\S+/.test(s.email);
    return true;
  };
  const toggleSvc = (v:string) => setS((p)=>({...p, services: p.services.includes(v) ? p.services.filter(x=>x!==v) : [...p.services, v]}));

  const onSubmit = async () => {
    if (!canNext()) return;
    setSubmitting(true);
    try {
      await submit({ data: { name: s.name, email: s.email, phone: s.phone, company: s.company, project_type: s.project_type, services: s.services, budget_range: "To be discussed inside dashboard", timeline: "Flexible worldwide", description: s.description } });
      setDone(true);
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed."); }
    finally { setSubmitting(false); }
  };

  return (
    <SiteLayout>
      <section className="relative overflow-hidden bg-[#0A0E2A] py-14 text-white sm:py-16">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(white 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
        <div className="relative mx-auto max-w-3xl px-6">
          <Reveal>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70"><Globe className="h-3.5 w-3.5 text-teal-400" /> Official Bureau • No Budget Talk Upfront • Discuss Inside Dashboard</div>
            <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">Let's scope your project — 2 minutes, worldwide.</h1>
            <p className="mt-3 max-w-2xl text-sm text-white/60">Simple 3 steps — no budget stress upfront. Tell us what you need, details, contact. PM will discuss budget inside dashboard message, worldwide timezone, NDA included.</p>
            <div className="mt-4 flex flex-wrap gap-3 text-xs text-white/50">
              <span className="inline-flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5 text-blue-400" /> Escrow • 80 Services</span>
              <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5 text-purple-400" /> Quote in 4h</span>
              <span className="inline-flex items-center gap-1"><Lock className="h-3.5 w-3.5 text-teal-400" /> No Budget Upfront • Discuss Inside</span>
            </div>
          </Reveal>
        </div>
      </section>

      <div className="mx-auto max-w-2xl px-6 py-10">
        {done ? (
          <div className="rounded-2xl border bg-card p-8 text-center shadow-sm">
            <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
            <h2 className="mt-4 text-2xl font-bold">Thanks, {s.name.split(" ")[0]}! — Received worldwide</h2>
            <p className="mt-2 text-sm text-muted-foreground">We received your project <b>{s.project_type}</b> with {s.services.length} services. PM will discuss budget + timeline inside dashboard messages (not upfront) — check email {s.email} within 4h worldwide.</p>
            <div className="mt-6 flex justify-center gap-2">
              <Button variant="outline" onClick={()=>navigate({to:"/"})}>Back to home</Button>
              <Link to="/services"><Button>Browse 80 Services</Button></Link>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
            <div className="mb-6">
              <div className="flex items-center justify-between text-xs text-muted-foreground"><span>Step {step+1} of {total} — {steps[step]} • Simple • No Budget Stress</span><span>{progress}%</span></div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary"><div className="h-full rounded-full bg-primary transition-all duration-500" style={{width:`${progress}%`}} /></div>
            </div>

            {step===0 && (
              <div>
                <h2 className="text-xl font-bold">What do you need?</h2>
                <p className="mt-1 text-sm text-muted-foreground">Pick project type + services you need — 80 services available worldwide. No budget yet.</p>
                <div className="mt-4">
                  <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Project type</div>
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    {PROJECT_TYPES.map((t)=><button key={t} type="button" onClick={()=>setS((p)=>({...p, project_type:t}))} className={`rounded-xl border p-3 text-left text-sm transition ${s.project_type===t ? "border-primary bg-primary/5 font-semibold" : "border-border hover:border-primary/40"}`}>{t}</button>)}
                  </div>
                </div>
                <div className="mt-6">
                  <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Services — Pick all that apply (80 total)</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {SERVICES.map((sv)=><button key={sv} type="button" onClick={()=>toggleSvc(sv)} className={`rounded-full border px-3 py-1.5 text-xs transition ${s.services.includes(sv) ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary/40"}`}>{sv}</button>)}
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">{s.services.length} selected • Full 80 on /services</div>
                </div>
              </div>
            )}

            {step===1 && (
              <div>
                <h2 className="text-xl font-bold">Tell us more — Details</h2>
                <p className="mt-1 text-sm text-muted-foreground">Goals, audience, references, must-haves — anything helps PM scope in 4h worldwide. No budget talk here.</p>
                <Textarea rows={8} className="mt-4" placeholder="We want to build marketplace for worldwide... Target audience... References..." value={s.description} onChange={(e)=>setS((p)=>({...p, description:e.target.value}))} />
                <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground"><span>{s.description.trim().length}/10 min — Trusted worldwide, NDA included</span><span className="inline-flex items-center gap-1"><Sparkles className="h-3 w-3" /> AI will help PM scope</span></div>
              </div>
            )}

            {step===2 && (
              <div>
                <h2 className="text-xl font-bold">How can we reach you? Contact</h2>
                <p className="mt-1 text-sm text-muted-foreground">We respond within 4h any timezone worldwide. Budget will be discussed inside dashboard, not here — no stress.</p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div><Label>Full name*</Label><Input className="mt-1" value={s.name} onChange={(e)=>setS((p)=>({...p, name:e.target.value}))} placeholder="Najeeb — Founder" /></div>
                  <div><Label>Email*</Label><Input type="email" className="mt-1" value={s.email} onChange={(e)=>setS((p)=>({...p, email:e.target.value}))} placeholder="you@company.com" /></div>
                  <div><Label>Phone/WhatsApp (country code)</Label><Input className="mt-1" value={s.phone} onChange={(e)=>setS((p)=>({...p, phone:e.target.value}))} placeholder="+234 902 993 2794 or +44..." /></div>
                  <div><Label>Company (optional)</Label><Input className="mt-1" value={s.company} onChange={(e)=>setS((p)=>({...p, company:e.target.value}))} placeholder="NDH • Official" /></div>
                </div>
                <div className="mt-4 rounded-lg bg-secondary/40 p-3 text-xs leading-relaxed text-muted-foreground">
                  <strong>Worldwide Trust:</strong> By submitting, you agree to Terms, Privacy, Trust & Safety — escrow, NDA, QA on every task, fixed-quote guarantee, Nigeria to worldwide clients. No spam. Budget + timeline will be discussed inside dashboard messages after scoping — no stress upfront.
                </div>
              </div>
            )}

            <div className="mt-8 flex items-center justify-between">
              <Button variant="outline" disabled={step===0} onClick={()=>setStep((n)=>Math.max(0,n-1))}><ChevronLeft className="mr-1 h-4 w-4" /> Back</Button>
              {step < total-1 ? <Button disabled={!canNext()} onClick={()=>setStep((n)=>Math.min(total-1,n+1))}>Next — {steps[step+1]} <ChevronRight className="ml-1 h-4 w-4" /></Button> : <Button disabled={!canNext() || submitting} onClick={onSubmit}>{submitting ? "Submitting worldwide…" : "Submit — Free scoping worldwide • 2 min"}</Button>}
            </div>
            <div className="mt-4 text-center text-[10px] uppercase tracking-widest text-muted-foreground">Simple 3 steps • No budget upfront • Discuss inside dashboard • Official • 80 Services • 40 AI Courses</div>
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
