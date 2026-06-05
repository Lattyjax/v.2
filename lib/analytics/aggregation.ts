import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { AnalyticsJobStatus, EventType, PipelineStage, LeadStatus } from '@prisma/client'
import type { Prisma } from '@prisma/client'
import { calculateDailyMetrics, type DateWindow } from './metrics'

// ─── Helpers ────────────────────────────────────────────────────────────────

export function eachUtcDay(from: Date, to: Date): Date[] {
  const days: Date[] = []
  const cursor = new Date(
    Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate()),
  )
  const end = new Date(
    Date.UTC(to.getUTCFullYear(), to.getUTCMonth(), to.getUTCDate()),
  )
  while (cursor <= end) {
    days.push(new Date(cursor))
    cursor.setUTCDate(cursor.getUTCDate() + 1)
  }
  return days
}

export function dayBoundsUtc(day: Date): DateWindow {
  const from = new Date(
    Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate(), 0, 0, 0, 0),
  )
  const to = new Date(
    Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate(), 23, 59, 59, 999),
  )
  return { from, to }
}

// ─── Funnel types ────────────────────────────────────────────────────────────

export type CalculatedFunnelStage = {
  stageKey: string
  stageOrder: number
  count: number
  conversionRate: number
}

const FUNNEL_STAGES = [
  { key: 'visitor', order: 1 },
  { key: 'engaged', order: 2 },
  { key: 'lead', order: 3 },
  { key: 'qualified', order: 4 },
  { key: 'booked', order: 5 },
  { key: 'sold', order: 6 },
] as const

// ─── Breakdown types ─────────────────────────────────────────────────────────

export type CalculatedBreakdown = {
  metricKey: string
  dimension: string
  dimensionValue: string
  value: number
  unit: string
}

const CTA_CLICK_TYPES: EventType[] = [
  EventType.cta_click,
  EventType.call_click,
  EventType.text_click,
  EventType.email_click,
  EventType.book_click,
]

const BREAKDOWN_DIMENSIONS = [
  'source',
  'medium',
  'campaign',
  'county',
  'productInterest',
  'stage',
  'status',
  'landingPage',
  'pageUrl',
  'eventType',
  'platform',
] as const

// ─── Funnel calculation ───────────────────────────────────────────────────────

export async function calculateDailyFunnel(
  window: DateWindow,
): Promise<CalculatedFunnelStage[]> {
  const { from, to } = window

  const [
    visitorCount,
    engagedCount,
    leadCount,
    qualifiedCount,
    bookedCount,
    soldCount,
  ] = await Promise.all([
    // visitor: unique sessions with page_view events
    prisma.leadSession.count({
      where: {
        events: {
          some: {
            occurredAt: { gte: from, lte: to },
            eventType: EventType.page_view,
          },
        },
      },
    }),

    // engaged: sessions with CTA click events
    prisma.leadSession.count({
      where: {
        events: {
          some: {
            occurredAt: { gte: from, lte: to },
            eventType: { in: CTA_CLICK_TYPES },
          },
        },
      },
    }),

    // lead: new Inquiries created
    prisma.inquiry.count({ where: { createdAt: { gte: from, lte: to } } }),

    // qualified: Inquiries that reached Qualified stage (by history or current)
    prisma.inquiry.count({
      where: {
        createdAt: { gte: from, lte: to },
        stage: {
          in: [
            PipelineStage.Qualified,
            PipelineStage.Booked,
            PipelineStage.Sold,
          ],
        },
      },
    }),

    // booked: non-cancelled appointments created in window
    prisma.appointment.count({
      where: {
        createdAt: { gte: from, lte: to },
        NOT: { status: 'Cancelled' },
      },
    }),

    // sold
    (async () => {
      const [soldInquiries, wonContacts] = await Promise.all([
        prisma.inquiry.count({
          where: { updatedAt: { gte: from, lte: to }, stage: PipelineStage.Sold },
        }),
        prisma.contact.count({
          where: { updatedAt: { gte: from, lte: to }, status: LeadStatus.CLOSED_WON },
        }),
      ])
      return Math.max(soldInquiries, wonContacts)
    })(),
  ])

  const counts = [visitorCount, engagedCount, leadCount, qualifiedCount, bookedCount, soldCount]
  const topCount = counts[0]

  return FUNNEL_STAGES.map((stage, i) => ({
    stageKey: stage.key,
    stageOrder: stage.order,
    count: counts[i],
    conversionRate: topCount > 0 ? (counts[i] / topCount) * 100 : 0,
  }))
}

