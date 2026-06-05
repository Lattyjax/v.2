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
    const recipient = String(body.recipient || 'My Loved Ones').slice(0, 200)
    const message = String(body.message || '').slice(0, 1000)
    const tone = String(body.tone || 'Heartfelt and loving').slice(0, 100)

    const system = 'You are a thoughtful and eloquent assistant helping a user write a Legacy Letter to their loved ones. Focus on emotional depth, core values, love, preparedness, and legacy. Do not include placeholders like [Your Name]. Write only the body of the letter. Keep it between 100 and 200 words.'
    const user = `Write a legacy letter addressed to: ${recipient}. The core values or lesson to convey is: "${message}". The tone of the letter should be: ${tone}.`

    const text = await createTextCompletion({ system, user, temperature: 0.8 })
    return NextResponse.json({ ok: true, text })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Legacy letter generation failed.' },
      { status: 500 }
    )
  }
}
