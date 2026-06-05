'use client'

import { useEffect, useRef } from 'react'
import { getEventContext } from '@/lib/lead'

interface ArticleAnalyticsProps {
  slug: string
  title: string
  category: string
}

/**
 * Fires post_viewed events to /api/event (Supabase) with full UTM attribution.
 * Tracks scroll depth milestones (50% and 95%) in event metadata.
 *
 * The global PublicTracker fires a generic page_view — this fires the richer
 * post_viewed event type with blog-specific context (slug, category, depth).
 */
export default function ArticleAnalytics({ slug, title, category }: ArticleAnalyticsProps) {
  const fired50 = useRef(false)
  const fired100 = useRef(false)

  function fire(depth: 'entry' | '50pct' | '95pct') {
    const ctx = getEventContext({ pageUrl: `/education/blog/${slug}` })
    fetch('/api/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventType: 'post_viewed',
        leadSessionId: ctx.leadSessionId,
        pageUrl: ctx.pageUrl,
        referrer: ctx.referrer,
        source: ctx.source,
        medium: ctx.medium,
        campaign: ctx.campaign,
        term: ctx.term,
        content: ctx.content,
        metadata: { slug, title, category, depth },
      }),
      keepalive: true,
    }).catch(() => undefined)
  }

  useEffect(() => {
    fire('entry')

    const handleScroll = () => {
      const doc = document.documentElement
      const total = doc.scrollHeight - doc.clientHeight
      if (total <= 0) return
      const pct = doc.scrollTop / total

      if (!fired50.current && pct >= 0.5) {
        fired50.current = true
        fire('50pct')
      }
      if (!fired100.current && pct >= 0.95) {
        fired100.current = true
        fire('95pct')
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug])

  return null
}
