import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useCurrency } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import { X, Check, RefreshCw, CreditCard, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { initPaystackPayment } from "@/lib/paystack.functions";

type Task = {
  id: string; title: string; service_category: string; tier: string;
  status: string; description: string | null; deadline: string | null;
  budget_min: number | null; budget_max: number | null; created_at: string;
};

type Quote = { id: string; amount: number; currency: string; notes: string | null; status: string; created_at: string };

const STAGES = ["pending", "quoted", "in_progress", "in_review", "delivered", "completed"];

export function TaskDetailsDialog({ task, onClose }: { task: Task; onClose: () => void }) {
  const { user } = useAuth();
  const { format } = useCurrency();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [files, setFiles] = useState<{ name: string; path: string }[]>([]);
  const [paidQuoteIds, setPaidQuoteIds] = useState<Set<string>>(new Set());
  const [payingId, setPayingId] = useState<string | null>(null);
  const initPay = useServerFn(initPaystackPayment);

  useEffect(() => {
    supabase.from("quotes").select("*").eq("task_id", task.id).order("created_at").then(({ data }) => setQuotes((data as Quote[]) || []));
    supabase.from("tasks").select("files").eq("id", task.id).maybeSingle().then(({ data }) => {
      setFiles((data?.files as { name: string; path: string }[]) || []);
    });
    supabase.from("payments").select("task_id,status").eq("task_id", task.id).eq("status", "paid").then(({ data }) => {
      if (data && data.length > 0) setPaidQuoteIds(new Set(["__any__"]));
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
    toast.success("Task marked completed");
    onClose();
  };

  const requestRevision = async () => {
    const { error } = await supabase.from("tasks").update({ status: "revision" }).eq("id", task.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Revision requested");
    onClose();
  };

  const downloadFile = async (path: string) => {
    const { data, error } = await supabase.storage.from("task-files").createSignedUrl(path, 60);
    if (error || !data?.signedUrl) { toast.error("Could not generate link"); return; }
    window.open(data.signedUrl, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-elegant" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute right-4 top-4 text-muted-foreground"><X className="h-5 w-5" /></button>
        <div className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">
          {task.service_category} · {task.tier}
        </div>
        <h2 className="text-2xl font-extrabold">{task.title}</h2>
        <p className="mt-2 whitespace-pre-line text-sm text-muted-foreground">{task.description}</p>

        {/* Status timeline */}
        <div className="mt-6">
          <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Status</div>
          <div className="mt-2 flex items-center gap-1">
            {STAGES.map((s, i) => {
              const reached = STAGES.indexOf(task.status) >= i;
              return (
                <div key={s} className="flex flex-1 flex-col items-center gap-1">
                  <div className={`h-2 w-full rounded-full ${reached ? "bg-gradient-brand" : "bg-secondary"}`} />
                  <div className={`text-[10px] ${reached ? "text-foreground" : "text-muted-foreground"} capitalize`}>{s.replace("_", " ")}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Files */}
        {files.length > 0 && (
          <div className="mt-6">
            <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Files</div>
            <ul className="mt-2 grid gap-1.5 text-sm">
              {files.map((f) => (
                <li key={f.path}>
                  <button onClick={() => downloadFile(f.path)} className="font-medium underline">{f.name}</button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Quotes */}
        <div className="mt-6">
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

        {/* Actions */}
        <div className="mt-6 flex flex-wrap gap-2 border-t border-border pt-4">
          {task.status === "delivered" && (
            <>
              <Button variant="brand" onClick={markCompleted}><Check className="h-4 w-4" /> Mark completed</Button>
              <Button variant="outline" onClick={requestRevision}><RefreshCw className="h-4 w-4" /> Request revision</Button>
            </>
          )}
        </div>

        <div className="mt-3 text-xs text-muted-foreground">User: {user?.email}</div>
      </div>
    </div>
  );
}