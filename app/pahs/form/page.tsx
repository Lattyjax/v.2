'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import './form.css'

const COVERAGE_OPTIONS = [
  'Term w/ Living Benefits',
  'IUL',
  'Juvenile IUL',
  'Whole Life',
  'Retirement Income',
  'Annuities',
  'Mortgage Protection',
  'Not Sure Yet',
]

type FormData = {
  full_name: string
  phone: string
  email: string
  zip_code: string
  age: string
  coverage: string[]
  best_time: string
}

type Errors = Partial<Record<keyof FormData, string>>

function validate1(f: FormData): Errors {
  const e: Errors = {}
  if (!f.full_name.trim()) e.full_name = 'Please enter your full name.'
  if (!f.phone.trim() || f.phone.replace(/\D/g, '').length < 10) e.phone = 'Please enter a valid phone number.'
  if (!f.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) e.email = 'Please enter a valid email address.'
  return e
}
function validate2(f: FormData): Errors {
  const e: Errors = {}
  if (!f.age) e.age = 'Please select your age range.'
  if (!f.coverage.length) e.coverage = 'Please select at least one option.'
  return e
}
function validate3(f: FormData): Errors {
  const e: Errors = {}
  if (!f.best_time) e.best_time = 'Please select a preferred time.'
  return e
}

