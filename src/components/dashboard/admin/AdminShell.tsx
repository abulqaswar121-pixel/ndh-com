import { useEffect, useState } from "react";
import { DashboardShell, type NavItem } from "@/components/dashboard/Sidebar";
import { LayoutDashboard, Users, Building2, Shield, Activity, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useRouterState } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useServerFn } from "@tanstack/react-start";
import { grantRole, revokeRole, upsertDepartment, deleteDepartment } from "@/lib/admin/admin.functions";
import { toast } from "sonner";

const ROLES = [
  "client","talent","student","instructor","pm","hod","finance","admin","super_admin",
] as const;
type Role = typeof ROLES[number];

export function AdminShell({ title, isSuper = false }: { title: string; isSuper?: boolean }) {
  const search = useRouterState({ select: (r) => r.location.search as { tab?: string } });
  const tab = search.tab ?? "overview";

  const base = isSuper ? "/dashboard/super-admin" : "/dashboard/admin";
  const NAV: NavItem[] = [
    { label: "Overview", to: base, icon: LayoutDashboard },
    { label: "Users & Roles", to: base, search: { tab: "users" }, icon: Users },
    { label: "Departments", to: base, search: { tab: "departments" }, icon: Building2 },
    { label: "Activity", to: base, search: { tab: "activity" }, icon: Activity },
    ...(isSuper ? [{ label: "Platform", to: base, search: { tab: "platform" }, icon: Shield }] : []),
  ];

  return (
    <DashboardShell title={title} items={NAV}>
      {tab === "overview" && <Overview />}
      {tab === "users" && <UsersTab isSuper={isSuper} />}
      {tab === "departments" && <DepartmentsTab isSuper={isSuper} />}
      {tab === "activity" && <ActivityTab />}
      {tab === "platform" && isSuper && <PlatformTab />}
    </DashboardShell>
  );
}

function Overview() {
  const [s, setS] = useState({ users: 0, tasks: 0, courses: 0, enrollments: 0, payments: 0 });
  useEffect(() => {
    (async () => {
      const [u, t, c, e, p] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("tasks").select("id", { count: "exact", head: true }),
        supabase.from("courses").select("id", { count: "exact", head: true }),
        supabase.from("enrollments").select("id", { count: "exact", head: true }),
        supabase.from("payments").select("id", { count: "exact", head: true }).eq("status", "paid"),
      ]);
      setS({
        users: u.count ?? 0, tasks: t.count ?? 0, courses: c.count ?? 0,
        enrollments: e.count ?? 0, payments: p.count ?? 0,
      });
    })();
  }, []);
  const cards = [
    { label: "Users", value: s.users },
    { label: "Tasks", value: s.tasks },
    { label: "Courses", value: s.courses },
    { label: "Enrollments", value: s.enrollments },
    { label: "Paid orders", value: s.payments },
  ];
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {cards.map((c) => (
        <Card key={c.label} className="p-5">
          <div className="text-xs uppercase tracking-widest text-muted-foreground">{c.label}</div>
          <div className="mt-2 text-3xl font-extrabold">{c.value}</div>
        </Card>
      ))}
    </div>
  );
}

type Profile = { id: string; email: string; full_name: string | null; department_id: string | null };
type UserRoleRow = { user_id: string; role: Role };

