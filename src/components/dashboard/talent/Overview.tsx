import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import type { TalentTask } from "./types";
import { TIER_NAMES } from "./types";
import { Briefcase, CheckCircle2, Wallet, CalendarClock, Award, ThumbsUp } from "lucide-react";

function Stat({ icon: Icon, label, value, hint }: { icon: any; label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{label}</div>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="mt-2 text-2xl font-extrabold tracking-tight">{value}</div>
      {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}

function nextSundayDate() {
  const d = new Date();
  const day = d.getDay();
  const add = (7 - day) % 7 || 7;
  d.setDate(d.getDate() + add);
  return d;
}

export function TalentOverview({ onTasks }: { onTasks: () => void }) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<TalentTask[]>([]);
  const [name, setName] = useState("");
  const [tier, setTier] = useState(1);
  const [weekEarnings, setWeekEarnings] = useState(0);
  const [approval, setApproval] = useState(100);
  const [doneTotal, setDoneTotal] = useState(0);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: t }, { data: p }, { data: tal }, { data: pr }] = await Promise.all([
        supabase.rpc("get_talent_tasks"),
        supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle(),
        supabase.from("talents").select("tier, approval_rate, tasks_completed").eq("user_id", user.id).maybeSingle(),
        supabase.from("payroll").select("total_amount, week_start, status").eq("talent_id", user.id).order("week_start", { ascending: false }).limit(1),
      ]);
      setTasks((t as TalentTask[]) || []);
      setName(p?.full_name || "");
      if (tal) { setTier(tal.tier as number); setApproval(Number(tal.approval_rate)); setDoneTotal(tal.tasks_completed as number); }
      const wk = pr?.[0];
      if (wk && wk.status === "pending") setWeekEarnings(Number(wk.total_amount));
    })();
  }, [user]);

  const active = tasks.filter((x) => ["in_progress", "submitted_qa", "revision_required"].includes(x.status));
  const newOnes = tasks.filter((x) => x.talent_response === "pending");
  const payday = nextSundayDate();
  const daysToPayday = Math.max(0, Math.ceil((payday.getTime() - Date.now()) / 86400000));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Welcome, {name.split(" ")[0] || "Talent"} 👋</h1>
        <p className="text-sm text-muted-foreground">Your work hub — assignments, earnings and growth.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Stat icon={Briefcase} label="Active tasks" value={String(active.length)} hint={`${newOnes.length} awaiting response`} />
        <Stat icon={CheckCircle2} label="Completed (total)" value={String(doneTotal)} />
        <Stat icon={Wallet} label="This week" value={`₦${weekEarnings.toLocaleString()}`} hint="Pending payday" />
        <Stat icon={CalendarClock} label="Next payday" value={`${daysToPayday}d`} hint={payday.toDateString()} />
        <Stat icon={Award} label="Tier" value={TIER_NAMES[tier]?.split("·")[0] || "Tier 1"} hint={TIER_NAMES[tier]?.split("·")[1]?.trim()} />
        <Stat icon={ThumbsUp} label="Approval rate" value={`${approval}%`} />
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold">Current active tasks</h2>
          <button onClick={onTasks} className="text-sm font-semibold text-[oklch(0.65_0.19_252)]">See all →</button>
        </div>
        {active.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">No active tasks right now. Stay available — your PM will assign work soon.</p>
        ) : (
          <ul className="mt-4 divide-y divide-border">
            {active.slice(0, 5).map((t) => (
              <li key={t.id} className="flex items-center justify-between py-3">
                <div>
                  <div className="text-sm font-semibold">{t.title}</div>
                  <div className="text-xs text-muted-foreground capitalize">{t.service_category} · {t.tier} · deadline {t.deadline || "flexible"}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold">₦{(t.talent_pay_rate || 0).toLocaleString()}</div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{t.status.replace("_", " ")}</div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}