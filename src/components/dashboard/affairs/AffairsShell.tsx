import { useEffect, useState } from "react";
import { DashboardShell, type NavItem } from "@/components/dashboard/Sidebar";
import { LayoutDashboard, MessageSquareWarning, Megaphone, MessagesSquare, Settings, Plus, Trash2, Pin, Lock, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useRouterState } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useServerFn } from "@tanstack/react-start";
import {
  resolveComplaint, upsertAnnouncement, deleteAnnouncement, moderateThread, moderatePost,
} from "@/lib/affairs/affairs.functions";
import { toast } from "sonner";

const NAV: NavItem[] = [
  { label: "Dashboard", to: "/dashboard/student-affairs", icon: LayoutDashboard },
  { label: "Complaints", to: "/dashboard/student-affairs", search: { tab: "complaints" }, icon: MessageSquareWarning },
  { label: "Announcements", to: "/dashboard/student-affairs", search: { tab: "announcements" }, icon: Megaphone },
  { label: "Forum Moderation", to: "/dashboard/student-affairs", search: { tab: "forum" }, icon: MessagesSquare },
  { label: "Settings", to: "/dashboard/student-affairs", search: { tab: "settings" }, icon: Settings },
];

export function AffairsShell() {
  const search = useRouterState({ select: (r) => r.location.search as { tab?: string } });
  const tab = search.tab ?? "overview";
  return (
    <DashboardShell title="Student Affairs" items={NAV}>
      {tab === "overview" && <Overview />}
      {tab === "complaints" && <Complaints />}
      {tab === "announcements" && <Announcements />}
      {tab === "forum" && <ForumModeration />}
      {tab === "settings" && <Card className="p-6 text-sm text-muted-foreground">Manage from your profile.</Card>}
    </DashboardShell>
  );
}

function Overview() {
  const [s, setS] = useState({ openC: 0, totalA: 0, openT: 0, hiddenP: 0 });
  useEffect(() => {
    (async () => {
      const [c, a, t, p] = await Promise.all([
        supabase.from("complaints").select("id", { count: "exact", head: true }).in("status", ["open", "in_progress"]),
        supabase.from("announcements").select("id", { count: "exact", head: true }),
        supabase.from("forum_threads").select("id", { count: "exact", head: true }).eq("locked", false),
        supabase.from("forum_posts").select("id", { count: "exact", head: true }).eq("hidden", true),
      ]);
      setS({ openC: c.count ?? 0, totalA: a.count ?? 0, openT: t.count ?? 0, hiddenP: p.count ?? 0 });
    })();
  }, []);
  const cards = [
    { label: "Open complaints", value: s.openC },
    { label: "Announcements", value: s.totalA },
    { label: "Active threads", value: s.openT },
    { label: "Hidden posts", value: s.hiddenP },
  ];
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((c) => (
        <Card key={c.label} className="p-5">
          <div className="text-xs uppercase tracking-widest text-muted-foreground">{c.label}</div>
          <div className="mt-2 text-3xl font-extrabold">{c.value}</div>
        </Card>
      ))}
    </div>
  );
}

type Complaint = { id: string; student_id: string; category: string; subject: string; body: string; status: string; resolution: string | null; created_at: string };

