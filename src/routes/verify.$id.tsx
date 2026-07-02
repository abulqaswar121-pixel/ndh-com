import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Section } from "@/components/site/Section";
import { supabase } from "@/integrations/supabase/client";
import { ShieldCheck, XCircle, ArrowLeft } from "lucide-react";

type Verified = { holder: string; program: string; grade: string | null; issued: string; number: string };

export const Route = createFileRoute("/verify/$id")({
  head: ({ params }) => ({ meta: [
    { title: `Verify ${params.id} — NDH Academy` },
    { name: "description", content: "Public verification for an NDH-issued certificate." },
    { name: "robots", content: "noindex" },
  ]}),
  component: VerifyDirect,
});

function VerifyDirect() {
  const { id } = Route.useParams();
  const [state, setState] = useState<"loading" | "missing" | Verified>("loading");
  useEffect(() => {
    (async () => {
      const { data } = await supabase.rpc("verify_certificate", { _code: id });
      const row = Array.isArray(data) ? data[0] : null;
      if (!row) { setState("missing"); return; }
      setState({
        holder: row.holder,
        program: row.program,
        grade: row.grade,
        issued: new Date(row.issued).toLocaleDateString(),
        number: row.number,
      });
    })();
  }, [id]);

  return (
    <SiteLayout>
      <section className="bg-hero py-16 text-white">
        <div className="mx-auto max-w-3xl px-6">
          <Link to="/verify" className="inline-flex items-center gap-1 text-xs text-white/70 hover:text-white"><ArrowLeft className="h-3 w-3" /> All verifications</Link>
          <h1 className="mt-3 text-3xl font-extrabold sm:text-4xl">Certificate Verification</h1>
        </div>
      </section>
      <Section>
        <div className="mx-auto max-w-2xl">
          {state === "loading" && <div className="h-40 animate-pulse rounded-2xl bg-secondary/40" />}
          {state === "missing" && (
            <div className="flex items-center gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-6">
              <XCircle className="h-6 w-6 text-destructive" />
              <div className="text-sm">No certificate found for <span className="font-mono">{id}</span>. If you scanned a QR code, the certificate may be invalid.</div>
            </div>
          )}
          {state !== "loading" && state !== "missing" && (
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-7 w-7 text-[oklch(0.78_0.13_180)]" />
                <div>
                  <div className="text-sm font-semibold">Certificate Verified</div>
                  <div className="text-xs text-muted-foreground">{state.number}</div>
                </div>
              </div>
              <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
                <div><dt className="text-muted-foreground">Holder</dt><dd className="font-semibold">{state.holder}</dd></div>
                <div><dt className="text-muted-foreground">Program</dt><dd className="font-semibold">{state.program}</dd></div>
                <div><dt className="text-muted-foreground">Grade</dt><dd className="font-semibold">{state.grade || "—"}</dd></div>
                <div><dt className="text-muted-foreground">Issued</dt><dd className="font-semibold">{state.issued}</dd></div>
              </dl>
            </div>
          )}
        </div>
      </Section>
    </SiteLayout>
  );
}