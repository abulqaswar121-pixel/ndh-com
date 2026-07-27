import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Section } from "@/components/site/Section";
import { Button } from "@/components/ui/button";
import { Facebook, Instagram, Mail, Phone, MapPin } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Najeeb Digital Hub" },
      { name: "description", content: "Reach NDH by WhatsApp, email or contact form. We respond within 24 hours." },
      { property: "og:title", content: "Contact NDH — Talk to a Project Manager" },
      { property: "og:description", content: "Reach the Najeeb Digital Hub team by phone, email or contact form. A project manager replies within one business day." },
    ],
    scripts: [{
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        name: "Najeeb Digital Hub",
        image: "https://ndh.com.ng/__l5e/assets-v1/e2b8c427-3850-4864-8770-e1dd30edd19b/ndh-logo.png",
        "@id": "https://ndh.com.ng/#localbusiness",
        url: "https://ndh.com.ng/contact",
        telephone: "+234-902-993-2794",
        email: "support@ndh.com.ng",
        address: {
          "@type": "PostalAddress",
          addressLocality: "Sokoto",
          addressCountry: "NG",
        },
        openingHoursSpecification: [{
          "@type": "OpeningHoursSpecification",
          dayOfWeek: ["Monday","Tuesday","Wednesday","Thursday","Friday"],
          opens: "09:00",
          closes: "18:00",
        }],
        sameAs: [
          "https://www.facebook.com/share/1Be6HN8zjS/",
          "https://www.instagram.com/njb_digital_hub",
        ],
      }),
    }],
  }),
  component: ContactPage,
});

const emails = ["support@ndh.com.ng", "info@ndh.com.ng"];

function ContactPage() {
  const [sent, setSent] = useState(false);
  return (
    <SiteLayout>
      <section className="border-b border-border bg-background py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Contact</div>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">Talk to a project manager.</h1>
          <p className="mt-4 max-w-2xl text-muted-foreground">Share a brief and a project manager will respond with a scoped quote within one business day.</p>
        </div>
      </section>

      <Section>
        <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr]">
          <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} className="rounded-2xl border border-border bg-card p-6 sm:p-8">
            {sent ? (
              <div className="text-center">
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-primary text-primary-foreground">✓</div>
                <h3 className="mt-4 text-xl font-semibold">Message received.</h3>
                <p className="mt-2 text-sm text-muted-foreground">A project manager will follow up within one business day.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Full name" name="name" required />
                  <Field label="Email" name="email" type="email" required />
                </div>
                <Field label="Company (optional)" name="company" />
                <div>
                  <label className="text-sm font-medium">Service</label>
                  <select className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm">
                    <option>Design</option><option>Development</option><option>Content</option>
                    <option>Marketing</option><option>Media</option><option>AI & Tech</option><option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Project brief</label>
                  <textarea rows={5} required className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm" placeholder="Tell us about your goal, timeline and any references." />
                </div>
                <Button type="submit" variant="brand" size="lg">Send message</Button>
              </div>
            )}
          </form>

          <div className="space-y-6">
            <div className="rounded-2xl border border-border bg-card p-6">
              <h3 className="font-bold">Talk to us directly</h3>
              <ul className="mt-4 space-y-3 text-sm">
                <li className="flex items-center gap-3"><Phone className="h-4 w-4" /> +234 902 993 2794</li>
              <li className="flex items-center gap-3"><MapPin className="h-4 w-4" /> Nigeria · Serving clients worldwide</li>
                <li className="flex items-center gap-3"><Mail className="h-4 w-4" /> support@ndh.com.ng</li>
                <li className="flex items-center gap-3"><Mail className="h-4 w-4" /> info@ndh.com.ng</li>
                <li className="flex items-center gap-3 text-xs text-muted-foreground">Mon–Fri · 9:00–18:00 WAT</li>
              </ul>
              <div className="mt-5 flex gap-3">
                <a href="https://www.facebook.com/share/1Be6HN8zjS/" target="_blank" rel="noreferrer" aria-label="Facebook" className="grid h-10 w-10 place-items-center rounded-full border border-border hover:bg-primary hover:text-primary-foreground"><Facebook className="h-4 w-4" /></a>
                <a href="https://www.instagram.com/njb_digital_hub" target="_blank" rel="noreferrer" aria-label="Instagram" className="grid h-10 w-10 place-items-center rounded-full border border-border hover:bg-primary hover:text-primary-foreground"><Instagram className="h-4 w-4" /></a>
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-card p-6 text-sm">
              <h3 className="font-semibold">Response times</h3>
              <ul className="mt-3 space-y-2 text-muted-foreground">
                <li>· Quotes: within 4 business hours</li>
                <li>· General enquiries: within 1 business day</li>
                <li>· Support tickets: within 1 business day</li>
              </ul>
            </div>
          </div>
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