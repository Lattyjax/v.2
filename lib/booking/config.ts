export const BOOKING_CONFIG = {
    timezone: process.env.BOOKING_TIMEZONE || 'America/New_York',
    workingDays: [1, 2, 3, 4, 5], // Mon-Fri
    startHour: 9,
    endHour: 17,
    durationMinutes: 30,
    bufferMinutes: 15,
    minimumNoticeHours: 4,
    horizonDays: 21,
    maxBookingsPerDay: 6,
    calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
  }