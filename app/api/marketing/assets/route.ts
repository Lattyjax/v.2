export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { rateLimit } from '@/lib/rate-limit'
import { logger } from '@/lib/logger'

const MAX_FILE_SIZE = 500 * 1024 * 1024 // 500 MB

export async function GET(req: NextRequest) {
  const limited = await rateLimit(req, 'inquiries')
  if (limited) return limited

  try {
    const assets = await prisma.uploadedWorkDocument.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    })
    return NextResponse.json({ ok: true, assets })
  } catch {
    return NextResponse.json({ ok: false, error: 'Failed to load assets' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const limited = await rateLimit(req, 'fillout')
  if (limited) return limited

  const contentType = req.headers.get('content-type') ?? ''

  // ── Handle JSON metadata-only upload (cloud URL) ───────────────────────────
  if (contentType.includes('application/json')) {
    const body = await req.json().catch(() => null)
    if (!body?.fileName || !body?.mimeType) {
      return NextResponse.json({ ok: false, error: 'fileName and mimeType required' }, { status: 422 })
    }
    try {
      const asset = await prisma.uploadedWorkDocument.create({
        data: {
          fileName: String(body.fileName).slice(0, 500),
          mimeType: String(body.mimeType).slice(0, 200),
          storageUrl: body.storageUrl ? String(body.storageUrl).slice(0, 2000) : null,
          metadata: { source: body.source ?? 'cloud', tags: body.tags ?? [] },
          status: 'processed',
        },
      })
      return NextResponse.json({ ok: true, asset }, { status: 201 })
    } catch {
      return NextResponse.json({ ok: false, error: 'Failed to save asset metadata' }, { status: 500 })
    }
  }

  // ── Handle multipart/form-data upload ─────────────────────────────────────
  if (!contentType.includes('multipart/form-data')) {
    return NextResponse.json({ ok: false, error: 'Expected multipart/form-data or application/json' }, { status: 415 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    if (!file) return NextResponse.json({ ok: false, error: 'No file provided' }, { status: 422 })
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ ok: false, error: 'File exceeds 500 MB limit' }, { status: 413 })
    }

    const tags = formData.get('tags') ? String(formData.get('tags')).split(',').map(t => t.trim()) : []
    const source = formData.get('source') ? String(formData.get('source')) : 'local'

    logger.info({ fileName: file.name, size: file.size, mimeType: file.type }, '[assets] upload received')

    // For Vercel deployments, write to /tmp (ephemeral but usable for processing)
    // In production, pipe to Supabase Storage or S3 here
    const asset = await prisma.uploadedWorkDocument.create({
      data: {
        fileName: file.name.slice(0, 500),
        mimeType: file.type || 'application/octet-stream',
        storageUrl: null, // Populate after uploading to Supabase/S3
        extractedText: null,
        metadata: { source, tags, sizeBytes: file.size, originalName: file.name },
        status: 'processed',
      },
    })

    return NextResponse.json({ ok: true, asset }, { status: 201 })
  } catch (err) {
    logger.error({ err }, '[assets] upload failed')
    return NextResponse.json({ ok: false, error: 'Upload failed' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ ok: false, error: 'id required' }, { status: 422 })
  try {
    await prisma.uploadedWorkDocument.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false, error: 'Delete failed' }, { status: 500 })
  }
}
