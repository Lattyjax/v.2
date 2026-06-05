import { prisma } from '@/lib/prisma'
import { ingestEvent } from './ingest-event'
import { cleanString, normalizeProductInterest } from './normalizers'
import { syncContactToNotion } from '@/lib/notion/sync-contact'
import { logger } from '@/lib/logger'

export type LeadUpsertInput = {
  firstName?: string | null
  lastName?: string | null
  email?: string | null
  phone?: string | null
  county?: string | null
  productInterest?: string | null
  leadSessionId?: string | null
  source?: string | null
  medium?: string | null
  campaign?: string | null
  term?: string | null
  content?: string | null
  referrer?: string | null
  landingPage?: string | null
  notes?: string | null
  metadata?: Record<string, unknown> | null
}

export async function upsertLead(input: LeadUpsertInput) {
  const email = cleanString(input.email, 191)?.toLowerCase() ?? null
  const phone = cleanString(input.phone, 40)
  const firstName = cleanString(input.firstName, 100)
  const lastName = cleanString(input.lastName, 100)
  const county = cleanString(input.county, 100)
  const source = cleanString(input.source, 100)
  const medium = cleanString(input.medium, 100)
  const campaign = cleanString(input.campaign, 150)
  const term = cleanString(input.term, 100)
  const content = cleanString(input.content, 100)
  const referrer = cleanString(input.referrer, 500)
  const landingPage = cleanString(input.landingPage, 500)
  const leadSessionId = cleanString(input.leadSessionId, 191)
  const productInterest = normalizeProductInterest(input.productInterest)
  const notes = cleanString(input.notes, 2000)

  let existing = null as Awaited<ReturnType<typeof prisma.contact.findFirst>> | null
  if (email) {
    existing = await prisma.contact.findUnique({ where: { email } })
  }
  if (!existing && phone) {
    existing = await prisma.contact.findFirst({ where: { phone } })
  }

  let contact: Awaited<ReturnType<typeof prisma.contact.update>>
  if (existing) {
    contact = await prisma.contact.update({
      where: { id: existing.id },
      data: {
        firstName: firstName ?? existing.firstName ?? undefined,
        lastName: lastName ?? existing.lastName ?? undefined,
        email: email ?? existing.email ?? undefined,
        phone: phone ?? existing.phone ?? undefined,
        county: county ?? existing.county ?? undefined,
        primarySource: existing.primarySource ?? source ?? undefined,
        primaryMedium: existing.primaryMedium ?? medium ?? undefined,
        primaryCampaign: existing.primaryCampaign ?? campaign ?? undefined,
      },
    })
  } else {
    try {
      contact = await prisma.contact.create({
        data: {
          email: email ?? undefined,
          firstName: firstName ?? undefined,
          lastName: lastName ?? undefined,
          phone: phone ?? undefined,
          county: county ?? undefined,
          primarySource: source ?? undefined,
          primaryMedium: medium ?? undefined,
          primaryCampaign: campaign ?? undefined,
        },
      })
    } catch (err: any) {
      // P2002 = unique constraint violation — a concurrent request created this contact first
      if (err.code === 'P2002' && email) {
        const found = await prisma.contact.findUnique({ where: { email } })
        if (!found) throw err
        contact = await prisma.contact.update({
          where: { id: found.id },
          data: {
            firstName: firstName ?? found.firstName ?? undefined,
            lastName: lastName ?? found.lastName ?? undefined,
            phone: phone ?? found.phone ?? undefined,
            county: county ?? found.county ?? undefined,
            primarySource: found.primarySource ?? source ?? undefined,
            primaryMedium: found.primaryMedium ?? medium ?? undefined,
            primaryCampaign: found.primaryCampaign ?? campaign ?? undefined,
          },
        })
      } else {
        throw err
      }
    }
  }

  if (leadSessionId) {
    await prisma.leadSession.upsert({
      where: { id: leadSessionId },
      update: {
        lastSeenAt: new Date(),
        contactId: contact.id,
        landingPage: landingPage ?? undefined,
        referrer: referrer ?? undefined,
        source: source ?? undefined,
        medium: medium ?? undefined,
        campaign: campaign ?? undefined,
        term: term ?? undefined,
        content: content ?? undefined,
        county: county ?? undefined,
        productInterest,
      },
      create: {
        id: leadSessionId,
        contactId: contact.id,
        landingPage: landingPage ?? undefined,
        referrer: referrer ?? undefined,
        source: source ?? undefined,
        medium: medium ?? undefined,
        campaign: campaign ?? undefined,
        term: term ?? undefined,
        content: content ?? undefined,
        county: county ?? undefined,
        productInterest,
      },
    })
  }

  const inquiry = await prisma.inquiry.create({
    data: {
      contactId: contact.id,
      leadSessionId: leadSessionId ?? undefined,
      productInterest,
      stage: 'New',
      source: source ?? undefined,
      medium: medium ?? undefined,
      campaign: campaign ?? undefined,
      landingPage: landingPage ?? undefined,
      county: county ?? undefined,
      notes: notes ?? undefined,
    },
  })

  await prisma.task.create({
    data: {
      title: `Follow up with ${[contact.firstName, contact.lastName].filter(Boolean).join(' ') || contact.email || contact.phone || 'new lead'}`,
      dueAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      inquiryId: inquiry.id,
      contactId: contact.id,
    },
  })

  await ingestEvent({
    eventType: 'lead_created',
    leadSessionId,
    contactId: contact.id,
    inquiryId: inquiry.id,
    pageUrl: landingPage,
    referrer,
    source,
    medium,
    campaign,
    county,
    productInterest,
    metadata: {
      form: 'lead',
      firstName,
      lastName,
      email,
      phone,
      ...(input.metadata ?? {}),
    },
  })

  // Fire-and-forget — Notion sync must not block or break lead capture
  syncContactToNotion(contact, inquiry).catch(err =>
    logger.error({ err, contactId: contact.id }, 'Notion sync failed'),
  )

  return { contact, inquiry }
}
