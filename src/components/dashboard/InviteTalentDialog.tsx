import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useServerFn } from "@tanstack/react-start";
import { inviteTalent } from "@/lib/talent/talent.functions";
import { Loader2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export function InviteTalentDialog() {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ email: "", full_name: "", department_id: "", tier: 1, skills: "" });
  const [depts, setDepts] = useState<{ id: string; name: string }[]>([]);
  const invite = useServerFn(inviteTalent);

  useEffect(() => { supabase.from("departments").select("id,name").then(({ data }) => setDepts(data || [])); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await (invite as any)({ data: {
        email: form.email, full_name: form.full_name,
        department_id: form.department_id || null,
        tier: Number(form.tier),
        skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
      }});
      toast.success("Invitation sent. The talent will receive an email to set their password.");
      setForm({ email: "", full_name: "", department_id: "", tier: 1, skills: "" });
      setOpen(false);
    } catch (e) { toast.error((e as Error).message); } finally { setSaving(false); }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="brand"><UserPlus className="h-4 w-4" /> Invite a talent</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Invite a talent</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="grid gap-3">
          <Field label="Full name" required value={form.full_name} onChange={(v) => setForm({ ...form, full_name: v })} />
          <Field label="Email" type="email" required value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
          <div>
            <label className="text-sm font-medium">Department</label>
            <select value={form.department_id} onChange={(e) => setForm({ ...form, department_id: e.target.value })}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
              <option value="">— Select —</option>
              {depts.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Starting tier</label>
            <select value={form.tier} onChange={(e) => setForm({ ...form, tier: Number(e.target.value) })}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
              <option value={1}>Tier 1 · Junior</option><option value={2}>Tier 2 · Associate</option>
              <option value={3}>Tier 3 · Professional</option><option value={4}>Tier 4 · Senior</option>
              <option value={5}>Tier 5 · Elite</option>
            </select>
          </div>
          <Field label="Skills (comma-separated)" value={form.skills} onChange={(v) => setForm({ ...form, skills: v })} />
          <Button type="submit" variant="brand" disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send invitation"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, value, onChange, type = "text", required }: { label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean }) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      <input type={type} required={required} value={value} onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
    </label>
  );
}