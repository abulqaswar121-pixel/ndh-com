import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

const schema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  subject: z.string().max(200).optional().nullable(),
  message: z.string().min(5).max(4000),
});

export const submitSupportTicket = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => schema.parse(data))
  .handler(async ({ data }) => {
    const supabase = createClient<Database>(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
    const { error } = await supabase.from("support_tickets").insert({
      name: data.name,
      email: data.email,
      subject: data.subject ?? null,
      message: data.message,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });