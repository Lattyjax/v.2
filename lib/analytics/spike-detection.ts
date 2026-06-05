export function detectSpike(
  currentEngagement: number,
  baseline: number,
  minVolume = 20,
  multiplier = 2
): boolean {
  if (currentEngagement < minVolume) return false
  if (baseline <= 0) return currentEngagement >= minVolume
  return currentEngagement >= baseline * multiplier
}

export function calcEngagementRate(
  reactions: number,
  comments: number,
  shares: number,
  reach: number
): number {
  if (reach <= 0) return 0
  return ((reactions + comments + shares) / reach) * 100
}

export function calcBaseline(values: number[]): number {
  if (!values.length) return 0
  return values.reduce((a, b) => a + b, 0) / values.length
}
