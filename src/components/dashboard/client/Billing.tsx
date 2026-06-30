import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useCurrency } from "@/lib/currency";

type Payment = { id: string; amount: number; currency: string; gateway: string | null; status: string; transaction_ref: string | null; created_at: string };

export function ClientBilling() {
  const { user } = useAuth();
  const { format } = useCurrency();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase.from("payments").select("*").eq("client_id", user.id).order("created_at", { ascending: false })
      .then(({ data }) => { setPayments((data as Payment[]) || []); setLoading(false); });
  }, [user]);

  const total = payments.filter((p) => p.status === "paid").reduce((s, p) => s + Number(p.amount), 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold">Billing & Invoices</h1>
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="text-xs uppercase tracking-widest text-muted-foreground">Lifetime spend</div>
        <div className="mt-1 text-3xl font-extrabold">{format(total)}</div>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-widest text-muted-foreground">
            <tr>
              <th className="px-5 py-3">Date</th>
              <th className="px-5 py-3">Amount</th>
              <th className="px-5 py-3">Gateway</th>
              <th className="px-5 py-3">Reference</th>
              <th className="px-5 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr><td colSpan={5} className="px-5 py-10 text-center text-muted-foreground">Loading…</td></tr>
            ) : payments.length === 0 ? (
              <tr><td colSpan={5} className="px-5 py-10 text-center text-muted-foreground">No transactions yet.</td></tr>
            ) : payments.map((p) => (
              <tr key={p.id}>
                <td className="px-5 py-3">{new Date(p.created_at).toLocaleDateString()}</td>
                <td className="px-5 py-3 font-semibold">{format(Number(p.amount))}</td>
                <td className="px-5 py-3 capitalize">{p.gateway || "—"}</td>
                <td className="px-5 py-3 font-mono text-xs">{p.transaction_ref || "—"}</td>
                <td className="px-5 py-3"><span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-semibold capitalize">{p.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}