import { createFileRoute } from "@tanstack/react-router";
import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Paystack webhook receiver.
 * Configure this URL in your Paystack dashboard:
 *   https://<your-app>.lovable.app/api/public/webhooks/paystack
 *
 * Paystack signs each request with HMAC-SHA512 using your secret key,
 * delivered in the `x-paystack-signature` header.
 */
export const Route = createFileRoute("/api/public/webhooks/paystack")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env.PAYSTACK_SECRET_KEY;
        if (!secret) return new Response("Not configured", { status: 500 });

        const signature = request.headers.get("x-paystack-signature") || "";
        const raw = await request.text();
        const expected = createHmac("sha512", secret).update(raw).digest("hex");

        const a = Buffer.from(signature);
        const b = Buffer.from(expected);
        if (a.length !== b.length || !timingSafeEqual(a, b)) {
          return new Response("Invalid signature", { status: 401 });
        }

        let event: { event?: string; data?: Record<string, unknown> };
        try {
          event = JSON.parse(raw);
        } catch {
          return new Response("Bad JSON", { status: 400 });
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const eventName = event.event || "unknown";
        const data = (event.data || {}) as {
          reference?: string;
          status?: string;
          amount?: number;
          currency?: string;
          metadata?: Record<string, unknown>;
        };
        const reference = data.reference;

        if (!reference) return new Response("ok"); // ignore non-tx events

        if (eventName === "charge.success" && data.status === "success") {
          // Mark payment paid
          const { data: updated, error } = await supabaseAdmin
            .from("payments")
            .update({ status: "paid" })
            .eq("transaction_ref", reference)
            .select("task_id, client_id, amount, currency")
            .maybeSingle();
          if (error) {
            console.error("paystack webhook update failed", error);
            return new Response("DB error", { status: 500 });
          }
          // Move task forward
          let taskTitle = "your task";
          if (updated?.task_id) {
            const { data: t } = await supabaseAdmin
              .from("tasks")
              .update({ status: "in_progress" })
              .eq("id", updated.task_id)
              .select("title")
              .maybeSingle();
            if (t?.title) taskTitle = t.title;
          }
          // Send payment-received email
          if (updated?.client_id) {
            try {
              const { data: client } = await supabaseAdmin
                .from("profiles")
                .select("email, full_name")
                .eq("id", updated.client_id)
                .maybeSingle();
              if (client?.email) {
                const { sendSystemEmail } = await import("@/lib/email/send-system.server");
                const amount = `${updated.currency || "NGN"} ${Number(updated.amount || 0).toLocaleString()}`;
                await sendSystemEmail(supabaseAdmin, "payment_received", client.email, {
                  clientName: client.full_name || undefined,
                  taskTitle,
                  amount,
                  reference,
                  taskUrl: `https://ndh.com.ng/dashboard/client?tab=tasks${updated.task_id ? `&task=${updated.task_id}` : ""}`,
                });
              }
            } catch (e) {
              console.error("payment_received email failed", e);
            }
          }
        } else if (eventName === "charge.failed") {
          await supabaseAdmin
            .from("payments")
            .update({ status: "failed" })
            .eq("transaction_ref", reference);
        }

        return new Response("ok");
      },
    },
  },
});