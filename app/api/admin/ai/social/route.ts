/**
 * POST /api/admin/ai/social
 * Generate brand-locked social media post drafts.
 * Replaces client-side generateSocialContent() from geminiService.ts
 */

import { createOpenAIJsonCompletion } from '@/lib/ai/client'
import { requireAdminSession } from '@/lib/ai/shared'

const BRAND_VOICE = `You are the Brand-Locked Content Engine for Latimore Life & Legacy LLC.

NON-NEGOTIABLES:
1. Brand Voice: Authentic, personal, community-focused (Central PA: Schuylkill, Luzerne, Northumberland Counties), educational, and urgent but NOT fear-based.
2. No morbid language. Emphasize preparation and love for family — never death and doom.
3. Include tagline: "Protecting Today. Securing Tomorrow."
4. Include hashtag: #TheBeatGoesOn
5. Plain language (8th-grade reading level).
6. Founder story (cardiac arrest survival, AED, Greg Moyer legacy) used ONLY when relevant, always with dignity — never for shock or manipulation.
7. Education-first: explain benefits before asking for anything.`

const POSTS_SCHEMA = {
  type: 'array' as const,
  items: {
    type: 'object',
    properties: {
      title: { type: 'string', description: 'Short headline for this post draft' },
      draft: { type: 'string', description: 'Full post body ready to publish' },
      platform: { type: 'string', description: 'Target platform (LinkedIn, Facebook, Instagram, Twitter)' },
      hashtags: {
        type: 'array',
        items: { type: 'string' },
        description: 'Suggested hashtags for this post',
      },
    },
    required: ['title', 'draft', 'platform', 'hashtags'],
    additionalProperties: false,
  },
}

export async function POST(req: Request) {
  const auth = await requireAdminSession()
  if (!auth.ok) return auth.response

  try {
    const body = await req.json()
    const { topic, platform = 'LinkedIn', count = 3 } = body

    if (!topic?.trim()) {
      return Response.json({ error: 'topic is required' }, { status: 400 })
    }

    const clampedCount = Math.min(Math.max(Number(count) || 3, 1), 5)

    const result = await createOpenAIJsonCompletion<unknown[]>({
      system: BRAND_VOICE,
      user: `Generate ${clampedCount} social media post draft(s) for ${platform} about: "${topic}".

Each draft must:
- Open with a hook that educates, not alarms
- Reference the Central PA community where relevant
- End with a specific call to action (book a call, reply, share, etc.)
- Include the tagline and #TheBeatGoesOn
- Be platform-appropriate in length (LinkedIn: 150-300 words; Facebook: 80-150 words; Instagram: 60-120 words + emojis; Twitter: under 240 chars)`,
      schemaName: 'SocialPosts',
      schema: POSTS_SCHEMA,
      temperature: 0.8,
    })

    return Response.json({
      success: true,
      topic,
      platform,
      count: result.output.length,
      posts: result.output,
    })
  } catch (error) {
    console.error('[/api/admin/ai/social] Error:', error)
    return Response.json(
      { error: error instanceof Error ? error.message : 'Social content generation failed' },
      { status: 500 }
    )
  }
}
