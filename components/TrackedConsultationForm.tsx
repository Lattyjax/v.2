'use client'

import { useEffect, useState } from 'react'

type FormState = {
  name: string
  email: string
  phone: string
  message: string
  utm_source: string
  utm_medium: string
  utm_campaign: string
  utm_content: string
  utm_term: string
  page_path: string
  referrer: string
}

const initialState: FormState = {
  name: '',
  email: '',
  phone: '',
  message: '',
  utm_source: '',
  utm_medium: '',
  utm_campaign: '',
  utm_content: '',
  utm_term: '',
  page_path: '',
  referrer: '',
}

function getParam(key: string) {
  if (typeof window === 'undefined') return ''
  return new URLSearchParams(window.location.search).get(key) || ''
}

export default function TrackedConsultationForm() {
  const [form, setForm] = useState<FormState>(initialState)
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      utm_source: getParam('utm_source'),
      utm_medium: getParam('utm_medium'),
      utm_campaign: getParam('utm_campaign'),
      utm_content: getParam('utm_content'),
      utm_term: getParam('utm_term'),
      page_path: window.location.pathname,
      referrer: document.referrer || '',
    }))
  }, [])

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('submitting')

    try {
      const res = await fetch('/api/consultation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (!res.ok) throw new Error('Request failed')
      setStatus('success')
      setForm({ ...initialState, page_path: window.location.pathname, referrer: document.referrer || '' })
    } catch {
      setStatus('error')
    }
  }

  return (
    <form onSubmit={onSubmit} style={{ display: 'grid', gap: '1rem', maxWidth: 640 }}>
      <input name="name" value={form.name} onChange={onChange} placeholder="Name" required />
      <input name="email" type="email" value={form.email} onChange={onChange} placeholder="Email" required />
      <input name="phone" value={form.phone} onChange={onChange} placeholder="Phone" required />
      <textarea name="message" value={form.message} onChange={onChange} placeholder="How can we help?" rows={5} />

      <input type="hidden" name="utm_source" value={form.utm_source} />
      <input type="hidden" name="utm_medium" value={form.utm_medium} />
      <input type="hidden" name="utm_campaign" value={form.utm_campaign} />
      <input type="hidden" name="utm_content" value={form.utm_content} />
      <input type="hidden" name="utm_term" value={form.utm_term} />
      <input type="hidden" name="page_path" value={form.page_path} />
      <input type="hidden" name="referrer" value={form.referrer} />

      <button type="submit" disabled={status === 'submitting'}>
        {status === 'submitting' ? 'Submitting...' : 'Book Consultation'}
      </button>

      {status === 'success' && <p>Thanks — we received your request.</p>}
      {status === 'error' && <p>Something went wrong. Please try again.</p>}
    </form>
  )
}
