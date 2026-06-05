import { NextRequest, NextResponse } from 'next/server'
import { requireAdminSession } from '@/lib/ai/shared'
import {
  exchangeCodeForToken,
  getLongLivedUserToken,
  getUserPages,
} from '@/lib/social/facebook-oauth'
import { prisma } from '@/lib/prisma'
import { encryptToken } from '@/lib/crypto'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const auth = await requireAdminSession()
  if (!auth.ok) return auth.response

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? `https://${req.headers.get('host')}`
  const { searchParams } = new URL(req.url)

  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  if (error) {
    const desc = searchParams.get('error_description') ?? error
    return NextResponse.redirect(`${baseUrl}/admin/connectors?fb_error=${encodeURIComponent(desc)}`)
  }

  // Verify CSRF state
  const storedState = req.cookies.get('fb_oauth_state')?.value
  if (!state || !storedState || state !== storedState) {
    return NextResponse.redirect(`${baseUrl}/admin/connectors?fb_error=invalid_state`)
  }

  if (!code) {
    return NextResponse.redirect(`${baseUrl}/admin/connectors?fb_error=missing_code`)
  }

  try {
    const redirectUri = `${baseUrl}/api/social/facebook/callback`

    // Exchange code → short-lived user token → long-lived user token
    const shortLivedToken = await exchangeCodeForToken(code, redirectUri)
    const { token: longLivedToken, expiresIn } = await getLongLivedUserToken(shortLivedToken)

    // Fetch all pages this user manages
    const pages = await getUserPages(longLivedToken)

    const socialConnectionModel = (prisma as any).socialConnection

    // Upsert each page as a separate facebook SocialConnection
    await Promise.all(
      pages.map(async (page) => {
        const expiresAt = new Date(Date.now() + expiresIn * 1000)
        const data = {
          provider: 'facebook',
          accountName: page.name,
          externalId: page.id,
          accessToken: encryptToken(page.access_token),
          tokenExpiresAt: expiresAt,
          status: 'connected',
          metadata: {
            category: page.category,
            tasks: page.tasks ?? [],
            connectedBy: auth.session?.user?.email ?? null,
          },
        }
        const existing = await socialConnectionModel.findFirst({
          where: { provider: 'facebook', externalId: page.id },
        })
        return existing
          ? socialConnectionModel.update({ where: { id: existing.id }, data })
          : socialConnectionModel.create({ data })
      })
    )

    const response = NextResponse.redirect(
      `${baseUrl}/admin/connectors?fb_success=${encodeURIComponent(`Connected ${pages.length} page(s)`)}`
    )
    response.cookies.delete('fb_oauth_state')
    return response
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.redirect(`${baseUrl}/admin/connectors?fb_error=${encodeURIComponent(msg)}`)
  }
}
