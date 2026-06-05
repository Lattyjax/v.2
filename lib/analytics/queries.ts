import { prisma } from '@/lib/prisma'
import { type AnalyticsFiltersInput, parseAnalyticsDateRange } from './contracts'
import { calculateStaleLeadCount, calculateOverdueTaskCount } from './metrics'
import { calculateEngagement } from './engagement'
import { logger } from '@/lib/logger'

export type AnalyticsOverviewData = {
  leadCount: number
  contactCount: number
  appointmentBookedCount: number
  soldCount: number
  ctaClickCount: number
  formSubmitCount: number
  leadToBookingRate: number
  leadToSoldRate: number
  avgLeadScore: number
  staleLeadCount: number
  taskOverdueCount: number
  socialClickCount: number
  socialEngagementCount: number
  aiSuccessRate: number
  aiAvgLatencyMs: number
  // period-over-period deltas (percentage change, null if no prior data)
  delta: {
    leadCount: number | null
    contactCount: number | null
    appointmentBookedCount: number | null
    soldCount: number | null
    ctaClickCount: number | null
  }
}

export type AnalyticsFunnelStage = {
  stageKey: string
  stageOrder: number
  count: number
  conversionRate: number
}

export type AnalyticsTimeSeriesPoint = {
  date: string
  [metricKey: string]: number | string
}

export type AnalyticsBreakdownRow = {
  dimension: string
  dimensionValue: string
  value: number
  unit: string
  metricKey: string
}

export type AnalyticsRecentEvent = {
  id: string
  type: string
  source: string | null
  medium: string | null
  campaign: string | null
  occurredAt: string
  description: string
}

export type AnalyticsOpportunity = {
  id: string
  contactName: string | null
  county: string | null
  productInterest: string | null
  stage: string
  leadScore: number
  lastActivityAt: string | null
  reason: string
}

export type SocialAnalyticsData = {
  totalPosts: number
  publishedPosts: number
  totalImpressions: number
  totalReach: number
  totalClicks: number
  totalReactions: number
  totalEngagement: number
  platformBreakdown: Array<{
    platform: string
    engagement: number
    clicks: number
    impressions: number
  }>
  recentPosts: Array<{
    id: string
    platform: string
    caption: string
    publishedAt: string | null
    engagement: number
  }>
}

export type AiAnalyticsData = {
  totalRuns: number
  successCount: number
  failedCount: number
  successRate: number
  avgLatencyMs: number
  byType: Array<{ type: string; count: number; successRate: number; avgLatencyMs: number }>
  recentRuns: Array<{
    id: string
    type: string
    status: string
    latencyMs: number | null
    createdAt: string
  }>
}

// ─── Sum helper for aggregate tables ─────────────────────────────────────────

async function sumMetric(
  metricKey: string,
  from: Date,
  to: Date,
  filters?: { source?: string; county?: string; productInterest?: string },
): Promise<number> {
  // Analytics mart first
  const rows = await prisma.analyticsDailyMetric.findMany({
    where: { metricKey, metricDate: { gte: from, lte: to } },
    select: { value: true },
  })
  if (rows.length > 0) {
    return rows.reduce((sum, r) => sum + r.value.toNumber(), 0)
  }
  return 0
}

// ─── Overview ─────────────────────────────────────────────────────────────────

