export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { AiRunType } from '@prisma/client'
import { computeLeadScore } from '@/lib/ai/lead-score'
import { applyAiRateLimit, completeAiRun, createAiRun, createSystemAiEvent, failAiRun, requireAdminSession } from '@/lib/ai/shared'

const BodySchema = z.object({
  contactId: z.string().uuid().optional().nullable(),
  inquiryId: z.string().uuid().optional().nullable(),
})

export async function POST(req: NextRequest) {
  const limited = await applyAiRateLimit(req)
  if (limited) return limited
  const cronSecret = process.env.CRON_SECRET
  const isCron = cronSecret && req.headers.get("x-cron-secret") === cronSecret
  if (!isCron) {
    const auth = await requireAdminSession()
    if (!auth.ok) return auth.response
  }

  const body = await req.json().catch(() => null)
  const parsed = BodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.flatten() }, { status: 422 })
  }

  let aiRunId: string | undefined
  try {
    const aiRun = await createAiRun({ type: AiRunType.lead_score, contactId: parsed.data.contactId ?? undefined, inquiryId: parsed.data.inquiryId ?? undefined, input: parsed.data, model: 'rules-engine' })
    aiRunId = aiRun.id
    const result = await computeLeadScore(parsed.data)
    await completeAiRun({ aiRunId, output: result as unknown as Record<string, unknown>, model: 'rules-engine' })
    await createSystemAiEvent({ type: 'ai.lead_score.completed', contactId: result.contactId, inquiryId: result.inquiryId, payload: result as unknown as Record<string, unknown> })
    return NextResponse.json({ ok: true, ...result })
  } catch (error) {
    return failAiRun({ aiRunId, error })
  }
}
