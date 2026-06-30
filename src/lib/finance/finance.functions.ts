import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertFinance(supabase: any, userId: string) {
  const [{ data: f }, { data: a }, { data: s }] = await Promise.all([
    supabase.rpc("has_role", { _user_id: userId, _role: "finance" }),
    supabase.rpc("has_role", { _user_id: userId, _role: "admin" }),
    supabase.rpc("has_role", { _user_id: userId, _role: "super_admin" }),
  ]);
  if (!f && !a && !s) throw new Error("Forbidden");
}

const lineItem = z.object({
  description: z.string().min(1),
  quantity: z.number().positive(),
  unit_price: z.number().nonnegative(),
});

export const createInvoice = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      client_id: z.string().uuid().nullable().optional(),
      task_id: z.string().uuid().nullable().optional(),
      currency: z.string().default("NGN"),
      tax_rate: z.number().min(0).max(1).default(0),
      due_date: z.string().nullable().optional(),
      notes: z.string().optional(),
      line_items: z.array(lineItem).min(1),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertFinance(context.supabase, context.userId);
    const subtotal = data.line_items.reduce(
      (s, l) => s + l.quantity * l.unit_price,
      0,
    );
    const tax = +(subtotal * data.tax_rate).toFixed(2);
    const total = +(subtotal + tax).toFixed(2);
    const { data: numRow, error: numErr } = await context.supabase.rpc("next_invoice_number");
    if (numErr) throw new Error(numErr.message);
    const { data: inv, error } = await context.supabase
      .from("invoices")
      .insert({
        invoice_number: numRow as unknown as string,
        client_id: data.client_id ?? null,
        task_id: data.task_id ?? null,
        currency: data.currency,
        subtotal,
        tax,
        total,
        due_date: data.due_date ?? null,
        notes: data.notes ?? null,
        line_items: data.line_items,
        status: "draft",
        created_by: context.userId,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return inv;
  });

export const updateInvoiceStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      id: z.string().uuid(),
      status: z.enum(["draft", "sent", "partial", "paid", "overdue", "void"]),
      amount_paid: z.number().nonnegative().optional(),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertFinance(context.supabase, context.userId);
    const patch: Record<string, unknown> = { status: data.status };
    if (data.status === "sent") patch.issued_at = new Date().toISOString();
    if (data.status === "paid") {
      patch.paid_at = new Date().toISOString();
    }
    if (typeof data.amount_paid === "number") patch.amount_paid = data.amount_paid;
    const { error } = await context.supabase.from("invoices").update(patch).eq("id", data.id);
    if (error) throw new Error(error.message);
    if (data.status === "paid") {
      const { data: inv } = await context.supabase
        .from("invoices")
        .select("total, currency, client_id")
        .eq("id", data.id)
        .single();
      if (inv) {
        await context.supabase.from("finance_ledger").insert({
          type: "revenue",
          direction: "in",
          amount: inv.total,
          currency: inv.currency,
          reference_table: "invoices",
          reference_id: data.id,
          memo: "Invoice paid",
          created_by: context.userId,
        });
      }
    }
    return { ok: true };
  });

export const upsertExpense = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      id: z.string().uuid().optional(),
      category: z.string().min(1),
      vendor: z.string().optional(),
      description: z.string().optional(),
      amount: z.number().positive(),
      currency: z.string().default("NGN"),
      spent_on: z.string().optional(),
      receipt_url: z.string().url().optional(),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertFinance(context.supabase, context.userId);
    const payload = { ...data, submitted_by: context.userId };
    if (data.id) {
      const { error } = await context.supabase.from("expenses").update(payload).eq("id", data.id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await context.supabase.from("expenses").insert(payload);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const decideExpense = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      id: z.string().uuid(),
      status: z.enum(["approved", "rejected", "paid"]),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertFinance(context.supabase, context.userId);
    const { error } = await context.supabase.from("expenses")
      .update({ status: data.status, approved_by: context.userId })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    if (data.status === "paid") {
      const { data: exp } = await context.supabase
        .from("expenses")
        .select("amount, currency")
        .eq("id", data.id)
        .single();
      if (exp) {
        await context.supabase.from("finance_ledger").insert({
          type: "expense",
          direction: "out",
          amount: exp.amount,
          currency: exp.currency,
          reference_table: "expenses",
          reference_id: data.id,
          memo: "Expense paid",
          created_by: context.userId,
        });
      }
    }
    return { ok: true };
  });

export const decideRefund = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      id: z.string().uuid(),
      status: z.enum(["approved", "rejected", "processed"]),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertFinance(context.supabase, context.userId);
    const patch: Record<string, unknown> = {
      status: data.status,
      processed_by: context.userId,
    };
    if (data.status === "processed") patch.processed_at = new Date().toISOString();
    const { error } = await context.supabase.from("refunds").update(patch).eq("id", data.id);
    if (error) throw new Error(error.message);
    if (data.status === "processed") {
      const { data: r } = await context.supabase
        .from("refunds")
        .select("amount, currency")
        .eq("id", data.id)
        .single();
      if (r) {
        await context.supabase.from("finance_ledger").insert({
          type: "refund",
          direction: "out",
          amount: r.amount,
          currency: r.currency,
          reference_table: "refunds",
          reference_id: data.id,
          memo: "Refund processed",
          created_by: context.userId,
        });
      }
    }
    return { ok: true };
  });

export const recordLedgerEntry = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      type: z.enum(["revenue", "expense", "payroll", "refund", "tuition", "transfer"]),
      direction: z.enum(["in", "out"]),
      amount: z.number().positive(),
      currency: z.string().default("NGN"),
      memo: z.string().optional(),
      entry_date: z.string().optional(),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertFinance(context.supabase, context.userId);
    const { error } = await context.supabase.from("finance_ledger").insert({
      ...data,
      created_by: context.userId,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });