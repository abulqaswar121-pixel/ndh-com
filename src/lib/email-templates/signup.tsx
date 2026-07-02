import * as React from 'react'
import { BrandedLayout, H1, P, CTA } from './BrandedLayout'

interface SignupEmailProps {
  siteName: string
  siteUrl: string
  recipient: string
  confirmationUrl: string
}

export const SignupEmail = ({ siteName, recipient, confirmationUrl }: SignupEmailProps) => (
  <BrandedLayout preview={`Confirm your email for ${siteName}`}>
    <H1>Confirm your email</H1>
    <P>Thanks for signing up for <strong>{siteName}</strong>!</P>
    <P>Please confirm your email address (<strong>{recipient}</strong>) by clicking the button below:</P>
    <CTA href={confirmationUrl} label="Verify Email" />
    <P>If you didn't create an account, you can safely ignore this email.</P>
  </BrandedLayout>
)

export default SignupEmail