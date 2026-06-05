import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { timingSafeEqual } from 'node:crypto'
import { AiRunStatus, AiRunType } from '@prisma/client'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { rateLimit } from '@/lib/rate-limit'
import { logger } from '@/lib/logger'
import type { Prisma } from '@prisma/client'

export async function requireAdminSession() {
  if (process.env.DISABLE_ADMIN_AUTH === 'true') return { ok: true as const, session: null }
  const session = await getServerSession(authOptions)
  if (!session) {
    return {
      ok: false as const,
      response: NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 }),
    }
  }
  return { ok: true as const, session }
}

export async function applyAiRateLimit(req: NextRequest) {
  return rateLimit(req, 'reports')
}

export function requireCronAuth(req: NextRequest): NextResponse | null {
  const secret = process.env.CRON_SECRET
  const header =
    req.headers.get('x-cron-secret') ??
    req.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
  if (!secret || !header) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
  }
  const secretBuf = Buffer.from(secret)
  const headerBuf = Buffer.from(header)
  const valid =
    secretBuf.length === headerBuf.length && timingSafeEqual(secretBuf, headerBuf)
  if (!valid) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
  }
  return null
}

export async function createAiRun(input: {
  type: AiRunType
  contactId?: string | null
  inquiryId?: string | null
  input: Record<string, unknown>
  model?: string
}) {
  return prisma.aiRun.create({
    data: {
      type: input.type,
      status: AiRunStatus.running,
      contactId: input.contactId ?? undefined,
      inquiryId: input.inquiryId ?? undefined,
      input: input.input as Prisma.InputJsonValue,
      model: input.model,
    },
  })
}

export async function completeAiRun(input: {
  aiRunId: string
  output: Record<string, unknown>
  model?: string
  tokensInput?: number
  tokensOutput?: number
  latencyMs?: number
}) {
  return prisma.aiRun.update({
    where: { id: input.aiRunId },
    data: {
      status: AiRunStatus.succeeded,
      output: input.output as Prisma.InputJsonValue,
      model: input.model,
      tokensInput: input.tokensInput,
      tokensOutput: input.tokensOutput,
      latencyMs: input.latencyMs,
    },
  })
}

export async function failAiRun(input: { aiRunId?: string; error: unknown }) {
  const message = input.error instanceof Error ? input.error.message : String(input.error)
  if (input.aiRunId) {
    try {
      await prisma.aiRun.update({
        where: { id: input.aiRunId },
        data: { status: AiRunStatus.failed, error: message },
      })
    } catch (error) {
      logger.error({ error, aiRunId: input.aiRunId }, 'Failed updating ai run')
    }
  }
  return NextResponse.json({ ok: false, error: message }, { status: 500 })
}

export async function createSystemAiEvent(input: {
  type: string
  contactId?: string | null
  inquiryId?: string | null
  payload: Record<string, unknown>
}) {
  try {
    await prisma.systemEvent.create({
      data: {
        type: input.type,
        contactId: input.contactId ?? undefined,
        inquiryId: input.inquiryId ?? undefined,
        payload: input.payload as Prisma.InputJsonValue,
      },
    })
  } catch (error) {
    logger.error({ error, input }, 'Failed creating system event')
  }
}

export function toIso(value?: Date | string | null): string | null {
  if (!value) return null
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date.toISOString()
}
