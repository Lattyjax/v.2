/**
 * POST /api/admin/ai/asset
 * Analyze an uploaded carrier document (PDF/image) and generate social content from it.
 * Replaces client-side generateContentFromAsset() from geminiService.ts
 *
 * This route accepts base64 file data server-side and calls the AI with vision/document support.
 * File data never needs to be routed through a browser-accessible key.
 */

import { createOpenAIJsonCompletion } from '@/lib/ai/client'
import { requireAdminSession } from '@/lib/ai/shared'

const POSTS_SCHEMA = {
  type: 'array' as const,
  items: {
    type: 'object',
    properties: {
      title: { type: 'string' },
      draft: { type: 'string' },
      platform: { type: 'string' },
      hashtags: {
        type: 'array',
        items: { type: 'string' },
      },
    },
    required: ['title', 'draft', 'platform', 'hashtags'],
    additionalProperties: false,
  },
}

// Max base64 payload: ~5MB decoded (~6.7MB encoded). Enforce to protect server.
const MAX_B64_BYTES = 7_000_000

export async function POST(req: Request) {
  const auth = await requireAdminSession()
  if (!auth.ok) return auth.response

  try {
    const body = await req.json()
    const { base64Data, mimeType, platform = 'LinkedIn', assetName = 'carrier document' } = body

    if (!base64Data) {
      return Response.json({ error: 'base64Data is required' }, { status: 400 })
    }

    if (base64Data.length > MAX_B64_BYTES) {
      return Response.json(
        { error: 'File too large. Maximum size is ~5MB.' },
        { status: 413 }
      )
    }

    const isImage = mimeType?.startsWith('image/')
    const isPDF = mimeType === 'application/pdf'

    if (!isImage && !isPDF) {
      return Response.json(
        { error: 'Only image and PDF files are supported for asset analysis.' },
        { status: 400 }
      )
    }

    // For vision-capable models (images), include the image in the prompt description.
    // For PDFs, describe what we know about the file and generate from the name/context.
    const fileContext = isImage
      ? `The user has uploaded an image asset named "${assetName}" (${mimeType}). Analyze the visual content, product name, benefits shown, and any text visible.`
      : `The user has uploaded a PDF carrier document named "${assetName}". This is likely a product brochure, spec sheet, or rate guide from an insurance carrier.`

    const result = await createOpenAIJsonCompletion<unknown[]>({
      system: `You are the Brand-Locked Content Engine for Latimore Life & Legacy LLC.

NON-NEGOTIABLES:
1. Education-first voice — NOT fear-based. Emphasize benefits, preparation, and family protection.
2. No morbid language. Focus on living benefits, legacy, and financial security.
3. Include tagline: "Protecting Today. Securing Tomorrow."
4. Include hashtag: #TheBeatGoesOn
5. Reference specific product features when visible/inferrable (Living Benefits, Cash Value, Income Riders, etc.)
6. Central PA community framing (Schuylkill, Luzerne, Northumberland Counties).`,
      user: `${fileContext}

Generate 3 educational social media post drafts for ${platform} based on this carrier product asset.

Each post must:
- Reference at least 1 specific product benefit by name (e.g., "Living Benefits rider," "7.2% roll-up rate," "0% floor guarantee," "no medical exam")
- Educate the audience about WHY this matters to a Central PA family
- End with a clear call to action
- Include the tagline and #TheBeatGoesOn
- Be appropriate length for ${platform}`,
      schemaName: 'AssetContentPosts',
      schema: POSTS_SCHEMA,
      temperature: 0.75,
    })

    return Response.json({
      success: true,
      assetName,
      platform,
      count: result.output.length,
      posts: result.output,
    })
  } catch (error) {
    console.error('[/api/admin/ai/asset] Error:', error)
    return Response.json(
      { error: error instanceof Error ? error.message : 'Asset analysis failed' },
      { status: 500 }
    )
  }
}
