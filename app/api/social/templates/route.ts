import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// GET /api/social/templates?platform=facebook&category=educational&take=20
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const platform = searchParams.get('platform')
  const category = searchParams.get('category')
  const campaign = searchParams.get('campaign')
  const take     = Math.min(parseInt(searchParams.get('take') ?? '50'), 200)

  const templates = await prisma.socialTemplate.findMany({
    where: {
      ...(platform ? { platform } : {}),
      ...(category ? { category } : {}),
      ...(campaign ? { campaign } : {}),
    },
    orderBy: { updatedAt: 'desc' },
    take,
    include: {
      _count: { select: { usages: true } },
    },
  })

  const categories = await prisma.socialTemplate.groupBy({
    by: ['category'],
    _count: { _all: true },
    orderBy: { _count: { category: 'desc' } },
  })

  return NextResponse.json({ ok: true, templates, categories })
}

// POST /api/social/templates — create a new template
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const body = await req.json()
  const { title, category, platform, audienceTrack, body: templateBody, cta, hashtags, suggestedDay, suggestedTime, campaign } = body

  if (!title || !category || !templateBody) {
    return NextResponse.json({ error: 'title, category, and body are required' }, { status: 400 })
  }

  const template = await prisma.socialTemplate.create({
    data: {
      title,
      category,
      platform:        platform        ?? null,
      audienceTrack:   audienceTrack   ?? null,
      body:            templateBody,
      cta:             cta             ?? null,
      hashtags:        hashtags        ?? [],
      suggestedDay:    suggestedDay    ?? null,
      suggestedTime:   suggestedTime   ?? null,
      campaign:        campaign        ?? null,
      complianceStatus: 'draft',
    },
  })

  return NextResponse.json({ ok: true, template }, { status: 201 })
}

// PATCH /api/social/templates — update or clone a template
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const body = await req.json()
  const { id, clone, ...updates } = body

  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  if (clone) {
    const source = await prisma.socialTemplate.findUnique({ where: { id } })
    if (!source) return NextResponse.json({ error: 'template not found' }, { status: 404 })

    const cloned = await prisma.socialTemplate.create({
      data: {
        title:           `${source.title} (copy)`,
        category:        source.category,
        platform:        source.platform,
        audienceTrack:   source.audienceTrack,
        body:            source.body,
        cta:             source.cta,
        hashtags:        source.hashtags === null ? Prisma.JsonNull : source.hashtags,
        suggestedDay:    source.suggestedDay,
        suggestedTime:   source.suggestedTime,
        campaign:        source.campaign,
        complianceStatus: 'draft',
      },
    })
    return NextResponse.json({ ok: true, template: cloned }, { status: 201 })
  }

  const template = await prisma.socialTemplate.update({ where: { id }, data: updates })
  return NextResponse.json({ ok: true, template })
}

// DELETE /api/social/templates?id=xxx
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const id = new URL(req.url).searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  await prisma.socialTemplate.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
