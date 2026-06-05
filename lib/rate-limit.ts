import { NextRequest, NextResponse } from 'next/server'

// Limit config shared by both the Upstash and in-memory implementations.
const LIMITS: Record<string, { limit: number; windowSec: number }> = {
  analytics: { limit: 120, windowSec: 60 },
  booking: { limit: 10, windowSec: 60 },
  cardEvents: { limit: 200, windowSec: 60 },
  default: { limit: 100, windowSec: 60 },
  ethos_redirect: { limit: 30, windowSec: 60 },
  event: { limit: 120, windowSec: 60 },
  fillout: { limit: 20, windowSec: 60 },
  inquiries: { limit: 60, windowSec: 60 },
  join: { limit: 10, windowSec: 60 },
  lead: { limit: 30, windowSec: 60 },
  reports: { limit: 30, windowSec: 60 },
}

async function upstashLimit(key: string, limit: number, windowSec: number): Promise<boolean> {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return false

  try {
    const { Ratelimit } = await import('@upstash/ratelimit')
    const { Redis } = await import('@upstash/redis')
    const redis = new Redis({ url, token })
    const limiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(limit, `${windowSec} s`),
    })
    const { success } = await limiter.limit(key)
    return !success
  } catch {
    return false
  }
}

// In-memory fallback (single-instance only — used when Upstash is not configured).
const store = new Map<string, { count: number; reset: number }>()

setInterval(() => {
  const now = Date.now()
  for (const [k, rec] of store) {
    if (now > rec.reset) store.delete(k)
  }
}, 60_000)

function memoryLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const rec = store.get(key)
  if (!rec || now > rec.reset) {
    store.set(key, { count: 1, reset: now + windowMs })
    return false
  }
  if (rec.count >= limit) return true
  rec.count++
  return false
}

export async function rateLimit(req: NextRequest, type = 'default'): Promise<NextResponse | null> {
  const { limit, windowSec } = LIMITS[type] ?? LIMITS.default
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const key = `rl:${type}:${ip}`

  const limited = process.env.UPSTASH_REDIS_REST_URL
    ? await upstashLimit(key, limit, windowSec)
    : memoryLimit(key, limit, windowSec * 1000)

  if (!limited) return null
  return NextResponse.json(
    { ok: false, error: 'Too many requests — please slow down.' },
    { status: 429, headers: { 'Retry-After': String(windowSec), 'X-RateLimit-Limit': String(limit) } },
  )
}
