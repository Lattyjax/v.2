type DashboardEventPayload = Record<string, unknown>

export async function trackDashboardEvent(
  eventName: string,
  payload: DashboardEventPayload = {}
): Promise<void> {
  const apiUrl = process.env.NEXT_PUBLIC_ANALYTICS_API_URL
  const apiKey = process.env.NEXT_PUBLIC_ANALYTICS_KEY

  if (!apiUrl || !apiKey) return

  try {
    const res = await fetch(`${apiUrl}/track`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        event: eventName,
        timestamp: new Date().toISOString(),
        properties: payload,
        path: typeof window !== 'undefined' ? window.location.pathname : undefined,
      }),
    })

    if (!res.ok) {
      throw new Error(`Analytics API responded with status ${res.status}`)
    }
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[trackDashboardEvent]', err)
    }
  }
}