export default function PahsForm() {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<FormData>({ full_name: '', phone: '', email: '', zip_code: '', age: '', coverage: [], best_time: '' })
  const [errors, setErrors] = useState<Errors>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [done, setDone] = useState(false)

  const pct = Math.round((step / 3) * 100)

  function set(field: keyof FormData, value: string) {
    setForm(f => ({ ...f, [field]: value }))
    setErrors(e => ({ ...e, [field]: undefined }))
  }

  function toggleCoverage(val: string) {
    setForm(f => ({
      ...f,
      coverage: f.coverage.includes(val)
        ? f.coverage.filter(v => v !== val)
        : [...f.coverage, val],
    }))
    setErrors(e => ({ ...e, coverage: undefined }))
  }

  function nextStep() {
    const errs = step === 1 ? validate1(form) : step === 2 ? validate2(form) : {}
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setStep(s => s + 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function prevStep() {
    setErrors({})
    setStep(s => s - 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function submit() {
    const errs = validate3(form)
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSubmitting(true)
    setSubmitError('')
    try {
      const res = await fetch('/api/pahs-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.full_name.trim(),
          phone: form.phone.trim(),
          email: form.email.trim(),
          interest: form.coverage.join(', '),
          promo: [form.age && `Age: ${form.age}`, form.zip_code && `ZIP: ${form.zip_code}`, form.best_time && `Best time: ${form.best_time}`]
            .filter(Boolean).join(' | ') || undefined,
          source: 'pahs-form-v2',
          page: 'latimorelifelegacy.com/pahs/form',
        }),
      })
      if (!res.ok) throw new Error('Submission failed')
      setDone(true)
    } catch {
      setSubmitError('Something went wrong. Please try again or call Jackson at (717) 615-2613.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="pf-page">
      {/* Header */}
      <div className="pf-header">
        <div className="pf-badge">ALLSTAR Sponsor · PAHS Football 2026</div>
        <div className="pf-title">Your <span>Free</span> Protection Review</div>
        <p className="pf-sub">Takes under 2 minutes. No pressure, no obligation — just clarity for your family&apos;s future.</p>
        <div className="pf-trust-row">
          <div className="pf-trust-pill"><i className="fas fa-shield-heart" /> PA Licensed</div>
          <div className="pf-trust-pill"><i className="fas fa-lock" /> Secure &amp; Private</div>
          <div className="pf-trust-pill"><i className="fas fa-heart-pulse" /> #TheBeatGoesOn</div>
        </div>
      </div>

      <div className="pf-wrap">
        {/* Spotlight */}
        <div className="pf-spotlight">
          <Image
            src="/pahs-form-hero.jpeg"
            alt="2005 Coal Region All-Area Football Throwback featuring Jackson Latimore"
            width={1024}
            height={1024}
            className="pf-spotlight-img"
            priority
          />
          <div className="pf-spotlight-text">
            <h3>Where the Journey Began</h3>
            <p>Before sponsoring the 2026 PAHS Football season, Jackson&apos;s dedication started on the local gridiron as a 2005 Co-Defensive Player of the Year. Today, he brings that same relentless drive to protecting your family&apos;s future.</p>
          </div>
        </div>

        {/* Card */}
        <div className="pf-card">
          <div className="pf-card-header">
            <i className="fas fa-clipboard-list" />
            <div>
              <div className="pf-card-header-text">Protection Review Request</div>
              <div className="pf-card-header-sub">Jackson will follow up within 24 hours</div>
            </div>
          </div>

          {done ? (
            <div className="pf-success">
              <div className="pf-success-icon"><i className="fas fa-check" /></div>
              <div className="pf-success-title">You&apos;re All Set!</div>
              <p className="pf-success-body">Jackson will reach out within 24 hours. In the meantime, feel free to explore your options or connect on social.</p>
              <div className="pf-success-links">
                <a href="tel:+17176152613" className="pf-success-link primary">
                  <i className="fas fa-phone" /> Call Now — (717) 615-2613
                </a>
                <a href="https://www.latimorelifelegacy.com" className="pf-success-link secondary" target="_blank" rel="noopener noreferrer">
                  <i className="fas fa-globe" /> Visit Our Website
                </a>
              </div>
            </div>
          ) : (
            <>
              <div className="pf-body">
                {/* Progress */}
                <div className="pf-progress">
                  <div className="pf-progress-label">
                    <span>Step {step} of 3</span>
                    <span>{pct}%</span>
                  </div>
                  <div className="pf-progress-bar">
                    <div className="pf-progress-fill" style={{ width: `${pct}%` }} />
                  </div>
                </div>

                {/* Step 1 */}
                {step === 1 && (
                  <>
                    <div className="pf-step-title"><i className="fas fa-user" /> Contact Info</div>

                    <div className="pf-field">
                      <label htmlFor="full_name">Full Name <span className="req">*</span></label>
                      <input id="full_name" type="text" value={form.full_name} onChange={e => set('full_name', e.target.value)} placeholder="Jackson Latimore Sr." autoComplete="name" className={errors.full_name ? 'error' : ''} />
                      {errors.full_name && <div className="pf-field-error">{errors.full_name}</div>}
                    </div>

                    <div className="pf-field">
                      <label htmlFor="phone">Phone <span className="req">*</span></label>
                      <input id="phone" type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="(717) 555-0100" autoComplete="tel" className={errors.phone ? 'error' : ''} />
                      {errors.phone && <div className="pf-field-error">{errors.phone}</div>}
                    </div>

                    <div className="pf-field">
                      <label htmlFor="email">Email <span className="req">*</span></label>
                      <input id="email" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="you@email.com" autoComplete="email" className={errors.email ? 'error' : ''} />
                      {errors.email && <div className="pf-field-error">{errors.email}</div>}
                    </div>

                    <div className="pf-field">
                      <label htmlFor="zip_code">ZIP Code</label>
                      <input id="zip_code" type="text" value={form.zip_code} onChange={e => set('zip_code', e.target.value)} placeholder="17901" inputMode="numeric" maxLength={5} autoComplete="postal-code" />
                    </div>

                    <div className="pf-nav">
                      <button className="pf-btn-next" onClick={nextStep}>Next <i className="fas fa-arrow-right" /></button>
                    </div>
                  </>
                )}

                {/* Step 2 */}
                {step === 2 && (
                  <>
                    <div className="pf-step-title"><i className="fas fa-shield-heart" /> Coverage Interest</div>

                    <div className="pf-field">
                      <label htmlFor="age">Your Age <span className="req">*</span></label>
                      <div className="pf-select-wrap">
                        <select id="age" value={form.age} onChange={e => set('age', e.target.value)} className={errors.age ? 'error' : ''}>
                          <option value="">Select age range…</option>
                          {['18-29','30-39','40-49','50-59','60-69','70+'].map(a => (
                            <option key={a} value={a}>{a}</option>
                          ))}
                        </select>
                      </div>
                      {errors.age && <div className="pf-field-error">{errors.age}</div>}
                    </div>

                    <div className="pf-field">
                      <label>What are you most interested in? <span className="req">*</span></label>
                      <div className="pf-checkbox-grid">
                        {COVERAGE_OPTIONS.map(opt => (
                          <label key={opt} className={`pf-checkbox-item${form.coverage.includes(opt) ? ' checked' : ''}`}>
                            <input type="checkbox" checked={form.coverage.includes(opt)} onChange={() => toggleCoverage(opt)} />
                            <span>{opt}</span>
                          </label>
                        ))}
                      </div>
                      {errors.coverage && <div className="pf-field-error">{errors.coverage}</div>}
                    </div>

                    <div className="pf-nav">
                      <button className="pf-btn-back" onClick={prevStep}><i className="fas fa-arrow-left" /></button>
                      <button className="pf-btn-next" onClick={nextStep}>Next <i className="fas fa-arrow-right" /></button>
                    </div>
                  </>
                )}

                {/* Step 3 */}
                {step === 3 && (
                  <>
                    <div className="pf-step-title"><i className="fas fa-clock" /> Best Time to Reach You</div>

                    <div className="pf-field">
                      <label htmlFor="best_time">Best Time to Call <span className="req">*</span></label>
                      <div className="pf-select-wrap">
                        <select id="best_time" value={form.best_time} onChange={e => set('best_time', e.target.value)} className={errors.best_time ? 'error' : ''}>
                          <option value="">Select a time…</option>
                          <option value="Morning (8am–12pm)">Morning (8am – 12pm)</option>
                          <option value="Midday (12pm–2pm)">Midday (12pm – 2pm)</option>
                          <option value="Afternoon (2pm–5pm)">Afternoon (2pm – 5pm)</option>
                          <option value="Evening (5pm–7pm)">Evening (5pm – 7pm)</option>
                          <option value="Weekends">Weekends</option>
                          <option value="Anytime">Anytime works</option>
                        </select>
                      </div>
                      {errors.best_time && <div className="pf-field-error">{errors.best_time}</div>}
                    </div>

                    <div className="pf-summary">
                      <div className="pf-summary-label">Your Info</div>
                      <div className="pf-summary-content">
                        <strong>{form.full_name}</strong><br />
                        {form.phone} · {form.email}<br />
                        {form.zip_code && <>ZIP {form.zip_code} · </>}Age {form.age}<br />
                        <em>{form.coverage.join(', ') || '—'}</em>
                      </div>
                    </div>

                    <div className="pf-nav">
                      <button className="pf-btn-back" onClick={prevStep}><i className="fas fa-arrow-left" /></button>
                      <button className="pf-btn-submit" onClick={submit} disabled={submitting}>
                        {submitting ? <><i className="fas fa-spinner fa-spin" /> Sending…</> : <><i className="fas fa-shield-heart" /> Submit Request</>}
                      </button>
                    </div>

                    {submitError && <div className="pf-submit-error">{submitError}</div>}
                  </>
                )}
              </div>

              <div className="pf-card-footer">
                <p>
                  By submitting, you agree to be contacted by Latimore Life &amp; Legacy LLC regarding financial protection products.<br />
                  Your information is private and will never be sold.<br />
                  Licensed in Pennsylvania · NIPR #21638507
                </p>
              </div>
            </>
          )}
        </div>

        <div style={{ textAlign: 'center' }}>
          <Link href="/pahs" className="pf-back-link">
            <i className="fas fa-arrow-left" /> Back to Sponsor Page
          </Link>
        </div>
      </div>

      <div className="pf-page-footer">
        Jackson M. Latimore Sr. · Latimore Life &amp; Legacy LLC · Independent Financial Consultant<br />
        Affiliated with Global Financial Impact (GFI)<br />
        <a href="https://www.latimorelifelegacy.com" target="_blank" rel="noopener noreferrer">www.latimorelifelegacy.com</a> ·{' '}
        <a href="tel:+17176152613">(717) 615-2613</a>
      </div>
    </div>
  )
}
