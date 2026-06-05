export const dynamic = 'force-dynamic'
import crypto from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { sendMail } from '@/lib/mailer'
import { InquiryNotification, ThankYou } from '@/emails/templates'
import { rateLimit } from '@/lib/rate-limit'
import { FilloutSchema } from '@/lib/schemas'
import { logger } from '@/lib/logger'
import { upsertLead } from '@/lib/hub/upsert-lead'
import { ingestEvent } from '@/lib/hub/ingest-event'

// Fillout can post either a flat key-value payload or its native
// { questions: [{name, value}], urlParameters: [{id, value}] } format.
// This normalizer collapses both into the flat shape FilloutSchema expects.
function normalizeFilloutPayload(raw: unknown): Record<string, unknown> {
  if (!raw || typeof raw !== 'object') return {}
  const body = raw as Record<string, unknown>

  // Already flat — nothing to do
  if (!Array.isArray(body.questions)) return body

  const questions = body.questions as { name?: string; value?: unknown }[]
  const urlParams = Array.isArray(body.urlParameters)
    ? (body.urlParameters as { id?: string; value?: unknown }[])
    : []

  function field(...keys: string[]): string | null {
    for (const key of keys) {
      const q = questions.find(q => (q.name ?? '').toLowerCase().includes(key.toLowerCase()))
      if (q?.value != null) return Array.isArray(q.value) ? q.value.join(', ') : String(q.value)
    }
    return null
  }

  function param(id: string): string | null {
    const p = urlParams.find(p => (p.id ?? '').toLowerCase() === id.toLowerCase())
    return p?.value != null ? String(p.value) : null
  }

  const fullName = field('full name', 'name') ?? ''
  const nameParts = fullName.trim().split(/\s+/)
  const firstName = field('first name') ?? nameParts[0] ?? null
  const lastName = field('last name') ?? (nameParts.length > 1 ? nameParts.slice(1).join(' ') : null)

  return {
    first_name: firstName,
    last_name: lastName,
    email: field('email'),
    phone: field('phone', 'mobile'),
    county: field('county', 'region'),
    product_interest: field('product', 'interest', 'insurance'),
    notes: field('message', 'notes', 'comments'),
    page_url: field('page url', 'landing page') ?? null,
    utm_source: param('utmsource'),
    utm_medium: param('utmmedium'),
    utm_campaign: param('utmcampaign'),
    utm_content: param('utmcontent'),
    utm_term: param('utmterm'),
    // click IDs — passed through to event metadata via .passthrough()
    fbclid: param('fbclid'),
    ttclid: param('ttclid'),
    gclid: param('gclid'),
  }
}

function normalizeSignature(sig: string): string {
  const value = sig.trim()
  const idx = value.indexOf('=')
  if (idx > -1 && value.slice(0, idx).toLowerCase().includes('sha256')) return value.slice(idx + 1).trim()
  return value
}

function verifySignature(rawBody: string, sig: string | null): boolean {
  const secret = process.env.FILLOUT_SECRET
  if (!secret) return false
  if (!sig) return false
  try {
    const normalized = normalizeSignature(sig)
    const hmac = crypto.createHmac('sha256', secret).update(rawBody).digest('hex')
    if (hmac.length !== normalized.length) return false
    return crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(normalized))
  } catch {
    return false
  }
}

function verifyWebhook(req: NextRequest, rawBody: string): boolean {
  const secret = process.env.FILLOUT_SECRET
  if (!secret) return false

  const token =
    req.headers.get('x-webhook-token') ??
    (req.headers.get('authorization')?.startsWith('Bearer ')
      ? req.headers.get('authorization')!.slice('Bearer '.length)
      : null)

  if (token) {
    try {
      const tokenBuf = Buffer.from(token)
      const secretBuf = Buffer.from(secret)
      if (tokenBuf.length === secretBuf.length && crypto.timingSafeEqual(tokenBuf, secretBuf)) return true
    } catch {
      // fall through to signature check
    }
  }

  const sig =
    req.headers.get('x-webhook-signature') ??
    req.headers.get('x-fillout-signature') ??
    req.headers.get('x-fillout-signature-256') ??
    req.headers.get('x-hook-signature')

  return verifySignature(rawBody, sig)
}

export async function POST(req: NextRequest) {
  const limited = await rateLimit(req, 'fillout')
  if (limited) return limited

  const raw = await req.text()
  if (!verifyWebhook(req, raw)) {
    logger.warn({}, 'Fillout webhook rejected')
    return NextResponse.json({ ok: false, error: 'invalid signature' }, { status: 401 })
  }

  let body: unknown
  try {
    body = raw ? JSON.parse(raw) : null
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid json' }, { status: 400 })
  }

  const normalized = normalizeFilloutPayload(body)
  const parse = FilloutSchema.safeParse(normalized)
  if (!parse.success) return NextResponse.json({ ok: false, error: parse.error.flatten() }, { status: 422 })

  const payload = parse.data
  const email = payload.email ?? null
  const productInterest =
    payload.product_interest ??
    payload.productInterest ??
    payload.interest_type ??
    payload.interestType ??
    'General'

  try {
    const { contact, inquiry } = await upsertLead({
      firstName: payload.first_name ?? payload.firstName ?? null,
      lastName: payload.last_name ?? payload.lastName ?? null,
      email,
      phone: payload.phone ?? null,
      county: payload.county ?? null,
      productInterest,
      leadSessionId: payload.lead_session_id ?? null,
      source: payload.utm_source ?? 'fillout',
      medium: payload.utm_medium ?? 'form',
      campaign: payload.utm_campaign ?? 'fillout',
      term: payload.utm_term ?? null,
      content: payload.utm_content ?? null,
      referrer: payload.referrer ?? null,
      landingPage: payload.page_url ?? payload.landing_page ?? null,
      notes: payload.notes ?? null,
      metadata: payload,
    })

    await ingestEvent({
      eventType: 'form_submit',
      leadSessionId: payload.lead_session_id ?? null,
      contactId: contact.id,
      inquiryId: inquiry.id,
      pageUrl: payload.page_url ?? payload.landing_page ?? null,
      referrer: payload.referrer ?? null,
      source: payload.utm_source ?? 'fillout',
      medium: payload.utm_medium ?? 'form',
      campaign: payload.utm_campaign ?? 'fillout',
      county: payload.county ?? null,
      productInterest,
      metadata: {
        provider: 'fillout',
        ...(payload.fbclid ? { fbclid: payload.fbclid } : {}),
        ...(payload.ttclid ? { ttclid: payload.ttclid } : {}),
        ...(payload.gclid ? { gclid: payload.gclid } : {}),
      },
    })

    if (process.env.NOTIFY_TO && process.env.THANKYOU_FROM) {
      const subject = `New ${productInterest} lead — ${[contact.firstName, contact.lastName].filter(Boolean).join(' ') || contact.email || contact.phone || inquiry.id}`

      void sendMail({
        to: process.env.NOTIFY_TO,
        from: process.env.THANKYOU_FROM,
        subject,
        html: InquiryNotification({
          firstName: contact.firstName ?? undefined,
          lastName: contact.lastName ?? undefined,
          email: contact.email ?? undefined,
          phone: contact.phone ?? undefined,
          productInterest,
          county: contact.county ?? undefined,
          leadSessionId: payload.lead_session_id ?? undefined,
          source: payload.utm_source ?? 'fillout',
          campaign: payload.utm_campaign ?? undefined,
        }),
      })

      if (contact.email) {
        void sendMail({
          to: contact.email,
          from: process.env.THANKYOU_FROM,
          subject: "You're on the list — let's find a time",
          html: ThankYou({ firstName: contact.firstName ?? undefined }),
        })
      }
    }

    return NextResponse.json({ ok: true, contactId: contact.id, inquiryId: inquiry.id })
  } catch (err: any) {
    logger.error({ err: err.message }, 'Fillout webhook error')
    return NextResponse.json({ ok: false, error: 'server error' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, status: 'Latimore Fillout webhook ready' })
}
