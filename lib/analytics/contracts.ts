import { z } from 'zod'

export const analyticsMetricKeys = [
  'lead_count',
  'contact_count',
  'appointment_booked_count',
  'sold_count',
  'cta_click_count',
  'form_submit_count',
  'lead_to_booking_rate',
  'lead_to_sold_rate',
  'avg_lead_score',
  'stale_lead_count',
  'task_overdue_count',
  'social_click_count',
  'social_engagement_count',
  'ai_success_rate',
  'ai_avg_latency_ms',
] as const

export const analyticsDimensions = [
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
  'aiRunType',
  'aiProvider',
] as const

export type AnalyticsMetricKey = (typeof analyticsMetricKeys)[number]
export type AnalyticsDimension = (typeof analyticsDimensions)[number]

export const analyticsRangeEnum = z.enum(['7d', '30d', '90d', 'custom'])

const analyticsRangeFields = {
  range: analyticsRangeEnum.optional(),
  from: z.string().date().optional(),
  to: z.string().date().optional(),
}

function applyRangeRefinement<T extends { range?: string; from?: string; to?: string }>(
  value: T,
  ctx: z.RefinementCtx,
) {
  const range = value.range ?? '30d'
  const hasFrom = Boolean(value.from)
  const hasTo = Boolean(value.to)

  if (range === 'custom' && (!hasFrom || !hasTo)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Custom range requires both from and to dates.',
      path: ['range'],
    })
  }

  if (hasFrom !== hasTo) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'from and to must be provided together.',
      path: hasFrom ? ['to'] : ['from'],
    })
  }

  if (hasFrom && hasTo && value.from! > value.to!) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'from must be before or equal to to.',
      path: ['from'],
    })
  }
}

export const analyticsRangeSchema = z.object(analyticsRangeFields).superRefine(applyRangeRefinement)

export const analyticsFilterSchema = z
  .object({
    ...analyticsRangeFields,
    source: z.string().optional(),
    medium: z.string().optional(),
    campaign: z.string().optional(),
    county: z.string().optional(),
    productInterest: z.string().optional(),
    stage: z.string().optional(),
    status: z.string().optional(),
    landingPage: z.string().optional(),
    dimension: z.enum(analyticsDimensions).optional(),
    metrics: z.string().optional(),
  })
  .superRefine(applyRangeRefinement)

export type AnalyticsFiltersInput = z.infer<typeof analyticsFilterSchema>

export function parseAnalyticsDateRange(input: AnalyticsFiltersInput): { from: Date; to: Date; range: z.infer<typeof analyticsRangeEnum> } {
  const now = new Date()
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999))

  const selectedRange = input.range ?? '30d'

  if (selectedRange === 'custom') {
    return {
      range: selectedRange,
      from: new Date(`${input.from}T00:00:00.000Z`),
      to: new Date(`${input.to}T23:59:59.999Z`),
    }
  }

  const daysBack = selectedRange === '7d' ? 6 : selectedRange === '90d' ? 89 : 29
  const start = new Date(end)
  start.setUTCDate(start.getUTCDate() - daysBack)
  start.setUTCHours(0, 0, 0, 0)

  return { from: start, to: end, range: selectedRange }
}

export type AnalyticsApiEnvelope<TData> = {
  ok: boolean
  range: {
    from: string
    to: string
  }
  data: TData
  meta: {
    generatedAt: string
    source: 'analytics_mart' | 'operational_fallback'
    warnings: string[]
  }
}
