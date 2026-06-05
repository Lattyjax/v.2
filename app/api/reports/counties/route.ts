export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { rateLimit } from '@/lib/rate-limit'
import { getCountyReport } from '@/lib/hub/reporting'
import { countAll } from '@/lib/prisma-helpers'

export async function GET(req: NextRequest) {
  const limited = await rateLimit(req, 'reports')
  if (limited) return limited
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })

  const items = await getCountyReport()
  return NextResponse.json({
    items: items.map((row) => ({
      county: row.county,
      count: countAll(row._count),
    })),
  })
}