export async function getAnalyticsOverview(filters: AnalyticsFiltersInput): Promise<{
  data: AnalyticsOverviewData
  source: 'analytics_mart' | 'operational_fallback'
}> {
  const { from, to } = parseAnalyticsDateRange(filters)
  const rangeDays = Math.round((to.getTime() - from.getTime()) / 86_400_000)

  // Check if mart has data for range
  const martCount = await prisma.analyticsDailyMetric.count({
    where: { metricDate: { gte: from, lte: to } },
  })

  let source: 'analytics_mart' | 'operational_fallback' = 'analytics_mart'

  let leadCount = 0
  let contactCount = 0
  let appointmentBookedCount = 0
  let soldCount = 0
  let ctaClickCount = 0
  let formSubmitCount = 0
  let leadToBookingRate = 0
  let leadToSoldRate = 0
  let avgLeadScore = 0
  let socialClickCount = 0
  let socialEngagementCount = 0
  let aiSuccessRate = 0
  let aiAvgLatencyMs = 0

  if (martCount > 0) {
    // Read from mart
    const keys = [
      'lead_count', 'contact_count', 'appointment_booked_count', 'sold_count',
      'cta_click_count', 'form_submit_count', 'lead_to_booking_rate', 'lead_to_sold_rate',
      'avg_lead_score', 'social_click_count', 'social_engagement_count',
      'ai_success_rate', 'ai_avg_latency_ms',
    ]
    const rows = await prisma.analyticsDailyMetric.findMany({
      where: { metricKey: { in: keys }, metricDate: { gte: from, lte: to } },
      select: { metricKey: true, value: true },
    })

    const sums: Record<string, number> = {}
    const rateCounts: Record<string, number> = {}
    for (const row of rows) {
      const v = row.value.toNumber()
      if (row.metricKey.endsWith('_rate') || row.metricKey === 'avg_lead_score' || row.metricKey === 'ai_success_rate' || row.metricKey === 'ai_avg_latency_ms') {
        sums[row.metricKey] = (sums[row.metricKey] ?? 0) + v
        rateCounts[row.metricKey] = (rateCounts[row.metricKey] ?? 0) + 1
      } else {
        sums[row.metricKey] = (sums[row.metricKey] ?? 0) + v
      }
    }

    // Average rates/scores across days
    for (const key of ['lead_to_booking_rate', 'lead_to_sold_rate', 'avg_lead_score', 'ai_success_rate', 'ai_avg_latency_ms']) {
      if (rateCounts[key]) sums[key] = sums[key] / rateCounts[key]
    }

    leadCount = sums['lead_count'] ?? 0
    contactCount = sums['contact_count'] ?? 0
    appointmentBookedCount = sums['appointment_booked_count'] ?? 0
    soldCount = sums['sold_count'] ?? 0
    ctaClickCount = sums['cta_click_count'] ?? 0
    formSubmitCount = sums['form_submit_count'] ?? 0
    leadToBookingRate = sums['lead_to_booking_rate'] ?? 0
    leadToSoldRate = sums['lead_to_sold_rate'] ?? 0
    avgLeadScore = sums['avg_lead_score'] ?? 0
    socialClickCount = sums['social_click_count'] ?? 0
    socialEngagementCount = sums['social_engagement_count'] ?? 0
    aiSuccessRate = sums['ai_success_rate'] ?? 0
    aiAvgLatencyMs = sums['ai_avg_latency_ms'] ?? 0
  } else {
    // Operational fallback
    source = 'operational_fallback'
    const [leads, contacts, appts, ctas, forms, aiAgg, socialAgg] = await Promise.all([
      prisma.inquiry.count({ where: { createdAt: { gte: from, lte: to } } }),
      prisma.contact.count({ where: { createdAt: { gte: from, lte: to } } }),
      prisma.appointment.count({ where: { createdAt: { gte: from, lte: to }, NOT: { status: 'Cancelled' } } }),
      prisma.event.count({ where: { occurredAt: { gte: from, lte: to }, eventType: { in: ['cta_click', 'call_click', 'text_click', 'email_click', 'book_click'] as any } } }),
      prisma.event.count({ where: { occurredAt: { gte: from, lte: to }, eventType: 'form_submit' } }),
      prisma.aiRun.aggregate({ where: { createdAt: { gte: from, lte: to }, status: 'succeeded' }, _avg: { latencyMs: true } }),
      prisma.socialMetric.aggregate({ where: { metricDate: { gte: from, lte: to } }, _sum: { clicks: true, reactions: true, comments: true, shares: true, saves: true } }),
    ])

    const [soldI, soldC] = await Promise.all([
      prisma.inquiry.count({ where: { updatedAt: { gte: from, lte: to }, stage: 'Sold' } }),
      prisma.contact.count({ where: { updatedAt: { gte: from, lte: to }, status: 'CLOSED_WON' } }),
    ])
    const aiTotal = await prisma.aiRun.count({ where: { createdAt: { gte: from, lte: to } } })
    const aiSuccess = await prisma.aiRun.count({ where: { createdAt: { gte: from, lte: to }, status: 'succeeded' } })
    const scoreAgg = await prisma.inquiry.aggregate({ where: { createdAt: { gte: from, lte: to } }, _avg: { leadScore: true } })

    leadCount = leads
    contactCount = contacts
    appointmentBookedCount = appts
    soldCount = Math.max(soldI, soldC)
    ctaClickCount = ctas
    formSubmitCount = forms
    leadToBookingRate = leads > 0 ? appts / leads : 0
    leadToSoldRate = leads > 0 ? soldCount / leads : 0
    avgLeadScore = Number(scoreAgg._avg.leadScore ?? 0)
    socialClickCount = socialAgg._sum.clicks ?? 0
    socialEngagementCount = (socialAgg._sum.clicks ?? 0) + (socialAgg._sum.reactions ?? 0) + (socialAgg._sum.comments ?? 0) + (socialAgg._sum.shares ?? 0) + (socialAgg._sum.saves ?? 0)
    aiSuccessRate = aiTotal > 0 ? (aiSuccess / aiTotal) * 100 : 0
    aiAvgLatencyMs = Number(aiAgg._avg.latencyMs ?? 0)
  }

  // Prior period for delta
  const priorTo = new Date(from.getTime() - 1)
  const priorFrom = new Date(from.getTime() - rangeDays * 86_400_000)

  const [priorLeads, priorContacts, priorAppts, priorSold, priorCtas] = await Promise.all([
    prisma.inquiry.count({ where: { createdAt: { gte: priorFrom, lte: priorTo } } }),
    prisma.contact.count({ where: { createdAt: { gte: priorFrom, lte: priorTo } } }),
    prisma.appointment.count({ where: { createdAt: { gte: priorFrom, lte: priorTo }, NOT: { status: 'Cancelled' } } }),
    prisma.inquiry.count({ where: { updatedAt: { gte: priorFrom, lte: priorTo }, stage: 'Sold' } }),
    prisma.event.count({ where: { occurredAt: { gte: priorFrom, lte: priorTo }, eventType: { in: ['cta_click', 'call_click', 'text_click', 'email_click', 'book_click'] as any } } }),
  ])

  const pctChange = (current: number, prior: number): number | null => {
    if (prior === 0) return null
    return ((current - prior) / prior) * 100
  }

  const [staleLeadCount, taskOverdueCount] = await Promise.all([
    calculateStaleLeadCount(),
    calculateOverdueTaskCount(),
  ])

  return {
    source,
    data: {
      leadCount,
      contactCount,
      appointmentBookedCount,
      soldCount,
      ctaClickCount,
      formSubmitCount,
      leadToBookingRate,
      leadToSoldRate,
      avgLeadScore,
      staleLeadCount,
      taskOverdueCount,
      socialClickCount,
      socialEngagementCount,
      aiSuccessRate,
      aiAvgLatencyMs,
      delta: {
        leadCount: pctChange(leadCount, priorLeads),
        contactCount: pctChange(contactCount, priorContacts),
        appointmentBookedCount: pctChange(appointmentBookedCount, priorAppts),
        soldCount: pctChange(soldCount, priorSold),
        ctaClickCount: pctChange(ctaClickCount, priorCtas),
      },
    },
  }
}

