import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Section } from "@/components/site/Section";

export const Route = createFileRoute("/privacy")({
  head: () => ({ meta: [
    { title: "Privacy Policy — NDH" },
    { name: "description", content: "How Najeeb Digital Hub collects, uses, stores and protects the personal data of clients, students and talents across our services and academy." },
    { property: "og:title", content: "Privacy Policy · Najeeb Digital Hub" },
    { property: "og:description", content: "Transparent details on data collection, cookies, third-party processors and your rights to access, correct or delete your NDH data." },
  ]}),
  component: () => (
    <SiteLayout>
      <Section eyebrow="Legal" title="Privacy Policy">
        <div className="prose prose-neutral max-w-none text-foreground/80 dark:prose-invert">
          <p>We collect only what we need to deliver our services — contact details, project briefs, billing information and academy records. We never sell your data.</p>
          <h3>Cookies</h3><p>We use cookies to keep you signed in and to measure performance.</p>
          <h3>Data sharing</h3><p>We share data only with payment processors and infrastructure providers required to run NDH.</p>
          <h3>Your rights</h3><p>You can request access or deletion at any time by emailing <a href="mailto:admin@ndh.com.ng">admin@ndh.com.ng</a>.</p>
        </div>
      </Section>
    </SiteLayout>
  ),
});
