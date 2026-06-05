import { prisma } from '@/lib/prisma'
import { computeLeadScore } from '@/lib/ai/lead-score'
import { createOpenAIJsonCompletion } from '@/lib/ai/client'

/**
 * Enhanced lead scoring with AI-driven insights and product recommendations
 */
export async function computeEnhancedLeadScore(input: { contactId?: string | null; inquiryId?: string | null }) {
  if (!input.contactId && !input.inquiryId) throw new Error('contactId or inquiryId is required')

  const inquiry =
    input.inquiryId
      ? await prisma.inquiry.findUnique({ where: { id: input.inquiryId }, include: { contact: true } })
      : null

  const contactId = input.contactId ?? inquiry?.contactId
  if (!contactId) throw new Error('Unable to resolve contact')

  const contact = await prisma.contact.findUnique({
    where: { id: contactId },
    include: {
      inquiries: { orderBy: { updatedAt: 'desc' }, take: 10 },
      tasks: { orderBy: { createdAt: 'desc' }, take: 20 },
      appointments: { orderBy: { createdAt: 'desc' }, take: 20 },
      conversationMessages: { orderBy: { createdAt: 'desc' }, take: 25 },
      systemEvents: { orderBy: { occurredAt: 'desc' }, take: 50 },
    },
  })
  if (!contact) throw new Error('Contact not found')

  // Get the basic score first
  const basicResult = await computeLeadScore(input)
  let score = basicResult.result.total
  const reasons = [...basicResult.result.reasons]
  const recommendations = [...basicResult.result.recommendations]

  // AI Enhancement: Analyze conversation patterns and intent
  try {
    const conversationAnalysis = await analyzeConversationPatterns(contact)
    if (conversationAnalysis.insights.length > 0) {
      reasons.push(...conversationAnalysis.insights)
      score += conversationAnalysis.scoreAdjustment
    }

    // AI Product Recommendations
    const productRecommendations = await generateProductRecommendations(contact, inquiry)
    if (productRecommendations.length > 0) {
      recommendations.push(...productRecommendations.map((r: any) => `Consider: ${r.product} - ${r.reason}`))
    }

    // AI Timing Optimization
    const timingInsights = await analyzeOptimalTiming(contact)
    if (timingInsights.optimalTime) {
      recommendations.push(`Optimal follow-up time: ${timingInsights.optimalTime}`)
    }

    // AI Task Generation
    const autoTasks = await generateAutomatedTasks(contact, inquiry, basicResult.result.category)
    if (autoTasks.length > 0) {
      // Create the tasks automatically
      for (const task of autoTasks) {
        await prisma.task.create({
          data: {
            title: task.title,
            description: task.description,
            status: 'Open',
            dueAt: task.dueAt,
            contactId: contact.id,
            inquiryId: inquiry?.id ?? null,
          },
        })
      }
      recommendations.push(`Created ${autoTasks.length} automated follow-up tasks`)
    }

  } catch (error) {
    console.error('AI enhancement failed, using basic scoring:', error)
    // Fall back to basic scoring if AI fails
  }

  score = Math.max(0, Math.min(100, score))
  const category = score >= 80 ? 'hot' : score >= 60 ? 'warm' : score >= 35 ? 'cool' : 'cold'

  // Update contact with enhanced score
  await prisma.contact.update({
    where: { id: contact.id },
    data: { leadScore: score, lastActivityAt: contact.lastActivityAt ?? undefined },
  })

  if (inquiry) {
    await prisma.inquiry.update({
      where: { id: inquiry.id },
      data: { leadScore: score },
    })
  }

  return {
    contactId: contact.id,
    inquiryId: inquiry?.id ?? null,
    result: {
      total: score,
      category,
      reasons: Array.from(new Set(reasons)),
      recommendations: Array.from(new Set(recommendations)),
      aiEnhanced: true,
    },
  }
}

/**
 * Analyze conversation patterns using AI
 */
async function analyzeConversationPatterns(contact: any) {
  const messages = contact.conversationMessages
  if (messages.length < 3) return { insights: [], scoreAdjustment: 0 }

  const conversationText = messages
    .filter((m: any) => m.direction === 'inbound')
    .map((m: any) => m.bodyText)
    .join('\n')

  if (!conversationText.trim()) return { insights: [], scoreAdjustment: 0 }

  try {
    const response = await createOpenAIJsonCompletion<any>({
      system: `Analyze this conversation history and provide insights about the lead's engagement level and intent. Focus on:
      - Urgency signals
      - Specific needs or pain points
      - Budget indicators
      - Timeline expectations
      - Decision-making style
      Return a JSON object with: { insights: string[], scoreAdjustment: number (-10 to +20) }`,
      user: `Conversation history:\n${conversationText}`,
      schemaName: 'conversation_analysis',
      schema: {
        type: 'object',
        properties: {
          insights: { type: 'array', items: { type: 'string' } },
          scoreAdjustment: { type: 'number', minimum: -10, maximum: 20 }
        },
        required: ['insights', 'scoreAdjustment']
      },
      temperature: 0.3
    })

    const result = response.output
    return {
      insights: result.insights || [],
      scoreAdjustment: Math.max(-10, Math.min(20, result.scoreAdjustment || 0))
    }
  } catch (error) {
    console.error('Conversation analysis failed:', error)
    return { insights: [], scoreAdjustment: 0 }
  }
}

