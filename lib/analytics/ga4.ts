export function trackDashboardEvent(name: string, params: Record<string, unknown> = {}) {
  if (typeof window === 'undefined') return
  const gtag = (window as any).gtag
  if (!gtag) return
  gtag('event', name, { dashboard: 'engagement_intelligence', ...params })
}

export const GA4_EVENTS = {
  DASHBOARD_VIEW: 'dashboard_view',
  CTA_CLICK: 'cta_click',
  FORM_SUBMIT: 'form_submit',
  SOCIAL_POST_CLICK: 'social_post_click',
  REPORT_EXPORT: 'report_export',
  WIDGET_CUSTOMIZED: 'widget_customized',
  INSIGHT_VIEWED: 'insight_viewed',
  SENTIMENT_ANALYZED: 'sentiment_analyzed',
}

export const ga4 = {
  event: trackDashboardEvent,
  track: trackDashboardEvent,
  pageview: (path?: string) => {
    if (typeof window === 'undefined') return
    const gtag = (window as any).gtag
    if (!gtag) return
    gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID, {
      page_path: path ?? window.location.pathname,
    })
  },
}
