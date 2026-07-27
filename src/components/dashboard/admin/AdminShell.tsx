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
import { updateSetting, deleteSetting, upsertSitePage, deleteSitePage, sendBroadcast } from "@/lib/admin/platform.functions";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CaseStudiesPanel } from "@/components/dashboard/admin/CaseStudiesPanel";
import { CmsPanel } from "@/components/dashboard/admin/CmsPanels";

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
      {tab === "overview" && <Overview isSuper={isSuper} />}
      {tab === "users" && <UsersTab isSuper={isSuper} />}
      {tab === "departments" && <DepartmentsTab isSuper={isSuper} />}
      {tab === "activity" && <ActivityTab />}
      {tab === "platform" && isSuper && <PlatformTab />}
    </DashboardShell>
  );
}

function Overview({ isSuper = false }: { isSuper?: boolean }) {
  const [s, setS] = useState({ users: 0, tasks: 0, courses: 0, enrollments: 0, payments: 0 });
  useEffect(() => {
    (async () => {
      if (isSuper) {
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
      } else {
        // Bureau-only Admin: never surface Academy stats
        const [u, t, p] = await Promise.all([
          supabase.from("profiles").select("id", { count: "exact", head: true }),
          supabase.from("tasks").select("id", { count: "exact", head: true }),
          supabase.from("payments").select("id", { count: "exact", head: true }).eq("status", "paid"),
        ]);
        setS({
          users: u.count ?? 0, tasks: t.count ?? 0, courses: 0,
          enrollments: 0, payments: p.count ?? 0,
        });
      }
    })();
  }, [isSuper]);
  const cards = isSuper
    ? [
        { label: "Users", value: s.users },
        { label: "Tasks", value: s.tasks },
        { label: "Courses", value: s.courses },
        { label: "Enrollments", value: s.enrollments },
        { label: "Paid orders", value: s.payments },
      ]
    : [
        { label: "Users", value: s.users },
        { label: "Bureau tasks", value: s.tasks },
        { label: "Paid orders", value: s.payments },
      ];
  return (
    <div className={`grid gap-4 sm:grid-cols-2 ${isSuper ? "lg:grid-cols-5" : "lg:grid-cols-3"}`}>
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
  // Non-super Admins are Bureau-only: can manage clients, talents, PMs.
  // Academy roles (student, instructor, hod) are Super Admin-only.
  const bureauOnly: Role[] = ["client", "talent", "pm"];
  const grantable: Role[] = isSuper ? [...ROLES] : bureauOnly;
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
    <Tabs defaultValue="settings" className="space-y-4">
      <TabsList>
        <TabsTrigger value="settings">Settings</TabsTrigger>
        <TabsTrigger value="permissions">Permissions</TabsTrigger>
        <TabsTrigger value="content">Pages</TabsTrigger>
        <TabsTrigger value="cms">CMS</TabsTrigger>
        <TabsTrigger value="case-studies">Case Studies</TabsTrigger>
        <TabsTrigger value="broadcasts">Broadcasts</TabsTrigger>
      </TabsList>
      <TabsContent value="settings"><SettingsPanel /></TabsContent>
      <TabsContent value="permissions"><PermissionsPanel /></TabsContent>
      <TabsContent value="content"><ContentPanel /></TabsContent>
      <TabsContent value="cms"><CmsPanel /></TabsContent>
      <TabsContent value="case-studies"><CaseStudiesPanel /></TabsContent>
      <TabsContent value="broadcasts"><BroadcastsPanel /></TabsContent>
    </Tabs>
  );
}

// ============= Settings =============
type Setting = { key: string; value: any; description: string | null };

function SettingsPanel() {
  const [rows, setRows] = useState<Setting[]>([]);
  const [newKey, setNewKey] = useState("");
  const [newVal, setNewVal] = useState("");
  const upd = useServerFn(updateSetting);
  const del = useServerFn(deleteSetting);

  const load = async () => {
    const { data } = await supabase.from("platform_settings").select("*").order("key");
    setRows((data as Setting[]) || []);
  };
  useEffect(() => { load(); }, []);

  const save = async (s: Setting, raw: string) => {
    let parsed: any = raw;
    try { parsed = JSON.parse(raw); } catch { /* keep as string */ }
    try { await upd({ data: { key: s.key, value: parsed, description: s.description ?? undefined } }); toast.success("Saved"); load(); }
    catch (e: any) { toast.error(e.message); }
  };

  return (
    <Card className="p-6">
      <h3 className="mb-1 text-lg font-bold">Platform settings</h3>
      <p className="mb-4 text-xs text-muted-foreground">Values are stored as JSON. Strings need quotes, booleans use <code>true</code>/<code>false</code>.</p>
      <div className="grid gap-3">
        {rows.map((s) => (
          <SettingRow key={s.key} setting={s} onSave={(v) => save(s, v)} onDelete={async () => {
            if (!confirm(`Delete ${s.key}?`)) return;
            try { await del({ data: { key: s.key } }); toast.success("Deleted"); load(); } catch (e: any) { toast.error(e.message); }
          }} />
        ))}
      </div>
      <div className="mt-6 rounded-lg border border-dashed border-border p-4">
        <div className="mb-2 text-sm font-semibold">Add setting</div>
        <div className="flex flex-wrap gap-2">
          <Input className="w-56" placeholder="namespace.key" value={newKey} onChange={(e) => setNewKey(e.target.value)} />
          <Input className="flex-1 min-w-[200px] font-mono text-xs" placeholder='JSON value, e.g. "hello" or 42 or true' value={newVal} onChange={(e) => setNewVal(e.target.value)} />
          <Button onClick={async () => {
            if (!newKey) return;
            let parsed: any = newVal;
            try { parsed = JSON.parse(newVal); } catch { /* string */ }
            try { await upd({ data: { key: newKey, value: parsed } }); toast.success("Added"); setNewKey(""); setNewVal(""); load(); }
            catch (e: any) { toast.error(e.message); }
          }}>Add</Button>
        </div>
      </div>
    </Card>
  );
}

function SettingRow({ setting, onSave, onDelete }: { setting: Setting; onSave: (v: string) => void; onDelete: () => void }) {
  const initial = JSON.stringify(setting.value);
  const [val, setVal] = useState(initial);
  const isBool = typeof setting.value === "boolean";
  return (
    <div className="grid gap-2 rounded-lg border border-border p-3 sm:grid-cols-[1fr_auto]">
      <div>
        <div className="font-mono text-sm font-semibold">{setting.key}</div>
        {setting.description && <div className="text-xs text-muted-foreground">{setting.description}</div>}
        <div className="mt-2 flex items-center gap-2">
          {isBool ? (
            <>
              <Switch checked={val === "true"} onCheckedChange={(c) => setVal(c ? "true" : "false")} />
              <span className="text-xs text-muted-foreground">{val}</span>
            </>
          ) : (
            <Input className="font-mono text-xs" value={val} onChange={(e) => setVal(e.target.value)} />
          )}
        </div>
      </div>
      <div className="flex items-end gap-2">
        <Button size="sm" onClick={() => onSave(val)} disabled={val === initial}>Save</Button>
        <Button size="sm" variant="outline" onClick={onDelete}><Trash2 className="h-4 w-4" /></Button>
      </div>
    </div>
  );
}

// ============= Permissions =============
function PermissionsPanel() {
  const matrix: Array<{ area: string; client?: boolean; talent?: boolean; student?: boolean; instructor?: boolean; pm?: boolean; hod?: boolean; finance?: boolean; admin?: boolean; super_admin?: boolean }> = [
    { area: "Submit tasks",       client: true, admin: true, super_admin: true },
    { area: "Accept tasks",       talent: true, admin: true, super_admin: true },
    { area: "Browse academy",     client: true, talent: true, student: true, instructor: true, pm: true, hod: true, finance: true, admin: true, super_admin: true },
    { area: "Author courses",     instructor: true, hod: true, admin: true, super_admin: true },
    { area: "Assign talent",      pm: true, admin: true, super_admin: true },
    { area: "Approve invoices",   finance: true, super_admin: true },
    { area: "Run payroll",        finance: true, super_admin: true },
    { area: "Manage users/roles", admin: true, super_admin: true },
    { area: "Grant admin/finance", super_admin: true },
    { area: "Edit platform settings", super_admin: true },
    { area: "Send broadcasts",    super_admin: true },
  ];
  const cols: Array<{ k: keyof (typeof matrix)[number]; label: string }> = [
    { k: "client", label: "Client" }, { k: "talent", label: "Talent" }, { k: "student", label: "Student" },
    { k: "instructor", label: "Instructor" }, { k: "pm", label: "PM" }, { k: "hod", label: "HOD" },
    { k: "finance", label: "Finance" }, { k: "admin", label: "Admin" }, { k: "super_admin", label: "Super" },
  ];
  return (
    <Card className="p-6 overflow-x-auto">
      <h3 className="mb-3 text-lg font-bold">Role permissions</h3>
      <table className="w-full min-w-[700px] text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs uppercase text-muted-foreground">
            <th className="py-2">Capability</th>
            {cols.map((c) => <th key={String(c.k)} className="px-2 py-2 text-center">{c.label}</th>)}
          </tr>
        </thead>
        <tbody>
          {matrix.map((row) => (
            <tr key={row.area} className="border-b border-border/60">
              <td className="py-2 font-medium">{row.area}</td>
              {cols.map((c) => (
                <td key={String(c.k)} className="px-2 py-2 text-center">
                  {row[c.k] ? <span className="text-primary">●</span> : <span className="text-muted-foreground/30">○</span>}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-3 text-xs text-muted-foreground">Capabilities are enforced by RLS + server-function guards. This matrix documents intent for ops review.</p>
    </Card>
  );
}

// ============= Content (site pages) =============
type SitePage = { slug: string; title: string; blocks: any[]; published: boolean; updated_at: string };

function ContentPanel() {
  const [rows, setRows] = useState<SitePage[]>([]);
  const [editing, setEditing] = useState<SitePage | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ slug: "", title: "", blocks: "[]", published: true });
  const upsert = useServerFn(upsertSitePage);
  const del = useServerFn(deleteSitePage);

  const load = async () => {
    const { data } = await supabase.from("site_pages").select("*").order("slug");
    setRows((data as SitePage[]) || []);
  };
  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing(null); setForm({ slug: "", title: "", blocks: "[]", published: true }); setOpen(true); };
  const openEdit = (p: SitePage) => { setEditing(p); setForm({ slug: p.slug, title: p.title, blocks: JSON.stringify(p.blocks, null, 2), published: p.published }); setOpen(true); };

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold">Site content</h3>
        <Button size="sm" onClick={openNew}><Plus className="mr-1 h-4 w-4" /> New page</Button>
      </div>
      {rows.length === 0 ? (
        <div className="text-sm text-muted-foreground">No pages yet. Create one to power editable marketing blocks.</div>
      ) : (
        <div className="grid gap-2">
          {rows.map((p) => (
            <div key={p.slug} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border p-3">
              <div>
                <div className="font-semibold">{p.title} <span className="text-xs text-muted-foreground">/{p.slug}</span></div>
                <div className="text-xs text-muted-foreground">
                  {p.blocks?.length || 0} blocks · {p.published ? "Published" : "Draft"} · updated {new Date(p.updated_at).toLocaleDateString()}
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => openEdit(p)}>Edit</Button>
                <Button size="sm" variant="destructive" onClick={async () => {
                  if (!confirm(`Delete ${p.slug}?`)) return;
                  try { await del({ data: { slug: p.slug } }); toast.success("Deleted"); load(); } catch (e: any) { toast.error(e.message); }
                }}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{editing ? `Edit /${editing.slug}` : "New page"}</DialogTitle></DialogHeader>
          <form className="grid gap-3" onSubmit={async (e) => {
            e.preventDefault();
            let blocks: any[] = [];
            try { blocks = JSON.parse(form.blocks); if (!Array.isArray(blocks)) throw new Error(); }
            catch { toast.error("Blocks must be a JSON array"); return; }
            try {
              await upsert({ data: { slug: form.slug, title: form.title, blocks, published: form.published } });
              toast.success("Saved"); setOpen(false); load();
            } catch (er: any) { toast.error(er.message); }
          }}>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Slug</Label><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required disabled={!!editing} /></div>
              <div><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></div>
            </div>
            <div>
              <Label>Blocks (JSON array)</Label>
              <Textarea className="font-mono text-xs min-h-[220px]" value={form.blocks} onChange={(e) => setForm({ ...form, blocks: e.target.value })} />
              <p className="mt-1 text-xs text-muted-foreground">Each block is an object, e.g. {`{"kind":"hero","heading":"...","body":"..."}`}.</p>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.published} onCheckedChange={(c) => setForm({ ...form, published: c })} />
              <Label>Published</Label>
            </div>
            <DialogFooter><Button type="submit">Save</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

// ============= Broadcasts =============
type Broadcast = { id: string; title: string; body: string; audience: string[]; channels: string[]; status: string; sent_at: string | null; recipient_count: number; created_at: string };

function BroadcastsPanel() {
  const [rows, setRows] = useState<Broadcast[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", body: "", audience: ["all"] as string[], channels: ["in_app"] as string[] });
  const send = useServerFn(sendBroadcast);

  const load = async () => {
    const { data } = await supabase.from("broadcasts").select("*").order("created_at", { ascending: false }).limit(50);
    setRows((data as Broadcast[]) || []);
  };
  useEffect(() => { load(); }, []);

  const AUD = ["all","client","talent","student","instructor","pm","hod","finance","admin","super_admin"];
  const toggle = (key: "audience" | "channels", v: string) => {
    setForm((f) => {
      const cur = f[key];
      return { ...f, [key]: cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v] };
    });
  };

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold">Broadcasts</h3>
        <Button size="sm" onClick={() => { setForm({ title: "", body: "", audience: ["all"], channels: ["in_app"] }); setOpen(true); }}>
          <Plus className="mr-1 h-4 w-4" /> New broadcast
        </Button>
      </div>
      {rows.length === 0 ? (
        <div className="text-sm text-muted-foreground">No broadcasts sent yet.</div>
      ) : (
        <div className="grid gap-2">
          {rows.map((b) => (
            <div key={b.id} className="rounded-lg border border-border p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="font-semibold">{b.title}</div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{b.status}</Badge>
                  <span className="text-xs text-muted-foreground">{b.recipient_count} recipients</span>
                </div>
              </div>
              <div className="mt-1 text-sm text-muted-foreground line-clamp-2">{b.body}</div>
              <div className="mt-2 flex flex-wrap gap-1 text-xs">
                {b.audience.map((a) => <Badge key={a} variant="secondary">{a}</Badge>)}
                {b.channels.map((c) => <Badge key={c} variant="outline">{c}</Badge>)}
                <span className="ml-auto text-muted-foreground">
                  {b.sent_at ? new Date(b.sent_at).toLocaleString() : new Date(b.created_at).toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>New broadcast</DialogTitle></DialogHeader>
          <form className="grid gap-3" onSubmit={async (e) => {
            e.preventDefault();
            if (form.audience.length === 0) { toast.error("Pick at least one audience"); return; }
            if (form.channels.length === 0) { toast.error("Pick at least one channel"); return; }
            try {
              const res = await send({ data: form as any });
              toast.success(`Sent to ${res.recipients} users`);
              setOpen(false); load();
            } catch (er: any) { toast.error(er.message); }
          }}>
            <div><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required maxLength={160} /></div>
            <div><Label>Body</Label><Textarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} required maxLength={4000} className="min-h-[120px]" /></div>
            <div>
              <Label>Audience</Label>
              <div className="mt-1 flex flex-wrap gap-1">
                {AUD.map((a) => (
                  <button type="button" key={a} onClick={() => toggle("audience", a)}
                    className={`rounded-full border px-3 py-1 text-xs ${form.audience.includes(a) ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"}`}>
                    {a}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label>Channels</Label>
              <div className="mt-1 flex flex-wrap gap-1">
                {["in_app","email"].map((c) => (
                  <button type="button" key={c} onClick={() => toggle("channels", c)}
                    className={`rounded-full border px-3 py-1 text-xs ${form.channels.includes(c) ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"}`}>
                    {c}
                  </button>
                ))}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">In-app notifications deliver instantly. Email fan-out runs through the notify pipeline.</p>
            </div>
            <DialogFooter><Button type="submit">Send broadcast</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}