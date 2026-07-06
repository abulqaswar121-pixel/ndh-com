import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { submitSupportTicket } from "@/lib/support.functions";

const EscalateSchema = z.object({
  sessionId: z.string().min(1),
  name: z.string().min(2),
  email: z.string().email(),
  summary: z.string().min(5),
  transcript: z.string().max(20000).optional(),
});

export const escalateChatToTicket = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => EscalateSchema.parse(input))
  .handler(async ({ data }) => {
    const message =
      data.summary +
      (data.transcript ? `\n\n--- Chat transcript ---\n${data.transcript}` : "");
    await submitSupportTicket({
      data: {
        name: data.name,
        email: data.email,
        subject: `Chat handoff — session ${data.sessionId.slice(0, 8)}`,
        message,
      },
    });
    return { ok: true };
  });