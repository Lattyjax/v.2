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

  logger.info('[cron/weekly] Starting weekly master cron')
  const cronStart = Date.now()

  const results: TaskResult[] = []
  results.push(await runTask('weekly-report',            `${baseUrl}/api/cron/weekly-report`,            req))
  results.push(await runTask('content-publishing',       `${baseUrl}/api/cron/content-publishing`,       req))
  results.push(await runTask('lead-scoring',             `${baseUrl}/api/cron/lead-scoring`,             req))
  results.push(await runTask('automated-task-generation',`${baseUrl}/api/cron/automated-task-generation`,req))

  const totalMs   = Date.now() - cronStart
  const succeeded = results.filter(r => r.ok).length
  const failed    = results.filter(r => !r.ok)

  if (failed.length > 0) logger.warn({ failed }, '[cron/weekly] Some tasks failed')
  logger.info({ succeeded, total: results.length, totalMs }, '[cron/weekly] Complete')

  return NextResponse.json({
    ok: failed.length === 0,
    summary: `${succeeded}/${results.length} tasks succeeded`,
    totalDurationMs: totalMs,
    results,
  })
}
