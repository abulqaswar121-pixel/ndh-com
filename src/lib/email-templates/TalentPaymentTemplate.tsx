import * as React from 'react'
import type { TemplateEntry } from './registry'
import { BrandedLayout, H1, P, InfoCard, CTA } from './BrandedLayout'

interface Props { talentName?: string; amount: string; weekRange: string; dashboardUrl: string }

const Email = ({ talentName, amount, weekRange, dashboardUrl }: Props) => (
  <BrandedLayout preview={`Payment processed: ${amount}`}>
    <H1>Payment processed 💰</H1>
    <P>Hi {talentName || 'there'}, your earnings have been processed.</P>
    <InfoCard rows={[{ k: 'Amount', v: amount }, { k: 'Period', v: weekRange }]} />
    <CTA href={dashboardUrl} label="View earnings" />
  </BrandedLayout>
)

export const template = {
  component: Email,
  subject: (d: Record<string, any>) => `Payment of ${d.amount} processed`,
  displayName: 'Talent — Payment Processed',
  previewData: { amount: '₦120,000', weekRange: 'Dec 23 – Dec 29', dashboardUrl: '#' },
} satisfies TemplateEntry