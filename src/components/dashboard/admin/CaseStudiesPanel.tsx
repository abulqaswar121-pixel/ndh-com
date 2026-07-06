import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { listAllCaseStudies, upsertCaseStudy, deleteCaseStudy } from "@/lib/content/case-studies.functions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Edit2 } from "lucide-react";
import { toast } from "sonner";

type Row = {
  id: string; slug: string; title: string; client_name: string | null; industry: string | null;
  summary: string; challenge: string | null; solution: string | null; results: string | null;
  cover_image: string | null; tags: string[] | null; services: string[] | null;
  published: boolean; published_at: string | null;
};

const empty = {
  id: undefined as string | undefined, slug: "", title: "", client_name: "", industry: "",
  summary: "", challenge: "", solution: "", results: "", cover_image: "",
  tags: "", services: "", published: false,
};

export function CaseStudiesPanel() {
  const [rows, setRows] = useState<Row[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ ...empty });
  const listFn = useServerFn(listAllCaseStudies);
  const upsertFn = useServerFn(upsertCaseStudy);
  const deleteFn = useServerFn(deleteCaseStudy);

  const load = async () => {
    try { setRows((await listFn()) as Row[]); }
    catch (e) { toast.error((e as Error).message); }
  };
  useEffect(() => { load(); }, []);

  const openNew = () => { setForm({ ...empty }); setOpen(true); };
  const openEdit = (r: Row) => {
    setForm({
      id: r.id, slug: r.slug, title: r.title,
      client_name: r.client_name ?? "", industry: r.industry ?? "",
      summary: r.summary, challenge: r.challenge ?? "", solution: r.solution ?? "", results: r.results ?? "",
      cover_image: r.cover_image ?? "",
      tags: (r.tags ?? []).join(", "), services: (r.services ?? []).join(", "),
      published: r.published,
    });
    setOpen(true);
  };

  const save = async () => {
    try {
      await upsertFn({ data: {
        id: form.id,
        slug: form.slug.trim(),
        title: form.title.trim(),
        client_name: form.client_name || null,
        industry: form.industry || null,
        summary: form.summary,
        challenge: form.challenge || null,
        solution: form.solution || null,
        results: form.results || null,
        cover_image: form.cover_image || null,
        tags: form.tags.split(",").map((s) => s.trim()).filter(Boolean),
        services: form.services.split(",").map((s) => s.trim()).filter(Boolean),
        published: form.published,
      }});
      toast.success("Saved");
      setOpen(false); load();
    } catch (e) { toast.error((e as Error).message); }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this case study?")) return;
    try { await deleteFn({ data: { id } }); toast.success("Deleted"); load(); }
    catch (e) { toast.error((e as Error).message); }
  };

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold">Case Studies</h3>
        <Button size="sm" onClick={openNew}><Plus className="mr-1 h-4 w-4" /> New case study</Button>
      </div>
      {rows.length === 0 ? (
        <div className="text-sm text-muted-foreground">No case studies yet.</div>
      ) : (
        <div className="grid gap-2">
          {rows.map((r) => (
            <div key={r.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border p-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{r.title}</span>
                  <Badge variant={r.published ? "default" : "outline"}>{r.published ? "Published" : "Draft"}</Badge>
                </div>
                <div className="text-xs text-muted-foreground">/{r.slug} · {r.client_name || "—"} · {r.industry || "—"}</div>
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
          <DialogHeader><DialogTitle>{form.id ? "Edit case study" : "New case study"}</DialogTitle></DialogHeader>
          <div className="grid gap-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Slug</Label><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="acme-brand-refresh" /></div>
              <div><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
              <div><Label>Client</Label><Input value={form.client_name} onChange={(e) => setForm({ ...form, client_name: e.target.value })} /></div>
              <div><Label>Industry</Label><Input value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} /></div>
            </div>
            <div><Label>Summary</Label><Textarea value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} rows={2} /></div>
            <div><Label>Cover image URL</Label><Input value={form.cover_image} onChange={(e) => setForm({ ...form, cover_image: e.target.value })} placeholder="https://…" /></div>
            <div><Label>Challenge</Label><Textarea value={form.challenge} onChange={(e) => setForm({ ...form, challenge: e.target.value })} rows={4} /></div>
            <div><Label>Solution</Label><Textarea value={form.solution} onChange={(e) => setForm({ ...form, solution: e.target.value })} rows={4} /></div>
            <div><Label>Results</Label><Textarea value={form.results} onChange={(e) => setForm({ ...form, results: e.target.value })} rows={4} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Tags (comma-sep)</Label><Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} /></div>
              <div><Label>Services (comma-sep)</Label><Input value={form.services} onChange={(e) => setForm({ ...form, services: e.target.value })} /></div>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.published} onCheckedChange={(v) => setForm({ ...form, published: v })} />
              <Label>Published</Label>
            </div>
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