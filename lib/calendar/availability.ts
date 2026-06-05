import { BOOKING_CONFIG } from '@/lib/booking/config'
import { getValidGoogleAccessToken } from '@/lib/calendar/google'

type BusyInterval = {
  start: string
  end: string
}

export async function fetchGoogleFreeBusy(input: {
  timeMin: string
  timeMax: string
  calendarId?: string
}) {
  const accessToken = await getValidGoogleAccessToken()
  const calendarId = input.calendarId || BOOKING_CONFIG.calendarId

  const res = await fetch('https://www.googleapis.com/calendar/v3/freeBusy', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      timeMin: input.timeMin,
      timeMax: input.timeMax,
      timeZone: BOOKING_CONFIG.timezone,
      items: [{ id: calendarId }],
    }),
    cache: 'no-store',
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data?.error?.message || 'Failed to fetch Google Calendar free/busy')
  }

  const busy = (data?.calendars?.[calendarId]?.busy ?? []) as BusyInterval[]
  return busy
}