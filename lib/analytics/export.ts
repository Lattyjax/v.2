import type { AnalyticsOverviewData, AnalyticsTimeSeriesPoint, AnalyticsBreakdownRow, AnalyticsFunnelStage, AnalyticsOpportunity } from './queries'

// ─── CSV helpers ──────────────────────────────────────────────────────────────

function escapeCell(value: unknown): string {
  const str = value == null ? '' : String(value)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function buildCsv(headers: string[], rows: unknown[][]): string {
  const lines: string[] = [headers.map(escapeCell).join(',')]
  for (const row of rows) {
    lines.push(row.map(escapeCell).join(','))
  }
  return lines.join('\n')
}

// ─── Overview KPIs ────────────────────────────────────────────────────────────

export function buildOverviewCsv(data: AnalyticsOverviewData): string {
  const headers = ['metric', 'value', 'unit']
  const rows: unknown[][] = [
    ['lead_count', data.leadCount, 'count'],
    ['contact_count', data.contactCount, 'count'],
    ['appointment_booked_count', data.appointmentBookedCount, 'count'],
    ['sold_count', data.soldCount, 'count'],
    ['cta_click_count', data.ctaClickCount, 'count'],
    ['form_submit_count', data.formSubmitCount, 'count'],
    ['lead_to_booking_rate', data.leadToBookingRate.toFixed(4), 'ratio'],
    ['lead_to_sold_rate', data.leadToSoldRate.toFixed(4), 'ratio'],
    ['avg_lead_score', data.avgLeadScore.toFixed(2), 'score'],
    ['stale_lead_count', data.staleLeadCount, 'count'],
    ['task_overdue_count', data.taskOverdueCount, 'count'],
    ['social_click_count', data.socialClickCount, 'count'],
    ['social_engagement_count', data.socialEngagementCount, 'count'],
    ['ai_success_rate', data.aiSuccessRate.toFixed(2), 'percent'],
    ['ai_avg_latency_ms', data.aiAvgLatencyMs.toFixed(0), 'ms'],
  ]
  return buildCsv(headers, rows)
}

// ─── Time Series ──────────────────────────────────────────────────────────────

export function buildTimeSeriesCsv(data: AnalyticsTimeSeriesPoint[]): string {
  if (data.length === 0) return 'date\n'

  // Collect all unique metric keys
  const keys = new Set<string>()
  for (const point of data) {
    for (const k of Object.keys(point)) {
      if (k !== 'date') keys.add(k)
    }
  }
  const metricKeys = Array.from(keys).sort()
  const headers = ['date', ...metricKeys]

  const rows = data.map(point => [
    point.date,
    ...metricKeys.map(k => point[k] ?? ''),
  ])

  return buildCsv(headers, rows)
}

// ─── Breakdowns ───────────────────────────────────────────────────────────────

export function buildBreakdownCsv(data: AnalyticsBreakdownRow[]): string {
  const headers = ['metricKey', 'dimension', 'dimensionValue', 'value', 'unit']
  const rows = data.map(row => [
    row.metricKey,
    row.dimension,
    row.dimensionValue,
    row.value,
    row.unit,
  ])
  return buildCsv(headers, rows)
}

// ─── Funnel ───────────────────────────────────────────────────────────────────

export function buildFunnelCsv(data: AnalyticsFunnelStage[]): string {
  const headers = ['stageOrder', 'stageKey', 'count', 'conversionRate']
  const rows = data.map(s => [
    s.stageOrder,
    s.stageKey,
    s.count,
    s.conversionRate.toFixed(2),
  ])
  return buildCsv(headers, rows)
}

// ─── Opportunities (no PII emails/phones) ────────────────────────────────────

export function buildOpportunitiesCsv(data: AnalyticsOpportunity[]): string {
  const headers = [
    'id',
    'contactName',
    'county',
    'productInterest',
    'stage',
    'leadScore',
    'lastActivityAt',
    'reason',
  ]
  const rows = data.map(o => [
    o.id,
    o.contactName ?? '',
    o.county ?? '',
    o.productInterest ?? '',
    o.stage,
    o.leadScore,
    o.lastActivityAt ?? '',
    o.reason,
  ])
  return buildCsv(headers, rows)
}
