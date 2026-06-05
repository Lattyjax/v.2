'use client'

import { useEffect, useRef } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { getEventContext, getCurrentPageUrl, hydrateLeadContext } from '@/lib/lead'

type EventPayload = ReturnType<typeof getEventContext> & {
  eventType: string
  metadata?: Record<string, unknown>
  county?: string | null
  productInterest?: string | null
}

const CTA_TEXT_PATTERN =
  /(book|schedule|consult|quote|get started|get quote|instant quote|call|text|email|download|facebook|instagram|linkedin|work with me|read full story|ready to explore)/i

const SKIP_TEXT_PATTERN = /^(home|about|products|services|education|contact|menu|close|back to home)$/i
const BOOKING_HREF_PATTERN = /(\/book(?:$|[/?#])|fillout\.com|calendly\.com|schedule|consult)/i
const DOWNLOAD_HREF_PATTERN = /\.(pdf|doc|docx|xls|xlsx|ppt|pptx|zip)(\?|#|$)/i

const PRODUCT_PATTERNS: Array<[RegExp, string]> = [
  [/mortgage/i, 'Mortgage_Protection'],
  [/final expense/i, 'Final_Expense'],
  [/term life/i, 'Term_Life'],
  [/whole life/i, 'Whole_Life'],
  [/child/i, 'Child_Whole_Life'],
  [/accident/i, 'Accident'],
  [/critical illness/i, 'Critical_Illness'],
  [/\biul\b|indexed universal life/i, 'IUL'],
  [/annuity|fia|myga/i, 'Annuity'],
  [/retirement/i, 'Retirement'],
  [/business|key person/i, 'Business'],
]

const COUNTY_PATTERNS: Array<[RegExp, string]> = [
  [/schuylkill/i, 'Schuylkill'],
  [/luzerne/i, 'Luzerne'],
  [/northumberland/i, 'Northumberland'],
]

function getElementText(element: HTMLElement): string {
  return (element.getAttribute('aria-label') || element.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 140)
}

function inferPlacement(element: HTMLElement): string {
  if (element.closest('nav')) return 'nav'
  if (element.closest('header')) return 'header'
  if (element.closest('footer')) return 'footer'
  if (element.closest('main')) return 'main'
  return 'page'
}

function getContextText(element: HTMLElement): string {
  let current: HTMLElement | null = element
  for (let depth = 0; depth < 5 && current; depth += 1) {
    const text = (current.textContent || '').replace(/\s+/g, ' ').trim()
    if (text && text.length >= 20 && text.length <= 500) return text
    current = current.parentElement
  }
  return ''
}

function inferProductInterest(element: HTMLElement, text: string, href: string): string | null {
  const explicit = element.dataset.productInterest?.trim()
  if (explicit) return explicit

  const combined = `${text} ${href} ${getContextText(element)} ${element.closest('[data-product-interest]')?.getAttribute('data-product-interest') ?? ''}`
  for (const [pattern, value] of PRODUCT_PATTERNS) {
    if (pattern.test(combined)) return value
  }
  return null
}

function inferCounty(element: HTMLElement, text: string, href: string): string | null {
  const explicit = element.dataset.county?.trim()
  if (explicit) return explicit

  const combined = `${text} ${href} ${getContextText(element)} ${element.closest('[data-county]')?.getAttribute('data-county') ?? ''}`
  for (const [pattern, value] of COUNTY_PATTERNS) {
    if (pattern.test(combined)) return value
  }
  return null
}

function normalizeHref(element: HTMLElement): string {
  if (element instanceof HTMLAnchorElement) return element.href
  const href = element.getAttribute('href') || element.dataset.href || ''
  if (!href) return ''
  try {
    return new URL(href, window.location.origin).toString()
  } catch {
    return href
  }
}

function isMeaningfulCta(element: HTMLElement, text: string, href: string): boolean {
  if (element.dataset.track === 'true' || element.dataset.trackCta === 'true') return true
  if (CTA_TEXT_PATTERN.test(text)) return true
  if (BOOKING_HREF_PATTERN.test(href)) return true
  if (DOWNLOAD_HREF_PATTERN.test(href)) return true

  if (element.tagName === 'BUTTON') return true

  if (href) {
    try {
      const url = new URL(href, window.location.origin)
      if (url.origin !== window.location.origin) return true
    } catch {
      return true
    }
  }

  return false
}

function classifyEvent(element: HTMLElement): { eventType: string; text: string; href: string } | null {
  const explicitEvent = element.dataset.trackEvent?.trim()
  const text = getElementText(element)
  const href = normalizeHref(element)

  if (explicitEvent) return { eventType: explicitEvent, text, href }

  if (!text && !href) return null
  if (text && SKIP_TEXT_PATTERN.test(text)) return null

  if (href.startsWith('tel:')) return { eventType: /text/i.test(text) ? 'text_click' : 'call_click', text, href }
  if (href.startsWith('sms:')) return { eventType: 'text_click', text, href }
  if (href.startsWith('mailto:')) return { eventType: 'email_click', text, href }
  if (DOWNLOAD_HREF_PATTERN.test(href) || element.hasAttribute('download')) return { eventType: 'lead_magnet_download', text, href }
  if (BOOKING_HREF_PATTERN.test(href) || /book|schedule|consult/i.test(text)) return { eventType: 'book_click', text, href }
  if (isMeaningfulCta(element, text, href)) return { eventType: 'cta_click', text, href }

  return null
}

async function sendEvent(payload: EventPayload) {
  try {
    await fetch('/api/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
      cache: 'no-store',
    })
  } catch {
    // Swallow tracking failures so UX is never blocked by analytics.
  }
}

export default function PublicTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const lastPageRef = useRef('')

  useEffect(() => {
    if (!pathname) return

    const search = searchParams?.toString()
    const pageUrl = search ? `${pathname}?${search}` : pathname

    if (lastPageRef.current === pageUrl) return
    lastPageRef.current = pageUrl

    const context = hydrateLeadContext({ pageUrl })

    void sendEvent({
  leadSessionId: context.leadSessionId,
  pageUrl: context.pageUrl,
  referrer: context.referrer,
  source: context.source,
  medium: context.medium,
  campaign: context.campaign,
  term: context.term,
  content: context.content,
  county: null,
  productInterest: null,
  eventType: 'page_view',
  metadata: {
    title: typeof document !== 'undefined' ? document.title : '',
  },
    })


  }, [pathname, searchParams])

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null
      if (!target) return

      const clickable = target.closest<HTMLElement>('a[href],button,[role="button"],[data-track-event],[data-track="true"]')
      if (!clickable) return

      const classified = classifyEvent(clickable)
      if (!classified) return

      const currentPage = getCurrentPageUrl()
      const productInterest = inferProductInterest(clickable, classified.text, classified.href)
      const county = inferCounty(clickable, classified.text, classified.href)

      void sendEvent({
        ...getEventContext({
          pageUrl: currentPage,
          county: county ?? undefined,
          productInterest: productInterest ?? undefined,
        }),
        eventType: classified.eventType,
        county,
        productInterest,
        metadata: {
          label: classified.text,
          href: classified.href,
          placement: inferPlacement(clickable),
          tagName: clickable.tagName.toLowerCase(),
          id: clickable.id || null,
          target: clickable.getAttribute('target'),
        },
      })
    }

    document.addEventListener('click', handleClick, true)
    return () => document.removeEventListener('click', handleClick, true)
  }, [])

  return null
}
