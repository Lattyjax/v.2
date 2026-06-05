import { prisma } from '@/lib/prisma'
import { ingestEvent } from './ingest-event'
import { cleanString, normalizeStage } from './normalizers'
import { syncContactToNotion } from '@/lib/notion/sync-contact'
import { logger } from '@/lib/logger'

export async function changeInquiryStage(input: {
  inquiryId: string
  stage: string
  notes?: string | null
  actor?: string | null
  occurredAt?: Date | string | null
}) {
  const inquiry = await prisma.inquiry.findUnique({
    where: { id: input.inquiryId },
    include: { contact: true },
  })

  if (!inquiry) throw new Error('Inquiry not found')

  const toStage = normalizeStage(input.stage)
  const note = cleanString(input.notes, 2000)
  const actor = cleanString(input.actor, 100) ?? 'system'
  const occurredAt = input.occurredAt ? new Date(input.occurredAt) : new Date()

  const updated = await prisma.inquiry.update({
    where: { id: input.inquiryId },
    data: {
      stage: toStage,
      notes: note ?? inquiry.notes ?? undefined,
    },
  })

  await prisma.inquiryStageHistory.create({
    data: {
      inquiryId: input.inquiryId,
      fromStage: inquiry.stage,
      toStage,
      actor,
      note: note ?? undefined,
      changedAt: occurredAt,
    },
  })

  await ingestEvent({
    eventType: 'stage_changed',
    occurredAt,
    inquiryId: input.inquiryId,
    contactId: inquiry.contactId,
    leadSessionId: inquiry.leadSessionId,
    pageUrl: inquiry.landingPage,
    source: inquiry.source,
    medium: inquiry.medium,
    campaign: inquiry.campaign,
    county: inquiry.county ?? inquiry.contact?.county ?? undefined,
    productInterest: inquiry.productInterest,
    metadata: {
      fromStage: inquiry.stage,
      toStage,
      actor,
      note,
    },
  })

  // Fire-and-forget — Notion sync must not block or break stage changes
  syncContactToNotion(inquiry.contact, updated).catch(err =>
    logger.error({ err, contactId: inquiry.contact.id }, 'Notion sync failed'),
  )

  return updated
}
