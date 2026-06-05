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

const PatchSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional().nullable(),
  triggerType: z.enum(['manual', 'webhook', 'cron', 'crm_stage']).optional(),
  triggerValue: z.string().max(500).optional().nullable(),
  category: z.string().max(100).optional().nullable(),
  tags: z.array(z.string().max(50)).max(10).optional(),
  isActive: z.boolean().optional(),
  steps: z.array(StepSchema).max(20).optional(),
})

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const workflow = await prisma.workflowTemplate.findUnique({
      where: { id },
      include: { steps: { orderBy: { order: 'asc' } } },
    })
    if (!workflow) return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 })
    return NextResponse.json({ ok: true, workflow })
  } catch {
    return NextResponse.json({ ok: false, error: 'Failed to load workflow' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const limited = await rateLimit(req, 'inquiries')
  if (limited) return limited
  const { id } = await params

  const body = await req.json().catch(() => null)
  const parsed = PatchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.flatten() }, { status: 422 })
  }

  const { steps, ...data } = parsed.data

  try {
    const workflow = await prisma.$transaction(async tx => {
      if (steps !== undefined) {
        await tx.workflowStep.deleteMany({ where: { workflowId: id } })
        await tx.workflowStep.createMany({
          data: steps.map(s => ({
            workflowId: id,
            order: s.order,
            type: s.type,
            label: s.label,
            config: s.config as Prisma.InputJsonValue,
          })),
        })
      }
      return tx.workflowTemplate.update({
        where: { id },
        data,
        include: { steps: { orderBy: { order: 'asc' } } },
      })
    })
    return NextResponse.json({ ok: true, workflow })
  } catch {
    return NextResponse.json({ ok: false, error: 'Failed to update workflow' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    await prisma.workflowTemplate.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false, error: 'Failed to delete workflow' }, { status: 500 })
  }
}
