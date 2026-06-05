type AttributionInput = {
  pageUrl?: string | null
  landingPage?: string | null
  referrer?: string | null
  source?: string | null
  medium?: string | null
  campaign?: string | null
  term?: string | null
  content?: string | null
  county?: string | null
  productInterest?: string | null
}

export type AttributionResult = {
  landingPage: string | null
  referrer: string | null
  source: string | null
  medium: string | null
  campaign: string | null
  term: string | null
  content: string | null
  county: string | null
  productInterest: string | null
}

function clean(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

export function extractAttribution(input: AttributionInput): AttributionResult {
  return {
    landingPage: clean(input.landingPage) ?? clean(input.pageUrl),
    referrer: clean(input.referrer),
    source: clean(input.source),
    medium: clean(input.medium),
    campaign: clean(input.campaign),
    term: clean(input.term),
    content: clean(input.content),
    county: clean(input.county),
    productInterest: clean(input.productInterest),
  }
}