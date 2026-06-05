import { NextResponse } from 'next/server'
import { requireAdminSession } from '@/lib/ai/shared'
import { buildWeeklyReport } from '@/lib/reports/weekly-report'
import { weeklyReportToPdfBuffer } from '@/lib/reports/pdf'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  const auth = await requireAdminSession()
  if (!auth.ok) return auth.response

  const { analysis, totals, weekStart, weekEnd } = await buildWeeklyReport()
  const pdf = weeklyReportToPdfBuffer(analysis, { weekStart, weekEnd, totals })

  const filename = `weekly-report-${weekStart.toISOString().slice(0, 10)}.pdf`

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': String(pdf.length),
    },
  })
}
