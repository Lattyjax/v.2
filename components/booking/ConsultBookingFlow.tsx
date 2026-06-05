'use client'

import type { ReactNode } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { buildFilloutParams } from '@/lib/lead'

type AvailabilityResponse = {
  ok: boolean
  timezone: string
  days: {
    date: string
    slots: string[]
  }[]
  error?: string
}

type BookingResponse = {
  ok: boolean
  error?: string
  appointmentId?: string
  inquiryId?: string
  contactId?: string
  scheduledFor?: string
  meetingUrl?: string | null
}

type FormState = {
  firstName: string
  lastName: string
  email: string
  phone: string

  mailingAddress: string
  city: string
  state: string
  zip: string
  dateOfBirth: string

  jobTitle: string
  height: string
  weight: string
  maritalStatus: '' | 'Single' | 'Married' | 'Separated' | 'Widowed'
  childrenCount: string
  healthConditions: string
  tobaccoUse: '' | 'Yes' | 'No'
  familyCriticalIllness: '' | 'Yes' | 'No' | 'Unsure'

  monthlyBudget: string
  hasExistingInsurance: '' | 'Yes' | 'No'
  existingInsuranceTypes: string[]
  willingToRefer: '' | 'Yes' | 'No'
  knowsSomeoneWhoBenefits: '' | 'Yes' | 'No' | 'Maybe'

  county: string
  productInterest: string
  notes: string

  leadSessionId: string
  pageUrl: string
  referrer: string
  source: string
  medium: string
  campaign: string
  term: string
  content: string
}

const initialState: FormState = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',

  mailingAddress: '',
  city: '',
  state: '',
  zip: '',
  dateOfBirth: '',

  jobTitle: '',
  height: '',
  weight: '',
  maritalStatus: '',
  childrenCount: '',
  healthConditions: '',
  tobaccoUse: '',
  familyCriticalIllness: '',

  monthlyBudget: '',
  hasExistingInsurance: '',
  existingInsuranceTypes: [],
  willingToRefer: '',
  knowsSomeoneWhoBenefits: '',

  county: '',
  productInterest: 'General',
  notes: '',

  leadSessionId: '',
  pageUrl: '',
  referrer: '',
  source: '',
  medium: '',
  campaign: '',
  term: '',
  content: '',
}

const insuranceOptions = [
  'Life Insurance',
  'Health Insurance',
  'Auto Insurance',
  'Home Insurance',
  'Travel Insurance',
  'Other',
]

const productOptions = [
  'General',
  'Mortgage_Protection',
  'Final_Expense',
  'Term_Life',
  'Whole_Life',
  'Child_Whole_Life',
  'Accident',
  'Critical_Illness',
  'IUL',
  'Annuity',
  'Retirement',
  'Business',
]

function classNames(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ')
}

function formatSlot(iso: string, timezone: string) {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: timezone,
  }).format(new Date(iso))
}

function formatDayLabel(date: string) {
  const d = new Date(`${date}T12:00:00`)
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(d)
}

export default function ConsultBookingFlow() {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<FormState>(initialState)
  const [availability, setAvailability] = useState<AvailabilityResponse | null>(null)
  const [availabilityLoading, setAvailabilityLoading] = useState(true)
  const [availabilityError, setAvailabilityError] = useState('')
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedSlot, setSelectedSlot] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [success, setSuccess] = useState<BookingResponse | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const params = new URLSearchParams(buildFilloutParams())
    setForm((prev) => ({
      ...prev,
      leadSessionId: params.get('lead_session_id') || '',
      pageUrl: params.get('page_url') || window.location.pathname,
      referrer: params.get('referrer') || '',
      source: params.get('utm_source') || '',
      medium: params.get('utm_medium') || '',
      campaign: params.get('utm_campaign') || '',
      term: params.get('utm_term') || '',
      content: params.get('utm_content') || '',
    }))
  }, [])

  useEffect(() => {
    let ignore = false

    async function loadAvailability() {
      setAvailabilityLoading(true)
      setAvailabilityError('')
      try {
        const res = await fetch('/api/availability', { cache: 'no-store' })
        const data: AvailabilityResponse = await res.json()
        if (!res.ok || !data.ok) {
          throw new Error(data.error || 'Failed to load availability')
        }
        if (!ignore) {
          setAvailability(data)
          const firstAvailableDay = data.days.find((d) => d.slots.length > 0)
          if (firstAvailableDay) setSelectedDate(firstAvailableDay.date)
        }
      } catch (error: any) {
        if (!ignore) setAvailabilityError(error?.message || 'Failed to load availability')
      } finally {
        if (!ignore) setAvailabilityLoading(false)
      }
    }

    loadAvailability()
    return () => {
      ignore = true
    }
  }, [])

  const selectedDay = useMemo(
    () => availability?.days.find((d) => d.date === selectedDate) ?? null,
    [availability, selectedDate]
  )

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function toggleInsuranceType(value: string) {
    setForm((prev) => ({
      ...prev,
      existingInsuranceTypes: prev.existingInsuranceTypes.includes(value)
        ? prev.existingInsuranceTypes.filter((v) => v !== value)
        : [...prev.existingInsuranceTypes, value],
    }))
  }

  function nextStep() {
    if (step === 1) {
      if (!form.firstName || !form.lastName || !form.email || !form.phone) {
        setSubmitError('Please complete your name, email, and phone number.')
        return
      }
    }

    if (step === 4) {
      if (!selectedSlot) {
        setSubmitError('Please select an appointment time.')
        return
      }
    }

    setSubmitError('')
    setStep((s) => Math.min(4, s + 1))
  }

  function prevStep() {
    setSubmitError('')
    setStep((s) => Math.max(1, s - 1))
  }

  async function submitBooking() {
    if (!selectedSlot) {
      setSubmitError('Please select an appointment time.')
      return
    }

    setSubmitting(true)
    setSubmitError('')

    try {
      const body = {
        ...form,
        childrenCount: form.childrenCount ? Number(form.childrenCount) : null,
        slotStart: selectedSlot,
      }

      const res = await fetch('/api/appointments/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data: BookingResponse = await res.json()

      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Failed to complete booking')
      }

      setSuccess(data)
    } catch (error: any) {
      setSubmitError(error?.message || 'Failed to complete booking')
    } finally {
      setSubmitting(false)
    }
  }

  if (success?.ok) {
    return (
      <div className="min-h-screen bg-[#0E1A2B] px-4 py-10 text-white">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-[28px] border border-[#C9A25F]/20 bg-white/[0.04] p-8 shadow-2xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-[#C9A25F]">
              Consultation Booked
            </p>
            <h1 className="text-3xl font-semibold md:text-4xl">You’re all set.</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[#D7DCE5] md:text-base">
              Your consultation has been scheduled successfully. A confirmation email will be sent shortly with the
              next steps.
            </p>

            {success.scheduledFor ? (
              <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-5">
                <p className="text-xs uppercase tracking-[0.22em] text-[#8F98A8]">Scheduled time</p>
                <p className="mt-2 text-lg font-medium text-white">
                  {formatSlot(success.scheduledFor, 'America/New_York')}
                </p>
              </div>
            ) : null}

            {success.meetingUrl ? (
              <a
                href={success.meetingUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-6 inline-flex rounded-xl bg-[#C9A25F] px-5 py-3 text-sm font-semibold text-black transition hover:opacity-90"
              >
                Open meeting details
              </a>
            ) : null}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0E1A2B] px-4 py-8 text-white md:px-6 md:py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-[#C9A25F]">
              Free 30-Minute Consultation
            </p>
            <h1 className="text-3xl font-semibold leading-tight md:text-5xl">
              Protect your family with a plan built around your real needs.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[#D7DCE5] md:text-base">
              Complete the intake below, then choose a time that works for your consultation. This helps us prepare a
              more useful conversation for you from the start.
            </p>
          </div>

          <div className="rounded-[24px] border border-[#C9A25F]/15 bg-white/[0.04] p-5">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-medium text-white">Progress</p>
              <p className="text-sm text-[#C9A25F]">Step {step} of 4</p>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className={classNames(
                    'h-2 rounded-full',
                    item <= step ? 'bg-[#C9A25F]' : 'bg-white/10'
                  )}
                />
              ))}
            </div>
            <div className="mt-5 text-sm text-[#D7DCE5]">
              {step === 1 && 'Contact details'}
              {step === 2 && 'Personal & health details'}
              {step === 3 && 'Coverage & referral details'}
              {step === 4 && 'Choose your appointment time'}
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 md:p-8">
            {step === 1 ? (
              <div className="space-y-6">
                <SectionTitle
                  title="Contact Information"
                  description="Tell us how to reach you and where you’re located."
                />

                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="First name" required>
                    <Input value={form.firstName} onChange={(v) => update('firstName', v)} />
                  </Field>
                  <Field label="Last name" required>
                    <Input value={form.lastName} onChange={(v) => update('lastName', v)} />
                  </Field>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Email address" required>
                    <Input type="email" value={form.email} onChange={(v) => update('email', v)} />
                  </Field>
                  <Field label="Phone number" required>
                    <Input value={form.phone} onChange={(v) => update('phone', v)} />
                  </Field>
                </div>

                <Field label="Mailing address">
                  <Input value={form.mailingAddress} onChange={(v) => update('mailingAddress', v)} />
                </Field>

                <div className="grid gap-4 md:grid-cols-3">
                  <Field label="City">
                    <Input value={form.city} onChange={(v) => update('city', v)} />
                  </Field>
                  <Field label="State">
                    <Input value={form.state} onChange={(v) => update('state', v)} />
                  </Field>
                  <Field label="ZIP">
                    <Input value={form.zip} onChange={(v) => update('zip', v)} />
                  </Field>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <Field label="Date of birth">
                    <Input type="date" value={form.dateOfBirth} onChange={(v) => update('dateOfBirth', v)} />
                  </Field>
                  <Field label="County">
                    <Input value={form.county} onChange={(v) => update('county', v)} />
                  </Field>
                  <Field label="Product interest">
                    <Select value={form.productInterest} onChange={(v) => update('productInterest', v)}>
                      {productOptions.map((option) => (
                        <option key={option} value={option}>
                          {option.replaceAll('_', ' ')}
                        </option>
                      ))}
                    </Select>
                  </Field>
                </div>
              </div>
            ) : null}

            {step === 2 ? (
              <div className="space-y-6">
                <SectionTitle
                  title="Personal & Health Details"
                  description="These answers help us prepare for a more productive consultation."
                />

                <div className="grid gap-4 md:grid-cols-3">
                  <Field label="Industry or job title">
                    <Input value={form.jobTitle} onChange={(v) => update('jobTitle', v)} />
                  </Field>
                  <Field label="Height">
                    <Input value={form.height} onChange={(v) => update('height', v)} />
                  </Field>
                  <Field label="Weight">
                    <Input value={form.weight} onChange={(v) => update('weight', v)} />
                  </Field>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <Field label="Marital status">
                    <Select value={form.maritalStatus} onChange={(v) => update('maritalStatus', v as FormState['maritalStatus'])}>
                      <option value="">Select</option>
                      <option value="Single">Single</option>
                      <option value="Married">Married</option>
                      <option value="Separated">Separated</option>
                      <option value="Widowed">Widowed</option>
                    </Select>
                  </Field>
                  <Field label="Number of children">
                    <Input type="number" value={form.childrenCount} onChange={(v) => update('childrenCount', v)} />
                  </Field>
                  <Field label="Do you use tobacco?">
                    <Select value={form.tobaccoUse} onChange={(v) => update('tobaccoUse', v as FormState['tobaccoUse'])}>
                      <option value="">Select</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </Select>
                  </Field>
                </div>

                <Field label="Current health conditions">
                  <Textarea value={form.healthConditions} onChange={(v) => update('healthConditions', v)} rows={5} />
                </Field>

                <Field label="Family history of critical illnesses?">
                  <Select
                    value={form.familyCriticalIllness}
                    onChange={(v) => update('familyCriticalIllness', v as FormState['familyCriticalIllness'])}
                  >
                    <option value="">Select</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                    <option value="Unsure">Unsure</option>
                  </Select>
                </Field>
              </div>
            ) : null}

            {step === 3 ? (
              <div className="space-y-6">
                <SectionTitle
                  title="Coverage & Referral Details"
                  description="Help us understand your current protection and budget expectations."
                />

                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Monthly budget">
                    <Input value={form.monthlyBudget} onChange={(v) => update('monthlyBudget', v)} placeholder="e.g. 100+" />
                  </Field>
                  <Field label="Do you already have insurance?">
                    <Select
                      value={form.hasExistingInsurance}
                      onChange={(v) => update('hasExistingInsurance', v as FormState['hasExistingInsurance'])}
                    >
                      <option value="">Select</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </Select>
                  </Field>
                </div>

                <Field label="Existing insurance policy types">
                  <div className="grid gap-3 md:grid-cols-2">
                    {insuranceOptions.map((option) => (
                      <label
                        key={option}
                        className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-[#E6EAF0]"
                      >
                        <input
                          type="checkbox"
                          checked={form.existingInsuranceTypes.includes(option)}
                          onChange={() => toggleInsuranceType(option)}
                          className="h-4 w-4 accent-[#C9A25F]"
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                </Field>

                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Are you willing to refer us to anyone?">
                    <Select value={form.willingToRefer} onChange={(v) => update('willingToRefer', v as FormState['willingToRefer'])}>
                      <option value="">Select</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </Select>
                  </Field>

                  <Field label="Anybody you know who would benefit from our services?">
                    <Select
                      value={form.knowsSomeoneWhoBenefits}
                      onChange={(v) => update('knowsSomeoneWhoBenefits', v as FormState['knowsSomeoneWhoBenefits'])}
                    >
                      <option value="">Select</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                      <option value="Maybe">Maybe</option>
                    </Select>
                  </Field>
                </div>

                <Field label="Anything else we should know before the consultation?">
                  <Textarea value={form.notes} onChange={(v) => update('notes', v)} rows={5} />
                </Field>
              </div>
            ) : null}

            {step === 4 ? (
              <div className="space-y-6">
                <SectionTitle
                  title="Choose Your Consultation Time"
                  description="Pick the time that works best for you. Availability is synced live."
                />

                {availabilityLoading ? (
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-5 text-sm text-[#D7DCE5]">
                    Loading available times...
                  </div>
                ) : availabilityError ? (
                  <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-5 text-sm text-red-200">
                    {availabilityError}
                  </div>
                ) : (
                  <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
                    <div className="space-y-3">
                      {availability?.days.map((day) => (
                        <button
                          key={day.date}
                          type="button"
                          onClick={() => {
                            setSelectedDate(day.date)
                            setSelectedSlot('')
                          }}
                          className={classNames(
                            'w-full rounded-2xl border px-4 py-3 text-left transition',
                            selectedDate === day.date
                              ? 'border-[#C9A25F]/40 bg-[#C9A25F]/10'
                              : 'border-white/10 bg-black/20 hover:bg-white/[0.04]'
                          )}
                        >
                          <div className="text-sm font-medium text-white">{formatDayLabel(day.date)}</div>
                          <div className="mt-1 text-xs text-[#8F98A8]">
                            {day.slots.length > 0 ? `${day.slots.length} available` : 'Unavailable'}
                          </div>
                        </button>
                      ))}
                    </div>

                    <div>
                      <div className="mb-3 flex items-center justify-between">
                        <p className="text-sm font-medium text-white">
                          {selectedDate ? formatDayLabel(selectedDate) : 'Select a date'}
                        </p>
                        <p className="text-xs uppercase tracking-[0.18em] text-[#8F98A8]">
                          {availability?.timezone || 'America/New_York'}
                        </p>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                        {selectedDay?.slots.length ? (
                          selectedDay.slots.map((slot) => (
                            <button
                              key={slot}
                              type="button"
                              onClick={() => setSelectedSlot(slot)}
                              className={classNames(
                                'rounded-2xl border px-4 py-3 text-sm font-medium transition',
                                selectedSlot === slot
                                  ? 'border-[#C9A25F]/40 bg-[#C9A25F] text-black'
                                  : 'border-white/10 bg-black/20 text-white hover:bg-white/[0.04]'
                              )}
                            >
                              {formatSlot(slot, availability?.timezone || 'America/New_York')}
                            </button>
                          ))
                        ) : (
                          <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-[#D7DCE5] sm:col-span-2 xl:col-span-3">
                            No available times on this day. Please choose another date.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : null}

            {submitError ? (
              <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {submitError}
              </div>
            ) : null}

            <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
              <div>
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white transition hover:bg-white/5"
                  >
                    Back
                  </button>
                ) : null}
              </div>

              <div className="flex gap-3">
                {step < 4 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="rounded-xl bg-[#C9A25F] px-5 py-3 text-sm font-semibold text-black transition hover:opacity-90"
                  >
                    Continue
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={submitBooking}
                    disabled={submitting || !selectedSlot}
                    className="rounded-xl bg-[#C9A25F] px-5 py-3 text-sm font-semibold text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitting ? 'Booking...' : 'Complete Booking'}
                  </button>
                )}
              </div>
            </div>
          </div>

          <aside className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#C9A25F]">
              Your Consultation
            </p>

            <div className="mt-4 space-y-4">
              <InfoRow label="Consultation length" value="30 minutes" />
              <InfoRow label="Timezone" value={availability?.timezone || 'America/New_York'} />
              <InfoRow
                label="Selected time"
                value={selectedSlot ? formatSlot(selectedSlot, availability?.timezone || 'America/New_York') : 'Not selected'}
              />
              <InfoRow
                label="Applicant"
                value={[form.firstName, form.lastName].filter(Boolean).join(' ') || 'Not provided yet'}
              />
              <InfoRow label="Email" value={form.email || 'Not provided yet'} />
              <InfoRow label="Phone" value={form.phone || 'Not provided yet'} />
              <InfoRow label="Product interest" value={form.productInterest.replaceAll('_', ' ')} />
            </div>

            <div className="mt-6 rounded-2xl border border-[#C9A25F]/20 bg-[#C9A25F]/5 p-4">
              <p className="text-sm leading-7 text-[#E6EAF0]">
                After booking, we’ll confirm your consultation and use your intake details to prepare for a more focused conversation.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

function SectionTitle({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <h2 className="text-2xl font-semibold text-white">{title}</h2>
      <p className="mt-2 max-w-2xl text-sm leading-7 text-[#D7DCE5]">{description}</p>
    </div>
  )
}

function Field({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-[#E6EAF0]">
        {label} {required ? <span className="text-[#C9A25F]">*</span> : null}
      </span>
      {children}
    </label>
  )
}

function Input({
  value,
  onChange,
  type = 'text',
  placeholder,
}: {
  value: string
  onChange: (value: string) => void
  type?: string
  placeholder?: string
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-[#667085] focus:border-[#C9A25F]/40"
    />
  )
}

function Textarea({
  value,
  onChange,
  rows = 4,
}: {
  value: string
  onChange: (value: string) => void
  rows?: number
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-[#667085] focus:border-[#C9A25F]/40"
    />
  )
}

function Select({
  value,
  onChange,
  children,
}: {
  value: string
  onChange: (value: string) => void
  children: ReactNode
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-[#C9A25F]/40"
    >
      {children}
    </select>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-[#8F98A8]">{label}</p>
      <p className="mt-2 text-sm text-white">{value}</p>
    </div>
  )
}