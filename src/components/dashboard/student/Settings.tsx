import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useCurrency, CURRENCIES, type CurrencyCode } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export function StudentSettings() {
  const { user } = useAuth();
  const { currency, setCurrency } = useCurrency();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({ full_name: "", phone: "", country: "NG", avatar_url: "" });
  const [pwd, setPwd] = useState("");

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle().then(({ data: p }) => {
      if (p) setProfile({ full_name: p.full_name || "", phone: p.phone || "", country: p.country || "NG", avatar_url: p.avatar_url || "" });
      setLoading(false);
    });
  }, [user]);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({ ...profile, currency }).eq("id", user.id);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Profile saved");
  };

  const changePassword = async () => {
    if (pwd.length < 8) { toast.error("At least 8 characters"); return; }
    const { error } = await supabase.auth.updateUser({ password: pwd });
    if (error) { toast.error(error.message); return; }
    toast.success("Password updated");
    setPwd("");
  };

  const uploadAvatar = async (file: File) => {
    if (!user) return;
    const path = `${user.id}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (error) { toast.error(error.message); return; }
    const { data } = await supabase.storage.from("avatars").createSignedUrl(path, 60 * 60 * 24 * 365);
    if (data?.signedUrl) setProfile((p) => ({ ...p, avatar_url: data.signedUrl }));
    toast.success("Avatar uploaded");
  };

  if (loading) return <div className="text-sm text-muted-foreground">Loading…</div>;

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <h1 className="text-2xl font-extrabold">Profile Settings</h1>

      <section className="rounded-2xl border border-border bg-card p-5">
        <div className="mb-4 text-sm font-bold">Personal info</div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name" value={profile.full_name} onChange={(v) => setProfile({ ...profile, full_name: v })} />
          <Field label="Phone" value={profile.phone} onChange={(v) => setProfile({ ...profile, phone: v })} />
          <Field label="Country (ISO)" value={profile.country} onChange={(v) => setProfile({ ...profile, country: v })} />
          <div>
            <label className="text-sm font-medium">Currency</label>
            <select value={currency} onChange={(e) => setCurrency(e.target.value as CurrencyCode)} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm">
              {Object.values(CURRENCIES).map((c) => <option key={c.code} value={c.code}>{c.symbol} {c.code} — {c.label}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="text-sm font-medium">Avatar</label>
            <div className="mt-2 flex items-center gap-3">
              {profile.avatar_url && <img src={profile.avatar_url} alt="avatar" className="h-12 w-12 rounded-full object-cover" />}
              <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && uploadAvatar(e.target.files[0])} />
            </div>
          </div>
        </div>
      </section>

      <div className="flex justify-end">
        <Button variant="brand" onClick={save} disabled={saving}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save changes"}</Button>
      </div>

      <section className="rounded-2xl border border-border bg-card p-5">
        <div className="mb-4 text-sm font-bold">Change password</div>
        <div className="flex gap-2">
          <input type="password" value={pwd} onChange={(e) => setPwd(e.target.value)} placeholder="New password" className="flex-1 rounded-lg border border-border bg-background px-3 py-2.5 text-sm" />
          <Button variant="outline" onClick={changePassword}>Update</Button>
        </div>
      </section>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm" />
    </div>
  );
}