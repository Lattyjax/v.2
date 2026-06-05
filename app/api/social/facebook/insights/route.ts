import { NextRequest, NextResponse } from 'next/server'
import { requireAdminSession } from '@/lib/ai/shared'
import { getSocialConnection } from '@/lib/social'
import { fetchPageInsights } from '@/lib/social/facebook-oauth'
import { decryptToken } from '@/lib/crypto'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const auth = await requireAdminSession()
  if (!auth.ok) return auth.response

  const { searchParams } = new URL(req.url)
  const period = (searchParams.get('period') ?? 'week') as 'day' | 'week' | 'month' | 'lifetime'
  const metricsParam = searchParams.get('metrics')
  const metrics = metricsParam
    ? metricsParam.split(',')
    : ['page_impressions', 'page_engaged_users', 'page_fans', 'page_post_engagements']

  const connection = await getSocialConnection('facebook')
  const accessToken = decryptToken(connection?.accessToken)

  if (!accessToken || !connection?.externalId) {
    return NextResponse.json(
      { ok: false, error: 'No connected Facebook page found. Connect via the Integrations page.' },
      { status: 400 }
    )
  }

  const insights = await fetchPageInsights(
    connection.externalId,
    accessToken,
    metrics,
    period
  )

  return NextResponse.json({ ok: true, insights })
}
