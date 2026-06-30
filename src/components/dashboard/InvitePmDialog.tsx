import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useServerFn } from "@tanstack/react-start";
import { invitePm } from "@/lib/pm/pm.functions";
import { Loader2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export function InvitePmDialog() {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ email: "", full_name: "", phone: "", department_id: "" });
  const [depts, setDepts] = useState<{ id: string; name: string }[]>([]);
  const invite = useServerFn(invitePm);

  useEffect(() => { supabase.from("departments").select("id,name").order("name").then(({ data }) => setDepts(data || [])); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.department_id) { toast.error("Pick a department"); return; }
    setSaving(true);
    try {
      await (invite as any)({ data: {
        email: form.email, full_name: form.full_name,
        phone: form.phone || null, department_id: form.department_id,
      }});
      toast.success("PM invited — they'll receive an email to set their password.");
      setForm({ email: "", full_name: "", phone: "", department_id: "" });
      setOpen(false);
    } catch (e) { toast.error((e as Error).message); } finally { setSaving(false); }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="brand"><UserPlus className="h-4 w-4" /> Invite a PM</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Invite a Project Manager</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="grid gap-3">
          <F label="Full name" required value={form.full_name} onChange={(v) => setForm({ ...form, full_name: v })} />
          <F label="Email" type="email" required value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
          <F label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
          <div>
            <label className="text-sm font-medium">Department</label>
            <select value={form.department_id} onChange={(e) => setForm({ ...form, department_id: e.target.value })}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" required>
              <option value="">— Select —</option>
              {depts.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <Button type="submit" variant="brand" disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send invitation"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function F({ label, value, onChange, type = "text", required }: { label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean }) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      <input type={type} required={required} value={value} onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
    </label>
  );
}