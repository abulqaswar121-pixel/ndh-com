import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";

const DEFAULT_SYSTEM_PROMPT = `You are the NDH assistant for Nasteat Digital Hub (ndh.com.ng), a Nigerian creative agency and academy.

SERVICES: Web & app development, branding & design, video production, digital marketing, and consulting. Clients start a project at /start-project or view work at /case-studies.

NDH ACADEMY: Practical, project-based courses in software engineering, design, video, and marketing. Course catalog at /academy. Students can enroll, follow modules, and earn verifiable certificates (verify at /verify).

TALENT NETWORK: Vetted creatives available for hire. Directory at /talent.

PRICING: Project quotes are custom — direct users to /start-project for a tailored quote. Tuition prices are listed on each course page.

CONTACT: For anything you cannot answer, invite the user to click "Talk to a human" to open a support ticket.

STYLE: Warm, concise (2-4 sentences), helpful. Use markdown when it helps. Suggest a relevant NDH page when appropriate. Do not invent prices, timelines, or people.`;

export const Route = createFileRoute("/api/public/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as {
          messages?: UIMessage[];
          sessionId?: string;
        };
        if (!Array.isArray(body.messages)) {
          return new Response("messages required", { status: 400 });
        }

        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        // Load settings (enabled + custom prompt)
        let systemPrompt = DEFAULT_SYSTEM_PROMPT;
        let enabled = true;
        try {
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const { data: settings } = await supabaseAdmin
            .from("chat_settings")
            .select("enabled, system_prompt")
            .eq("id", 1)
            .maybeSingle();
          if (settings) {
            enabled = settings.enabled !== false;
            if (settings.system_prompt && settings.system_prompt.trim().length > 0) {
              systemPrompt = settings.system_prompt;
            }
          }
        } catch {
          // proceed with defaults
        }

        if (!enabled) {
          return new Response("Chat is currently disabled", { status: 503 });
        }

        const gateway = createLovableAiGatewayProvider(key);
        const model = gateway("google/gemini-3-flash-preview");
        const uiMessages = body.messages;

        const result = streamText({
          model,
          system: systemPrompt,
          messages: await convertToModelMessages(uiMessages),
          onFinish: async ({ text }) => {
            if (!body.sessionId) return;
            try {
              const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
              const { data: convo } = await supabaseAdmin
                .from("chat_conversations")
                .upsert(
                  {
                    session_id: body.sessionId,
                    last_message_at: new Date().toISOString(),
                    message_count: uiMessages.length + 1,
                  },
                  { onConflict: "session_id" },
                )
                .select("id")
                .maybeSingle();
              if (!convo?.id) return;
              const last = uiMessages[uiMessages.length - 1];
              const userText =
                last?.parts
                  ?.map((p) => (p.type === "text" ? p.text : ""))
                  .join("") ?? "";
              await supabaseAdmin.from("chat_messages").insert([
                { conversation_id: convo.id, role: "user", content: userText },
                { conversation_id: convo.id, role: "assistant", content: text },
              ]);
            } catch {
              // best-effort
            }
          },
        });

        return result.toUIMessageStreamResponse({
          originalMessages: uiMessages,
        });
      },
    },
  },
});