// ─── Breakdown calculation ────────────────────────────────────────────────────

export async function calculateDailyBreakdowns(
  window: DateWindow,
): Promise<CalculatedBreakdown[]> {
  const { from, to } = window
  const results: CalculatedBreakdown[] = []

  // Lead count by source
  const leadsBySource = await prisma.inquiry.groupBy({
    by: ['source'],
    where: { createdAt: { gte: from, lte: to } },
    _count: { _all: true },
  })
  for (const row of leadsBySource) {
    if (!row.source) continue
    results.push({
      metricKey: 'lead_count',
      dimension: 'source',
      dimensionValue: row.source,
      value: row._count._all,
      unit: 'count',
    })
  }

  // Lead count by county
  const leadsByCounty = await prisma.inquiry.groupBy({
    by: ['county'],
    where: { createdAt: { gte: from, lte: to } },
    _count: { _all: true },
  })
  for (const row of leadsByCounty) {
    if (!row.county) continue
    results.push({
      metricKey: 'lead_count',
      dimension: 'county',
      dimensionValue: row.county,
      value: row._count._all,
      unit: 'count',
    })
  }

  // Lead count by productInterest
  const leadsByProduct = await prisma.inquiry.groupBy({
    by: ['productInterest'],
    where: { createdAt: { gte: from, lte: to } },
    _count: { _all: true },
  })
  for (const row of leadsByProduct) {
    if (!row.productInterest) continue
    results.push({
      metricKey: 'lead_count',
      dimension: 'productInterest',
      dimensionValue: String(row.productInterest),
      value: row._count._all,
      unit: 'count',
    })
  }

  // Lead count by stage
  const leadsByStage = await prisma.inquiry.groupBy({
    by: ['stage'],
    where: { createdAt: { gte: from, lte: to } },
    _count: { _all: true },
  })
  for (const row of leadsByStage) {
    if (!row.stage) continue
    results.push({
      metricKey: 'lead_count',
      dimension: 'stage',
      dimensionValue: String(row.stage),
      value: row._count._all,
      unit: 'count',
    })
  }

  // Lead count by medium
  const leadsByMedium = await prisma.inquiry.groupBy({
    by: ['medium'],
    where: { createdAt: { gte: from, lte: to } },
    _count: { _all: true },
  })
  for (const row of leadsByMedium) {
    if (!row.medium) continue
    results.push({
      metricKey: 'lead_count',
      dimension: 'medium',
      dimensionValue: row.medium,
      value: row._count._all,
      unit: 'count',
    })
  }

  // CTA clicks by eventType
  const clicksByType = await prisma.event.groupBy({
    by: ['eventType'],
    where: { occurredAt: { gte: from, lte: to }, eventType: { in: CTA_CLICK_TYPES } },
    _count: { _all: true },
  })
  for (const row of clicksByType) {
    results.push({
      metricKey: 'cta_click_count',
      dimension: 'eventType',
      dimensionValue: row.eventType,
      value: row._count._all,
      unit: 'count',
    })
  }

  // CTA clicks by source
  const clicksBySource = await prisma.event.groupBy({
    by: ['source'],
    where: { occurredAt: { gte: from, lte: to }, eventType: { in: CTA_CLICK_TYPES } },
    _count: { _all: true },
  })
  for (const row of clicksBySource) {
    if (!row.source) continue
    results.push({
      metricKey: 'cta_click_count',
      dimension: 'source',
      dimensionValue: row.source,
      value: row._count._all,
      unit: 'count',
    })
  }

  // Social engagement by platform
  const socialByPlatform = await prisma.socialMetric.groupBy({
    by: ['platform'],
    where: { metricDate: { gte: from, lte: to } },
    _sum: { clicks: true, reactions: true, comments: true, shares: true, saves: true },
  })
  for (const row of socialByPlatform) {
    const engagement =
      (row._sum.clicks ?? 0) +
      (row._sum.reactions ?? 0) +
      (row._sum.comments ?? 0) +
      (row._sum.shares ?? 0) +
      (row._sum.saves ?? 0)
    results.push({
      metricKey: 'social_engagement_count',
      dimension: 'platform',
      dimensionValue: row.platform,
      value: engagement,
      unit: 'count',
    })
  }

  return results
}

