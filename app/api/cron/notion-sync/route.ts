export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 120

import { NextRequest, NextResponse } from 'next/server'
import { requireCronAuth } from '@/lib/ai/shared'
import { getNotionClient } from '@/lib/notion/client'
import { syncNotionPageToApp } from '@/lib/notion/sync-from-notion'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

// Queries the Notion Contacts database for pages edited in the last 24 hours
// and syncs any changed Status or Next Follow-up values back into the local DB.
export async function GET(req: NextRequest) {
  const authError = requireCronAuth(req)
  if (authError) return authError

  const notion = getNotionClient()
  const dbId = process.env.NOTION_CONTACT_DB_ID
  if (!notion || !dbId) {
    logger.warn('[cron/notion-sync] Notion not configured — skipping')
    return NextResponse.json({ ok: true, skipped: true, reason: 'Notion not configured' })
  }

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000)

  let results
  try {
    results = await (notion as unknown as {
      dataSources: {
        query: (args: unknown) => Promise<{ results: { id: string }[] }>
      }
    }).dataSources.query({
      data_source_id: dbId,
      filter: {
        timestamp: 'last_edited_time',
        last_edited_time: { after: since.toISOString() },
      },
      page_size: 100,
    })
  } catch (err) {
    logger.error({ err }, '[cron/notion-sync] Failed to query Notion')
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    )
  }

  const pages = results.results
  let synced = 0
  let unchanged = 0
  let errors = 0

  for (const page of pages) {
    const result = await syncNotionPageToApp(page.id)
    if (result.error) {
      errors++
    } else if (result.changes.length > 0) {
      synced++
      logger.info({ email: result.email, changes: result.changes }, '[cron/notion-sync] synced')
    } else {
      unchanged++
    }
  }

  await prisma.systemEvent.create({
    data: {
      type: 'cron.notion_sync.completed',
      payload: { pagesQueried: pages.length, synced, unchanged, errors },
    },
  })

  logger.info({ pagesQueried: pages.length, synced, unchanged, errors }, '[cron/notion-sync] done')
  return NextResponse.json({
    ok: true,
    stats: { pagesQueried: pages.length, synced, unchanged, errors },
  })
}
