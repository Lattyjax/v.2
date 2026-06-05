export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  if (!body?.assetId || !body?.scheduledFor) {
    return NextResponse.json({ ok: false, error: 'assetId and scheduledFor are required' }, { status: 422 })
  }

  const asset = await prisma.contentAsset.update({
    where: { id: body.assetId },
    data: { status: 'scheduled', scheduledFor: new Date(body.scheduledFor) },
  })

  await prisma.systemEvent.create({
    data: { type: 'content.scheduled', payload: { assetId: asset.id, scheduledFor: body.scheduledFor } },
  })

  return NextResponse.json({ ok: true, asset })
}
