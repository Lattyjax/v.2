export const dynamic = 'force-dynamic'
export { handleOptions as OPTIONS } from '@/lib/hub/cors'
import { NextRequest, NextResponse } from 'next/server'
import { withCors } from '@/lib/hub/cors'
import { upsertLead } from '@/lib/hub/upsert-lead'
import { rateLimit } from '@/lib/rate-limit'
import { LeadIngestSchema } from '@/lib/schemas'
import { logger } from '@/lib/logger'

export const POST = withCors(async (req: NextRequest) => {
  const limited = await rateLimit(req, 'fillout')
  if (limited) return limited

  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 })

  // Map flat form fields to LeadIngestSchema shape
  const [firstName, ...rest] = (body.name ?? '').trim().split(/\s+/)
  const lastName = rest.join(' ') || undefined

  const parse = LeadIngestSchema.safeParse({
    firstName: firstName || undefined,
    lastName: lastName || undefined,
    email: body.email || undefined,
    phone: body.phone || undefined,
    notes: body.message || undefined,
    source: body.utm_source || undefined,
    medium: body.utm_medium || undefined,
    campaign: body.utm_campaign || undefined,
    content: body.utm_content || undefined,
    term: body.utm_term || undefined,
    landingPage: body.page_path || undefined,
    referrer: body.referrer || undefined,
  })

  if (!parse.success) {
    return NextResponse.json({ ok: false, error: parse.error.flatten() }, { status: 422 })
  }

  try {
    const { contact, inquiry } = await upsertLead(parse.data)
    return NextResponse.json({ ok: true, contactId: contact.id, inquiryId: inquiry.id })
  } catch (err: any) {
    logger.error({ err: err.message }, 'Consultation form ingest error')
    return NextResponse.json({ ok: false, error: 'server error' }, { status: 500 })
  }
})
