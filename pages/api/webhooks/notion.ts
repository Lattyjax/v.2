import type { NextApiRequest, NextApiResponse } from 'next'
import { createHmac, timingSafeEqual } from 'node:crypto'
import { syncNotionPageToApp } from '@/lib/notion/sync-from-notion'
import { logger } from '@/lib/logger'

// Optional HMAC verification using NOTION_WEBHOOK_SECRET.
// If the env var is not set, signature checking is skipped (useful during
// initial setup when the secret hasn't been configured yet).
function isValidSignature(req: NextApiRequest): boolean {
  const secret = process.env.NOTION_WEBHOOK_SECRET
  if (!secret) return true

  const sig = req.headers['x-notion-signature'] as string | undefined
  if (!sig) return false

  const body = JSON.stringify(req.body ?? {})
  const expected = `sha256=${createHmac('sha256', secret).update(body).digest('hex')}`
  const expectedBuf = Buffer.from(expected)
  const sigBuf = Buffer.from(sig)
  return expectedBuf.length === sigBuf.length && timingSafeEqual(expectedBuf, sigBuf)
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).send('Method Not Allowed')
  }

  const body = req.body ?? {}

  // Notion sends a verification_token on initial webhook registration.
  // Returning 200 confirms the endpoint is live; copy the token from logs
  // and store it as NOTION_WEBHOOK_SECRET in your env.
  if (body.verification_token) {
    logger.info({ token: body.verification_token }, '[notion-webhook] verification token received')
    return res.status(200).json({ ok: true })
  }

  if (!isValidSignature(req)) {
    logger.warn('[notion-webhook] invalid signature')
    return res.status(401).json({ ok: false, error: 'Invalid signature' })
  }

  const eventType: string = body.type ?? ''
  const pageId: string = body.entity?.id ?? ''

  if (eventType === 'page.updated' && pageId) {
    // Fire-and-forget — webhook must return 200 quickly
    syncNotionPageToApp(pageId).catch((err) =>
      logger.error({ err, pageId }, '[notion-webhook] sync failed'),
    )
  } else {
    logger.info({ eventType, pageId }, '[notion-webhook] unhandled event type')
  }

  return res.status(200).json({ ok: true })
}
