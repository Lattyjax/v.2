export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { BRAND } from '@/lib/brand'
import { LeadIntent, LeadStatus } from '@prisma/client'
import { inferLeadSource } from '@/lib/tracking/infer'
import { rateLimit } from '@/lib/rate-limit'

const QuerySchema = z.object({
  lead_session_id: z.string().max(191).optional().nullable(),
  leadSessionId: z.string().max(191).optional().nullable(),
  page_url: z.string().max(500).optional().nullable(),
  referrer: z.string().max(500).optional().nullable(),
  utm_source: z.string().max(100).optional().nullable(),
  utm_medium: z.string().max(100).optional().nullable(),
  utm_campaign: z.string().max(150).optional().nullable(),
  utm_term: z.string().max(100).optional().nullable(),
  utm_content: z.string().max(100).optional().nullable(),

  // Optional association (for admin-driven sends or later flows)
  contactId: z.string().uuid().optional().nullable(),
  inquiryId: z.string().uuid().optional().nullable(),

  // Optional hint: default = quick_term
  intent: z.enum(['quick_term', 'consult']).optional().nullable(),
})

function pick<T>(value: T | null | undefined): T | undefined {
  if (value === null || value === undefined || value === '') return undefined
  return value
}

export async function GET(req: NextRequest) {
  const limited = await rateLimit(req, 'ethos_redirect')
  if (limited) return limited

  const url = new URL(req.url)
  const parsed = QuerySchema.safeParse(Object.fromEntries(url.searchParams.entries()))
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.flatten() }, { status: 422 })
  }

  const q = parsed.data
  const leadSessionId = pick(q.lead_session_id) ?? pick(q.leadSessionId)
  const pageUrl = pick(q.page_url) ?? '/'

  const sourceType = inferLeadSource({
    utmSource: pick(q.utm_source) ?? null,
    utmMedium: pick(q.utm_medium) ?? null,
    referrer: pick(q.referrer) ?? null,
    landingPage: pageUrl,
  })

  const intentHint = q.intent === 'consult' ? LeadIntent.CONSULT : LeadIntent.QUICK_TERM

  // 1) Ensure lead session exists if provided (connects later form submits)
  if (leadSessionId) {
    await prisma.leadSession.upsert({
      where: { id: leadSessionId },
      update: {
        lastSeenAt: new Date(),
        landingPage: pageUrl ?? undefined,
        referrer: pick(q.referrer) ?? undefined,
        source: pick(q.utm_source) ?? undefined,
        medium: pick(q.utm_medium) ?? undefined,
        campaign: pick(q.utm_campaign) ?? undefined,
        term: pick(q.utm_term) ?? undefined,
        content: pick(q.utm_content) ?? undefined,
      },
      create: {
        id: leadSessionId,
        landingPage: pageUrl ?? undefined,
        referrer: pick(q.referrer) ?? undefined,
        source: pick(q.utm_source) ?? undefined,
        medium: pick(q.utm_medium) ?? undefined,
        campaign: pick(q.utm_campaign) ?? undefined,
        term: pick(q.utm_term) ?? undefined,
        content: pick(q.utm_content) ?? undefined,
      },
    })
  }

  // 2) Log Event (marketing/system source of truth)
  await prisma.event.create({
    data: {
      eventType: 'cta_click',
      occurredAt: new Date(),
      leadSessionId: leadSessionId ?? undefined,
      contactId: pick(q.contactId),
      inquiryId: pick(q.inquiryId),
      pageUrl: pageUrl ?? undefined,
      referrer: pick(q.referrer) ?? undefined,
      source: pick(q.utm_source) ?? undefined,
      medium: pick(q.utm_medium) ?? undefined,
      campaign: pick(q.utm_campaign) ?? undefined,
      metadata: {
        destination: 'ethos',
        ethosUrl: BRAND.ethosUrl,
        intentHint,
      },
    },
  })

  // 3) Log SystemEvent (audit trail + admin filtering later)
  await prisma.systemEvent.create({
    data: {
      type: 'ethos.redirect',
      occurredAt: new Date(),
      leadSessionId: leadSessionId ?? undefined,
      contactId: pick(q.contactId),
      inquiryId: pick(q.inquiryId),
      source: pick(q.utm_source) ?? undefined,
      medium: pick(q.utm_medium) ?? undefined,
      campaign: pick(q.utm_campaign) ?? undefined,
      payload: {
        destination: 'ethos',
        ethosUrl: BRAND.ethosUrl,
        pageUrl,
        referrer: pick(q.referrer) ?? null,
        sourceType,
        intentHint,
      },
    },
  })

  // 4) If we have an inquiry/contact, update lifecycle status
  // (This is the key “source of truth” step)
  if (q.inquiryId) {
    await prisma.inquiry.update({
      where: { id: q.inquiryId },
      data: {
        sourceType,
        status: LeadStatus.REFERRED_TO_ETHOS,
        // Do NOT overwrite intent if it's already meaningful; only upgrade UNKNOWN
        intent: undefined,
      },
    })

    const inquiry = await prisma.inquiry.findUnique({
      where: { id: q.inquiryId },
      select: { intent: true, contactId: true },
    })

    if (inquiry) {
      await prisma.inquiry.update({
        where: { id: q.inquiryId },
        data: {
          intent: inquiry.intent === 'UNKNOWN' ? intentHint : inquiry.intent,
        },
      })

      await prisma.contact.update({
        where: { id: inquiry.contactId },
        data: {
          primarySourceType: undefined, // preserve; do not overwrite
          currentIntent: intentHint,
          status: LeadStatus.REFERRED_TO_ETHOS,
        },
      })
    }
  } else if (q.contactId) {
    // If only contactId is known, update contact lifecycle (optional path)
    await prisma.contact.update({
      where: { id: q.contactId },
      data: {
        currentIntent: intentHint,
        status: LeadStatus.REFERRED_TO_ETHOS,
        primarySourceType: undefined,
        primaryIntent: undefined,
      },
    })
  }

  // 5) Redirect to Ethos (safe allowlist: always redirect to BRAND.ethosUrl)
  const ethos = new URL(BRAND.ethosUrl)

  // Optional: pass UTM through (harmless, helps downstream analytics)
  if (pick(q.utm_source)) ethos.searchParams.set('utm_source', pick(q.utm_source)!)
  if (pick(q.utm_medium)) ethos.searchParams.set('utm_medium', pick(q.utm_medium)!)
  if (pick(q.utm_campaign)) ethos.searchParams.set('utm_campaign', pick(q.utm_campaign)!)

  return NextResponse.redirect(ethos.toString(), { status: 302 })
}