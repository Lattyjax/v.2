import { prisma } from '@/lib/prisma'
import { encryptToken, decryptToken } from '@/lib/crypto'

const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'
const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo'

function required(name: string, value?: string | null) {
  if (!value) throw new Error(`Missing required env var: ${name}`)
  return value
}

export function getGoogleCalendarScopes() {
  return [
    'https://www.googleapis.com/auth/calendar.readonly',
    'https://www.googleapis.com/auth/calendar.events',
    'https://www.googleapis.com/auth/userinfo.email',
  ]
}

export function buildGoogleCalendarAuthUrl(state: string) {
  const clientId = required('GOOGLE_CLIENT_ID', process.env.GOOGLE_CLIENT_ID)
  const redirectUri = required('GOOGLE_CALENDAR_REDIRECT_URI', process.env.GOOGLE_CALENDAR_REDIRECT_URI)

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    access_type: 'offline',
    prompt: 'consent',
    include_granted_scopes: 'true',
    scope: getGoogleCalendarScopes().join(' '),
    state,
  })

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
}

export async function exchangeGoogleCalendarCode(code: string) {
  const clientId = required('GOOGLE_CLIENT_ID', process.env.GOOGLE_CLIENT_ID)
  const clientSecret = required('GOOGLE_CLIENT_SECRET', process.env.GOOGLE_CLIENT_SECRET)
  const redirectUri = required('GOOGLE_CALENDAR_REDIRECT_URI', process.env.GOOGLE_CALENDAR_REDIRECT_URI)

  const body = new URLSearchParams({
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    grant_type: 'authorization_code',
  })

  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
    cache: 'no-store',
  })

  const data = await res.json()
  if (!res.ok) {
    throw new Error(data?.error_description || data?.error || 'Failed to exchange Google auth code')
  }

  return data as {
    access_token: string
    expires_in?: number
    refresh_token?: string
    scope?: string
    token_type?: string
    id_token?: string
  }
}

export async function fetchGoogleUserInfo(accessToken: string) {
  const res = await fetch(GOOGLE_USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  })

  const data = await res.json()
  if (!res.ok) throw new Error(data?.error?.message || 'Failed to fetch Google user info')

  return data as {
    id?: string
    email?: string
    verified_email?: boolean
  }
}

export async function upsertGoogleCalendarConnection(input: {
  accessToken: string
  refreshToken?: string | null
  expiresIn?: number | null
  accountEmail?: string | null
  externalId?: string | null
}) {
  const existing = await prisma.calendarConnection.findFirst({
    where: { provider: 'google' },
    orderBy: { updatedAt: 'desc' },
  })

  const tokenExpiresAt =
    input.expiresIn && Number.isFinite(input.expiresIn)
      ? new Date(Date.now() + input.expiresIn * 1000)
      : null

  if (existing) {
    return prisma.calendarConnection.update({
      where: { id: existing.id },
      data: {
        accountEmail: input.accountEmail ?? existing.accountEmail,
        externalId: input.externalId ?? existing.externalId,
        accessToken: encryptToken(input.accessToken),
        refreshToken: input.refreshToken != null
          ? encryptToken(input.refreshToken)
          : existing.refreshToken,
        tokenExpiresAt,
        metadata: {
          connectedAt: new Date().toISOString(),
        },
      },
    })
  }

  return prisma.calendarConnection.create({
    data: {
      provider: 'google',
      accountEmail: input.accountEmail ?? undefined,
      externalId: input.externalId ?? undefined,
      accessToken: encryptToken(input.accessToken),
      refreshToken: input.refreshToken != null ? encryptToken(input.refreshToken) : undefined,
      tokenExpiresAt,
      metadata: {
        connectedAt: new Date().toISOString(),
      },
    },
  })
}

export async function getGoogleCalendarConnection() {
  return prisma.calendarConnection.findFirst({
    where: { provider: 'google' },
    orderBy: { updatedAt: 'desc' },
  })
}

export async function refreshGoogleAccessToken(refreshToken: string) {
  const clientId = required('GOOGLE_CLIENT_ID', process.env.GOOGLE_CLIENT_ID)
  const clientSecret = required('GOOGLE_CLIENT_SECRET', process.env.GOOGLE_CLIENT_SECRET)

  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
    grant_type: 'refresh_token',
  })

  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
    cache: 'no-store',
  })

  const data = await res.json()
  if (!res.ok) {
    throw new Error(data?.error_description || data?.error || 'Failed to refresh Google access token')
  }

  return data as {
    access_token: string
    expires_in?: number
    scope?: string
    token_type?: string
  }
}

export async function getValidGoogleAccessToken() {
  const connection = await getGoogleCalendarConnection()
  if (!connection?.accessToken) throw new Error('Google Calendar is not connected')

  const now = Date.now()
  const expiresAt = connection.tokenExpiresAt?.getTime() ?? 0
  const stillValid = expiresAt > now + 60_000

  const accessToken = decryptToken(connection.accessToken)
  if (!accessToken) throw new Error('Google Calendar access token could not be decrypted')

  if (stillValid) return accessToken

  const refreshToken = decryptToken(connection.refreshToken)
  if (!refreshToken) throw new Error('Google Calendar refresh token is missing')

  const refreshed = await refreshGoogleAccessToken(refreshToken)
  const tokenExpiresAt =
    refreshed.expires_in && Number.isFinite(refreshed.expires_in)
      ? new Date(Date.now() + refreshed.expires_in * 1000)
      : null

  await prisma.calendarConnection.update({
    where: { id: connection.id },
    data: {
      accessToken: encryptToken(refreshed.access_token),
      tokenExpiresAt,
    },
  })

  return refreshed.access_token
}