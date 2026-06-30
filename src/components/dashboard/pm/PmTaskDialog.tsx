import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { sendQuote, assignTalent, approveAndDeliver, requestRevision, completeTask, declineTask } from "@/lib/pm/pm.functions";
import { TaskChat } from "@/components/dashboard/client/TaskChat";
import { Loader2, FileText, ExternalLink, CheckCircle2, RotateCcw, Send, UserPlus } from "lucide-react";
import { toast } from "sonner";

type Task = any;

export function PmTaskDialog({ taskId, onClose, onChanged }: { taskId: string | null; onClose: () => void; onChanged?: () => void }) {
  const [task, setTask] = useState<Task | null>(null);
  const [client, setClient] = useState<any>(null);
  const [talent, setTalent] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [quote, setQuote] = useState<any>(null);

  useEffect(() => {
    if (!taskId) return;
    let mounted = true;
    const load = async () => {
      const { data: t } = await supabase.from("tasks").select("*").eq("id", taskId).maybeSingle();
      if (!mounted) return;
      setTask(t);
      if (t?.client_id) {
        const { data: c } = await supabase.from("profiles").select("id,full_name,email,phone,country").eq("id", t.client_id).maybeSingle();
        setClient(c);
      }
      if (t?.assigned_talent_id) {
        const { data: ta } = await supabase.from("profiles").select("id,full_name,email").eq("id", t.assigned_talent_id).maybeSingle();
        setTalent(ta);
      }
      const { data: ev } = await supabase.from("task_events").select("*").eq("task_id", taskId).order("created_at", { ascending: false });
      setEvents(ev || []);
      const { data: q } = await supabase.from("quotes").select("*").eq("task_id", taskId).order("created_at", { ascending: false }).limit(1).maybeSingle();
      setQuote(q);
    };
    load();
    const ch = supabase.channel(`pm-task-${taskId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "tasks", filter: `id=eq.${taskId}` }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "task_events", filter: `task_id=eq.${taskId}` }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "quotes", filter: `task_id=eq.${taskId}` }, load)
      .subscribe();
    return () => { mounted = false; supabase.removeChannel(ch); };
  }, [taskId]);

  if (!taskId || !task) {
    return (
      <Dialog open={!!taskId} onOpenChange={(v) => !v && onClose()}>
        <DialogContent className="max-w-3xl"><div className="grid h-40 place-items-center"><Loader2 className="h-5 w-5 animate-spin" /></div></DialogContent>
      </Dialog>
    );
  }

  const refresh = () => { onChanged?.(); };

  return (
    <Dialog open={!!taskId} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between gap-3">
            <span className="truncate">{task.title}</span>
            <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">{task.status.replace("_", " ")}</span>
          </DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="overview">
          <TabsList className="flex flex-wrap">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="quote">Quote</TabsTrigger>
            <TabsTrigger value="talent">Talent</TabsTrigger>
            <TabsTrigger value="qa">QA</TabsTrigger>
            <TabsTrigger value="client-chat">Client chat</TabsTrigger>
            <TabsTrigger value="talent-chat">Talent chat</TabsTrigger>
            <TabsTrigger value="files">Files</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <Overview task={task} client={client} talent={talent} onChanged={refresh} />
          </TabsContent>
          <TabsContent value="quote">
            <QuoteTab task={task} quote={quote} onChanged={refresh} />
          </TabsContent>
          <TabsContent value="talent">
            <TalentTab task={task} onChanged={refresh} />
          </TabsContent>
          <TabsContent value="qa">
            <QaTab task={task} onChanged={refresh} />
          </TabsContent>
          <TabsContent value="client-chat">
            {task.client_id && <TaskChat taskId={task.id} pmId={task.client_id} />}
          </TabsContent>
          <TabsContent value="talent-chat">
            {task.assigned_talent_id
              ? <TaskChat taskId={task.id} pmId={task.assigned_talent_id} />
              : <Empty>No talent assigned yet.</Empty>}
          </TabsContent>
          <TabsContent value="files">
            <FilesTab task={task} />
          </TabsContent>
          <TabsContent value="history">
            <HistoryTab events={events} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <div className="grid h-32 place-items-center text-sm text-muted-foreground">{children}</div>;
}

function Overview({ task, client, talent, onChanged }: any) {
  const decline = useServerFn(declineTask);
  const complete = useServerFn(completeTask);

  const onDecline = async () => {
    const reason = window.prompt("Decline reason (will be shared with client)");
    if (!reason) return;
    try { await (decline as any)({ data: { task_id: task.id, reason } }); toast.success("Task declined."); onChanged?.(); }
    catch (e) { toast.error((e as Error).message); }
  };
  const onComplete = async () => {
    try { await (complete as any)({ data: { task_id: task.id } }); toast.success("Task completed."); onChanged?.(); }
    catch (e) { toast.error((e as Error).message); }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Section title="Client">
        <Row k="Name" v={client?.full_name || "—"} />
        <Row k="Email" v={client?.email || "—"} />
        <Row k="Phone" v={client?.phone || "—"} />
        <Row k="Country" v={client?.country || "—"} />
      </Section>
      <Section title="Brief">
        <Row k="Category" v={task.service_category} />
        <Row k="Tier" v={task.tier} />
        <Row k="Budget" v={`${task.budget_currency || "NGN"} ${task.budget_min ?? "?"} – ${task.budget_max ?? "?"}`} />
        <Row k="Deadline" v={task.deadline || "Flexible"} />
        <Row k="Created" v={new Date(task.created_at).toLocaleString()} />
      </Section>
      <Section title="Assignment" className="md:col-span-2">
        <Row k="Talent" v={talent?.full_name || "—"} />
        <Row k="Talent pay rate" v={task.talent_pay_rate ? `₦${Number(task.talent_pay_rate).toLocaleString()}` : "—"} />
        <Row k="Quoted" v={task.quoted_amount ? `${task.quoted_currency || "NGN"} ${Number(task.quoted_amount).toLocaleString()}` : "—"} />
      </Section>
      <div className="md:col-span-2">
        <div className="text-sm font-semibold">Description</div>
        <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">{task.description || "—"}</p>
      </div>
      <div className="md:col-span-2 flex flex-wrap gap-2">
        {task.status === "delivered" && (
          <Button variant="brand" onClick={onComplete}><CheckCircle2 className="h-4 w-4" /> Mark completed</Button>
        )}
        {!["completed", "cancelled"].includes(task.status) && (
          <Button variant="outline" onClick={onDecline}>Decline task</Button>
        )}
      </div>
    </div>
  );
}

function Section({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-border bg-card p-4 ${className}`}>
      <div className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">{title}</div>
      <div className="grid gap-1.5 text-sm">{children}</div>
    </div>
  );
}
function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return <div className="flex justify-between gap-3"><span className="text-muted-foreground">{k}</span><span className="font-medium text-right">{v}</span></div>;
}

