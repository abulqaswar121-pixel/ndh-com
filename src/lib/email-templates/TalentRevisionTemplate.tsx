import * as React from 'react'
import type { TemplateEntry } from './registry'
import { BrandedLayout, H1, P, CTA, InfoCard } from './BrandedLayout'

interface Props { talentName?: string; taskTitle: string; notes?: string; taskUrl: string }

const Email = ({ talentName, taskTitle, notes, taskUrl }: Props) => (
  <BrandedLayout preview={`Revision requested on ${taskTitle}`}>
    <H1>Revision requested</H1>
    <P>Hi {talentName || 'there'}, your PM has asked for a revision on "{taskTitle}".</P>
    {notes ? <InfoCard rows={[{ k: 'PM notes', v: notes }]} /> : null}
    <CTA href={taskUrl} label="Open task" />
  </BrandedLayout>
)

export const template = {
  component: Email,
  subject: (d: Record<string, any>) => `Revision requested: ${d.taskTitle}`,
  displayName: 'Talent — Revision Requested',
  previewData: { taskTitle: 'Logo refresh', notes: 'Please adjust the spacing.', taskUrl: '#' },
} satisfies TemplateEntry