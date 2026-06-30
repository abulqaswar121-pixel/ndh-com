import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useCurrency } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Loader2, Upload, X, ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { notifyTaskCreated } from "@/lib/email/task-emails.functions";

const SERVICES = [
  { id: "design", label: "Design", desc: "Brand, web/app UI, graphics, motion." },
  { id: "development", label: "Development", desc: "Web apps, mobile, integrations." },
  { id: "content", label: "Content", desc: "Copywriting, scripts, articles." },
  { id: "marketing", label: "Marketing", desc: "SEO, ads, social, growth." },
  { id: "media", label: "Media", desc: "Video, photo, podcast production." },
  { id: "ai", label: "AI", desc: "Automations, chatbots, AI workflows." },
] as const;

const TIERS = [
  { id: "basic", label: "Basic", desc: "Junior talent, fast turnaround, lighter scope." },
  { id: "professional", label: "Professional", desc: "Senior talent, full scope, QA review." },
  { id: "premium", label: "Premium", desc: "Lead talent + HOD oversight, premium delivery." },
] as const;

type Service = typeof SERVICES[number]["id"];
type Tier = typeof TIERS[number]["id"];

export function SubmitTaskWizard({ onDone }: { onDone: () => void }) {
  const { user } = useAuth();
  const { format } = useCurrency();
  const notify = useServerFn(notifyTaskCreated);
  const [step, setStep] = useState(1);
  const [service, setService] = useState<Service | null>(null);
  const [tier, setTier] = useState<Tier>("professional");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [budget, setBudget] = useState<number[]>([100000, 500000]);
  const [negotiable, setNegotiable] = useState(true);
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const next = () => setStep((s) => Math.min(4, s + 1));
  const back = () => setStep((s) => Math.max(1, s - 1));

  const handleSubmit = async () => {
    if (!user || !service) return;
    setSubmitting(true);
    try {
      // Insert task first to get id
      const { data: task, error: e1 } = await supabase
        .from("tasks")
        .insert({
          client_id: user.id,
          service_category: service,
          tier,
          title,
          description,
          deadline: deadline || null,
          budget_min: budget[0],
          budget_max: budget[1],
          budget_currency: "NGN",
          open_to_negotiation: negotiable,
          status: "pending",
        })
        .select("id")
        .single();
      if (e1 || !task) throw e1 || new Error("Failed to create task");

      // Upload files
      const uploaded: { name: string; path: string; size: number }[] = [];
      for (const f of files) {
        const path = `${user.id}/${task.id}/${Date.now()}-${f.name}`;
        const { error } = await supabase.storage.from("task-files").upload(path, f, { upsert: false });
        if (!error) uploaded.push({ name: f.name, path, size: f.size });
      }
      if (uploaded.length) {
        await supabase.from("tasks").update({ files: uploaded }).eq("id", task.id);
      }
      // Fire-and-forget: send client + PM notification emails
      notify({ data: { taskId: task.id } }).catch((e) => console.error("notifyTaskCreated", e));
      toast.success("Task submitted — our PM will reach out shortly.");
      onDone();
    } catch (err) {
      toast.error((err as Error).message || "Could not submit task");
    } finally {
      setSubmitting(false);
    }
  };

  const onPickFiles = (list: FileList | null) => {
    if (!list) return;
    setFiles((prev) => [...prev, ...Array.from(list)].slice(0, 8));
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold">Submit a Task</h1>
        <p className="mt-1 text-sm text-muted-foreground">Tell us about your project — we'll route it to the right department.</p>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className={`h-1.5 flex-1 rounded-full ${s <= step ? "bg-gradient-brand" : "bg-secondary"}`} />
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold">1. Select service</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {SERVICES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setService(s.id)}
                  className={`rounded-xl border p-4 text-left transition ${service === s.id ? "border-[oklch(0.65_0.19_252)] bg-gradient-brand text-white shadow-glow" : "border-border bg-background hover:border-foreground/30"}`}
                >
                  <div className="font-semibold">{s.label}</div>
                  <div className={`mt-1 text-xs ${service === s.id ? "text-white/80" : "text-muted-foreground"}`}>{s.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold">2. Select tier</h2>
            <div className="grid gap-3">
              {TIERS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTier(t.id)}
                  className={`rounded-xl border p-4 text-left transition ${tier === t.id ? "border-[oklch(0.65_0.19_252)] bg-gradient-brand text-white shadow-glow" : "border-border bg-background hover:border-foreground/30"}`}
                >
                  <div className="font-semibold">{t.label}</div>
                  <div className={`mt-1 text-xs ${tier === t.id ? "text-white/80" : "text-muted-foreground"}`}>{t.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <h2 className="text-lg font-bold">3. Project details</h2>
            <div>
              <label className="text-sm font-medium">Title</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} required className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} required rows={6} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium">Reference files</label>
              <label className="mt-1 grid cursor-pointer place-items-center rounded-lg border-2 border-dashed border-border bg-background py-8 text-center text-sm text-muted-foreground hover:border-foreground/30">
                <Upload className="mb-2 h-5 w-5" />
                Drop files here or click to browse (max 8)
                <input type="file" multiple className="hidden" onChange={(e) => onPickFiles(e.target.files)} />
              </label>
              {files.length > 0 && (
                <ul className="mt-2 space-y-1 text-sm">
                  {files.map((f, i) => (
                    <li key={i} className="flex items-center justify-between rounded-md bg-secondary px-3 py-1.5">
                      <span className="truncate">{f.name}</span>
                      <button onClick={() => setFiles((p) => p.filter((_, j) => j !== i))}><X className="h-3.5 w-3.5" /></button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium">Deadline</label>
                <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm" />
              </div>
              <div className="flex items-end gap-2">
                <label className="inline-flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={negotiable} onChange={(e) => setNegotiable(e.target.checked)} />
                  Open to negotiation
                </label>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Budget range (NGN)</label>
              <div className="mt-2 text-xs text-muted-foreground">{format(budget[0])} — {format(budget[1])}</div>
              <Slider min={20000} max={5000000} step={10000} value={budget} onValueChange={setBudget} className="mt-3" />
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold">4. Review & submit</h2>
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <Row k="Service" v={service ?? "—"} />
              <Row k="Tier" v={tier} />
              <Row k="Title" v={title || "—"} />
              <Row k="Deadline" v={deadline || "Flexible"} />
              <Row k="Budget" v={`${format(budget[0])} — ${format(budget[1])}`} />
              <Row k="Files" v={String(files.length)} />
            </dl>
            <div className="rounded-lg bg-secondary px-4 py-3 text-xs text-muted-foreground">
              On submit, your task is routed to the {service ?? "—"} department PM and you'll be notified by email.
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={back} disabled={step === 1 || submitting}><ChevronLeft className="h-4 w-4" /> Back</Button>
        {step < 4 ? (
          <Button
            variant="brand"
            onClick={next}
            disabled={(step === 1 && !service) || (step === 3 && (!title || !description))}
          >
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button variant="brand" onClick={handleSubmit} disabled={submitting}>
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <><CheckCircle2 className="h-4 w-4" /> Submit task</>}
          </Button>
        )}
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-lg border border-border bg-background px-3 py-2">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{k}</div>
      <div className="mt-0.5 font-semibold capitalize">{v}</div>
    </div>
  );
}