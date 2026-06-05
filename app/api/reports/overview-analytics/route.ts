export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { rateLimit } from '@/lib/rate-limit'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const limited = await rateLimit(req, 'reports')
  if (limited) return limited

  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })

  try {
    const [sourceCounts, countyCounts, recentEvents, productCounts] = await Promise.all([
      prisma.inquiry.groupBy({
        by: ['source'],
        _count: { _all: true },
        where: { source: { not: null } },
        orderBy: {
          _count: {
            source: 'desc',
          },
        },
        take: 10,
      }),
      prisma.contact.groupBy({
        by: ['county'],
        _count: { _all: true },
        where: { county: { not: null } },
        orderBy: {
          _count: {
            county: 'desc',
          },
        },
        take: 10,
      }),
      prisma.systemEvent.findMany({
        take: 25,
        orderBy: { occurredAt: 'desc' },
      }),
      prisma.inquiry.groupBy({
        by: ['productInterest'],
        _count: { _all: true },
        orderBy: {
          _count: {
            productInterest: 'desc',
          },
        },
        take: 10,
      }),
    ])

    return NextResponse.json({
      sourceCounts,
      countyCounts,
      recentEvents,
      productCounts,
    })
  } catch (error) {
    console.error('Analytics API error:', error)
    // Return fallback empty data if database is unreachable
    return NextResponse.json({
      sourceCounts: [],
      countyCounts: [],
      recentEvents: [],
      productCounts: [],
    })
  }
}