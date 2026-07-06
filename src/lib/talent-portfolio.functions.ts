import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { z } from "zod";

function publicClient() {
  return createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
  );
}

export const listPublicTalents = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const { data, error } = await sb
    .from("talents")
    .select("user_id, public_slug, headline, bio, skills, years_experience, hourly_rate, tier, portfolio_url, github_url, linkedin_url")
    .eq("is_public", true)
    .not("public_slug", "is", null)
    .limit(100);
  if (error) throw new Error(error.message);
  const ids = (data ?? []).map((t) => t.user_id);
  if (ids.length === 0) return [];
  const { data: profs } = await sb.from("profiles").select("id, full_name, avatar_url").in("id", ids);
  const map = new Map((profs ?? []).map((p) => [p.id, p]));
  return (data ?? []).map((t) => ({ ...t, profile: map.get(t.user_id) ?? null }));
});

export const getPublicTalent = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => z.object({ slug: z.string().min(1).max(120) }).parse(d))
  .handler(async ({ data }) => {
    const sb = publicClient();
    const { data: t, error } = await sb
      .from("talents")
      .select("user_id, public_slug, headline, bio, skills, years_experience, hourly_rate, tier, portfolio_url, github_url, linkedin_url, availability")
      .eq("public_slug", data.slug)
      .eq("is_public", true)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!t) return null;
    const [{ data: profile }, { data: items }] = await Promise.all([
      sb.from("profiles").select("full_name, avatar_url, country").eq("id", t.user_id).maybeSingle(),
      sb.from("talent_portfolio_items").select("*").eq("talent_id", t.user_id).order("position", { ascending: true }),
    ]);
    return { ...t, profile, items: items ?? [] };
  });

// --- Owner-side (talent) management ---

export const getMyTalentProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("talents")
      .select("*")
      .eq("user_id", context.userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    const { data: items } = await context.supabase
      .from("talent_portfolio_items")
      .select("*")
      .eq("talent_id", context.userId)
      .order("position", { ascending: true });
    return { talent: data, items: items ?? [] };
  });

const upsertProfileSchema = z.object({
  public_slug: z.string().trim().min(3).max(60).regex(/^[a-z0-9-]+$/, "lowercase letters, numbers, dashes only").optional().or(z.literal("")),
  headline: z.string().max(160).optional().or(z.literal("")),
  bio: z.string().max(4000).optional().or(z.literal("")),
  portfolio_url: z.string().url().max(300).optional().or(z.literal("")),
  github_url: z.string().url().max(300).optional().or(z.literal("")),
  linkedin_url: z.string().url().max(300).optional().or(z.literal("")),
  hourly_rate: z.number().min(0).max(100000).optional().nullable(),
  years_experience: z.number().int().min(0).max(80).optional().nullable(),
  skills: z.array(z.string().max(40)).max(40).optional(),
  is_public: z.boolean().optional(),
});

export const updateMyTalentProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => upsertProfileSchema.parse(d))
  .handler(async ({ context, data }) => {
    const payload: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(data)) {
      if (v === undefined) continue;
      payload[k] = v === "" ? null : v;
    }
    const { error } = await context.supabase
      .from("talents")
      .update(payload as never)
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const itemSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1).max(160),
  description: z.string().max(2000).optional().or(z.literal("")),
  image_url: z.string().url().max(500).optional().or(z.literal("")),
  link_url: z.string().url().max(500).optional().or(z.literal("")),
  tags: z.array(z.string().max(30)).max(15).default([]),
  position: z.number().int().min(0).max(999).default(0),
});

export const upsertPortfolioItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => itemSchema.parse(d))
  .handler(async ({ context, data }) => {
    const row = {
      talent_id: context.userId,
      title: data.title,
      description: data.description || null,
      image_url: data.image_url || null,
      link_url: data.link_url || null,
      tags: data.tags,
      position: data.position,
    };
    if (data.id) {
      const { error } = await context.supabase
        .from("talent_portfolio_items")
        .update(row)
        .eq("id", data.id)
        .eq("talent_id", context.userId);
      if (error) throw new Error(error.message);
      return { ok: true, id: data.id };
    }
    const { data: inserted, error } = await context.supabase
      .from("talent_portfolio_items")
      .insert(row)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { ok: true, id: inserted.id };
  });

export const deletePortfolioItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase
      .from("talent_portfolio_items")
      .delete()
      .eq("id", data.id)
      .eq("talent_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });