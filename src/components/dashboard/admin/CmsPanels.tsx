import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Plus, Trash2, Edit2 } from "lucide-react";
import { toast } from "sonner";

// ============ Umbrella panel ============
export function CmsPanel() {
  return (
    <Tabs defaultValue="homepage" className="space-y-4">
      <TabsList className="flex flex-wrap">
        <TabsTrigger value="homepage">Homepage</TabsTrigger>
        <TabsTrigger value="stats">Stats</TabsTrigger>
        <TabsTrigger value="services">Services</TabsTrigger>
        <TabsTrigger value="team">Team</TabsTrigger>
        <TabsTrigger value="faq">FAQ</TabsTrigger>
        <TabsTrigger value="jobs">Careers</TabsTrigger>
        <TabsTrigger value="chat">AI Chat</TabsTrigger>
      </TabsList>
      <TabsContent value="homepage"><SiteContentPanel /></TabsContent>
      <TabsContent value="stats"><StatsPanel /></TabsContent>
      <TabsContent value="services"><ServicesPanel /></TabsContent>
      <TabsContent value="team"><TeamPanel /></TabsContent>
      <TabsContent value="faq"><FaqPanel /></TabsContent>
      <TabsContent value="jobs"><JobsPanel /></TabsContent>
      <TabsContent value="chat"><ChatSettingsPanel /></TabsContent>
    </Tabs>
  );
}

// ============ Homepage / Site Content (key/value JSON) ============
type SiteContentRow = { key: string; value: unknown };
function SiteContentPanel() {
  const [rows, setRows] = useState<SiteContentRow[]>([]);
  const [k, setK] = useState("");
  const [v, setV] = useState("");
  const load = async () => {
    const { data } = await supabase.from("site_content").select("*").order("key");
    setRows((data as SiteContentRow[]) || []);
  };
  useEffect(() => { load(); }, []);
  const save = async (key: string, raw: string) => {
    let value: unknown = raw;
    try { value = JSON.parse(raw); } catch { /* keep string */ }
    const { error } = await supabase.from("site_content").upsert({ key, value: value as any });
    if (error) return toast.error(error.message);
    toast.success("Saved"); load();
  };
  const remove = async (key: string) => {
    if (!confirm(`Delete ${key}?`)) return;
    const { error } = await supabase.from("site_content").delete().eq("key", key);
    if (error) return toast.error(error.message);
    load();
  };
  return (
    <Card className="p-6 space-y-4">
      <div>
        <h3 className="text-lg font-bold">Homepage / Site copy (key/value)</h3>
        <p className="text-xs text-muted-foreground">Values can be plain text or JSON. Common keys: <code>hero_headline</code>, <code>hero_subheadline</code>, <code>cta_primary</code>, <code>about_intro</code>.</p>
      </div>
      <div className="grid gap-2">
        {rows.map((r) => (
          <SiteContentRowEditor key={r.key} row={r} onSave={save} onDelete={remove} />
        ))}
      </div>
      <div className="rounded-lg border p-3 space-y-2">
        <div className="text-sm font-semibold">New entry</div>
        <div className="grid gap-2 sm:grid-cols-[200px_1fr_auto]">
          <Input placeholder="key (e.g. hero_headline)" value={k} onChange={(e) => setK(e.target.value)} />
          <Textarea rows={2} placeholder="value (text or JSON)" value={v} onChange={(e) => setV(e.target.value)} />
          <Button onClick={() => { if (!k.trim()) return; save(k.trim(), v); setK(""); setV(""); }}>Add</Button>
        </div>
      </div>
    </Card>
  );
}
function SiteContentRowEditor({ row, onSave, onDelete }: { row: SiteContentRow; onSave: (k: string, v: string) => void; onDelete: (k: string) => void }) {
  const [val, setVal] = useState(typeof row.value === "string" ? row.value : JSON.stringify(row.value, null, 2));
  return (
    <div className="rounded-lg border p-3">
      <div className="flex items-center justify-between mb-1">
        <div className="font-mono text-xs">{row.key}</div>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => onSave(row.key, val)}>Save</Button>
          <Button size="sm" variant="destructive" onClick={() => onDelete(row.key)}><Trash2 className="h-3 w-3" /></Button>
        </div>
      </div>
      <Textarea rows={2} value={val} onChange={(e) => setVal(e.target.value)} />
    </div>
  );
}

// ============ Generic list panel helper ============
type Field = {
  name: string; label: string;
  type?: "text" | "textarea" | "number" | "bool" | "url" | "email";
  rows?: number; placeholder?: string; halfWidth?: boolean;
};
function useList<T extends { id: string; display_order?: number | null }>(table: string, orderBy = "display_order") {
  const [rows, setRows] = useState<T[]>([]);
  const load = async () => {
    const { data } = await supabase.from(table as any).select("*").order(orderBy, { ascending: true, nullsFirst: false });
    setRows((data as unknown as T[]) || []);
  };
  useEffect(() => { load(); }, []);
  return { rows, load };
}

function ListPanel<T extends { id: string; published?: boolean | null }>({
  title, table, fields, titleField, subtitleFn, orderBy = "display_order",
}: {
  title: string; table: string; fields: Field[];
  titleField: keyof T; subtitleFn?: (r: T) => string;
  orderBy?: string;
}) {
  const { rows, load } = useList<T & Record<string, any>>(table, orderBy);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Record<string, any>>({});
  const openNew = () => { setForm({ published: true, display_order: rows.length }); setOpen(true); };
  const openEdit = (r: any) => { setForm({ ...r }); setOpen(true); };
  const save = async () => {
    const payload = { ...form };
    delete payload.created_at; delete payload.updated_at;
    const { error } = await supabase.from(table as any).upsert(payload);
    if (error) return toast.error(error.message);
    toast.success("Saved"); setOpen(false); load();
  };
  const remove = async (id: string) => {
    if (!confirm("Delete this item?")) return;
    const { error } = await supabase.from(table as any).delete().eq("id", id);
    if (error) return toast.error(error.message);
    load();
  };
  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold">{title}</h3>
        <Button size="sm" onClick={openNew}><Plus className="mr-1 h-4 w-4" /> New</Button>
      </div>
      {rows.length === 0 ? <div className="text-sm text-muted-foreground">Empty.</div> : (
        <div className="grid gap-2">
          {rows.map((r: any) => (
            <div key={r.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold truncate">{String(r[titleField as string] ?? "—")}</span>
                  {"published" in r && <Badge variant={r.published ? "default" : "outline"}>{r.published ? "Live" : "Draft"}</Badge>}
                </div>
                {subtitleFn && <div className="text-xs text-muted-foreground truncate">{subtitleFn(r)}</div>}
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => openEdit(r)}><Edit2 className="h-4 w-4" /></Button>
                <Button size="sm" variant="destructive" onClick={() => remove(r.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader><DialogTitle>{form.id ? `Edit ${title}` : `New ${title}`}</DialogTitle></DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            {fields.map((f) => (
              <div key={f.name} className={f.halfWidth ? "" : "sm:col-span-2"}>
                <Label>{f.label}</Label>
                {f.type === "bool" ? (
                  <div className="flex items-center gap-2 pt-2"><Switch checked={!!form[f.name]} onCheckedChange={(v) => setForm({ ...form, [f.name]: v })} /></div>
                ) : f.type === "textarea" ? (
                  <Textarea rows={f.rows ?? 3} value={form[f.name] ?? ""} onChange={(e) => setForm({ ...form, [f.name]: e.target.value })} placeholder={f.placeholder} />
                ) : f.type === "number" ? (
                  <Input type="number" value={form[f.name] ?? ""} onChange={(e) => setForm({ ...form, [f.name]: e.target.value === "" ? null : Number(e.target.value) })} />
                ) : (
                  <Input type={f.type === "email" ? "email" : f.type === "url" ? "url" : "text"}
                    value={form[f.name] ?? ""} onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                    placeholder={f.placeholder} />
                )}
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

// ============ Concrete panels ============
function StatsPanel() {
  return <ListPanel title="Homepage Stats" table="homepage_stats" titleField="label"
    subtitleFn={(r: any) => `${r.value ?? ""}${r.suffix ?? ""} · order ${r.display_order ?? 0}`}
    fields={[
      { name: "label", label: "Label", halfWidth: true },
      { name: "value", label: "Value", halfWidth: true },
      { name: "suffix", label: "Suffix (e.g. +, %)", halfWidth: true },
      { name: "display_order", label: "Display order", type: "number", halfWidth: true },
      { name: "published", label: "Published", type: "bool", halfWidth: true },
    ]} />;
}
function ServicesPanel() {
  return <ListPanel title="Services" table="services" titleField="name"
    subtitleFn={(r: any) => `${r.slug} · ${r.starting_price ?? ""}`}
    fields={[
      { name: "slug", label: "Slug", halfWidth: true },
      { name: "name", label: "Name", halfWidth: true },
      { name: "icon", label: "Icon (lucide name)", halfWidth: true },
      { name: "image_url", label: "Image URL", type: "url", halfWidth: true },
      { name: "short_description", label: "Short description", type: "textarea", rows: 2 },
      { name: "long_description", label: "Long description (markdown)", type: "textarea", rows: 6 },
      { name: "starting_price", label: "Starting price", halfWidth: true },
      { name: "display_order", label: "Display order", type: "number", halfWidth: true },
      { name: "featured", label: "Featured", type: "bool", halfWidth: true },
      { name: "published", label: "Published", type: "bool", halfWidth: true },
    ]} />;
}
function TeamPanel() {
  return <ListPanel title="Team Members" table="team_members" titleField="full_name"
    subtitleFn={(r: any) => `${r.role ?? ""} · ${r.department ?? ""}`}
    fields={[
      { name: "full_name", label: "Full name", halfWidth: true },
      { name: "role", label: "Role / title", halfWidth: true },
      { name: "department", label: "Department", halfWidth: true },
      { name: "email", label: "Email", type: "email", halfWidth: true },
      { name: "photo_url", label: "Photo URL", type: "url", halfWidth: true },
      { name: "linkedin_url", label: "LinkedIn URL", type: "url", halfWidth: true },
      { name: "bio_short", label: "Short bio", type: "textarea", rows: 2 },
      { name: "bio_long", label: "Long bio (markdown)", type: "textarea", rows: 5 },
      { name: "display_order", label: "Display order", type: "number", halfWidth: true },
      { name: "featured_home", label: "Featured on homepage", type: "bool", halfWidth: true },
      { name: "published", label: "Published", type: "bool", halfWidth: true },
    ]} />;
}
function FaqPanel() {
  return <ListPanel title="FAQ" table="faq_items" titleField="question"
    subtitleFn={(r: any) => `${r.category ?? ""} · order ${r.display_order ?? 0}`}
    fields={[
      { name: "question", label: "Question" },
      { name: "answer", label: "Answer (markdown)", type: "textarea", rows: 5 },
      { name: "category", label: "Category", halfWidth: true },
      { name: "display_order", label: "Display order", type: "number", halfWidth: true },
      { name: "featured_home", label: "Featured on homepage", type: "bool", halfWidth: true },
      { name: "published", label: "Published", type: "bool", halfWidth: true },
    ]} />;
}
function JobsPanel() {
  return <ListPanel title="Job Openings" table="job_openings" titleField="title"
    subtitleFn={(r: any) => `${r.department ?? ""} · ${r.location ?? ""} · ${r.status ?? ""}`}
    fields={[
      { name: "slug", label: "Slug", halfWidth: true },
      { name: "title", label: "Title", halfWidth: true },
      { name: "department", label: "Department", halfWidth: true },
      { name: "location", label: "Location", halfWidth: true },
      { name: "employment_type", label: "Employment type", halfWidth: true },
      { name: "salary_range", label: "Salary range", halfWidth: true },
      { name: "status", label: "Status (open/closed)", halfWidth: true },
      { name: "display_order", label: "Display order", type: "number", halfWidth: true },
      { name: "description", label: "Description (markdown)", type: "textarea", rows: 4 },
      { name: "responsibilities", label: "Responsibilities", type: "textarea", rows: 4 },
      { name: "requirements", label: "Requirements", type: "textarea", rows: 4 },
      { name: "published", label: "Published", type: "bool", halfWidth: true },
    ]} />;
}

// ============ Chat settings ============
function ChatSettingsPanel() {
  const [row, setRow] = useState<any>({ id: 1, enabled: true, system_prompt: "", welcome_message: "", position: "bottom-right", color_theme: "primary", quick_replies: [] });
  const [qrText, setQrText] = useState("");
  useEffect(() => {
    supabase.from("chat_settings").select("*").eq("id", 1).maybeSingle().then(({ data }) => {
      if (data) {
        setRow(data);
        setQrText((data.quick_replies as string[] | null ?? []).join("\n"));
      }
    });
  }, []);
  const save = async () => {
    const quick = qrText.split("\n").map((s) => s.trim()).filter(Boolean);
    const { error } = await supabase.from("chat_settings").upsert({ ...row, id: 1, quick_replies: quick });
    if (error) return toast.error(error.message);
    toast.success("Chat settings saved");
  };
  return (
    <Card className="p-6 space-y-4">
      <h3 className="text-lg font-bold">AI Chat Widget</h3>
      <div className="flex items-center gap-2">
        <Switch checked={!!row.enabled} onCheckedChange={(v) => setRow({ ...row, enabled: v })} />
        <Label>Enabled</Label>
      </div>
      <div>
        <Label>Welcome message</Label>
        <Textarea rows={2} value={row.welcome_message ?? ""} onChange={(e) => setRow({ ...row, welcome_message: e.target.value })} />
      </div>
      <div>
        <Label>System prompt (leave blank for default NDH prompt)</Label>
        <Textarea rows={8} value={row.system_prompt ?? ""} onChange={(e) => setRow({ ...row, system_prompt: e.target.value })} />
      </div>
      <div>
        <Label>Quick replies (one per line)</Label>
        <Textarea rows={4} value={qrText} onChange={(e) => setQrText(e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><Label>Position</Label><Input value={row.position ?? "bottom-right"} onChange={(e) => setRow({ ...row, position: e.target.value })} /></div>
        <div><Label>Color theme</Label><Input value={row.color_theme ?? "primary"} onChange={(e) => setRow({ ...row, color_theme: e.target.value })} /></div>
      </div>
      <Button onClick={save}>Save chat settings</Button>
    </Card>
  );
}