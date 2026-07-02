import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Assign a signup-intent role (client or student) after social sign-in,
 * only if the user currently has no role. Prevents role-elevation abuse.
 */
export const applyPendingRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ role: z.enum(["client", "student"]) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: existing } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId);
    if (existing && existing.length > 0) {
      return { ok: true, role: existing[0].role, changed: false };
    }
    await supabaseAdmin
      .from("user_roles")
      .upsert({ user_id: context.userId, role: data.role }, { onConflict: "user_id,role" });
    if (data.role === "student") {
      await supabaseAdmin.from("students").upsert({ user_id: context.userId }, { onConflict: "user_id" });
    }
    return { ok: true, role: data.role, changed: true };
  });