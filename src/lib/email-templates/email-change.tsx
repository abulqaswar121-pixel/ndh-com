import * as React from 'react'
import { BrandedLayout, H1, P, CTA } from './BrandedLayout'

interface EmailChangeEmailProps {
  siteName: string
  oldEmail: string
  email: string
  newEmail: string
  confirmationUrl: string
}

export const EmailChangeEmail = ({ siteName, oldEmail, newEmail, confirmationUrl }: EmailChangeEmailProps) => (
  <BrandedLayout preview={`Confirm your email change for ${siteName}`}>
    <H1>Confirm your email change</H1>
    <P>You requested to change your email address for {siteName} from <strong>{oldEmail}</strong> to <strong>{newEmail}</strong>.</P>
    <P>Click the button below to confirm this change:</P>
    <CTA href={confirmationUrl} label="Confirm Email Change" />
    <P>If you didn't request this change, please secure your account immediately.</P>
  </BrandedLayout>
)

export default EmailChangeEmail