import * as React from 'react'
import type { TemplateEntry } from './registry'
import { BrandedLayout, H1, P, CTA, InfoCard } from './BrandedLayout'

interface Props {
  fullName?: string
  department?: string
  tier?: number
  inviteUrl: string
}

const Email = ({ fullName, department, tier, inviteUrl }: Props) => (
  <BrandedLayout preview="You've been invited to join the NDH Talent Pool">
    <H1>You've been invited 🎉</H1>
    <P>Hi {fullName || 'there'},</P>
    <P>
      You've been hand-picked to join the <strong>Najeeb Digital Hub</strong> talent pool.
      Once you accept, you'll receive paid task assignments from your department PM.
    </P>
    <InfoCard rows={[
      { k: 'Department', v: department || '—' },
      { k: 'Starting tier', v: typeof tier === 'number' ? `Tier ${tier}` : '—' },
    ]} />
    <P>Click below to set your password and complete onboarding. Link valid for 14 days.</P>
    <CTA href={inviteUrl} label="Accept invitation" />
    <P>If the button doesn't work, paste this link into your browser: {inviteUrl}</P>
  </BrandedLayout>
)

export const template = {
  component: Email,
  subject: 'You have been invited to the NDH Talent Pool',
  displayName: 'Talent Invitation',
  previewData: { fullName: 'Aisha', department: 'Design', tier: 2, inviteUrl: 'https://ndh.com.ng/auth/accept' },
} satisfies TemplateEntry