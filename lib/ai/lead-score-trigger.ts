import { computeEnhancedLeadScore } from '@/lib/ai/lead-score-enhanced'
import { logger } from '@/lib/logger'

/**
 * Triggers automatic lead scoring when relevant events occur
 * This keeps the autopilot system running in real-time
 */
export async function triggerLeadScoring(input: {
  contactId?: string
  inquiryId?: string
  reason?: string
}) {
  try {
    // Run scoring asynchronously to avoid blocking the main request
    setImmediate(async () => {
      try {
        await computeEnhancedLeadScore({
          contactId: input.contactId,
          inquiryId: input.inquiryId
        })

        logger.info({ contactId: input.contactId, inquiryId: input.inquiryId, reason: input.reason || 'unknown' }, 'Lead scoring triggered')
      } catch (error) {
        logger.error({ error }, 'Auto lead scoring failed')
      }
    })
  } catch (error) {
    // Don't let scoring failures break the main flow
    logger.error({ error }, 'Failed to trigger lead scoring')
  }
}

/**
 * Batch scoring for multiple contacts (useful for bulk operations)
 */
export async function batchScoreLeads(contactIds: string[], reason?: string) {
  const promises = contactIds.map(contactId =>
    triggerLeadScoring({ contactId, reason })
  )

  await Promise.allSettled(promises)
}