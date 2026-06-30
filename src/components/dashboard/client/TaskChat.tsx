import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Paperclip, Send, Loader2, FileText, X } from "lucide-react";
import { toast } from "sonner";

type Message = {
  id: string;
  task_id: string | null;
  sender_id: string;
  receiver_id: string | null;
  content: string;
  attachments: { name: string; path: string }[] | null;
  read: boolean;
  created_at: string;
};

export function TaskChat({ taskId, pmId }: { taskId: string; pmId: string | null }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [peerTyping, setPeerTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    if (!user) return;
    let mounted = true;

    const load = async () => {
      const { data } = await supabase
        .from("messages")
        .select("id,task_id,sender_id,receiver_id,content,attachments,read,created_at")
        .eq("task_id", taskId)
        .order("created_at", { ascending: true });
      if (!mounted) return;
      setMessages((data as Message[]) || []);

      // Mark unread peer messages as read
      await supabase
        .from("messages")
        .update({ read: true })
        .eq("task_id", taskId)
        .eq("receiver_id", user.id)
        .eq("read", false);
    };
    load();

    const channel = supabase
      .channel(`task-chat-${taskId}`, { config: { presence: { key: user.id } } })
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `task_id=eq.${taskId}` },
        (payload) => {
          const m = payload.new as Message;
          setMessages((p) => (p.some((x) => x.id === m.id) ? p : [...p, m]));
          if (m.receiver_id === user.id) {
            supabase.from("messages").update({ read: true }).eq("id", m.id);
          }
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "messages", filter: `task_id=eq.${taskId}` },
        (payload) => {
          const m = payload.new as Message;
          setMessages((p) => p.map((x) => (x.id === m.id ? m : x)));
        },
      )
      .on("broadcast", { event: "typing" }, ({ payload }) => {
        if (payload?.userId && payload.userId !== user.id) {
          setPeerTyping(true);
          window.clearTimeout((channel as any)._typingTimer);
          (channel as any)._typingTimer = window.setTimeout(() => setPeerTyping(false), 2500);
        }
      })
      .subscribe();
    channelRef.current = channel;

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [taskId, user]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, peerTyping]);

  const sendTyping = () => {
    channelRef.current?.send({ type: "broadcast", event: "typing", payload: { userId: user?.id } });
  };

  const onPickFiles = (list: FileList | null) => {
    if (!list) return;
    setFiles((p) => [...p, ...Array.from(list)].slice(0, 4));
  };

  const send = async () => {
    if (!user) return;
    if (!text.trim() && files.length === 0) return;
    if (!pmId) { toast.error("Chat unavailable until a PM is assigned."); return; }
    setSending(true);
    try {
      const uploaded: { name: string; path: string }[] = [];
      for (const f of files) {
        const path = `${user.id}/${taskId}/${Date.now()}-${f.name}`;
        const { error } = await supabase.storage.from("task-files").upload(path, f, { upsert: false });
        if (!error) uploaded.push({ name: f.name, path });
      }
      const { error } = await supabase.from("messages").insert({
        task_id: taskId,
        sender_id: user.id,
        receiver_id: pmId as string,
        content: text.trim() || "(attachment)",
        attachments: uploaded.length ? uploaded : null,
      });
      if (error) throw error;
      setText("");
      setFiles([]);
    } catch (e) {
      toast.error((e as Error).message || "Could not send message");
    } finally {
      setSending(false);
    }
  };

  const downloadAttachment = async (path: string) => {
    const { data } = await supabase.storage.from("task-files").createSignedUrl(path, 60);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank");
  };

  return (
    <div className="flex h-[420px] flex-col overflow-hidden rounded-xl border border-border bg-background">
      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 && (
          <div className="grid h-full place-items-center text-center text-sm text-muted-foreground">
            {pmId
              ? "Say hello to your project manager. They'll respond shortly."
              : "Your PM will join the chat once assigned."}
          </div>
        )}
        {messages.map((m) => {
          const mine = m.sender_id === user?.id;
          const isSystem = m.sender_id === "00000000-0000-0000-0000-000000000000";
          if (isSystem) {
            return (
              <div key={m.id} className="text-center text-[11px] uppercase tracking-widest text-muted-foreground">
                {m.content}
              </div>
            );
          }
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[78%] rounded-2xl px-3.5 py-2 text-sm shadow-sm ${
                  mine ? "bg-gradient-brand text-white" : "bg-secondary text-foreground"
                }`}
              >
                <div className="whitespace-pre-wrap break-words">{m.content}</div>
                {m.attachments && m.attachments.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {m.attachments.map((a) => (
                      <button
                        key={a.path}
                        onClick={() => downloadAttachment(a.path)}
                        className={`flex items-center gap-1.5 rounded-md px-2 py-1 text-xs ${mine ? "bg-white/20" : "bg-background"}`}
                      >
                        <FileText className="h-3 w-3" /> {a.name}
                      </button>
                    ))}
                  </div>
                )}
                <div className={`mt-1 text-[10px] ${mine ? "text-white/70" : "text-muted-foreground"}`}>
                  {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  {mine && (m.read ? " · read" : " · sent")}
                </div>
              </div>
            </div>
          );
        })}
        {peerTyping && (
          <div className="flex justify-start">
            <div className="rounded-2xl bg-secondary px-3 py-2 text-xs text-muted-foreground">typing…</div>
          </div>
        )}
      </div>

      {files.length > 0 && (
        <div className="flex flex-wrap gap-1.5 border-t border-border px-3 py-2">
          {files.map((f, i) => (
            <span key={i} className="flex items-center gap-1 rounded-md bg-secondary px-2 py-0.5 text-xs">
              {f.name}
              <button onClick={() => setFiles((p) => p.filter((_, j) => j !== i))}>
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="flex items-end gap-2 border-t border-border p-2">
        <label className="grid h-9 w-9 cursor-pointer place-items-center rounded-lg bg-secondary text-muted-foreground hover:text-foreground">
          <Paperclip className="h-4 w-4" />
          <input type="file" multiple className="hidden" onChange={(e) => onPickFiles(e.target.files)} />
        </label>
        <textarea
          value={text}
          onChange={(e) => { setText(e.target.value); sendTyping(); }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
          }}
          placeholder="Message your PM…"
          rows={1}
          className="min-h-[36px] max-h-32 flex-1 resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm"
        />
        <Button variant="brand" size="sm" disabled={sending} onClick={send}>
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}