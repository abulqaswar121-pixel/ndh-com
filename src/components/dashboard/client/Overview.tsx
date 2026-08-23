import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useCurrency } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import { Plus, ListTodo, MessageSquare, Wallet, CheckCircle2, Clock } from "lucide-react";
import { InstallAppBanner } from "@/components/site/InstallApp";
import { SetPasswordNudge } from "@/components/auth/SetPasswordNudge";
import { Reveal, Stagger, StaggerItem } from "@/components/site/Reveal";
import { verifyPaystackReference, verifyMyPendingPayments } from "@/lib/payments/verify.functions";
import { toast } from "sonner";

type Stats = { active: number; completed: number; totalSpent: number; unread: number };
type Activity = { id: string; title: string; status: string; created_at: string };

export function ClientOverview({ onSubmit, onSeeTasks }: { onSubmit: () => void; onSeeTasks: () => void }) {
  const { user } = useAuth();
  const { format } = useCurrency();
  const [stats, setStats] = useState<Stats>({ active: 0, completed: 0, totalSpent: 0, unread: 0 });
  const [activity, setActivity] = useState<Activity[]>([]);
  const [name, setName] = useState("");
  const verifyRef = useServerFn(verifyPaystackReference);
  const verifyPending = useServerFn(verifyMyPendingPayments);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const params = new URLSearchParams(window.location.search);
      const ref = params.get("reference") || params.get("trxref");
      try {
        if (ref) {
          const res: any = await verifyRef({ data: { reference: ref } });
          if (res?.ok) {
            toast.success("Payment confirmed");
            const url = new URL(window.location.href);
            url.searchParams.delete("reference"); url.searchParams.delete("trxref");
            window.history.replaceState({}, "", url.toString());
            setReloadKey((k) => k + 1);
          }
        } else {
          const res: any = await verifyPending({});
          if (res?.updated > 0) setReloadKey((k) => k + 1);
        }
      } catch {}
    })();
  }, [user, verifyRef, verifyPending]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: profile }, { data: tasks }, { data: payments }, { count: unread }] = await Promise.all([
        supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle(),
        supabase.from("tasks").select("id,title,status,created_at").eq("client_id", user.id).order("created_at", { ascending: false }).limit(10),
        supabase.from("payments").select("amount,currency,status").eq("client_id", user.id).eq("status", "paid"),
        supabase.from("messages").select("*", { count: "exact", head: true }).eq("receiver_id", user.id).eq("read", false),
      ]);
      setName(profile?.full_name || "there");
      const active = (tasks || []).filter((t) => !["completed", "cancelled"].includes(t.status)).length;
      const completed = (tasks || []).filter((t) => t.status === "completed").length;
      const totalSpent = (payments || []).reduce((s, p) => s + Number(p.amount || 0), 0);
      setStats({ active, completed, totalSpent, unread: unread || 0 });
      setActivity(tasks || []);
    })();
  }, [user, reloadKey]);

  const cards = [
    { label: "Active Tasks", value: stats.active, icon: Clock, color: "from-blue-500 to-indigo-600" },
    { label: "Completed", value: stats.completed, icon: CheckCircle2, color: "from-emerald-500 to-teal-600" },
    { label: "Total Spent", value: format(stats.totalSpent), icon: Wallet, color: "from-amber-500 to-orange-600" },
    { label: "Unread Messages", value: stats.unread, icon: MessageSquare, color: "from-fuchsia-500 to-purple-600" },
  ];

  return (
    <div className="space-y-8">
      <InstallAppBanner />
      <SetPasswordNudge settingsHref="/dashboard/client?tab=settings" />
      <Reveal>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Welcome back, {name.split(" ")[0]}.</h1>
            <p className="mt-1 text-sm text-muted-foreground">Here's a snapshot of your projects with NDH — official bureau.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="brand" onClick={onSubmit}><Plus className="h-4 w-4" /> Submit a Task</Button>
            <Button variant="outline" onClick={onSeeTasks}><ListTodo className="h-4 w-4" /> View Tasks</Button>
          </div>
        </div>
      </Reveal>

      <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <StaggerItem key={c.label}>
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:shadow-md">
              <div className={`mb-3 inline-grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br ${c.color} text-white`}><c.icon className="h-5 w-5" /></div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground">{c.label}</div>
              <div className="mt-1 text-2xl font-extrabold tracking-tight">{c.value}</div>
            </div>
          </StaggerItem>
        ))}
      </Stagger>

      <Reveal>
        <div className="rounded-2xl border border-border bg-card shadow-sm">
          <div className="border-b border-border px-5 py-4 text-sm font-semibold">Recent activity</div>
          {activity.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-muted-foreground">No activity yet. <button className="font-semibold text-foreground underline" onClick={onSubmit}>Submit your first task</button>.</div>
          ) : (
            <ul className="divide-y divide-border">
              {activity.map((a) => (
                <li key={a.id} className="flex items-center justify-between px-5 py-3 text-sm transition hover:bg-secondary/30">
                  <div><div className="font-medium">{a.title}</div><div className="text-xs text-muted-foreground">{new Date(a.created_at).toLocaleString()}</div></div>
                  <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold capitalize">{a.status.replace("_", " ")}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Reveal>
    </div>
  );
}
