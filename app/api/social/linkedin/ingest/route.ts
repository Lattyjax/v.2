import { NextRequest, NextResponse } from 'next/server'
import { verifyLinkedInBridgeToken, normalizeLinkedInLead } from '@/lib/social/linkedin'
import { upsertSocialLead } from '@/lib/social/upsert-social-lead'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (!verifyLinkedInBridgeToken(auth)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  let body: Record<string, unknown> | Record<string, unknown>[]
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 })
  }

  const leads = Array.isArray(body) ? body : [body]
  const results: Array<{ id: string; status: string }> = []

  for (const raw of leads) {
    const externalId = String(raw.id ?? raw.leadId ?? '')
    try {
      const normalized = normalizeLinkedInLead(raw)
      await upsertSocialLead(normalized)
      results.push({ id: externalId, status: 'ok' })
    } catch (e) {
      results.push({ id: externalId, status: String(e instanceof Error ? e.message : e).slice(0, 100) })
    }
  }

  return NextResponse.json({ ok: true, processed: results.length, results })
}
