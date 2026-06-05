export const dynamic = 'force-dynamic'
export { handleOptions as OPTIONS } from '@/lib/hub/cors'
import { NextRequest, NextResponse } from 'next/server'
import { EventType, ProductInterest } from '@prisma/client'
import { withCors } from '@/lib/hub/cors'
import { extractAttribution } from '@/lib/hub/extract-attribution'
import { ingestEvent } from '@/lib/hub/ingest-event'
import { rateLimit } from '@/lib/rate-limit'
import { logger } from '@/lib/logger'

const VALID_EVENT_TYPES = new Set(Object.values(EventType))
const VALID_PRODUCTS = new Set(Object.values(ProductInterest))

export const POST = withCors(async (req: NextRequest) => {
  const limited = await rateLimit(req, 'event')
  if (limited) return limited

  const body = await req.json().catch(() => null)
  if (!body) {
    return NextResponse.json({ ok: false, error: 'Malformed or missing JSON body' }, { status: 400 })
  }

  const { eventType, leadSessionId, metadata } = body

  if (!eventType || !VALID_EVENT_TYPES.has(eventType)) {
    logger.warn({ eventType }, 'Rejected invalid eventType')
    return NextResponse.json({ ok: false, error: 'Invalid or missing eventType' }, { status: 400 })
  }

  const attr = extractAttribution(body)
  const productInterest = VALID_PRODUCTS.has(body.productInterest)
    ? (body.productInterest as ProductInterest)
    : undefined

  try {
    const event = await ingestEvent({
      eventType,
      leadSessionId: typeof leadSessionId === 'string' ? leadSessionId : null,
      pageUrl: attr.landingPage,
      referrer: attr.referrer,
      source: attr.source,
      medium: attr.medium,
      campaign: attr.campaign,
      county: attr.county,
      productInterest,
      metadata: typeof metadata === 'object' && metadata !== null ? metadata : undefined,
    })
    return NextResponse.json({ ok: true, eventId: event.id, sessionId: event.leadSessionId ?? null })
  } catch (err: any) {
    logger.error({ err: err.message }, 'Event ingest error')
    return NextResponse.json({ ok: false, error: 'server error' }, { status: 500 })
  }
})
