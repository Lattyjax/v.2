/**
 * POST /api/admin/ai/copilot
 * File-system-aware copilot ported from LEGACY-Ai-main.
 * Returns structured JSON with thought, content, and optional file-system actions.
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAdminSession } from '@/lib/ai/shared'
import { createOpenAIJsonCompletion } from '@/lib/ai/client'
import { rateLimit } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const SYSTEM_PROMPT = `You are the Latimore Hub OS Copilot — a high-performance AI assistant for Jackson M. Latimore Sr., Founder and CEO of Latimore Life & Legacy LLC.

CANONICAL CONTEXT:
- Brand: Latimore Life & Legacy LLC
- Mission: Help families and organizations protect what matters and build legacies that outlive them — education-first, NEVER fear-based.
- Tagline: "Protecting Today. Securing Tomorrow."
- Hashtag: #TheBeatGoesOn
- Region: Schuylkill, Luzerne, and Northumberland Counties, Pennsylvania
- Carriers: North American, F&G, American Equity, Corebridge Financial, Ethos Life, Foresters Financial
- License: PA DOI #1268820 | NIPR #21638507

FILE SYSTEM CAPABILITIES:
You can interact with a simulated workspace file system.
- FILE_READ: Read the contents of a file. Payload is the file path string.
- FILE_WRITE: Write content to a file. Payload is {"path":"...","content":"..."}.
- FILE_CREATE: Create a file or folder. Payload is {"path":"...","type":"file"|"dir"}.

RESPONSE FORMAT — STRICT JSON ONLY:
{
  "thought": "Brief internal reasoning",
  "content": "Plain-language reply to display to the user",
  "actions": []
}
If no file system action is needed, return an empty array for actions.
Brand voice: professional, strategic, education-first. Never use fear-based language.`

const COPILOT_SCHEMA = {
  type: 'object' as const,
  properties: {
    thought: { type: 'string' },
    content: { type: 'string' },
    actions: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          type: { type: 'string', enum: ['FILE_READ', 'FILE_WRITE', 'FILE_CREATE'] },
          path: { type: 'string' },
          content: { type: 'string' },
          fileType: { type: 'string', enum: ['file', 'dir'] },
        },
        required: ['type', 'path'],
        additionalProperties: false,
      },
    },
  },
  required: ['thought', 'content', 'actions'],
  additionalProperties: false,
}

type CopilotResponse = {
  thought: string
  content: string
  actions: Array<{
    type: 'FILE_READ' | 'FILE_WRITE' | 'FILE_CREATE'
    path: string
    content?: string
    fileType?: 'file' | 'dir'
  }>
}

type HistoryMessage = {
  role: 'user' | 'agent'
  content: string
  thought?: string
  actions?: unknown[]
}

export async function POST(req: NextRequest) {
  const limited = await rateLimit(req, 'reports')
  if (limited) return limited

  const auth = await requireAdminSession()
  if (!auth.ok) return auth.response

  let body: { message?: string; history?: HistoryMessage[]; fileSystem?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 })
  }

  const message = typeof body.message === 'string' ? body.message.trim() : ''
  if (!message) {
    return NextResponse.json({ error: 'message is required' }, { status: 400 })
  }

  const history = Array.isArray(body.history) ? body.history.slice(-8) : []
  const fileSystem = body.fileSystem ?? {}

  const contextBlock = [
    `Current workspace file system:\n${JSON.stringify(fileSystem, null, 2)}`,
    history.length > 0
      ? '\nPrior conversation:\n' +
        history
          .map((m) => `${m.role === 'user' ? 'Jackson' : 'Copilot'}: ${m.content}`)
          .join('\n')
      : '',
    `\nJackson: ${message}`,
  ]
    .filter(Boolean)
    .join('\n')

  try {
    const result = await createOpenAIJsonCompletion<CopilotResponse>({
      system: SYSTEM_PROMPT,
      user: contextBlock,
      schemaName: 'CopilotResponse',
      schema: COPILOT_SCHEMA,
      temperature: 0.65,
    })

    return NextResponse.json({
      role: 'agent',
      thought: result.output.thought,
      content: result.output.content,
      actions: result.output.actions ?? [],
      timestamp: Date.now(),
    })
  } catch (error) {
    console.error('[/api/admin/ai/copilot] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Copilot inference failed' },
      { status: 500 }
    )
  }
}
