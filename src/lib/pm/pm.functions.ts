import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const SITE = "https://ndh.com.ng";
const STAFF = ["pm", "hod", "admin", "super_admin"];

async function assertStaff(supabase: any, userId: string, allow: string[] = STAFF) {
  const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  const r = (roles || []).map((x: any) => x.role);
  if (!r.some((x: string) => allow.includes(x))) throw new Error("Not authorised.");
  return r as string[];
}

/** Admin/Super-admin/HOD invites a PM by email and department. */
export const invitePm = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({
    email: z.string().email(),
    full_name: z.string().min(2),
    phone: z.string().optional().nullable(),
    department_id: z.string().uuid(),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { userId, supabase } = context;
    await assertStaff(supabase, userId, ["admin", "super_admin", "hod"]);

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { sendSystemEmail } = await import("@/lib/email/send-system.server");

    const redirectTo = `${SITE}/auth/accept`;
    const { data: invited, error: inviteErr } = await supabaseAdmin.auth.admin.inviteUserByEmail(data.email, {
      data: { full_name: data.full_name, role: "pm" },
      redirectTo,
    });
    if (inviteErr && !/already.*registered/i.test(inviteErr.message)) throw new Error(inviteErr.message);

    let newUserId = invited?.user?.id;
    if (!newUserId) {
      const { data: list } = await supabaseAdmin.auth.admin.listUsers();
      newUserId = list?.users.find((u) => u.email?.toLowerCase() === data.email.toLowerCase())?.id;
    }
    if (!newUserId) throw new Error("Could not create or locate user");

    await supabaseAdmin.from("user_roles").upsert(
      { user_id: newUserId, role: "pm" },
      { onConflict: "user_id,role", ignoreDuplicates: true },
    );
    await supabaseAdmin.from("profiles").update({
      full_name: data.full_name,
      phone: data.phone || null,
      department_id: data.department_id,
    }).eq("id", newUserId);

    const { data: dept } = await supabaseAdmin.from("departments").select("name").eq("id", data.department_id).maybeSingle();

    await supabaseAdmin.from("pm_invitations").insert({
      email: data.email.toLowerCase(),
      full_name: data.full_name,
      phone: data.phone || null,
      department_id: data.department_id,
      invited_by: userId,
    });

    await sendSystemEmail(supabaseAdmin, "pm_invitation", data.email, {
      fullName: data.full_name,
      department: dept?.name || null,
      inviteUrl: redirectTo,
    });

    return { ok: true, userId: newUserId };
  });

/** PM sends or revises a quote. */
export const sendQuote = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({
    task_id: z.string().uuid(),
    amount: z.number().positive(),
    currency: z.string().default("NGN"),
    delivery_days: z.number().int().min(1).max(365).optional(),
    notes: z.string().optional(),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { userId, supabase } = context;
    await assertStaff(supabase, userId);

    const { data: task, error: tErr } = await supabase.from("tasks")
      .select("id,title,client_id,assigned_pm_id,status").eq("id", data.task_id).maybeSingle();
    if (tErr || !task) throw new Error("Task not found.");

    // Insert or update existing pending quote
    const { data: existing } = await supabase.from("quotes")
      .select("id").eq("task_id", data.task_id).eq("status", "pending").maybeSingle();

    if (existing) {
      await supabase.from("quotes").update({
        amount: data.amount, currency: data.currency, notes: data.notes || null,
        delivery_days: data.delivery_days || null, pm_id: userId,
      }).eq("id", existing.id);
    } else {
      await supabase.from("quotes").insert({
        task_id: data.task_id, pm_id: userId,
        amount: data.amount, currency: data.currency, notes: data.notes || null,
        delivery_days: data.delivery_days || null, status: "pending",
      });
    }

    await supabase.from("tasks").update({
      status: "quoted", quoted_amount: data.amount, quoted_currency: data.currency,
      first_response_at: new Date().toISOString(),
    }).eq("id", data.task_id);

    // Notify client
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { sendSystemEmail } = await import("@/lib/email/send-system.server");
    const { data: client } = await supabaseAdmin.from("profiles").select("email,full_name").eq("id", task.client_id).maybeSingle();
    if (client?.email) {
      const fmt = new Intl.NumberFormat("en-NG", { style: "currency", currency: data.currency, maximumFractionDigits: 0 });
      await sendSystemEmail(supabaseAdmin, "quote_sent", client.email, {
        clientName: client.full_name || "there",
        taskTitle: task.title,
        amount: fmt.format(data.amount),
        notes: data.notes || "",
      });
    }

    await supabase.from("task_events").insert({
      task_id: data.task_id, actor_id: userId, type: "quote_sent",
      payload: { amount: data.amount, currency: data.currency },
    });

    return { ok: true };
  });

