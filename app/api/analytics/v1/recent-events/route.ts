export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { rateLimit } from '@/lib/rate-limit'
import { getRecentBusinessEvents } from '@/lib/analytics/queries'
import { logger } from '@/lib/logger'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })

  const limited = await rateLimit(req, 'analytics')
  if (limited) return limited

  const limitParam = req.nextUrl.searchParams.get('limit')
  const limit = limitParam ? Math.min(100, Math.max(1, parseInt(limitParam, 10) || 20)) : 20

  try {
    const data = await getRecentBusinessEvents(limit)
    const now = new Date()

    return NextResponse.json({
      ok: true,
      range: { from: new Date(now.getTime() - 30 * 86_400_000).toISOString(), to: now.toISOString() },
      data,
      meta: {
        generatedAt: now.toISOString(),
        source: 'operational_fallback' as const,
        warnings: [],
      },
    })
  } catch (err) {
    logger.error({ err }, 'analytics/v1/recent-events error')
    return NextResponse.json({ ok: false, error: 'Failed to load recent events.' }, { status: 500 })
  }
}
