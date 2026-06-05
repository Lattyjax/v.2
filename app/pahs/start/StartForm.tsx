'use client'

import { useMemo, useState, type CSSProperties } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { BRAND } from '@/lib/brand'
import { ensureLeadSessionId, getCurrentPageUrl } from '@/lib/lead'

const navyDark = '#16222d'
const gold = '#C49A6C'

type Status = 'idle' | 'submitting' | 'error'

export default function StartForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState('')

  const utm = useMemo(() => {
    const params = new URLSearchParams(searchParams?.toString())
    return {
      source: params.get('utm_source') || 'pahs',
      medium: params.get('utm_medium') || 'qr',
      campaign: params.get('utm_campaign') || 'football2026',
      term: params.get('utm_term') || null,
      content: params.get('utm_content') || 'bridge_page',
    }
  }, [searchParams])

  async function handleSubmit(formData: FormData) {
    setStatus('submitting')
    setError('')

    const firstName = String(formData.get('firstName') || '').trim()
    const lastName = String(formData.get('lastName') || '').trim()
    const email = String(formData.get('email') || '').trim()
    const phone = String(formData.get('phone') || '').trim()
    const county = String(formData.get('county') || '').trim()

    if (!email && !phone) {
      setStatus('error')
      setError('Add an email or phone number so the hub can capture your info before quote transfer.')
      return
    }

    const leadSessionId = ensureLeadSessionId()

    const payload = {
      firstName: firstName || null,
      lastName: lastName || null,
      email: email || null,
      phone: phone || null,
      county: county || null,
      productInterest: 'Term_Life',
      leadSessionId,
      source: utm.source,
      medium: utm.medium,
      campaign: utm.campaign,
      term: utm.term,
      content: utm.content,
      landingPage: getCurrentPageUrl(),
      notes: 'PAHS Football 2026 QR funnel lead',
      metadata: {
        campaignName: 'PAHS Football 2026',
        asset: 'sponsorship_qr',
        handoff: 'ethos',
      },
    }

    try {
      const leadRes = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!leadRes.ok) throw new Error('Lead capture failed')

      await fetch('/api/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: 'lead_created',
          leadSessionId,
          pageUrl: getCurrentPageUrl(),
          source: utm.source,
          medium: utm.medium,
          campaign: utm.campaign,
          productInterest: 'Term_Life',
          metadata: {
            county: county || null,
            handoff: 'ethos',
          },
        }),
      }).catch(() => null)

      const ethosUrl = new URL(BRAND.ethosUrl)
      ethosUrl.searchParams.set('utm_source', utm.source)
      ethosUrl.searchParams.set('utm_medium', utm.medium)
      ethosUrl.searchParams.set('utm_campaign', utm.campaign)
      if (utm.content) ethosUrl.searchParams.set('utm_content', utm.content)
      if (utm.term) ethosUrl.searchParams.set('utm_term', utm.term)

      router.push(ethosUrl.toString())
    } catch {
      setStatus('error')
      setError('The lead did not save to your hub. Fix the API before routing traffic here.')
    }
  }

  return (
    <form action={handleSubmit} style={{ display: 'grid', gap: 12 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <input name="firstName" placeholder="First name" style={inputStyle} />
        <input name="lastName" placeholder="Last name" style={inputStyle} />
      </div>
      <input name="email" type="email" placeholder="Email address" style={inputStyle} />
      <input name="phone" type="tel" placeholder="Phone number" style={inputStyle} />
      <select name="county" defaultValue="" style={{ ...inputStyle, color: 'white' }}>
        <option value="" disabled style={{ color: '#111827' }}>
          County (optional)
        </option>
        <option value="Schuylkill" style={{ color: '#111827' }}>Schuylkill</option>
        <option value="Luzerne" style={{ color: '#111827' }}>Luzerne</option>
        <option value="Northumberland" style={{ color: '#111827' }}>Northumberland</option>
      </select>

      <button
        type="submit"
        disabled={status === 'submitting'}
        style={{
          marginTop: 4,
          border: 'none',
          borderRadius: 16,
          padding: '16px 18px',
          background: gold,
          color: navyDark,
          fontWeight: 800,
          fontSize: '1rem',
          cursor: 'pointer',
          opacity: status === 'submitting' ? 0.8 : 1,
        }}
      >
        {status === 'submitting' ? 'Saving to hub…' : 'Continue to Quick Quote →'}
      </button>

      <a
        href={BRAND.cardUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: gold, textDecoration: 'none', fontWeight: 700, textAlign: 'center', marginTop: 2 }}
      >
        Digital Business Card
      </a>
      <a
        href={BRAND.baseUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: 'rgba(255,255,255,0.72)', textDecoration: 'none', fontWeight: 600, textAlign: 'center' }}
      >
        Website
      </a>

      <div style={{ color: 'rgba(255,255,255,0.62)', fontSize: '0.84rem', textAlign: 'center' }}>
        Your info hits the hub first, then routes to Ethos.
      </div>

      {error ? (
        <div style={{ color: '#fecaca', background: 'rgba(127,29,29,0.45)', border: '1px solid rgba(248,113,113,0.55)', borderRadius: 12, padding: 12, fontSize: '0.92rem' }}>
          {error}
        </div>
      ) : null}
    </form>
  )
}

const inputStyle: CSSProperties = {
  width: '100%',
  borderRadius: 14,
  border: '1px solid rgba(255,255,255,0.14)',
  background: 'rgba(255,255,255,0.06)',
  color: 'white',
  padding: '14px 14px',
  fontSize: '1rem',
  outline: 'none',
}
