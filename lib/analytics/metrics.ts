import { prisma } from '@/lib/prisma'
import { EventType, PipelineStage, LeadStatus } from '@prisma/client'

export type DateWindow = { from: Date; to: Date }

export type CalculatedMetric = {
  metricDate: Date
  metricKey: string
  value: number
  unit: string
  metadata?: Record<string, unknown>
}

const CTA_CLICK_TYPES: EventType[] = [
  EventType.cta_click,
  EventType.call_click,
  EventType.text_click,
  EventType.email_click,
  EventType.book_click,
]

const STALE_STAGES: PipelineStage[] = [
  PipelineStage.New,
  PipelineStage.Attempted_Contact,
  PipelineStage.Qualified,
  PipelineStage.Follow_Up,
]

export async function calculateDailyMetrics(window: DateWindow): Promise<CalculatedMetric[]> {
  const { from, to } = window
  // Representative date: start of window day (for single-day windows this is the day itself)
  const metricDate = new Date(
    Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate(), 0, 0, 0, 0),
  )

  const [
    leadCount,
    contactCount,
    appointmentCount,
    soldCount,
    ctaClickCount,
    formSubmitCount,
    leadScoreResult,
    socialClickCount,
    socialEngagementCount,
    aiSuccessCount,
    aiTotalCount,
    aiLatencyResult,
  ] = await Promise.all([
    // lead_count: new Inquiries created in window
    prisma.inquiry.count({ where: { createdAt: { gte: from, lte: to } } }),

    // contact_count: new Contacts created in window
    prisma.contact.count({ where: { createdAt: { gte: from, lte: to } } }),

    // appointment_booked_count: non-cancelled appointments in window
    prisma.appointment.count({
      where: {
        createdAt: { gte: from, lte: to },
        NOT: { status: 'Cancelled' },
      },
    }),

    // sold_count: Inquiry.stage === Sold OR Contact.status === CLOSED_WON, updated in window
    (async () => {
      const [soldInquiries, wonContacts] = await Promise.all([
        prisma.inquiry.count({
          where: { updatedAt: { gte: from, lte: to }, stage: PipelineStage.Sold },
        }),
        prisma.contact.count({
          where: { updatedAt: { gte: from, lte: to }, status: LeadStatus.CLOSED_WON },
        }),
      ])
      // de-duplicate: use contact count if higher, otherwise inquiry count
      return Math.max(soldInquiries, wonContacts)
    })(),

    // cta_click_count: events of CTA types in window
    prisma.event.count({
      where: {
        occurredAt: { gte: from, lte: to },
        eventType: { in: CTA_CLICK_TYPES },
      },
    }),

    // form_submit_count: form_submit events in window
    prisma.event.count({
      where: { occurredAt: { gte: from, lte: to }, eventType: EventType.form_submit },
    }),

    // avg_lead_score: average of Inquiry.leadScore for inquiries created in window
    prisma.inquiry.aggregate({
      where: { createdAt: { gte: from, lte: to } },
      _avg: { leadScore: true },
    }),

    // social_click_count: sum of clicks from SocialMetric in window
    prisma.socialMetric.aggregate({
      where: { metricDate: { gte: from, lte: to } },
      _sum: { clicks: true },
    }),

    // social_engagement_count: sum of all engagement fields from SocialMetric in window
    prisma.socialMetric.aggregate({
      where: { metricDate: { gte: from, lte: to } },
      _sum: {
        clicks: true,
        reactions: true,
        comments: true,
        shares: true,
        saves: true,
      },
    }),

    // ai_success_rate: AiRun succeeded count in window
    prisma.aiRun.count({
      where: { createdAt: { gte: from, lte: to }, status: 'succeeded' },
    }),

    // ai total runs for success rate calculation
    prisma.aiRun.count({ where: { createdAt: { gte: from, lte: to } } }),

    // ai_avg_latency_ms: average latency of succeeded AiRuns in window
    prisma.aiRun.aggregate({
      where: { createdAt: { gte: from, lte: to }, status: 'succeeded' },
      _avg: { latencyMs: true },
    }),
  ])

  // Derived metrics
  const leadToBookingRate = leadCount > 0 ? appointmentCount / leadCount : 0
  const leadToSoldRate = leadCount > 0 ? soldCount / leadCount : 0
  const avgLeadScore = leadScoreResult._avg.leadScore ?? 0
  const socialClicks = socialClickCount._sum.clicks ?? 0
  const socialEngagement =
    (socialEngagementCount._sum.clicks ?? 0) +
    (socialEngagementCount._sum.reactions ?? 0) +
    (socialEngagementCount._sum.comments ?? 0) +
    (socialEngagementCount._sum.shares ?? 0) +
    (socialEngagementCount._sum.saves ?? 0)
  const aiSuccessRate = aiTotalCount > 0 ? (aiSuccessCount / aiTotalCount) * 100 : 0
  const aiAvgLatency = aiLatencyResult._avg.latencyMs ?? 0

  const metrics: CalculatedMetric[] = [
    { metricDate, metricKey: 'lead_count', value: leadCount, unit: 'count' },
    { metricDate, metricKey: 'contact_count', value: contactCount, unit: 'count' },
    { metricDate, metricKey: 'appointment_booked_count', value: appointmentCount, unit: 'count' },
    { metricDate, metricKey: 'sold_count', value: soldCount, unit: 'count' },
    { metricDate, metricKey: 'cta_click_count', value: ctaClickCount, unit: 'count' },
    { metricDate, metricKey: 'form_submit_count', value: formSubmitCount, unit: 'count' },
    { metricDate, metricKey: 'lead_to_booking_rate', value: leadToBookingRate, unit: 'ratio' },
    { metricDate, metricKey: 'lead_to_sold_rate', value: leadToSoldRate, unit: 'ratio' },
    { metricDate, metricKey: 'avg_lead_score', value: Number(avgLeadScore), unit: 'score' },
    { metricDate, metricKey: 'social_click_count', value: Number(socialClicks), unit: 'count' },
    {
      metricDate,
      metricKey: 'social_engagement_count',
      value: Number(socialEngagement),
      unit: 'count',
    },
    { metricDate, metricKey: 'ai_success_rate', value: aiSuccessRate, unit: 'percent' },
    { metricDate, metricKey: 'ai_avg_latency_ms', value: Number(aiAvgLatency), unit: 'ms' },
  ]

  return metrics
}

/**
 * Realtime stale lead count — not date-windowed.
 * Open inquiries not updated in 14+ days, not in Booked/Sold/Lost.
 */
export async function calculateStaleLeadCount(): Promise<number> {
  const threshold = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
  return prisma.inquiry.count({
    where: {
      updatedAt: { lt: threshold },
      stage: { in: STALE_STAGES },
    },
  })
}

/**
 * Realtime overdue task count — not date-windowed.
 */
export async function calculateOverdueTaskCount(): Promise<number> {
  return prisma.task.count({
    where: {
      status: { not: 'Done' },
      dueAt: { lt: new Date() },
    },
  })
}

/**
 * Realtime average lead score — not date-windowed.
 */
export async function calculateAvgLeadScore(_window?: DateWindow): Promise<number> {
  const result = await prisma.inquiry.aggregate({ _avg: { leadScore: true } })
  return Number(result._avg.leadScore ?? 0)
}
