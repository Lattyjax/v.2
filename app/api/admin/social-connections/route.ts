export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminSession } from '@/lib/ai/shared'
import { encryptToken } from '@/lib/crypto'

export async function GET() {
  const auth = await requireAdminSession()
  if (!auth.ok) return auth.response

  const socialConnectionModel = (prisma as any).socialConnection
  if (!socialConnectionModel) {
    return NextResponse.json(
      { success: false, error: 'SocialConnection model unavailable. Run prisma generate after schema changes.' },
      { status: 501 },
    )
  }

  const connections = await socialConnectionModel.findMany({ orderBy: { updatedAt: 'desc' } })
  return NextResponse.json({ success: true, connections })
}

export async function POST(req: NextRequest) {
  const auth = await requireAdminSession()
  if (!auth.ok) return auth.response

  const body = await req.json()
  const {
    provider,
    accountName,
    externalId,
    accessToken,
    refreshToken,
    tokenExpiresAt,
    metadata,
    status,
  } = body

  if (!provider) {
    return NextResponse.json({ success: false, error: 'provider is required' }, { status: 400 })
  }

  const data: any = {
    provider,
    accountName: accountName || undefined,
    externalId: externalId || undefined,
    accessToken: accessToken ? encryptToken(accessToken) : undefined,
    refreshToken: refreshToken ? encryptToken(refreshToken) : undefined,
    metadata: metadata || undefined,
    status: status || undefined,
  }

  if (tokenExpiresAt) {
    const expiresAt = new Date(tokenExpiresAt)
    if (!Number.isNaN(expiresAt.getTime())) {
      data.tokenExpiresAt = expiresAt
    }
  }

  const socialConnectionModel = (prisma as any).socialConnection
  if (!socialConnectionModel) {
    return NextResponse.json(
      { success: false, error: 'SocialConnection model unavailable. Run prisma generate after schema changes.' },
      { status: 501 },
    )
  }

  const existing = await socialConnectionModel.findFirst({
    where: {
      provider,
      externalId: externalId || undefined,
    },
  })

  const connection = existing
    ? await socialConnectionModel.update({
        where: { id: existing.id },
        data,
      })
    : await socialConnectionModel.create({ data })

  return NextResponse.json({ success: true, connection })
}
