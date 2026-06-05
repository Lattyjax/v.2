import nodeCrypto from 'crypto'
import { NormalizedSocialLead, splitName } from './types'

export function verifyLinkedInBridgeToken(authHeader: string | null): boolean {
  const token = process.env.LINKEDIN_INGEST_TOKEN
  if (!token) return false
  if (!authHeader) return false
  const provided = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader
  try {
    return nodeCrypto.timingSafeEqual(Buffer.from(provided), Buffer.from(token))
  } catch {
    return provided === token
  }
}

export function normalizeLinkedInLead(raw: Record<string, unknown>): NormalizedSocialLead {
  const fullName = String(raw.fullName ?? raw.name ?? '')
  const { firstName, lastName } = splitName(fullName)

  return {
    platform: 'linkedin',
    externalLeadId: String(raw.id ?? raw.leadId ?? ''),
    firstName: String(raw.firstName ?? firstName ?? ''),
    lastName: String(raw.lastName ?? lastName ?? ''),
    fullName: fullName || undefined,
    email: raw.email ? String(raw.email) : undefined,
    phone: raw.phone ? String(raw.phone) : undefined,
    city: raw.city ? String(raw.city) : undefined,
    state: raw.state ? String(raw.state) : undefined,
    county: raw.county ? String(raw.county) : undefined,
    productInterest: raw.productInterest ? String(raw.productInterest) : undefined,
    formId: raw.formId ? String(raw.formId) : undefined,
    adId: raw.adId ? String(raw.adId) : undefined,
    campaignId: raw.campaignId ? String(raw.campaignId) : undefined,
    raw: raw,
  }
}
