export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { rateLimit } from '@/lib/rate-limit'
import { prisma } from '@/lib/prisma'
import { createOpenAIJsonCompletion } from '@/lib/ai/client'

export async function GET(req: NextRequest) {
  const limited = await rateLimit(req, 'reports')
  if (limited) return limited

  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })

  try {
    // Get recent data for analysis
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

    const [recentInquiries, recentContacts, recentBookings, trendData] = await Promise.all([
      prisma.inquiry.findMany({
        where: { createdAt: { gte: thirtyDaysAgo } },
        select: { createdAt: true, source: true, productInterest: true, stage: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.contact.findMany({
        where: { createdAt: { gte: thirtyDaysAgo } },
        select: { createdAt: true, county: true, leadScore: true, status: true },
      }),
      prisma.appointment.findMany({
        where: { createdAt: { gte: thirtyDaysAgo } },
        select: { createdAt: true, status: true },
      }),
      // Get daily counts for the last 30 days
      prisma.$queryRaw<Array<{ date: string; inquiries: number; contacts: number; bookings: number }>>`
        SELECT
          DATE(created_at) as date,
          COUNT(CASE WHEN type = 'inquiry' THEN 1 END) as inquiries,
          COUNT(CASE WHEN type = 'contact' THEN 1 END) as contacts,
          COUNT(CASE WHEN type = 'booking' THEN 1 END) as bookings
        FROM (
          SELECT created_at, 'inquiry' as type FROM "Inquiry" WHERE created_at >= ${thirtyDaysAgo}
          UNION ALL
          SELECT created_at, 'contact' as type FROM "Contact" WHERE created_at >= ${thirtyDaysAgo}
          UNION ALL
          SELECT created_at, 'booking' as type FROM "Appointment" WHERE created_at >= ${thirtyDaysAgo}
        ) combined
        GROUP BY DATE(created_at)
        ORDER BY date DESC
        LIMIT 30
      `,
    ])

    // Calculate basic metrics
    const totalInquiries = recentInquiries.length
    const totalContacts = recentContacts.length
    const totalBookings = recentBookings.length
    const conversionRate = totalInquiries > 0 ? (totalBookings / totalInquiries * 100) : 0

    // Get last 7 days vs previous 7 days comparison
    const lastWeekInquiries = recentInquiries.filter(i => i.createdAt >= sevenDaysAgo).length
    const prevWeekInquiries = recentInquiries.filter(i =>
      i.createdAt >= new Date(sevenDaysAgo.getTime() - 7 * 24 * 60 * 60 * 1000) &&
      i.createdAt < sevenDaysAgo
    ).length

    const inquiryGrowth = prevWeekInquiries > 0 ? ((lastWeekInquiries - prevWeekInquiries) / prevWeekInquiries * 100) : 0

    // Prepare data for AI analysis
    const analysisData = {
      totalInquiries,
      totalContacts,
      totalBookings,
      conversionRate: conversionRate.toFixed(1),
      inquiryGrowth: inquiryGrowth.toFixed(1),
      recentTrends: trendData.slice(0, 7), // Last 7 days
      topSources: recentInquiries.reduce((acc, inquiry) => {
        const source = inquiry.source || 'unknown'
        acc[source] = (acc[source] || 0) + 1
        return acc
      }, {} as Record<string, number>),
      topProducts: recentInquiries.reduce((acc, inquiry) => {
        const product = inquiry.productInterest || 'unknown'
        acc[product] = (acc[product] || 0) + 1
        return acc
      }, {} as Record<string, number>),
    }

    // Generate AI insights
    const insights = await createOpenAIJsonCompletion({
      system: 'You are an expert business analyst specializing in lead generation and conversion optimization. Analyze the provided data and provide actionable insights.',
      user: `Analyze this lead generation and conversion data and provide predictive insights. Focus on trends, opportunities, and recommendations.

Data: ${JSON.stringify(analysisData, null, 2)}`,
      schemaName: 'predictiveInsights',
      schema: {
        type: 'object',
        properties: {
          trendAnalysis: { type: 'string' },
          predictions: { type: 'array', items: { type: 'string' } },
          opportunities: { type: 'array', items: { type: 'string' } },
          risks: { type: 'array', items: { type: 'string' } },
          recommendations: { type: 'array', items: { type: 'string' } }
        },
        required: ['trendAnalysis', 'predictions', 'opportunities', 'risks', 'recommendations']
      },
      temperature: 0.7,
    })

    return NextResponse.json({
      metrics: {
        totalInquiries,
        totalContacts,
        totalBookings,
        conversionRate,
        inquiryGrowth,
      },
      insights: insights || {
        trendAnalysis: "Analyzing recent lead generation patterns...",
        predictions: [],
        opportunities: [],
        risks: [],
        recommendations: [],
      },
      trendData,
    })
  } catch (error) {
    console.error('Predictive insights API error:', error)
    // Return fallback empty insights if database is unreachable
    return NextResponse.json({
      metrics: {
        totalInquiries: 0,
        totalContacts: 0,
        totalBookings: 0,
        conversionRate: 0,
        inquiryGrowth: 0,
      },
      insights: {
        trendAnalysis: "Database temporarily unavailable. Check back soon.",
        predictions: [],
        opportunities: [],
        risks: [],
        recommendations: [],
      },
      trendData: [],
    })
  }
}