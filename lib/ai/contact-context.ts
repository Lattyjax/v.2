import { prisma } from '@/lib/prisma'
import { toIso } from './shared'

function daysSince(date?: Date | null) {
  if (!date) return null
  return Math.floor((Date.now() - date.getTime()) / 86400000)
}

export async function getContactAiContext(input: { contactId?: string | null; inquiryId?: string | null }) {
  if (!input.contactId && !input.inquiryId) throw new Error('contactId or inquiryId is required')

  const inquiry =
    input.inquiryId
      ? await prisma.inquiry.findUnique({
          where: { id: input.inquiryId },
          include: { contact: true },
        })
      : null

  const contactId = input.contactId ?? inquiry?.contactId
  if (!contactId) throw new Error('Unable to resolve contact')

  const contact = await prisma.contact.findUnique({
    where: { id: contactId },
    include: {
      inquiries: { orderBy: { updatedAt: 'desc' }, take: 10 },
      tasks: { orderBy: { dueAt: 'asc' }, take: 10 },
      appointments: { orderBy: { scheduledFor: 'desc' }, take: 10 },
      notes: { orderBy: { createdAt: 'desc' }, take: 10 },
      conversationThreads: {
        orderBy: { updatedAt: 'desc' },
        take: 5,
        include: { messages: { orderBy: { createdAt: 'desc' }, take: 8 } },
      },
      systemEvents: { orderBy: { occurredAt: 'desc' }, take: 20 },
    },
  })
  if (!contact) throw new Error('Contact not found')

  const latestInquiry = inquiry ?? contact.inquiries[0] ?? null
  const recentMessages = contact.conversationThreads.flatMap((thread) =>
    thread.messages.map((message) => ({
      id: message.id,
      channel: message.channel,
      direction: message.direction,
      subject: message.subject,
      bodyText: message.bodyText,
      createdAt: toIso(message.createdAt),
    }))
  )

  return {
    generatedAt: new Date().toISOString(),
    contact: {
      id: contact.id,
      fullName: contact.fullName,
      firstName: contact.firstName,
      lastName: contact.lastName,
      email: contact.email,
      phone: contact.phone,
      county: contact.county,
      leadScore: contact.leadScore,
      primarySource: contact.primarySource,
      primaryMedium: contact.primaryMedium,
      primaryCampaign: contact.primaryCampaign,
      lastActivityAt: toIso(contact.lastActivityAt),
      nextFollowUpAt: toIso(contact.nextFollowUpAt),
      notesSummary: contact.notesSummary,
      daysSinceLastActivity: daysSince(contact.lastActivityAt),
    },
    inquiry: latestInquiry
      ? {
          id: latestInquiry.id,
          stage: latestInquiry.stage,
          productInterest: latestInquiry.productInterest,
          source: latestInquiry.source,
          medium: latestInquiry.medium,
          campaign: latestInquiry.campaign,
          county: latestInquiry.county,
          notes: latestInquiry.notes,
          leadScore: latestInquiry.leadScore,
        }
      : null,
    tasks: contact.tasks.map((task) => ({
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      dueAt: toIso(task.dueAt),
    })),
    appointments: contact.appointments.map((appointment) => ({
      id: appointment.id,
      scheduledFor: toIso(appointment.scheduledFor),
      status: appointment.status,
      source: appointment.source,
      location: appointment.location,
    })),
    notes: contact.notes.map((note) => ({
      id: note.id,
      title: note.title,
      body: note.body,
      author: note.author,
      createdAt: toIso(note.createdAt),
    })),
    recentMessages,
    recentSystemEvents: contact.systemEvents.map((event) => ({
      id: event.id,
      type: event.type,
      occurredAt: toIso(event.occurredAt),
      source: event.source,
      medium: event.medium,
      campaign: event.campaign,
      payload: event.payload,
    })),
    inquirySummaries: contact.inquiries.map((row) => ({
      id: row.id,
      createdAt: toIso(row.createdAt),
      updatedAt: toIso(row.updatedAt),
      stage: row.stage,
      productInterest: row.productInterest,
      source: row.source,
      medium: row.medium,
      campaign: row.campaign,
      leadScore: row.leadScore,
      notes: row.notes,
    })),
  }
}
