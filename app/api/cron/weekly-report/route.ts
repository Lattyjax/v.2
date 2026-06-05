import { NextRequest, NextResponse } from 'next/server'
import { requireCronAuth } from '@/lib/ai/shared'
import { buildWeeklyReport } from '@/lib/reports/weekly-report'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const authError = requireCronAuth(req)
  if (authError) return authError

  try {
    const { report, analysis } = await buildWeeklyReport()

    await prisma.systemEvent.create({
      data: {
        type: 'cron.weekly_report.completed',
        payload: {
          reportId:  report.id,
          weekStart: report.weekStart,
          weekEnd:   report.weekEnd,
        },
      },
    })

    return NextResponse.json({
      ok: true,
      message: 'Weekly report generated',
      reportId: report.id,
      weekStart: report.weekStart,
      weekEnd:   report.weekEnd,
      analysis,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[cron/weekly-report]', msg)
    return NextResponse.json({ ok: false, error: msg }, { status: 500 })
  }
}
