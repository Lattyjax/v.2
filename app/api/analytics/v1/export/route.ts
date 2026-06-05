export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { rateLimit } from '@/lib/rate-limit'
import { analyticsFilterSchema } from '@/lib/analytics/contracts'
import {
  getAnalyticsOverview,
  getAnalyticsFunnel,
  getAnalyticsTimeSeries,
  getAnalyticsBreakdowns,
  getAnalyticsOpportunities,
} from '@/lib/analytics/queries'
import {
  buildOverviewCsv,
  buildFunnelCsv,
  buildTimeSeriesCsv,
  buildBreakdownCsv,
  buildOpportunitiesCsv,
} from '@/lib/analytics/export'
import { logger } from '@/lib/logger'

const EXPORT_TYPES = ['overview', 'funnel', 'breakdown', 'timeseries', 'opportunities'] as const
type ExportType = (typeof EXPORT_TYPES)[number]

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })

  const limited = await rateLimit(req, 'analytics')
  if (limited) return limited

  const params = Object.fromEntries(req.nextUrl.searchParams.entries())
  const exportType = (params.type ?? 'overview') as ExportType

  if (!EXPORT_TYPES.includes(exportType)) {
    return NextResponse.json({
      ok: false,
      error: `Invalid export type. Must be one of: ${EXPORT_TYPES.join(', ')}`,
    }, { status: 400 })
  }

  const parsed = analyticsFilterSchema.safeParse(params)
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid params' }, { status: 400 })
  }

  try {
    let csv: string
    const filename = `analytics-${exportType}-${new Date().toISOString().split('T')[0]}.csv`

    switch (exportType) {
      case 'overview': {
        const { data } = await getAnalyticsOverview(parsed.data)
        csv = buildOverviewCsv(data)
        break
      }
      case 'funnel': {
        const { data } = await getAnalyticsFunnel(parsed.data)
        csv = buildFunnelCsv(data)
        break
      }
      case 'timeseries': {
        const { data } = await getAnalyticsTimeSeries(parsed.data)
        csv = buildTimeSeriesCsv(data)
        break
      }
      case 'breakdown': {
        const dimension = req.nextUrl.searchParams.get('dimension') ?? 'source'
        const { data } = await getAnalyticsBreakdowns(parsed.data, dimension)
        csv = buildBreakdownCsv(data)
        break
      }
      case 'opportunities': {
        const data = await getAnalyticsOpportunities()
        csv = buildOpportunitiesCsv(data)
        break
      }
    }

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (err) {
    logger.error({ err }, 'analytics/v1/export error')
    return NextResponse.json({ ok: false, error: 'Failed to generate export.' }, { status: 500 })
  }
}
