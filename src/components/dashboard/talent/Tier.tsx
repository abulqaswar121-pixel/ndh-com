import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { TIER_NAMES, TIER_TARGETS } from "./types";
import { Award } from "lucide-react";

export function TalentTier() {
  const { user } = useAuth();
  const [tier, setTier] = useState(1);
  const [tasks, setTasks] = useState(0);
  const [approval, setApproval] = useState(100);
  const [createdAt, setCreatedAt] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase.from("talents").select("tier, tasks_completed, approval_rate, created_at").eq("user_id", user.id).maybeSingle();
      if (data) { setTier(data.tier as number); setTasks(data.tasks_completed as number); setApproval(Number(data.approval_rate)); setCreatedAt(data.created_at as string); }
    })();
  }, [user]);

  const next = Math.min(5, tier + 1);
  const target = TIER_TARGETS[next] || TIER_TARGETS[5];
  const monthsActive = createdAt ? Math.floor((Date.now() - new Date(createdAt).getTime()) / (30 * 86400000)) : 0;
  const progress = Math.min(100, Math.round((tasks / target.tasks) * 100));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold tracking-tight">My tier & rank</h1>
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center gap-4">
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-brand text-white shadow-glow"><Award className="h-7 w-7" /></div>
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Current tier</div>
            <div className="text-xl font-extrabold">{TIER_NAMES[tier]}</div>
          </div>
        </div>
      </div>
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <div className="text-sm font-bold">Progress to {TIER_NAMES[next]}</div>
          <div className="text-sm font-bold">{progress}%</div>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary">
          <div className="h-full bg-gradient-brand" style={{ width: `${progress}%` }} />
        </div>
        <ul className="mt-4 grid gap-2 text-sm sm:grid-cols-3">
          <li className="rounded-lg bg-secondary p-3"><div className="text-xs uppercase text-muted-foreground">Tasks completed</div><div className="font-extrabold">{tasks} / {target.tasks}</div></li>
          <li className="rounded-lg bg-secondary p-3"><div className="text-xs uppercase text-muted-foreground">Approval rate</div><div className="font-extrabold">{approval}% / {target.approval}%</div></li>
          <li className="rounded-lg bg-secondary p-3"><div className="text-xs uppercase text-muted-foreground">Account age</div><div className="font-extrabold">{monthsActive} / {target.months} months</div></li>
        </ul>
      </div>
    </div>
  );
}