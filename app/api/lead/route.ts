export const dynamic = 'force-dynamic'
export { handleOptions as OPTIONS } from '@/lib/hub/cors'
import { NextRequest, NextResponse } from 'next/server'
import { withCors } from '@/lib/hub/cors'
import { upsertLead } from '@/lib/hub/upsert-lead'
import { rateLimit } from '@/lib/rate-limit'
import { LeadIngestSchema } from '@/lib/schemas'
import { logger } from '@/lib/logger'

export const POST = withCors(async (req: NextRequest) => {
  const limited = await rateLimit(req, 'lead')
  if (limited) return limited

  const body = await req.json().catch(() => null)
  const parse = LeadIngestSchema.safeParse(body)
  if (!parse.success) return NextResponse.json({ ok: false, error: parse.error.flatten() }, { status: 422 })

  try {
    const { contact, inquiry } = await upsertLead(parse.data)
    return NextResponse.json({ ok: true, contactId: contact.id, inquiryId: inquiry.id })
  } catch (err: any) {
    logger.error({ err: err.message }, 'Lead ingest error')
    return NextResponse.json({ ok: false, error: 'server error' }, { status: 500 })
  }
})
