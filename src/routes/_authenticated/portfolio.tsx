import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  getMyTalentProfile, updateMyTalentProfile,
  upsertPortfolioItem, deletePortfolioItem,
} from "@/lib/talent-portfolio.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Pencil, Plus, Trash2, ExternalLink, Eye } from "lucide-react";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/portfolio")({
  component: PortfolioPage,
});

function PortfolioPage() {
  const qc = useQueryClient();
  const fetchMe = useServerFn(getMyTalentProfile);
  const saveProfile = useServerFn(updateMyTalentProfile);
  const saveItem = useServerFn(upsertPortfolioItem);
  const removeItem = useServerFn(deletePortfolioItem);

  const { data, isLoading, error } = useQuery({
    queryKey: ["my-talent-profile"],
    queryFn: () => fetchMe(),
  });

  const [form, setForm] = useState({
    public_slug: "", headline: "", bio: "", portfolio_url: "",
    github_url: "", linkedin_url: "", hourly_rate: "" as string,
    years_experience: "" as string, skills: "" as string, is_public: false,
  });

  useEffect(() => {
    if (data?.talent) {
      const t = data.talent as Record<string, unknown>;
      setForm({
        public_slug: String(t.public_slug ?? ""),
        headline: String(t.headline ?? ""),
        bio: String(t.bio ?? ""),
        portfolio_url: String(t.portfolio_url ?? ""),
        github_url: String(t.github_url ?? ""),
        linkedin_url: String(t.linkedin_url ?? ""),
        hourly_rate: t.hourly_rate != null ? String(t.hourly_rate) : "",
        years_experience: t.years_experience != null ? String(t.years_experience) : "",
        skills: Array.isArray(t.skills) ? (t.skills as string[]).join(", ") : "",
        is_public: Boolean(t.is_public),
      });
    }
  }, [data?.talent]);

  if (isLoading) return <div className="p-8 text-sm text-muted-foreground">Loading portfolio…</div>;
  if (error || !data?.talent) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold">Portfolio</h1>
        <p className="mt-2 text-muted-foreground">You need a talent profile before you can publish a portfolio. Contact your department head or an admin to activate your talent role.</p>
      </div>
    );
  }

  const onSaveProfile = async () => {
    try {
      await saveProfile({ data: {
        public_slug: form.public_slug.trim().toLowerCase(),
        headline: form.headline,
        bio: form.bio,
        portfolio_url: form.portfolio_url,
        github_url: form.github_url,
        linkedin_url: form.linkedin_url,
        hourly_rate: form.hourly_rate ? Number(form.hourly_rate) : null,
        years_experience: form.years_experience ? Number(form.years_experience) : null,
        skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
        is_public: form.is_public,
      } });
      toast.success("Portfolio profile saved");
      qc.invalidateQueries({ queryKey: ["my-talent-profile"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save");
    }
  };

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">My Portfolio</h1>
          <p className="text-sm text-muted-foreground">Publish a public profile at <code>/talent/{form.public_slug || "your-slug"}</code>.</p>
        </div>
        {form.is_public && form.public_slug && (
          <Link to="/talent/$slug" params={{ slug: form.public_slug }} target="_blank">
            <Button variant="outline" size="sm"><Eye className="mr-1 h-4 w-4" /> View public page</Button>
          </Link>
        )}
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold">Profile</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <Label>Public URL slug</Label>
            <Input className="mt-1" placeholder="e.g. jane-doe" value={form.public_slug} onChange={(e) => setForm((p) => ({ ...p, public_slug: e.target.value }))} />
          </div>
          <div>
            <Label>Headline</Label>
            <Input className="mt-1" placeholder="Product designer" value={form.headline} onChange={(e) => setForm((p) => ({ ...p, headline: e.target.value }))} />
          </div>
          <div className="md:col-span-2">
            <Label>Bio</Label>
            <Textarea rows={5} className="mt-1" value={form.bio} onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))} />
          </div>
          <div>
            <Label>Skills (comma-separated)</Label>
            <Input className="mt-1" placeholder="React, Figma, SEO" value={form.skills} onChange={(e) => setForm((p) => ({ ...p, skills: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Years experience</Label>
              <Input type="number" className="mt-1" value={form.years_experience} onChange={(e) => setForm((p) => ({ ...p, years_experience: e.target.value }))} />
            </div>
            <div>
              <Label>Hourly rate</Label>
              <Input type="number" className="mt-1" value={form.hourly_rate} onChange={(e) => setForm((p) => ({ ...p, hourly_rate: e.target.value }))} />
            </div>
          </div>
          <div><Label>Website</Label><Input className="mt-1" value={form.portfolio_url} onChange={(e) => setForm((p) => ({ ...p, portfolio_url: e.target.value }))} /></div>
          <div><Label>GitHub</Label><Input className="mt-1" value={form.github_url} onChange={(e) => setForm((p) => ({ ...p, github_url: e.target.value }))} /></div>
          <div><Label>LinkedIn</Label><Input className="mt-1" value={form.linkedin_url} onChange={(e) => setForm((p) => ({ ...p, linkedin_url: e.target.value }))} /></div>
          <div className="flex items-end gap-3">
            <Switch checked={form.is_public} onCheckedChange={(v) => setForm((p) => ({ ...p, is_public: v }))} />
            <span className="text-sm">Publish profile publicly</span>
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <Button onClick={onSaveProfile}>Save profile</Button>
        </div>
      </div>

      <PortfolioItems items={data.items} saveItem={saveItem} removeItem={removeItem} />
    </div>
  );
}

type Item = { id: string; title: string; description: string | null; image_url: string | null; link_url: string | null; tags: string[] | null; position: number };
type SaveItemFn = (args: { data: { id?: string; title: string; description?: string; image_url?: string; link_url?: string; tags: string[]; position: number } }) => Promise<{ ok: boolean; id: string }>;
type RemoveItemFn = (args: { data: { id: string } }) => Promise<{ ok: boolean }>;

function PortfolioItems({ items, saveItem, removeItem }: { items: Item[]; saveItem: SaveItemFn; removeItem: RemoveItemFn }) {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Partial<Item> | null>(null);

  const startNew = () => setEditing({ title: "", description: "", image_url: "", link_url: "", tags: [], position: items.length });

  const onSave = async () => {
    if (!editing?.title) return toast.error("Title is required");
    try {
      await saveItem({ data: {
        id: editing.id,
        title: editing.title,
        description: editing.description ?? "",
        image_url: editing.image_url ?? "",
        link_url: editing.link_url ?? "",
        tags: editing.tags ?? [],
        position: editing.position ?? 0,
      } });
      toast.success("Saved");
      setEditing(null);
      qc.invalidateQueries({ queryKey: ["my-talent-profile"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save");
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm("Delete this portfolio item?")) return;
    try {
      await removeItem({ data: { id } });
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["my-talent-profile"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete");
    }
  };

  return (
    <div className="mt-8 rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Portfolio items</h2>
        <Button size="sm" onClick={startNew}><Plus className="mr-1 h-4 w-4" /> Add item</Button>
      </div>
      <div className="mt-4 space-y-3">
        {items.length === 0 && !editing && (
          <p className="text-sm text-muted-foreground">No items yet. Add your first project.</p>
        )}
        {items.map((it) => (
          <div key={it.id} className="flex items-start gap-3 rounded-xl border border-border p-3">
            {it.image_url && <img src={it.image_url} alt="" className="h-16 w-24 rounded object-cover" />}
            <div className="flex-1">
              <div className="font-semibold">{it.title}</div>
              {it.description && <div className="text-xs text-muted-foreground">{it.description}</div>}
              {it.link_url && <a href={it.link_url} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs text-primary hover:underline"><ExternalLink className="h-3 w-3" /> Link</a>}
            </div>
            <div className="flex gap-1">
              <Button size="sm" variant="ghost" onClick={() => setEditing(it)}><Pencil className="h-4 w-4" /></Button>
              <Button size="sm" variant="ghost" onClick={() => onDelete(it.id)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="mt-4 rounded-xl border border-primary/40 bg-primary/5 p-4">
          <h3 className="font-semibold">{editing.id ? "Edit item" : "New item"}</h3>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div className="md:col-span-2"><Label>Title*</Label><Input className="mt-1" value={editing.title ?? ""} onChange={(e) => setEditing((p) => ({ ...p!, title: e.target.value }))} /></div>
            <div className="md:col-span-2"><Label>Description</Label><Textarea rows={3} className="mt-1" value={editing.description ?? ""} onChange={(e) => setEditing((p) => ({ ...p!, description: e.target.value }))} /></div>
            <div><Label>Image URL</Label><Input className="mt-1" value={editing.image_url ?? ""} onChange={(e) => setEditing((p) => ({ ...p!, image_url: e.target.value }))} /></div>
            <div><Label>Link URL</Label><Input className="mt-1" value={editing.link_url ?? ""} onChange={(e) => setEditing((p) => ({ ...p!, link_url: e.target.value }))} /></div>
            <div className="md:col-span-2"><Label>Tags (comma-separated)</Label><Input className="mt-1" value={(editing.tags ?? []).join(", ")} onChange={(e) => setEditing((p) => ({ ...p!, tags: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) }))} /></div>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={onSave}>Save item</Button>
          </div>
        </div>
      )}
    </div>
  );
}