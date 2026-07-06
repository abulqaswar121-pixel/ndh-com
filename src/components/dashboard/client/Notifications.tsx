import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Link } from "@tanstack/react-router";
import { Bell, CheckCheck, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type Notif = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  read: boolean;
  created_at: string;
};

export function ClientNotifications() {
  const { user } = useAuth();
  const [items, setItems] = useState<Notif[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let mounted = true;
    supabase
      .from("notifications")
      .select("id,type,title,body,link,read,created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50)
      .then(({ data }) => {
        if (!mounted) return;
        setItems((data as Notif[]) || []);
        setLoading(false);
      });

    const channel = supabase
      .channel(`notif-${user.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
        (payload) => setItems((p) => [payload.new as Notif, ...p]),
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
        (payload) => setItems((p) => p.map((n) => (n.id === (payload.new as Notif).id ? (payload.new as Notif) : n))),
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [user]);

  const markAll = async () => {
    if (!user) return;
    await supabase.from("notifications").update({ read: true }).eq("user_id", user.id).eq("read", false);
    setItems((p) => p.map((n) => ({ ...n, read: true })));
  };

  const markOne = async (id: string) => {
    await supabase.from("notifications").update({ read: true }).eq("id", id);
  };

  const deleteOne = async (id: string) => {
    await supabase.from("notifications").delete().eq("id", id);
    setItems((p) => p.filter((n) => n.id !== id));
  };

  const deleteAll = async () => {
    if (!user) return;
    if (!confirm("Delete all notifications? This cannot be undone.")) return;
    await supabase.from("notifications").delete().eq("user_id", user.id);
    setItems([]);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-extrabold">Notifications</h1>
        <div className="flex gap-2">
          {items.some((n) => !n.read) && (
            <Button size="sm" variant="outline" onClick={markAll}>
              <CheckCheck className="h-4 w-4" /> Mark all as read
            </Button>
          )}
          {items.length > 0 && (
            <Button size="sm" variant="outline" onClick={deleteAll}>
              <Trash2 className="h-4 w-4" /> Delete all
            </Button>
          )}
        </div>
      </div>
      {loading ? (
        <div className="text-sm text-muted-foreground">Loading…</div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-10 text-center">
          <Bell className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
          <div className="text-sm text-muted-foreground">You're all caught up.</div>
        </div>
      ) : (
        <ul className="divide-y divide-border rounded-2xl border border-border bg-card">
          {items.map((n) => {
            const content = (
              <div className="flex items-start gap-3">
                <div className={`mt-1 h-2 w-2 flex-none rounded-full ${n.read ? "bg-transparent" : "bg-gradient-brand"}`} />
                <div className="min-w-0 flex-1">
                  <div className="font-semibold">{n.title}</div>
                  {n.body && <div className="mt-0.5 text-sm text-muted-foreground">{n.body}</div>}
                  <div className="mt-1 text-xs text-muted-foreground">{new Date(n.created_at).toLocaleString()}</div>
                </div>
              </div>
            );
            return (
              <li key={n.id} className={`flex items-start gap-2 px-5 py-3 text-sm ${!n.read ? "bg-secondary/30" : ""}`}>
                <div className="flex-1 min-w-0" onClick={() => !n.read && markOne(n.id)}>
                  {n.link ? (
                    <Link to={n.link as any} className="block">{content}</Link>
                  ) : content}
                </div>
                <button
                  aria-label="Delete notification"
                  onClick={(e) => { e.stopPropagation(); deleteOne(n.id); }}
                  className="mt-1 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}