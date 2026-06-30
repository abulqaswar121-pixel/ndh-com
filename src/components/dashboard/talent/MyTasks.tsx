import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import type { TalentTask } from "./types";
import { Loader2 } from "lucide-react";
import { TaskDetailsDialog } from "./TaskDetailsDialog";

const TABS = [
  { id: "new", label: "New" },
  { id: "in_progress", label: "In progress" },
  { id: "submitted_qa", label: "Submitted" },
  { id: "revision_required", label: "Revision required" },
  { id: "completed", label: "Completed" },
] as const;

export function MyTasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<TalentTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<string>("new");
  const [open, setOpen] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.rpc("get_talent_tasks");
    setTasks((data as TalentTask[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    if (!user) return;
    load();
    const ch = supabase.channel("talent-tasks")
      .on("postgres_changes", { event: "*", schema: "public", table: "tasks", filter: `assigned_talent_id=eq.${user.id}` }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user]);

  const filtered = useMemo(() => {
    if (tab === "new") return tasks.filter((t) => t.talent_response === "pending");
    return tasks.filter((t) => t.status === tab);
  }, [tasks, tab]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">My assigned tasks</h1>
        <p className="text-sm text-muted-foreground">All tasks routed to you by your PM. Client identity is private.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => {
          const count = t.id === "new"
            ? tasks.filter((x) => x.talent_response === "pending").length
            : tasks.filter((x) => x.status === t.id).length;
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${tab === t.id ? "bg-gradient-brand text-white shadow-glow" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
              {t.label} {count > 0 && <span className="ml-1 opacity-80">({count})</span>}
            </button>
          );
        })}
      </div>
      {loading ? (
        <div className="grid place-items-center py-12"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">No tasks here.</div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {filtered.map((t) => (
            <button key={t.id} onClick={() => setOpen(t.id)}
              className="rounded-2xl border border-border bg-card p-5 text-left transition hover:shadow-elegant">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest">{t.status.replace("_", " ")}</span>
                <span className="text-xs font-semibold text-[oklch(0.65_0.19_252)] capitalize">{t.tier}</span>
              </div>
              <div className="mt-2 text-base font-bold">{t.title}</div>
              <div className="text-xs capitalize text-muted-foreground">{t.service_category}</div>
              <div className="mt-3 flex items-center justify-between">
                <div className="text-xs text-muted-foreground">Deadline: {t.deadline || "flexible"}</div>
                <div className="text-sm font-bold">₦{(t.talent_pay_rate || 0).toLocaleString()}</div>
              </div>
            </button>
          ))}
        </div>
      )}
      {open && <TaskDetailsDialog taskId={open} onClose={() => { setOpen(null); load(); }} />}
    </div>
  );
}