import { upsertLead } from '@/lib/hub/upsert-lead'
import { ingestEvent } from '@/lib/hub/ingest-event'
import type { NormalizedSocialLead } from './types'

export async function upsertSocialLead(lead: NormalizedSocialLead): Promise<{ contactId: string; inquiryId: string }> {
  const result = await upsertLead({
    firstName: lead.firstName,
    lastName: lead.lastName,
    email: lead.email,
    phone: lead.phone,
    county: lead.county,
    productInterest: lead.productInterest,
    source: lead.platform,
    medium: 'social',
    campaign: lead.campaignId,
    metadata: {
      platform: lead.platform,
      externalLeadId: lead.externalLeadId,
      formId: lead.formId,
      adId: lead.adId,
      rawFields: lead.raw,
    },
  })

  await ingestEvent({
    eventType: 'lead_created',
    contactId: result.contact.id,
    leadSessionId: null,
    metadata: {
      platform: lead.platform,
      externalLeadId: lead.externalLeadId,
      formId: lead.formId,
      adId: lead.adId,
    },
  })

  return {
    contactId: result.contact.id,
    inquiryId: result.inquiry?.id ?? '',
  }
}
