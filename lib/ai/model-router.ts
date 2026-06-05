import { createOpenAIJsonCompletion, createTextCompletion } from './client'

export type SentimentResult = {
  sentiment: 'positive' | 'neutral' | 'negative' | 'mixed'
  confidence: number
  intent: string
  urgency: 'low' | 'medium' | 'high'
  topics: string[]
  trending_terms: string[]
  lead_potential: 'low' | 'medium' | 'high'
  compliance_risk: 'none' | 'low' | 'medium' | 'high'
  recommended_action: string
}

const SENTIMENT_SCHEMA = {
  type: 'object',
  properties: {
    sentiment: { type: 'string', enum: ['positive', 'neutral', 'negative', 'mixed'] },
    confidence: { type: 'number' },
    intent: { type: 'string' },
    urgency: { type: 'string', enum: ['low', 'medium', 'high'] },
    topics: { type: 'array', items: { type: 'string' } },
    trending_terms: { type: 'array', items: { type: 'string' } },
    lead_potential: { type: 'string', enum: ['low', 'medium', 'high'] },
    compliance_risk: { type: 'string', enum: ['none', 'low', 'medium', 'high'] },
    recommended_action: { type: 'string' },
  },
  required: ['sentiment', 'confidence', 'intent', 'urgency', 'topics', 'trending_terms', 'lead_potential', 'compliance_risk', 'recommended_action'],
  additionalProperties: false,
}

const SYSTEM_PROMPT = `You are an AI assistant for an independent insurance advisor in Pennsylvania.
Analyze social media comments and messages for sentiment, intent, urgency, topic relevance, compliance risk, and lead potential.
Return analysis strictly matching the requested JSON schema.
Flag any content that makes specific financial promises, guarantees returns, or provides individualized advice — that is a compliance risk.`

export async function analyzeSentiment(text: string): Promise<{ result: SentimentResult; model: string; provider: string }> {
  const user = `Analyze this comment or message:\n\n"${text}"`

  try {
    const { output, model } = await createOpenAIJsonCompletion<SentimentResult>({
      system: SYSTEM_PROMPT,
      user,
      schemaName: 'sentiment_analysis',
      schema: SENTIMENT_SCHEMA,
      temperature: 0.1,
    })
    return { result: output, model, provider: process.env.AI_PROVIDER ?? 'openai' }
  } catch {
    // Fallback: plain text parse
    const raw = await createTextCompletion({
      system: SYSTEM_PROMPT + '\n\nReturn ONLY valid JSON matching the schema. No markdown.',
      user: user + '\n\nSchema: ' + JSON.stringify(SENTIMENT_SCHEMA),
      temperature: 0.1,
    })
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    return {
      result: JSON.parse(cleaned) as SentimentResult,
      model: process.env.GEMINI_MODEL ?? 'gemini-fallback',
      provider: 'fallback',
    }
  }
}
