import { NextRequest, NextResponse } from 'next/server'
import { requireAdminSession } from '@/lib/ai/shared'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Dev/admin endpoint for manually injecting test social data
export async function POST(req: NextRequest) {
  const auth = await requireAdminSession()
  if (!auth.ok) return auth.response

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 })
  }

  const platform = String(body.platform ?? 'facebook')
  const caption = String(body.caption ?? 'Test post from manual-test endpoint')
  const metricsRaw = (body.metrics ?? {}) as Record<string, number>

  const post = await prisma.socialPost.create({
    data: {
      platform,
      caption: caption.slice(0, 1000),
      status: 'published',
      publishedAt: new Date(),
      externalPostId: `manual-test-${Date.now()}`,
    },
  })

  const metric = await prisma.socialMetric.create({
    data: {
      postId: post.id,
      platform,
      metricDate: new Date(),
      impressions: metricsRaw.impressions ?? 0,
      reach: metricsRaw.reach ?? 0,
      clicks: metricsRaw.clicks ?? 0,
      reactions: metricsRaw.reactions ?? 10,
      comments: metricsRaw.comments ?? 2,
      shares: metricsRaw.shares ?? 1,
      saves: metricsRaw.saves ?? 0,
      leads: metricsRaw.leads ?? 0,
    },
  })

  return NextResponse.json({ ok: true, post, metric })
}
