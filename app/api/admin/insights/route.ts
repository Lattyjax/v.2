import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const status   = searchParams.get('status')   ?? 'open'
  const severity = searchParams.get('severity')
  const type     = searchParams.get('type')
  const take     = Math.min(parseInt(searchParams.get('take') ?? '50'), 100)

  const insights = await prisma.insight.findMany({
    where: {
      ...(status   !== 'all' ? { status }   : {}),
      ...(severity            ? { severity } : {}),
      ...(type                ? { type }     : {}),
    },
    orderBy: { createdAt: 'desc' },
    take,
    include: { post: { select: { id: true, platform: true, caption: true } } },
  })

  const counts = await prisma.insight.groupBy({
    by: ['severity', 'status'],
    _count: { _all: true },
  })

  return NextResponse.json({ ok: true, insights, counts })
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { id, status } = await req.json()
  if (!id || !status) return NextResponse.json({ error: 'id and status required' }, { status: 400 })

  const valid = ['open', 'dismissed', 'resolved']
  if (!valid.includes(status)) return NextResponse.json({ error: 'invalid status' }, { status: 400 })

  const updated = await prisma.insight.update({ where: { id }, data: { status } })
  return NextResponse.json({ ok: true, insight: updated })
}
