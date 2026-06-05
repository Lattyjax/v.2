'use client'

import { useEffect, useRef } from 'react'

interface ArticleAnalyticsProps {
  slug: string
  title: string
  category: string
  author: string
  readingTime: string
}

type AnalyticsWindow = Window & {
  dataLayer?: Record<string, unknown>[]
}

function pushEvent(event: Record<string, unknown>) {
  try {
    const analyticsWindow = window as AnalyticsWindow
    analyticsWindow.dataLayer = analyticsWindow.dataLayer || []
    analyticsWindow.dataLayer.push(event)
  } catch {
    // analytics failures are silently swallowed
  }
}

export default function ArticleAnalytics({
  slug,
  title,
  category,
  author,
  readingTime,
}: ArticleAnalyticsProps) {
  const firedRef = useRef<Set<number>>(new Set())

  useEffect(() => {
    pushEvent({
      event: 'article_view',
      article_slug: slug,
      article_title: title,
      article_category: category,
      article_author: author,
      reading_time: readingTime,
    })
  }, [slug, title, category, author, readingTime])

  useEffect(() => {
    const thresholds = [25, 50, 75, 100]

    function onScroll() {
      const el = document.documentElement
      const scrollTop = el.scrollTop || document.body.scrollTop
      const scrollHeight = el.scrollHeight - el.clientHeight
      if (scrollHeight <= 0) return
      const pct = Math.round((scrollTop / scrollHeight) * 100)

      for (const threshold of thresholds) {
        if (pct >= threshold && !firedRef.current.has(threshold)) {
          firedRef.current.add(threshold)
          pushEvent({
            event: threshold === 100 ? 'article_complete' : 'scroll_depth',
            article_slug: slug,
            article_title: title,
            article_category: category,
            percent_scrolled: threshold,
          })
        }
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [slug, title, category])

  useEffect(() => {
    function onClick(e: MouseEvent) {
      const target = (e.target as HTMLElement).closest('a[data-cta]')
      if (!target) return
      pushEvent({
        event: 'cta_click',
        cta_name: (target as HTMLElement).dataset.cta,
        article_slug: slug,
        article_title: title,
        article_category: category,
      })
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [slug, title, category])

  return null
}
