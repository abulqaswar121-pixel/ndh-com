import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Verify a Paystack transaction by reference and reconcile the local
 * payments/enrollments/tasks rows. Used as a fallback when the webhook
 * hasn't arrived yet (common in test mode without a configured webhook URL).
 */
export const verifyPaystackReference = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ reference: z.string().min(4) }).parse(d))
  .handler(async ({ data, context }) => {
    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) throw new Error("PAYSTACK_SECRET_KEY not configured");

    const resp = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(data.reference)}`,
      { headers: { Authorization: `Bearer ${secret}` } },
    );
    const json = (await resp.json()) as {
      status?: boolean;
      data?: { status?: string; amount?: number; currency?: string };
    };
    if (!resp.ok || !json?.status) throw new Error("Verify failed");
    const paid = json.data?.status === "success";

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Fetch the payment row, must belong to the caller
    const { data: pay } = await supabaseAdmin
      .from("payments")
      .select("id, status, client_id, task_id, enrollment_id")
      .eq("transaction_ref", data.reference)
      .maybeSingle();
    if (!pay) return { ok: false, reason: "unknown_reference" };
    if (pay.client_id !== context.userId) return { ok: false, reason: "forbidden" };

    if (!paid) return { ok: false, reason: "not_paid_yet", status: json.data?.status };

    if (pay.status !== "paid") {
      await supabaseAdmin.from("payments").update({ status: "paid" }).eq("id", pay.id);
    }
    if (pay.enrollment_id) {
      await supabaseAdmin
        .from("enrollments")
        .update({ status: "active", payment_status: "paid" })
        .eq("id", pay.enrollment_id);
    }
    if (pay.task_id) {
      await supabaseAdmin
        .from("tasks")
        .update({ status: "in_progress" })
        .eq("id", pay.task_id);
    }
    return { ok: true, enrollment_id: pay.enrollment_id, task_id: pay.task_id };
  });

/**
 * Verify all pending payments for the caller — useful when landing back on
 * the dashboard without a specific reference in the URL.
 */
export const verifyMyPendingPayments = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: pending } = await supabaseAdmin
      .from("payments")
      .select("transaction_ref")
      .eq("client_id", context.userId)
      .eq("status", "pending")
      .limit(10);
    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret || !pending?.length) return { checked: 0, updated: 0 };
    let updated = 0;
    for (const p of pending) {
      if (!p.transaction_ref) continue;
      const resp = await fetch(
        `https://api.paystack.co/transaction/verify/${encodeURIComponent(p.transaction_ref)}`,
        { headers: { Authorization: `Bearer ${secret}` } },
      );
      const json = (await resp.json()) as { data?: { status?: string } };
      if (json?.data?.status !== "success") continue;
      const { data: row } = await supabaseAdmin
        .from("payments")
        .update({ status: "paid" })
        .eq("transaction_ref", p.transaction_ref)
        .select("task_id, enrollment_id")
        .maybeSingle();
      if (row?.enrollment_id) {
        await supabaseAdmin.from("enrollments")
          .update({ status: "active", payment_status: "paid" })
          .eq("id", row.enrollment_id);
      }
      if (row?.task_id) {
        await supabaseAdmin.from("tasks").update({ status: "in_progress" }).eq("id", row.task_id);
      }
      updated += 1;
    }
    return { checked: pending.length, updated };
  });