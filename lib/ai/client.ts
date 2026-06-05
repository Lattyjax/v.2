type JsonSchema = Record<string, unknown>

type CompletionResult<T> = {
  model: string
  output: T
  usage?: {
    input_tokens?: number
    output_tokens?: number
    total_tokens?: number
  }
}

function getAiProvider() {
  return (process.env.AI_PROVIDER ?? 'openai').toLowerCase()
}

// ─── Plain-text completion (no JSON schema required) ──────────────────────────
export async function createTextCompletion({
  system,
  user,
  temperature = 0.7,
}: {
  system: string
  user: string
  temperature?: number
}): Promise<string> {
  const provider = getAiProvider()
  if (provider === 'gemini') return createGeminiTextCompletion({ system, user, temperature })
  return createOpenAiTextCompletion({ system, user, temperature })
}

async function createOpenAiTextCompletion({
  system,
  user,
  temperature,
}: {
  system: string
  user: string
  temperature: number
}): Promise<string> {
  if (!process.env.OPENAI_API_KEY) throw new Error('Missing OPENAI_API_KEY')
  const model = process.env.OPENAI_MODEL ?? 'gpt-4.1-mini'
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
    body: JSON.stringify({ model, temperature, messages: [{ role: 'system', content: system }, { role: 'user', content: user }] }),
    cache: 'no-store',
  })
  const json = await res.json().catch(() => null)
  if (!res.ok) throw new Error(json?.error?.message ?? 'OpenAI request failed')
  const text = json?.choices?.[0]?.message?.content
  if (!text) throw new Error('OpenAI returned empty output')
  return text as string
}

async function createGeminiTextCompletion({
  system,
  user,
  temperature,
}: {
  system: string
  user: string
  temperature: number
}): Promise<string> {
  if (!process.env.GEMINI_API_KEY) throw new Error('Missing GEMINI_API_KEY')
  const model = process.env.GEMINI_MODEL ?? 'gemini-1.5-flash'
  const normalizedModel = model.startsWith('models/') ? model : `models/${model}`
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/${normalizedModel}:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: 'user', parts: [{ text: user }] }],
        generationConfig: { temperature },
      }),
      cache: 'no-store',
    }
  )
  const json = await res.json().catch(() => null)
  if (!res.ok) throw new Error(`Gemini request failed (${res.status}): ${JSON.stringify(json)}`)
  const text = json?.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) throw new Error('Gemini returned empty output')
  return text as string
}
// ─────────────────────────────────────────────────────────────────────────────

export async function createOpenAIJsonCompletion<T>({
  model,
  system,
  user,
  schemaName,
  schema,
  temperature = 0.2,
}: {
  model?: string
  system: string
  user: string
  schemaName: string
  schema: JsonSchema
  temperature?: number
}): Promise<CompletionResult<T>> {
  const provider = getAiProvider()

  if (provider === 'gemini') {
    return createGeminiJsonCompletion<T>({
      model: model ?? process.env.GEMINI_MODEL ?? 'gemini-1.5-flash',
      system,
      user,
      schemaName,
      schema,
      temperature,
    })
  }

  return createOpenAiProviderJsonCompletion<T>({
    model: model ?? process.env.OPENAI_MODEL ?? 'gpt-4.1-mini',
    system,
    user,
    schemaName,
    schema,
    temperature,
  })
}

async function createOpenAiProviderJsonCompletion<T>({
  model,
  system,
  user,
  schemaName,
  schema,
  temperature = 0.2,
}: {
  model: string
  system: string
  user: string
  schemaName: string
  schema: JsonSchema
  temperature?: number
}): Promise<CompletionResult<T>> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('Missing OPENAI_API_KEY')
  }

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      temperature,
      input: [
        { role: 'system', content: [{ type: 'input_text', text: system }] },
        { role: 'user', content: [{ type: 'input_text', text: user }] },
      ],
      text: {
        format: {
          type: 'json_schema',
          name: schemaName,
          strict: true,
          schema,
        },
      },
    }),
    cache: 'no-store',
  })

  const json = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(json?.error?.message ?? 'OpenAI request failed')
  }

  const text =
    json?.output_text ??
    json?.output
      ?.flatMap((item: any) => item?.content ?? [])
      ?.find((c: any) => c?.type === 'output_text')
      ?.text

  if (!text || typeof text !== 'string') {
    throw new Error('OpenAI returned empty output')
  }

  return {
    model: json?.model ?? model,
    output: JSON.parse(text) as T,
    usage: json?.usage,
  }
}

async function createGeminiJsonCompletion<T>({
  model,
  system,
  user,
  schemaName,
  schema,
  temperature = 0.2,
}: {
  model: string
  system: string
  user: string
  schemaName: string
  schema: JsonSchema
  temperature?: number
}): Promise<CompletionResult<T>> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('Missing GEMINI_API_KEY')
  }

  const prompt = [
    system,
    '',
    `Return ONLY valid JSON for schema "${schemaName}". Do not include markdown fences or commentary.`,
    '',
    'JSON Schema:',
    JSON.stringify(schema),
    '',
    'User request:',
    user,
  ].join('\n')

  const normalizedModel = model.startsWith('models/') ? model : `models/${model}`

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/${normalizedModel}:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        generationConfig: {
          temperature,
          responseMimeType: 'application/json',
        },
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }],
          },
        ],
      }),
      cache: 'no-store',
    }
  )

  const rawText = await response.text()
  let json: any = null

  try {
    json = rawText ? JSON.parse(rawText) : null
  } catch {
    json = null
  }

  if (!response.ok) {
    throw new Error(
      `Gemini request failed (${response.status} ${response.statusText}): ${rawText || 'empty response'}`
    )
  }

  const text =
    json?.candidates?.[0]?.content?.parts
      ?.map((part: any) => part?.text ?? '')
      .join('') ?? ''

  if (!text || typeof text !== 'string') {
    throw new Error('Gemini returned empty output')
  }

  let parsed: T
  try {
    parsed = JSON.parse(text) as T
  } catch {
    throw new Error(`Gemini returned invalid JSON: ${text}`)
  }

  return {
    model,
    output: parsed,
    usage: {
      input_tokens: json?.usageMetadata?.promptTokenCount,
      output_tokens: json?.usageMetadata?.candidatesTokenCount,
      total_tokens: json?.usageMetadata?.totalTokenCount,
    },
  }
}