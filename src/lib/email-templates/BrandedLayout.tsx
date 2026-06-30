import * as React from "react";
import {
  Body, Container, Head, Hr, Html, Img, Link, Preview, Section, Text,
} from "@react-email/components";

export function BrandedLayout({
  preview,
  children,
}: {
  preview: string;
  children: React.ReactNode;
}) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={{ backgroundColor: "#0A0E2A", margin: 0, fontFamily: "Inter, Arial, sans-serif" }}>
        <Container style={{ maxWidth: 600, margin: "0 auto", padding: 24 }}>
          <Section
            style={{
              background: "linear-gradient(135deg, #1D2A8C 0%, #2E7CF6 50%, #6F3FF5 100%)",
              padding: "28px 28px 22px",
              borderRadius: "16px 16px 0 0",
              textAlign: "center",
            }}
          >
            <Img
              src="https://ndh.com.ng/__l5e/assets-v1/e2b8c427-3850-4864-8770-e1dd30edd19b/ndh-logo.png"
              alt="NDH"
              width={56}
              height={56}
              style={{ display: "inline-block", borderRadius: 12 }}
            />
            <Text style={{ color: "#fff", fontWeight: 800, fontSize: 18, margin: "10px 0 0", letterSpacing: 0.6 }}>
              NAJEEB DIGITAL HUB
            </Text>
            <Text style={{ color: "rgba(255,255,255,0.85)", fontSize: 12, margin: 0 }}>
              Where Digital Excellence Meets Opportunity
            </Text>
          </Section>
          <Section style={{ background: "#ffffff", padding: "28px 28px 8px", borderRadius: "0 0 16px 16px" }}>
            {children}
            <Hr style={{ borderColor: "#e5e7eb", margin: "28px 0 16px" }} />
            <Text style={{ fontSize: 11, color: "#6b7280", lineHeight: "16px", margin: 0 }}>
              Najeeb Digital Hub · Sokoto, Nigeria · {" "}
              <Link href="mailto:support@ndh.com.ng" style={{ color: "#2E7CF6" }}>support@ndh.com.ng</Link>
              {" · "}
              <Link href="https://ndh.com.ng" style={{ color: "#2E7CF6" }}>ndh.com.ng</Link>
            </Text>
            <Text style={{ fontSize: 11, color: "#9ca3af", margin: "6px 0 0" }}>
              You're receiving this email because you have an account with NDH. {" "}
              <Link href="{{UNSUBSCRIBE_URL}}" style={{ color: "#9ca3af", textDecoration: "underline" }}>
                Unsubscribe
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export function CTA({ href, label }: { href: string; label: string }) {
  return (
    <Section style={{ textAlign: "center", margin: "20px 0 8px" }}>
      <Link
        href={href}
        style={{
          background: "linear-gradient(135deg, #2E7CF6 0%, #6F3FF5 100%)",
          color: "#fff",
          padding: "12px 22px",
          borderRadius: 10,
          fontWeight: 700,
          textDecoration: "none",
          fontSize: 14,
          display: "inline-block",
        }}
      >
        {label}
      </Link>
    </Section>
  );
}

export function H1({ children }: { children: React.ReactNode }) {
  return (
    <Text style={{ fontSize: 22, fontWeight: 800, color: "#0A0E2A", margin: "8px 0 12px" }}>
      {children}
    </Text>
  );
}

export function P({ children }: { children: React.ReactNode }) {
  return (
    <Text style={{ fontSize: 14, lineHeight: "22px", color: "#1f2937", margin: "0 0 12px" }}>
      {children}
    </Text>
  );
}

export function InfoCard({ rows }: { rows: { k: string; v: React.ReactNode }[] }) {
  return (
    <Section style={{ background: "#f3f4f6", borderRadius: 10, padding: 14, margin: "8px 0 16px" }}>
      {rows.map((r, i) => (
        <Text key={i} style={{ fontSize: 13, margin: "0 0 4px", color: "#1f2937" }}>
          <strong style={{ color: "#0A0E2A" }}>{r.k}: </strong>
          <span>{r.v}</span>
        </Text>
      ))}
    </Section>
  );
}