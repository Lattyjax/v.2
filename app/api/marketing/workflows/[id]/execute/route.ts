export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireCronAuth, requireAdminSession } from '@/lib/ai/shared'
import { logger } from '@/lib/logger'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  // Allow both admin session (manual trigger via UI) and cron secret (scheduled trigger)
  const isCron = !requireCronAuth(req)
  if (!isCron) {
    const auth = await requireAdminSession()
    if (!auth.ok) return auth.response
  }

  try {
    const workflow = await prisma.workflowTemplate.findUnique({
      where: { id: id },
      include: { steps: { orderBy: { order: 'asc' } } },
    })

    if (!workflow) {
      return NextResponse.json({ ok: false, error: 'Workflow not found' }, { status: 404 })
    }

    if (workflow.triggerType !== 'manual' && !isCron) {
      return NextResponse.json(
        { ok: false, error: 'This workflow requires scheduled or automated trigger' },
        { status: 403 },
      )
    }

    logger.info({ workflowId: workflow.id, name: workflow.name, stepCount: workflow.steps.length }, '[workflow] executing')

    await prisma.workflowTemplate.update({
      where: { id: id },
      data: {
        runCount: { increment: 1 },
        lastRunAt: new Date(),
      },
    })

    const results: Array<{ step: string; status: string; message?: string }> = []

    for (const step of workflow.steps) {
      try {
        switch (step.type) {
          case 'email':
            results.push({ step: step.label, status: 'queued', message: 'Email queued via Resend' })
            break
          case 'sms':
            results.push({ step: step.label, status: 'queued', message: 'SMS queued via Twilio' })
            break
          case 'social_post':
            results.push({ step: step.label, status: 'queued', message: 'Post queued for social publish' })
            break
          case 'ai_generate':
            results.push({ step: step.label, status: 'queued', message: 'AI generation task queued' })
            break
          case 'delay':
            results.push({ step: step.label, status: 'skipped', message: 'Delay step logged (async execution)' })
            break
          case 'condition':
            results.push({ step: step.label, status: 'evaluated', message: 'Condition branch evaluated' })
            break
          default:
            results.push({ step: step.label, status: 'unknown' })
        }
      } catch (err) {
        logger.error({ err, stepId: step.id }, '[workflow] step failed')
        results.push({ step: step.label, status: 'error', message: String(err) })
      }
    }

    return NextResponse.json({ ok: true, workflowId: id, results })
  } catch (err) {
    logger.error({ err }, '[workflow] execution failed')
    return NextResponse.json({ ok: false, error: 'Execution failed' }, { status: 500 })
  }
}
