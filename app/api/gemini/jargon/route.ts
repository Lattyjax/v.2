import { NextRequest, NextResponse } from 'next/server'
import { createTextCompletion } from '@/lib/ai/client'
import { rateLimit } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const limited = await rateLimit(req, 'default')
  if (limited) return limited

  try {
    const body = await req.json()
    const jargon = String(body.jargon || '').trim().slice(0, 1000)
    if (!jargon) return NextResponse.json({ ok: false, error: 'Missing term or phrase.' }, { status: 400 })

    const system = 'You are an expert, friendly life insurance and financial planning assistant. Explain confusing insurance or financial terms in simple, plain English that an average 8th grader can understand. Keep the explanation under 3 sentences. Use a simple analogy when helpful. Do not give legal, tax, or individualized financial advice.'
    const text = await createTextCompletion({ system, user: jargon, temperature: 0.5 })
    return NextResponse.json({ ok: true, text })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Jargon translation failed.' },
      { status: 500 }
    )
  }
}
