import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const SITE = "https://ndh.com.ng";

/** Admin/PM: invite a talent by email — 7-day single-use token per handoff 5B */
export const inviteTalent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({
    email: z.string().email(),
    full_name: z.string().min(2),
    department_id: z.string().uuid().optional().nullable(),
    tier: z.number().int().min(1).max(5).default(1),
    skills: z.array(z.string()).default([]),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { userId, supabase } = context;
    const { data: roleRows } = await supabase.from("user_roles").select("role").eq("user_id", userId);
    const roles = (roleRows || []).map((r: any) => r.role);
    if (!roles.some((r: string) => ["pm","hod","admin","super_admin"].includes(r))) {
      throw new Error("Only PMs and admins can invite talents.");
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { sendSystemEmail } = await import("@/lib/email/send-system.server");

    const token = crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "").slice(0,16);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const inviteUrl = `${SITE}/invite/${token}`;

    await supabaseAdmin.from("talent_invitations").insert({
      token,
      email: data.email.toLowerCase(),
      full_name: data.full_name,
      department_id: data.department_id || null,
      tier: data.tier,
      skills: data.skills,
      invited_by: userId,
      expires_at: expiresAt,
    });

    let deptName: string | null = null;
    if (data.department_id) {
      const { data: d } = await supabaseAdmin.from("departments").select("name").eq("id", data.department_id).maybeSingle();
      deptName = d?.name || null;
    }
    await sendSystemEmail(supabaseAdmin, "talent_invitation", data.email, {
      fullName: data.full_name,
      department: deptName,
      tier: data.tier,
      inviteUrl,
    });

    return { ok: true, token, expiresAt };
  });

/** Talent: accept or decline a task assignment */
export const respondToTask = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({
    taskId: z.string().uuid(), accept: z.boolean(),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.rpc("talent_respond_to_task", {
      _task_id: data.taskId, _accept: data.accept,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Talent: submit work (deliverables + optional note to PM) */
export const submitWork = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({
    taskId: z.string().uuid(),
    deliverables: z.array(z.object({ name: z.string(), path: z.string() })).min(1),
    notes: z.string().optional(),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.rpc("talent_submit_work", {
      _task_id: data.taskId,
      _deliverables: data.deliverables,
      _notes: data.notes ?? "",
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Talent: bootstrap own talent record + profile after first login (if invite metadata exists) */
export const ensureTalentProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId, supabase } = context;
    const { data: existing } = await supabase.from("talents").select("user_id, status").eq("user_id", userId).maybeSingle();
    if (existing) return { ok: true, exists: true, status: existing.status };

    // Look up invitation by email
    const { data: prof } = await supabase.from("profiles").select("email").eq("id", userId).maybeSingle();
    if (!prof?.email) return { ok: false };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: invite } = await supabaseAdmin.from("talent_invitations")
      .select("*").eq("email", prof.email.toLowerCase()).order("created_at", { ascending: false }).maybeSingle();
    if (!invite) return { ok: false };

    await supabaseAdmin.from("talents").insert({
      user_id: userId,
      department_id: invite.department_id,
      tier: invite.tier,
      skills: invite.skills,
      status: "invited",
      invited_at: invite.created_at as string,
      invited_by: invite.invited_by,
    });
    await supabaseAdmin.from("user_roles")
      .upsert({ user_id: userId, role: "talent" }, { onConflict: "user_id,role", ignoreDuplicates: true });
    await supabaseAdmin.from("talent_invitations").update({ accepted_user_id: userId, accepted_at: new Date().toISOString() }).eq("id", invite.id);
    return { ok: true, exists: false, status: "invited" };
  });