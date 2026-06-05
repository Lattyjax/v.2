import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { detectSpike } from '@/lib/analytics/engagement'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Called by cron or webhook when new metrics arrive. Detects spikes and writes Insights.
export async function POST(req: NextRequest) {
  const isCron = req.headers.get('x-cron-secret') === process.env.CRON_SECRET
  const syncToken = process.env.ENGAGEMENT_SYNC_TOKEN
  const auth = req.headers.get('authorization')
  const isSync = syncToken && auth === `Bearer ${syncToken}`

  if (!isCron && !isSync) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  // Look back 7 days for baseline, compare to last 24h
  const now = new Date()
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const eightDaysAgo = new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000)

  const [recentMetrics, baselineMetrics] = await Promise.all([
    prisma.socialMetric.findMany({ where: { metricDate: { gte: oneDayAgo } } }),
    prisma.socialMetric.findMany({ where: { metricDate: { gte: eightDaysAgo, lt: oneDayAgo } } }),
  ])

  const sum = (arr: typeof recentMetrics) =>
    arr.reduce((a, m) => a + m.reactions + m.comments + m.shares, 0)

  const recentTotal = sum(recentMetrics)
  const baselineTotal = sum(baselineMetrics) / 7

  const spike = detectSpike(recentTotal, baselineTotal)

  if (!spike) {
    return NextResponse.json({ ok: true, spike: false, recentTotal, baselineTotal })
  }

  // Create an Insight for the spike
  const existing = await prisma.insight.findFirst({
    where: {
      type: 'engagement_spike',
      status: 'open',
      createdAt: { gte: oneDayAgo },
    },
  })

  if (!existing) {
    await prisma.insight.create({
      data: {
        type: 'engagement_spike',
        severity: recentTotal >= baselineTotal * 3 ? 'high' : 'medium',
        title: 'Engagement Spike Detected',
        summary: `Total engagement in the last 24h (${recentTotal}) is ${(recentTotal / Math.max(baselineTotal, 1)).toFixed(1)}x the 7-day baseline (${Math.round(baselineTotal)}).`,
        action: 'Review recent posts and capitalize on momentum with a follow-up CTA.',
        source: { recentTotal, baselineTotal } as object,
        status: 'open',
      },
    })
  }

  return NextResponse.json({ ok: true, spike: true, recentTotal, baselineTotal })
}
