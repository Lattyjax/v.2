export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { rateLimit } from '@/lib/rate-limit'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const limited = await rateLimit(req, 'reports')
  if (limited) return limited

  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })

  try {
    const url = new URL(req.url)
    const days = parseInt(url.searchParams.get('days') || '30')
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

    // Get daily metrics for the specified period
    const dailyMetrics = await prisma.$queryRaw<Array<{
      date: string
      inquiries: number
      contacts: number
      bookings: number
      events: number
    }>>`
      SELECT
        DATE(d.date) as date,
        COALESCE(i.count, 0) as inquiries,
        COALESCE(c.count, 0) as contacts,
        COALESCE(b.count, 0) as bookings,
        COALESCE(e.count, 0) as events
      FROM (
        SELECT generate_series(
          ${startDate}::date,
          CURRENT_DATE,
          '1 day'::interval
        )::date as date
      ) d
      LEFT JOIN (
        SELECT DATE(created_at) as date, COUNT(*) as count
        FROM "Inquiry"
        WHERE created_at >= ${startDate}
        GROUP BY DATE(created_at)
      ) i ON d.date = i.date
      LEFT JOIN (
        SELECT DATE(created_at) as date, COUNT(*) as count
        FROM "Contact"
        WHERE created_at >= ${startDate}
        GROUP BY DATE(created_at)
      ) c ON d.date = c.date
      LEFT JOIN (
        SELECT DATE(created_at) as date, COUNT(*) as count
        FROM "Appointment"
        WHERE created_at >= ${startDate}
        GROUP BY DATE(created_at)
      ) b ON d.date = b.date
      LEFT JOIN (
        SELECT DATE(occurred_at) as date, COUNT(*) as count
        FROM "Event"
        WHERE occurred_at >= ${startDate}
        GROUP BY DATE(occurred_at)
      ) e ON d.date = e.date
      ORDER BY d.date
    `

    // Get conversion funnel data
    const funnelData = await prisma.$queryRaw<Array<{
      stage: string
      count: number
      conversion_rate: number
    }>>`
      SELECT
        stage,
        COUNT(*) as count,
        CASE
          WHEN LAG(COUNT(*)) OVER (ORDER BY
            CASE stage
              WHEN 'New' THEN 1
              WHEN 'Attempted_Contact' THEN 2
              WHEN 'Contacted' THEN 3
              WHEN 'Qualified' THEN 4
              WHEN 'Booked' THEN 5
              WHEN 'In_Consult' THEN 6
              WHEN 'Closed_Won' THEN 7
              WHEN 'Closed_Lost' THEN 8
              ELSE 9
            END
          ) IS NULL THEN 100.0
          ELSE (COUNT(*)::float / LAG(COUNT(*)) OVER (ORDER BY
            CASE stage
              WHEN 'New' THEN 1
              WHEN 'Attempted_Contact' THEN 2
              WHEN 'Contacted' THEN 3
              WHEN 'Qualified' THEN 4
              WHEN 'Booked' THEN 5
              WHEN 'In_Consult' THEN 6
              WHEN 'Closed_Won' THEN 7
              WHEN 'Closed_Lost' THEN 8
              ELSE 9
            END
          )) * 100.0
        END as conversion_rate
      FROM "Inquiry"
      WHERE created_at >= ${startDate}
      GROUP BY stage
      ORDER BY
        CASE stage
          WHEN 'New' THEN 1
          WHEN 'Attempted_Contact' THEN 2
          WHEN 'Contacted' THEN 3
          WHEN 'Qualified' THEN 4
          WHEN 'Booked' THEN 5
          WHEN 'In_Consult' THEN 6
          WHEN 'Closed_Won' THEN 7
          WHEN 'Closed_Lost' THEN 8
          ELSE 9
        END
    `

    return NextResponse.json({
      dailyMetrics,
      funnelData,
    })
  } catch (error) {
    console.error('Time series API error:', error)
    // Return fallback empty data if database is unreachable
    return NextResponse.json({
      dailyMetrics: [],
      funnelData: [],
    })
  }
}