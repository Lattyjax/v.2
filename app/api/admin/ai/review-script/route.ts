/**
 * POST /api/admin/ai/review-script
 * Generate a Legacy Review Script for an annual client review call.
 * Replaces client-side generateReviewScript() from geminiService.ts
 */

import { createOpenAIJsonCompletion } from '@/lib/ai/client'
import { requireAdminSession } from '@/lib/ai/shared'

const SCRIPT_SCHEMA = {
  type: 'object' as const,
  properties: {
    opening: {
      type: 'string',
      description: 'Warm opening that references community connection and gratitude',
    },
    discoveryQuestions: {
      type: 'array',
      items: { type: 'string' },
      description: 'Life-change discovery questions to ask the client',
    },
    strategicPivot: {
      type: 'string',
      description: 'The next logical product or coverage recommendation with reasoning',
    },
    closing: {
      type: 'string',
      description: 'Closing statement that reinforces the relationship and includes the brand tagline',
    },
  },
  required: ['opening', 'discoveryQuestions', 'strategicPivot', 'closing'],
  additionalProperties: false,
}

export async function POST(req: Request) {
  const auth = await requireAdminSession()
  if (!auth.ok) return auth.response

  try {
    const body = await req.json()
    const { clientData } = body

    if (!clientData?.name) {
      return Response.json({ error: 'clientData with name is required' }, { status: 400 })
    }

    const result = await createOpenAIJsonCompletion<typeof SCRIPT_SCHEMA>({
      system: `You are the Latimore Legacy Strategic Review Engine. Jackson M. Latimore Sr. is preparing for an annual review call with a client in ${clientData.county || 'Schuylkill'} County, Pennsylvania.

Brand voice: warm, community-rooted, education-first. Never fear-based. Reference the Central PA Coal Region community where appropriate. Always close with dignity and the tagline "Protecting Today. Securing Tomorrow."

Carrier context: Jackson is appointed with North American, F&G, American Equity, Corebridge Financial, Ethos Life, and Foresters Financial.`,
      user: `Generate a Legacy Review Script for this client:
- Name: ${clientData.name}
- County: ${clientData.county || 'Schuylkill'}
- Household: ${clientData.household || 'Not specified'}
- Current Product Interest: ${clientData.productInterest || 'Life Insurance'}
- Monthly Premium: ${clientData.monthlyPremium ? `$${clientData.monthlyPremium}` : 'Unknown'}
- Notes: ${clientData.notes || 'No notes on file'}

Script requirements:
1. OPENING: Warm, personal, reference the community (Central PA). Thank them for their trust.
2. DISCOVERY QUESTIONS (5-7): Ask about life changes — new children, grandchildren, mortgage status, job changes, retirement timeline, business changes. These should feel conversational, not scripted.
3. STRATEGIC PIVOT: Based on their current product, suggest the next logical step:
   - Has Term → discuss IUL for living benefits and cash value
   - Has IUL → discuss FIA or annuity for retirement income layer
   - Has FIA → discuss final expense for parents or children
   - No product → start with Velocity (Ethos term) for quick protection
4. CLOSING: Reinforce the relationship, reference the mission, end with "Protecting Today. Securing Tomorrow."`,
      schemaName: 'ReviewScript',
      schema: SCRIPT_SCHEMA,
      temperature: 0.7,
    })

    return Response.json({
      success: true,
      clientName: clientData.name,
      script: result.output,
    })
  } catch (error) {
    console.error('[/api/admin/ai/review-script] Error:', error)
    return Response.json(
      { error: error instanceof Error ? error.message : 'Review script generation failed' },
      { status: 500 }
    )
  }
}
