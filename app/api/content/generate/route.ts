export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { ContentStatus, ContentType, ProductInterest } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { createOpenAIJsonCompletion } from '@/lib/ai/client'
import { applyAiRateLimit, createSystemAiEvent, requireAdminSession } from '@/lib/ai/shared'

const BodySchema = z.object({
  type: z.nativeEnum(ContentType),
  prompt: z.string().min(5).max(4000),
  campaign: z.string().max(255).optional().nullable(),
  audience: z.string().max(255).optional().nullable(),
  channel: z.string().max(100).optional().nullable(),
  productInterest: z.nativeEnum(ProductInterest).optional().nullable(),
  titleHint: z.string().max(255).optional().nullable(),
})

const responseSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    title: { type: 'string' },
    bodyText: { type: 'string' },
    bodyHtml: { type: ['string', 'null'] },
    suggestedChannel: { type: ['string', 'null'] },
  },
  required: ['title', 'bodyText', 'bodyHtml', 'suggestedChannel'],
}

export async function POST(req: NextRequest) {
  const limited = await applyAiRateLimit(req)
  if (limited) return limited
  const auth = await requireAdminSession()
  if (!auth.ok) return auth.response

  const body = await req.json().catch(() => null)
  const parsed = BodySchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ ok: false, error: parsed.error.flatten() }, { status: 422 })

  try {
    const input = parsed.data
    const completion = await createOpenAIJsonCompletion<any>({
      system: 'You are the Legacy AI marketing assistant for an insurance and legacy planning business. Create helpful business content using only the request provided. Do not invent prices, guarantees, or testimonials.',
      user: JSON.stringify({ task: 'Generate a content asset draft', request: input }),
      schemaName: 'content_asset_generation',
      schema: responseSchema,
      temperature: 0.5,
    })

    const asset = await prisma.contentAsset.create({
      data: {
        title: completion.output.title || input.titleHint || 'Untitled Draft',
        type: input.type,
        status: ContentStatus.draft,
        channel: input.channel ?? completion.output.suggestedChannel ?? undefined,
        audience: input.audience ?? undefined,
        campaign: input.campaign ?? undefined,
        productInterest: input.productInterest ?? undefined,
        prompt: input.prompt,
        bodyText: completion.output.bodyText,
        bodyHtml: completion.output.bodyHtml ?? undefined,
        metadata: { model: completion.model, usage: completion.usage ?? null },
      },
    })

    await createSystemAiEvent({ type: 'content.generated', payload: { contentAssetId: asset.id, type: asset.type, campaign: asset.campaign, productInterest: asset.productInterest } })
    return NextResponse.json({ ok: true, asset })
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : 'Content generation failed' }, { status: 500 })
  }
}
