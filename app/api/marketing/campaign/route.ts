export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createOpenAIJsonCompletion } from '@/lib/ai/client'
import { rateLimit } from '@/lib/rate-limit'
import { logger } from '@/lib/logger'

const BodySchema = z.object({
  prompt: z.string().min(5).max(2000),
  channels: z.array(z.enum(['email', 'sms', 'facebook', 'instagram', 'linkedin'])).min(1),
  tone: z.enum(['professional', 'warm', 'urgent', 'educational', 'community']).default('warm'),
  audience: z.string().max(200).default('families and homeowners'),
  includeVisualBrief: z.boolean().default(true),
})

const CAMPAIGN_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['email', 'sms', 'facebook', 'instagram', 'linkedin', 'visualBrief', 'scheduleSuggestion'],
  properties: {
    email: {
      type: 'object',
      additionalProperties: false,
      required: ['subjectLines', 'preheader', 'bodyHtml', 'cta'],
      properties: {
        subjectLines: { type: 'array', items: { type: 'string' }, minItems: 3, maxItems: 3, description: '3 A/B test subject line options' },
        preheader: { type: 'string' },
        bodyHtml: { type: 'string', description: 'Full email body in plain text with markdown-style formatting' },
        cta: { type: 'string' },
      },
    },
    sms: {
      type: 'object',
      additionalProperties: false,
      required: ['message', 'followUp'],
      properties: {
        message: { type: 'string', maxLength: 160, description: 'Primary SMS (≤160 chars)' },
        followUp: { type: 'string', maxLength: 160, description: '24h follow-up SMS if no reply' },
      },
    },
    facebook: {
      type: 'object',
      additionalProperties: false,
      required: ['caption', 'hashtags', 'postType'],
      properties: {
        caption: { type: 'string' },
        hashtags: { type: 'array', items: { type: 'string' } },
        postType: { type: 'string', enum: ['feed', 'story', 'reel'] },
      },
    },
    instagram: {
      type: 'object',
      additionalProperties: false,
      required: ['caption', 'hashtags', 'postType'],
      properties: {
        caption: { type: 'string' },
        hashtags: { type: 'array', items: { type: 'string' } },
        postType: { type: 'string', enum: ['feed', 'story', 'reel', 'carousel'] },
      },
    },
    linkedin: {
      type: 'object',
      additionalProperties: false,
      required: ['post', 'articleHook'],
      properties: {
        post: { type: 'string' },
        articleHook: { type: 'string', description: 'Opening hook for a long-form article version' },
      },
    },
    visualBrief: {
      type: 'object',
      additionalProperties: false,
      required: ['canvaSpec', 'colorNotes', 'imagePrompt'],
      properties: {
        canvaSpec: { type: 'string', description: 'Canva design brief: dimensions, layout, text placement' },
        colorNotes: { type: 'string', description: 'Brand color usage instructions for this asset' },
        imagePrompt: { type: 'string', description: 'AI image generation prompt for the background or hero image' },
      },
    },
    scheduleSuggestion: {
      type: 'object',
      additionalProperties: false,
      required: ['email', 'sms', 'social', 'reasoning'],
      properties: {
        email: { type: 'string', description: 'Best send day and time for email' },
        sms: { type: 'string' },
        social: { type: 'string' },
        reasoning: { type: 'string', description: 'Why these times maximize engagement for the target audience' },
      },
    },
  },
} as const

export async function POST(req: NextRequest) {
  const limited = await rateLimit(req, 'reports')
  if (limited) return limited

  const body = await req.json().catch(() => null)
  const parsed = BodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.flatten() }, { status: 422 })
  }

  const { prompt, channels, tone, audience, includeVisualBrief } = parsed.data

  const system = `You are a professional multi-channel marketing copywriter for Latimore Life & Legacy LLC, an insurance and financial services agency.

Brand voice: ${tone === 'professional' ? 'Professional and authoritative' : tone === 'warm' ? 'Warm, community-focused, personal' : tone === 'urgent' ? 'Urgent but never fear-based' : tone === 'educational' ? 'Educational, simple, clear' : 'Local community authority'}.

Core tagline: "Protecting Today. Securing Tomorrow." | Hashtag: #TheBeatGoesOn
Primary CTA: Scan the QR code OR DM "PROTECT"
Phone: (717) 615-2613 | NIPR #21638507
Target audience: ${audience}
Products: Life insurance, final expense, mortgage protection, IUL, annuities (F&G Safe Income Advantage)

Rules:
- Never use fear-based language
- Always tie messaging to community, family, and legacy
- Include compliance-safe language (avoid guarantees on returns)
- Keep SMS under 160 characters
- Generate content for ALL channels even if some will be filtered by the caller
- Always include #TheBeatGoesOn in social posts`

  const user = `Generate a complete multi-channel marketing campaign based on this prompt:

"${prompt}"

Active channels: ${channels.join(', ')}
Tone: ${tone}
Audience: ${audience}
Include visual brief: ${includeVisualBrief}

Return all channel content, visual brief, and schedule recommendation.`

  try {
    const result = await createOpenAIJsonCompletion<typeof CAMPAIGN_SCHEMA>({
      system,
      user,
      schemaName: 'marketingCampaign',
      schema: CAMPAIGN_SCHEMA as unknown as Record<string, unknown>,
      temperature: 0.75,
    })

    // Filter to only requested channels
    const output = result.output as Record<string, unknown>
    const filtered: Record<string, unknown> = { scheduleSuggestion: output.scheduleSuggestion }
    if (includeVisualBrief) filtered.visualBrief = output.visualBrief
    for (const ch of channels) {
      filtered[ch] = output[ch]
    }

    logger.info({ channels, tone, audience }, '[campaign] generated')
    return NextResponse.json({ ok: true, campaign: filtered, model: result.model })
  } catch (err) {
    logger.error({ err }, '[campaign] generation failed')
    return NextResponse.json({ ok: false, error: 'Campaign generation failed. Check AI provider keys.' }, { status: 500 })
  }
}
