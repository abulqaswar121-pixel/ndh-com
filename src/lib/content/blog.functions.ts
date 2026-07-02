import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";

function pub() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false, storage: undefined } },
  );
}

export const listBlogPosts = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await pub()
    .from("blog_posts")
    .select("slug,title,excerpt,tag,cover_query,author,read_minutes,published_at")
    .eq("published", true)
    .order("published_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const getBlogPost = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string }) => d)
  .handler(async ({ data }) => {
    const { data: row, error } = await pub()
      .from("blog_posts")
      .select("*")
      .eq("slug", data.slug)
      .eq("published", true)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row;
  });

export const submitCareerApplication = createServerFn({ method: "POST" })
  .inputValidator((d: { full_name: string; email: string; role_applied: string; portfolio_url?: string; cover_letter?: string }) => d)
  .handler(async ({ data }) => {
    if (!data.full_name || !data.email || !data.role_applied) throw new Error("Missing required fields");
    const { error } = await pub().from("career_applications").insert({
      full_name: data.full_name,
      email: data.email,
      role_applied: data.role_applied,
      portfolio_url: data.portfolio_url ?? null,
      cover_letter: data.cover_letter ?? null,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });