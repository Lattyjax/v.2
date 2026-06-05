import {
  ApiEnvelope,
  OverviewData,
  FunnelStage,
  TimeSeriesPoint,
  BreakdownRow,
  RecentEvent,
  Opportunity,
} from './types'

async function getJson<T>(url: string): Promise<ApiEnvelope<T>> {
  try {
    const res = await fetch(url, { cache: 'no-store' })
    const json = (await res.json()) as ApiEnvelope<T>

    if (!res.ok) {
      return {
        ok: false,
        error: json.error ?? `Request failed with status ${res.status}`,
      }
    }

    return json
  } catch {
    return {
      ok: false,
      error: 'Network error',
    }
  }
}

export const analyticsApi = {
  overview: (qs: string) => getJson<OverviewData>(`/api/analytics/v1/overview?${qs}`),

  funnel: (qs: string) => getJson<FunnelStage[]>(`/api/analytics/v1/funnel?${qs}`),

  timeSeries: (qs: string) =>
    getJson<TimeSeriesPoint[]>(
      `/api/analytics/v1/time-series?${qs}&metrics=lead_count,contact_count,appointment_booked_count,cta_click_count`
    ),

  breakdowns: (qs: string) =>
    getJson<BreakdownRow[]>(`/api/analytics/v1/breakdowns?${qs}&dimension=source`),

  recentEvents: () => getJson<RecentEvent[]>('/api/analytics/v1/recent-events?limit=15'),

  opportunities: () => getJson<Opportunity[]>('/api/analytics/v1/opportunities'),
}
