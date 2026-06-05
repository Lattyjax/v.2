export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { rateLimit } from '@/lib/rate-limit'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })

  const limited = await rateLimit(req, 'analytics')
  if (limited) return limited

  try {
    const limitParam = req.nextUrl.searchParams.get('limit')
    const limit = limitParam ? Math.min(100, Math.max(1, parseInt(limitParam, 10) || 20)) : 20

    const rows = await prisma.analyticsJobRun.findMany({
      orderBy: { startedAt: 'desc' },
      take: limit,
      select: {
        id: true,
        jobKey: true,
        status: true,
        startedAt: true,
        finishedAt: true,
        targetStart: true,
        targetEnd: true,
        rowsProcessed: true,
        error: true,
      },
    })

    return NextResponse.json({
      ok: true,
      data: rows.map(r => ({
        ...r,
        startedAt: r.startedAt.toISOString(),
        finishedAt: r.finishedAt?.toISOString() ?? null,
        targetStart: r.targetStart?.toISOString() ?? null,
        targetEnd: r.targetEnd?.toISOString() ?? null,
      })),
    })
  } catch (err) {
    logger.error({ err }, 'analytics/v1/jobs GET error')
    return NextResponse.json({ ok: false, error: 'Failed to load job runs.' }, { status: 500 })
  }
}
