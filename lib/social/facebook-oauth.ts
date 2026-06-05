export const GRAPH_VERSION = process.env.META_GRAPH_VERSION ?? 'v25.0'
const GRAPH_BASE = `https://graph.facebook.com/${GRAPH_VERSION}`

export type FacebookPage = {
  id: string
  name: string
  access_token: string
  category: string
  tasks?: string[]
}

export type FacebookTokenInfo = {
  app_id: string
  type: string
  expires_at?: number
  data_access_expires_at?: number
  is_valid: boolean
  scopes?: string[]
  user_id?: string
}

/** Build the Facebook OAuth dialog URL. */
export function buildFacebookOAuthUrl(redirectUri: string, state: string): string {
  const appId = process.env.FB_APP_ID
  if (!appId) throw new Error('FB_APP_ID is not configured')

  const scopes = [
    'pages_manage_posts',
    'pages_read_engagement',
    'pages_show_list',
    'leads_retrieval',
    'pages_read_user_content',
  ].join(',')

  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: redirectUri,
    scope: scopes,
    state,
    response_type: 'code',
  })

  return `https://www.facebook.com/${GRAPH_VERSION}/dialog/oauth?${params}`
}

/** Exchange an authorization code for a short-lived user access token. */
export async function exchangeCodeForToken(code: string, redirectUri: string): Promise<string> {
  const appId = process.env.FB_APP_ID
  const appSecret = process.env.FB_APP_SECRET
  if (!appId || !appSecret) throw new Error('FB_APP_ID or FB_APP_SECRET is not configured')

  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: redirectUri,
    client_secret: appSecret,
    code,
  })

  const res = await fetch(`${GRAPH_BASE}/oauth/access_token?${params}`)
  const data = await res.json()
  if (!res.ok || data.error) {
    throw new Error(`Facebook token exchange failed: ${data.error?.message ?? res.status}`)
  }
  return data.access_token as string
}

/** Exchange a short-lived user token for a long-lived user token (60-day). */
export async function getLongLivedUserToken(shortLivedToken: string): Promise<{ token: string; expiresIn: number }> {
  const appId = process.env.FB_APP_ID
  const appSecret = process.env.FB_APP_SECRET
  if (!appId || !appSecret) throw new Error('FB_APP_ID or FB_APP_SECRET is not configured')

  const params = new URLSearchParams({
    grant_type: 'fb_exchange_token',
    client_id: appId,
    client_secret: appSecret,
    fb_exchange_token: shortLivedToken,
  })

  const res = await fetch(`${GRAPH_BASE}/oauth/access_token?${params}`)
  const data = await res.json()
  if (!res.ok || data.error) {
    throw new Error(`Long-lived token exchange failed: ${data.error?.message ?? res.status}`)
  }
  return { token: data.access_token as string, expiresIn: data.expires_in as number }
}

/** Fetch all Facebook Pages the user manages, with their page access tokens. */
export async function getUserPages(userAccessToken: string): Promise<FacebookPage[]> {
  const params = new URLSearchParams({
    fields: 'id,name,access_token,category,tasks',
    access_token: userAccessToken,
  })
  const res = await fetch(`${GRAPH_BASE}/me/accounts?${params}`)
  const data = await res.json()
  if (!res.ok || data.error) {
    throw new Error(`Failed to fetch Facebook pages: ${data.error?.message ?? res.status}`)
  }
  return (data.data ?? []) as FacebookPage[]
}

/** Inspect a token to check validity, scopes, and expiry. */
export async function inspectToken(inputToken: string): Promise<FacebookTokenInfo> {
  const appId = process.env.FB_APP_ID
  const appSecret = process.env.FB_APP_SECRET
  if (!appId || !appSecret) throw new Error('FB_APP_ID or FB_APP_SECRET is not configured')

  const appToken = `${appId}|${appSecret}`
  const params = new URLSearchParams({
    input_token: inputToken,
    access_token: appToken,
  })

  const res = await fetch(`${GRAPH_BASE}/debug_token?${params}`)
  const data = await res.json()
  if (!res.ok || data.error) {
    throw new Error(`Token inspection failed: ${data.error?.message ?? res.status}`)
  }
  return data.data as FacebookTokenInfo
}

/** Refresh a long-lived user token (re-exchange to reset the 60-day window). */
export async function refreshUserToken(longLivedToken: string): Promise<{ token: string; expiresIn: number }> {
  return getLongLivedUserToken(longLivedToken)
}

/** Fetch Page Insights metrics for a given page. */
export type PageInsightsResult = {
  pageId: string
  pageName: string
  metrics: Array<{
    name: string
    period: string
    values: Array<{ value: number | Record<string, number>; end_time: string }>
  }>
}

export async function fetchPageInsights(
  pageId: string,
  pageAccessToken: string,
  metrics: string[] = ['page_impressions', 'page_engaged_users', 'page_fans', 'page_post_engagements'],
  period: 'day' | 'week' | 'month' | 'lifetime' = 'week'
): Promise<PageInsightsResult> {
  const params = new URLSearchParams({
    metric: metrics.join(','),
    period,
    access_token: pageAccessToken,
  })

  const [insightsRes, pageRes] = await Promise.all([
    fetch(`${GRAPH_BASE}/${pageId}/insights?${params}`),
    fetch(`${GRAPH_BASE}/${pageId}?${new URLSearchParams({ fields: 'name', access_token: pageAccessToken })}`),
  ])

  const [insightsData, pageData] = await Promise.all([insightsRes.json(), pageRes.json()])

  if (!insightsRes.ok || insightsData.error) {
    throw new Error(`Page Insights fetch failed: ${insightsData.error?.message ?? insightsRes.status}`)
  }

  return {
    pageId,
    pageName: pageData.name ?? pageId,
    metrics: insightsData.data ?? [],
  }
}
