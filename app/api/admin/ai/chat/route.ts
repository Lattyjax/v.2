/**
 * POST /api/admin/ai/chat
 * Centralized inference endpoint for the Legacy Co-Pilot chatbot.
 * Supports: chat, strategy, and trends modes.
 * All Gemini/OpenAI calls happen server-side only — no key exposure.
 */

import { createOpenAIJsonCompletion } from '@/lib/ai/client'
import { requireAdminSession } from '@/lib/ai/shared'

const SYSTEM_PROMPT = `You are the Latimore Legacy Business Co-Pilot — a specialized AI assistant for Jackson M. Latimore Sr., Founder and CEO of Latimore Life & Legacy LLC, an independent insurance brokerage based in Schuylkill County, Pennsylvania.

CANONICAL CONTEXT:
- Brand: Latimore Life & Legacy LLC
- Founder: Jackson M. Latimore Sr. (survived sudden cardiac arrest on December 7, 2010, at East Stroudsburg University — saved by an AED through the Gregory W. Moyer Defibrillator Fund)
- Mission: Help families and organizations protect what matters and build legacies that outlive them — using clear education and preparation, never fear-based messaging.
- Tagline: "Protecting Today. Securing Tomorrow."
- Hashtag: #TheBeatGoesOn
- Region: Schuylkill, Luzerne, and Northumberland Counties, Pennsylvania
- Carriers: North American, F&G, American Equity, Corebridge Financial, Ethos Life, Foresters Financial
- Affiliation: Global Financial Impact (GFI)
- PA DOI License: #1268820 | NIPR: #21638507

STRATEGIC FRAMEWORK — Dual-Engine:
- Velocity Engine: Ethos Life (fast term, 10-min app, no exam for many)
- Depth Engine: IUL / FIA (tax-advantaged growth, living benefits, legacy planning)

PIPELINE STAGES (10-stage):
New Lead → Contacted → Booked Call → Discovery Complete → Options Presented → App Submitted → Underwriting → Issued/Delivered → In Force + Review → Lost/Not Proceeding

THREE RULES OF MONEY:
1. Rule of 72 (doubling time at compound interest)
2. Growing money tax-advantaged (IUL, Roth, FIA)
3. Tax Buckets (taxable, tax-deferred, tax-free)

BRAND VOICE RULES (non-negotiable):
- Education-first, NEVER fear-based
- No morbid language — emphasize preparation, love for family, legacy
- Plain language (8th-grade reading level)
- Community-rooted (Central PA, Coal Region)
- Always include tagline and #TheBeatGoesOn when generating content
- Founder story: always handle with dignity, focus on preparedness as legacy

YOUR ROLE:
- Help Jackson manage his pipeline and client relationships
- Generate compliant, brand-locked social content
- Suggest next steps in sales conversations
- Explain insurance products (IUL, FIA, Term, Final Expense) educationally
- Support school district and community outreach strategy`

const STRATEGY_SCHEMA = {
  type: 'object' as const,
  properties: {
    ideas: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          reasoning: { type: 'string' },
        },
        required: ['title', 'reasoning'],
        additionalProperties: false,
      },
    },
    captions: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          platform: { type: 'string' },
          text: { type: 'string' },
        },
        required: ['platform', 'text'],
        additionalProperties: false,
      },
    },
    hashtags: {
      type: 'array',
      items: { type: 'string' },
    },
  },
  required: ['ideas', 'captions', 'hashtags'],
  additionalProperties: false,
}

const TRENDS_SCHEMA = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      theme: { type: 'string' },
      description: { type: 'string' },
      trendReason: { type: 'string' },
    },
    required: ['theme', 'description', 'trendReason'],
    additionalProperties: false,
  },
}

export async function POST(req: Request) {
  const auth = await requireAdminSession()
  if (!auth.ok) return auth.response

  try {
    const body = await req.json()
    const { message, mode = 'chat', history = [] } = body

    if (!message?.trim()) {
      return Response.json({ error: 'message is required' }, { status: 400 })
    }

    // Build conversation context from history (last 6 turns max to control tokens)
    const recentHistory = history.slice(-6)
    const contextBlock = recentHistory.length > 0
      ? '\n\nPrior conversation context:\n' + recentHistory
          .map((m: { role: string; text: string }) => `${m.role === 'user' ? 'Jackson' : 'Co-Pilot'}: ${m.text}`)
          .join('\n')
      : ''

    if (mode === 'strategy') {
      const result = await createOpenAIJsonCompletion<typeof STRATEGY_SCHEMA>({
        system: SYSTEM_PROMPT,
        user: `${contextBlock}\n\nJackson needs a social media strategy for: "${message}"\n\nGenerate:\n1. 3 high-impact post ideas with reasoning\n2. 3 draft captions (one each for LinkedIn, Facebook, Instagram)\n3. 8-12 recommended hashtags (mix of PA-regional, insurance-industry, and brand tags)\n\nAll content must be education-first, brand-locked, include #TheBeatGoesOn.`,
        schemaName: 'SocialStrategy',
        schema: STRATEGY_SCHEMA,
        temperature: 0.75,
      })
      return Response.json({ mode: 'strategy', data: result.output })
    }

    if (mode === 'trends') {
      const result = await createOpenAIJsonCompletion<typeof TRENDS_SCHEMA>({
        system: SYSTEM_PROMPT,
        user: `Identify 3 trending themes in life insurance, mortgage protection, and financial planning relevant to Schuylkill, Luzerne, and Northumberland Counties, PA as of May 2026. For each, explain why it is trending and how Jackson should address it in his content strategy.`,
        schemaName: 'TrendAnalysis',
        schema: TRENDS_SCHEMA,
        temperature: 0.6,
      })
      return Response.json({ mode: 'trends', data: result.output })
    }

    // Standard chat mode — returns plain text
    const CHAT_SCHEMA = {
      type: 'object' as const,
      properties: {
        response: { type: 'string' },
      },
      required: ['response'],
      additionalProperties: false,
    }

    const result = await createOpenAIJsonCompletion<{ response: string }>({
      system: SYSTEM_PROMPT,
      user: `${contextBlock}\n\nJackson says: "${message}"\n\nRespond as his dedicated Legacy Co-Pilot. Be direct, actionable, and brand-locked. Use first-person voice. Keep under 200 words unless a script or detailed breakdown is needed.`,
      schemaName: 'ChatResponse',
      schema: CHAT_SCHEMA,
      temperature: 0.7,
    })

    return Response.json({ mode: 'chat', data: result.output.response })
  } catch (error) {
    console.error('[/api/admin/ai/chat] Error:', error)
    return Response.json(
      { error: error instanceof Error ? error.message : 'Chat inference failed' },
      { status: 500 }
    )
  }
}
