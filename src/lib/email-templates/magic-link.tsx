import * as React from 'react'
import { BrandedLayout, H1, P, CTA } from './BrandedLayout'

interface MagicLinkEmailProps {
  siteName: string
  confirmationUrl: string
}

export const MagicLinkEmail = ({ siteName, confirmationUrl }: MagicLinkEmailProps) => (
  <BrandedLayout preview={`Your login link for ${siteName}`}>
    <H1>Your login link</H1>
    <P>Click the button below to log in to {siteName}. This link will expire shortly.</P>
    <CTA href={confirmationUrl} label="Log In" />
    <P>If you didn't request this link, you can safely ignore this email.</P>
  </BrandedLayout>
)

export default MagicLinkEmail