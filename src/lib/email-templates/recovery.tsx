import * as React from 'react'
import { BrandedLayout, H1, P, CTA } from './BrandedLayout'

interface RecoveryEmailProps {
  siteName: string
  confirmationUrl: string
}

export const RecoveryEmail = ({ siteName, confirmationUrl }: RecoveryEmailProps) => (
  <BrandedLayout preview={`Reset your password for ${siteName}`}>
    <H1>Reset your password</H1>
    <P>We received a request to reset your password for {siteName}. Click the button below to choose a new password.</P>
    <CTA href={confirmationUrl} label="Reset Password" />
    <P>If you didn't request a password reset, you can safely ignore this email. Your password will not be changed.</P>
  </BrandedLayout>
)

export default RecoveryEmail