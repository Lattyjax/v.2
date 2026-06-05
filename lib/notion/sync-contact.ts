import type { Contact, Inquiry } from '@prisma/client'
import { getNotionClient } from './client'
import { mapLeadSource, mapPipelineStage, mapProductInterest } from './mappers'

// Property bag accepted by both pages.create and pages.update
type Props = Record<string, unknown>

function buildProperties(contact: Contact, inquiry: Inquiry | null): Props {
  const displayName =
    [contact.firstName, contact.lastName].filter(Boolean).join(' ') ||
    contact.email ||
    contact.phone ||
    'Unknown'

  const props: Props = {
    Name: { title: [{ text: { content: displayName } }] },
    Status: { status: { name: inquiry ? mapPipelineStage(inquiry.stage) : 'Lead' } },
  }

  if (contact.email) props['Email Address'] = { email: contact.email }
  if (contact.phone) props['Phone Number'] = { phone_number: contact.phone }

  const leadSource = mapLeadSource(contact.primarySourceType)
  if (leadSource) props['Lead Source'] = { select: { name: leadSource } }

  const primaryNeed = inquiry ? mapProductInterest(inquiry.productInterest) : null
  if (primaryNeed) props['Primary Need'] = { select: { name: primaryNeed } }

  if (contact.county) {
    props['Notes'] = { rich_text: [{ text: { content: `County: ${contact.county}` } }] }
  }

  if (contact.nextFollowUpAt) {
    props['Next Follow-up'] = {
      date: { start: contact.nextFollowUpAt.toISOString().split('T')[0] },
    }
  }

  return props
}

export async function syncContactToNotion(
  contact: Contact,
  inquiry: Inquiry | null = null,
): Promise<void> {
  const notion = getNotionClient()
  const dbId = process.env.NOTION_CONTACT_DB_ID
  if (!notion || !dbId) return

  const properties = buildProperties(contact, inquiry)

  // Look up existing page by email using the v5 dataSources.query API
  let existingPageId: string | null = null
  if (contact.email) {
    const { results } = await notion.dataSources.query({
      data_source_id: dbId,
      filter: { property: 'Email Address', email: { equals: contact.email } },
      page_size: 1,
    })
    if (results.length > 0) existingPageId = results[0].id
  }

  if (existingPageId) {
    await notion.pages.update({ page_id: existingPageId, properties } as never)
  } else {
    await notion.pages.create({
      parent: { data_source_id: dbId, type: 'data_source_id' },
      properties,
    } as never)
  }
}
