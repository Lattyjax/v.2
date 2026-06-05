export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { rateLimit } from '@/lib/rate-limit'

export async function GET(req: NextRequest) {
  const limited = await rateLimit(req, 'reports')
  if (limited) return limited
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })

  const [leadCount, bookedCount, soldCount, clickCount] = await Promise.all([
    prisma.inquiry.count(),
    prisma.inquiry.count({ where: { stage: 'Booked' } }),
    prisma.inquiry.count({ where: { stage: 'Sold' } }),
    prisma.event.count({ where: { eventType: { in: ['cta_click', 'call_click', 'text_click', 'email_click', 'book_click'] as any } } }),
  ])

  return NextResponse.json({
    totals: {
      leads: leadCount,
      clicks: clickCount,
      booked: bookedCount,
      sold: soldCount,
    },
    rates: {
      clicksToLeads: clickCount > 0 ? Number((leadCount / clickCount).toFixed(3)) : 0,
      leadsToBooked: leadCount > 0 ? Number((bookedCount / leadCount).toFixed(3)) : 0,
      leadsToSold: leadCount > 0 ? Number((soldCount / leadCount).toFixed(3)) : 0,
    },
  })
}
