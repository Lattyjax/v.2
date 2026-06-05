import { NextRequest, NextResponse } from 'next/server'
import { verifyMetaSignature, fetchMetaLead, normalizeMetaLead } from '@/lib/social/meta'
import { upsertSocialLead } from '@/lib/social/upsert-social-lead'
import type { MetaWebhookEntry } from '@/lib/social/types'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Meta webhook verification (GET)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  const verifyToken = process.env.META_WEBHOOK_VERIFY_TOKEN
  if (mode === 'subscribe' && token === verifyToken && challenge) {
    return new NextResponse(challenge, { status: 200 })
  }
  return NextResponse.json({ error: 'verification failed' }, { status: 403 })
}

// Meta webhook event handler (POST)
export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const signature = req.headers.get('x-hub-signature-256')

  if (!verifyMetaSignature(rawBody, signature)) {
    return NextResponse.json({ error: 'invalid signature' }, { status: 401 })
  }

  let body: { object?: string; entry?: MetaWebhookEntry[] }
  try {
    body = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 })
  }

  if (body.object !== 'page') {
    return NextResponse.json({ ok: true, skipped: true })
  }

  const results: Array<{ leadgenId: string; status: string }> = []

  for (const entry of body.entry ?? []) {
    for (const change of entry.changes ?? []) {
      if (change.field !== 'leadgen') continue
      const leadgenId = change.value?.leadgen_id
      if (!leadgenId) continue

      try {
        const rawLead = await fetchMetaLead(leadgenId, undefined, change.value?.page_id)
        const normalized = normalizeMetaLead(rawLead, 'facebook')
        await upsertSocialLead(normalized)
        results.push({ leadgenId, status: 'ok' })
      } catch (e) {
        results.push({ leadgenId, status: String(e instanceof Error ? e.message : e).slice(0, 100) })
      }
    }
  }

  return NextResponse.json({ ok: true, processed: results.length, results })
}
