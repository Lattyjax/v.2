export type SentimentResult = {
  sentiment: 'positive' | 'neutral' | 'negative' | 'mixed'
  confidence: number
  intent: 'question' | 'complaint' | 'praise' | 'purchase_interest' | 'support_request' | 'other'
  urgency: 'low' | 'medium' | 'high'
  topics: string[]
  trending_terms: string[]
  lead_potential: 'low' | 'medium' | 'high'
  compliance_risk: 'none' | 'low' | 'medium' | 'high'
  recommended_action: string
}

export const SENTIMENT_SYSTEM_PROMPT = `
You analyze social media comments for a licensed insurance/financial services business.
Return only valid JSON. Do not include markdown.

Classify:
- sentiment
- confidence from 0 to 1
- intent
- urgency
- topics
- trending_terms
- lead_potential
- compliance_risk
- recommended_action

Be conservative about compliance risk.
Flag comments asking for guarantees, investment returns, medical advice, or policy-specific promises.
`

export function safeParseSentiment(raw: string): SentimentResult {
  const cleaned = raw
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```$/i, '')
    .trim()

  const parsed = JSON.parse(cleaned)
  return {
    sentiment: parsed.sentiment ?? 'neutral',
    confidence: Number(parsed.confidence ?? 0.5),
    intent: parsed.intent ?? 'other',
    urgency: parsed.urgency ?? 'low',
    topics: Array.isArray(parsed.topics) ? parsed.topics : [],
    trending_terms: Array.isArray(parsed.trending_terms) ? parsed.trending_terms : [],
    lead_potential: parsed.lead_potential ?? 'low',
    compliance_risk: parsed.compliance_risk ?? 'none',
    recommended_action: parsed.recommended_action ?? 'Review manually.',
  }
}
