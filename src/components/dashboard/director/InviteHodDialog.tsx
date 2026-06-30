import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { inviteHod } from "@/lib/hod/hod.functions";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";

export function InviteHodDialog() {
  const [open, setOpen] = useState(false);
  const [depts, setDepts] = useState<Array<{ id: string; name: string }>>([]);
  const [form, setForm] = useState({ email: "", full_name: "", department_id: "" });
  const [busy, setBusy] = useState(false);
  const invite = useServerFn(inviteHod);

  useEffect(() => {
    if (!open) return;
    supabase.from("departments").select("id,name").order("name").then(({ data }) => setDepts(data || []));
  }, [open]);

  async function submit() {
    if (!form.email || !form.full_name || !form.department_id) return toast.error("All fields required");
    setBusy(true);
    try {
      const r = await invite({ data: form });
      toast.success("HOD invited. Recovery link sent.");
      if (r?.action_link) console.info("HOD recovery link:", r.action_link);
      setOpen(false);
      setForm({ email: "", full_name: "", department_id: "" });
    } catch (e) { toast.error((e as Error).message); } finally { setBusy(false); }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm"><UserPlus className="mr-2 h-4 w-4" /> Invite HOD</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Invite Head of Department</DialogTitle></DialogHeader>
        <div className="grid gap-3">
          <div><Label>Full name</Label><Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></div>
          <div><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
          <div>
            <Label>Department</Label>
            <Select value={form.department_id} onValueChange={(v) => setForm({ ...form, department_id: v })}>
              <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
              <SelectContent>{depts.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={submit} disabled={busy}>{busy ? "Inviting…" : "Send invite"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}