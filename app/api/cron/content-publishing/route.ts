import { NextRequest, NextResponse } from 'next/server'
import { requireCronAuth, createSystemAiEvent } from '@/lib/ai/shared'
import { prisma } from '@/lib/prisma'
import { publishSocialPost } from '@/lib/social'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const authError = requireCronAuth(req)
  if (authError) return authError

  try {
    const now = new Date()

    // Find all scheduled content assets that are due to be published
    const dueContent = await prisma.contentAsset.findMany({
      where: {
        status: 'scheduled',
        scheduledFor: {
          lte: now
        }
      }
    })

    if (dueContent.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No content due for publishing',
        published: 0
      })
    }

    let publishedCount = 0

    for (const asset of dueContent) {
      try {
        await publishSocialPost(asset)
        await prisma.contentAsset.update({
          where: { id: asset.id },
          data: {
            status: 'published',
            publishedAt: now,
          },
        })
        await createSystemAiEvent({
          type: 'content.published',
          payload: {
            assetId: asset.id,
            type: asset.type,
            channel: asset.channel,
            scheduledFor: asset.scheduledFor,
          },
        })
        publishedCount += 1
      } catch (error) {
        await createSystemAiEvent({
          type: 'content.publish_failed',
          payload: {
            assetId: asset.id,
            channel: asset.channel,
            error: error instanceof Error ? error.message : String(error),
          },
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: `Published ${publishedCount} of ${dueContent.length} content items`,
      published: publishedCount,
      total: dueContent.length,
      items: dueContent.map(asset => ({
        id: asset.id,
        title: asset.title,
        type: asset.type,
        channel: asset.channel,
      }))
    })

  } catch (error) {
    console.error('Content publishing cron error:', error)
    return NextResponse.json(
      { error: 'Failed to publish scheduled content' },
      { status: 500 }
    )
  }
}