export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminSession } from '@/lib/ai/shared'

export async function POST(req: NextRequest) {
  const auth = await requireAdminSession()
  if (!auth.ok) return auth.response

  const body = await req.json().catch(() => null)
  if (!body?.contactId || !body?.title || !body?.startAt) {
    return NextResponse.json({ ok: false, error: 'contactId, title, and startAt are required' }, { status: 422 })
  }

  const event = await prisma.calendarEvent.create({
    data: {
      contactId: body.contactId,
      inquiryId: body.inquiryId,
      provider: 'manual',
      title: body.title,
      startAt: new Date(body.startAt),
      endAt: body.endAt ? new Date(body.endAt) : undefined,
      meetingUrl: body.meetingUrl,
      timezone: body.timezone,
      location: body.location,
      status: 'scheduled',
    },
  })

  await prisma.systemEvent.create({
    data: { type: 'calendar.manual.booked', contactId: body.contactId, inquiryId: body.inquiryId, payload: { eventId: event.id } },
  })

  return NextResponse.json({ ok: true, event })
}
