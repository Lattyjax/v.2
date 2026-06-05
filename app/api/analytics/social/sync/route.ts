import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Syncs social metrics from external scheduler. Auth via ENGAGEMENT_SYNC_TOKEN.
export async function POST(req: NextRequest) {
  const token = process.env.ENGAGEMENT_SYNC_TOKEN
  if (!token) return NextResponse.json({ error: 'sync not configured' }, { status: 503 })

  const auth = req.headers.get('authorization')
  const provided = auth?.startsWith('Bearer ') ? auth.slice(7) : null
  if (provided !== token) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  let body: { platform?: string; posts?: unknown[] }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 })
  }

  const platform = typeof body.platform === 'string' ? body.platform : 'unknown'
  const posts = Array.isArray(body.posts) ? body.posts : []

  let created = 0
  let updated = 0
  const errors: string[] = []

  for (const raw of posts) {
    if (!raw || typeof raw !== 'object') continue
    const p = raw as Record<string, unknown>

    try {
      const externalPostId = String(p.id ?? p.post_id ?? '')
      if (!externalPostId) continue

      const post = await prisma.socialPost.upsert({
        where: { platform_externalPostId: { platform, externalPostId } },
        create: {
          platform,
          externalPostId,
          caption: String(p.caption ?? p.message ?? p.text ?? '').slice(0, 1000),
          status: 'published',
          publishedAt: p.published_at ? new Date(String(p.published_at)) : new Date(),
          metadata: p as object,
        },
        update: {
          caption: String(p.caption ?? p.message ?? p.text ?? '').slice(0, 1000),
          metadata: p as object,
        },
      })

      const metricDate = p.metric_date ? new Date(String(p.metric_date)) : new Date()
      const metrics = {
        impressions: Number(p.impressions ?? 0),
        reach: Number(p.reach ?? 0),
        clicks: Number(p.clicks ?? p.link_clicks ?? 0),
        reactions: Number(p.reactions ?? p.likes ?? 0),
        comments: Number(p.comments ?? 0),
        shares: Number(p.shares ?? 0),
        saves: Number(p.saves ?? 0),
        leads: Number(p.leads ?? 0),
        conversions: Number(p.conversions ?? 0),
        revenueCents: Number(p.revenue_cents ?? 0),
      }

      const existing = await prisma.socialMetric.findUnique({
        where: { postId_metricDate: { postId: post.id, metricDate } },
      })

      if (existing) {
        await prisma.socialMetric.update({ where: { id: existing.id }, data: { ...metrics, raw: p as object } })
        updated++
      } else {
        await prisma.socialMetric.create({
          data: { postId: post.id, platform, metricDate, ...metrics, raw: p as object },
        })
        created++
      }
    } catch (e) {
      errors.push(String(e instanceof Error ? e.message : e).slice(0, 200))
    }
  }

  return NextResponse.json({ ok: true, platform, created, updated, errors: errors.slice(0, 5) })
}
