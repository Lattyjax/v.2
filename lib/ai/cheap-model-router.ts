import { SENTIMENT_SYSTEM_PROMPT, SentimentResult, safeParseSentiment } from './sentiment'

export type ModelProvider = 'gemini' | 'openai' | 'claude'

export type AnalyzeOptions = {
  preferredProvider?: ModelProvider
  forceProvider?: ModelProvider
  escalationAllowed?: boolean
}

export type AnalyzeResponse = {
  provider: ModelProvider
  model: string
  latencyMs: number
  result: SentimentResult
  rawText: string
}

/**
 * Cost-first routing: Gemini Flash-Lite → OpenAI nano/mini → Claude Haiku → local heuristic
 */
export async function analyzeSentimentWithRouter(
  text: string,
  options: AnalyzeOptions = {}
): Promise<AnalyzeResponse> {
  const provider = options.forceProvider || options.preferredProvider || 'gemini'

  try {
    const first = await callProvider(provider, text)
    if (first.result.confidence >= 0.65 || !options.escalationAllowed) return first
  } catch {
    // fall through to next provider
  }

  if (provider !== 'openai') {
    try {
      const fallback = await callProvider('openai', text)
      if (fallback.result.confidence >= 0.65 || !options.escalationAllowed) return fallback
    } catch {
      // fall through
    }
  }

  try {
    return await callProvider('claude', text)
  } catch {
    return localHeuristicAnalysis(text, Date.now())
  }
}

function localHeuristicAnalysis(text: string, started: number): AnalyzeResponse {
  const lowered = text.toLowerCase()
  const pos = ['great', 'thanks', 'helpful', 'love', 'excellent', 'interested'].some(t => lowered.includes(t))
  const neg = ['bad', 'angry', 'upset', 'scam', 'wrong', 'complaint', 'cancel'].some(t => lowered.includes(t))
  const purchase = ['cost', 'price', 'quote', 'appointment', 'call', 'coverage', 'policy'].some(t => lowered.includes(t))

  const result: SentimentResult = {
    sentiment: neg ? 'negative' : pos ? 'positive' : 'neutral',
    confidence: 0.52,
    intent: purchase ? 'purchase_interest' : lowered.includes('?') ? 'question' : 'other',
    urgency: neg || purchase ? 'medium' : 'low',
    topics: purchase ? ['insurance inquiry'] : ['general engagement'],
    trending_terms: [],
    lead_potential: purchase ? 'medium' : 'low',
    compliance_risk: lowered.includes('guarantee') || lowered.includes('return') ? 'medium' : 'none',
    recommended_action: purchase
      ? 'Review the comment and follow up with a consultation CTA.'
      : 'Monitor and respond if appropriate.',
  }

  return { provider: 'gemini', model: 'local-heuristic-fallback', latencyMs: Date.now() - started, result, rawText: JSON.stringify(result) }
}

function callProvider(provider: ModelProvider, text: string): Promise<AnalyzeResponse> {
  if (provider === 'gemini') return callGemini(text)
  if (provider === 'openai') return callOpenAI(text)
  return callClaude(text)
}

async function callGemini(text: string): Promise<AnalyzeResponse> {
  const started = Date.now()
  const key = process.env.GEMINI_API_KEY
  if (!key) throw new Error('GEMINI_API_KEY not configured')
  const model = process.env.GEMINI_SENTIMENT_MODEL || 'gemini-2.0-flash-lite'
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SENTIMENT_SYSTEM_PROMPT }] },
        contents: [{ role: 'user', parts: [{ text }] }],
        generationConfig: { temperature: 0.1, responseMimeType: 'application/json' },
      }),
    }
  )
  if (!res.ok) throw new Error(`Gemini ${res.status}`)
  const json = await res.json()
  const rawText = json.candidates?.[0]?.content?.parts?.[0]?.text || '{}'
  return { provider: 'gemini', model, latencyMs: Date.now() - started, result: safeParseSentiment(rawText), rawText }
}

async function callOpenAI(text: string): Promise<AnalyzeResponse> {
  const started = Date.now()
  const key = process.env.OPENAI_API_KEY
  if (!key) throw new Error('OPENAI_API_KEY not configured')
  const model = process.env.OPENAI_SENTIMENT_MODEL || 'gpt-4.1-nano'
  const res = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      input: [{ role: 'system', content: SENTIMENT_SYSTEM_PROMPT }, { role: 'user', content: text }],
      text: {
        format: {
          type: 'json_schema', name: 'sentiment_result',
          schema: {
            type: 'object', additionalProperties: false,
            properties: {
              sentiment: { type: 'string', enum: ['positive', 'neutral', 'negative', 'mixed'] },
              confidence: { type: 'number' },
              intent: { type: 'string', enum: ['question', 'complaint', 'praise', 'purchase_interest', 'support_request', 'other'] },
              urgency: { type: 'string', enum: ['low', 'medium', 'high'] },
              topics: { type: 'array', items: { type: 'string' } },
              trending_terms: { type: 'array', items: { type: 'string' } },
              lead_potential: { type: 'string', enum: ['low', 'medium', 'high'] },
              compliance_risk: { type: 'string', enum: ['none', 'low', 'medium', 'high'] },
              recommended_action: { type: 'string' },
            },
            required: ['sentiment', 'confidence', 'intent', 'urgency', 'topics', 'trending_terms', 'lead_potential', 'compliance_risk', 'recommended_action'],
          },
        },
      },
    }),
  })
  if (!res.ok) throw new Error(`OpenAI ${res.status}`)
  const json = await res.json()
  const rawText = json.output_text || json.output?.[0]?.content?.[0]?.text || '{}'
  return { provider: 'openai', model, latencyMs: Date.now() - started, result: safeParseSentiment(rawText), rawText }
}

async function callClaude(text: string): Promise<AnalyzeResponse> {
  const started = Date.now()
  const key = process.env.ANTHROPIC_API_KEY
  if (!key) throw new Error('ANTHROPIC_API_KEY not configured')
  const model = process.env.CLAUDE_SENTIMENT_MODEL || 'claude-haiku-4-5-20251001'
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01', 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, max_tokens: 800, temperature: 0.1, system: SENTIMENT_SYSTEM_PROMPT, messages: [{ role: 'user', content: text }] }),
  })
  if (!res.ok) throw new Error(`Claude ${res.status}`)
  const json = await res.json()
  const rawText = json.content?.[0]?.text || '{}'
  return { provider: 'claude', model, latencyMs: Date.now() - started, result: safeParseSentiment(rawText), rawText }
}