function QuoteTab({ task, quote, onChanged }: any) {
  const send = useServerFn(sendQuote);
  const [amount, setAmount] = useState<string>(quote?.amount?.toString() || String(task.budget_max ?? task.budget_min ?? 0));
  const [currency, setCurrency] = useState<string>(quote?.currency || task.budget_currency || "NGN");
  const [days, setDays] = useState<string>(quote?.delivery_days?.toString() || "7");
  const [notes, setNotes] = useState<string>(quote?.notes || "");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    setSaving(true);
    try {
      await (send as any)({ data: {
        task_id: task.id, amount: Number(amount), currency,
        delivery_days: Number(days) || undefined, notes: notes || undefined,
      }});
      toast.success("Quote sent to client.");
      onChanged?.();
    } catch (e) { toast.error((e as Error).message); } finally { setSaving(false); }
  };

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {quote && (
        <div className="md:col-span-2 rounded-xl border border-border bg-secondary/40 p-3 text-sm">
          <div className="flex items-center justify-between">
            <div>Latest quote · <span className="font-bold">{quote.currency} {Number(quote.amount).toLocaleString()}</span></div>
            <span className="rounded-full bg-background px-2 py-0.5 text-[10px] font-bold uppercase">{quote.status}</span>
          </div>
          {quote.notes && <p className="mt-1 text-xs text-muted-foreground">{quote.notes}</p>}
        </div>
      )}
      <Input label="Amount" value={amount} onChange={setAmount} type="number" />
      <div>
        <label className="text-sm font-medium">Currency</label>
        <select value={currency} onChange={(e) => setCurrency(e.target.value)}
          className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
          {["NGN","USD","GBP","EUR","CAD","AED"].map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>
      <Input label="Delivery (days)" value={days} onChange={setDays} type="number" />
      <div className="md:col-span-2">
        <label className="text-sm font-medium">Notes / scope</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4}
          className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
      </div>
      <div className="md:col-span-2">
        <Button variant="brand" onClick={submit} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Send className="h-4 w-4" /> {quote ? "Update quote" : "Send quote"}</>}
        </Button>
      </div>
    </div>
  );
}

