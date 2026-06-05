export const dynamic = 'force-dynamic'

import { NextRequest } from 'next/server'
import { POST as runDailyBrief } from '@/app/api/ai/daily-brief/route'
import { requireCronAuth } from '@/lib/ai/shared'

export async function GET(req: NextRequest) {
  const authError = requireCronAuth(req)
  if (authError) return authError

  const request = new Request(req.url, {
    method: 'POST',
    headers: req.headers,
    body: JSON.stringify({ limit: 10 }),
  })

  return runDailyBrief(request as NextRequest)
}
