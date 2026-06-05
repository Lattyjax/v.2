export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createOpenAIJsonCompletion } from '@/lib/ai/client'
import { requireCronAuth } from '@/lib/ai/shared'
import { logger } from '@/lib/logger'

export async function GET(req: NextRequest) {
  const authError = requireCronAuth(req)
  if (authError) return authError

  try {
    // Get contacts that need automated task generation
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

    // Find contacts that:
    // 1. Are in active pipeline stages
    // 2. Haven't had activity in the last 7 days
    // 3. Don't have open tasks due within 3 days
    const contactsNeedingTasks = await prisma.contact.findMany({
      where: {
        status: {
          in: ['NEW', 'ATTEMPTED_CONTACT', 'CONTACTED', 'QUALIFIED', 'NURTURE']
        },
        OR: [
          { lastActivityAt: { lt: sevenDaysAgo } },
          { lastActivityAt: null }
        ],
        tasks: {
          none: {
            status: 'Open',
            dueAt: {
              lt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // Due within 3 days
            }
          }
        }
      },
      include: {
        inquiries: {
          include: {
            appointments: true
          },
          orderBy: { createdAt: 'desc' },
          take: 1
        },
        notes: {
          orderBy: { createdAt: 'desc' },
          take: 5
        },
        tasks: {
          where: { status: 'Open' },
          orderBy: { dueAt: 'asc' }
        }
      },
      take: 10 // Process up to 10 contacts per run
    })

    logger.info({ count: contactsNeedingTasks.length }, 'Found contacts needing automated tasks')

    let totalTasksCreated = 0

    for (const contact of contactsNeedingTasks) {
      try {
        // Prepare data for AI analysis
        const analysisData = {
          contact: {
            name: `${contact.firstName} ${contact.lastName}`,
            email: contact.email,
            status: contact.status,
            leadScore: contact.leadScore,
            lastActivity: contact.lastActivityAt,
            daysSinceActivity: contact.lastActivityAt
              ? Math.floor((Date.now() - contact.lastActivityAt.getTime()) / (1000 * 60 * 60 * 24))
              : null
          },
          inquiry: contact.inquiries[0] ? {
            stage: contact.inquiries[0].stage,
            productInterest: contact.inquiries[0].productInterest,
            status: contact.inquiries[0].status,
            notes: contact.inquiries[0].notes
          } : null,
          recentNotes: contact.notes.map(note => ({
            content: note.body,
            createdAt: note.createdAt
          })),
          existingTasks: contact.tasks.map(task => ({
            title: task.title,
            dueAt: task.dueAt
          }))
        }

        // Generate automated task
        const taskResult = await createOpenAIJsonCompletion<{
          title: string
          description: string
          dueInDays: number
          priority: 'high'
        }>({
          system: `You are an automated CRM task generator. Create ONE high-priority follow-up task for a contact who hasn't been active recently.

Consider:
- Contact status and time since last activity
- Lead score and pipeline position
- Existing tasks and recent notes
- Product interest and inquiry details

Generate exactly ONE actionable task that will re-engage the contact and move them forward.`,
          user: `Generate an automated follow-up task for this inactive contact:

${JSON.stringify(analysisData, null, 2)}

Provide a single task in this JSON format:
{
  "title": "Brief, actionable task title",
  "description": "Detailed description of what to do and why",
  "dueInDays": number (1-7 days from now),
  "priority": "high"
}`,
          schemaName: 'automatedTask',
          schema: {
            type: 'object',
            additionalProperties: false,
            properties: {
              title: { type: 'string' },
              description: { type: 'string' },
              dueInDays: { type: 'number', minimum: 1, maximum: 7 },
              priority: { type: 'string', enum: ['high'] }
            },
            required: ['title', 'description', 'dueInDays', 'priority']
          },
          temperature: 0.6
        })

        if (taskResult?.output) {
          const dueAt = new Date()
          dueAt.setDate(dueAt.getDate() + taskResult.output.dueInDays)

          await prisma.task.create({
            data: {
              title: taskResult.output.title,
              description: taskResult.output.description,
              dueAt,
              contactId: contact.id,
              inquiryId: contact.inquiries[0]?.id,
              status: 'Open'
            }
          })

          totalTasksCreated++
          logger.info({ contactId: contact.id }, 'Created automated task')
        }
      } catch (error) {
        logger.error({ contactId: contact.id, error }, 'Failed to generate task for contact')
      }
    }

    return NextResponse.json({
      success: true,
      contactsProcessed: contactsNeedingTasks.length,
      tasksCreated: totalTasksCreated,
      message: `Automated task generation complete: ${totalTasksCreated} tasks created for ${contactsNeedingTasks.length} contacts`
    })

  } catch (error) {
    logger.error({ error }, 'Automated task generation error')
    return NextResponse.json({ error: 'Failed to generate automated tasks' }, { status: 500 })
  }
}