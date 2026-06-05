export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireCronAuth } from '@/lib/ai/shared'
import { logger } from '@/lib/logger'

export async function GET(req: NextRequest) {
  const authError = requireCronAuth(req)
  if (authError) return authError

  try {
    // Get contacts that need lead score updates
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

    // Find contacts with recent activity that might need score adjustments
    const contactsToUpdate = await prisma.contact.findMany({
      where: {
        OR: [
          { lastActivityAt: { gte: sevenDaysAgo } },
          { updatedAt: { gte: sevenDaysAgo } },
          {
            inquiries: {
              some: {
                updatedAt: { gte: sevenDaysAgo }
              }
            }
          }
        ]
      },
      include: {
        inquiries: {
          include: {
            appointments: true
          }
        },
        notes: true,
        appointments: true,
        tasks: {
          where: { status: 'Open' }
        }
      }
    })

    logger.info({ count: contactsToUpdate.length }, 'Found contacts for lead score updates')

    let updatedCount = 0

    for (const contact of contactsToUpdate) {
      try {
        let scoreAdjustment = 0
        const reasons: string[] = []

        // Base score from status
        const statusScores = {
          'NEW': 10,
          'ATTEMPTED_CONTACT': 15,
          'CONTACTED': 25,
          'QUALIFIED': 40,
          'BOOKED': 60,
          'IN_CONSULT': 75,
          'CLOSED_WON': 100,
          'CLOSED_LOST': 0,
          'NURTURE': 20,
          'ON_HOLD': 5
        }

        const baseScore = statusScores[contact.status as keyof typeof statusScores] || 10

        // Activity-based adjustments
        const daysSinceActivity = contact.lastActivityAt
          ? Math.floor((Date.now() - contact.lastActivityAt.getTime()) / (1000 * 60 * 60 * 24))
          : 30

        // Recent activity bonus
        if (daysSinceActivity <= 1) {
          scoreAdjustment += 5
          reasons.push('Very recent activity')
        } else if (daysSinceActivity <= 7) {
          scoreAdjustment += 3
          reasons.push('Recent activity')
        } else if (daysSinceActivity > 14) {
          scoreAdjustment -= 5
          reasons.push('Inactive for 2+ weeks')
        }

        // Appointment activity
        const recentAppointments = contact.appointments.filter(apt =>
          apt.createdAt >= sevenDaysAgo
        ).length

        if (recentAppointments > 0) {
          scoreAdjustment += recentAppointments * 10
          reasons.push(`${recentAppointments} recent appointment(s)`)
        }

        // Inquiry activity
        const activeInquiries = contact.inquiries.filter(inq =>
          ['QUALIFIED', 'BOOKED', 'IN_CONSULT'].includes(inq.status)
        ).length

        if (activeInquiries > 0) {
          scoreAdjustment += activeInquiries * 8
          reasons.push(`${activeInquiries} active inquiry(ies)`)
        }

        // Notes activity (engagement)
        const recentNotes = contact.notes.filter(note =>
          note.createdAt >= sevenDaysAgo
        ).length

        if (recentNotes > 0) {
          scoreAdjustment += recentNotes * 3
          reasons.push(`${recentNotes} recent note(s)`)
        }

        // Task completion (negative for overdue)
        const overdueTasks = contact.tasks.filter(task =>
          task.dueAt && task.dueAt < new Date()
        ).length

        if (overdueTasks > 0) {
          scoreAdjustment -= overdueTasks * 5
          reasons.push(`${overdueTasks} overdue task(s)`)
        }

        // Calculate new score with bounds
        const newScore = Math.max(0, Math.min(100, baseScore + scoreAdjustment))

        // Only update if score changed significantly
        if (Math.abs(newScore - (contact.leadScore || 0)) >= 5) {
          await prisma.contact.update({
            where: { id: contact.id },
            data: {
              leadScore: newScore,
              notesSummary: reasons.length > 0
                ? `Score updated: ${reasons.join(', ')}`
                : contact.notesSummary
            }
          })

          updatedCount++
          logger.info({ contactId: contact.id, from: contact.leadScore || 0, to: newScore }, 'Updated lead score')
        }

      } catch (error) {
        logger.error({ contactId: contact.id, error }, 'Failed to update lead score')
      }
    }

    return NextResponse.json({
      success: true,
      contactsProcessed: contactsToUpdate.length,
      scoresUpdated: updatedCount,
      message: `Lead score updates complete: ${updatedCount} scores updated`
    })

  } catch (error) {
    logger.error({ error }, 'Lead score update error')
    return NextResponse.json({ error: 'Failed to update lead scores' }, { status: 500 })
  }
}