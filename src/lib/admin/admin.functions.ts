import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const ROLES = [
  "client","talent","student","instructor","pm","hod","finance","admin","super_admin",
] as const;

async function assertAdmin(supabase: any, userId: string, requireSuper = false) {
  const [{ data: a }, { data: s }] = await Promise.all([
    supabase.rpc("has_role", { _user_id: userId, _role: "admin" }),
    supabase.rpc("has_role", { _user_id: userId, _role: "super_admin" }),
  ]);
  if (requireSuper) {
    if (!s) throw new Error("Super admin only");
    return;
  }
  if (!a && !s) throw new Error("Admin only");
}

export const grantRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      user_id: z.string().uuid(),
      role: z.enum(ROLES),
      department_id: z.string().uuid().nullable().optional(),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    // Only super_admin may grant the admin/super_admin/finance role
    const sensitive = data.role === "admin" || data.role === "super_admin" || data.role === "finance";
    await assertAdmin(context.supabase, context.userId, sensitive);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("user_roles").upsert(
      { user_id: data.user_id, role: data.role },
      { onConflict: "user_id,role" },
    );
    if (error) throw new Error(error.message);
    if (data.department_id !== undefined) {
      await supabaseAdmin.from("profiles")
        .update({ department_id: data.department_id })
        .eq("id", data.user_id);
    }
    return { ok: true };
  });

export const revokeRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ user_id: z.string().uuid(), role: z.enum(ROLES) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const sensitive = data.role === "admin" || data.role === "super_admin" || data.role === "finance";
    await assertAdmin(context.supabase, context.userId, sensitive);
    if (data.user_id === context.userId && data.role === "super_admin") {
      throw new Error("You cannot remove your own super admin role");
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("user_roles")
      .delete().eq("user_id", data.user_id).eq("role", data.role);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const upsertDepartment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      id: z.string().uuid().optional(),
      slug: z.string().min(2).max(50),
      name: z.string().min(2).max(120),
      description: z.string().optional(),
      hod_id: z.string().uuid().nullable().optional(),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    if (data.id) {
      const { error } = await context.supabase.from("departments")
        .update({ slug: data.slug, name: data.name, description: data.description ?? null, hod_id: data.hod_id ?? null } as any)
        .eq("id", data.id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await context.supabase.from("departments").insert({
        slug: data.slug, name: data.name, description: data.description ?? null, hod_id: data.hod_id ?? null,
      } as any);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const deleteDepartment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId, true);
    const { error } = await context.supabase.from("departments").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });