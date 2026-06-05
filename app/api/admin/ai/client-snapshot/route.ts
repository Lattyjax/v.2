export const dynamic = 'force-dynamic'
/**
 * POST /api/admin/ai/client-snapshot
 * Generate an AI-powered snapshot/brief of a client based on their notes and context
 */

import { createOpenAIJsonCompletion } from '@/lib/ai/client'
import { prisma } from '@/lib/prisma'
import { requireAdminSession } from '@/lib/ai/shared'

const SNAPSHOT_SCHEMA = {
  type: 'object' as const,
  properties: {
    whoTheyAre: {
      type: 'string',
      description: 'One-sentence essence of the client',
    },
    familyContext: {
      type: 'array',
      items: { type: 'string' },
      description: 'Bullet points about family situation',
    },
    financialPicture: {
      type: 'array',
      items: { type: 'string' },
      description: 'Key financial observations',
    },
    topGoals: {
      type: 'array',
      items: { type: 'string' },
      description: 'Main objectives for this client',
    },
    riskThemes: {
      type: 'array',
      items: { type: 'string' },
      description: 'Identified risks or concerns',
    },
    summary: {
      type: 'string',
      description: 'Executive summary (2-3 sentences) for the call',
    },
  },
  required: ['whoTheyAre', 'familyContext', 'financialPicture', 'topGoals', 'riskThemes', 'summary'],
}

export async function POST(req: Request) {
  const auth = await requireAdminSession()
  if (!auth.ok) return auth.response

  try {
    const body = await req.json()
    const { contactId, notes, household } = body

    if (!notes && !contactId) {
      return Response.json(
        { error: 'Either contactId or notes is required' },
        { status: 400 }
      )
    }

    let clientInfo = { notes: '', household: '', email: '' }

    // Fetch from DB if contactId provided
    if (contactId) {
      const contact = await prisma.contact.findUnique({
        where: { id: contactId },
        select: { 
          firstName: true, 
          lastName: true, 
          email: true, 
          phone: true, 
          notes: {
            select: { body: true, createdAt: true },
            orderBy: { createdAt: 'desc' }
          }
        },
      })
      if (!contact) {
        return Response.json({ error: 'Contact not found' }, { status: 404 })
      }
      clientInfo = {
        notes: contact.notes?.map(note => note.body).join('\n\n') || '',
        household: `${contact.firstName} ${contact.lastName}`.trim(),
        email: contact.email || '',
      }
    } else {
      clientInfo = { notes, household: household || '', email: '' }
    }

    const systemPrompt = `You are a legacy planning consultant assistant for Latimore Life & Legacy LLC. 
Your role is to rapidly synthesize client information into actionable insights for Jackson's sales calls.
Focus on family protection, legacy planning, and insurance solutions appropriate for Central PA.
Be empathetic, practical, and solution-oriented.`

    const userPrompt = `Client Context:
Household: ${clientInfo.household}
Email: ${clientInfo.email}
Notes: ${clientInfo.notes || '(No notes provided yet)'}

Generate a quick client snapshot to prepare for this conversation.`

    const result = await createOpenAIJsonCompletion({
      system: systemPrompt,
      user: userPrompt,
      schemaName: 'ClientSnapshot',
      schema: SNAPSHOT_SCHEMA,
      temperature: 0.7,
    })

    return Response.json(result.output)
  } catch (error) {
    console.error('Client snapshot error:', error)
    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to generate snapshot' },
      { status: 500 }
    )
  }
}
