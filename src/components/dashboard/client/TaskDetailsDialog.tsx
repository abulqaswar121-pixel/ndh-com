import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useCurrency } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import { X, Check, RefreshCw, CreditCard, Loader2, Download, Star } from "lucide-react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { initPaystackPayment } from "@/lib/paystack.functions";
import { TaskChat } from "./TaskChat";
import { ReviewModal } from "./ReviewModal";

type Task = {
  id: string; title: string; service_category: string; tier: string;
  status: string; description: string | null; deadline: string | null;
  budget_min: number | null; budget_max: number | null; created_at: string;
  assigned_pm_id?: string | null;
};

type Quote = { id: string; amount: number; currency: string; notes: string | null; status: string; created_at: string };

const STAGES = [
  { key: "pending", label: "Submitted" },
  { key: "quoted", label: "Quoted" },
  { key: "in_progress", label: "In progress" },
  { key: "in_review", label: "In review" },
  { key: "delivered", label: "Delivered" },
  { key: "completed", label: "Completed" },
] as const;

export function TaskDetailsDialog({ task, onClose }: { task: Task; onClose: () => void }) {
  const { user } = useAuth();
  const { format } = useCurrency();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [files, setFiles] = useState<{ name: string; path: string }[]>([]);
  const [deliverables, setDeliverables] = useState<{ name: string; path: string }[]>([]);
  const [pmId, setPmId] = useState<string | null>(task.assigned_pm_id ?? null);
  const [pmName, setPmName] = useState<string | null>(null);
  const [currentStatus, setCurrentStatus] = useState(task.status);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [tab, setTab] = useState<"overview" | "chat" | "deliverables">("overview");
  const [paidQuoteIds, setPaidQuoteIds] = useState<Set<string>>(new Set());
  const [payingId, setPayingId] = useState<string | null>(null);
  const initPay = useServerFn(initPaystackPayment);

  useEffect(() => {
    supabase.from("quotes").select("*").eq("task_id", task.id).order("created_at").then(({ data }) => setQuotes((data as Quote[]) || []));
    supabase
      .from("tasks")
      .select("files, deliverables, assigned_pm_id, status")
      .eq("id", task.id)
      .maybeSingle()
      .then(async ({ data }) => {
        setFiles((data?.files as { name: string; path: string }[]) || []);
        setDeliverables((data?.deliverables as { name: string; path: string }[]) || []);
        const newPm = (data?.assigned_pm_id as string | null) ?? null;
        setPmId(newPm);
        if (data?.status) setCurrentStatus(data.status as string);
        if (newPm) {
          const { data: pm } = await supabase.from("profiles").select("full_name").eq("id", newPm).maybeSingle();
          setPmName(pm?.full_name || null);
        }
      });
    supabase.from("payments").select("task_id,status").eq("task_id", task.id).eq("status", "paid").then(({ data }) => {
      if (data && data.length > 0) setPaidQuoteIds(new Set(["__any__"]));
    });
    supabase.from("reviews").select("id").eq("task_id", task.id).maybeSingle().then(({ data }) => {
      setAlreadyReviewed(!!data);
    });
  }, [task.id]);

  const hasPaid = paidQuoteIds.has("__any__");

  const payWithPaystack = async (quoteId: string) => {
    setPayingId(quoteId);
    try {
      const res = await initPay({ data: { taskId: task.id, quoteId } });
      if (res?.authorization_url) {
        window.location.href = res.authorization_url;
      } else {
        toast.error("Could not start payment");
      }
    } catch (e) {
      toast.error((e as Error).message || "Payment init failed");
    } finally {
      setPayingId(null);
    }
  };

  const respondQuote = async (id: string, status: "approved" | "rejected") => {
    const { error } = await supabase.from("quotes").update({ status }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    if (status === "approved") {
      await supabase.from("tasks").update({ status: "in_progress" }).eq("id", task.id);
    }
    toast.success(`Quote ${status}`);
    setQuotes((p) => p.map((q) => (q.id === id ? { ...q, status } : q)));
  };

  const markCompleted = async () => {
    const { error } = await supabase.from("tasks").update({ status: "completed" }).eq("id", task.id);
    if (error) { toast.error(error.message); return; }
    setCurrentStatus("completed");
    toast.success("Task marked completed");
    if (!alreadyReviewed) setShowReview(true);
  };

  const requestRevision = async () => {
    const { error } = await supabase.from("tasks").update({ status: "revision" }).eq("id", task.id);
    if (error) { toast.error(error.message); return; }
    setCurrentStatus("revision");
    toast.success("Revision requested");
  };

  const downloadFile = async (path: string) => {
    const { data, error } = await supabase.storage.from("task-files").createSignedUrl(path, 60);
    if (error || !data?.signedUrl) { toast.error("Could not generate link"); return; }
    window.open(data.signedUrl, "_blank");
  };

  const stageIdx = useMemo(() => {
    const i = STAGES.findIndex((s) => s.key === currentStatus);
    return i === -1 ? 0 : i;
  }, [currentStatus]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div className="relative max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-elegant" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute right-4 top-4 text-muted-foreground"><X className="h-5 w-5" /></button>
        <div className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">
          {task.service_category} · {task.tier}{pmName ? ` · PM: ${pmName}` : ""}
        </div>
        <h2 className="text-2xl font-extrabold">{task.title}</h2>

        {/* Status timeline */}
        <div className="mt-5">
          <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Status</div>
          <div className="mt-2 flex items-center gap-1">
            {STAGES.map((s, i) => {
              const reached = stageIdx >= i;
              return (
                <div key={s.key} className="flex flex-1 flex-col items-center gap-1">
                  <div className={`h-2 w-full rounded-full ${reached ? "bg-gradient-brand" : "bg-secondary"}`} />
                  <div className={`text-[10px] ${reached ? "text-foreground" : "text-muted-foreground"}`}>{s.label}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-5 flex gap-2 border-b border-border">
          {(["overview","chat","deliverables"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`relative px-3 py-2 text-sm font-semibold capitalize ${
                tab === t ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t}
              {tab === t && <span className="absolute inset-x-0 -bottom-px h-0.5 bg-gradient-brand" />}
            </button>
          ))}
        </div>

        {tab === "overview" && (
          <div className="mt-4 space-y-5">
            <p className="whitespace-pre-line text-sm text-muted-foreground">{task.description}</p>
            {files.length > 0 && (
              <div>
                <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Reference files</div>
                <ul className="mt-2 grid gap-1.5 text-sm">
                  {files.map((f) => (
                    <li key={f.path}>
                      <button onClick={() => downloadFile(f.path)} className="font-medium underline">{f.name}</button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div>
              <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Quotes</div>
              {quotes.length === 0 ? (
                <div className="mt-2 text-sm text-muted-foreground">No quote yet. Your PM will send one shortly.</div>
              ) : (
                <ul className="mt-2 grid gap-2">
                  {quotes.map((q) => (
                    <li key={q.id} className="flex items-center justify-between rounded-lg border border-border bg-background p-3 text-sm">
                      <div>
                        <div className="font-semibold">{format(Number(q.amount))}</div>
                        {q.notes && <div className="text-xs text-muted-foreground">{q.notes}</div>}
                      </div>
                      {q.status === "pending" ? (
                        <div className="flex gap-2">
                          <Button size="sm" variant="brand" onClick={() => respondQuote(q.id, "approved")}>Approve</Button>
                          <Button size="sm" variant="outline" onClick={() => respondQuote(q.id, "rejected")}>Reject</Button>
                        </div>
                      ) : q.status === "approved" && !hasPaid ? (
                        <Button size="sm" variant="brand" disabled={payingId === q.id} onClick={() => payWithPaystack(q.id)}>
                          {payingId === q.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
                          Pay with Paystack
                        </Button>
                      ) : (
                        <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-semibold capitalize">
                          {q.status === "approved" && hasPaid ? "paid" : q.status}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {tab === "chat" && (
          <div className="mt-4">
            <TaskChat taskId={task.id} pmId={pmId} />
          </div>
        )}

        {tab === "deliverables" && (
          <div className="mt-4 space-y-4">
            {deliverables.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-background p-10 text-center text-sm text-muted-foreground">
                Deliverables will appear here once your PM marks the task as delivered.
              </div>
            ) : (
              <ul className="grid gap-2">
                {deliverables.map((d) => (
                  <li key={d.path} className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2 text-sm">
                    <span className="truncate">{d.name}</span>
                    <Button size="sm" variant="outline" onClick={() => downloadFile(d.path)}>
                      <Download className="h-3.5 w-3.5" /> Download
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex flex-wrap gap-2 border-t border-border pt-4">
          {currentStatus === "delivered" && (
            <>
              <Button variant="brand" onClick={markCompleted}><Check className="h-4 w-4" /> Approve & complete</Button>
              <Button variant="outline" onClick={requestRevision}><RefreshCw className="h-4 w-4" /> Request revision</Button>
            </>
          )}
          {currentStatus === "completed" && !alreadyReviewed && (
            <Button variant="brand" onClick={() => setShowReview(true)}>
              <Star className="h-4 w-4" /> Leave a review
            </Button>
          )}
          {alreadyReviewed && (
            <span className="text-xs text-muted-foreground">✓ Review submitted — thank you!</span>
          )}
        </div>

        <div className="mt-3 text-xs text-muted-foreground">Signed in as {user?.email}</div>

        {showReview && (
          <ReviewModal
            taskId={task.id}
            pmId={pmId}
            onClose={() => setShowReview(false)}
            onSubmitted={() => setAlreadyReviewed(true)}
          />
        )}
      </div>
    </div>
  );
}