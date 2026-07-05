import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { toast } from "sonner";

type Msg = { id: string; sender_id: string; receiver_id: string; content: string; created_at: string; read: boolean };
type Contact = { id: string; full_name: string | null; email: string };

export function ClientMessages() {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [active, setActive] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load conversation partners (PMs assigned to my tasks + anyone I've messaged)
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: tasks } = await supabase.from("tasks").select("assigned_pm_id").eq("client_id", user.id).not("assigned_pm_id", "is", null);
      const ids = new Set<string>((tasks || []).map((t) => t.assigned_pm_id as string));
      const { data: msgs } = await supabase.from("messages").select("sender_id,receiver_id").or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);
      (msgs || []).forEach((m) => {
        if (m.sender_id !== user.id) ids.add(m.sender_id);
        if (m.receiver_id !== user.id) ids.add(m.receiver_id);
      });
      if (ids.size === 0) { setContacts([]); return; }
      const { data: profiles } = await supabase.from("profiles").select("id,full_name,email").in("id", Array.from(ids));
      setContacts((profiles as Contact[]) || []);
      if (!active && profiles && profiles[0]) setActive(profiles[0] as Contact);
    })();
  }, [user]); // eslint-disable-line

  // Load messages with active contact + realtime subscribe
  useEffect(() => {
    if (!user || !active) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${active.id}),and(sender_id.eq.${active.id},receiver_id.eq.${user.id})`)
        .order("created_at");
      if (!cancelled) setMessages((data as Msg[]) || []);
      // mark received as read
      await supabase.from("messages").update({ read: true }).eq("receiver_id", user.id).eq("sender_id", active.id).eq("read", false);
    })();

    const channel = supabase
      .channel(`messages:${user.id}:${active.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
        const m = payload.new as Msg;
        const inThread = (m.sender_id === user.id && m.receiver_id === active.id) || (m.sender_id === active.id && m.receiver_id === user.id);
        if (inThread) setMessages((p) => [...p, m]);
      })
      .subscribe();
    return () => { cancelled = true; supabase.removeChannel(channel); };
  }, [user, active]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !active || !text.trim()) return;
    const content = text.trim();
    setText("");
    const { error } = await supabase.from("messages").insert({ sender_id: user.id, receiver_id: active.id, content });
    if (error) toast.error(error.message);
  };

  return (
    <div className="grid h-[calc(100vh-12rem)] gap-4 lg:grid-cols-[280px_1fr]">
      <div className="overflow-y-auto rounded-2xl border border-border bg-card">
        <div className="border-b border-border px-4 py-3 text-sm font-semibold">Conversations</div>
        {contacts.length === 0 ? (
          <div className="p-6 text-center text-sm text-muted-foreground">No conversations yet. They start once a Project Manager is assigned to your task.</div>
        ) : (
          <ul className="divide-y divide-border">
            {contacts.map((c) => (
              <li key={c.id}>
                <button
                  onClick={() => setActive(c)}
                  className={`flex w-full items-center gap-3 px-4 py-3 text-left text-sm ${active?.id === c.id ? "bg-secondary" : "hover:bg-secondary/50"}`}
                >
                  <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-brand text-xs font-bold text-white">
                    {(c.full_name || c.email).slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate font-semibold">{c.full_name || c.email}</div>
                    <div className="truncate text-xs text-muted-foreground">{c.email}</div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex min-h-0 flex-col rounded-2xl border border-border bg-card">
        {active ? (
          <>
            <div className="border-b border-border px-4 py-3 text-sm font-semibold">{active.full_name || active.email}</div>
            <div ref={scrollRef} className="flex-1 space-y-2 overflow-y-auto p-4">
              {messages.map((m) => (
                <div key={m.id} className={`flex ${m.sender_id === user?.id ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm ${m.sender_id === user?.id ? "bg-gradient-brand text-white" : "bg-secondary"}`}>
                    {m.content}
                    <div className={`mt-1 text-[10px] ${m.sender_id === user?.id ? "text-white/70" : "text-muted-foreground"}`}>{new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
                  </div>
                </div>
              ))}
              {messages.length === 0 && <div className="grid h-full place-items-center text-sm text-muted-foreground">No messages yet — say hi.</div>}
            </div>
            <form onSubmit={send} className="flex items-center gap-2 border-t border-border p-3">
              <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a message…" className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm" />
              <Button type="submit" variant="brand"><Send className="h-4 w-4" /></Button>
            </form>
          </>
        ) : (
          <div className="grid h-full place-items-center text-sm text-muted-foreground">Pick a conversation</div>
        )}
      </div>
    </div>
  );
}