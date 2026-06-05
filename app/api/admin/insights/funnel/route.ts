export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminSession } from '@/lib/ai/shared'

export async function GET() {
  const auth = await requireAdminSession()
  if (!auth.ok) return auth.response

  try {
    const metrics = await prisma.inquiry.groupBy({
      by: ['productInterest', 'stage'],
      _count: { _all: true },
      orderBy: [{ productInterest: 'asc' }, { stage: 'asc' }],
    })

    return NextResponse.json({ data: metrics })
  } catch {
    return NextResponse.json({ error: 'Failed to generate funnel insights' }, { status: 500 })
  }
}
