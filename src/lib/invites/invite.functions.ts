import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const validateInvite = createServerFn({ method: "GET" })
  .inputValidator((d: { token: string }) => {
    if (!d?.token) throw new Error("token required");
    return d;
  })
  .handler(async ({ data }) => {
    const key = process.env.SUPABASE_PUBLISHABLE_KEY!;
    const { createClient } = await import("@supabase/supabase-js");
    const { default: type } = await import("@/integrations/supabase/types");
    // Use public client for anon validation
    const sb = createClient(process.env.SUPABASE_URL!, key, { auth: { persistSession: false } });

    const token = data.token.trim();

    // Try all three tables
    const tables = ["pm_invitations", "talent_invitations", "hod_invitations"] as const;
    for (const table of tables) {
      const { data: row } = await (sb as any).from(table).select("*").eq("token", token).maybeSingle();
      if (row) {
        const expired = new Date(row.expires_at) < new Date();
        const used = row.status === "accepted" || !!row.accepted_at || !!row.accepted_user_id;
        return {
          valid: !expired && !used && row.status !== "expired" && row.status !== "revoked",
          expired,
          used,
          type: table === "pm_invitations" ? "pm" : table === "talent_invitations" ? "talent" : "hod",
          email: row.email,
          full_name: row.full_name,
          department_id: row.department_id,
          tier: (row as any).tier ?? null,
          skills: (row as any).skills ?? null,
          token,
        };
      }
    }
    return { valid: false, expired: false, used: false, type: null, token };
  });

export const acceptInvite = createServerFn({ method: "POST" })
  .inputValidator((d: { token: string; password: string; full_name: string }) => {
    if (!d?.token) throw new Error("token required");
    if (!d.password || d.password.length < 8) throw new Error("Password min 8 chars");
    if (!d.full_name || d.full_name.length < 2) throw new Error("Full name required");
    return d;
  })
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const token = data.token.trim();

    // Find invite
    let invite: any = null;
    let table: "pm_invitations" | "talent_invitations" | "hod_invitations" | null = null;
    for (const t of ["pm_invitations", "talent_invitations", "hod_invitations"] as const) {
      const { data: row } = await supabaseAdmin.from(t).select("*").eq("token", token).maybeSingle();
      if (row) { invite = row; table = t; break; }
    }
    if (!invite) throw new Error("Invalid invitation token");

    if (invite.status === "accepted" || invite.accepted_at) throw new Error("Invitation already used");
    if (new Date(invite.expires_at) < new Date()) {
      await supabaseAdmin.from(table!).update({ status: "expired" }).eq("id", invite.id);
      throw new Error("Invitation expired — request a new one");
    }
    if (invite.status === "revoked" || invite.status === "expired") throw new Error(`Invitation ${invite.status}`);

    // Create auth user
    const role = table === "pm_invitations" ? "pm" : table === "talent_invitations" ? "talent" : "hod";
    const { data: created, error: cErr } = await supabaseAdmin.auth.admin.createUser({
      email: invite.email,
      password: data.password,
      email_confirm: true,
      user_metadata: { full_name: data.full_name, role },
    });
    if (cErr && !/already.*registered/i.test(cErr.message)) throw new Error(cErr.message);

    let userId = created?.user?.id;
    if (!userId) {
      const { data: list } = await supabaseAdmin.auth.admin.listUsers();
      userId = list?.users.find((u: any) => u.email?.toLowerCase() === invite.email.toLowerCase())?.id;
    }
    if (!userId) throw new Error("Could not create user");

    // Update profile
    await supabaseAdmin.from("profiles").update({
      full_name: data.full_name,
      department_id: invite.department_id || null,
    }).eq("id", userId);

    // Assign role
    await supabaseAdmin.from("user_roles").upsert({ user_id: userId, role }, { onConflict: "user_id,role", ignoreDuplicates: true });

    // If talent, create talents row
    if (table === "talent_invitations") {
      await supabaseAdmin.from("talents").upsert({
        user_id: userId,
        department_id: invite.department_id || null,
        tier: invite.tier || 1,
        skills: invite.skills || [],
        status: "active",
        invited_at: invite.created_at,
        invited_by: invite.invited_by,
      }, { onConflict: "user_id" });
    }

    // If HOD, assign as hod of department
    if (table === "hod_invitations" && invite.department_id) {
      await supabaseAdmin.from("departments").update({ hod_id: userId }).eq("id", invite.department_id);
    }

    // Mark invitation as accepted
    await supabaseAdmin.from(table!).update({
      status: "accepted",
      accepted_at: new Date().toISOString(),
      accepted_user_id: userId,
    }).eq("id", invite.id);

    return { ok: true, userId, role, email: invite.email };
  });
