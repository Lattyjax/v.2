import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const days = Math.min(Number(searchParams.get('days') ?? 30), 90)
  const platform = searchParams.get('platform') ?? undefined

  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

  const [metrics, insights, recentPosts] = await Promise.all([
    prisma.socialMetric.findMany({
      where: {
        metricDate: { gte: since },
        ...(platform ? { platform } : {}),
      },
      orderBy: { metricDate: 'desc' },
    }),
    prisma.insight.findMany({
      where: { status: 'open' },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
    prisma.socialPost.findMany({
      where: {
        publishedAt: { gte: since },
        ...(platform ? { platform } : {}),
      },
      include: { metrics: { orderBy: { metricDate: 'desc' }, take: 1 } },
      orderBy: { publishedAt: 'desc' },
      take: 20,
    }),
  ])

  // Aggregate totals
  const totals = metrics.reduce(
    (acc, m) => ({
      impressions: acc.impressions + m.impressions,
      reach: acc.reach + m.reach,
      clicks: acc.clicks + m.clicks,
      reactions: acc.reactions + m.reactions,
      comments: acc.comments + m.comments,
      shares: acc.shares + m.shares,
      saves: acc.saves + m.saves,
      leads: acc.leads + m.leads,
    }),
    { impressions: 0, reach: 0, clicks: 0, reactions: 0, comments: 0, shares: 0, saves: 0, leads: 0 }
  )

  // Group by platform
  const byPlatform: Record<string, typeof totals> = {}
  for (const m of metrics) {
    if (!byPlatform[m.platform]) {
      byPlatform[m.platform] = { impressions: 0, reach: 0, clicks: 0, reactions: 0, comments: 0, shares: 0, saves: 0, leads: 0 }
    }
    const p = byPlatform[m.platform]
    p.impressions += m.impressions
    p.reach += m.reach
    p.clicks += m.clicks
    p.reactions += m.reactions
    p.comments += m.comments
    p.shares += m.shares
    p.saves += m.saves
    p.leads += m.leads
  }

  // Daily trend (last N days)
  const dailyMap: Record<string, { date: string; reactions: number; comments: number; shares: number; clicks: number }> = {}
  for (const m of metrics) {
    const d = m.metricDate.toISOString().slice(0, 10)
    if (!dailyMap[d]) dailyMap[d] = { date: d, reactions: 0, comments: 0, shares: 0, clicks: 0 }
    dailyMap[d].reactions += m.reactions
    dailyMap[d].comments += m.comments
    dailyMap[d].shares += m.shares
    dailyMap[d].clicks += m.clicks
  }
  const trend = Object.values(dailyMap).sort((a, b) => a.date.localeCompare(b.date))

  return NextResponse.json({ ok: true, totals, byPlatform, trend, insights, recentPosts, days })
}
