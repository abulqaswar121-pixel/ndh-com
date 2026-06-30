import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertDirector(supabase: any, userId: string) {
  const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
  const { data: isSuper } = await supabase.rpc("has_role", { _user_id: userId, _role: "super_admin" });
  if (!isAdmin && !isSuper) throw new Error("Forbidden");
}

// Sign certificate (Director step, then Founder=super_admin step)
export const signCertificate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      certificate_id: z.string().uuid(),
      as: z.enum(["director", "founder"]),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    if (data.as === "founder") {
      const { data: isSuper } = await supabase.rpc("has_role", { _user_id: userId, _role: "super_admin" });
      if (!isSuper) throw new Error("Only the Founder (Super Admin) can sign as founder");
    } else {
      await assertDirector(supabase, userId);
    }
    const nowIso = new Date().toISOString();
    const patch =
      data.as === "director"
        ? { director_signed_by: userId, director_signed_at: nowIso, status: "director_signed" }
        : { founder_signed_by: userId, founder_signed_at: nowIso, status: "founder_signed" };
    const { error } = await supabase.from("certificates").update(patch).eq("id", data.certificate_id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const upsertCalendarEntry = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      id: z.string().uuid().optional(),
      title: z.string().min(2).max(160),
      kind: z.enum(["semester", "exam", "holiday", "break", "graduation", "event"]),
      starts_at: z.string(),
      ends_at: z.string(),
      department_id: z.string().uuid().nullable().optional(),
      notes: z.string().max(2000).optional(),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertDirector(supabase, userId);
    const payload = { ...data, created_by: userId };
    if (data.id) {
      const { error } = await supabase.from("academic_calendar").update(payload).eq("id", data.id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabase.from("academic_calendar").insert(payload);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const deleteCalendarEntry = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertDirector(context.supabase, context.userId);
    const { error } = await context.supabase.from("academic_calendar").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const upsertTuitionPrice = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      course_id: z.string().uuid(),
      country_code: z.string().min(2).max(8),
      currency: z.string().min(3).max(4),
      amount: z.number().positive(),
      active: z.boolean().default(true),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertDirector(context.supabase, context.userId);
    const { error } = await context.supabase.from("tuition_prices").upsert(data, {
      onConflict: "course_id,country_code,currency",
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });