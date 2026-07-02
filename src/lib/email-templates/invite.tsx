import * as React from 'react'
import { BrandedLayout, H1, P, CTA } from './BrandedLayout'

interface InviteEmailProps {
  siteName: string
  siteUrl: string
  confirmationUrl: string
}

export const InviteEmail = ({ siteName, confirmationUrl }: InviteEmailProps) => (
  <BrandedLayout preview={`You've been invited to join ${siteName}`}>
    <H1>You've been invited</H1>
    <P>You've been invited to join <strong>{siteName}</strong>. Click the button below to accept the invitation and create your account.</P>
    <CTA href={confirmationUrl} label="Accept Invitation" />
    <P>If you weren't expecting this invitation, you can safely ignore this email.</P>
  </BrandedLayout>
)

export default InviteEmail