import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Section } from "@/components/site/Section";
import { AnimatedBlobs } from "@/components/site/AnimatedBlobs";
import { Reveal } from "@/components/site/Reveal";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Mail } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/talent-application")({
  head: () => ({ meta: [
    { title: "Apply to Join the NDH Talent Pool" },
    { name: "description", content: "Talents do not self-register. Apply via this form and our team will reach out via email if shortlisted." },
    { property: "og:title", content: "Apply to NDH Talent Pool" },
    { property: "og:url", content: "/talent-application" },
  ], links: [{ rel: "canonical", href: "/talent-application" }]}),
  component: Page,
});

const perks = [
  "Email-based application — we contact you if shortlisted",
  "Weekly payouts directly to your bank",
  "Tier-based growth: Junior → Elite",
  "PMs handle client briefs and revisions",
  "Free / discounted access to NDH Academy",
  "Steady, vetted pipeline of premium projects",
];

function Page() {
  const [sent, setSent] = useState(false);
  return (
    <SiteLayout>
      <section className="relative isolate overflow-hidden bg-hero py-24 text-white">
        <AnimatedBlobs />
        <div className="relative mx-auto max-w-7xl px-6">
          <Reveal>
            <div className="text-xs font-semibold uppercase tracking-widest text-white/70">Talent Recruitment</div>
            <h1 className="mt-3 max-w-3xl text-4xl font-extrabold sm:text-5xl">Apply to join our talent pool.</h1>
            <p className="mt-4 max-w-2xl text-white/75">
              NDH does not accept open sign-ups for talents. Submit your application below — if you match an opening, our team will reach out by email with portal access.
            </p>
          </Reveal>
        </div>
      </section>

      <Section>
        <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr]">
          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="font-bold">Why apply to NDH</h3>
            <ul className="mt-4 space-y-3 text-sm">
              {perks.map((p) => (
                <li key={p} className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[oklch(0.78_0.13_180)]" />{p}</li>
              ))}
            </ul>
            <div className="mt-6 rounded-xl border border-border bg-secondary/40 p-4 text-sm text-muted-foreground">
              Prefer email? Send your CV and portfolio to{" "}
              <a className="font-semibold text-foreground" href="mailto:support@ndh.com.ng">support@ndh.com.ng</a>.
            </div>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} className="rounded-2xl border border-border bg-card p-6 sm:p-8">
            {sent ? (
              <div className="text-center">
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-gradient-brand text-white">✓</div>
                <h3 className="mt-4 text-xl font-bold">Application received.</h3>
                <p className="mt-2 text-sm text-muted-foreground">If shortlisted, our team will email you portal access within 7 business days.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Full name" name="name" required />
                  <Field label="Email" name="email" type="email" required />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Phone / WhatsApp" name="phone" required />
                  <div>
                    <label className="text-sm font-medium">Primary skill</label>
                    <select className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm">
                      <option>Design</option><option>Development</option><option>Content</option>
                      <option>Marketing</option><option>Media</option><option>AI & Tech</option>
                    </select>
                  </div>
                </div>
                <Field label="Portfolio / link" name="portfolio" />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Country" name="country" />
                  <Field label="Years of experience" name="years" type="number" />
                </div>
                <div>
                  <label className="text-sm font-medium">Tell us about yourself</label>
                  <textarea rows={5} required className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm" placeholder="Best project, tools you use, why NDH." />
                </div>
                <Button type="submit" variant="brand" size="lg">Submit application <Mail className="h-4 w-4" /></Button>
              </div>
            )}
          </form>
        </div>
      </Section>
    </SiteLayout>
  );
}

function Field({ label, name, type = "text", required }: { label: string; name: string; type?: string; required?: boolean }) {
  return (
    <div>
      <label className="text-sm font-medium" htmlFor={name}>{label}</label>
      <input id={name} name={name} type={type} required={required} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm transition focus:border-[oklch(0.65_0.19_252)] focus:outline-none focus:ring-2 focus:ring-[oklch(0.65_0.19_252)]/30" />
    </div>
  );
}