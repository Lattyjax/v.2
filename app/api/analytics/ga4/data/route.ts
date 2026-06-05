export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminSession } from '@/lib/ai/shared'

type GoogleRefreshTokenResponse = {
  access_token?: string
  error?: string
  error_description?: string
}

type GaRunReportResponse = {
  rows?: Array<{
    dimensionValues?: Array<{ value: string }>
    metricValues?: Array<{ value: string }>
  }>
  error?: unknown
}

async function getAccessToken(refreshToken: string) {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new Error('Google OAuth credentials are not configured')
  }

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'refresh_token',
    }),
  })

  const data = (await res.json()) as GoogleRefreshTokenResponse

  if (!res.ok || !data.access_token) {
    throw new Error(data.error_description || data.error || 'Failed to refresh GA4 access token')
  }

  return data.access_token
}

function formatDate(value: string) {
  return /^\d{8}$/.test(value)
    ? `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`
    : value
}

export async function GET() {
  const authResult = await requireAdminSession()
  if (authResult instanceof Response) return authResult

  try {
    const event = await prisma.systemEvent.findFirst({
      where: { type: 'GA4_CONNECTED' },
      orderBy: { createdAt: 'desc' },
    })

    if (!event) {
      return NextResponse.json({ error: 'GA4 not connected' }, { status: 401 })
    }

    const payload = event.payload as { refresh_token?: string } | null
    const refreshToken = payload?.refresh_token

    if (!refreshToken) {
      return NextResponse.json({ error: 'GA4 refresh token not found' }, { status: 401 })
    }

    const propertyId = process.env.GA4_PROPERTY_ID
    if (!propertyId) {
      return NextResponse.json({ error: 'GA4 property ID is not configured' }, { status: 500 })
    }

    const accessToken = await getAccessToken(refreshToken)

    const gaRes = await fetch(
      `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
          metrics: [
            { name: 'sessions' },
            { name: 'activeUsers' },
            { name: 'screenPageViews' },
          ],
          dimensions: [{ name: 'date' }],
          orderBys: [{ dimension: { dimensionName: 'date' } }],
        }),
      }
    )

    const gaData = (await gaRes.json()) as GaRunReportResponse

    if (!gaRes.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch GA4 report', details: gaData },
        { status: gaRes.status }
      )
    }

    const rows = gaData.rows?.map((row) => ({
      date: formatDate(row.dimensionValues?.[0]?.value ?? ''),
      sessions: Number(row.metricValues?.[0]?.value ?? 0),
      activeUsers: Number(row.metricValues?.[1]?.value ?? 0),
      screenPageViews: Number(row.metricValues?.[2]?.value ?? 0),
    })) ?? []

    return NextResponse.json({
      ok: true,
      propertyId,
      range: { startDate: '30daysAgo', endDate: 'today' },
      data: rows,
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unexpected GA4 error' },
      { status: 500 }
    )
  }
}
