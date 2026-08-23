import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { validateInvite, acceptInvite } from "@/lib/invites/invite.functions";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Loader2, CheckCircle2, XCircle, Clock, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/invite/$token")({
  component: InviteAcceptPage,
});

function InviteAcceptPage() {
  const { token } = Route.useParams();
  const navigate = useNavigate();
  const validateFn = useServerFn(validateInvite);
  const acceptFn = useServerFn(acceptInvite);

  const [loading, setLoading] = useState(true);
  const [info, setInfo] = useState<null | Awaited<ReturnType<typeof validateFn>>>(null);
  const [error, setError] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await validateFn({ data: { token } });
        setInfo(res as any);
        if (res && (res as any).full_name) setFullName((res as any).full_name);
        if (!res || !(res as any).valid) {
          if ((res as any)?.expired) setError("This invitation has expired (7-day limit). Please request a new invite.");
          else if ((res as any)?.used) setError("This invitation has already been used.");
          else setError("Invalid invitation token.");
        }
      } catch (e: any) {
        setError(e.message || "Invalid token");
      } finally { setLoading(false); }
    })();
  }, [token]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) { toast.error("Password min 8 chars"); return; }
    if (password !== confirm) { toast.error("Passwords don't match"); return; }
    setBusy(true);
    try {
      const res = await acceptFn({ data: { token, password, full_name: fullName } });
      toast.success("Account created! Redirecting to login...");
      navigate({ to: "/login" });
    } catch (e: any) {
      toast.error(e.message || "Failed to accept invite");
      if (/expired|invalid|used|revoked/i.test(e.message)) setError(e.message);
    } finally { setBusy(false); }
  };

  if (loading) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-md px-6 py-24 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin" /><p className="mt-2 text-sm text-muted-foreground">Validating invitation...</p></div>
      </SiteLayout>
    );
  }

  if (error || !info?.valid) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-lg px-6 py-16">
          <Card className="p-8 text-center">
            <XCircle className="mx-auto h-12 w-12 text-destructive" />
            <h1 className="mt-4 text-2xl font-bold">Invalid invitation</h1>
            <p className="mt-2 text-sm text-muted-foreground">{error || "This invitation link is invalid or has been used. Please contact admin for a new invite."}</p>
            <div className="mt-6 flex justify-center gap-2">
              <Link to="/contact"><Button variant="outline">Contact support</Button></Link>
              <Link to="/"><Button variant="brand">Go home</Button></Link>
            </div>
            <div className="mt-4 text-xs text-muted-foreground">Token: {token.slice(0,8)}... (single-use, 7-day expiry)</div>
          </Card>
        </div>
      </SiteLayout>
    );
  }

  const roleLabel = info.type === "pm" ? "Project Manager" : info.type === "hod" ? "Academy Director" : "Talent";
  const roleDesc = info.type === "pm" ? "You will route tasks, assign talents and deliver client work." : info.type === "hod" ? "You will manage departments, courses and student progress." : "You will receive paid task assignments.";

  return (
    <SiteLayout>
      <div className="mx-auto max-w-lg px-6 py-16">
        <Card className="p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-primary"><ShieldCheck className="h-5 w-5" /></div>
            <div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground">Invitation valid · 7-day single-use</div>
              <div className="text-lg font-bold">{roleLabel} invitation</div>
            </div>
          </div>
          <div className="rounded-lg border bg-secondary/30 p-3 text-sm">
            <div><span className="font-semibold">Email:</span> {info.email}</div>
            <div><span className="font-semibold">Role:</span> {roleLabel}</div>
            <div className="text-muted-foreground">{roleDesc}</div>
          </div>
          <form onSubmit={submit} className="mt-6 space-y-4">
            <div><Label>Full name</Label><Input value={fullName} onChange={(e) => setFullName(e.target.value)} required /></div>
            <div className="text-sm text-muted-foreground">Email is locked to invitation: <span className="font-mono">{info.email}</span></div>
            <div><Label>New password (min 8 chars)</Label><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} /></div>
            <div><Label>Confirm password</Label><Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required minLength={8} /></div>
            <Button type="submit" variant="brand" className="w-full" disabled={busy}>{busy ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating account...</> : `Accept & create ${roleLabel} account`}</Button>
          </form>
          <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground"><Clock className="h-3.5 w-3.5" /> Link expires in 7 days, single-use only.</div>
        </Card>
      </div>
    </SiteLayout>
  );
}
