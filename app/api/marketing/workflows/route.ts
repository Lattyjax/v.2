export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { rateLimit } from '@/lib/rate-limit'
import { requireAdminSession } from '@/lib/ai/shared'

const StepSchema = z.object({
  order: z.number().int().min(0),
  type: z.enum(['email', 'sms', 'social_post', 'ai_generate', 'delay', 'condition']),
  label: z.string().min(1).max(200),
  config: z.record(z.unknown()),
})

const CreateWorkflowSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional().nullable(),
  triggerType: z.enum(['manual', 'webhook', 'cron', 'crm_stage']),
  triggerValue: z.string().max(500).optional().nullable(),
  category: z.string().max(100).optional().nullable(),
  tags: z.array(z.string().max(50)).max(10).default([]),
  isActive: z.boolean().default(false),
  steps: z.array(StepSchema).max(20).default([]),
})

export async function GET(req: NextRequest) {
  const auth = await requireAdminSession()
  if (!auth.ok) return auth.response

  const limited = await rateLimit(req, 'inquiries')
  if (limited) return limited

  try {
    const workflows = await prisma.workflowTemplate.findMany({
      include: { steps: { orderBy: { order: 'asc' } } },
      orderBy: [{ isPreset: 'desc' }, { createdAt: 'desc' }],
    })
    return NextResponse.json({ ok: true, workflows })
  } catch {
    return NextResponse.json({ ok: false, error: 'Failed to load workflows' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAdminSession()
  if (!auth.ok) return auth.response

  const limited = await rateLimit(req, 'inquiries')
  if (limited) return limited

  const body = await req.json().catch(() => null)
  const parsed = CreateWorkflowSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.flatten() }, { status: 422 })
  }

  const { steps, ...data } = parsed.data

  try {
    const workflow = await prisma.workflowTemplate.create({
      data: {
        ...data,
        steps: {
          create: steps.map(s => ({
            order: s.order,
            type: s.type,
            label: s.label,
            config: s.config as Prisma.InputJsonValue,
          })),
        },
      },
      include: { steps: { orderBy: { order: 'asc' } } },
    })
    return NextResponse.json({ ok: true, workflow }, { status: 201 })
  } catch {
    return NextResponse.json({ ok: false, error: 'Failed to create workflow' }, { status: 500 })
  }
}
