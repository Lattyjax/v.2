import crypto from 'crypto'
import { decryptToken } from '@/lib/crypto'
import { prisma } from '@/lib/prisma'
import { GRAPH_VERSION } from './facebook-oauth'
import { NormalizedSocialLead, readFieldValue, splitName } from './types'

export function verifyMetaSignature(rawBody: string, signature: string | null): boolean {
  const secret = process.env.META_APP_SECRET
  if (!secret) return false
  if (!signature) return false
  const expected = 'sha256=' + crypto.createHmac('sha256', secret).update(rawBody).digest('hex')
  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
  } catch {
    return false
  }
}

async function getPageAccessToken(pageId?: string): Promise<string | null> {
  if (pageId) {
    const connection = await (prisma as any).socialConnection?.findFirst({
      where: { provider: 'facebook', externalId: pageId },
      orderBy: { updatedAt: 'desc' },
    })
    const token = decryptToken(connection?.accessToken)
    if (token) return token
  }

  return process.env.META_PAGE_ACCESS_TOKEN || null
}

export async function fetchMetaLead(
  leadgenId: string,
  pageAccessToken?: string,
  pageId?: string
): Promise<Record<string, unknown>> {
  const token = pageAccessToken || await getPageAccessToken(pageId)
  if (!token) throw new Error('A Meta page access token is not configured for this page')

  const params = new URLSearchParams({
    fields: 'field_data,created_time,ad_id,adset_id,campaign_id,form_id',
    access_token: token,
  })
  const res = await fetch(`https://graph.facebook.com/${GRAPH_VERSION}/${leadgenId}?${params}`)
  const data = await res.json()
  if (!res.ok || data.error) {
    throw new Error(`Meta Graph API lead fetch failed: ${data.error?.message ?? res.status}`)
  }
  return data
}

export function normalizeMetaLead(
  raw: Record<string, unknown>,
  platform: 'facebook' | 'instagram' = 'facebook'
): NormalizedSocialLead {
  const fields = (raw.field_data as Array<{ name: string; values: string[] }>) ?? []
  const fullName = readFieldValue(fields, 'name') || readFieldValue(fields, 'full_name')
  const { firstName, lastName } = splitName(fullName)

  return {
    platform,
    externalLeadId: String(raw.id ?? ''),
    firstName: firstName || readFieldValue(fields, 'first_name'),
    lastName: lastName || readFieldValue(fields, 'last_name'),
    fullName: fullName || undefined,
    email: readFieldValue(fields, 'email') || undefined,
    phone: readFieldValue(fields, 'phone') || readFieldValue(fields, 'phone_number') || undefined,
    city: readFieldValue(fields, 'city') || undefined,
    state: readFieldValue(fields, 'state') || undefined,
    county: readFieldValue(fields, 'county') || undefined,
    productInterest: readFieldValue(fields, 'product') || readFieldValue(fields, 'interest') || undefined,
    formId: String(raw.form_id ?? ''),
    adId: String(raw.ad_id ?? ''),
    campaignId: String(raw.campaign_id ?? ''),
    raw: raw as Record<string, unknown>,
  }
}
