export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { requireAdminSession } from '@/lib/ai/shared'

export async function POST(req: NextRequest) {
  const auth = await requireAdminSession()
  if (!auth.ok) return auth.response

  const body = await req.json()
  const upstream = await fetch(new URL('/api/admin/ai/campaign', req.url).href, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', cookie: req.headers.get('cookie') ?? '' },
    body: JSON.stringify({ goal: body.goal, persona: body.persona }),
  })
  const data = await upstream.json()
  return NextResponse.json({ results: data.posts ?? data ?? [] }, { status: upstream.status })
}