// ─── Upsert helpers ───────────────────────────────────────────────────────────

async function upsertMetrics(
  metrics: Awaited<ReturnType<typeof calculateDailyMetrics>>,
): Promise<number> {
  let count = 0
  for (const m of metrics) {
    const { metricDate, metricKey, value, unit, metadata } = m
    await prisma.analyticsDailyMetric.upsert({
      where: { metricDate_metricKey: { metricDate, metricKey } },
      create: {
        metricDate,
        metricKey,
        value,
        unit: unit ?? 'count',
        ...(metadata != null ? { metadata: metadata as Prisma.InputJsonValue } : {}),
      },
      update: {
        value,
        unit: unit ?? 'count',
        ...(metadata != null ? { metadata: metadata as Prisma.InputJsonValue } : {}),
      },
    })
    count++
  }
  return count
}

async function upsertFunnel(
  metricDate: Date,
  stages: CalculatedFunnelStage[],
): Promise<void> {
  for (const s of stages) {
    const { stageKey, stageOrder, count, conversionRate } = s
    await prisma.analyticsFunnelDaily.upsert({
      where: { metricDate_funnelKey_stageKey: { metricDate, funnelKey: 'lead_funnel', stageKey } },
      create: { metricDate, funnelKey: 'lead_funnel', stageKey, stageOrder, count, conversionRate },
      update: { count, conversionRate },
    })
  }
}

async function upsertBreakdowns(
  metricDate: Date,
  breakdowns: CalculatedBreakdown[],
): Promise<void> {
  for (const b of breakdowns) {
    const { metricKey, dimension, dimensionValue, value, unit } = b
    await prisma.analyticsBreakdownDaily.upsert({
      where: {
        metricDate_metricKey_dimension_dimensionValue: {
          metricDate,
          metricKey,
          dimension,
          dimensionValue,
        },
      },
      create: { metricDate, metricKey, dimension, dimensionValue, value, unit: 'count' },
      update: { value },
    })
  }
}

// ─── Main rebuild functions ───────────────────────────────────────────────────

export async function rebuildAnalyticsRange(input: { from: Date; to: Date }): Promise<void> {
  const jobRun = await prisma.analyticsJobRun.create({
    data: {
      jobKey: 'rebuild_analytics_range',
      status: AnalyticsJobStatus.running,
      targetStart: input.from,
      targetEnd: input.to,
    },
  })

  let rowsProcessed = 0
  let error: string | undefined

  try {
    const days = eachUtcDay(input.from, input.to)
    logger.info({ jobRunId: jobRun.id, days: days.length }, 'Starting analytics rebuild')

    for (const day of days) {
      const window = dayBoundsUtc(day)

      const [metrics, funnel, breakdowns] = await Promise.all([
        calculateDailyMetrics(window),
        calculateDailyFunnel(window),
        calculateDailyBreakdowns(window),
      ])

      const metricsCount = await upsertMetrics(metrics)
      await upsertFunnel(day, funnel)
      await upsertBreakdowns(day, breakdowns)

      rowsProcessed += metricsCount + funnel.length + breakdowns.length
    }

    await prisma.analyticsJobRun.update({
      where: { id: jobRun.id },
      data: {
        status: AnalyticsJobStatus.succeeded,
        finishedAt: new Date(),
        rowsProcessed,
      },
    })

    logger.info({ jobRunId: jobRun.id, rowsProcessed }, 'Analytics rebuild complete')
  } catch (err) {
    error = err instanceof Error ? err.message : String(err)
    logger.error({ jobRunId: jobRun.id, error }, 'Analytics rebuild failed')
    await prisma.analyticsJobRun.update({
      where: { id: jobRun.id },
      data: {
        status: AnalyticsJobStatus.failed,
        finishedAt: new Date(),
        rowsProcessed,
        error,
      },
    })
    throw err
  }
}

export async function rebuildTrailingAnalytics(days = 7): Promise<void> {
  const to = new Date()
  const from = new Date(to)
  from.setUTCDate(from.getUTCDate() - (days - 1))
  from.setUTCHours(0, 0, 0, 0)
  to.setUTCHours(23, 59, 59, 999)
  await rebuildAnalyticsRange({ from, to })
}
