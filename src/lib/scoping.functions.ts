import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const schema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().toLowerCase().email().max(255),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  company: z.string().trim().max(200).optional().or(z.literal("")),
  project_type: z.string().min(1).max(80),
  services: z.array(z.string().max(80)).max(20).default([]),
  budget_range: z.string().max(40).optional().or(z.literal("")),
  timeline: z.string().max(40).optional().or(z.literal("")),
  description: z.string().max(4000).optional().or(z.literal("")),
  extra: z.record(z.string(), z.any()).optional(),
});

export const submitProjectQuote = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => schema.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("project_quotes")
      .insert({
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        company: data.company || null,
        project_type: data.project_type,
        services: data.services,
        budget_range: data.budget_range || null,
        timeline: data.timeline || null,
        description: data.description || null,
        extra: data.extra ?? {},
        status: "new",
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { ok: true, id: row.id };
  });