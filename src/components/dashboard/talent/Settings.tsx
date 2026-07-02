import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { LinkAccountsCard } from "@/components/auth/LinkAccountsCard";

export function TalentSettings() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({ full_name: "", phone: "" });
  const [talent, setTalent] = useState({ availability: "available", max_active_tasks: 3, skills: [] as string[], status: "active" });
  const [bank, setBank] = useState({ bank_name: "", account_name: "", account_number: "" });
  const [pw, setPw] = useState("");
  const [skillsInput, setSkillsInput] = useState("");

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: p }, { data: t }] = await Promise.all([
        supabase.from("profiles").select("full_name, phone").eq("id", user.id).maybeSingle(),
        supabase.from("talents").select("availability, max_active_tasks, skills, bank_details, status").eq("user_id", user.id).maybeSingle(),
      ]);
      if (p) setProfile({ full_name: p.full_name || "", phone: p.phone || "" });
      if (t) {
        setTalent({ availability: t.availability, max_active_tasks: t.max_active_tasks, skills: t.skills || [], status: t.status });
        setSkillsInput((t.skills || []).join(", "));
        const bd = (t.bank_details as any) || {};
        setBank({ bank_name: bd.bank_name || "", account_name: bd.account_name || "", account_number: bd.account_number || "" });
      }
      setLoading(false);
    })();
  }, [user]);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const skills = skillsInput.split(",").map((s) => s.trim()).filter(Boolean);
      await supabase.from("profiles").update({ full_name: profile.full_name, phone: profile.phone }).eq("id", user.id);
      const nextStatus = (bank.account_number && talent.status === "invited") ? "active" : talent.status;
      await supabase.from("talents").update({
        availability: talent.availability,
        max_active_tasks: talent.max_active_tasks,
        skills, bank_details: bank,
        status: nextStatus,
        joined_at: talent.status === "invited" ? new Date().toISOString() : undefined,
      }).eq("user_id", user.id);
      if (pw && pw.length >= 8) await supabase.auth.updateUser({ password: pw });
      toast.success("Settings saved");
      setPw("");
    } catch (e) { toast.error((e as Error).message); } finally { setSaving(false); }
  };

  if (loading) return <div className="grid place-items-center py-16"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Keep your profile, bank and availability current.</p>
      </div>

      {talent.status === "invited" && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          Complete your bank details to activate your account and start receiving paid tasks.
        </div>
      )}

      <Section title="Personal info">
        <Field label="Full name" value={profile.full_name} onChange={(v) => setProfile((p) => ({ ...p, full_name: v }))} />
        <Field label="Phone" value={profile.phone} onChange={(v) => setProfile((p) => ({ ...p, phone: v }))} />
      </Section>

      <Section title="Bank details (for weekly payroll)">
        <Field label="Bank name" value={bank.bank_name} onChange={(v) => setBank((b) => ({ ...b, bank_name: v }))} />
        <Field label="Account name" value={bank.account_name} onChange={(v) => setBank((b) => ({ ...b, account_name: v }))} />
        <Field label="Account number" value={bank.account_number} onChange={(v) => setBank((b) => ({ ...b, account_number: v }))} />
      </Section>

      <Section title="Skills">
        <Field label="Comma-separated" value={skillsInput} onChange={setSkillsInput} />
      </Section>

      <Section title="Availability">
        <div>
          <label className="text-sm font-medium">Status</label>
          <select value={talent.availability} onChange={(e) => setTalent((t) => ({ ...t, availability: e.target.value }))}
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
            <option value="available">Available</option>
            <option value="busy">Busy</option>
            <option value="away">Away</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium">Max active tasks</label>
          <input type="number" min={1} max={10} value={talent.max_active_tasks}
            onChange={(e) => setTalent((t) => ({ ...t, max_active_tasks: Number(e.target.value) }))}
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
        </div>
      </Section>

      <Section title="Change password">
        <Field label="New password (min 8 chars)" type="password" value={pw} onChange={setPw} />
      </Section>

      <Button variant="brand" onClick={save} disabled={saving}>
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save changes"}
      </Button>

      <LinkAccountsCard />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="mb-3 text-sm font-bold">{title}</div>
      <div className="grid gap-3 sm:grid-cols-2">{children}</div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
    </label>
  );
}