function UsersTab({ isSuper }: { isSuper: boolean }) {
  const [users, setUsers] = useState<Profile[]>([]);
  const [rolesByUser, setRolesByUser] = useState<Record<string, Role[]>>({});
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);
  const [q, setQ] = useState("");
  const grant = useServerFn(grantRole);
  const revoke = useServerFn(revokeRole);

  const load = async () => {
    const [{ data: p }, { data: r }, { data: d }] = await Promise.all([
      supabase.from("profiles").select("id, email, full_name, department_id").order("created_at", { ascending: false }).limit(200),
      supabase.from("user_roles").select("user_id, role"),
      supabase.from("departments").select("id, name"),
    ]);
    setUsers((p as Profile[]) || []);
    setDepartments((d as any[]) || []);
    const map: Record<string, Role[]> = {};
    ((r as UserRoleRow[]) || []).forEach((row) => {
      map[row.user_id] = [...(map[row.user_id] || []), row.role];
    });
    setRolesByUser(map);
  };
  useEffect(() => { load(); }, []);

  const filtered = users.filter((u) => {
    const t = q.toLowerCase();
    return !t || u.email.toLowerCase().includes(t) || (u.full_name || "").toLowerCase().includes(t);
  });

  return (
    <Card className="p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-bold">Users & Roles</h3>
        <Input className="w-64" placeholder="Search name or email…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      {filtered.length === 0 ? (
        <div className="text-sm text-muted-foreground">No users.</div>
      ) : (
        <div className="grid gap-2">
          {filtered.map((u) => (
            <UserRow key={u.id} user={u} roles={rolesByUser[u.id] || []} departments={departments}
              isSuper={isSuper}
              onGrant={async (role, dept) => { try { await grant({ data: { user_id: u.id, role, department_id: dept } }); toast.success("Role granted"); load(); } catch (e: any) { toast.error(e.message); } }}
              onRevoke={async (role) => { try { await revoke({ data: { user_id: u.id, role } }); toast.success("Revoked"); load(); } catch (e: any) { toast.error(e.message); } }}
            />
          ))}
        </div>
      )}
    </Card>
  );
}

