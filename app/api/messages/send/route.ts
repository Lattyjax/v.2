export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { logger } from '@/lib/logger'
import { prisma } from '@/lib/prisma'
import { requireAdminSession } from '@/lib/ai/shared'
import { triggerLeadScoring } from '@/lib/ai/lead-score-trigger'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

export async function POST(req: NextRequest) {
  const auth = await requireAdminSession()
  if (!auth.ok) return auth.response

  const body = await req.json().catch(() => null)
  if (!body?.contactId || !body?.channel || !body?.message) {
    return NextResponse.json({ ok: false, error: 'contactId, channel, and message are required' }, { status: 422 })
  }

  const contact = await prisma.contact.findUnique({ where: { id: body.contactId } })
  if (!contact) return NextResponse.json({ ok: false, error: 'Contact not found' }, { status: 404 })

  let providerId: string | null = null

  if (body.channel === 'sms') {
    return NextResponse.json({ ok: false, error: 'SMS not configured' }, { status: 400 })
  } else if (body.channel === 'email') {
    if (!resend || !contact.email) {
      return NextResponse.json({ ok: false, error: 'Resend is not configured or contact email is missing' }, { status: 400 })
    }
    const result = await resend.emails.send({
      from: process.env.OUTBOUND_FROM_EMAIL || 'advisor@example.com',
      to: contact.email,
      subject: body.subject || 'Message',
      text: body.message,
    })

    logger.info({ result }, '[resend] send result')

    providerId = (result as any)?.data?.id ?? (result as any)?.id ?? null as string | null

    if (!providerId) {
      console.warn('[resend] providerMessageId missing from response')
    }
  } else {
    return NextResponse.json({ ok: false, error: 'Unsupported channel' }, { status: 422 })
  }

  const existingThread = await prisma.conversationThread.findFirst({
    where: { contactId: body.contactId, channel: body.channel },
    orderBy: { updatedAt: 'desc' },
  })

  const thread = existingThread ?? await prisma.conversationThread.create({
    data: {
      contactId: body.contactId,
      inquiryId: body.inquiryId,
      channel: body.channel,
      subject: body.subject,
      lastMessageAt: new Date(),
      lastOutboundAt: new Date(),
    },
  })

  const message = await prisma.conversationMessage.create({
    data: {
      threadId: thread.id,
      contactId: body.contactId,
      inquiryId: body.inquiryId,
      channel: body.channel,
      direction: 'outbound',
      status: 'sent',
      subject: body.subject,
      bodyText: body.message,
      providerMessageId: providerId,
      sentAt: new Date(),
      toAddress: body.channel === 'email' ? contact.email : contact.phone,
    },
  })

  await prisma.conversationThread.update({
    where: { id: thread.id },
    data: { lastMessageAt: new Date(), lastOutboundAt: new Date(), subject: body.subject ?? thread.subject ?? undefined },
  })

  await prisma.contact.update({
    where: { id: body.contactId },
    data: { lastActivityAt: new Date() },
  })

  // Trigger lead scoring when sending outbound messages
  await triggerLeadScoring({
    contactId: body.contactId,
    inquiryId: body.inquiryId,
    reason: 'outbound_message_sent'
  })

  await prisma.systemEvent.create({
    data: {
      type: 'message.sent',
      contactId: body.contactId,
      inquiryId: body.inquiryId,
      threadId: thread.id,
      payload: { channel: body.channel, messageId: message.id, providerMessageId: providerId },
    },
  })

  return NextResponse.json({ ok: true, threadId: thread.id, messageId: message.id, providerMessageId: providerId })
}
