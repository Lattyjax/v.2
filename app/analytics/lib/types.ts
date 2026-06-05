export type Range = '7d' | '30d' | '90d'

export type OverviewData = {
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
  delta: {
    leadCount: number | null
    contactCount: number | null
    appointmentBookedCount: number | null
    soldCount: number | null
    ctaClickCount: number | null
  }
}

export type FunnelStage = {
  stageKey: string
  stageOrder: number
  count: number
  conversionRate: number
}

export type TimeSeriesPoint = {
  date: string
  lead_count?: number
  contact_count?: number
  appointment_booked_count?: number
  cta_click_count?: number
}

export type BreakdownRow = {
  dimension: string
  dimensionValue: string
  value: number
  unit: string
  metricKey: string
}

export type RecentEvent = {
  id: string
  type: string
  source: string | null
  medium: string | null
  campaign: string | null
  occurredAt: string
  description: string
}

export type Opportunity = {
  id: string
  contactName: string | null
  county: string | null
  productInterest: string | null
  stage: string
  leadScore: number
  lastActivityAt: string | null
  reason: string
}

export type ApiEnvelope<T> = {
  ok: boolean
  data?: T
  range?: {
    from: string
    to: string
  }
  meta?: {
    generatedAt: string
    source: string
    warnings: string[]
  }
  error?: string
}
