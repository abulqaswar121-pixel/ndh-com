import * as React from 'react'
import type { TemplateEntry } from './registry'
import { BrandedLayout, H1, P, CTA, InfoCard } from './BrandedLayout'

interface Props {
  pmName?: string
  department?: string
  weekOf?: string
  delivered?: number
  revenue?: string
  onTimeRate?: string
  satisfaction?: string
  dashboardUrl: string
}

const Email = ({ pmName, department, weekOf, delivered, revenue, onTimeRate, satisfaction, dashboardUrl }: Props) => (
  <BrandedLayout preview={`${department || 'Department'} weekly report`}>
    <H1>Your weekly report</H1>
    <P>Hi {pmName || 'PM'},</P>
    <P>Here's a snapshot of the {department || 'department'} for the week of {weekOf || 'this week'}:</P>
    <InfoCard rows={[
      { k: 'Tasks delivered', v: typeof delivered === 'number' ? String(delivered) : '0' },
      { k: 'Revenue', v: revenue || '—' },
      { k: 'On-time rate', v: onTimeRate || '—' },
      { k: 'Client satisfaction', v: satisfaction || '—' },
    ]} />
    <CTA href={dashboardUrl} label="Open dashboard" />
  </BrandedLayout>
)

export const template = {
  component: Email,
  subject: (d: Record<string, any>) => `Weekly report — ${d.department || 'NDH'}`,
  displayName: 'PM — Weekly Report',
  previewData: { pmName: 'Yusuf', department: 'Design', weekOf: 'Jun 23', delivered: 12, revenue: '₦1.4m', onTimeRate: '92%', satisfaction: '4.7/5', dashboardUrl: 'https://ndh.com.ng/dashboard/pm' },
} satisfies TemplateEntry