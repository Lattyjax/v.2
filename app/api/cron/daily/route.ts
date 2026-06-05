import { NextRequest, NextResponse } from 'next/server'
import { requireCronAuth } from '@/lib/ai/shared'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 300

type TaskResult = {
  task: string
  ok: boolean
  status?: number
  data?: unknown
  error?: string
  durationMs: number
}

async function runTask(name: string, url: string, req: NextRequest): Promise<TaskResult> {
  const start = Date.now()
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'x-cron-secret': process.env.CRON_SECRET ?? '',
        'x-forwarded-for': req.headers.get('x-forwarded-for') ?? '',
      },
    })
    const data = await res.json().catch(() => null)
    return { task: name, ok: res.ok, status: res.status, data, durationMs: Date.now() - start }
  } catch (err) {
    return {
      task: name,
      ok: false,
      error: err instanceof Error ? err.message : String(err),
      durationMs: Date.now() - start,
    }
  }
}

export async function GET(req: NextRequest) {
  const authError = requireCronAuth(req)
  if (authError) return authError

  const baseUrl = process.env.NEXTAUTH_URL
    ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

  logger.info('[cron/daily] Starting daily master cron')
  const cronStart = Date.now()

  const results: TaskResult[] = []
  results.push(await runTask('daily-brief',           `${baseUrl}/api/cron/daily-brief`,           req))
  results.push(await runTask('lead-score-updates',    `${baseUrl}/api/cron/lead-score-updates`,    req))
  results.push(await runTask('appointment-reminders', `${baseUrl}/api/cron/appointment-reminders`, req))
  results.push(await runTask('notification-checks',   `${baseUrl}/api/cron/notification-checks`,   req))

  const totalMs   = Date.now() - cronStart
  const succeeded = results.filter(r => r.ok).length
  const failed    = results.filter(r => !r.ok)

  if (failed.length > 0) logger.warn({ failed }, '[cron/daily] Some tasks failed')
  logger.info({ succeeded, total: results.length, totalMs }, '[cron/daily] Complete')

  return NextResponse.json({
    ok: failed.length === 0,
    summary: `${succeeded}/${results.length} tasks succeeded`,
    totalDurationMs: totalMs,
    results,
  })
}
