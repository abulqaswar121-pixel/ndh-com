import { useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { MessageCircle, X, Send, Loader2, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useServerFn } from "@tanstack/react-start";
import { escalateChatToTicket } from "@/lib/chat.functions";
import { toast } from "sonner";

const STORAGE_KEY = "ndh-chat-v1";
const SESSION_KEY = "ndh-chat-session-v1";

type Persisted = { sessionId: string; messages: UIMessage[] };

function loadPersisted(): Persisted {
  if (typeof window === "undefined") {
    return { sessionId: cryptoRandom(), messages: [] };
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Persisted;
      if (parsed?.sessionId && Array.isArray(parsed.messages)) return parsed;
    }
  } catch {
    /* ignore */
  }
  const sessionId =
    window.localStorage.getItem(SESSION_KEY) || cryptoRandom();
  window.localStorage.setItem(SESSION_KEY, sessionId);
  return { sessionId, messages: [] };
}

function cryptoRandom() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

const QUICK_REPLIES = [
  "What services do you offer?",
  "How do I enrol in the Academy?",
  "Get a quote for my project",
  "How do I verify a certificate?",
];

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"chat" | "handoff">("chat");
  const [initial] = useState(loadPersisted);
  const [input, setInput] = useState("");
  const [handoffForm, setHandoffForm] = useState({ name: "", email: "", summary: "" });
  const [handoffBusy, setHandoffBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const escalate = useServerFn(escalateChatToTicket);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/public/chat",
        prepareSendMessagesRequest: ({ messages }) => ({
          body: { messages, sessionId: initial.sessionId },
        }),
      }),
    [initial.sessionId],
  );

  const { messages, sendMessage, status, setMessages, error } = useChat({
    id: initial.sessionId,
    messages: initial.messages,
    transport,
  });

  // Persist to localStorage on every update
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ sessionId: initial.sessionId, messages }),
      );
    } catch {
      /* ignore quota */
    }
  }, [messages, initial.sessionId]);

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, status, open]);

  const busy = status === "submitted" || status === "streaming";

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    setInput("");
    void sendMessage({ text: trimmed });
  };

  const clear = () => {
    setMessages([]);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  };

  const submitHandoff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      handoffForm.name.length < 2 ||
      !/\S+@\S+\.\S+/.test(handoffForm.email) ||
      handoffForm.summary.length < 5
    ) {
      toast.error("Please provide your name, a valid email, and a short summary.");
      return;
    }
    setHandoffBusy(true);
    try {
      const transcript = messages
        .map((m) => {
          const text = m.parts?.map((p) => (p.type === "text" ? p.text : "")).join("") ?? "";
          return `${m.role.toUpperCase()}: ${text}`;
        })
        .join("\n");
      await escalate({
        data: {
          sessionId: initial.sessionId,
          name: handoffForm.name,
          email: handoffForm.email,
          summary: handoffForm.summary,
          transcript,
        },
      });
      toast.success("Thanks — a teammate will email you shortly.");
      setHandoffForm({ name: "", email: "", summary: "" });
      setMode("chat");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not send. Try again.");
    } finally {
      setHandoffBusy(false);
    }
  };

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 group flex h-14 w-14 items-center justify-center rounded-full bg-[#0A0E2A] text-white shadow-xl ring-1 ring-white/10 hover:scale-105 transition-transform"
          aria-label="Open NDH AI Assistant"
        >
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-teal-400 via-blue-500 to-purple-500 opacity-20 blur-xl group-hover:opacity-30 transition-opacity" />
          <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white text-black">
            <span className="text-sm font-bold">AI</span>
            <span className="absolute -top-1 -right-1 h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
          </div>
        </button>
      )}

      {open && (
        <div
          className="fixed z-50 bg-card text-card-foreground border shadow-2xl flex flex-col
            inset-0 sm:inset-auto sm:bottom-6 sm:right-6 sm:w-[380px] sm:h-[560px] sm:rounded-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b px-4 py-3 bg-primary text-primary-foreground">
            <div>
              <div className="font-semibold text-sm">NDH Assistant</div>
              <div className="text-xs opacity-80">
                {mode === "handoff" ? "Talk to a human" : "Ask about services, courses, or projects"}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded p-1 hover:bg-white/10"
              aria-label="Close chat"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {mode === "chat" && (
            <>
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 && (
                  <div className="space-y-3">
                    <div className="rounded-lg bg-muted p-3 text-sm">
                      Hi! I&rsquo;m the NDH assistant. Ask me anything about our services,
                      Academy, or how to get started.
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {QUICK_REPLIES.map((q) => (
                        <button
                          key={q}
                          type="button"
                          onClick={() => send(q)}
                          className="text-xs rounded-full border px-3 py-1 hover:bg-muted transition-colors"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {messages.map((m) => {
                  const text = m.parts?.map((p) => (p.type === "text" ? p.text : "")).join("") ?? "";
                  const isUser = m.role === "user";
                  return (
                    <div key={m.id} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                          isUser
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-foreground"
                        }`}
                      >
                        {isUser ? (
                          <div className="whitespace-pre-wrap">{text}</div>
                        ) : (
                          <div className="prose prose-sm dark:prose-invert max-w-none">
                            <ReactMarkdown>{text}</ReactMarkdown>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {busy && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-lg px-3 py-2 text-sm flex items-center gap-2">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span className="text-muted-foreground">Thinking…</span>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="text-xs text-destructive">
                    {error.message || "Something went wrong. Try again."}
                  </div>
                )}
              </div>

              <div className="border-t p-3 space-y-2">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    send(input);
                  }}
                  className="flex gap-2"
                >
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your message…"
                    disabled={busy}
                    autoFocus
                  />
                  <Button type="submit" size="icon" disabled={busy || input.trim().length === 0}>
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <button
                    type="button"
                    onClick={() => setMode("handoff")}
                    className="inline-flex items-center gap-1 hover:text-foreground"
                  >
                    <User className="h-3 w-3" /> Talk to a human
                  </button>
                  {messages.length > 0 && (
                    <button type="button" onClick={clear} className="hover:text-foreground">
                      Clear chat
                    </button>
                  )}
                </div>
              </div>
            </>
          )}

          {mode === "handoff" && (
            <form onSubmit={submitHandoff} className="flex-1 overflow-y-auto p-4 space-y-3">
              <p className="text-sm text-muted-foreground">
                Leave your details and a short message. A teammate will reply by email.
              </p>
              <div className="space-y-1">
                <Label htmlFor="ho-name">Name</Label>
                <Input
                  id="ho-name"
                  value={handoffForm.name}
                  onChange={(e) => setHandoffForm((f) => ({ ...f, name: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="ho-email">Email</Label>
                <Input
                  id="ho-email"
                  type="email"
                  value={handoffForm.email}
                  onChange={(e) => setHandoffForm((f) => ({ ...f, email: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="ho-msg">How can we help?</Label>
                <Textarea
                  id="ho-msg"
                  rows={4}
                  value={handoffForm.summary}
                  onChange={(e) => setHandoffForm((f) => ({ ...f, summary: e.target.value }))}
                  required
                />
              </div>
              <div className="flex gap-2 pt-1">
                <Button type="button" variant="outline" onClick={() => setMode("chat")} disabled={handoffBusy}>
                  Back
                </Button>
                <Button type="submit" disabled={handoffBusy} className="flex-1">
                  {handoffBusy ? "Sending…" : "Send to team"}
                </Button>
              </div>
            </form>
          )}
        </div>
      )}
    </>
  );
}