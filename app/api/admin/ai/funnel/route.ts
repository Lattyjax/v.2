/**
 * POST /api/admin/ai/funnel
 * Generate a 3-stage Legacy Funnel strategy.
 * Replaces client-side generateFunnelStrategy() from geminiService.ts
 */

import { createOpenAIJsonCompletion } from '@/lib/ai/client'
import { requireAdminSession } from '@/lib/ai/shared'

const FUNNEL_SCHEMA = {
  type: 'array' as const,
  items: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description: 'Stage name: Awareness, Engagement, or Trust',
      },
      strategy: {
        type: 'string',
        description: 'Strategic logic and channel approach for this stage',
      },
      assetCopy: {
        type: 'string',
        description: 'Headline and body copy for the actual asset at this stage',
      },
    },
    required: ['name', 'strategy', 'assetCopy'],
    additionalProperties: false,
  },
}

export async function POST(req: Request) {
  const auth = await requireAdminSession()
  if (!auth.ok) return auth.response
  try {
    const body = await req.json()
    const { goal, persona } = body

    if (!goal?.trim()) {
      return Response.json({ error: 'goal is required' }, { status: 400 })
    }

    const targetPersona = persona?.trim() || 'Young Families'

    const result = await createOpenAIJsonCompletion<unknown[]>({
      system: `You are a legacy marketing strategist for Latimore Life & Legacy LLC — an independent insurance brokerage in Schuylkill, Luzerne, and Northumberland Counties, PA. 
      
Brand rules: Education-first (no fear), plain language (8th-grade), community-rooted (Central PA Coal Region), tagline "Protecting Today. Securing Tomorrow.", hashtag #TheBeatGoesOn.`,
      user: `Architect a 3-stage high-conversion "Legacy Funnel" with:

Goal: ${goal}
Target Persona: ${targetPersona}
Region: Schuylkill, Luzerne, and Northumberland Counties, Pennsylvania

STAGES (produce exactly 3):

1. AWARENESS (Social Hook)
   - Platform: Facebook or Instagram
   - Goal: Stop the scroll, educate broadly
   - No fear — curiosity and community focus

2. ENGAGEMENT (Lead Magnet)  
   - Offer a specific valuable asset (checklist, PDF guide, calculator, mini-course)
   - Clear exchange: their contact info for real value
   - Low commitment ask

3. TRUST (Nurture Email)
   - Deep-dive educational message
   - Reference Jackson's story where appropriate (dignity, preparedness, not fear)
   - Build trust before any sales ask
   - Warm, personal, community-rooted tone

All copy must be education-first, reference Central PA where relevant, and avoid morbid language.`,
      schemaName: 'LegacyFunnel',
      schema: FUNNEL_SCHEMA,
      temperature: 0.75,
    })

    return Response.json({
      success: true,
      goal,
      persona: targetPersona,
      stages: result.output,
    })
  } catch (error) {
    console.error('[/api/admin/ai/funnel] Error:', error)
    return Response.json(
      { error: error instanceof Error ? error.message : 'Funnel generation failed' },
      { status: 500 }
    )
  }
}
