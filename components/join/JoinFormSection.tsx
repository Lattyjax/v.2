'use client'

import { useState, useEffect } from 'react'
import { buildFilloutParams } from '@/lib/lead'
import Link from 'next/link'

type JoinPath = 'partnership' | 'agent' | 'both' | null

const navy = '#0E1A2B'
const gold = '#C9A24D'

export default function JoinFormSection() {
  const [selectedPath, setSelectedPath] = useState<JoinPath>(null)
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    organizationName: '',
    organizationType: '',
    partnershipGoal: '',
    currentRole: '',
    isLicensed: '',
    interestType: '',
    agentMotivation: '',
    howHeard: '',
    referralSource: '',
    additionalNotes: '',
    leadSessionId: '',
    pageUrl: '',
    referrer: '',
    source: '',
    medium: '',
    campaign: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(buildFilloutParams())
    setForm((prev) => ({
      ...prev,
      leadSessionId: params.get('lead_session_id') || '',
      pageUrl: window.location.pathname,
      referrer: params.get('referrer') || '',
      source: params.get('utm_source') || 'website',
      medium: 'join',
      campaign: params.get('utm_campaign') || 'join',
    }))
  }, [])

  function update(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!form.firstName || !form.lastName || !form.email || !form.phone) {
      setError('Please complete all required contact fields.')
      return
    }

    if (selectedPath === 'partnership' && !form.organizationName) {
      setError('Please provide your organization name.')
      return
    }

    if (selectedPath === 'agent' && !form.currentRole) {
      setError('Please provide your current occupation or role.')
      return
    }

    setSubmitting(true)

    try {
      const res = await fetch('/api/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          applicationType: selectedPath,
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Submission failed')
      }

      setSuccess(true)
    } catch (err: any) {
      setError(err?.message || 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const showPartnership = selectedPath === 'partnership' || selectedPath === 'both'
  const showAgent = selectedPath === 'agent' || selectedPath === 'both'

  if (success) {
    return (
      <section id="apply" style={{ padding: '4rem 0', background: '#f9fafb' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 20px' }}>
          <div
            style={{
              background: '#fff',
              border: '1px solid #e2e8f0',
              borderRadius: 18,
              padding: '3rem 2rem',
              boxShadow: '0 14px 40px rgba(15,53,85,.10)',
              textAlign: 'center',
            }}
          >
            <p style={{ color: gold, fontWeight: 700, fontSize: '.9rem', textTransform: 'uppercase', letterSpacing: '.15em', marginBottom: 12 }}>
              Thank You
            </p>
            <h2 style={{ fontSize: 'clamp(1.8rem,3vw,2.4rem)', color: navy, margin: '0 0 16px' }}>
              We've received your interest.
            </h2>
            <p style={{ color: '#475467', fontSize: '1.05rem', lineHeight: 1.7, margin: '0 0 2rem', maxWidth: '60ch', marginLeft: 'auto', marginRight: 'auto' }}>
              {selectedPath === 'partnership' && 'Thank you for exploring a partnership with us. Were excited to learn how we can serve your community together.'}
              {selectedPath === 'agent' && 'Thank you for your interest in joining our mission. Were excited to explore how we can support your growth.'}
              {selectedPath === 'both' && 'Thank you for your interest in working with us. Well reach out to discuss which path might be the best fit.'}
            </p>

            <div style={{ background: '#f9fafb', borderRadius: 12, padding: '1.5rem', textAlign: 'left', marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.1rem', color: navy, margin: '0 0 1rem' }}>What happens next</h3>
              <ol style={{ paddingLeft: 20, margin: 0, color: '#475467', fontSize: '.95rem', lineHeight: 1.8 }}>
                <li>We'll review your submission and gather context about your goals.</li>
                <li>Expect a call or email from us <strong>within 2 business days</strong>.</li>
                <li>We'll schedule a brief 15-minute intro conversation to explore fit.</li>
                <li>If it's a mutual fit, we'll outline next steps together—no pressure.</li>
              </ol>
            </div>

            <Link href="/" style={{ display: 'inline-block', background: gold, color: navy, padding: '12px 24px', borderRadius: 999, fontWeight: 700, textDecoration: 'none' }}>
              Back to Home
            </Link>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="apply" style={{ padding: '4rem 0', background: '#f9fafb' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 20px' }}>
        <h2 style={{ fontSize: 'clamp(1.5rem,2.4vw,2.2rem)', color: navy, margin: '0 0 12px', textAlign: 'center' }}>
          {selectedPath ? 'Complete your interest form' : 'How would you like to work with us?'}
        </h2>
        <p style={{ color: '#667085', maxWidth: '72ch', margin: '0 auto 2rem', textAlign: 'center' }}>
          {selectedPath
            ? 'Well follow up within 2 business days to schedule an intro conversation.'
            : 'Choose the path that fits your goals. Well explore the details together.'}
        </p>

        {!selectedPath ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18 }}>
            {[
              {
                path: 'partnership' as JoinPath,
                title: 'Partner With Us',
                desc: 'For schools, churches, gyms, nonprofits, and businesses looking to serve their communities with trusted financial education and protection resources.',
              },
              {
                path: 'agent' as JoinPath,
                title: 'Grow With Us',
                desc: 'For individuals seeking a meaningful career helping families protect what matters most—with training, mentorship, and flexible paths.',
              },
            ].map(({ path, title, desc }) => (
              <button
                key={path}
                type="button"
                onClick={() => setSelectedPath(path)}
                style={{
                  background: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: 18,
                  padding: '2rem 1.5rem',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all .2s ease',
                  boxShadow: '0 14px 40px rgba(15,53,85,.10)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = gold
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e2e8f0'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                <h3 style={{ fontSize: '1.3rem', color: navy, margin: '0 0 10px' }}>{title}</h3>
                <p style={{ color: '#475467', fontSize: '.95rem', lineHeight: 1.6, margin: 0 }}>{desc}</p>
                <p style={{ color: gold, fontSize: '.9rem', fontWeight: 600, marginTop: '1rem' }}>Explore →</p>
              </button>
            ))}

            <div style={{ gridColumn: '1 / -1', textAlign: 'center', marginTop: 12 }}>
              <button
                type="button"
                onClick={() => setSelectedPath('both')}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#667085',
                  fontSize: '.9rem',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                Not sure which fits best? Let us know you're interested in both.
              </button>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            style={{
              background: '#fff',
              border: '1px solid #e2e8f0',
              borderRadius: 18,
              padding: '2rem',
              boxShadow: '0 14px 40px rgba(15,53,85,.10)',
            }}
          >
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.3rem', color: navy, margin: 0 }}>
                {selectedPath === 'partnership' && 'Partnership Interest'}
                {selectedPath === 'agent' && 'Agent Opportunity Interest'}
                {selectedPath === 'both' && 'Join Interest'}
              </h3>
              <button
                type="button"
                onClick={() => setSelectedPath(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#667085',
                  fontSize: '.9rem',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
              >
                ← Change path
              </button>
            </div>

            <div style={{ display: 'grid', gap: '1.5rem' }}>
              {/* Contact */}
              <SectionTitle>Contact Information</SectionTitle>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <Field label="First name *">
                  <Input value={form.firstName} onChange={(v) => update('firstName', v)} />
                </Field>
                <Field label="Last name *">
                  <Input value={form.lastName} onChange={(v) => update('lastName', v)} />
                </Field>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <Field label="Email *">
                  <Input type="email" value={form.email} onChange={(v) => update('email', v)} />
                </Field>
                <Field label="Phone *">
                  <Input value={form.phone} onChange={(v) => update('phone', v)} />
                </Field>
              </div>

              {/* Partnership */}
              {showPartnership && (
                <>
                  <SectionTitle>About Your Organization</SectionTitle>
                  <Field label={`Organization name ${selectedPath === 'partnership' ? '*' : ''}`}>
                    <Input value={form.organizationName} onChange={(v) => update('organizationName', v)} />
                  </Field>
                  <Field label="Organization type">
                    <Select value={form.organizationType} onChange={(v) => update('organizationType', v)}>
                      <option value="">Select type</option>
                      <option value="church">Church / Faith Community</option>
                      <option value="school">School / Educational Institution</option>
                      <option value="gym">Gym / Wellness Center</option>
                      <option value="nonprofit">Nonprofit / Community Organization</option>
                      <option value="business">Small Business / Employer</option>
                      <option value="other">Other</option>
                    </Select>
                  </Field>
                  <Field label="What are you hoping to provide for your community?">
                    <Textarea value={form.partnershipGoal} onChange={(v) => update('partnershipGoal', v)} />
                  </Field>
                </>
              )}

              {/* Agent */}
              {showAgent && (
                <>
                  <SectionTitle>About You</SectionTitle>
                  <Field label={`Current occupation or role ${selectedPath === 'agent' ? '*' : ''}`}>
                    <Input value={form.currentRole} onChange={(v) => update('currentRole', v)} />
                  </Field>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    <Field label="Currently licensed?">
                      <Select value={form.isLicensed} onChange={(v) => update('isLicensed', v)}>
                        <option value="">Select</option>
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                        <option value="in_process">In process</option>
                      </Select>
                    </Field>
                    <Field label="Interested in">
                      <Select value={form.interestType} onChange={(v) => update('interestType', v)}>
                        <option value="">Select</option>
                        <option value="part_time">Part-time</option>
                        <option value="full_time">Full-time</option>
                        <option value="exploring">Exploring both</option>
                      </Select>
                    </Field>
                  </div>
                  <Field label="What interests you about this opportunity?">
                    <Textarea value={form.agentMotivation} onChange={(v) => update('agentMotivation', v)} />
                  </Field>
                </>
              )}

              {/* Universal */}
              <SectionTitle>How can we reach you?</SectionTitle>
              <Field label="How did you hear about this opportunity?">
                <Select value={form.howHeard} onChange={(v) => update('howHeard', v)}>
                  <option value="">Select</option>
                  <option value="website">Latimore website</option>
                  <option value="referral">Referral from someone</option>
                  <option value="social">Social media</option>
                  <option value="event">Community event</option>
                  <option value="other">Other</option>
                </Select>
              </Field>

              {form.howHeard === 'referral' && (
                <Field label="Who referred you? (optional)">
                  <Input value={form.referralSource} onChange={(v) => update('referralSource', v)} />
                </Field>
              )}

              <Field label="Additional notes or questions (optional)">
                <Textarea value={form.additionalNotes} onChange={(v) => update('additionalNotes', v)} rows={3} />
              </Field>

              {error && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: '12px 16px', color: '#991b1b', fontSize: '.9rem' }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                style={{
                  background: gold,
                  color: navy,
                  padding: '14px 28px',
                  borderRadius: 999,
                  fontWeight: 700,
                  fontSize: '1rem',
                  border: 'none',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  opacity: submitting ? 0.6 : 1,
                  transition: 'opacity .2s ease',
                }}
              >
                {submitting ? 'Submitting...' : 'Submit Interest'}
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h4 style={{ fontSize: '1.1rem', color: '#0E1A2B', fontWeight: 600, margin: 0 }}>{children}</h4>
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'block' }}>
      <span style={{ display: 'block', marginBottom: 6, fontSize: '.9rem', color: '#475467', fontWeight: 500 }}>{label}</span>
      {children}
    </label>
  )
}

function Input({ value, onChange, type = 'text' }: { value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: '100%',
        padding: '12px 14px',
        borderRadius: 10,
        border: '1px solid #d1d5db',
        fontSize: '.95rem',
        outline: 'none',
        transition: 'border-color .2s ease',
      }}
      onFocus={(e) => (e.currentTarget.style.borderColor = '#C9A24D')}
      onBlur={(e) => (e.currentTarget.style.borderColor = '#d1d5db')}
    />
  )
}

function Select({ value, onChange, children }: { value: string; onChange: (v: string) => void; children: React.ReactNode }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: '100%',
        padding: '12px 14px',
        borderRadius: 10,
        border: '1px solid #d1d5db',
        fontSize: '.95rem',
        outline: 'none',
        transition: 'border-color .2s ease',
      }}
      onFocus={(e) => (e.currentTarget.style.borderColor = '#C9A24D')}
      onBlur={(e) => (e.currentTarget.style.borderColor = '#d1d5db')}
    >
      {children}
    </select>
  )
}

function Textarea({ value, onChange, rows = 4 }: { value: string; onChange: (v: string) => void; rows?: number }) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      style={{
        width: '100%',
        padding: '12px 14px',
        borderRadius: 10,
        border: '1px solid #d1d5db',
        fontSize: '.95rem',
        outline: 'none',
        resize: 'vertical',
        transition: 'border-color .2s ease',
      }}
      onFocus={(e) => (e.currentTarget.style.borderColor = '#C9A24D')}
      onBlur={(e) => (e.currentTarget.style.borderColor = '#d1d5db')}
    />
  )
}