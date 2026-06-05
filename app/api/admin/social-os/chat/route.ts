export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { requireAdminSession } from '@/lib/ai/shared'

export async function POST(req: NextRequest) {
  const auth = await requireAdminSession()
  if (!auth.ok) return auth.response

  const body = await req.json()
  const upstream = await fetch(new URL('/api/admin/ai/chat', req.url).href, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', cookie: req.headers.get('cookie') ?? '' },
    body: JSON.stringify({ message: body.message, mode: 'chat', history: body.history ?? [] }),
  })
  const data = await upstream.json()
  return NextResponse.json({ response: data.data ?? '' }, { status: upstream.status })
}
