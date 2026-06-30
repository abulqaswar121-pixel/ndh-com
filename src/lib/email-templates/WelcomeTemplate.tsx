import * as React from "react";
import { BrandedLayout, H1, P, CTA } from "./BrandedLayout";

export function WelcomeTemplate({ name, dashboardUrl }: { name?: string; dashboardUrl?: string }) {
  const url = dashboardUrl || "https://ndh.com.ng/dashboard/client";
  return (
    <BrandedLayout preview={`Welcome to Najeeb Digital Hub, ${name || "friend"}!`}>
      <H1>Welcome to NDH 🚀</H1>
      <P>Hi {name || "there"}, we're thrilled to have you on board.</P>
      <P>NDH is your premium digital services bureau — design, development, content, marketing, media & AI delivered by senior talent with project-manager oversight.</P>
      <P><strong>Get started in 3 steps:</strong></P>
      <P>1. Submit your first task from the dashboard.<br/>2. Approve the quote from your assigned PM.<br/>3. Pay securely and we begin work immediately.</P>
      <CTA href={url} label="Open my dashboard" />
      <P style={{ fontSize: 13 }}>Need help? Reply to this email or write to <a href="mailto:support@ndh.com.ng">support@ndh.com.ng</a>.</P>
    </BrandedLayout>
  );
}

export default WelcomeTemplate;