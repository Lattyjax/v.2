export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { AiRunType } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { createOpenAIJsonCompletion } from '@/lib/ai/client'
import { applyAiRateLimit, completeAiRun, createAiRun, createSystemAiEvent, failAiRun, requireAdminSession } from '@/lib/ai/shared'
import { countAll } from '@/lib/prisma-helpers'


const BodySchema = z.object({ limit: z.number().int().min(3).max(25).default(10).optional() })

const schema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    summary: { type: 'string' },
    hotLeads: { type: 'array', items: { type: 'object', additionalProperties: false, properties: { contactId: { type: 'string' }, inquiryId: { type: ['string', 'null'] }, name: { type: 'string' }, stage: { type: ['string', 'null'] }, reason: { type: 'string' }, recommendedAction: { type: 'string' } }, required: ['contactId', 'inquiryId', 'name', 'stage', 'reason', 'recommendedAction'] } },
    atRiskLeads: { type: 'array', items: { type: 'object', additionalProperties: false, properties: { contactId: { type: 'string' }, inquiryId: { type: ['string', 'null'] }, name: { type: 'string' }, stage: { type: ['string', 'null'] }, risk: { type: 'string' }, recommendedAction: { type: 'string' } }, required: ['contactId', 'inquiryId', 'name', 'stage', 'risk', 'recommendedAction'] } },
    overdueTasks: { type: 'array', items: { type: 'object', additionalProperties: false, properties: { taskId: { type: 'string' }, title: { type: 'string' }, contactName: { type: ['string', 'null'] }, dueAt: { type: ['string', 'null'] } }, required: ['taskId', 'title', 'contactName', 'dueAt'] } },
    pipelineInsights: { type: 'array', items: { type: 'string' } },
    recommendedFocus: { type: 'array', items: { type: 'string' } },
  },
  required: ['summary', 'hotLeads', 'atRiskLeads', 'overdueTasks', 'pipelineInsights', 'recommendedFocus'],
}

const displayName = (contact: any) => contact.fullName || [contact.firstName, contact.lastName].filter(Boolean).join(' ') || contact.email || contact.phone || 'Unknown Contact'

export async function POST(req: NextRequest) {
  const limited = await applyAiRateLimit(req)
  if (limited) return limited
  const cronSecret = process.env.CRON_SECRET
  const isCron = cronSecret && req.headers.get("x-cron-secret") === cronSecret
  if (!isCron) {
    const auth = await requireAdminSession()
    if (!auth.ok) return auth.response
  }

  const body = await req.json().catch(() => ({}))
  const parsed = BodySchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ ok: false, error: parsed.error.flatten() }, { status: 422 })

  let aiRunId: string | undefined
  try {
    const limit = parsed.data.limit ?? 10
    const now = new Date()
    const staleCutoff = new Date(now.getTime() - 14 * 86400000)
    const [topContacts, staleInquiries, overdueTasks, stageCounts] = await Promise.all([
      prisma.contact.findMany({ orderBy: [{ leadScore: 'desc' }, { lastActivityAt: 'desc' }], take: limit, include: { inquiries: { orderBy: { updatedAt: 'desc' }, take: 1 } } }),
      prisma.inquiry.findMany({ where: { updatedAt: { lt: staleCutoff }, stage: { in: ['New', 'Attempted_Contact', 'Qualified', 'Booked', 'Follow_Up'] } }, orderBy: { updatedAt: 'asc' }, take: limit, include: { contact: true } }),
      prisma.task.findMany({ where: { dueAt: { lt: now }, status: { in: ['Open', 'In_Progress', 'Snoozed'] } }, orderBy: { dueAt: 'asc' }, take: limit, include: { contact: true } }),
      prisma.inquiry.groupBy({ by: ['stage'], _count: { _all: true } }),
    ])

    const context = {
      generatedAt: now.toISOString(),
      topContacts: topContacts.map((contact) => ({
        contactId: contact.id,
        name: displayName(contact),
        leadScore: contact.leadScore,
        lastActivityAt: contact.lastActivityAt?.toISOString() ?? null,
        nextFollowUpAt: contact.nextFollowUpAt?.toISOString() ?? null,
        primarySource: contact.primarySource,
        inquiry: contact.inquiries[0] ? { inquiryId: contact.inquiries[0].id, stage: contact.inquiries[0].stage, productInterest: contact.inquiries[0].productInterest, updatedAt: contact.inquiries[0].updatedAt.toISOString() } : null,
      })),
      staleInquiries: staleInquiries.map((inquiry) => ({
        inquiryId: inquiry.id,
        contactId: inquiry.contactId,
        name: displayName(inquiry.contact),
        stage: inquiry.stage,
        updatedAt: inquiry.updatedAt.toISOString(),
        leadScore: inquiry.leadScore,
        productInterest: inquiry.productInterest,
      })),
      overdueTasks: overdueTasks.map((task) => ({
        taskId: task.id,
        title: task.title,
        dueAt: task.dueAt?.toISOString() ?? null,
        status: task.status,
        contactName: task.contact ? displayName(task.contact) : null,
      })),
      stageCounts: stageCounts.map((row) => ({ stage: row.stage, count: countAll(row._count)})),
    }

    const aiRun = await createAiRun({ type: AiRunType.daily_brief, input: context as unknown as Record<string, unknown> })
    aiRunId = aiRun.id

    const completion = await createOpenAIJsonCompletion<any>({
      system: 'You are the Legacy AI Advisor generating a daily operating brief for an insurance business. Prioritize practical action over fluff and use only the provided data.',
      user: JSON.stringify({ task: 'Generate the daily advisor brief', context }),
      schemaName: 'daily_brief',
      schema,
      temperature: 0.15,
    })

    const output = { generatedAt: now.toISOString(), brief: completion.output }
    await completeAiRun({ aiRunId, output: output as Record<string, unknown>, model: completion.model, tokensInput: completion.usage?.input_tokens, tokensOutput: completion.usage?.output_tokens })
    await createSystemAiEvent({ type: 'ai.daily_brief.completed', payload: output as Record<string, unknown> })
    return NextResponse.json({ ok: true, ...output })
  } catch (error) {
    return failAiRun({ aiRunId, error })
  }
}