function Input({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
    </label>
  );
}

function TalentTab({ task, onChanged }: any) {
  const [talents, setTalents] = useState<any[]>([]);
  const [pick, setPick] = useState<string>(task.assigned_talent_id || "");
  const [rate, setRate] = useState<string>(task.talent_pay_rate?.toString() || "");
  const [saving, setSaving] = useState(false);
  const assign = useServerFn(assignTalent);

  useEffect(() => {
    supabase.from("talents")
      .select("user_id, tier, status, availability, tasks_completed, approval_rate, skills, profiles:profiles!talents_user_id_fkey(full_name,email)" as any)
      .eq("department_id", task.department_id)
      .order("approval_rate", { ascending: false })
      .then(({ data }) => setTalents(data || []));
  }, [task.department_id]);

  const submit = async () => {
    if (!pick) { toast.error("Pick a talent"); return; }
    setSaving(true);
    try {
      await (assign as any)({ data: { task_id: task.id, talent_id: pick, pay_rate: rate ? Number(rate) : undefined } });
      toast.success("Talent assigned.");
      onChanged?.();
    } catch (e) { toast.error((e as Error).message); } finally { setSaving(false); }
  };

  const sorted = [...talents].sort((a, b) => (a.availability === "available" ? -1 : 1) - (b.availability === "available" ? -1 : 1));

  return (
    <div className="grid gap-3">
      <div className="max-h-72 overflow-auto rounded-xl border border-border">
        {sorted.map((t) => (
          <button key={t.user_id} onClick={() => setPick(t.user_id)}
            className={`flex w-full items-center justify-between border-b border-border px-4 py-3 text-left text-sm last:border-0 ${pick === t.user_id ? "bg-secondary" : "hover:bg-secondary/40"}`}>
            <div>
              <div className="font-semibold">{t.profiles?.full_name || t.profiles?.email || t.user_id.slice(0, 8)}</div>
              <div className="text-xs text-muted-foreground">Tier {t.tier} · {t.availability} · {t.tasks_completed} done · {t.approval_rate}% approval</div>
            </div>
            <div className="flex flex-wrap justify-end gap-1">
              {(t.skills || []).slice(0, 3).map((s: string) => (
                <span key={s} className="rounded-full bg-background px-2 py-0.5 text-[10px]">{s}</span>
              ))}
            </div>
          </button>
        ))}
        {sorted.length === 0 && <div className="grid h-24 place-items-center text-sm text-muted-foreground">No talents in this department yet.</div>}
      </div>
      <Input label="Talent pay rate (NGN)" value={rate} onChange={setRate} type="number" />
      <Button variant="brand" onClick={submit} disabled={saving}>
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <><UserPlus className="h-4 w-4" /> Assign talent</>}
      </Button>
    </div>
  );
}

