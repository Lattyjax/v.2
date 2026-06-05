import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import { render } from '@react-email/render'
import * as React from 'react'

export const LatimoreLaunchEmail = () => (
  <Html>
    <Head />
    <Preview>Your secure gateway to legacy planning is officially live.</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Latimore Life &amp; Legacy Hub is Live</Heading>
        <Text style={text}>
          We&apos;ve completely re-engineered how you manage, track, and secure your financial
          future. The new Latimore Hub is built from the ground up for maximum security,
          instantaneous updates, and comprehensive asset protection.
        </Text>

        <Section style={productSection}>
          <Text style={productTitle}>11 Comprehensive Protection Pathways Now Open:</Text>
          <ul style={list}>
            <li>Mortgage Protection &amp; Final Expense</li>
            <li>Term, Whole, &amp; Child Whole Life Insurance</li>
            <li>Accident Insurance &amp; Critical Illness</li>
            <li>Indexed Universal Life (IUL) &amp; Annuities</li>
            <li>Retirement Planning &amp; Business Insurance</li>
          </ul>
        </Section>

        <Text style={text}>
          Powered by next-generation architecture, your data is fully encrypted, giving you
          real-time visibility into your coverage, analytics pipelines, and milestone goals.
        </Text>

        <Section style={btnContainer}>
          <Button style={button} href="https://latimorelifeandlegacy.com">
            Access Your Portal
          </Button>
        </Section>

        <Hr style={hr} />
        <Text style={footer}>
          Latimore Life &amp; Legacy &bull; Secure Next-Gen Protection &bull; This email was
          automatically generated via secure platform webhooks.
        </Text>
      </Container>
    </Body>
  </Html>
)

export async function renderLaunchEmail(): Promise<string> {
  return render(<LatimoreLaunchEmail />)
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
}

const container = { margin: '0 auto', padding: '20px 0 48px', width: '580px' }

const h1 = {
  color: '#1a1f36',
  fontSize: '24px',
  fontWeight: '600',
  lineHeight: '1.4',
  margin: '16px 0',
}

const text = {
  color: '#4f566b',
  fontSize: '16px',
  lineHeight: '1.6',
  textAlign: 'left' as const,
}

const productSection = {
  background: '#ffffff',
  border: '1px solid #e3e8ee',
  borderRadius: '4px',
  padding: '20px',
  margin: '20px 0',
}

const productTitle = {
  color: '#1a1f36',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 10px 0',
}

const list = { color: '#4f566b', fontSize: '15px', lineHeight: '1.8', paddingLeft: '20px' }

const btnContainer = { textAlign: 'center' as const, margin: '30px 0' }

const button = {
  backgroundColor: '#000000',
  borderRadius: '4px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
}

const hr = { borderColor: '#e6ebf1', margin: '20px 0' }

const footer = { color: '#8898aa', fontSize: '12px', lineHeight: '1.6' }
