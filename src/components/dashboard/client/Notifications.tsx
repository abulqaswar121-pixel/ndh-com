import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

type Msg = { id: string; content: string; created_at: string; sender_id: string; read: boolean };

export function ClientNotifications() {
  const { user } = useAuth();
  const [items, setItems] = useState<Msg[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase.from("messages").select("id,content,created_at,sender_id,read").eq("receiver_id", user.id).order("created_at", { ascending: false }).limit(30)
      .then(({ data }) => setItems((data as Msg[]) || []));
  }, [user]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold">Notifications</h1>
      {items.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">No notifications.</div>
      ) : (
        <ul className="divide-y divide-border rounded-2xl border border-border bg-card">
          {items.map((m) => (
            <li key={m.id} className={`px-5 py-3 text-sm ${!m.read ? "bg-secondary/30" : ""}`}>
              <div className="font-medium">{m.content}</div>
              <div className="mt-0.5 text-xs text-muted-foreground">{new Date(m.created_at).toLocaleString()}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}