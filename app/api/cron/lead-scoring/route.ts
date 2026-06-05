export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { computeEnhancedLeadScore } from '@/lib/ai/lead-score-enhanced'
import { requireCronAuth } from '@/lib/ai/shared'

export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET
  const headerSecret = req.headers.get('x-cron-secret') ?? req.headers.get('authorization')?.replace('Bearer ', '')
  if (!cronSecret || headerSecret !== cronSecret) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Get all contacts that need scoring (active in last 30 days or have open inquiries)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

    const contacts = await prisma.contact.findMany({
      where: {
        OR: [
          { lastActivityAt: { gte: thirtyDaysAgo } },
          { inquiries: { some: { stage: { not: 'Lost' } } } },
          { leadScore: { gte: 50 } }, // Keep high-scoring leads fresh
        ]
      },
      select: { id: true, firstName: true, lastName: true },
    })

    let scored = 0
    let errors = 0

    for (const contact of contacts) {
      try {
        await computeEnhancedLeadScore({ contactId: contact.id })
        scored++
      } catch (error) {
        console.error(`Failed to score contact ${contact.id}:`, error)
        errors++
      }
    }

    // Log the cron run
    await prisma.systemEvent.create({
      data: {
        type: 'cron.lead_scoring.completed',
        payload: { contactsProcessed: scored, errors, totalContacts: contacts.length }
      }
    })

    return NextResponse.json({
      ok: true,
      message: `Lead scoring completed: ${scored} contacts scored, ${errors} errors`,
      stats: { scored, errors, total: contacts.length }
    })

  } catch (error) {
    console.error('Lead scoring cron failed:', error)
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 })
  }
}