export type EngagementMetricInput = {
  impressions?: number
  reach?: number
  clicks?: number
  reactions?: number
  comments?: number
  shares?: number
  saves?: number
  leads?: number
  conversions?: number
}

export function calculateEngagement(metric: EngagementMetricInput) {
  return (
    Number(metric.clicks || 0) +
    Number(metric.reactions || 0) +
    Number(metric.comments || 0) +
    Number(metric.shares || 0) +
    Number(metric.saves || 0)
  )
}

export function calculateEngagementRate(metric: EngagementMetricInput) {
  const denominator = Number(metric.reach || metric.impressions || 0)
  if (!denominator) return 0
  return calculateEngagement(metric) / denominator
}

export function detectSpike(currentEngagement: number, baseline: number, minVolume = 20, multiplier = 2) {
  if (currentEngagement < minVolume) return false
  if (baseline <= 0) return currentEngagement >= minVolume
  return currentEngagement >= baseline * multiplier
}

export function normalizePlatformMetric(platform: string, raw: Record<string, unknown>): EngagementMetricInput {
  return {
    impressions: Number(raw.impressions || raw.impression_count || 0),
    reach: Number(raw.reach || raw.reach_count || 0),
    clicks: Number(raw.clicks || raw.link_clicks || raw.website_clicks || 0),
    reactions: Number(raw.reactions || raw.likes || raw.like_count || 0),
    comments: Number(raw.comments || raw.comment_count || 0),
    shares: Number(raw.shares || raw.share_count || 0),
    saves: Number(raw.saves || raw.saved || 0),
    leads: Number(raw.leads || raw.lead_count || 0),
    conversions: Number(raw.conversions || raw.conversion_count || 0),
  }
}
