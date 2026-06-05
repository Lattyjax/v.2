export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { AiRunType } from '@prisma/client'
import { createOpenAIJsonCompletion } from '@/lib/ai/client'
import { getContactAiContext } from '@/lib/ai/contact-context'
import { applyAiRateLimit, completeAiRun, createAiRun, createSystemAiEvent, failAiRun, requireAdminSession } from '@/lib/ai/shared'

const BodySchema = z.object({
  contactId: z.string().uuid().optional().nullable(),
  inquiryId: z.string().uuid().optional().nullable(),
})

const schema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    summary: { type: 'string' },
    relationshipStatus: { type: 'string' },
    topPriorities: { type: 'array', items: { type: 'string' } },
    risks: { type: 'array', items: { type: 'string' } },
    recommendedNextActions: { type: 'array', items: { type: 'string' } },
    draftTalkingPoints: { type: 'array', items: { type: 'string' } },
  },
  required: ['summary', 'relationshipStatus', 'topPriorities', 'risks', 'recommendedNextActions', 'draftTalkingPoints'],
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
    const aiRun = await createAiRun({ type: AiRunType.contact_brief, contactId: context.contact.id, inquiryId: context.inquiry?.id ?? undefined, input: { request: parsed.data, context } })
    aiRunId = aiRun.id
    const completion = await createOpenAIJsonCompletion<any>({
      system: 'You are the Legacy AI Advisor for an insurance CRM. Generate a concise, practical contact brief grounded only in the provided CRM data.',
      user: JSON.stringify({ task: 'Generate a contact brief', context }),
      schemaName: 'contact_brief',
      schema,
      temperature: 0.15,
    })
    const output = { contactId: context.contact.id, inquiryId: context.inquiry?.id ?? null, brief: completion.output }
    await completeAiRun({ aiRunId, output: output as Record<string, unknown>, model: completion.model, tokensInput: completion.usage?.input_tokens, tokensOutput: completion.usage?.output_tokens })
    await createSystemAiEvent({ type: 'ai.contact_brief.completed', contactId: context.contact.id, inquiryId: context.inquiry?.id ?? undefined, payload: output as Record<string, unknown> })
    return NextResponse.json({ ok: true, ...output })
  } catch (error) {
    return failAiRun({ aiRunId, error })
  }
}
