import { NextRequest, NextResponse } from 'next/server'
import { requireAdminSession } from '@/lib/ai/shared'
import { extractUploadedDocument } from '@/lib/documents/extract-upload'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const auth = await requireAdminSession()
  if (!auth.ok) return auth.response

  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json({ error: 'expected multipart/form-data' }, { status: 400 })
  }

  const file = formData.get('file')
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: 'file field required' }, { status: 400 })
  }

  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: 'file too large (max 10MB)' }, { status: 413 })
  }

  const extracted = await extractUploadedDocument(file)

  const doc = await prisma.uploadedWorkDocument.create({
    data: {
      fileName: extracted.fileName,
      mimeType: extracted.mimeType,
      extractedText: extracted.extractedText,
      metadata: extracted.metadata as object,
      status: 'processed',
    },
  })

  return NextResponse.json({
    ok: true,
    id: doc.id,
    fileName: doc.fileName,
    mimeType: doc.mimeType,
    chars: extracted.extractedText.length,
    preview: extracted.extractedText.slice(0, 300),
  })
}
