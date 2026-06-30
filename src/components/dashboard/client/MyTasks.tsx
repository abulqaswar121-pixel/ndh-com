import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useCurrency } from "@/lib/currency";
import { TaskDetailsDialog } from "./TaskDetailsDialog";

type Task = {
  id: string; title: string; service_category: string; tier: string;
  status: string; deadline: string | null; budget_min: number | null; budget_max: number | null;
  assigned_pm_id: string | null; created_at: string;
};

const TABS = ["all", "pending", "in_progress", "in_review", "delivered", "completed"] as const;

export function MyTasks() {
  const { user } = useAuth();
  const { format } = useCurrency();
  const [tab, setTab] = useState<typeof TABS[number]>("all");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState<Task | null>(null);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    let q = supabase.from("tasks").select("*").eq("client_id", user.id).order("created_at", { ascending: false });
    if (tab !== "all") q = q.eq("status", tab);
    const { data } = await q;
    setTasks((data as Task[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [user, tab]); // eslint-disable-line

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold">My Tasks</h1>
      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize transition ${tab === t ? "bg-gradient-brand text-white shadow-glow" : "bg-secondary text-muted-foreground hover:text-foreground"}`}
          >
            {t.replace("_", " ")}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-sm text-muted-foreground">Loading…</div>
      ) : tasks.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
          No tasks here yet.
        </div>
      ) : (
        <div className="grid gap-3">
          {tasks.map((t) => (
            <button
              key={t.id}
              onClick={() => setOpen(t)}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4 text-left transition hover:border-foreground/30"
            >
              <div className="min-w-0 flex-1">
                <div className="font-semibold">{t.title}</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {t.service_category} · {t.tier} · created {new Date(t.created_at).toLocaleDateString()}
                  {t.deadline && ` · due ${new Date(t.deadline).toLocaleDateString()}`}
                </div>
              </div>
              <div className="flex items-center gap-3">
                {t.budget_min != null && (
                  <div className="text-xs text-muted-foreground">{format(Number(t.budget_min))} – {format(Number(t.budget_max || 0))}</div>
                )}
                <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold capitalize">{t.status.replace("_", " ")}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {open && <TaskDetailsDialog task={open} onClose={() => { setOpen(null); load(); }} />}
    </div>
  );
}