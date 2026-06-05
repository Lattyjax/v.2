import { getNotionClient } from './client'
import { reverseMapPipelineStage } from './reverse-mappers'
import { prisma } from '@/lib/prisma'
import { changeInquiryStage } from '@/lib/hub/change-stage'
import { logger } from '@/lib/logger'

export type NotionSyncResult = {
  pageId: string
  email: string | null
  synced: boolean
  changes: string[]
  error?: string
}

// Reads a single Notion Contact page and applies any changed properties back
// to the local database. Currently syncs Status → PipelineStage and
// Next Follow-up date → contact.nextFollowUpAt.
export async function syncNotionPageToApp(pageId: string): Promise<NotionSyncResult> {
  const notion = getNotionClient()
  if (!notion) {
    return { pageId, email: null, synced: false, changes: [], error: 'Notion client not configured' }
  }

  try {
    const page = (await notion.pages.retrieve({ page_id: pageId })) as Record<string, unknown>
    const props = (page.properties ?? {}) as Record<string, unknown>

    const email =
      (props['Email Address'] as { email?: string } | undefined)?.email ?? null
    if (!email) {
      return { pageId, email: null, synced: false, changes: [], error: 'No email on Notion page' }
    }

    const contact = await prisma.contact.findUnique({
      where: { email },
      include: { inquiries: { orderBy: { createdAt: 'desc' }, take: 1 } },
    })
    if (!contact) {
      return { pageId, email, synced: false, changes: [], error: 'Contact not found locally' }
    }

    const inquiry = contact.inquiries[0] ?? null
    const changes: string[] = []

    // Sync Status → PipelineStage
    if (inquiry) {
      const notionStatus = (
        props['Status'] as { status?: { name?: string } } | undefined
      )?.status?.name
      if (notionStatus) {
        const targetStage = reverseMapPipelineStage(notionStatus)
        if (targetStage && targetStage !== inquiry.stage) {
          await changeInquiryStage({ inquiryId: inquiry.id, stage: targetStage, actor: 'notion' })
          changes.push(`stage: ${inquiry.stage} → ${targetStage}`)
        }
      }
    }

    // Sync Next Follow-up → contact.nextFollowUpAt
    const followUpStr = (
      props['Next Follow-up'] as { date?: { start?: string } } | undefined
    )?.date?.start
    if (followUpStr) {
      const followUpDate = new Date(followUpStr)
      const existing = contact.nextFollowUpAt
      const isDifferent =
        !existing || Math.abs(followUpDate.getTime() - existing.getTime()) > 60_000
      if (isDifferent) {
        await prisma.contact.update({
          where: { id: contact.id },
          data: { nextFollowUpAt: followUpDate },
        })
        changes.push(`nextFollowUpAt: ${followUpStr}`)
      }
    }

    return { pageId, email, synced: true, changes }
  } catch (err) {
    logger.error({ err, pageId }, '[notion/sync-from-notion] page sync failed')
    return {
      pageId,
      email: null,
      synced: false,
      changes: [],
      error: err instanceof Error ? err.message : String(err),
    }
  }
}
