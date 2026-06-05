export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { LeadStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { requireAdminSession } from '@/lib/ai/shared'

const VALID_STATUSES = new Set(Object.values(LeadStatus))

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdminSession()
    if (!auth.ok) return auth.response

    const { id } = await params
    const body = await req.json()
    const { status, notes } = body

    if (!status && !notes) {
      return NextResponse.json(
        { error: 'At least one field (status or notes) must be provided' },
        { status: 400 }
      )
    }

    if (status && !VALID_STATUSES.has(status)) {
      return NextResponse.json(
        { error: `Invalid status: "${status}"` },
        { status: 422 }
      )
    }

    const existing = status
      ? await prisma.contact.findUnique({ where: { id }, select: { status: true } })
      : await prisma.contact.findUnique({ where: { id }, select: { id: true } })

    if (!existing) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 })
    }

    const updateData: Record<string, unknown> = {}
    if (status) updateData.status = status
    if (notes) updateData.notesSummary = notes

    const contact = await prisma.contact.update({
      where: { id },
      data: updateData,
    })

    if (status && 'status' in existing) {
      await prisma.systemEvent.create({
        data: {
          type: 'contact.status_changed',
          contactId: contact.id,
          payload: {
            oldStatus: existing.status,
            newStatus: status,
          },
        },
      })
    }

    return NextResponse.json({ success: true, contact })
  } catch (error) {
    console.error('Contact update error:', error)
    return NextResponse.json(
      { error: 'Failed to update contact' },
      { status: 500 }
    )
  }
}