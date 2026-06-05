export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import twilio from 'twilio'
import { prisma } from '@/lib/prisma'
import { requireCronAuth } from '@/lib/ai/shared'

const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null

export async function GET(req: NextRequest) {
  const authError = requireCronAuth(req)
  if (authError) return authError

  if (!twilioClient || !process.env.TWILIO_PHONE_NUMBER) {
    return NextResponse.json({ ok: false, error: 'Twilio is not configured' }, { status: 400 })
  }

  const now = new Date()
  const inTwoHours = new Date(now.getTime() + 2 * 60 * 60 * 1000)

  const events = await prisma.calendarEvent.findMany({
    where: { startAt: { lte: inTwoHours, gte: now }, status: 'scheduled' },
    include: { contact: true },
  })

  let reminders = 0
  for (const event of events) {
    if (!event.contact?.phone) continue
    await twilioClient.messages.create({
      body: `Reminder: You have a meeting scheduled at ${event.startAt.toLocaleString('en-US')}.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: event.contact.phone,
    })
    reminders += 1
    await prisma.systemEvent.create({ data: { type: 'appointment.reminder.sent', contactId: event.contact.id, payload: { eventId: event.id } } })
  }

  return NextResponse.json({ ok: true, reminders })
}
