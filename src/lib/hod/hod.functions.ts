import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const recommendInput = z.object({
  student_id: z.string().uuid(),
  course_id: z.string().uuid().optional(),
  recommended_tier: z.enum(["starter", "core", "senior", "lead"]).default("starter"),
  justification: z.string().min(20).max(2000),
});

export const recommendGraduate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => recommendInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: prof } = await supabase
      .from("profiles").select("department_id").eq("id", userId).maybeSingle();
    const { error } = await supabase.from("graduate_recommendations").insert({
      student_id: data.student_id,
      course_id: data.course_id ?? null,
      department_id: prof?.department_id ?? null,
      recommended_by: userId,
      recommended_tier: data.recommended_tier,
      justification: data.justification,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const curriculumInput = z.object({
  course_id: z.string().uuid(),
  decision: z.enum(["approved", "needs_revision"]),
  notes: z.string().max(2000).optional(),
});

export const decideCurriculum = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => curriculumInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const status = data.decision === "approved" ? "approved" : "needs_revision";
    const { error } = await supabase.from("courses").update({
      curriculum_status: status,
      curriculum_approved_by: data.decision === "approved" ? userId : null,
      curriculum_approved_at: data.decision === "approved" ? new Date().toISOString() : null,
    }).eq("id", data.course_id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const inviteHodInput = z.object({
  email: z.string().email(),
  full_name: z.string().min(2).max(120),
  department_id: z.string().uuid(),
});

export const inviteHod = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => inviteHodInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
    const { data: isSuper } = await supabase.rpc("has_role", { _user_id: userId, _role: "super_admin" });
    if (!isAdmin && !isSuper) throw new Error("Forbidden");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const tempPassword = `NDH-${crypto.randomUUID().slice(0, 12)}`;
    const { data: created, error: cErr } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: { full_name: data.full_name, role: "hod" },
    });
    if (cErr || !created.user) throw new Error(cErr?.message ?? "Failed to create user");

    await supabaseAdmin.from("profiles").update({
      department_id: data.department_id,
      full_name: data.full_name,
    }).eq("id", created.user.id);
    await supabaseAdmin.from("user_roles").insert({ user_id: created.user.id, role: "hod" });
    await supabaseAdmin.from("departments").update({ hod_id: created.user.id }).eq("id", data.department_id);

    const { data: link } = await supabaseAdmin.auth.admin.generateLink({
      type: "recovery",
      email: data.email,
    });
    return { ok: true, action_link: link?.properties?.action_link ?? null };
  });