export const dynamic = 'force-dynamic'
import crypto from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { rateLimit } from '@/lib/rate-limit'
import { BookingNotifySchema } from '@/lib/schemas'
import { logger } from '@/lib/logger'
import { recordAppointment } from '@/lib/hub/record-appointment'

function verifyWebhookSecret(req: NextRequest): boolean {
  const secret = process.env.BOOKING_WEBHOOK_SECRET
  if (!secret) return true
  const provided = req.headers.get('x-webhook-secret') ?? ''
  try {
    const a = Buffer.from(provided)
    const b = Buffer.from(secret)
    if (a.length !== b.length) return false
    return crypto.timingSafeEqual(a, b)
  } catch {
    return false
  }
}

export async function POST(req: NextRequest) {
  const limited = await rateLimit(req, 'booking')
  if (limited) return limited

  if (!verifyWebhookSecret(req)) {
    logger.warn({}, 'Booking webhook rejected')
    return NextResponse.json({ ok: false, error: 'invalid secret' }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  const parse = BookingNotifySchema.safeParse(body)
  if (!parse.success) return NextResponse.json({ ok: false, error: parse.error.flatten() }, { status: 422 })

  try {
    const result = await recordAppointment({
      inquiryId: parse.data.inquiryId ?? null,
      leadSessionId: parse.data.lead_session_id ?? null,
      gcalId: parse.data.gcal_id ?? null,
      scheduledFor: parse.data.scheduled_for ?? parse.data.start_at ?? null,
      endAt: parse.data.end_at ?? null,
      bookingSource: parse.data.booking_source ?? 'booking_webhook',
      source: parse.data.source ?? null,
      medium: parse.data.medium ?? null,
      campaign: parse.data.campaign ?? null,
      location: parse.data.location ?? null,
    })

    return NextResponse.json({ ok: true, inquiryId: result.inquiry.id, appointmentId: result.appointment.id })
  } catch (err: any) {
    logger.error({ err: err.message }, 'Booking webhook error')
    const status = /No matching inquiry/i.test(err.message) ? 404 : 500
    return NextResponse.json({ ok: false, error: status === 404 ? 'no matching inquiry' : 'server error' }, { status })
  }
}
