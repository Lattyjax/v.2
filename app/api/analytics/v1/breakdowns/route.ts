export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { rateLimit } from '@/lib/rate-limit'
import { analyticsFilterSchema, analyticsDimensions, parseAnalyticsDateRange } from '@/lib/analytics/contracts'
import { getAnalyticsBreakdowns, getDataQualityWarnings } from '@/lib/analytics/queries'
import { logger } from '@/lib/logger'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })

  const limited = await rateLimit(req, 'analytics')
  if (limited) return limited

  const params = Object.fromEntries(req.nextUrl.searchParams.entries())
  const parsed = analyticsFilterSchema.safeParse(params)
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid params' }, { status: 400 })
  }

  const dimension = req.nextUrl.searchParams.get('dimension') ?? 'source'
  if (!analyticsDimensions.includes(dimension as any)) {
    return NextResponse.json({ ok: false, error: `Invalid dimension. Must be one of: ${analyticsDimensions.join(', ')}` }, { status: 400 })
  }

  try {
    const { from, to } = parseAnalyticsDateRange(parsed.data)
    const [{ data, source }, warnings] = await Promise.all([
      getAnalyticsBreakdowns(parsed.data, dimension),
      getDataQualityWarnings(parsed.data),
    ])

    return NextResponse.json({
      ok: true,
      range: { from: from.toISOString(), to: to.toISOString() },
      data,
      meta: {
        generatedAt: new Date().toISOString(),
        source,
        warnings,
      },
    })
  } catch (err) {
    logger.error({ err }, 'analytics/v1/breakdowns error')
    return NextResponse.json({ ok: false, error: 'Failed to load breakdown data.' }, { status: 500 })
  }
}
