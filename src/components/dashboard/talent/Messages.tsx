import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { TaskChat } from "@/components/dashboard/client/TaskChat";
import type { TalentTask } from "./types";

export function TalentMessages() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<TalentTask[]>([]);
  const [open, setOpen] = useState<TalentTask | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase.rpc("get_talent_tasks").then(({ data }) => {
      const list = (data as TalentTask[] | null)?.filter((t) => t.assigned_pm_id) || [];
      setTasks(list);
      if (list.length && !open) setOpen(list[0]);
    });
  }, [user]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Messages</h1>
        <p className="text-sm text-muted-foreground">Talk to your PM about each task. Clients are not visible.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-[280px_1fr]">
        <div className="rounded-2xl border border-border bg-card">
          {tasks.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground">No tasks to discuss yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {tasks.map((t) => (
                <li key={t.id}>
                  <button onClick={() => setOpen(t)}
                    className={`w-full px-4 py-3 text-left text-sm ${open?.id === t.id ? "bg-secondary" : ""}`}>
                    <div className="font-semibold">{t.title}</div>
                    <div className="text-xs capitalize text-muted-foreground">{t.service_category}</div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          {open ? <TaskChat taskId={open.id} pmId={open.assigned_pm_id} /> : <div className="rounded-2xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">Pick a task to view its chat.</div>}
        </div>
      </div>
    </div>
  );
}