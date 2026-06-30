import * as React from 'react'
import type { TemplateEntry } from './registry'
import { BrandedLayout, H1, P, CTA, InfoCard } from './BrandedLayout'

interface Props {
  fullName?: string
  department?: string
  inviteUrl: string
}

const Email = ({ fullName, department, inviteUrl }: Props) => (
  <BrandedLayout preview="You've been invited as a Project Manager at NDH">
    <H1>Welcome to the PM team 🚀</H1>
    <P>Hi {fullName || 'there'},</P>
    <P>
      You've been invited as a <strong>Project Manager</strong> at Najeeb Digital Hub.
      As a PM, you'll route incoming tasks, assign talents and deliver client work.
    </P>
    <InfoCard rows={[
      { k: 'Role', v: 'Project Manager' },
      { k: 'Department', v: department || '—' },
    ]} />
    <P>Click below to set your password and access your dashboard. Link valid for 14 days.</P>
    <CTA href={inviteUrl} label="Accept invitation" />
    <P>If the button doesn't work, paste this link into your browser: {inviteUrl}</P>
  </BrandedLayout>
)

export const template = {
  component: Email,
  subject: 'You have been invited as a Project Manager at NDH',
  displayName: 'PM Invitation',
  previewData: { fullName: 'Yusuf', department: 'Design', inviteUrl: 'https://ndh.com.ng/auth/accept' },
} satisfies TemplateEntry