import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type InitInput = {
  taskId: string;
  quoteId: string;
  callbackPath?: string;
};

/**
 * Initialize a Paystack transaction for an approved quote.
 * Creates a `payments` row (status=pending) and returns the hosted checkout URL.
 */
export const initPaystackPayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: InitInput) => {
    if (!d?.taskId || !d?.quoteId) throw new Error("taskId and quoteId required");
    return d;
  })
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // Load the quote + task and verify ownership.
    const { data: quote, error: qErr } = await supabase
      .from("quotes")
      .select("id, amount, currency, status, task_id")
      .eq("id", data.quoteId)
      .maybeSingle();
    if (qErr || !quote) throw new Error("Quote not found");
    if (quote.task_id !== data.taskId) throw new Error("Quote/task mismatch");
    if (quote.status !== "approved") throw new Error("Quote must be approved before payment");

    const { data: task, error: tErr } = await supabase
      .from("tasks")
      .select("id, client_id, title")
      .eq("id", data.taskId)
      .maybeSingle();
    if (tErr || !task) throw new Error("Task not found");
    if (task.client_id !== userId) throw new Error("Forbidden");

    const { data: profile } = await supabase
      .from("profiles")
      .select("email, full_name")
      .eq("id", userId)
      .maybeSingle();
    if (!profile?.email) throw new Error("Missing client email");

    const currency = (quote.currency || "NGN").toUpperCase();
    const amountMinor = Math.round(Number(quote.amount) * 100); // Paystack expects minor units
    const reference = `NDH-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

    // Create pending payment row first so the webhook has something to reconcile.
    const { error: payErr } = await supabase.from("payments").insert({
      client_id: userId,
      task_id: task.id,
      amount: quote.amount,
      currency,
      gateway: "paystack",
      transaction_ref: reference,
      status: "pending",
    });
    if (payErr) throw new Error(payErr.message);

    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) throw new Error("PAYSTACK_SECRET_KEY not configured");

    const origin = (() => {
      try {
        return new URL(data.callbackPath || "/", "https://placeholder").origin;
      } catch {
        return "";
      }
    })();

    const callback_url =
      (data.callbackPath?.startsWith("http") ? data.callbackPath : undefined) ||
      undefined; // Paystack falls back to dashboard-configured URL if omitted

    const resp = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secret}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: profile.email,
        amount: amountMinor,
        currency,
        reference,
        callback_url,
        metadata: {
          task_id: task.id,
          quote_id: quote.id,
          client_id: userId,
          task_title: task.title,
        },
      }),
    });

    const json = (await resp.json()) as {
      status?: boolean;
      message?: string;
      data?: { authorization_url: string; access_code: string; reference: string };
    };
    void origin;
    if (!resp.ok || !json?.status || !json.data?.authorization_url) {
      throw new Error(json?.message || "Paystack init failed");
    }

    return {
      authorization_url: json.data.authorization_url,
      reference: json.data.reference,
    };
  });