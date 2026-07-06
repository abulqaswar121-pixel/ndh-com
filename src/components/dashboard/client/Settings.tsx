import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useCurrency, CURRENCIES, type CurrencyCode } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { LinkAccountsCard } from "@/components/auth/LinkAccountsCard";

export function ClientSettings() {
  const { user } = useAuth();
  const { currency, setCurrency } = useCurrency();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({ full_name: "", phone: "", country: "NG", avatar_url: "" });
  const [company, setCompany] = useState({ company_name: "", business_type: "", address: "" });
  const [pwd, setPwd] = useState("");
  const [currentPwd, setCurrentPwd] = useState("");
  const [hasPassword, setHasPassword] = useState<boolean | null>(null);

  useEffect(() => {
    // Detect if user has an email/password identity vs Google-only
    const identities = (user as unknown as { identities?: Array<{ provider: string }> })?.identities;
    if (identities) {
      setHasPassword(identities.some((i) => i.provider === "email"));
    }
  }, [user]);

  const pwdStrength = (p: string): { score: number; label: string; color: string } => {
    let s = 0;
    if (p.length >= 8) s++;
    if (p.length >= 12) s++;
    if (/[A-Z]/.test(p) && /[a-z]/.test(p)) s++;
    if (/\d/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    const labels = ["Very weak", "Weak", "Fair", "Good", "Strong", "Excellent"];
    const colors = ["bg-destructive", "bg-destructive", "bg-yellow-500", "bg-yellow-500", "bg-emerald-500", "bg-emerald-500"];
    return { score: s, label: labels[s], color: colors[s] };
  };

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: p } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
      const { data: c } = await supabase.from("clients").select("*").eq("user_id", user.id).maybeSingle();
      if (p) setProfile({ full_name: p.full_name || "", phone: p.phone || "", country: p.country || "NG", avatar_url: p.avatar_url || "" });
      if (c) setCompany({ company_name: c.company_name || "", business_type: c.business_type || "", address: c.address || "" });
      setLoading(false);
    })();
  }, [user]);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    const [{ error: e1 }, { error: e2 }] = await Promise.all([
      supabase.from("profiles").update({ ...profile, currency }).eq("id", user.id),
      supabase.from("clients").upsert({ user_id: user.id, ...company }),
    ]);
    setSaving(false);
    if (e1 || e2) { toast.error((e1 || e2)?.message || "Save failed"); return; }
    toast.success("Profile saved");
  };

  const changePassword = async () => {
    if (pwd.length < 8) { toast.error("At least 8 characters"); return; }
    if (pwdStrength(pwd).score < 3) { toast.error("Password too weak — add uppercase, numbers, and symbols"); return; }
    // Verify current password (for users that already have one)
    if (hasPassword && user?.email) {
      if (!currentPwd) { toast.error("Enter your current password"); return; }
      const { error: verifyErr } = await supabase.auth.signInWithPassword({ email: user.email, password: currentPwd });
      if (verifyErr) { toast.error("Current password is incorrect"); return; }
    }
    const { error } = await supabase.auth.updateUser({ password: pwd });
    if (error) { toast.error(error.message); return; }
    toast.success(hasPassword ? "Password updated — a confirmation email has been sent" : "Password set successfully");
    setPwd(""); setCurrentPwd(""); setHasPassword(true);
  };

  const onPhoneChange = (v: string) => {
    // Allow digits, +, -, space, parentheses only
    const cleaned = v.replace(/[^\d+\-\s()]/g, "");
    setProfile({ ...profile, phone: cleaned });
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

      <Card title="Personal info">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name" value={profile.full_name} onChange={(v) => setProfile({ ...profile, full_name: v })} />
          <div>
            <label className="text-sm font-medium">Phone</label>
            <input
              value={profile.phone}
              onChange={(e) => onPhoneChange(e.target.value)}
              inputMode="tel"
              placeholder="+234 800 123 4567"
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
            />
            <p className="mt-1 text-xs text-muted-foreground">Digits, +, -, spaces only</p>
          </div>
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
              {profile.avatar_url && <img src={profile.avatar_url} alt="avatar" loading="lazy" decoding="async" width={48} height={48} className="h-12 w-12 rounded-full object-cover" />}
              <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && uploadAvatar(e.target.files[0])} />
            </div>
          </div>
        </div>
      </Card>

      <Card title="Company info">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Company name" value={company.company_name} onChange={(v) => setCompany({ ...company, company_name: v })} />
          <Field label="Business type" value={company.business_type} onChange={(v) => setCompany({ ...company, business_type: v })} />
          <div className="sm:col-span-2">
            <label className="text-sm font-medium">Address</label>
            <textarea value={company.address} onChange={(e) => setCompany({ ...company, address: e.target.value })} rows={2} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm" />
          </div>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button variant="brand" onClick={save} disabled={saving}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save changes"}</Button>
      </div>

      <Card title={hasPassword === false ? "Set a password" : "Change password"}>
        <div className="space-y-3">
          {hasPassword === false && (
            <p className="text-xs text-muted-foreground">
              You signed up with Google. Set a password to also sign in with email.
            </p>
          )}
          {hasPassword && (
            <input
              type="password"
              value={currentPwd}
              onChange={(e) => setCurrentPwd(e.target.value)}
              placeholder="Current password"
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
            />
          )}
          <input
            type="password"
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
            placeholder={hasPassword ? "New password" : "Password"}
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
          />
          {pwd.length > 0 && (
            <div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className={`h-full transition-all ${pwdStrength(pwd).color}`}
                  style={{ width: `${(pwdStrength(pwd).score / 5) * 100}%` }}
                />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Strength: {pwdStrength(pwd).label}</p>
            </div>
          )}
          <Button variant="outline" onClick={changePassword} className="w-full sm:w-auto">
            {hasPassword ? "Update password" : "Set password"}
          </Button>
        </div>
      </Card>

      <LinkAccountsCard />
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <div className="mb-4 text-sm font-bold">{title}</div>
      {children}
    </section>
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