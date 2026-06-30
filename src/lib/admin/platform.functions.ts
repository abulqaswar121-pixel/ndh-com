import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const ROLES = [
  "client","talent","student","instructor","pm","hod","finance","admin","super_admin",
] as const;

async function assertSuper(supabase: any, userId: string) {
  const { data } = await supabase.rpc("has_role", { _user_id: userId, _role: "super_admin" });
  if (!data) throw new Error("Super admin only");
}
async function assertAdminOrSuper(supabase: any, userId: string) {
  const [{ data: a }, { data: s }] = await Promise.all([
    supabase.rpc("has_role", { _user_id: userId, _role: "admin" }),
    supabase.rpc("has_role", { _user_id: userId, _role: "super_admin" }),
  ]);
  if (!a && !s) throw new Error("Admin only");
}

// ============ Platform settings ============
export const updateSetting = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      key: z.string().min(2).max(120),
      value: z.any(),
      description: z.string().optional(),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertSuper(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("platform_settings").upsert(
      { key: data.key, value: data.value, description: data.description ?? null, updated_by: context.userId, updated_at: new Date().toISOString() } as any,
      { onConflict: "key" },
    );
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteSetting = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ key: z.string() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertSuper(context.supabase, context.userId);
    const { error } = await context.supabase.from("platform_settings").delete().eq("key", data.key);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ============ Site pages ============
export const upsertSitePage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      slug: z.string().min(2).max(60),
      title: z.string().min(2).max(160),
      blocks: z.array(z.record(z.string(), z.any())).default([]),
      published: z.boolean().default(true),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdminOrSuper(context.supabase, context.userId);
    const { error } = await context.supabase.from("site_pages").upsert(
      { slug: data.slug, title: data.title, blocks: data.blocks as any, published: data.published, updated_by: context.userId } as any,
      { onConflict: "slug" },
    );
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteSitePage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ slug: z.string() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertSuper(context.supabase, context.userId);
    const { error } = await context.supabase.from("site_pages").delete().eq("slug", data.slug);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ============ Broadcasts ============
export const sendBroadcast = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      title: z.string().min(2).max(160),
      body: z.string().min(2).max(4000),
      audience: z.array(z.enum(["all", ...ROLES])).min(1),
      channels: z.array(z.enum(["in_app", "email"])).default(["in_app"]),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertSuper(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Resolve recipient user ids
    let userIds: string[] = [];
    if (data.audience.includes("all")) {
      const { data: ps } = await supabaseAdmin.from("profiles").select("id");
      userIds = (ps || []).map((p: any) => p.id);
    } else {
      const { data: ur } = await supabaseAdmin
        .from("user_roles").select("user_id")
        .in("role", data.audience as any);
      userIds = Array.from(new Set((ur || []).map((r: any) => r.user_id)));
    }

    // Insert in-app notifications
    if (data.channels.includes("in_app") && userIds.length > 0) {
      const rows = userIds.map((uid) => ({
        user_id: uid,
        type: "broadcast",
        title: data.title,
        body: data.body,
      }));
      // chunk to avoid payload limits
      const chunkSize = 500;
      for (let i = 0; i < rows.length; i += chunkSize) {
        const { error } = await supabaseAdmin.from("notifications").insert(rows.slice(i, i + chunkSize) as any);
        if (error) throw new Error(error.message);
      }
    }

    // Record broadcast row
    const { data: bc, error: bcErr } = await supabaseAdmin.from("broadcasts").insert({
      title: data.title, body: data.body, audience: data.audience, channels: data.channels,
      status: "sent", sent_at: new Date().toISOString(),
      recipient_count: userIds.length, created_by: context.userId,
    } as any).select("id").single();
    if (bcErr) throw new Error(bcErr.message);

    // Email fan-out is best-effort and rate-limited; skip if email channel not selected
    // (Email infra is wired separately; in-app notification is the source of truth.)

    return { ok: true, id: (bc as any)?.id, recipients: userIds.length };
  });