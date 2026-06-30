import * as React from 'react'
import type { TemplateEntry } from './registry'
import { BrandedLayout, H1, P, CTA, InfoCard } from './BrandedLayout'

interface Props {
  pmName?: string
  taskTitle: string
  talentName?: string
  fileCount?: number
  taskUrl: string
}

const Email = ({ pmName, taskTitle, talentName, fileCount, taskUrl }: Props) => (
  <BrandedLayout preview={`${talentName || 'Talent'} submitted work on ${taskTitle}`}>
    <H1>Work submitted for QA</H1>
    <P>Hi {pmName || 'PM'},</P>
    <P>{talentName || 'A talent'} submitted work on "{taskTitle}". Please review and either approve & deliver to client, or request revision.</P>
    <InfoCard rows={[
      { k: 'Task', v: taskTitle },
      { k: 'Talent', v: talentName || '—' },
      { k: 'Files', v: typeof fileCount === 'number' ? String(fileCount) : '—' },
    ]} />
    <CTA href={taskUrl} label="Review submission" />
  </BrandedLayout>
)

export const template = {
  component: Email,
  subject: (d: Record<string, any>) => `Work submitted: ${d.taskTitle || 'NDH'}`,
  displayName: 'PM — Talent Submission',
  previewData: { pmName: 'Yusuf', taskTitle: 'Brand identity', talentName: 'Zainab', fileCount: 3, taskUrl: 'https://ndh.com.ng/dashboard/pm' },
} satisfies TemplateEntry