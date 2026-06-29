import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Section } from "@/components/site/Section";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Search, XCircle } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/verify")({
  head: () => ({ meta: [
    { title: "Verify Certificate — NDH Academy" },
    { name: "description", content: "Verify an NDH Academy certificate by ID or QR code." },
    { property: "og:title", content: "Verify an NDH Certificate" },
    { property: "og:description", content: "Public verification for all NDH-issued certificates." },
  ]}),
  component: VerifyPage,
});

function VerifyPage() {
  const [code, setCode] = useState("");
  const [result, setResult] = useState<null | "found" | "missing">(null);
  return (
    <SiteLayout>
      <section className="bg-hero py-20 text-white">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-xs font-semibold uppercase tracking-widest text-white/70">Certificate Verification</div>
          <h1 className="mt-3 max-w-3xl text-4xl font-extrabold sm:text-5xl">Verify an NDH certificate.</h1>
          <p className="mt-4 max-w-2xl text-white/75">Enter the certificate ID printed on the certificate (e.g. <span className="font-mono">CERT-2026-0142</span>) or scan its QR code.</p>
        </div>
      </section>
      <Section>
        <form
          onSubmit={(e) => { e.preventDefault(); setResult(code.toUpperCase().startsWith("CERT-") ? "found" : "missing"); }}
          className="mx-auto flex max-w-2xl flex-col gap-3 sm:flex-row"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input value={code} onChange={(e) => setCode(e.target.value)} required placeholder="CERT-2026-0142" className="w-full rounded-lg border border-border bg-background py-3 pl-10 pr-4 text-sm" />
          </div>
          <Button type="submit" variant="brand" size="lg">Verify</Button>
        </form>

        {result === "found" && (
          <div className="mx-auto mt-8 max-w-2xl rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-7 w-7 text-[oklch(0.78_0.13_180)]" />
              <div>
                <div className="text-sm font-semibold">Certificate Verified</div>
                <div className="text-xs text-muted-foreground">Demo result for {code.toUpperCase()}</div>
              </div>
            </div>
            <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
              <div><dt className="text-muted-foreground">Holder</dt><dd className="font-semibold">Aisha O.</dd></div>
              <div><dt className="text-muted-foreground">Program</dt><dd className="font-semibold">Diploma in Design</dd></div>
              <div><dt className="text-muted-foreground">Grade</dt><dd className="font-semibold">Distinction</dd></div>
              <div><dt className="text-muted-foreground">Issued</dt><dd className="font-semibold">2026</dd></div>
            </dl>
          </div>
        )}
        {result === "missing" && (
          <div className="mx-auto mt-8 flex max-w-2xl items-center gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-6">
            <XCircle className="h-6 w-6 text-destructive" />
            <div className="text-sm">No certificate found for that ID. Check the format <span className="font-mono">CERT-YYYY-####</span>.</div>
          </div>
        )}
      </Section>
    </SiteLayout>
  );
}