// ─── Funnel ───────────────────────────────────────────────────────────────────

export async function getAnalyticsFunnel(filters: AnalyticsFiltersInput): Promise<{
  data: AnalyticsFunnelStage[]
  source: 'analytics_mart' | 'operational_fallback'
}> {
  const { from, to } = parseAnalyticsDateRange(filters)

  const martRows = await prisma.analyticsFunnelDaily.findMany({
    where: { funnelKey: 'lead_funnel', metricDate: { gte: from, lte: to } },
    select: { stageKey: true, stageOrder: true, count: true, conversionRate: true },
    orderBy: { stageOrder: 'asc' },
  })

  if (martRows.length > 0) {
    // Aggregate across days
    const aggregated: Record<string, { stageKey: string; stageOrder: number; count: number; rateSum: number; days: number }> = {}
    for (const row of martRows) {
      if (!aggregated[row.stageKey]) {
        aggregated[row.stageKey] = { stageKey: row.stageKey, stageOrder: row.stageOrder, count: 0, rateSum: 0, days: 0 }
      }
      aggregated[row.stageKey].count += row.count
      aggregated[row.stageKey].rateSum += row.conversionRate ? row.conversionRate.toNumber() : 0
      aggregated[row.stageKey].days++
    }

    const topCount = Object.values(aggregated).reduce((max, s) => s.stageOrder === 1 ? s.count : max, 0) || 1

    const data = Object.values(aggregated)
      .sort((a, b) => a.stageOrder - b.stageOrder)
      .map(s => ({
        stageKey: s.stageKey,
        stageOrder: s.stageOrder,
        count: s.count,
        conversionRate: topCount > 0 ? (s.count / topCount) * 100 : 0,
      }))

    return { data, source: 'analytics_mart' }
  }

  // Fallback: calculate from operational tables
  const { calculateDailyFunnel } = await import('./aggregation')
  const stages = await calculateDailyFunnel({ from, to })
  return {
    data: stages,
    source: 'operational_fallback',
  }
}

