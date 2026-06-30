import * as React from "react";
import { render } from "react-email";
import type { SupabaseClient } from "@supabase/supabase-js";
import { TEMPLATES } from "@/lib/email-templates/registry";

const SITE_NAME = "Najeeb Digital Hub";
const SENDER_DOMAIN = "notify.ndh.com.ng";
const FROM_DOMAIN = "ndh.com.ng";

function generateToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Internal email sender for server-side / webhook contexts.
 * Uses an admin Supabase client (bypasses RLS) and enqueues the email
 * the same way /lovable/email/transactional/send does.
 */
export async function sendSystemEmail(
  supabase: SupabaseClient<any>,
  templateName: string,
  recipientEmail: string,
  templateData: Record<string, any> = {},
): Promise<{ ok: boolean; reason?: string }> {
  const template = (TEMPLATES as any)[templateName];
  if (!template) return { ok: false, reason: "template_missing" };

  const normalizedEmail = recipientEmail.toLowerCase();

  // Suppression check
  const { data: suppressed } = await supabase
    .from("suppressed_emails")
    .select("id")
    .eq("email", normalizedEmail)
    .maybeSingle();
  if (suppressed) return { ok: false, reason: "suppressed" };

  // Get or create unsubscribe token
  const { data: existing } = await supabase
    .from("email_unsubscribe_tokens")
    .select("token, used_at")
    .eq("email", normalizedEmail)
    .maybeSingle();
  let token: string;
  if (existing && !existing.used_at) {
    token = existing.token;
  } else {
    token = generateToken();
    await supabase
      .from("email_unsubscribe_tokens")
      .upsert({ token, email: normalizedEmail }, { onConflict: "email", ignoreDuplicates: true });
    const { data: stored } = await supabase
      .from("email_unsubscribe_tokens")
      .select("token")
      .eq("email", normalizedEmail)
      .maybeSingle();
    if (stored?.token) token = stored.token;
  }

  const element = React.createElement(template.component, templateData);
  const html = await render(element);
  const text = await render(element, { plainText: true });
  const subject = typeof template.subject === "function"
    ? template.subject(templateData)
    : template.subject;

  const messageId = crypto.randomUUID();

  await supabase.from("email_send_log").insert({
    message_id: messageId,
    template_name: templateName,
    recipient_email: recipientEmail,
    status: "pending",
  });

  const { error } = await supabase.rpc("enqueue_email", {
    queue_name: "transactional_emails",
    payload: {
      message_id: messageId,
      to: recipientEmail,
      from: `${SITE_NAME} <noreply@${FROM_DOMAIN}>`,
      sender_domain: SENDER_DOMAIN,
      subject,
      html,
      text,
      purpose: "transactional",
      label: templateName,
      idempotency_key: messageId,
      unsubscribe_token: token,
      queued_at: new Date().toISOString(),
    },
  });

  if (error) {
    console.error("sendSystemEmail enqueue failed", error);
    await supabase.from("email_send_log").insert({
      message_id: messageId,
      template_name: templateName,
      recipient_email: recipientEmail,
      status: "failed",
      error_message: error.message,
    });
    return { ok: false, reason: "enqueue_failed" };
  }
  return { ok: true };
}