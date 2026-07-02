import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/**
 * Return which auth providers exist for an email so the UI can show a clear
 * message ("This email was registered with Google — please continue with
 * Google"). Returns only provider names, never PII.
 */
export const checkEmailProviders = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ email: z.string().email() }).parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const target = data.email.toLowerCase();
    let user: { identities?: { provider?: string | null }[] | null } | undefined;
    for (let page = 1; page <= 20 && !user; page++) {
      const { data: p, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 200 });
      if (error || !p) break;
      user = p.users.find((u) => (u.email || "").toLowerCase() === target);
      if (p.users.length < 200) break;
    }
    if (!user) return { exists: false, providers: [] as string[] };
    const providers = Array.from(
      new Set(((user.identities || []).map((i) => i?.provider).filter(Boolean)) as string[]),
    );
    return { exists: true, providers };
  });