// ─── Time Series ──────────────────────────────────────────────────────────────

export async function getAnalyticsTimeSeries(
  filters: AnalyticsFiltersInput,
  metricKeys?: string[],
): Promise<{
  data: AnalyticsTimeSeriesPoint[]
  source: 'analytics_mart' | 'operational_fallback'
}> {
  const { from, to } = parseAnalyticsDateRange(filters)
  const keys = metricKeys && metricKeys.length > 0
    ? metricKeys
    : ['lead_count', 'contact_count', 'appointment_booked_count', 'cta_click_count']

  const rows = await prisma.analyticsDailyMetric.findMany({
    where: { metricKey: { in: keys }, metricDate: { gte: from, lte: to } },
    select: { metricDate: true, metricKey: true, value: true },
    orderBy: { metricDate: 'asc' },
  })

  if (rows.length > 0) {
    const byDate: Record<string, AnalyticsTimeSeriesPoint> = {}
    for (const row of rows) {
      const dateStr = row.metricDate.toISOString().split('T')[0]
      if (!byDate[dateStr]) byDate[dateStr] = { date: dateStr }
      byDate[dateStr][row.metricKey] = row.value.toNumber()
    }

    const data = Object.values(byDate).sort((a, b) => a.date.localeCompare(b.date))
    return { data, source: 'analytics_mart' }
  }

  // Fallback: group operational data by day
  const { eachUtcDay, dayBoundsUtc } = await import('./aggregation')
  const days = eachUtcDay(from, to)
  const data: AnalyticsTimeSeriesPoint[] = []

  for (const day of days) {
    const bounds = dayBoundsUtc(day)
    const dateStr = day.toISOString().split('T')[0]
    const point: AnalyticsTimeSeriesPoint = { date: dateStr }

    const [leads, contacts, appts, ctas] = await Promise.all([
      keys.includes('lead_count') ? prisma.inquiry.count({ where: { createdAt: { gte: bounds.from, lte: bounds.to } } }) : Promise.resolve(0),
      keys.includes('contact_count') ? prisma.contact.count({ where: { createdAt: { gte: bounds.from, lte: bounds.to } } }) : Promise.resolve(0),
      keys.includes('appointment_booked_count') ? prisma.appointment.count({ where: { createdAt: { gte: bounds.from, lte: bounds.to }, NOT: { status: 'Cancelled' } } }) : Promise.resolve(0),
      keys.includes('cta_click_count') ? prisma.event.count({ where: { occurredAt: { gte: bounds.from, lte: bounds.to }, eventType: { in: ['cta_click', 'call_click', 'text_click', 'email_click', 'book_click'] as any } } }) : Promise.resolve(0),
    ])

    if (keys.includes('lead_count')) point.lead_count = leads
    if (keys.includes('contact_count')) point.contact_count = contacts
    if (keys.includes('appointment_booked_count')) point.appointment_booked_count = appts
    if (keys.includes('cta_click_count')) point.cta_click_count = ctas

    data.push(point)
  }

  return { data, source: 'operational_fallback' }
}

// ─── Breakdowns ───────────────────────────────────────────────────────────────

