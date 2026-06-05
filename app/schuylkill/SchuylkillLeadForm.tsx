'use client'

import { useState, type FormEvent } from 'react'
import { COLORS, BRAND } from '@/lib/brand'

const navy = COLORS.navy
const gold = COLORS.gold
const goldLight = COLORS.goldLight

type FormState = {
  name: string
  phone: string
  email: string
  productInterest: string
}

export default function SchuylkillLeadForm() {
  const [form, setForm] = useState<FormState>({
    name: '',
    phone: '',
    email: '',
    productInterest: '',
  })
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('submitting')
    setErrorMsg('')

    const [firstName, ...rest] = form.name.trim().split(' ')
    const lastName = rest.join(' ') || undefined

    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          phone: form.phone || undefined,
          email: form.email || undefined,
          productInterest: form.productInterest || undefined,
          county: 'Schuylkill',
          source: 'Schuylkill County Landing Page',
          landingPage: '/schuylkill',
          campaign: 'protecting-what-matters-most',
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.error ?? `HTTP ${res.status}`)
      }

      setStatus('success')
    } catch (err) {
      setStatus('error')
      setErrorMsg(err instanceof Error ? err.message : 'Submission failed. Please try again.')
    }
  }

  if (status === 'success') {
    return (
      <div
        style={{
          background: 'rgba(11,122,85,0.12)',
          border: '1px solid rgba(11,122,85,0.4)',
          borderRadius: 16,
          padding: '2rem',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>✅</div>
        <h3 style={{ color: navy, marginBottom: '0.5rem' }}>You&apos;re all set!</h3>
        <p style={{ color: '#475467', margin: 0 }}>
          Thank you! Jackson will reach out to you shortly to schedule your free consultation.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }} className="form-grid">
        <div style={{ gridColumn: 'span 2' }} className="form-full">
          <label
            htmlFor="sk-name"
            style={{ display: 'block', fontWeight: 600, color: navy, marginBottom: '0.4rem', fontSize: '0.9rem' }}
          >
            Full Name *
          </label>
          <input
            id="sk-name"
            type="text"
            required
            placeholder="Jackson M."
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            style={{
              width: '100%',
              padding: '12px 14px',
              border: '1.5px solid #d1d5db',
              borderRadius: 10,
              fontSize: '1rem',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div>
          <label
            htmlFor="sk-phone"
            style={{ display: 'block', fontWeight: 600, color: navy, marginBottom: '0.4rem', fontSize: '0.9rem' }}
          >
            Phone Number *
          </label>
          <input
            id="sk-phone"
            type="tel"
            required
            placeholder="(717) 615-2613"
            value={form.phone}
            onChange={e => setForm({ ...form, phone: e.target.value })}
            style={{
              width: '100%',
              padding: '12px 14px',
              border: '1.5px solid #d1d5db',
              borderRadius: 10,
              fontSize: '1rem',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div>
          <label
            htmlFor="sk-email"
            style={{ display: 'block', fontWeight: 600, color: navy, marginBottom: '0.4rem', fontSize: '0.9rem' }}
          >
            Email Address
          </label>
          <input
            id="sk-email"
            type="email"
            placeholder="jackson1989@latimorelegacy.com"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            style={{
              width: '100%',
              padding: '12px 14px',
              border: '1.5px solid #d1d5db',
              borderRadius: 10,
              fontSize: '1rem',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ gridColumn: 'span 2' }} className="form-full">
          <label
            htmlFor="sk-interest"
            style={{ display: 'block', fontWeight: 600, color: navy, marginBottom: '0.4rem', fontSize: '0.9rem' }}
          >
            I&apos;m most interested in... *
          </label>
          <select
            id="sk-interest"
            required
            value={form.productInterest}
            onChange={e => setForm({ ...form, productInterest: e.target.value })}
            style={{
              width: '100%',
              padding: '12px 14px',
              border: '1.5px solid #d1d5db',
              borderRadius: 10,
              fontSize: '1rem',
              background: '#fff',
              outline: 'none',
              boxSizing: 'border-box',
              color: form.productInterest ? navy : '#9ca3af',
            }}
          >
            <option value="" disabled>Select a topic...</option>
            <option value="Term_Life">Term Life with Living Benefits</option>
            <option value="IUL">Indexed Universal Life (IUL)</option>
            <option value="Child_Whole_Life">Juvenile IUL / Child Policy</option>
            <option value="Final_Expense">Final Expense Planning</option>
            <option value="General">General Financial Review</option>
          </select>
        </div>
      </div>

      {status === 'error' && (
        <div
          style={{
            marginTop: '1rem',
            padding: '12px 16px',
            background: '#fef2f2',
            border: '1px solid #fca5a5',
            borderRadius: 8,
            color: '#b91c1c',
            fontSize: '0.9rem',
          }}
        >
          {errorMsg}
        </div>
      )}

      <button
        type="submit"
        disabled={status === 'submitting'}
        style={{
          marginTop: '1.25rem',
          width: '100%',
          padding: '15px 24px',
          background: status === 'submitting' ? '#9ca3af' : gold,
          color: navy,
          fontWeight: 700,
          fontSize: '1.05rem',
          border: 'none',
          borderRadius: 999,
          cursor: status === 'submitting' ? 'not-allowed' : 'pointer',
          transition: 'transform .15s ease',
        }}
      >
        {status === 'submitting' ? 'Sending...' : '🛡️ Request My Free Consultation'}
      </button>

      <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: '0.82rem', marginTop: '0.75rem', marginBottom: 0 }}>
        No pressure. No obligation. Jackson will follow up personally.
      </p>

      <style>{`
        @media (max-width: 600px) {
          .form-grid { grid-template-columns: 1fr !important; }
          .form-full { grid-column: span 1 !important; }
        }
      `}</style>
    </form>
  )
}