/** PM assigns a talent to a task. */
export const assignTalent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({
    task_id: z.string().uuid(),
    talent_id: z.string().uuid(),
    pay_rate: z.number().nonnegative().optional(),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { userId, supabase } = context;
    await assertStaff(supabase, userId);

    const { error } = await supabase.from("tasks").update({
      assigned_talent_id: data.talent_id,
      talent_pay_rate: data.pay_rate ?? null,
      status: "in_progress",
    }).eq("id", data.task_id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** PM approves talent submission and delivers to client. */
export const approveAndDeliver = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({
    task_id: z.string().uuid(),
    quality: z.number().int().min(1).max(5).optional(),
    communication: z.number().int().min(1).max(5).optional(),
    timeliness: z.number().int().min(1).max(5).optional(),
    review_notes: z.string().optional(),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { userId, supabase } = context;
    await assertStaff(supabase, userId);

    const { data: task } = await supabase.from("tasks")
      .select("id,assigned_talent_id,title").eq("id", data.task_id).maybeSingle();
    if (!task) throw new Error("Task not found.");

    await supabase.from("tasks").update({
      status: "delivered", delivered_at: new Date().toISOString(),
    }).eq("id", data.task_id);

    if (task.assigned_talent_id && data.quality && data.communication && data.timeliness) {
      await supabase.from("talent_reviews").insert({
        talent_id: task.assigned_talent_id,
        task_id: data.task_id,
        reviewer_id: userId,
        quality_rating: data.quality,
        communication_rating: data.communication,
        timeliness_rating: data.timeliness,
        approved: true,
        notes: data.review_notes || null,
      });
    }

    return { ok: true };
  });

/** PM requests a revision from the talent. */
export const requestRevision = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({
    task_id: z.string().uuid(),
    notes: z.string().min(3),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { userId, supabase } = context;
    await assertStaff(supabase, userId);

    const { error } = await supabase.from("tasks").update({
      status: "revision_required",
      revision_notes: data.notes,
    }).eq("id", data.task_id);
    if (error) throw new Error(error.message);

    // Also drop a message to the talent for context
    const { data: t } = await supabase.from("tasks").select("assigned_talent_id").eq("id", data.task_id).maybeSingle();
    if (t?.assigned_talent_id) {
      await supabase.from("messages").insert({
        sender_id: userId, receiver_id: t.assigned_talent_id, task_id: data.task_id,
        content: `Revision requested: ${data.notes}`,
      });
    }
    return { ok: true };
  });

/** Marks a delivered task as completed (after client approval). */
export const completeTask = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ task_id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { userId, supabase } = context;
    await assertStaff(supabase, userId);
    const { error } = await supabase.from("tasks").update({
      status: "completed", completed_at: new Date().toISOString(),
    }).eq("id", data.task_id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Decline an incoming task with reason. */
export const declineTask = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({
    task_id: z.string().uuid(), reason: z.string().min(3),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { userId, supabase } = context;
    await assertStaff(supabase, userId);
    const { error } = await supabase.from("tasks").update({
      status: "cancelled", revision_notes: `Declined by PM: ${data.reason}`,
    }).eq("id", data.task_id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });