export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { rateLimit } from '@/lib/rate-limit'
import { CardEventSchema } from '@/lib/schemas'
import { ingestEvent } from '@/lib/hub/ingest-event'
import { cleanString } from '@/lib/hub/normalizers'
import { logger } from '@/lib/logger'

function getSupabaseClient() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key, { auth: { persistSession: false } })
}

function mapCardEvent(event: string, label?: string | null) {
  const normalizedEvent = event.trim().toLowerCase()
  const normalizedLabel = (label ?? '').trim().toLowerCase()

  if (normalizedEvent === 'visit') return 'page_view'
  if (normalizedLabel.includes('call') || normalizedLabel.includes('phone')) return 'call_click'
  if (normalizedLabel.includes('text') || normalizedLabel.includes('sms')) return 'text_click'
  if (normalizedLabel.includes('email')) return 'email_click'
  if (normalizedLabel.includes('book') || normalizedLabel.includes('calendar')) return 'book_click'
  return 'cta_click'
}

export async function POST(req: NextRequest) {
  const limited = await rateLimit(req, 'cardEvents')
  if (limited) return limited

  const body = await req.json().catch(() => null)
  const parse = CardEventSchema.safeParse(body)
  if (!parse.success) return NextResponse.json({ ok: false, error: parse.error.flatten() }, { status: 422 })

  try {
    const eventType = mapCardEvent(parse.data.event, parse.data.label)
    const [event] = await Promise.all([
      ingestEvent({
        eventType,
        occurredAt: parse.data.timestamp ?? null,
        leadSessionId: parse.data.leadSessionId ?? null,
        pageUrl: parse.data.pageUrl ?? '/digital-card',
        referrer: parse.data.referrer ?? null,
        source: 'digital_card',
        medium: 'owned',
        county: parse.data.county ?? null,
        productInterest: parse.data.productInterest ?? null,
        metadata: {
          channel: 'digital_card',
          label: cleanString(parse.data.label, 200),
          userAgent: cleanString(parse.data.userAgent, 300),
          ...(parse.data.metadata ?? {}),
        },
      }),
      (async () => {
        const supabase = getSupabaseClient()
        if (!supabase) return
        const { error } = await supabase.from('tracking_events').insert({
          event_type: eventType,
          utm_source: 'digital_card',
          utm_medium: 'owned',
          utm_campaign: parse.data.metadata?.campaign ?? null,
          destination_url: parse.data.pageUrl ?? '/digital-card',
          lead_session_id: parse.data.leadSessionId ?? null,
          county: parse.data.county ?? null,
          product_interest: parse.data.productInterest ?? null,
        })
        if (error) logger.error({ err: error.message }, '[card-events] tracking_events insert failed')
      })(),
    ])

    return NextResponse.json({ ok: true, eventId: event.id })
  } catch (err) {
    logger.error({ err: err instanceof Error ? err.message : String(err) }, '[card-events] POST error')
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const limited = await rateLimit(req, 'reports')
  if (limited) return limited

  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })

  try {
    const [visitRows, clickRows, recent, visitsByDay] = await Promise.all([
      prisma.$queryRaw<Array<{ count: bigint | number }>>`
        SELECT COUNT(*) AS count
        FROM "Event"
        WHERE "eventType" = 'page_view'
          AND "source" = 'digital_card'
      `,
      prisma.$queryRaw<Array<{ label: string | null; count: bigint | number }>>`
        SELECT COALESCE(metadata->>'label', 'Unknown') AS label, COUNT(*) AS count
        FROM "Event"
        WHERE "eventType" IN ('cta_click', 'call_click', 'text_click', 'email_click', 'book_click')
          AND "source" = 'digital_card'
        GROUP BY 1
        ORDER BY COUNT(*) DESC
      `,
      prisma.event.findMany({
        where: { source: 'digital_card' },
        orderBy: { occurredAt: 'desc' },
        take: 100,
        select: {
          id: true,
          eventType: true,
          referrer: true,
          occurredAt: true,
          metadata: true,
        },
      }),
      prisma.$queryRaw<Array<{ day: string; count: bigint | number }>>`
        SELECT DATE_TRUNC('day', "occurredAt")::date::text AS day, COUNT(*) AS count
        FROM "Event"
        WHERE "eventType" = 'page_view'
          AND "source" = 'digital_card'
          AND "occurredAt" >= NOW() - INTERVAL '30 days'
        GROUP BY 1
        ORDER BY 1 ASC
      `,
    ])

    const clicks = clickRows.map((row) => ({
      label: row.label,
      _count: { label: Number(row.count) },
    }))
    const totalClicks = clicks.reduce((sum, row) => sum + row._count.label, 0)
    const totalVisits = Number(visitRows[0]?.count ?? 0)

    return NextResponse.json({
      totalVisits,
      totalClicks,
      clicks,
      recent: recent.map((row) => ({
        id: row.id,
        event: row.eventType,
        label: typeof (row.metadata as any)?.label === 'string' ? (row.metadata as any).label : null,
        referrer: row.referrer,
        timestamp: row.occurredAt,
      })),
      visitsByDay: visitsByDay.map((row) => ({
        day: row.day,
        count: Number(row.count),
      })),
    })
  } catch (err) {
    logger.error({ err: err instanceof Error ? err.message : String(err) }, '[card-events] GET error')
    return NextResponse.json({ error: 'DB error' }, { status: 500 })
  }
}
