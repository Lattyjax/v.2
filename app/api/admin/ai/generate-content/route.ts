/**
 * POST /api/admin/ai/generate-content
 * Generate AI-powered social media content using Gemini or OpenAI
 */

import { createOpenAIJsonCompletion } from '@/lib/ai/client'
import { requireAdminSession } from '@/lib/ai/shared'
import { logger } from '@/lib/logger'

const CONTENT_SCHEMA = {
  type: 'object' as const,
  properties: {
    title: {
      type: 'string',
      description: 'Post title or headline',
    },
    draft: {
      type: 'string',
      description: 'Full social media post content',
    },
    platform: {
      type: 'string',
      enum: ['linkedin', 'facebook', 'instagram', 'twitter'],
    },
    hashtags: {
      type: 'array',
      items: { type: 'string' },
      description: 'Suggested hashtags',
    },
  },
  required: ['title', 'draft', 'platform', 'hashtags'],
}

const BRAND_VOICE = `You are the content strategist for Latimore Life & Legacy LLC.
Brand Voice:
- Authentic, personal, community-focused (Central PA: Schuylkill, Luzerne, Northumberland Counties)
- Educational, urgent but NOT fear-based
- Emphasize protection, family legacy, preparation
- No morbid language
- Respectful of the Jackson M. Latimore Sr. cardiac arrest story (preparation becomes legacy)

Non-Negotiables:
- Include tagline: "Protecting Today. Securing Tomorrow."
- Include hashtag: "#TheBeatGoesOn"
- Plain language (8th grade level)
- Focus on legacy, not death
- Solutions-oriented
- Warm and community-focused`

export async function POST(req: Request) {
  const auth = await requireAdminSession()
  if (!auth.ok) return auth.response

  try {
    const body = await req.json()
    const { topic, platform = 'linkedin', count = 1 } = body

    if (!topic) {
      return Response.json({ error: 'topic is required' }, { status: 400 })
    }

    const systemPrompt = BRAND_VOICE

    const userPrompt = `Generate ${count} social media post(s) for ${platform} about: "${topic}"`

    const results = []
    for (let i = 0; i < count; i++) {
      const result = await createOpenAIJsonCompletion({
        system: systemPrompt,
        user: userPrompt,
        schemaName: 'SocialMediaContent',
        schema: CONTENT_SCHEMA,
        temperature: 0.8,
      })
      logger.debug({ index: i, result }, 'AI result for post')
      results.push(result.output)
    }

    logger.debug({ count: results.length }, 'Final content generation results')

    return Response.json({
      success: true,
      count: results.length,
      posts: results.flat(), // Flatten the array of arrays into a single array
    })
  } catch (error) {
    console.error('Content generation error:', error)
    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to generate content' },
      { status: 500 }
    )
  }
}