function Complaints() {
  const [rows, setRows] = useState<Complaint[]>([]);
  const [filter, setFilter] = useState("open");
  const [names, setNames] = useState<Record<string, string>>({});
  const [open, setOpen] = useState<Complaint | null>(null);
  const [resStatus, setResStatus] = useState<"in_progress" | "resolved" | "dismissed">("resolved");
  const [resText, setResText] = useState("");
  const resolve = useServerFn(resolveComplaint);

  const load = async () => {
    let q = supabase.from("complaints").select("*").order("created_at", { ascending: false });
    if (filter === "open") q = q.in("status", ["open", "in_progress"]);
    else if (filter !== "all") q = q.eq("status", filter);
    const { data } = await q;
    const list = (data as Complaint[]) || [];
    setRows(list);
    const ids = Array.from(new Set(list.map((r) => r.student_id)));
    if (ids.length) {
      const { data: ps } = await supabase.from("profiles").select("id, full_name, email").in("id", ids);
      const map: Record<string, string> = {};
      (ps || []).forEach((p: any) => { map[p.id] = p.full_name || p.email; });
      setNames(map);
    }
  };
  useEffect(() => { load(); }, [filter]);

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold">Complaints</h3>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="open">Open / in progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="dismissed">Dismissed</SelectItem>
            <SelectItem value="all">All</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {rows.length === 0 ? (
        <div className="text-sm text-muted-foreground">No complaints.</div>
      ) : (
        <div className="grid gap-3">
          {rows.map((r) => (
            <div key={r.id} className="rounded-lg border border-border p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="font-semibold">{r.subject}</div>
                  <div className="text-xs text-muted-foreground">
                    {names[r.student_id] || r.student_id} · {r.category} · {new Date(r.created_at).toLocaleDateString()}
                  </div>
                  <p className="mt-2 text-sm whitespace-pre-wrap">{r.body}</p>
                  {r.resolution && <p className="mt-2 text-xs text-muted-foreground">Resolution: {r.resolution}</p>}
                </div>
                <Badge variant="outline">{r.status}</Badge>
              </div>
              <div className="mt-3">
                <Button size="sm" variant="outline" onClick={() => { setOpen(r); setResText(r.resolution || ""); }}>Respond</Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!open} onOpenChange={(v) => !v && setOpen(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Resolve complaint</DialogTitle></DialogHeader>
          <div className="grid gap-3">
            <div>
              <Label>Status</Label>
              <Select value={resStatus} onValueChange={(v) => setResStatus(v as any)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="in_progress">In progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="dismissed">Dismissed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Resolution / Notes</Label><Textarea value={resText} onChange={(e) => setResText(e.target.value)} /></div>
          </div>
          <DialogFooter>
            <Button onClick={async () => {
              if (!open) return;
              try {
                await resolve({ data: { id: open.id, status: resStatus, resolution: resText || undefined } });
                toast.success("Updated");
                setOpen(null); load();
              } catch (e: any) { toast.error(e.message); }
            }}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

type Announcement = { id: string; title: string; body: string; audience: string; publish_at: string; expires_at: string | null; created_at: string };

function Announcements() {
  const [rows, setRows] = useState<Announcement[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Announcement | null>(null);
  const [title, setTitle] = useState(""); const [body, setBody] = useState("");
  const [audience, setAudience] = useState<"all" | "students" | "instructors" | "staff">("all");
  const [expires, setExpires] = useState("");
  const upsert = useServerFn(upsertAnnouncement);
  const del = useServerFn(deleteAnnouncement);

  const load = async () => {
    const { data } = await supabase.from("announcements").select("*").order("publish_at", { ascending: false });
    setRows((data as Announcement[]) || []);
  };
  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing(null); setTitle(""); setBody(""); setAudience("all"); setExpires(""); setOpen(true); };
  const openEdit = (a: Announcement) => {
    setEditing(a); setTitle(a.title); setBody(a.body); setAudience(a.audience as any);
    setExpires(a.expires_at ? a.expires_at.slice(0, 16) : ""); setOpen(true);
  };

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold">Announcements</h3>
        <Button size="sm" onClick={openNew}><Plus className="mr-1 h-4 w-4" /> New announcement</Button>
      </div>
      {rows.length === 0 ? (
        <div className="text-sm text-muted-foreground">No announcements yet.</div>
      ) : (
        <div className="grid gap-3">
          {rows.map((a) => (
            <div key={a.id} className="rounded-lg border border-border p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="font-semibold">{a.title}</div>
                  <div className="text-xs text-muted-foreground">{a.audience} · Posted {new Date(a.publish_at).toLocaleDateString()}{a.expires_at ? ` · Expires ${new Date(a.expires_at).toLocaleDateString()}` : ""}</div>
                  <p className="mt-2 text-sm whitespace-pre-wrap">{a.body}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => openEdit(a)}>Edit</Button>
                  <Button size="sm" variant="destructive" onClick={async () => {
                    if (!confirm("Delete announcement?")) return;
                    try { await del({ data: { id: a.id } }); toast.success("Deleted"); load(); } catch (e: any) { toast.error(e.message); }
                  }}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Edit announcement" : "New announcement"}</DialogTitle></DialogHeader>
          <form className="grid gap-3" onSubmit={async (e) => {
            e.preventDefault();
            try {
              await upsert({ data: {
                id: editing?.id,
                title, body, audience,
                expires_at: expires ? new Date(expires).toISOString() : null,
              } });
              toast.success("Saved"); setOpen(false); load();
            } catch (er: any) { toast.error(er.message); }
          }}>
            <div><Label>Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} required /></div>
            <div><Label>Body</Label><Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={5} required /></div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Audience</Label>
                <Select value={audience} onValueChange={(v) => setAudience(v as any)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Everyone</SelectItem>
                    <SelectItem value="students">Students</SelectItem>
                    <SelectItem value="instructors">Instructors</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Expires (optional)</Label><Input type="datetime-local" value={expires} onChange={(e) => setExpires(e.target.value)} /></div>
            </div>
            <DialogFooter><Button type="submit">Save</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

type Thread = { id: string; title: string; pinned: boolean; locked: boolean; author_id: string; created_at: string };
type Post = { id: string; thread_id: string; author_id: string; body: string; hidden: boolean; created_at: string };

function ForumModeration() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [names, setNames] = useState<Record<string, string>>({});
  const mt = useServerFn(moderateThread);
  const mp = useServerFn(moderatePost);

  const load = async () => {
    const [{ data: t }, { data: p }] = await Promise.all([
      supabase.from("forum_threads").select("*").order("created_at", { ascending: false }).limit(50),
      supabase.from("forum_posts").select("*").order("created_at", { ascending: false }).limit(50),
    ]);
    const tlist = (t as Thread[]) || [];
    const plist = (p as Post[]) || [];
    setThreads(tlist); setPosts(plist);
    const ids = Array.from(new Set([...tlist.map((x) => x.author_id), ...plist.map((x) => x.author_id)]));
    if (ids.length) {
      const { data: ps } = await supabase.from("profiles").select("id, full_name, email").in("id", ids);
      const map: Record<string, string> = {};
      (ps || []).forEach((p: any) => { map[p.id] = p.full_name || p.email; });
      setNames(map);
    }
  };
  useEffect(() => { load(); }, []);

  return (
    <div className="grid gap-6">
      <Card className="p-6">
        <h3 className="mb-4 text-lg font-bold">Threads</h3>
        {threads.length === 0 ? (
          <div className="text-sm text-muted-foreground">No threads.</div>
        ) : (
          <div className="grid gap-2">
            {threads.map((t) => (
              <div key={t.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border p-3">
                <div>
                  <div className="font-semibold">{t.title} {t.pinned && <Badge className="ml-1">Pinned</Badge>} {t.locked && <Badge variant="outline" className="ml-1">Locked</Badge>}</div>
                  <div className="text-xs text-muted-foreground">{names[t.author_id] || t.author_id} · {new Date(t.created_at).toLocaleDateString()}</div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={async () => { try { await mt({ data: { id: t.id, action: t.pinned ? "unpin" : "pin" } }); load(); } catch (e: any) { toast.error(e.message); } }}><Pin className="mr-1 h-4 w-4" />{t.pinned ? "Unpin" : "Pin"}</Button>
                  <Button size="sm" variant="outline" onClick={async () => { try { await mt({ data: { id: t.id, action: t.locked ? "unlock" : "lock" } }); load(); } catch (e: any) { toast.error(e.message); } }}><Lock className="mr-1 h-4 w-4" />{t.locked ? "Unlock" : "Lock"}</Button>
                  <Button size="sm" variant="destructive" onClick={async () => { if (!confirm("Delete thread?")) return; try { await mt({ data: { id: t.id, action: "delete" } }); toast.success("Deleted"); load(); } catch (e: any) { toast.error(e.message); } }}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="p-6">
        <h3 className="mb-4 text-lg font-bold">Recent posts</h3>
        {posts.length === 0 ? (
          <div className="text-sm text-muted-foreground">No posts.</div>
        ) : (
          <div className="grid gap-2">
            {posts.map((p) => (
              <div key={p.id} className="rounded-lg border border-border p-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="text-xs text-muted-foreground">{names[p.author_id] || p.author_id} · {new Date(p.created_at).toLocaleDateString()}</div>
                    <p className={"mt-1 text-sm whitespace-pre-wrap " + (p.hidden ? "opacity-50 line-through" : "")}>{p.body}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={async () => { try { await mp({ data: { id: p.id, action: p.hidden ? "unhide" : "hide" } }); load(); } catch (e: any) { toast.error(e.message); } }}><EyeOff className="mr-1 h-4 w-4" />{p.hidden ? "Unhide" : "Hide"}</Button>
                    <Button size="sm" variant="destructive" onClick={async () => { if (!confirm("Delete post?")) return; try { await mp({ data: { id: p.id, action: "delete" } }); toast.success("Deleted"); load(); } catch (e: any) { toast.error(e.message); } }}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}