export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { rateLimit } from '@/lib/rate-limit'
import { createOpenAIJsonCompletion } from '@/lib/ai/client'

export async function POST(req: NextRequest) {
  const limited = await rateLimit(req, 'default')
  if (limited) return limited

  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })

  try {
    const { contactId, inquiryId } = await req.json()

    if (!contactId && !inquiryId) {
      return NextResponse.json({ error: 'contactId or inquiryId required' }, { status: 400 })
    }

    // Get contact/inquiry data for AI analysis
    let contact, inquiry

    if (contactId) {
      contact = await prisma.contact.findUnique({
        where: { id: contactId },
        include: {
          inquiries: {
            include: {
              appointments: true
            }
          },
          notes: true,
          tasks: {
            where: { status: 'Open' },
            orderBy: { dueAt: 'asc' }
          },
          appointments: true
        }
      })
    }

    if (inquiryId) {
      inquiry = await prisma.inquiry.findUnique({
        where: { id: inquiryId },
        include: {
          contact: {
            include: {
              notes: true,
              tasks: {
                where: { status: 'Open' },
                orderBy: { dueAt: 'asc' }
              },
              appointments: true
            }
          },
          appointments: true,
          tasks: {
            where: { status: 'Open' },
            orderBy: { dueAt: 'asc' }
          }
        }
      })
      contact = inquiry?.contact
    }

    if (!contact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 })
    }

    // Prepare data for AI analysis
    const analysisData = {
      contact: {
        name: `${contact.firstName} ${contact.lastName}`,
        email: contact.email,
        phone: contact.phone,
        county: contact.county,
        status: contact.status,
        leadScore: contact.leadScore,
        lastActivity: contact.lastActivityAt,
        nextFollowUp: contact.nextFollowUpAt,
        notesSummary: contact.notesSummary
      },
      inquiry: inquiry ? {
        stage: inquiry.stage,
        productInterest: inquiry.productInterest,
        status: inquiry.status,
        leadScore: inquiry.leadScore,
        notes: inquiry.notes
      } : null,
      recentNotes: contact.notes.slice(-5).map(note => ({
        content: note.body,
        createdAt: note.createdAt
      })),
      existingTasks: contact.tasks.map(task => ({
        title: task.title,
        description: task.description,
        dueAt: task.dueAt,
        status: task.status
      })),
      appointments: contact.appointments.slice(-3).map(apt => ({
        scheduledFor: apt.scheduledFor,
        status: apt.status
      }))
    }

    // Generate AI task recommendations
    const tasksResult = await createOpenAIJsonCompletion<{
      tasks: Array<{
        title: string
        description: string
        priority: 'high' | 'medium' | 'low'
        dueInDays: number
        category: 'follow_up' | 'qualification' | 'nurture' | 'appointment' | 'research'
      }>
    }>({
      system: `You are an expert CRM task strategist. Analyze contact data and generate actionable, prioritized tasks to move the contact forward in the sales pipeline.

Consider:
- Contact status and lead score
- Time since last activity
- Existing tasks and appointments
- Product interest and stage
- County and local context
- Notes and communication history

Generate 1-3 high-priority tasks that will advance the contact. Each task should be specific, actionable, and time-bound.`,
      user: `Generate follow-up tasks for this contact based on their current status and activity:

${JSON.stringify(analysisData, null, 2)}

Provide tasks in this JSON format:
{
  "tasks": [
    {
      "title": "Brief, actionable task title",
      "description": "Detailed description of what to do and why",
      "priority": "high|medium|low",
      "dueInDays": number (days from now),
      "category": "follow_up|qualification|nurture|appointment|research"
    }
  ]
}`,
      schemaName: 'taskRecommendations',
      schema: {
        type: 'object',
        properties: {
          tasks: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                description: { type: 'string' },
                priority: { type: 'string', enum: ['high', 'medium', 'low'] },
                dueInDays: { type: 'number', minimum: 1, maximum: 30 },
                category: { type: 'string', enum: ['follow_up', 'qualification', 'nurture', 'appointment', 'research'] }
              },
              required: ['title', 'description', 'priority', 'dueInDays', 'category']
            }
          }
        },
        required: ['tasks']
      },
      temperature: 0.7
    })

    if (!tasksResult?.output?.tasks || tasksResult.output.tasks.length === 0) {
      return NextResponse.json({ error: 'No tasks generated' }, { status: 400 })
    }

    // Create tasks in database
    const createdTasks = []
    for (const taskData of tasksResult.output.tasks) {
      const dueAt = new Date()
      dueAt.setDate(dueAt.getDate() + taskData.dueInDays)

      const task = await prisma.task.create({
        data: {
          title: taskData.title,
          description: taskData.description,
          dueAt,
          contactId: contact.id,
          inquiryId: inquiry?.id,
          status: 'Open'
        }
      })
      createdTasks.push(task)
    }

    return NextResponse.json({
      success: true,
      tasks: createdTasks,
      message: `Generated ${createdTasks.length} AI-powered tasks`
    })

  } catch (error) {
    console.error('AI task generation error:', error)
    return NextResponse.json({ error: 'Failed to generate tasks' }, { status: 500 })
  }
}