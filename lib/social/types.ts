export type NormalizedSocialLead = {
  platform: 'facebook' | 'instagram' | 'linkedin'
  externalLeadId: string
  firstName?: string
  lastName?: string
  fullName?: string
  email?: string
  phone?: string
  city?: string
  state?: string
  county?: string
  productInterest?: string
  formId?: string
  adId?: string
  campaignId?: string
  raw: Record<string, unknown>
}

export type MetaWebhookEntry = {
  id: string
  changes: Array<{
    field: string
    value: {
      leadgen_id?: string
      form_id?: string
      page_id?: string
      adgroup_id?: string
      ad_id?: string
      campaign_id?: string
      created_time?: number
    }
  }>
}

export function readFieldValue(fields: Array<{ name: string; values: string[] }>, key: string): string {
  const f = fields.find(f => f.name.toLowerCase().includes(key.toLowerCase()))
  return f?.values?.[0] ?? ''
}

export function splitName(full: string): { firstName: string; lastName: string } {
  const parts = full.trim().split(/\s+/)
  return {
    firstName: parts[0] ?? '',
    lastName: parts.slice(1).join(' '),
  }
}
