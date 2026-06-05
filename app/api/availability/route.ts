export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { BOOKING_CONFIG } from '@/lib/booking/config'
import { fetchGoogleFreeBusy } from '@/lib/calendar/availability'
import { generateAvailability, projectSlots } from '@/lib/calendar/slots'

export async function GET() {
  try {
    const base = await generateAvailability()

    const firstDay = base.daysToCheck[0]
    const lastDay = base.daysToCheck[base.daysToCheck.length - 1]

    const timeMin = new Date(firstDay.getTime()).toISOString()
    const timeMax = new Date(lastDay.getTime() + 24 * 60 * 60 * 1000).toISOString()

    const busy = await fetchGoogleFreeBusy({
      timeMin,
      timeMax,
      calendarId: BOOKING_CONFIG.calendarId,
    })

    const days = projectSlots({
      daysToCheck: base.daysToCheck,
      busy,
      minBookTime: base.minBookTime,
      dailyCounts: base.dailyCounts,
    })

    return NextResponse.json({
      ok: true,
      timezone: BOOKING_CONFIG.timezone,
      rules: {
        workingDays: BOOKING_CONFIG.workingDays,
        startHour: BOOKING_CONFIG.startHour,
        endHour: BOOKING_CONFIG.endHour,
        durationMinutes: BOOKING_CONFIG.durationMinutes,
        bufferMinutes: BOOKING_CONFIG.bufferMinutes,
        minimumNoticeHours: BOOKING_CONFIG.minimumNoticeHours,
        horizonDays: BOOKING_CONFIG.horizonDays,
        maxBookingsPerDay: BOOKING_CONFIG.maxBookingsPerDay,
      },
      days,
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        error: error?.message || 'Failed to load availability',
      },
      { status: 500 }
    )
  }
}