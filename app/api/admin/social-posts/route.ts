export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminSession } from '@/lib/ai/shared'


export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdminSession()
    if (!auth.ok) return auth.response

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') as 'draft' | 'scheduled' | 'published' | null
    const channel = searchParams.get('channel') as string | null

    const where: any = {
      type: 'social_post'
    }

    if (status) {
      where.status = status
    }

    if (channel) {
      where.channel = channel
    }

    const posts = await prisma.contentAsset.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      posts,
      total: posts.length,
    })
  } catch (error) {
    console.error('Social posts fetch error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch posts' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAdminSession()
    if (!auth.ok) return auth.response

    const body = await req.json()
    const { title, bodyText, channel, type, scheduledFor, metadata } = body

    if (!bodyText || !channel) {
      return NextResponse.json(
        { error: 'bodyText and channel are required' },
        { status: 400 }
      )
    }

    // Create content asset
    const asset = await prisma.contentAsset.create({
      data: {
        title: title || 'Social Media Post',
        type: type || 'social_post',
        status: scheduledFor ? 'scheduled' : 'draft',
        channel,
        bodyText,
        bodyHtml: bodyText, // For now, same as text
        metadata,
        scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
        createdBy: 'admin' // TODO: Get from session
      }
    })

    // Create system event
    await prisma.systemEvent.create({
      data: {
        type: 'content.scheduled',
        payload: {
          assetId: asset.id,
          channel,
          scheduledFor,
          type: 'social_post'
        }
      }
    })

    return NextResponse.json({
      success: true,
      asset,
      message: scheduledFor ? 'Post scheduled successfully' : 'Post saved as draft'
    })
  } catch (error) {
    console.error('Social post creation error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create post' },
      { status: 500 }
    )
  }
}
