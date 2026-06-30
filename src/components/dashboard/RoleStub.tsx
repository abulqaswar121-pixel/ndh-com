import { Link } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { Logo } from "@/components/site/Logo";
import { Button } from "@/components/ui/button";
import { ArrowLeft, LogOut } from "lucide-react";

export function RoleStub({ title, subtitle }: { title: string; subtitle: string }) {
  const { user, role, signOut } = useAuth();
  return (
    <div className="min-h-screen bg-secondary/30 px-4 py-12">
      <div className="mx-auto max-w-2xl rounded-2xl border border-border bg-card p-8 shadow-elegant">
        <div className="flex items-center gap-3"><Logo className="h-10 w-10" /><div><div className="text-sm font-extrabold tracking-tight">NDH</div><div className="text-[10px] uppercase tracking-widest text-muted-foreground">{title}</div></div></div>
        <h1 className="mt-6 text-3xl font-extrabold">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
        <div className="mt-6 rounded-xl bg-secondary p-4 text-sm">
          Signed in as <strong>{user?.email}</strong> · role: <strong className="capitalize">{role}</strong>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">This portal is on the next build phase. The full Client Portal is live now — full LMS, PM and Admin portals ship next.</p>
        <div className="mt-6 flex gap-2">
          <Link to="/"><Button variant="outline"><ArrowLeft className="h-4 w-4" /> Home</Button></Link>
          <Button variant="brand" onClick={signOut}><LogOut className="h-4 w-4" /> Sign out</Button>
        </div>
      </div>
    </div>
  );
}