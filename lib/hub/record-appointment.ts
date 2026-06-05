import { prisma } from '@/lib/prisma'
import { changeInquiryStage } from './change-stage'
import { ingestEvent } from './ingest-event'
import { cleanString } from './normalizers'

export async function recordAppointment(input: {
  inquiryId?: string | null
  leadSessionId?: string | null
  gcalId?: string | null
  scheduledFor?: string | Date | null
  endAt?: string | Date | null
  bookingSource?: string | null
  source?: string | null
  medium?: string | null
  campaign?: string | null
  status?: string | null
  location?: string | null
}) {
  const inquiry = input.inquiryId
    ? await prisma.inquiry.findUnique({ where: { id: input.inquiryId }, include: { contact: true } })
    : await prisma.inquiry.findFirst({
        where: { leadSessionId: cleanString(input.leadSessionId, 191) ?? undefined },
        orderBy: { createdAt: 'desc' },
        include: { contact: true },
      })

  if (!inquiry) throw new Error('No matching inquiry')

  const appointment = await prisma.appointment.create({
    data: {
      contactId: inquiry.contactId,
      inquiryId: inquiry.id,
      bookingSource: cleanString(input.bookingSource, 100) ?? 'booking_webhook',
      source: cleanString(input.source, 100) ?? inquiry.source ?? undefined,
      medium: cleanString(input.medium, 100) ?? inquiry.medium ?? undefined,
      campaign: cleanString(input.campaign, 150) ?? inquiry.campaign ?? undefined,
      scheduledFor: input.scheduledFor ? new Date(input.scheduledFor) : undefined,
      status: cleanString(input.status, 100) ?? 'Booked',
      location: cleanString(input.location, 250) ?? undefined,
    },
  })

  await changeInquiryStage({
    inquiryId: inquiry.id,
    stage: 'Booked',
    actor: 'booking-webhook',
  })

  await ingestEvent({
    eventType: 'appointment_booked',
    occurredAt: input.scheduledFor ? new Date(input.scheduledFor) : new Date(),
    contactId: inquiry.contactId,
    inquiryId: inquiry.id,
    leadSessionId: inquiry.leadSessionId,
    pageUrl: inquiry.landingPage,
    source: cleanString(input.source, 100) ?? inquiry.source ?? undefined,
    medium: cleanString(input.medium, 100) ?? inquiry.medium ?? undefined,
    campaign: cleanString(input.campaign, 150) ?? inquiry.campaign ?? undefined,
    county: inquiry.county ?? inquiry.contact?.county ?? undefined,
    productInterest: inquiry.productInterest,
    metadata: {
      appointmentId: appointment.id,
      gcalId: cleanString(input.gcalId, 200),
      status: appointment.status,
      scheduledFor: appointment.scheduledFor,
    },
  })

  return { inquiry, appointment }
}