/**
 * Generate AI-powered product recommendations
 */
async function generateProductRecommendations(contact: any, inquiry: any) {
  const context = {
    inquiryType: inquiry?.intent || contact.primaryIntent,
    source: inquiry?.source || contact.primarySource,
    notes: inquiry?.notes || '',
    messages: contact.conversationMessages.filter((m: any) => m.direction === 'inbound').slice(0, 5),
  }

  try {
    const response = await createOpenAIJsonCompletion<any>({
      system: `Based on the lead's inquiry and conversation history, recommend specific insurance products that would fit their needs.
      Consider: life insurance, critical illness, disability, long-term care, annuities.
      Return JSON array of recommendations: [{ product: string, reason: string, confidence: number (0-1) }]`,
      user: `Lead Context:
      - Intent: ${context.inquiryType}
      - Source: ${context.source}
      - Notes: ${context.notes}
      - Recent Messages: ${context.messages.filter((m: any) => m.direction === 'inbound').slice(0, 5).map((m: any) => m.bodyText).join('; ')}`,
      schemaName: 'product_recommendations',
      schema: {
        type: 'object',
        properties: {
          recommendations: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                product: { type: 'string' },
                reason: { type: 'string' },
                confidence: { type: 'number', minimum: 0, maximum: 1 }
              },
              required: ['product', 'reason', 'confidence']
            }
          }
        },
        required: ['recommendations']
      },
      temperature: 0.3
    })

    const result = response.output
    return (result.recommendations || [])
      .filter((r: any) => r.confidence > 0.6)
      .slice(0, 3)
  } catch (error) {
    console.error('Product recommendation failed:', error)
    return []
  }
}

/**
 * Analyze optimal follow-up timing
 */
async function analyzeOptimalTiming(contact: any) {
  const lastActivity = contact.lastActivityAt
  if (!lastActivity) return {}

  const daysSinceActivity = Math.floor((Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24))

  try {
    const response = await createOpenAIJsonCompletion<any>({
      system: `Based on lead activity patterns, suggest optimal follow-up timing.
      Return JSON: { optimalTime: string, reasoning: string }`,
      user: `Days since last activity: ${daysSinceActivity}
      Lead score: ${contact.leadScore}
      Has upcoming appointment: ${contact.appointments.some((a: any) => a.scheduledFor > new Date())}`,
      schemaName: 'followup_timing',
      schema: {
        type: 'object',
        properties: {
          optimalTime: { type: 'string' },
          reasoning: { type: 'string' }
        },
        required: ['optimalTime', 'reasoning']
      },
      temperature: 0.3
    })

    const result = response.output
    return result
  } catch (error) {
    console.error('Timing analysis failed:', error)
    return {}
  }
}

/**
 * Generate automated tasks based on lead analysis
 */
async function generateAutomatedTasks(contact: any, inquiry: any, category: string) {
  const tasks = []

  // Hot leads get immediate tasks
  if (category === 'hot') {
    tasks.push({
      title: 'Immediate follow-up call',
      description: 'High-priority lead requires immediate attention',
      dueAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours
      priority: 'High' as const,
    })
  }

  // Warm leads get scheduled tasks
  else if (category === 'warm') {
    tasks.push({
      title: 'Follow-up email sequence',
      description: 'Send personalized email with product recommendations',
      dueAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day
      priority: 'Medium' as const,
    })
  }

  // Cool leads get nurture tasks
  else if (category === 'cool') {
    tasks.push({
      title: 'Nurture campaign enrollment',
      description: 'Add to educational content drip campaign',
      dueAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
      priority: 'Low' as const,
    })
  }

  // Check for specific triggers
  if (inquiry?.stage === 'Qualified') {
    tasks.push({
      title: 'Prepare quote presentation',
      description: 'Lead is qualified - prepare customized quote',
      dueAt: new Date(Date.now() + 12 * 60 * 60 * 1000), // 12 hours
      priority: 'High' as const,
    })
  }

  if (contact.appointments.some((a: any) => a.scheduledFor > new Date() && a.status === 'Booked')) {
    tasks.push({
      title: 'Appointment preparation',
      description: 'Prepare meeting brief and client materials',
      dueAt: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours
      priority: 'Medium' as const,
    })
  }

  return tasks
}