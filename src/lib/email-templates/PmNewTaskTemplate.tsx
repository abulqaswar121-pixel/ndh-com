import * as React from 'react'
import type { TemplateEntry } from './registry'
import { BrandedLayout, H1, P, CTA, InfoCard } from './BrandedLayout'

interface Props {
  pmName?: string
  taskTitle: string
  category: string
  tier: string
  clientName?: string
  budgetRange?: string
  deadline?: string
  taskUrl: string
}

const Email = ({ pmName, taskTitle, category, tier, clientName, budgetRange, deadline, taskUrl }: Props) => (
  <BrandedLayout preview={`New task: ${taskTitle}`}>
    <H1>New task assigned to you</H1>
    <P>Hi {pmName || 'PM'},</P>
    <P>A new task has been auto-routed to your queue. You have 24 hours to respond.</P>
    <InfoCard rows={[
      { k: 'Title', v: taskTitle },
      { k: 'Category', v: category },
      { k: 'Tier', v: tier },
      { k: 'Client', v: clientName || '—' },
      { k: 'Budget', v: budgetRange || '—' },
      { k: 'Deadline', v: deadline || 'Flexible' },
    ]} />
    <CTA href={taskUrl} label="Open task" />
  </BrandedLayout>
)

export const template = {
  component: Email,
  subject: (d: Record<string, any>) => `New task: ${d.taskTitle || 'NDH'}`,
  displayName: 'PM — New Task',
  previewData: { pmName: 'Yusuf', taskTitle: 'Brand identity', category: 'design', tier: 'professional', clientName: 'Aisha', budgetRange: '₦200k – ₦500k', deadline: 'Dec 31, 2025', taskUrl: 'https://ndh.com.ng/dashboard/pm' },
} satisfies TemplateEntry