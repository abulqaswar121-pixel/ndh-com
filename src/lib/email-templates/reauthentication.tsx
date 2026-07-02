import * as React from 'react'
import { Section, Text } from '@react-email/components'
import { BrandedLayout, H1, P } from './BrandedLayout'

interface ReauthenticationEmailProps {
  token: string
}

export const ReauthenticationEmail = ({ token }: ReauthenticationEmailProps) => (
  <BrandedLayout preview="Your verification code">
    <H1>Confirm reauthentication</H1>
    <P>Use the code below to confirm your identity:</P>
    <Section style={{ background: '#f3f4f6', borderRadius: 10, padding: 18, textAlign: 'center', margin: '8px 0 16px' }}>
      <Text style={{ fontFamily: 'Courier, monospace', fontSize: 28, fontWeight: 800, color: '#0A0E2A', letterSpacing: 4, margin: 0 }}>
        {token}
      </Text>
    </Section>
    <P>This code will expire shortly. If you didn't request this, you can safely ignore this email.</P>
  </BrandedLayout>
)

export default ReauthenticationEmail