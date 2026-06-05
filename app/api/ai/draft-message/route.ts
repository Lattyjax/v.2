export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { ThreadChannel, AiRunType } from '@prisma/client'
import { createOpenAIJsonCompletion } from '@/lib/ai/client'
import { getContactAiContext } from '@/lib/ai/contact-context'
import { applyAiRateLimit, completeAiRun, createAiRun, createSystemAiEvent, failAiRun, requireAdminSession } from '@/lib/ai/shared'

const BodySchema = z.object({
  contactId: z.string().uuid().optional().nullable(),
  inquiryId: z.string().uuid().optional().nullable(),
  channel: z.nativeEnum(ThreadChannel),
  goal: z.string().min(3).max(500),
  tone: z.enum(['warm', 'professional', 'urgent', 'friendly']).default('professional'),
})

const schema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    subject: { type: ['string', 'null'] },
    message: { type: 'string' },
    rationale: { type: 'string' },
    suggestedFollowUpDays: { type: 'integer' },
  },
  required: ['subject', 'message', 'rationale', 'suggestedFollowUpDays'],
}

export async function POST(req: NextRequest) {
  const limited = await applyAiRateLimit(req)
  if (limited) return limited
  const auth = await requireAdminSession()
  if (!auth.ok) return auth.response

  const body = await req.json().catch(() => null)
  const parsed = BodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.flatten() }, { status: 422 })
  }

  let aiRunId: string | undefined
  try {
    const context = await getContactAiContext(parsed.data)
    const aiRun = await createAiRun({ type: AiRunType.draft_message, contactId: context.contact.id, inquiryId: context.inquiry?.id ?? undefined, input: { request: parsed.data, context } })
    aiRunId = aiRun.id
    const completion = await createOpenAIJsonCompletion<any>({
      system: 'Draft concise advisor outreach grounded only in the provided CRM history. For SMS keep it compact. For email include a clear subject.',
      user: JSON.stringify({ task: 'Draft a follow-up message', request: parsed.data, context }),
      schemaName: 'draft_message',
      schema,
      temperature: 0.35,
    })
    const output = { contactId: context.contact.id, inquiryId: context.inquiry?.id ?? null, channel: parsed.data.channel, draft: completion.output }
    await completeAiRun({ aiRunId, output: output as Record<string, unknown>, model: completion.model, tokensInput: completion.usage?.input_tokens, tokensOutput: completion.usage?.output_tokens })
    await createSystemAiEvent({ type: 'ai.draft_message.completed', contactId: context.contact.id, inquiryId: context.inquiry?.id ?? undefined, payload: output as Record<string, unknown> })
    return NextResponse.json({ ok: true, ...output })
  } catch (error) {
    return failAiRun({ aiRunId, error })
  }
}
