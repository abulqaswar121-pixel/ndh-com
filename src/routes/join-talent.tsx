import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Section } from "@/components/site/Section";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/join-talent")({
  head: () => ({ meta: [
    { title: "Join as Talent — NDH" },
    { name: "description", content: "Apply to join NDH's vetted in-house talent pool. Weekly pay, fair tiers, real projects." },
    { property: "og:title", content: "Join NDH as Talent" },
    { property: "og:description", content: "Get paid weekly to deliver world-class work." },
  ]}),
  component: JoinTalentPage,
});

const perks = [
  "Weekly payouts to your bank",
  "Tier-based growth: Junior → Elite",
  "Project Managers handle the client side",
  "Free / discounted access to NDH Academy",
  "Performance scoring & visibility",
  "Steady, vetted pipeline of work",
];

function JoinTalentPage() {
  const [sent, setSent] = useState(false);
  return (
    <SiteLayout>
      <section className="bg-hero py-20 text-white">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-xs font-semibold uppercase tracking-widest text-white/70">Talent Recruitment</div>
          <h1 className="mt-3 max-w-3xl text-4xl font-extrabold sm:text-5xl">Get paid to deliver world-class work.</h1>
          <p className="mt-4 max-w-2xl text-white/75">If you are skilled, reliable and obsessed with quality, NDH is home.</p>
        </div>
      </section>

      <Section>
        <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr]">
          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="font-bold">Why join NDH</h3>
            <ul className="mt-4 space-y-3 text-sm">
              {perks.map((p) => (
                <li key={p} className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-[oklch(0.78_0.13_180)]" />{p}</li>
              ))}
            </ul>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} className="rounded-2xl border border-border bg-card p-6 sm:p-8">
            {sent ? (
              <div className="text-center">
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-gradient-brand text-white">✓</div>
                <h3 className="mt-4 text-xl font-bold">Application received.</h3>
                <p className="mt-2 text-sm text-muted-foreground">Our talent team will review and respond by email.</p>
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
                <div>
                  <label className="text-sm font-medium">Tell us about yourself</label>
                  <textarea rows={5} required className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm" placeholder="Years of experience, best project, tools you use." />
                </div>
                <Button type="submit" variant="brand" size="lg">Submit application</Button>
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
      <input id={name} name={name} type={type} required={required} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm" />
    </div>
  );
}