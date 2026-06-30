import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

type Payroll = { id: string; week_start: string; week_end: string; total_amount: number; status: string; paid_at: string | null; tasks_completed: any };

export function TalentEarnings() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Payroll[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase.from("payroll").select("*").eq("talent_id", user.id).order("week_start", { ascending: false });
      setRows((data as Payroll[]) || []);
      const { data: t } = await supabase.from("talents").select("total_earnings").eq("user_id", user.id).maybeSingle();
      setTotal(Number(t?.total_earnings || 0));
    })();
  }, [user]);

  const thisWeek = rows.find((r) => r.status === "pending");
  const pending = rows.filter((r) => r.status === "pending").reduce((s, r) => s + Number(r.total_amount), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">My earnings</h1>
        <p className="text-sm text-muted-foreground">Weekly payroll cycle. Payday is every Sunday.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="text-xs uppercase tracking-widest text-muted-foreground">This week</div>
          <div className="mt-1 text-2xl font-extrabold">₦{Number(thisWeek?.total_amount || 0).toLocaleString()}</div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Pending payment</div>
          <div className="mt-1 text-2xl font-extrabold">₦{pending.toLocaleString()}</div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Total earnings</div>
          <div className="mt-1 text-2xl font-extrabold">₦{total.toLocaleString()}</div>
        </div>
      </div>
      <div className="rounded-2xl border border-border bg-card">
        <div className="border-b border-border px-5 py-3 text-sm font-bold">Earnings history</div>
        {rows.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">No payroll runs yet. Once you complete tasks, weekly payouts appear here.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase text-muted-foreground">
              <tr><th className="px-5 py-2">Period</th><th className="px-5 py-2">Amount</th><th className="px-5 py-2">Status</th><th className="px-5 py-2">Paid on</th></tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="px-5 py-3">{r.week_start} → {r.week_end}</td>
                  <td className="px-5 py-3 font-semibold">₦{Number(r.total_amount).toLocaleString()}</td>
                  <td className="px-5 py-3"><span className={`rounded-full px-2 py-0.5 text-xs font-bold ${r.status === "paid" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>{r.status}</span></td>
                  <td className="px-5 py-3 text-muted-foreground">{r.paid_at ? new Date(r.paid_at).toLocaleDateString() : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}