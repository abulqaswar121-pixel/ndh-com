import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Sends the client confirmation + PM notification emails after a task is created.
 * Idempotent-ish: only sends if welcome_sent / not yet notified state is correct.
 */
export const notifyTaskCreated = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { taskId: string }) => {
    if (!d?.taskId) throw new Error("taskId required");
    return d;
  })
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { sendSystemEmail } = await import("@/lib/email/send-system.server");

    const { data: task } = await supabaseAdmin
      .from("tasks")
      .select("id, client_id, assigned_pm_id, title, service_category, tier, budget_min, budget_max, budget_currency, deadline")
      .eq("id", data.taskId)
      .maybeSingle();
    if (!task) throw new Error("Task not found");
    if (task.client_id !== userId) throw new Error("Forbidden");

    const { data: client } = await supabaseAdmin
      .from("profiles").select("email, full_name").eq("id", task.client_id).maybeSingle();

    let pmName: string | null = null;
    let pmEmail: string | null = null;
    if (task.assigned_pm_id) {
      const { data: pm } = await supabaseAdmin
        .from("profiles").select("email, full_name").eq("id", task.assigned_pm_id).maybeSingle();
      pmName = pm?.full_name || null;
      pmEmail = pm?.email || null;
    }

    const taskUrl = `https://ndh.com.ng/dashboard/client?tab=tasks&task=${task.id}`;

    if (client?.email) {
      await sendSystemEmail(supabaseAdmin, "task_submitted", client.email, {
        clientName: client.full_name || undefined,
        taskTitle: task.title,
        category: task.service_category,
        tier: task.tier,
        pmName,
        taskUrl,
      });
    }

    if (pmEmail) {
      const budgetRange = task.budget_min != null
        ? `${task.budget_currency || "NGN"} ${Number(task.budget_min).toLocaleString()} – ${Number(task.budget_max || task.budget_min).toLocaleString()}`
        : "Not specified";
      await sendSystemEmail(supabaseAdmin, "pm_assigned", pmEmail, {
        pmName: pmName || "PM",
        taskTitle: task.title,
        category: task.service_category,
        tier: task.tier,
        clientName: client?.full_name || client?.email || "Client",
        budgetRange,
        deadline: task.deadline ? new Date(task.deadline).toLocaleDateString() : "Flexible",
        taskUrl: `https://ndh.com.ng/dashboard/pm?task=${task.id}`,
      });
    }

    return { ok: true };
  });

/**
 * Sends the welcome email if not previously sent. Called on first dashboard mount.
 */
export const sendWelcomeIfNeeded = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { sendSystemEmail } = await import("@/lib/email/send-system.server");

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("email, full_name, welcome_sent")
      .eq("id", userId)
      .maybeSingle();
    if (!profile?.email || profile.welcome_sent) return { ok: true, sent: false };

    await sendSystemEmail(supabaseAdmin, "welcome", profile.email, {
      name: profile.full_name || undefined,
      dashboardUrl: "https://ndh.com.ng/dashboard/client",
    });
    await supabaseAdmin.from("profiles").update({ welcome_sent: true }).eq("id", userId);
    return { ok: true, sent: true };
  });