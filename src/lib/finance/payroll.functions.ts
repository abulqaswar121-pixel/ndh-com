import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertFinance(supabase: any, userId: string) {
  const { data } = await supabase.rpc("is_finance_staff", { _uid: userId });
  if (!data) throw new Error("Forbidden");
}

/**
 * Generate a payroll run for a period. Aggregates completed tasks per talent
 * that haven't been paid yet. Creates a `payroll_runs` row plus one `payroll`
 * row per talent. Returns the run with line counts.
 */
export const generatePayrollRun = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      period_start: z.string(),
      period_end: z.string(),
      currency: z.string().default("NGN"),
      notes: z.string().optional(),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertFinance(context.supabase, context.userId);

    const { data: rows, error } = await context.supabase.rpc("compute_talent_payroll", {
      _start: data.period_start,
      _end: data.period_end,
    });
    if (error) throw new Error(error.message);
    const lines = (rows ?? []) as Array<{
      talent_id: string;
      tasks_count: number;
      gross_amount: number;
      currency: string;
      task_ids: string[];
    }>;

    const total = lines.reduce((s, l) => s + Number(l.gross_amount || 0), 0);

    const { data: run, error: rErr } = await context.supabase
      .from("payroll_runs")
      .insert({
        period_start: data.period_start,
        period_end: data.period_end,
        currency: data.currency,
        total_amount: total,
        talent_count: lines.length,
        status: "draft",
        notes: data.notes ?? null,
        created_by: context.userId,
      })
      .select()
      .single();
    if (rErr) throw new Error(rErr.message);

    if (lines.length > 0) {
      // Pull existing recipient codes so we don't re-resolve later.
      const ids = lines.map((l) => l.talent_id);
      const { data: accts } = await context.supabase
        .from("talent_payout_accounts")
        .select("talent_id, paystack_recipient_code")
        .in("talent_id", ids)
        .eq("is_default", true);
      const recipMap = new Map<string, string | null>(
        (accts ?? []).map((a: any) => [a.talent_id, a.paystack_recipient_code ?? null]),
      );

      const inserts = lines.map((l) => ({
        run_id: run.id,
        talent_id: l.talent_id,
        week_start: data.period_start,
        week_end: data.period_end,
        tasks_completed: l.task_ids,
        tasks_count: l.tasks_count,
        gross_amount: l.gross_amount,
        deductions: 0,
        total_amount: l.gross_amount,
        currency: data.currency,
        status: "pending",
        paystack_recipient_code: recipMap.get(l.talent_id) ?? null,
      }));
      const { error: pErr } = await context.supabase.from("payroll").insert(inserts);
      if (pErr) throw new Error(pErr.message);
    }

    return { run_id: run.id, talent_count: lines.length, total };
  });

export const approvePayrollRun = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ run_id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertFinance(context.supabase, context.userId);
    const { error } = await context.supabase
      .from("payroll_runs")
      .update({
        status: "approved",
        approved_by: context.userId,
        approved_at: new Date().toISOString(),
      })
      .eq("id", data.run_id)
      .eq("status", "draft");
    if (error) throw new Error(error.message);
    await context.supabase
      .from("payroll")
      .update({ status: "approved", approved_by: context.userId, approved_at: new Date().toISOString() })
      .eq("run_id", data.run_id);
    return { ok: true };
  });

/**
 * Process payroll run: STUB.
 *
 * When Paystack Transfers is enabled on the live account, this function will:
 *   1. Resolve each talent's bank account → create a Paystack transfer recipient
 *   2. Initiate a transfer per payroll item (or a bulk transfer)
 *   3. Persist transfer_code / transfer_reference per row, status = "processing"
 *   4. The Paystack webhook (transfer.success / transfer.failed) advances each row
 *
 * Until then, this marks the run as `processing` and leaves each row pending
 * manual settlement. Finance can use `markPayrollItemPaid` for manual payouts.
 */
export const processPayrollRun = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ run_id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertFinance(context.supabase, context.userId);
    const secret = process.env.PAYSTACK_SECRET_KEY;
    const live = !!secret && process.env.PAYSTACK_TRANSFERS_ENABLED === "true";

    await context.supabase
      .from("payroll_runs")
      .update({ status: "processing" })
      .eq("id", data.run_id)
      .eq("status", "approved");

    if (!live) {
      // Scaffolding mode: nothing to do — wait for manual settlement.
      return { ok: true, mode: "manual", note: "Paystack Transfers not enabled — settle each row manually." };
    }

    // TODO: live Paystack Transfers flow (transfer recipient + initiate transfer).
    // Intentionally not implemented until PAYSTACK_TRANSFERS_ENABLED=true.
    return { ok: true, mode: "live-stub" };
  });

export const markPayrollItemPaid = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      payroll_id: z.string().uuid(),
      transfer_reference: z.string().optional(),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertFinance(context.supabase, context.userId);
    const { data: row, error: gErr } = await context.supabase
      .from("payroll")
      .select("id, total_amount, currency, run_id, status")
      .eq("id", data.payroll_id)
      .single();
    if (gErr || !row) throw new Error(gErr?.message || "Not found");
    if (row.status === "paid") return { ok: true };

    const { error: uErr } = await context.supabase
      .from("payroll")
      .update({
        status: "paid",
        paid_at: new Date().toISOString(),
        transfer_status: "success",
        transfer_reference: data.transfer_reference ?? undefined,
      })
      .eq("id", data.payroll_id);
    if (uErr) throw new Error(uErr.message);

    await context.supabase.from("finance_ledger").insert({
      type: "payroll",
      direction: "out",
      amount: row.total_amount,
      currency: row.currency ?? "NGN",
      reference_table: "payroll",
      reference_id: data.payroll_id,
      memo: "Payroll item paid",
      created_by: context.userId,
    });

    // If all items in run are paid, mark run completed.
    const runId = row.run_id as string | null;
    if (!runId) return { ok: true };
    const { data: pending } = await context.supabase
      .from("payroll")
      .select("id")
      .eq("run_id", runId)
      .neq("status", "paid")
      .limit(1);
    if (!pending || pending.length === 0) {
      await context.supabase.from("payroll_runs").update({ status: "completed" }).eq("id", runId);
    }
    return { ok: true };
  });

export const upsertPayoutAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      bank_code: z.string().min(2),
      bank_name: z.string().optional(),
      account_number: z.string().min(6),
      account_name: z.string().min(2),
      currency: z.string().default("NGN"),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("talent_payout_accounts")
      .upsert(
        { talent_id: context.userId, ...data, is_default: true },
        { onConflict: "talent_id,account_number,bank_code" },
      );
    if (error) throw new Error(error.message);
    return { ok: true };
  });