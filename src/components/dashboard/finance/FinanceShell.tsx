import { useEffect, useState } from "react";
import { DashboardShell, type NavItem } from "@/components/dashboard/Sidebar";
import { LayoutDashboard, FileText, Receipt, RefreshCcw, BookOpen, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useRouterState } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useServerFn } from "@tanstack/react-start";
import {
  createInvoice, updateInvoiceStatus,
  upsertExpense, decideExpense, decideRefund,
} from "@/lib/finance/finance.functions";
import { toast } from "sonner";

const NAV: NavItem[] = [
  { label: "Overview", to: "/dashboard/finance", icon: LayoutDashboard },
  { label: "Invoices", to: "/dashboard/finance", search: { tab: "invoices" }, icon: FileText },
  { label: "Expenses", to: "/dashboard/finance", search: { tab: "expenses" }, icon: Receipt },
  { label: "Refunds", to: "/dashboard/finance", search: { tab: "refunds" }, icon: RefreshCcw },
  { label: "Ledger", to: "/dashboard/finance", search: { tab: "ledger" }, icon: BookOpen },
];

const fmt = (n: number, ccy = "NGN") =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: ccy, maximumFractionDigits: 0 }).format(n || 0);

export function FinanceShell() {
  const search = useRouterState({ select: (r) => r.location.search as { tab?: string } });
  const tab = search.tab ?? "overview";
  return (
    <DashboardShell title="Finance" items={NAV}>
      {tab === "overview" && <Overview />}
      {tab === "invoices" && <Invoices />}
      {tab === "expenses" && <Expenses />}
      {tab === "refunds" && <Refunds />}
      {tab === "ledger" && <Ledger />}
    </DashboardShell>
  );
}

function Overview() {
  const [s, setS] = useState({ revenue: 0, outstanding: 0, expenses: 0, refunds: 0 });
  useEffect(() => {
    (async () => {
      const [paid, due, exp, ref] = await Promise.all([
        supabase.from("invoices").select("total").eq("status", "paid"),
        supabase.from("invoices").select("total, amount_paid").in("status", ["sent", "partial", "overdue"]),
        supabase.from("expenses").select("amount").eq("status", "paid"),
        supabase.from("refunds").select("amount").eq("status", "processed"),
      ]);
      const revenue = (paid.data || []).reduce((a: number, r: any) => a + Number(r.total || 0), 0);
      const outstanding = (due.data || []).reduce(
        (a: number, r: any) => a + Number(r.total || 0) - Number(r.amount_paid || 0), 0,
      );
      const expenses = (exp.data || []).reduce((a: number, r: any) => a + Number(r.amount || 0), 0);
      const refunds = (ref.data || []).reduce((a: number, r: any) => a + Number(r.amount || 0), 0);
      setS({ revenue, outstanding, expenses, refunds });
    })();
  }, []);
  const cards = [
    { label: "Revenue (paid)", value: fmt(s.revenue) },
    { label: "Outstanding", value: fmt(s.outstanding) },
    { label: "Expenses", value: fmt(s.expenses) },
    { label: "Refunds", value: fmt(s.refunds) },
  ];
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((c) => (
        <Card key={c.label} className="p-5">
          <div className="text-xs uppercase tracking-widest text-muted-foreground">{c.label}</div>
          <div className="mt-2 text-2xl font-extrabold">{c.value}</div>
        </Card>
      ))}
    </div>
  );
}

type Invoice = {
  id: string; invoice_number: string; client_id: string | null; currency: string;
  total: number; amount_paid: number; status: string; due_date: string | null; created_at: string;
};

function Invoices() {
  const [rows, setRows] = useState<Invoice[]>([]);
  const [open, setOpen] = useState(false);
  const [clients, setClients] = useState<{ id: string; full_name: string | null; email: string }[]>([]);
  const [clientId, setClientId] = useState<string>("");
  const [currency, setCurrency] = useState("NGN");
  const [tax, setTax] = useState(0);
  const [due, setDue] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState([{ description: "", quantity: 1, unit_price: 0 }]);
  const create = useServerFn(createInvoice);
  const setStatus = useServerFn(updateInvoiceStatus);

  const load = async () => {
    const { data } = await supabase.from("invoices").select("*").order("created_at", { ascending: false });
    setRows((data as Invoice[]) || []);
  };
  useEffect(() => {
    load();
    supabase.from("profiles").select("id, full_name, email").limit(200)
      .then(({ data }) => setClients((data as any[]) || []));
  }, []);

  const subtotal = items.reduce((a, i) => a + Number(i.quantity || 0) * Number(i.unit_price || 0), 0);
  const total = subtotal * (1 + Number(tax || 0));

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold">Invoices</h3>
        <Button size="sm" onClick={() => setOpen(true)}><Plus className="mr-1 h-4 w-4" /> New invoice</Button>
      </div>
      {rows.length === 0 ? (
        <div className="text-sm text-muted-foreground">No invoices yet.</div>
      ) : (
        <div className="grid gap-2">
          {rows.map((r) => (
            <div key={r.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border p-3">
              <div>
                <div className="font-semibold">{r.invoice_number}</div>
                <div className="text-xs text-muted-foreground">
                  {fmt(Number(r.total), r.currency)} · Paid {fmt(Number(r.amount_paid), r.currency)} {r.due_date ? `· Due ${new Date(r.due_date).toLocaleDateString()}` : ""}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">{r.status}</Badge>
                <Select value={r.status} onValueChange={async (v) => {
                  try { await setStatus({ data: { id: r.id, status: v as any, amount_paid: v === "paid" ? Number(r.total) : undefined } }); toast.success("Updated"); load(); }
                  catch (e: any) { toast.error(e.message); }
                }}>
                  <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["draft","sent","partial","paid","overdue","void"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>New invoice</DialogTitle></DialogHeader>
          <form className="grid gap-3" onSubmit={async (e) => {
            e.preventDefault();
            try {
              await create({ data: {
                client_id: clientId || null,
                currency,
                tax_rate: Number(tax) || 0,
                due_date: due || null,
                notes: notes || undefined,
                line_items: items.map((i) => ({ description: i.description, quantity: Number(i.quantity), unit_price: Number(i.unit_price) })),
              } });
              toast.success("Invoice created");
              setOpen(false); setItems([{ description: "", quantity: 1, unit_price: 0 }]); setNotes(""); setDue(""); setClientId(""); load();
            } catch (er: any) { toast.error(er.message); }
          }}>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Client</Label>
                <Select value={clientId} onValueChange={setClientId}>
                  <SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger>
                  <SelectContent className="max-h-72">
                    {clients.map((c) => <SelectItem key={c.id} value={c.id}>{c.full_name || c.email}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Currency</Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["NGN","USD","GBP","EUR","CAD","AED"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Tax rate (0–1)</Label><Input type="number" step="0.01" min={0} max={1} value={tax} onChange={(e) => setTax(Number(e.target.value))} /></div>
              <div><Label>Due date</Label><Input type="date" value={due} onChange={(e) => setDue(e.target.value)} /></div>
            </div>
            <div className="grid gap-2">
              <Label>Line items</Label>
              {items.map((it, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2">
                  <Input className="col-span-6" placeholder="Description" value={it.description} onChange={(e) => { const n = [...items]; n[idx].description = e.target.value; setItems(n); }} />
                  <Input className="col-span-2" type="number" min={1} placeholder="Qty" value={it.quantity} onChange={(e) => { const n = [...items]; n[idx].quantity = Number(e.target.value); setItems(n); }} />
                  <Input className="col-span-3" type="number" min={0} placeholder="Unit price" value={it.unit_price} onChange={(e) => { const n = [...items]; n[idx].unit_price = Number(e.target.value); setItems(n); }} />
                  <Button type="button" size="icon" variant="ghost" className="col-span-1" onClick={() => setItems(items.length > 1 ? items.filter((_, i) => i !== idx) : items)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              ))}
              <Button type="button" size="sm" variant="outline" onClick={() => setItems([...items, { description: "", quantity: 1, unit_price: 0 }])}><Plus className="mr-1 h-4 w-4" /> Add line</Button>
            </div>
            <div><Label>Notes</Label><Textarea value={notes} onChange={(e) => setNotes(e.target.value)} /></div>
            <div className="rounded-lg border border-border p-3 text-sm">
              Subtotal: {fmt(subtotal, currency)} · Tax: {fmt(subtotal * tax, currency)} · <strong>Total: {fmt(total, currency)}</strong>
            </div>
            <DialogFooter><Button type="submit">Create invoice</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

type Expense = { id: string; category: string; vendor: string | null; amount: number; currency: string; status: string; spent_on: string; description: string | null };

function Expenses() {
  const [rows, setRows] = useState<Expense[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ category: "Operations", vendor: "", description: "", amount: 0, currency: "NGN", spent_on: new Date().toISOString().slice(0,10), receipt_url: "" });
  const upsert = useServerFn(upsertExpense);
  const decide = useServerFn(decideExpense);

  const load = async () => {
    const { data } = await supabase.from("expenses").select("*").order("spent_on", { ascending: false });
    setRows((data as Expense[]) || []);
  };
  useEffect(() => { load(); }, []);

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold">Expenses</h3>
        <Button size="sm" onClick={() => setOpen(true)}><Plus className="mr-1 h-4 w-4" /> New expense</Button>
      </div>
      {rows.length === 0 ? (
        <div className="text-sm text-muted-foreground">No expenses recorded.</div>
      ) : (
        <div className="grid gap-2">
          {rows.map((r) => (
            <div key={r.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border p-3">
              <div>
                <div className="font-semibold">{r.category} · {fmt(Number(r.amount), r.currency)}</div>
                <div className="text-xs text-muted-foreground">{r.vendor || "—"} · {new Date(r.spent_on).toLocaleDateString()}</div>
                {r.description && <p className="mt-1 text-sm text-muted-foreground">{r.description}</p>}
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{r.status}</Badge>
                <Select value={r.status} onValueChange={async (v) => {
                  if (!["approved","rejected","paid"].includes(v)) return;
                  try { await decide({ data: { id: r.id, status: v as any } }); toast.success("Updated"); load(); }
                  catch (e: any) { toast.error(e.message); }
                }}>
                  <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["pending","approved","rejected","paid"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>New expense</DialogTitle></DialogHeader>
          <form className="grid gap-3" onSubmit={async (e) => {
            e.preventDefault();
            try {
              await upsert({ data: { ...form, amount: Number(form.amount), receipt_url: form.receipt_url || undefined, vendor: form.vendor || undefined, description: form.description || undefined } });
              toast.success("Saved"); setOpen(false); load();
            } catch (er: any) { toast.error(er.message); }
          }}>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Category</Label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required /></div>
              <div><Label>Vendor</Label><Input value={form.vendor} onChange={(e) => setForm({ ...form, vendor: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div><Label>Amount</Label><Input type="number" step="0.01" min={0} value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} required /></div>
              <div>
                <Label>Currency</Label>
                <Select value={form.currency} onValueChange={(v) => setForm({ ...form, currency: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{["NGN","USD","GBP","EUR","CAD","AED"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Date</Label><Input type="date" value={form.spent_on} onChange={(e) => setForm({ ...form, spent_on: e.target.value })} required /></div>
            </div>
            <div><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div><Label>Receipt URL</Label><Input type="url" value={form.receipt_url} onChange={(e) => setForm({ ...form, receipt_url: e.target.value })} /></div>
            <DialogFooter><Button type="submit">Save</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

type Refund = { id: string; client_id: string | null; amount: number; currency: string; reason: string | null; status: string; created_at: string };

function Refunds() {
  const [rows, setRows] = useState<Refund[]>([]);
  const decide = useServerFn(decideRefund);
  const load = async () => {
    const { data } = await supabase.from("refunds").select("*").order("created_at", { ascending: false });
    setRows((data as Refund[]) || []);
  };
  useEffect(() => { load(); }, []);
  return (
    <Card className="p-6">
      <h3 className="mb-4 text-lg font-bold">Refunds</h3>
      {rows.length === 0 ? (
        <div className="text-sm text-muted-foreground">No refund requests.</div>
      ) : (
        <div className="grid gap-2">
          {rows.map((r) => (
            <div key={r.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border p-3">
              <div>
                <div className="font-semibold">{fmt(Number(r.amount), r.currency)}</div>
                <div className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</div>
                {r.reason && <p className="mt-1 text-sm text-muted-foreground">{r.reason}</p>}
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{r.status}</Badge>
                <Select value={r.status} onValueChange={async (v) => {
                  if (!["approved","rejected","processed"].includes(v)) return;
                  try { await decide({ data: { id: r.id, status: v as any } }); toast.success("Updated"); load(); }
                  catch (e: any) { toast.error(e.message); }
                }}>
                  <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["requested","approved","rejected","processed"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

type Ledger = { id: string; entry_date: string; type: string; direction: string; amount: number; currency: string; memo: string | null };

function Ledger() {
  const [rows, setRows] = useState<Ledger[]>([]);
  useEffect(() => {
    supabase.from("finance_ledger").select("*").order("entry_date", { ascending: false }).limit(200)
      .then(({ data }) => setRows((data as Ledger[]) || []));
  }, []);
  return (
    <Card className="p-6">
      <h3 className="mb-4 text-lg font-bold">Ledger</h3>
      {rows.length === 0 ? (
        <div className="text-sm text-muted-foreground">No ledger entries yet.</div>
      ) : (
        <div className="grid gap-1 text-sm">
          {rows.map((r) => (
            <div key={r.id} className="grid grid-cols-12 gap-2 border-b border-border py-2">
              <div className="col-span-3 text-muted-foreground">{new Date(r.entry_date).toLocaleDateString()}</div>
              <div className="col-span-2">{r.type}</div>
              <div className="col-span-2">
                <Badge variant={r.direction === "in" ? "default" : "outline"}>{r.direction === "in" ? "↑ in" : "↓ out"}</Badge>
              </div>
              <div className="col-span-2 font-mono">{fmt(Number(r.amount), r.currency)}</div>
              <div className="col-span-3 truncate text-muted-foreground">{r.memo}</div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}