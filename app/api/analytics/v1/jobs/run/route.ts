export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { rateLimit } from '@/lib/rate-limit'
import { rebuildAnalyticsRange, rebuildTrailingAnalytics } from '@/lib/analytics/aggregation'
import { logger } from '@/lib/logger'

function isCronAuthed(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return false
  const header =
    req.headers.get('x-cron-secret') ??
    req.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
  return header === secret
}

export async function POST(req: NextRequest) {
  // Accept cron secret OR admin session
  const cronOk = isCronAuthed(req)
  if (!cronOk) {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
  }

  const limited = await rateLimit(req, 'analytics')
  if (limited) return limited

  try {
    let body: Record<string, unknown> = {}
    try {
      body = await req.json()
    } catch {
      // no body is fine — use defaults
    }

    const { from, to, days } = body as { from?: string; to?: string; days?: number }

    if (from && to) {
      const fromDate = new Date(from)
      const toDate = new Date(to)
      if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
        return NextResponse.json({ ok: false, error: 'Invalid from/to dates.' }, { status: 400 })
      }
      await rebuildAnalyticsRange({ from: fromDate, to: toDate })
      return NextResponse.json({
        ok: true,
        message: `Analytics rebuilt for ${from} → ${to}`,
      })
    }

    // Default: trailing N days (default 7)
    const trailingDays = typeof days === 'number' && days > 0 ? days : 7
    await rebuildTrailingAnalytics(trailingDays)

    return NextResponse.json({
      ok: true,
      message: `Analytics rebuilt for trailing ${trailingDays} days.`,
    })
  } catch (err) {
    logger.error({ err }, 'analytics/v1/jobs/run POST error')
    return NextResponse.json({ ok: false, error: 'Analytics rebuild failed.' }, { status: 500 })
  }
}
