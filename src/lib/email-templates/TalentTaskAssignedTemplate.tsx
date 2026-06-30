import * as React from 'react'
import type { TemplateEntry } from './registry'
import { BrandedLayout, H1, P, CTA, InfoCard } from './BrandedLayout'

interface Props {
  talentName?: string
  taskTitle: string
  category: string
  tier: string
  payRate: string
  deadline: string
  taskUrl: string
}

const Email = ({ talentName, taskTitle, category, tier, payRate, deadline, taskUrl }: Props) => (
  <BrandedLayout preview={`New task assigned: ${taskTitle}`}>
    <H1>New task assigned to you</H1>
    <P>Hi {talentName || 'there'},</P>
    <P>Your PM has assigned you a new task. Please respond within 24 hours.</P>
    <InfoCard rows={[
      { k: 'Task', v: taskTitle },
      { k: 'Category', v: category },
      { k: 'Tier', v: tier },
      { k: 'Your pay rate', v: payRate },
      { k: 'Deadline', v: deadline },
    ]} />
    <CTA href={taskUrl} label="Review and respond" />
  </BrandedLayout>
)

export const template = {
  component: Email,
  subject: (d: Record<string, any>) => `New task assigned: ${d.taskTitle}`,
  displayName: 'Talent — Task Assigned',
  previewData: { talentName: 'Yusuf', taskTitle: 'Logo refresh', category: 'design', tier: 'professional', payRate: '₦40,000', deadline: 'Dec 31', taskUrl: '#' },
} satisfies TemplateEntry