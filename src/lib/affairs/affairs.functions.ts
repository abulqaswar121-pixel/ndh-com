import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertStaff(supabase: any, userId: string) {
  const { data: a } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
  const { data: s } = await supabase.rpc("has_role", { _user_id: userId, _role: "super_admin" });
  if (!a && !s) throw new Error("Forbidden");
}

export const fileComplaint = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      category: z.enum(["academic", "billing", "technical", "harassment", "general"]).default("general"),
      subject: z.string().min(3).max(200),
      body: z.string().min(5).max(4000),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("complaints").insert({
      student_id: context.userId, ...data,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const resolveComplaint = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      id: z.string().uuid(),
      status: z.enum(["open", "in_progress", "resolved", "dismissed"]),
      resolution: z.string().max(4000).optional(),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertStaff(context.supabase, context.userId);
    const patch = {
      status: data.status,
      resolution: data.resolution ?? null,
      assignee: context.userId,
      resolved_at:
        data.status === "resolved" || data.status === "dismissed"
          ? new Date().toISOString()
          : null,
    };
    const { error } = await context.supabase.from("complaints").update(patch).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const upsertAnnouncement = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      id: z.string().uuid().optional(),
      title: z.string().min(3).max(200),
      body: z.string().min(3).max(8000),
      audience: z.enum(["all", "students", "instructors", "staff"]).default("all"),
      publish_at: z.string().optional(),
      expires_at: z.string().nullable().optional(),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertStaff(context.supabase, context.userId);
    const payload = { ...data, created_by: context.userId };
    if (data.id) {
      const { error } = await context.supabase.from("announcements").update(payload).eq("id", data.id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await context.supabase.from("announcements").insert(payload);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const deleteAnnouncement = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertStaff(context.supabase, context.userId);
    const { error } = await context.supabase.from("announcements").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const moderateThread = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      id: z.string().uuid(),
      action: z.enum(["pin", "unpin", "lock", "unlock", "delete"]),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertStaff(context.supabase, context.userId);
    if (data.action === "delete") {
      const { error } = await context.supabase.from("forum_threads").delete().eq("id", data.id);
      if (error) throw new Error(error.message);
      return { ok: true };
    }
    const patch =
      data.action === "pin" ? { pinned: true } :
      data.action === "unpin" ? { pinned: false } :
      data.action === "lock" ? { locked: true } :
      { locked: false };
    const { error } = await context.supabase.from("forum_threads").update(patch).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const moderatePost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      id: z.string().uuid(),
      action: z.enum(["hide", "unhide", "delete"]),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertStaff(context.supabase, context.userId);
    if (data.action === "delete") {
      const { error } = await context.supabase.from("forum_posts").delete().eq("id", data.id);
      if (error) throw new Error(error.message);
      return { ok: true };
    }
    const { error } = await context.supabase.from("forum_posts")
      .update({ hidden: data.action === "hide" }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });