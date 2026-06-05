import { prisma } from '@/lib/prisma'
import { cleanString, normalizeEventType, normalizeProductInterest } from './normalizers'
import type { Prisma } from '@prisma/client'

export type EventIngestInput = {
  eventType: string
  occurredAt?: string | Date | null
  leadSessionId?: string | null
  contactId?: string | null
  inquiryId?: string | null
  pageUrl?: string | null
  referrer?: string | null
  source?: string | null
  medium?: string | null
  campaign?: string | null
  county?: string | null
  productInterest?: string | null
  metadata?: Record<string, unknown> | null
}

export async function ingestEvent(input: EventIngestInput) {
  const leadSessionId = cleanString(input.leadSessionId, 191)
  const eventType = normalizeEventType(input.eventType)
  const parsedAt = input.occurredAt ? new Date(input.occurredAt) : null
  const occurredAt = parsedAt && !Number.isNaN(parsedAt.getTime()) ? parsedAt : new Date()

  if (leadSessionId) {
    await prisma.leadSession.upsert({
      where: { id: leadSessionId },
      update: {
        lastSeenAt: occurredAt,
        landingPage: cleanString(input.pageUrl, 500) ?? undefined,
        referrer: cleanString(input.referrer, 500) ?? undefined,
        source: cleanString(input.source, 100) ?? undefined,
        medium: cleanString(input.medium, 100) ?? undefined,
        campaign: cleanString(input.campaign, 150) ?? undefined,
        county: cleanString(input.county, 100) ?? undefined,
        productInterest: input.productInterest ? normalizeProductInterest(input.productInterest) : undefined,
        contactId: cleanString(input.contactId, 191) ?? undefined,
      },
      create: {
        id: leadSessionId,
        firstSeenAt: occurredAt,
        lastSeenAt: occurredAt,
        landingPage: cleanString(input.pageUrl, 500) ?? undefined,
        referrer: cleanString(input.referrer, 500) ?? undefined,
        source: cleanString(input.source, 100) ?? undefined,
        medium: cleanString(input.medium, 100) ?? undefined,
        campaign: cleanString(input.campaign, 150) ?? undefined,
        county: cleanString(input.county, 100) ?? undefined,
        productInterest: input.productInterest ? normalizeProductInterest(input.productInterest) : undefined,
        contactId: cleanString(input.contactId, 191) ?? undefined,
      },
    })
  }

  return prisma.event.create({
    data: {
      eventType,
      occurredAt,
      leadSessionId: leadSessionId ?? undefined,
      contactId: cleanString(input.contactId, 191) ?? undefined,
      inquiryId: cleanString(input.inquiryId, 191) ?? undefined,
      pageUrl: cleanString(input.pageUrl, 500) ?? undefined,
      referrer: cleanString(input.referrer, 500) ?? undefined,
      source: cleanString(input.source, 100) ?? undefined,
      medium: cleanString(input.medium, 100) ?? undefined,
      campaign: cleanString(input.campaign, 150) ?? undefined,
      county: cleanString(input.county, 100) ?? undefined,
      productInterest: input.productInterest ? normalizeProductInterest(input.productInterest) : undefined,
      metadata: (input.metadata as Prisma.InputJsonValue) ?? undefined,
    },
  })
}
