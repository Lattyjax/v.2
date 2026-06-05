import { prisma } from '@/lib/prisma'
import { createOpenAIJsonCompletion } from '@/lib/ai/client'

export type WeeklyReportAnalysis = {
  summary: string
  kpi_highlights: string[]
  top_performing: string[]
  weakest_areas: string[]
  growth_opportunities: string[]
  risks: string[]
  recommended_actions: string[]
  recommended_posts: string[]
}

const REPORT_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    summary: { type: 'string' },
    kpi_highlights: { type: 'array', items: { type: 'string' } },
    top_performing: { type: 'array', items: { type: 'string' } },
    weakest_areas: { type: 'array', items: { type: 'string' } },
    growth_opportunities: { type: 'array', items: { type: 'string' } },
    risks: { type: 'array', items: { type: 'string' } },
    recommended_actions: { type: 'array', items: { type: 'string' } },
    recommended_posts: { type: 'array', items: { type: 'string' } },
  },
  required: ['summary', 'kpi_highlights', 'top_performing', 'weakest_areas', 'growth_opportunities', 'risks', 'recommended_actions', 'recommended_posts'],
}

export async function buildWeeklyReport() {
  const now = new Date()
  const weekEnd = new Date(now)
  const weekStart = new Date(now)
  weekStart.setDate(weekStart.getDate() - 7)

  const [metrics, insights, posts] = await Promise.all([
    prisma.socialMetric.findMany({ where: { metricDate: { gte: weekStart } } }),
    prisma.insight.findMany({ where: { createdAt: { gte: weekStart } }, take: 20 }),
    prisma.socialPost.findMany({
      where: { publishedAt: { gte: weekStart } },
      include: { metrics: true },
    }),
  ])

  const totals = metrics.reduce(
    (a, m) => ({
      impressions: a.impressions + m.impressions,
      reach: a.reach + m.reach,
      clicks: a.clicks + m.clicks,
      reactions: a.reactions + m.reactions,
      comments: a.comments + m.comments,
      shares: a.shares + m.shares,
      leads: a.leads + m.leads,
    }),
    { impressions: 0, reach: 0, clicks: 0, reactions: 0, comments: 0, shares: 0, leads: 0 }
  )

  const engRate = totals.reach > 0
    ? (((totals.reactions + totals.comments + totals.shares) / totals.reach) * 100).toFixed(2) + '%'
    : 'N/A'

  const context = `
Weekly KPIs (${weekStart.toDateString()} – ${weekEnd.toDateString()}):
- Impressions: ${totals.impressions}
- Reach: ${totals.reach}
- Clicks: ${totals.clicks}
- Reactions: ${totals.reactions}
- Comments: ${totals.comments}
- Shares: ${totals.shares}
- New Leads: ${totals.leads}
- Engagement Rate: ${engRate}
- Posts Published: ${posts.length}
- Open Insights: ${insights.length}

Top Insights:
${insights.slice(0, 5).map(i => `- [${i.severity}] ${i.title}: ${i.summary}`).join('\n')}

This is for Latimore Life & Legacy LLC, an independent insurance advisor in Central Pennsylvania.
`.trim()

  const { output } = await createOpenAIJsonCompletion<WeeklyReportAnalysis>({
    system: 'You are a marketing intelligence analyst for an insurance advisory firm. Generate a weekly performance report.',
    user: context,
    schemaName: 'weekly_report',
    schema: REPORT_SCHEMA,
    temperature: 0.4,
  })

  const report = await prisma.weeklyReport.upsert({
    where: { weekStart_weekEnd: { weekStart, weekEnd } },
    create: {
      weekStart,
      weekEnd,
      kpis: totals as object,
      insights: output.kpi_highlights as unknown as object,
      opportunities: output.growth_opportunities as unknown as object,
      recommendations: output.recommended_actions as unknown as object,
    },
    update: {
      kpis: totals as object,
      insights: output.kpi_highlights as unknown as object,
      opportunities: output.growth_opportunities as unknown as object,
      recommendations: output.recommended_actions as unknown as object,
    },
  })

  return { report, analysis: output, totals, weekStart, weekEnd }
}
