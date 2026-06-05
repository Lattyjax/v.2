export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { publishSocialPost } from '@/lib/social'

export async function POST() {
  const now = new Date()
  const assets = await prisma.contentAsset.findMany({ where: { status: 'scheduled', scheduledFor: { lte: now } } })
  let publishedCount = 0

  for (const asset of assets) {
    try {
      await publishSocialPost(asset)
      await prisma.contentAsset.update({ where: { id: asset.id }, data: { status: 'published', publishedAt: new Date() } })
      await prisma.systemEvent.create({ data: { type: 'content.published', payload: { assetId: asset.id, channel: asset.channel } } })
      publishedCount += 1
    } catch (error) {
      await prisma.systemEvent.create({
        data: {
          type: 'content.publish_failed',
          payload: {
            assetId: asset.id,
            channel: asset.channel,
            error: error instanceof Error ? error.message : String(error),
          },
        },
      })
    }
  }

  return NextResponse.json({ ok: true, published: publishedCount, total: assets.length })
}
