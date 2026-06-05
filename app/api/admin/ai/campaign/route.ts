/**
 * POST /api/admin/ai/campaign
 * Generate a 4-post strategic Legacy Campaign sequence.
 * Replaces client-side generateBulkCampaign() from geminiService.ts
 */

import { createOpenAIJsonCompletion } from '@/lib/ai/client'
import { requireAdminSession } from '@/lib/ai/shared'

const CAMPAIGN_SCHEMA = {
  type: 'array' as const,
  items: {
    type: 'object',
    properties: {
      title: { type: 'string' },
      draft: { type: 'string' },
      platform: { type: 'string' },
      sequenceDay: {
        type: 'number',
        description: 'Day in the posting sequence (1, 7, 14, 21)',
      },
    },
    required: ['title', 'draft', 'platform', 'sequenceDay'],
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

    const targetPersona = persona?.trim() || 'Young Families in Central PA'

    const result = await createOpenAIJsonCompletion<unknown[]>({
      system: `You are the Legacy Campaign Architect for Latimore Life & Legacy LLC.

Brand rules (non-negotiable):
- Education-first, NEVER fear-based
- No morbid language — focus on legacy, preparation, family love
- Include tagline "Protecting Today. Securing Tomorrow." in at least one post
- Include #TheBeatGoesOn in all posts
- Central PA community framing (Schuylkill, Luzerne, Northumberland Counties)
- Plain language (8th-grade reading level)`,
      user: `Architect a 4-post strategic "Legacy Campaign" sequence.

Goal: ${goal}
Target Persona: ${targetPersona}
Region: Schuylkill, Luzerne, and Northumberland Counties, Pennsylvania

Post sequence (produce exactly 4):

POST 1 (Day 1) — Educational Hook: "The Why"
- Open with a thought-provoking question or surprising fact
- Educate broadly about the need — no product push yet
- Platform: Facebook or LinkedIn

POST 2 (Day 7) — Product Solution: "The What"
- Introduce the specific solution (product/carrier/approach)
- Reference at least one specific benefit by name
- Platform: LinkedIn or Facebook

POST 3 (Day 14) — Social Proof / Community Story
- Share a scenario or community story (no real client names — use "a family in Pottsville" style)
- Build trust through relatability
- Platform: Facebook or Instagram

POST 4 (Day 21) — The Legacy Invitation: CTA
- Final call to action — book a call, get a quote, start a conversation
- Warm, not pushy — frame it as an invitation to protect their family
- Include the tagline and #TheBeatGoesOn
- Platform: LinkedIn and Facebook`,
      schemaName: 'LegacyCampaign',
      schema: CAMPAIGN_SCHEMA,
      temperature: 0.8,
    })

    return Response.json({
      success: true,
      goal,
      persona: targetPersona,
      count: result.output.length,
      posts: result.output,
    })
  } catch (error) {
    console.error('[/api/admin/ai/campaign] Error:', error)
    return Response.json(
      { error: error instanceof Error ? error.message : 'Campaign generation failed' },
      { status: 500 }
    )
  }
}
