export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { rateLimit } from '@/lib/rate-limit'
import { getAnalyticsOpportunities } from '@/lib/analytics/queries'
import { logger } from '@/lib/logger'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })

  const limited = await rateLimit(req, 'analytics')
  if (limited) return limited

  try {
    const data = await getAnalyticsOpportunities()
    const now = new Date()

    return NextResponse.json({
      ok: true,
      range: { from: new Date(0).toISOString(), to: now.toISOString() },
      data,
      meta: {
        generatedAt: now.toISOString(),
        source: 'operational_fallback' as const,
        warnings: [],
      },
    })
  } catch (err) {
    logger.error({ err }, 'analytics/v1/opportunities error')
    return NextResponse.json({ ok: false, error: 'Failed to load opportunities.' }, { status: 500 })
  }
}
