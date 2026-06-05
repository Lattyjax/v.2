import { BOOKING_CONFIG } from '@/lib/booking/config'
import { getValidGoogleAccessToken } from '@/lib/calendar/google'

export async function createGoogleCalendarEvent(input: {
  summary: string
  description?: string | null
  start: string
  end: string
  attendeeEmail?: string | null
  attendeeName?: string | null
  location?: string | null
}) {
  const accessToken = await getValidGoogleAccessToken()

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(BOOKING_CONFIG.calendarId)}/events`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        summary: input.summary,
        description: input.description ?? undefined,
        location: input.location ?? undefined,
        start: {
          dateTime: input.start,
          timeZone: BOOKING_CONFIG.timezone,
        },
        end: {
          dateTime: input.end,
          timeZone: BOOKING_CONFIG.timezone,
        },
        attendees: input.attendeeEmail
          ? [
              {
                email: input.attendeeEmail,
                displayName: input.attendeeName ?? undefined,
              },
            ]
          : undefined,
      }),
      cache: 'no-store',
    }
  )

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data?.error?.message || 'Failed to create Google Calendar event')
  }

  return data as {
    id: string
    htmlLink?: string
    hangoutLink?: string
    status?: string
  }
}