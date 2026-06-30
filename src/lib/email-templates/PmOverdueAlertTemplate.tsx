import * as React from 'react'
import type { TemplateEntry } from './registry'
import { BrandedLayout, H1, P, CTA, InfoCard } from './BrandedLayout'

interface Props {
  pmName?: string
  taskTitle: string
  hoursOverdue?: number
  taskUrl: string
}

const Email = ({ pmName, taskTitle, hoursOverdue, taskUrl }: Props) => (
  <BrandedLayout preview={`Overdue: ${taskTitle}`}>
    <H1>Task overdue ⚠️</H1>
    <P>Hi {pmName || 'PM'},</P>
    <P>The task "{taskTitle}" is past its first-response SLA. Please action it now to avoid escalation to your HOD.</P>
    <InfoCard rows={[
      { k: 'Task', v: taskTitle },
      { k: 'Hours overdue', v: typeof hoursOverdue === 'number' ? String(hoursOverdue) : '—' },
    ]} />
    <CTA href={taskUrl} label="Action now" />
  </BrandedLayout>
)

export const template = {
  component: Email,
  subject: (d: Record<string, any>) => `Overdue: ${d.taskTitle || 'task'}`,
  displayName: 'PM — Overdue Alert',
  previewData: { pmName: 'Yusuf', taskTitle: 'Brand identity', hoursOverdue: 6, taskUrl: 'https://ndh.com.ng/dashboard/pm' },
} satisfies TemplateEntry