export async function getAnalyticsBreakdowns(
  filters: AnalyticsFiltersInput,
  dimension: string,
): Promise<{
  data: AnalyticsBreakdownRow[]
  source: 'analytics_mart' | 'operational_fallback'
}> {
  const { from, to } = parseAnalyticsDateRange(filters)

  const rows = await prisma.analyticsBreakdownDaily.findMany({
    where: { dimension, metricDate: { gte: from, lte: to } },
    select: { metricKey: true, dimension: true, dimensionValue: true, value: true, unit: true },
  })

  if (rows.length > 0) {
    // Aggregate across days
    const agg: Record<string, AnalyticsBreakdownRow> = {}
    for (const row of rows) {
      const key = `${row.metricKey}::${row.dimensionValue}`
      if (!agg[key]) {
        agg[key] = {
          metricKey: row.metricKey,
          dimension: row.dimension,
          dimensionValue: row.dimensionValue,
          value: 0,
          unit: row.unit,
        }
      }
      agg[key].value += row.value.toNumber()
    }

    const data = Object.values(agg).sort((a, b) => b.value - a.value)
    return { data, source: 'analytics_mart' }
  }

  // Fallback: group inquiries by dimension
  const data: AnalyticsBreakdownRow[] = []

  if (dimension === 'source') {
    const grouped = await prisma.inquiry.groupBy({
      by: ['source'],
      where: { createdAt: { gte: from, lte: to } },
      _count: { _all: true },
    })
    for (const row of grouped) {
      data.push({ metricKey: 'lead_count', dimension, dimensionValue: row.source ?? 'unknown', value: row._count._all, unit: 'count' })
    }
  } else if (dimension === 'county') {
    const grouped = await prisma.inquiry.groupBy({
      by: ['county'],
      where: { createdAt: { gte: from, lte: to } },
      _count: { _all: true },
    })
    for (const row of grouped) {
      data.push({ metricKey: 'lead_count', dimension, dimensionValue: row.county ?? 'unknown', value: row._count._all, unit: 'count' })
    }
  } else if (dimension === 'productInterest') {
    const grouped = await prisma.inquiry.groupBy({
      by: ['productInterest'],
      where: { createdAt: { gte: from, lte: to } },
      _count: { _all: true },
    })
    for (const row of grouped) {
      data.push({ metricKey: 'lead_count', dimension, dimensionValue: String(row.productInterest), value: row._count._all, unit: 'count' })
    }
  } else if (dimension === 'platform') {
    const grouped = await prisma.socialMetric.groupBy({
      by: ['platform'],
      where: { metricDate: { gte: from, lte: to } },
      _sum: { clicks: true, reactions: true, comments: true, shares: true, saves: true },
    })
    for (const row of grouped) {
      const engagement = (row._sum.clicks ?? 0) + (row._sum.reactions ?? 0) + (row._sum.comments ?? 0) + (row._sum.shares ?? 0) + (row._sum.saves ?? 0)
      data.push({ metricKey: 'social_engagement_count', dimension, dimensionValue: row.platform, value: engagement, unit: 'count' })
    }
  }

  return { data: data.sort((a, b) => b.value - a.value), source: 'operational_fallback' }
}

// ─── Recent Events ────────────────────────────────────────────────────────────

export async function getRecentBusinessEvents(limit = 20): Promise<AnalyticsRecentEvent[]> {
  const [events, stageHistory, systemEvents] = await Promise.all([
    prisma.event.findMany({
      where: { eventType: { in: ['lead_created', 'appointment_booked', 'form_submit', 'stage_changed'] as any } },
      orderBy: { occurredAt: 'desc' },
      take: limit,
      select: { id: true, eventType: true, source: true, medium: true, campaign: true, occurredAt: true, county: true, productInterest: true },
    }),
    prisma.inquiryStageHistory.findMany({
      orderBy: { changedAt: 'desc' },
      take: Math.floor(limit / 2),
      select: { id: true, fromStage: true, toStage: true, changedAt: true, inquiryId: true, actor: true },
    }),
    prisma.systemEvent.findMany({
      orderBy: { occurredAt: 'desc' },
      take: Math.floor(limit / 2),
      select: { id: true, type: true, source: true, medium: true, campaign: true, occurredAt: true },
    }),
  ])

  const normalized: AnalyticsRecentEvent[] = []

  for (const e of events) {
    normalized.push({
      id: e.id,
      type: String(e.eventType),
      source: e.source,
      medium: e.medium,
      campaign: e.campaign,
      occurredAt: e.occurredAt.toISOString(),
      description: [e.county, e.productInterest].filter(Boolean).join(' · ') || String(e.eventType),
    })
  }

  for (const h of stageHistory) {
    normalized.push({
      id: h.id,
      type: 'stage_changed',
      source: null,
      medium: null,
      campaign: null,
      occurredAt: h.changedAt.toISOString(),
      description: `${h.fromStage ?? 'New'} → ${h.toStage}${h.actor ? ` (${h.actor})` : ''}`,
    })
  }

  for (const s of systemEvents) {
    normalized.push({
      id: s.id,
      type: s.type,
      source: s.source,
      medium: s.medium,
      campaign: s.campaign,
      occurredAt: s.occurredAt.toISOString(),
      description: s.type,
    })
  }

  return normalized
    .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime())
    .slice(0, limit)
}

