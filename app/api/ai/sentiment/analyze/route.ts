import { NextRequest, NextResponse } from 'next/server'
import { requireAdminSession } from '@/lib/ai/shared'
import { rateLimit } from '@/lib/rate-limit'
import { analyzeSentimentWithRouter } from '@/lib/ai/cheap-model-router'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const limited = await rateLimit(req, 'inquiries')
  if (limited) return limited

  const auth = await requireAdminSession()
  if (!auth.ok) return auth.response

  let body: { text?: string; commentId?: string; escalate?: boolean }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 })
  }

  const text = typeof body.text === 'string' ? body.text.trim() : ''
  if (!text) return NextResponse.json({ error: 'text required' }, { status: 400 })

  const started = Date.now()
  const response = await analyzeSentimentWithRouter(text, {
    escalationAllowed: body.escalate ?? true,
  })

  if (body.commentId) {
    try {
      await prisma.aIAnalysis.create({
        data: {
          targetType: 'comment',
          targetId: body.commentId,
          commentId: body.commentId,
          provider: response.provider,
          model: response.model,
          sentiment: response.result.sentiment,
          confidence: response.result.confidence,
          intent: response.result.intent,
          urgency: response.result.urgency,
          topics: response.result.topics,
          trendingTerms: response.result.trending_terms,
          leadPotential: response.result.lead_potential,
          complianceRisk: response.result.compliance_risk,
          suggestedAction: response.result.recommended_action,
          latencyMs: Date.now() - started,
          raw: response.rawText as unknown as object,
        },
      })
    } catch {
      // persist failure is non-fatal
    }
  }

  return NextResponse.json({
    ok: true,
    provider: response.provider,
    model: response.model,
    latencyMs: response.latencyMs,
    result: response.result,
  })
}
