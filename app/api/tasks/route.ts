export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { rateLimit } from '@/lib/rate-limit'
import { logger } from '@/lib/logger'

export async function GET(req: NextRequest) {
  const limited = await rateLimit(req, 'default')
  if (limited) return limited

  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })

  const items = await prisma.task.findMany({
    orderBy: [{ status: 'asc' }, { dueAt: 'asc' }, { createdAt: 'desc' }],
    include: { contact: true, inquiry: true },
  })

  return NextResponse.json({ items })
}

export async function POST(req: NextRequest) {
  const limited = await rateLimit(req, 'default')
  if (limited) return limited

  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const title = typeof body.title === 'string' ? body.title.trim() : ''

    if (!title) {
      return NextResponse.json({ ok: false, error: 'title is required' }, { status: 400 })
    }

    const task = await prisma.task.create({
      data: {
        title,
        description: typeof body.description === 'string' ? body.description.trim() || null : null,
        dueAt: body.dueAt ? new Date(body.dueAt) : null,
        contactId: typeof body.contactId === 'string' ? body.contactId : null,
        inquiryId: typeof body.inquiryId === 'string' ? body.inquiryId : null,
      },
      include: { contact: true, inquiry: true },
    })

    return NextResponse.json({ ok: true, task }, { status: 201 })
  } catch (error) {
    logger.error({ err: error instanceof Error ? error.message : String(error) }, 'Task create error')
    return NextResponse.json({ ok: false, error: 'failed to create task' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const limited = await rateLimit(req, 'default')
  if (limited) return limited

  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const id = typeof body.id === 'string' ? body.id : ''

    if (!id) {
      return NextResponse.json({ ok: false, error: 'id is required' }, { status: 400 })
    }

    const updates: {
      status?: string
      title?: string
      description?: string | null
      dueAt?: Date | null
    } = {}

    if (typeof body.status === 'string') updates.status = body.status
    if (typeof body.title === 'string' && body.title.trim()) updates.title = body.title.trim()
    if (typeof body.description === 'string') updates.description = body.description.trim() || null
    if (body.dueAt !== undefined) updates.dueAt = body.dueAt ? new Date(body.dueAt) : null

    const task = await prisma.task.update({
      where: { id },
      data: updates,
      include: { contact: true, inquiry: true },
    })

    return NextResponse.json({ ok: true, task })
  } catch (error) {
    logger.error({ err: error instanceof Error ? error.message : String(error) }, 'Task update error')
    return NextResponse.json({ ok: false, error: 'failed to update task' }, { status: 500 })
  }
}
