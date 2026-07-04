import { createClient } from "@supabase/supabase-js";
import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";

export default defineTool({
  name: "get_my_profile",
  title: "Get my profile",
  description: "Return the signed-in NDH user's profile (name, email, phone, country, currency) and roles.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx: ToolContext) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
      {
        global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
        auth: { persistSession: false, autoRefreshToken: false },
      },
    );
    const userId = ctx.getUserId();
    const [{ data: profile, error: pErr }, { data: roles }] = await Promise.all([
      supabase.from("profiles").select("id,email,full_name,phone,country,currency,avatar_url").eq("id", userId!).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", userId!),
    ]);
    if (pErr) return { content: [{ type: "text", text: pErr.message }], isError: true };
    const result = { profile, roles: (roles ?? []).map((r) => r.role) };
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      structuredContent: result,
    };
  },
});