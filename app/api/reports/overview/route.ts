export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { rateLimit } from '@/lib/rate-limit'
import { getDashboardOverview } from '@/lib/hub/reporting'

export async function GET(req: NextRequest) {
  const limited = await rateLimit(req, 'reports')
  if (limited) return limited

  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })

  const overview = await getDashboardOverview()

  return NextResponse.json({
    kpis: {
      leadsThisMonth: overview.kpis.leadsThisMonth,
      clicksThisMonth: overview.kpis.clicksThisMonth,
      bookingsThisMonth: overview.kpis.bookingsThisMonth,
      staleLeads: overview.kpis.staleLeads,
    },
    highlights: overview.highlights,
    pipeline: overview.pipeline.map((row) => ({ status: row.stage, count: row.count })),
  })
}
