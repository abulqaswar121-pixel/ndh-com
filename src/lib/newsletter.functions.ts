import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const schema = z.object({
  email: z.string().trim().toLowerCase().email().max(255),
  source: z.string().max(64).optional(),
});

export const subscribeNewsletter = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => schema.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("newsletter_subscribers")
      .upsert(
        { email: data.email, source: data.source ?? "site", status: "active" },
        { onConflict: "email", ignoreDuplicates: false },
      );
    if (error) throw new Error(error.message);
    return { ok: true };
  });
