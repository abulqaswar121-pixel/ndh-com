import * as React from 'react'
import type { TemplateEntry } from './registry'
import { BrandedLayout, H1, P, CTA, InfoCard } from './BrandedLayout'

interface Props {
  pmName?: string
  taskTitle: string
  status: 'approved' | 'rejected'
  amount?: string
  clientName?: string
  taskUrl: string
}

const Email = ({ pmName, taskTitle, status, amount, clientName, taskUrl }: Props) => (
  <BrandedLayout preview={`Quote ${status} — ${taskTitle}`}>
    <H1>Quote {status === 'approved' ? 'approved ✅' : 'rejected'}</H1>
    <P>Hi {pmName || 'PM'},</P>
    <P>
      {clientName || 'The client'} has <strong>{status}</strong> your quote for "{taskTitle}".
      {status === 'approved' ? ' Once payment lands, you can assign a talent.' : ' You can revise and resend.'}
    </P>
    <InfoCard rows={[
      { k: 'Task', v: taskTitle },
      { k: 'Amount', v: amount || '—' },
      { k: 'Status', v: status === 'approved' ? 'Approved' : 'Rejected' },
    ]} />
    <CTA href={taskUrl} label="Open task" />
  </BrandedLayout>
)

export const template = {
  component: Email,
  subject: (d: Record<string, any>) => `Quote ${d.status || 'updated'} — ${d.taskTitle || ''}`,
  displayName: 'PM — Quote Response',
  previewData: { pmName: 'Yusuf', taskTitle: 'Brand identity', status: 'approved', amount: '₦350,000', clientName: 'Aisha', taskUrl: 'https://ndh.com.ng/dashboard/pm' },
} satisfies TemplateEntry