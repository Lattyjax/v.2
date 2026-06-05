export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { rateLimit } from '@/lib/rate-limit'
import { normalizeStage } from '@/lib/hub/normalizers'
import { logger } from '@/lib/logger'

export async function GET(req: NextRequest) {
  const limited = await rateLimit(req, 'inquiries')
  if (limited) return limited

  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const stage = normalizeStage(searchParams.get('stage') ?? searchParams.get('status') ?? 'New')

  try {
    const items = await prisma.inquiry.findMany({
      where: { stage },
      orderBy: { createdAt: 'desc' },
      include: { contact: true },
    })
    return NextResponse.json({ items })
  } catch (err: any) {
    logger.error({ err: err.message }, 'Inquiries GET error')
    return NextResponse.json({ ok: false, error: 'server error' }, { status: 500 })
  }
}
