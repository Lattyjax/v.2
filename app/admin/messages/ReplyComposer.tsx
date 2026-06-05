'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

type Props = {
  contactId: string
  inquiryId?: string | null
  channel: 'email' | 'sms'
  defaultSubject?: string | null
  contactName: string
}

type DraftResponse = {
  ok: boolean
  draft?: {
    subject: string | null
    message: string
    rationale: string
    suggestedFollowUpDays: number
  }
  error?: string
}

export default function ReplyComposer({
  contactId,
  inquiryId,
  channel,
  defaultSubject,
  contactName,
}: Props) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [goal, setGoal] = useState(
    channel === 'email'
      ? `Reply to ${contactName} with a helpful follow-up and clear next step`
      : `Send ${contactName} a concise follow-up with a clear next step`
  )
  const [tone, setTone] = useState<'warm' | 'professional' | 'urgent' | 'friendly'>('professional')
  const [subject, setSubject] = useState(defaultSubject ?? '')
  const [message, setMessage] = useState('')
  const [rationale, setRationale] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isDrafting, startDrafting] = useTransition()
  const [isSending, startSending] = useTransition()

  async function handleDraft() {
    setError('')
    setSuccess('')

    startDrafting(async () => {
      try {
        const res = await fetch('/api/ai/draft-message', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contactId,
            inquiryId,
            channel,
            goal,
            tone,
          }),
        })

        const data: DraftResponse = await res.json()

        if (!res.ok || !data.ok || !data.draft) {
          setError(data?.error || 'Failed to generate AI draft')
          return
        }

        setSubject(data.draft.subject ?? '')
        setMessage(data.draft.message ?? '')
        setRationale(data.draft.rationale ?? '')
        setIsOpen(true)
      } catch {
        setError('Failed to generate AI draft')
      }
    })
  }

  async function handleSend() {
    setError('')
    setSuccess('')

    if (!message.trim()) {
      setError('Message is required')
      return
    }

    if (channel === 'email' && !subject.trim()) {
      setError('Subject is required for email')
      return
    }

    startSending(async () => {
      try {
        const res = await fetch('/api/messages/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contactId,
            inquiryId,
            channel,
            subject: channel === 'email' ? subject : undefined,
            message,
          }),
        })

        const data = await res.json()

        if (!res.ok || !data?.ok) {
          setError(data?.error || 'Failed to send message')
          return
        }

        setSuccess('Message sent successfully')
        setMessage('')
        if (channel === 'email') setSubject(defaultSubject ?? '')
        setRationale('')
        setIsOpen(false)
        router.refresh()
      } catch {
        setError('Failed to send message')
      }
    })
  }

  return (
    <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => {
            setError('')
            setSuccess('')
            setIsOpen((v) => !v)
          }}
          className="rounded-xl border border-white/10 px-3 py-2 text-sm text-white transition hover:bg-white/5"
        >
          {isOpen ? 'Close Reply' : `Reply via ${channel.toUpperCase()}`}
        </button>

        <button
          type="button"
          onClick={handleDraft}
          disabled={isDrafting}
          className="rounded-xl border border-[#C9A25F]/30 bg-[#C9A25F]/10 px-3 py-2 text-sm text-[#E7C98B] transition hover:bg-[#C9A25F]/15 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isDrafting ? 'Generating AI Draft...' : 'Generate AI Draft'}
        </button>
      </div>

      {isOpen ? (
        <div className="mt-4 space-y-4">
          <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-[#8F98A8]">
              Draft goal
            </label>
            <input
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#0F1115] px-4 py-3 text-sm text-white outline-none placeholder:text-[#667085]"
              placeholder="What should the AI draft try to accomplish?"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-[#8F98A8]">
              Tone
            </label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value as 'warm' | 'professional' | 'urgent' | 'friendly')}
              className="w-full rounded-xl border border-white/10 bg-[#0F1115] px-4 py-3 text-sm text-white outline-none"
            >
              <option value="professional">Professional</option>
              <option value="warm">Warm</option>
              <option value="friendly">Friendly</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          {channel === 'email' ? (
            <div>
              <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-[#8F98A8]">
                Subject
              </label>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#0F1115] px-4 py-3 text-sm text-white outline-none placeholder:text-[#667085]"
                placeholder="Subject line"
              />
            </div>
          ) : null}

          <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-[#8F98A8]">
              Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={8}
              className="w-full rounded-xl border border-white/10 bg-[#0F1115] px-4 py-3 text-sm text-white outline-none placeholder:text-[#667085]"
              placeholder="Write your message here..."
            />
          </div>

          {rationale ? (
            <div className="rounded-xl border border-[#C9A25F]/20 bg-[#C9A25F]/5 p-3">
              <p className="text-xs font-medium uppercase tracking-wide text-[#C9A25F]">AI rationale</p>
              <p className="mt-1 text-sm text-[#E6EAF0]">{rationale}</p>
            </div>
          ) : null}

          {error ? (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {error}
            </div>
          ) : null}

          {success ? (
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
              {success}
            </div>
          ) : null}

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleSend}
              disabled={isSending}
              className="rounded-xl bg-[#C9A25F] px-4 py-2 text-sm font-medium text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSending ? 'Sending...' : `Send ${channel.toUpperCase()}`}
            </button>

            <button
              type="button"
              onClick={handleDraft}
              disabled={isDrafting}
              className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Refresh AI Draft
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}