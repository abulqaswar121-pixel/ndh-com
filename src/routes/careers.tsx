import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Section } from "@/components/site/Section";
import { AnimatedBlobs } from "@/components/site/AnimatedBlobs";
import { Reveal, Stagger, StaggerItem } from "@/components/site/Reveal";
import { UnsplashImg } from "@/components/site/UnsplashImg";
import { Button } from "@/components/ui/button";
import { Briefcase, MapPin, Clock, ArrowRight } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/careers")({
  head: () => ({ meta: [
    { title: "Careers — Najeeb Digital Hub" },
    { name: "description", content: "Open roles at NDH: Project Managers, Instructors, HODs and operations across our bureau and academy." },
    { property: "og:title", content: "Work at NDH" },
    { property: "og:url", content: "/careers" },
  ], links: [{ rel: "canonical", href: "/careers" }]}),
  component: CareersPage,
});

const roles = [
  { title: "Project Manager · Design", type: "Full-time", loc: "Sokoto / Remote" },
  { title: "Project Manager · Development", type: "Full-time", loc: "Sokoto / Remote" },
  { title: "Instructor · UI/UX Design", type: "Part-time", loc: "Remote" },
  { title: "Instructor · Full-Stack Development", type: "Part-time", loc: "Remote" },
  { title: "HOD · Marketing", type: "Full-time", loc: "Sokoto / Hybrid" },
  { title: "Registrar", type: "Full-time", loc: "Sokoto" },
  { title: "Finance Officer", type: "Full-time", loc: "Sokoto" },
  { title: "Student Affairs Lead", type: "Full-time", loc: "Sokoto" },
];

function CareersPage() {
  const [sent, setSent] = useState(false);
  return (
    <SiteLayout>
      <section className="relative isolate overflow-hidden bg-hero py-24 text-white">
        <AnimatedBlobs />
        <div className="relative mx-auto max-w-7xl px-6">
          <Reveal>
            <div className="text-xs font-semibold uppercase tracking-widest text-white/70">Careers</div>
            <h1 className="mt-3 max-w-3xl text-4xl font-extrabold sm:text-5xl">Join the team building Africa's premium digital bureau.</h1>
            <p className="mt-4 max-w-2xl text-white/75">Real roles. Real ownership. Real pay. Work alongside elite talents and ship work that matters.</p>
          </Reveal>
        </div>
      </section>

      <Section eyebrow="Why work at NDH">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
          <Reveal>
            <div className="overflow-hidden rounded-3xl border border-border shadow-elegant">
              <UnsplashImg q="african tech office team collaboration" alt="NDH office" w={1200} h={800} className="h-full w-full object-cover" />
            </div>
          </Reveal>
          <Stagger className="grid gap-4 sm:grid-cols-2">
            {[
              ["Premium clients", "Work with brands from Nigeria, UK, US, Canada, EU, UAE."],
              ["Fair pay", "Tiered, transparent compensation — paid on time, every time."],
              ["Growth culture", "Free access to NDH Academy + internal mentorship."],
              ["Modern stack", "Best-in-class tooling, AI assistance and PM rituals."],
            ].map(([t, d]) => (
              <StaggerItem key={t}>
                <div className="h-full rounded-2xl border border-border bg-card p-6">
                  <h3 className="font-bold">{t}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{d}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </Section>

      <Section eyebrow="Open roles" title="Where could you fit in?">
        <Stagger className="grid gap-4 md:grid-cols-2">
          {roles.map((r) => (
            <StaggerItem key={r.title}>
              <div className="group flex h-full items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:shadow-elegant">
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    <Briefcase className="h-3.5 w-3.5" /> {r.type}
                    <span className="text-foreground/30">·</span>
                    <MapPin className="h-3.5 w-3.5" /> {r.loc}
                  </div>
                  <h3 className="mt-1 text-lg font-bold">{r.title}</h3>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
              </div>
            </StaggerItem>
          ))}
        </Stagger>
        <p className="mt-6 rounded-xl border border-border bg-secondary/40 p-4 text-sm text-muted-foreground">
          Note: We also recruit <strong className="text-foreground">talents</strong> directly through email.
          Apply via our{" "}
          <Link to="/talent-application" className="font-semibold text-foreground underline">Talent Application</Link> page.
        </p>
      </Section>

      <Section eyebrow="Apply" title="Send us your details.">
        <form
          onSubmit={(e) => { e.preventDefault(); setSent(true); }}
          className="mx-auto max-w-2xl rounded-2xl border border-border bg-card p-6 sm:p-8"
        >
          {sent ? (
            <div className="text-center">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-gradient-brand text-white">✓</div>
              <h3 className="mt-4 text-xl font-bold">Application received.</h3>
              <p className="mt-2 text-sm text-muted-foreground">We'll get back to qualified candidates by email.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Full name" name="name" required />
                <Field label="Email" name="email" type="email" required />
              </div>
              <Field label="Role you're applying for" name="role" required />
              <Field label="Portfolio / LinkedIn" name="portfolio" />
              <div>
                <label className="text-sm font-medium">Tell us about yourself</label>
                <textarea rows={5} required className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm" />
              </div>
              <Button type="submit" variant="brand" size="lg">Submit application <Clock className="h-4 w-4" /></Button>
            </div>
          )}
        </form>
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