// ─── Opportunities ────────────────────────────────────────────────────────────

export async function getAnalyticsOpportunities(): Promise<AnalyticsOpportunity[]> {
  const staleThreshold = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)

  const staleInquiries = await prisma.inquiry.findMany({
    where: {
      updatedAt: { lt: staleThreshold },
      stage: { notIn: ['Booked', 'Sold', 'Lost'] },
    },
    orderBy: { leadScore: 'desc' },
    take: 20,
    select: {
      id: true,
      stage: true,
      leadScore: true,
      county: true,
      productInterest: true,
      updatedAt: true,
      contact: { select: { fullName: true, firstName: true, lastName: true, lastActivityAt: true } },
    },
  })

  return staleInquiries.map(inq => ({
    id: inq.id,
    contactName: inq.contact.fullName ?? ([inq.contact.firstName, inq.contact.lastName].filter(Boolean).join(' ') || null),
    county: inq.county,
    productInterest: inq.productInterest ? String(inq.productInterest) : null,
    stage: String(inq.stage),
    leadScore: inq.leadScore,
    lastActivityAt: inq.contact.lastActivityAt?.toISOString() ?? inq.updatedAt.toISOString(),
    reason: 'Stale: no update in 14+ days',
  }))
}

// ─── Data Quality Warnings ────────────────────────────────────────────────────

export async function getDataQualityWarnings(filters: AnalyticsFiltersInput): Promise<string[]> {
  const { from, to } = parseAnalyticsDateRange(filters)
  const warnings: string[] = []

  try {
    const [noSource, noCounty, martRows] = await Promise.all([
      prisma.inquiry.count({ where: { createdAt: { gte: from, lte: to }, source: null } }),
      prisma.inquiry.count({ where: { createdAt: { gte: from, lte: to }, county: null } }),
      prisma.analyticsDailyMetric.count({ where: { metricDate: { gte: from, lte: to } } }),
    ])

    const totalLeads = await prisma.inquiry.count({ where: { createdAt: { gte: from, lte: to } } })

    if (totalLeads > 0 && noSource / totalLeads > 0.3) {
      warnings.push(`${Math.round((noSource / totalLeads) * 100)}% of leads are missing source attribution.`)
    }
    if (totalLeads > 0 && noCounty / totalLeads > 0.3) {
      warnings.push(`${Math.round((noCounty / totalLeads) * 100)}% of leads are missing county data.`)
    }
    if (martRows === 0 && totalLeads > 0) {
      warnings.push('Analytics mart has no aggregated data for this range — showing operational fallback.')
    }
  } catch (err) {
    logger.error({ err }, 'getDataQualityWarnings failed')
  }

  return warnings
}

// ─── Social Analytics ─────────────────────────────────────────────────────────

