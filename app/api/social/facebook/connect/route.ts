import { NextRequest, NextResponse } from 'next/server'
import { requireAdminSession } from '@/lib/ai/shared'
import { buildFacebookOAuthUrl } from '@/lib/social/facebook-oauth'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const auth = await requireAdminSession()
  if (!auth.ok) return auth.response

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? `https://${req.headers.get('host')}`
  const redirectUri = `${baseUrl}/api/social/facebook/callback`

  // Use a random state value to prevent CSRF
  const state = crypto.randomUUID()
  const oauthUrl = buildFacebookOAuthUrl(redirectUri, state)

  const response = NextResponse.redirect(oauthUrl)
  // Store state in a short-lived cookie for verification in the callback
  response.cookies.set('fb_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600,
    path: '/',
  })
  return response
}
