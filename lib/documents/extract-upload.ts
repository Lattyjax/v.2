export type ExtractResult = {
  fileName: string
  mimeType: string
  extractedText: string
  metadata: Record<string, unknown>
}

export async function extractUploadedDocument(file: File): Promise<ExtractResult> {
  const mimeType = file.type || 'application/octet-stream'
  const fileName = file.name

  if (mimeType === 'text/plain' || mimeType === 'text/csv' || mimeType === 'text/markdown') {
    const text = await file.text()
    return { fileName, mimeType, extractedText: text.slice(0, 50000), metadata: { sizeBytes: file.size } }
  }

  if (mimeType === 'application/json') {
    const text = await file.text()
    let parsed: unknown
    try { parsed = JSON.parse(text) } catch { parsed = null }
    return {
      fileName, mimeType,
      extractedText: typeof parsed === 'object' ? JSON.stringify(parsed, null, 2).slice(0, 50000) : text.slice(0, 50000),
      metadata: { sizeBytes: file.size },
    }
  }

  if (mimeType === 'application/pdf') {
    const bytes = await file.arrayBuffer()
    const buf = Buffer.from(bytes)
    // Extract readable ASCII text from PDF (naive stream extraction)
    const raw = buf.toString('latin1')
    const textChunks: string[] = []
    const streamRegex = /stream\r?\n([\s\S]*?)\r?\nendstream/g
    let m: RegExpExecArray | null
    while ((m = streamRegex.exec(raw)) !== null) {
      const chunk = m[1].replace(/[^\x20-\x7E\n\r\t]/g, ' ').replace(/\s+/g, ' ').trim()
      if (chunk.length > 20) textChunks.push(chunk)
    }
    return {
      fileName, mimeType,
      extractedText: textChunks.join('\n').slice(0, 50000) || '[PDF: text extraction not available]',
      metadata: { sizeBytes: file.size, pageEstimate: Math.ceil(buf.length / 3000) },
    }
  }

  return {
    fileName, mimeType,
    extractedText: '[Binary file — text extraction not supported for this format]',
    metadata: { sizeBytes: file.size },
  }
}