export async function getSocialAnalytics(filters: AnalyticsFiltersInput): Promise<SocialAnalyticsData> {
  const { from, to } = parseAnalyticsDateRange(filters)

  const [postCounts, metricAgg, platformAgg, recentPosts] = await Promise.all([
    prisma.socialPost.aggregate({
      where: { createdAt: { gte: from, lte: to } },
      _count: { _all: true },
    }),
    prisma.socialMetric.aggregate({
      where: { metricDate: { gte: from, lte: to } },
      _sum: {
        impressions: true,
        reach: true,
        clicks: true,
        reactions: true,
        comments: true,
        shares: true,
        saves: true,
      },
    }),
    prisma.socialMetric.groupBy({
      by: ['platform'],
      where: { metricDate: { gte: from, lte: to } },
      _sum: { clicks: true, reactions: true, comments: true, shares: true, saves: true, impressions: true },
    }),
    prisma.socialPost.findMany({
      where: { status: 'published', publishedAt: { gte: from, lte: to } },
      orderBy: { publishedAt: 'desc' },
      take: 10,
      select: {
        id: true,
        platform: true,
        caption: true,
        publishedAt: true,
        metrics: {
          select: { clicks: true, reactions: true, comments: true, shares: true, saves: true },
          orderBy: { metricDate: 'desc' },
          take: 1,
        },
      },
    }),
  ])

  const publishedCount = await prisma.socialPost.count({
    where: { status: 'published', publishedAt: { gte: from, lte: to } },
  })

  const totalImpressions = metricAgg._sum.impressions ?? 0
  const totalReach = metricAgg._sum.reach ?? 0
  const totalClicks = metricAgg._sum.clicks ?? 0
  const totalReactions = metricAgg._sum.reactions ?? 0
  const totalEngagement = totalClicks + totalReactions + (metricAgg._sum.comments ?? 0) + (metricAgg._sum.shares ?? 0) + (metricAgg._sum.saves ?? 0)

  return {
    totalPosts: postCounts._count._all,
    publishedPosts: publishedCount,
    totalImpressions,
    totalReach,
    totalClicks,
    totalReactions,
    totalEngagement,
    platformBreakdown: platformAgg.map(p => ({
      platform: p.platform,
      engagement: (p._sum.clicks ?? 0) + (p._sum.reactions ?? 0) + (p._sum.comments ?? 0) + (p._sum.shares ?? 0) + (p._sum.saves ?? 0),
      clicks: p._sum.clicks ?? 0,
      impressions: p._sum.impressions ?? 0,
    })),
    recentPosts: recentPosts.map(p => {
      const m = p.metrics[0]
      const eng = m ? calculateEngagement(m) : 0
      return {
        id: p.id,
        platform: p.platform,
        caption: p.caption.slice(0, 120),
        publishedAt: p.publishedAt?.toISOString() ?? null,
        engagement: eng,
      }
    }),
  }
}

// ─── AI Analytics ─────────────────────────────────────────────────────────────

export async function getAiAnalytics(filters: AnalyticsFiltersInput): Promise<AiAnalyticsData> {
  const { from, to } = parseAnalyticsDateRange(filters)

  const [total, success, failed, avgLatency, byType, recentRuns] = await Promise.all([
    prisma.aiRun.count({ where: { createdAt: { gte: from, lte: to } } }),
    prisma.aiRun.count({ where: { createdAt: { gte: from, lte: to }, status: 'succeeded' } }),
    prisma.aiRun.count({ where: { createdAt: { gte: from, lte: to }, status: 'failed' } }),
    prisma.aiRun.aggregate({
      where: { createdAt: { gte: from, lte: to }, status: 'succeeded' },
      _avg: { latencyMs: true },
    }),
    prisma.aiRun.groupBy({
      by: ['type'],
      where: { createdAt: { gte: from, lte: to } },
      _count: { _all: true },
      _avg: { latencyMs: true },
    }),
    prisma.aiRun.findMany({
      where: { createdAt: { gte: from, lte: to } },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: { id: true, type: true, status: true, latencyMs: true, createdAt: true },
    }),
  ])

  // For per-type success rate, get success count per type
  const successByType = await prisma.aiRun.groupBy({
    by: ['type'],
    where: { createdAt: { gte: from, lte: to }, status: 'succeeded' },
    _count: { _all: true },
  })
  const successMap = new Map(successByType.map(r => [r.type, r._count._all]))

  return {
    totalRuns: total,
    successCount: success,
    failedCount: failed,
    successRate: total > 0 ? (success / total) * 100 : 0,
    avgLatencyMs: Number(avgLatency._avg.latencyMs ?? 0),
    byType: byType.map(r => ({
      type: String(r.type),
      count: r._count._all,
      successRate: r._count._all > 0 ? ((successMap.get(r.type) ?? 0) / r._count._all) * 100 : 0,
      avgLatencyMs: Number(r._avg.latencyMs ?? 0),
    })),
    recentRuns: recentRuns.map(r => ({
      id: r.id,
      type: String(r.type),
      status: String(r.status),
      latencyMs: r.latencyMs,
      createdAt: r.createdAt.toISOString(),
    })),
  }
}