function QaTab({ task, onChanged }: any) {
  const approve = useServerFn(approveAndDeliver);
  const revise = useServerFn(requestRevision);
  const [quality, setQuality] = useState(5);
  const [comm, setComm] = useState(5);
  const [time, setTime] = useState(5);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const deliverables: any[] = Array.isArray(task.deliverables) ? task.deliverables : [];

  const onApprove = async () => {
    setSaving(true);
    try {
      await (approve as any)({ data: { task_id: task.id, quality, communication: comm, timeliness: time, review_notes: notes || undefined } });
      toast.success("Approved and delivered to client.");
      onChanged?.();
    } catch (e) { toast.error((e as Error).message); } finally { setSaving(false); }
  };
  const onRevise = async () => {
    if (notes.trim().length < 3) { toast.error("Add revision notes."); return; }
    setSaving(true);
    try {
      await (revise as any)({ data: { task_id: task.id, notes } });
      toast.success("Revision requested.");
      onChanged?.();
    } catch (e) { toast.error((e as Error).message); } finally { setSaving(false); }
  };

  const downloadFile = async (path: string) => {
    const { data } = await supabase.storage.from("task-files").createSignedUrl(path, 120);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank");
  };

  return (
    <div className="grid gap-3">
      <div className="rounded-xl border border-border bg-card p-3">
        <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Deliverables</div>
        {deliverables.length === 0 ? (
          <div className="grid h-24 place-items-center text-sm text-muted-foreground">No deliverables yet.</div>
        ) : (
          <ul className="mt-2 divide-y divide-border">
            {deliverables.map((d: any, i: number) => (
              <li key={i} className="flex items-center justify-between py-2 text-sm">
                <span className="flex items-center gap-2"><FileText className="h-4 w-4 text-muted-foreground" />{d.name}</span>
                <button onClick={() => downloadFile(d.path)} className="inline-flex items-center gap-1 text-xs font-semibold text-[oklch(0.65_0.19_252)]"><ExternalLink className="h-3 w-3" /> Open</button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <Rating label="Quality" value={quality} onChange={setQuality} />
        <Rating label="Communication" value={comm} onChange={setComm} />
        <Rating label="Timeliness" value={time} onChange={setTime} />
      </div>
      <label className="block">
        <span className="text-sm font-medium">Notes (required for revision)</span>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
          className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
      </label>
      <div className="flex flex-wrap gap-2">
        <Button variant="brand" onClick={onApprove} disabled={saving || deliverables.length === 0}>
          <CheckCircle2 className="h-4 w-4" /> Approve & deliver to client
        </Button>
        <Button variant="outline" onClick={onRevise} disabled={saving}>
          <RotateCcw className="h-4 w-4" /> Request revision
        </Button>
      </div>
    </div>
  );
}

function Rating({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <div className="text-xs font-medium text-muted-foreground">{label}</div>
      <div className="mt-1 flex gap-1">
        {[1,2,3,4,5].map((n) => (
          <button key={n} onClick={() => onChange(n)}
            className={`h-7 w-7 rounded-md text-xs font-bold ${n <= value ? "bg-gradient-brand text-white" : "bg-secondary text-muted-foreground"}`}>{n}</button>
        ))}
      </div>
    </div>
  );
}

function FilesTab({ task }: any) {
  const files: any[] = Array.isArray(task.files) ? task.files : [];
  const deliverables: any[] = Array.isArray(task.deliverables) ? task.deliverables : [];
  const open = async (path: string) => {
    const { data } = await supabase.storage.from("task-files").createSignedUrl(path, 120);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank");
  };
  const List = ({ title, items }: { title: string; items: any[] }) => (
    <div className="rounded-xl border border-border bg-card p-3">
      <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{title}</div>
      {items.length === 0 ? <div className="py-2 text-sm text-muted-foreground">None.</div> : (
        <ul className="mt-1 divide-y divide-border">
          {items.map((f, i) => (
            <li key={i} className="flex items-center justify-between py-2 text-sm">
              <span className="flex items-center gap-2"><FileText className="h-4 w-4 text-muted-foreground" />{f.name}</span>
              <button onClick={() => open(f.path)} className="text-xs font-semibold text-[oklch(0.65_0.19_252)]">Open</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
  return <div className="grid gap-3 md:grid-cols-2"><List title="Client uploads" items={files} /><List title="Talent deliverables" items={deliverables} /></div>;
}

function HistoryTab({ events }: any) {
  if (events.length === 0) return <Empty>No activity yet.</Empty>;
  return (
    <ul className="space-y-2">
      {events.map((e: any) => (
        <li key={e.id} className="rounded-lg border border-border bg-card p-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="font-semibold capitalize">{e.type.replace("_", " ")}</span>
            <span className="text-xs text-muted-foreground">{new Date(e.created_at).toLocaleString()}</span>
          </div>
          {e.payload && Object.keys(e.payload).length > 0 && (
            <pre className="mt-1 overflow-auto text-xs text-muted-foreground">{JSON.stringify(e.payload, null, 2)}</pre>
          )}
        </li>
      ))}
    </ul>
  );
}