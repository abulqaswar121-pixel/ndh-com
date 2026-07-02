import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Section } from "@/components/site/Section";

export const Route = createFileRoute("/terms")({
  head: () => ({ meta: [
    { title: "Terms of Service — NDH" },
    { name: "description", content: "The terms governing your use of NDH services and academy." },
    { property: "og:title", content: "Terms of Service · Najeeb Digital Hub" },
    { property: "og:description", content: "The agreement between you and Najeeb Digital Hub covering briefs, escrow payments, deliveries, academy enrolment, refunds and dispute resolution." },
  ]}),
  component: () => (
    <SiteLayout>
      <Section eyebrow="Legal" title="Terms of Service">
        <div className="prose prose-neutral max-w-none text-foreground/80 dark:prose-invert">
          <p>By accessing or using NDH services, you agree to be bound by these terms. NDH operates as a managed digital bureau and online academy. Clients submit briefs to NDH; NDH assigns the work to its in-house talents and delivers the final output.</p>
          <h3>Services</h3><p>Quotes are produced per brief. Payment is held in escrow until delivery is approved.</p>
          <h3>Academy</h3><p>Enrolment requires payment of program fees. Certificates are issued upon successful completion.</p>
          <h3>Refunds</h3><p>Refunds are governed by the project agreement issued with each quote.</p>
          <h3>Contact</h3><p>For questions, email <a href="mailto:support@ndh.com.ng">support@ndh.com.ng</a>.</p>
        </div>
      </Section>
    </SiteLayout>
  ),
});