function UserRow({ user, roles, departments, isSuper, onGrant, onRevoke }: {
  user: Profile; roles: Role[]; departments: { id: string; name: string }[]; isSuper: boolean;
  onGrant: (role: Role, dept: string | null) => void; onRevoke: (role: Role) => void;
}) {
  const [newRole, setNewRole] = useState<Role | "">("");
  const [dept, setDept] = useState<string>(user.department_id || "");
  const sensitive = (r: Role) => r === "admin" || r === "super_admin" || r === "finance";
  const grantable: Role[] = isSuper ? [...ROLES] : ROLES.filter((r) => !sensitive(r));
  return (
    <div className="rounded-lg border border-border p-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="font-semibold">{user.full_name || user.email}</div>
          <div className="text-xs text-muted-foreground">{user.email}</div>
          <div className="mt-1 flex flex-wrap gap-1">
            {roles.length === 0 && <Badge variant="outline">No roles</Badge>}
            {roles.map((r) => (
              <Badge key={r} className="flex items-center gap-1" variant="secondary">
                {r}
                {(!sensitive(r) || isSuper) && (
                  <button onClick={() => onRevoke(r)} className="ml-1 text-muted-foreground hover:text-destructive" title="Revoke">×</button>
                )}
              </Badge>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={newRole} onValueChange={(v) => setNewRole(v as Role)}>
            <SelectTrigger className="w-36"><SelectValue placeholder="Grant role" /></SelectTrigger>
            <SelectContent>
              {grantable.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={dept} onValueChange={setDept}>
            <SelectTrigger className="w-44"><SelectValue placeholder="Department" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">— none —</SelectItem>
              {departments.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button size="sm" disabled={!newRole} onClick={() => {
            if (!newRole) return;
            onGrant(newRole as Role, dept && dept !== "none" ? dept : null);
            setNewRole("");
          }}>Apply</Button>
        </div>
      </div>
    </div>
  );
}

type Department = { id: string; slug: string; name: string; description: string | null; hod_id: string | null };

function DepartmentsTab({ isSuper }: { isSuper: boolean }) {
  const [rows, setRows] = useState<Department[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Department | null>(null);
  const [form, setForm] = useState({ slug: "", name: "", description: "", hod_id: "" });
  const [hods, setHods] = useState<{ id: string; full_name: string | null; email: string }[]>([]);
  const upsert = useServerFn(upsertDepartment);
  const del = useServerFn(deleteDepartment);

  const load = async () => {
    const { data } = await supabase.from("departments").select("*").order("name");
    setRows((data as Department[]) || []);
    const { data: ur } = await supabase.from("user_roles").select("user_id").eq("role", "hod");
    const ids = (ur || []).map((r: any) => r.user_id);
    if (ids.length) {
      const { data: ps } = await supabase.from("profiles").select("id, full_name, email").in("id", ids);
      setHods((ps as any) || []);
    } else setHods([]);
  };
  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing(null); setForm({ slug: "", name: "", description: "", hod_id: "" }); setOpen(true); };
  const openEdit = (d: Department) => { setEditing(d); setForm({ slug: d.slug, name: d.name, description: d.description || "", hod_id: d.hod_id || "" }); setOpen(true); };

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold">Departments</h3>
        <Button size="sm" onClick={openNew}><Plus className="mr-1 h-4 w-4" /> New department</Button>
      </div>
      {rows.length === 0 ? (
        <div className="text-sm text-muted-foreground">No departments.</div>
      ) : (
        <div className="grid gap-2">
          {rows.map((d) => (
            <div key={d.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border p-3">
              <div>
                <div className="font-semibold">{d.name} <span className="text-xs text-muted-foreground">/{d.slug}</span></div>
                {d.description && <div className="text-xs text-muted-foreground">{d.description}</div>}
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => openEdit(d)}>Edit</Button>
                {isSuper && (
                  <Button size="sm" variant="destructive" onClick={async () => {
                    if (!confirm(`Delete ${d.name}?`)) return;
                    try { await del({ data: { id: d.id } }); toast.success("Deleted"); load(); } catch (e: any) { toast.error(e.message); }
                  }}><Trash2 className="h-4 w-4" /></Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Edit department" : "New department"}</DialogTitle></DialogHeader>
          <form className="grid gap-3" onSubmit={async (e) => {
            e.preventDefault();
            try {
              await upsert({ data: {
                id: editing?.id,
                slug: form.slug, name: form.name,
                description: form.description || undefined,
                hod_id: form.hod_id || null,
              } });
              toast.success("Saved"); setOpen(false); load();
            } catch (er: any) { toast.error(er.message); }
          }}>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Slug</Label><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required /></div>
              <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
            </div>
            <div><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div>
              <Label>HOD</Label>
              <Select value={form.hod_id || "none"} onValueChange={(v) => setForm({ ...form, hod_id: v === "none" ? "" : v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">— none —</SelectItem>
                  {hods.map((h) => <SelectItem key={h.id} value={h.id}>{h.full_name || h.email}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter><Button type="submit">Save</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function ActivityTab() {
  const [events, setEvents] = useState<any[]>([]);
  useEffect(() => {
    supabase.from("task_events").select("*").order("created_at", { ascending: false }).limit(100)
      .then(({ data }) => setEvents(data || []));
  }, []);
  return (
    <Card className="p-6">
      <h3 className="mb-4 text-lg font-bold">Recent task events</h3>
      {events.length === 0 ? (
        <div className="text-sm text-muted-foreground">No events.</div>
      ) : (
        <div className="grid gap-1 text-sm">
          {events.map((e) => (
            <div key={e.id} className="grid grid-cols-12 gap-2 border-b border-border py-2">
              <div className="col-span-3 text-muted-foreground">{new Date(e.created_at).toLocaleString()}</div>
              <div className="col-span-2"><Badge variant="outline">{e.type}</Badge></div>
              <div className="col-span-7 truncate text-muted-foreground">{JSON.stringify(e.payload)}</div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function PlatformTab() {
  return (
    <Card className="p-6">
      <h3 className="mb-2 text-lg font-bold">Platform controls</h3>
      <p className="text-sm text-muted-foreground">
        Sensitive controls live here. Only Super Admins can grant Admin, Super Admin, or Finance roles
        or delete departments. Audit trails are recorded in <code>task_events</code> and
        <code> finance_ledger</code>.
      </p>
    </Card>
  );
}