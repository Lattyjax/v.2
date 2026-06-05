export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`
    return NextResponse.json({ ok: true, db: 'connected', ts: new Date().toISOString() })
  } catch (err: any) {
    return NextResponse.json({ ok: false, db: 'error', error: err.message }, { status: 503 })
  }
}
