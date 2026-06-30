import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Returns the invoice rendered as a base64-encoded PDF. The client downloads it
 * directly; no storage round-trip needed.
 */
export const getInvoicePdf = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ invoice_id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: inv, error } = await context.supabase
      .from("invoices")
      .select("invoice_number, issued_at, due_date, currency, subtotal, tax, total, amount_paid, status, notes, line_items, client_id")
      .eq("id", data.invoice_id)
      .single();
    if (error || !inv) throw new Error(error?.message || "Invoice not found");

    let client: { name?: string | null; email?: string | null } | null = null;
    if (inv.client_id) {
      const { data: p } = await context.supabase
        .from("profiles")
        .select("full_name, email")
        .eq("id", inv.client_id)
        .maybeSingle();
      if (p) client = { name: p.full_name, email: p.email };
    }

    const { renderInvoicePdf } = await import("./invoice-pdf.server");
    const bytes = await renderInvoicePdf({
      invoice_number: inv.invoice_number,
      issued_at: inv.issued_at,
      due_date: inv.due_date,
      currency: inv.currency,
      subtotal: Number(inv.subtotal),
      tax: Number(inv.tax),
      total: Number(inv.total),
      amount_paid: Number(inv.amount_paid),
      status: inv.status,
      notes: inv.notes,
      line_items: Array.isArray(inv.line_items) ? (inv.line_items as any) : [],
      client,
    });

    // Base64 encode for transport
    let bin = "";
    const chunk = 0x8000;
    for (let i = 0; i < bytes.length; i += chunk) {
      bin += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + chunk)) as any);
    }
    const base64 = Buffer.from(bytes).toString("base64");
    void bin;
    return { filename: `${inv.invoice_number}.pdf`, base64 };
  });