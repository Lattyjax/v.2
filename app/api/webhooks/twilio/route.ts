export const dynamic = 'force-dynamic'
import crypto from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { createHmac, timingSafeEqual } from 'node:crypto'
import { prisma } from '@/lib/prisma'
import { triggerLeadScoring } from '@/lib/ai/lead-score-trigger'
import { rateLimit } from '@/lib/rate-limit'
import { logger } from '@/lib/logger'

/**
 * Verify Twilio webhook signature.
 * Uses HMAC-SHA1 of (url + sorted POST params) signed with TWILIO_AUTH_TOKEN.
 * Falls through (returns true) if TWILIO_AUTH_TOKEN is not configured so the
 * endpoint still works during local development / before credentials are set.
 */
function verifyTwilioSignature(req: NextRequest, rawBody: string): boolean {
  const authToken = process.env.TWILIO_AUTH_TOKEN
  if (!authToken) return true // allow through if not configured

  const twilioSig = req.headers.get('x-twilio-signature')
  if (!twilioSig) return false

  // Reconstruct the URL Twilio signed
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? ''
  const url = `${baseUrl}/api/webhooks/twilio`

  // Parse POST body (application/x-www-form-urlencoded)
  const params = new URLSearchParams(rawBody)
  const sortedKeys = Array.from(params.keys()).sort()
  const paramString = sortedKeys.map(k => `${k}${params.get(k)}`).join('')

  const expectedSig = crypto
    .createHmac('sha1', authToken)
    .update(url + paramString)
    .digest('base64')

  try {
    const a = Buffer.from(expectedSig)
    const b = Buffer.from(twilioSig)
    if (a.length !== b.length) return false
    return crypto.timingSafeEqual(a, b)
  } catch {
    return false
  }
}

export async function POST(req: NextRequest) {
  const limited = await rateLimit(req, 'default')
  if (limited) return limited

  const rawBody = await req.text()
  if (!verifyTwilioSignature(req, rawBody)) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  const params = new URLSearchParams(rawBody)
  const from = params.get('From') as string
  const to = params.get('To') as string
  const body = params.get('Body') as string
  const messageSid = params.get('MessageSid') as string

  if (!from || !body) {
    return new NextResponse('Missing required fields', { status: 400 })
  }

  try {
    // Find contact by phone number
    const contact = await prisma.contact.findFirst({
      where: { phone: from.replace(/^\+?1/, '') }, // Remove +1 prefix for US numbers
      include: { inquiries: { orderBy: { createdAt: 'desc' }, take: 1 } }
    })

    if (!contact) {
      logger.info({ from }, 'Inbound SMS from unknown number')
      return new NextResponse('', { status: 200 }) // Acknowledge but don't process
    }

    // Find or create conversation thread
    let thread = await prisma.conversationThread.findFirst({
      where: { contactId: contact.id, channel: 'sms' },
      orderBy: { updatedAt: 'desc' },
    })

    if (!thread) {
      thread = await prisma.conversationThread.create({
        data: {
          contactId: contact.id,
          inquiryId: contact.inquiries[0]?.id ?? null,
          channel: 'sms',
          subject: 'SMS Conversation',
          lastMessageAt: new Date(),
          lastInboundAt: new Date(),
        },
      })
    }

    // Save the inbound message
    const message = await prisma.conversationMessage.create({
      data: {
        threadId: thread.id,
        contactId: contact.id,
        inquiryId: contact.inquiries[0]?.id ?? null,
        channel: 'sms',
        direction: 'inbound',
        status: 'received',
        bodyText: body,
        providerMessageId: messageSid,
        sentAt: new Date(),
        fromAddress: from,
        toAddress: to,
      },
    })

    // Update thread and contact
    await prisma.conversationThread.update({
      where: { id: thread.id },
      data: { lastMessageAt: new Date(), lastInboundAt: new Date() },
    })

    await prisma.contact.update({
      where: { id: contact.id },
      data: { lastActivityAt: new Date() },
    })

    // Log the inbound message event
    await prisma.systemEvent.create({
      data: {
        type: 'message.received',
        contactId: contact.id,
        inquiryId: contact.inquiries[0]?.id ?? null,
        payload: { channel: 'sms', messageId: message.id }
      }
    })

    // Trigger lead scoring for inbound message
    await triggerLeadScoring({
      contactId: contact.id,
      inquiryId: contact.inquiries[0]?.id ?? null,
      reason: 'inbound_sms_received'
    })

    // Return empty response to acknowledge receipt
    return new NextResponse('', { status: 200 })

  } catch (error) {
    logger.error({ error }, 'Twilio webhook error')
    return new NextResponse('Internal server error', { status: 500 })
  }
}