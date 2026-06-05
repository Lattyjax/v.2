import { NextRequest, NextResponse } from 'next/server'
import { createOpenAIJsonCompletion } from '@/lib/ai/client'
import { requireAdminSession } from '@/lib/ai/shared'

const BRAND = `Latimore Life & Legacy LLC. Founder: Jackson M. Latimore Sr. Region: Schuylkill, Luzerne, and Northumberland Counties in Pennsylvania. Tagline: Protecting Today. Securing Tomorrow. Hashtag: #TheBeatGoesOn. Voice: education-first, practical, community-rooted, legacy-focused, urgent but never fear-based.`

const schemas: Record<string, any> = {
  socialContent: { type:'array', items:{ type:'object', properties:{ title:{type:'string'}, draft:{type:'string'}, platform:{type:'string'} }, required:['title','draft','platform'], additionalProperties:false } },
  assetContent: { type:'array', items:{ type:'object', properties:{ title:{type:'string'}, draft:{type:'string'}, platform:{type:'string'} }, required:['title','draft','platform'], additionalProperties:false } },
  bulkCampaign: { type:'array', items:{ type:'object', properties:{ title:{type:'string'}, draft:{type:'string'}, platform:{type:'string'}, sequenceDay:{type:'number'} }, required:['title','draft','platform','sequenceDay'], additionalProperties:false } },
  funnelStrategy: { type:'array', items:{ type:'object', properties:{ name:{type:'string'}, strategy:{type:'string'}, assetCopy:{type:'string'} }, required:['name','strategy','assetCopy'], additionalProperties:false } },
  templateStructure: { type:'object', properties:{ name:{type:'string'}, structure:{type:'string'} }, required:['name','structure'], additionalProperties:false },
  clientSnapshot: { type:'object', properties:{ whoTheyAre:{type:'string'}, familyContext:{type:'array',items:{type:'string'}}, financialPicture:{type:'array',items:{type:'string'}}, topGoals:{type:'array',items:{type:'string'}}, riskThemes:{type:'array',items:{type:'string'}}, summary:{type:'string'} }, required:['whoTheyAre','familyContext','financialPicture','topGoals','riskThemes','summary'], additionalProperties:false },
  reviewScript: { type:'object', properties:{ opening:{type:'string'}, discoveryQuestions:{type:'array',items:{type:'string'}}, strategicPivot:{type:'string'}, closing:{type:'string'} }, required:['opening','discoveryQuestions','strategicPivot','closing'], additionalProperties:false },
  socialStrategy: { type:'object', properties:{ ideas:{type:'array',items:{type:'object',properties:{title:{type:'string'},reasoning:{type:'string'}},required:['title','reasoning'],additionalProperties:false}}, captions:{type:'array',items:{type:'object',properties:{platform:{type:'string'},text:{type:'string'}},required:['platform','text'],additionalProperties:false}}, hashtags:{type:'array',items:{type:'string'}} }, required:['ideas','captions','hashtags'], additionalProperties:false },
  trends: { type:'array', items:{ type:'object', properties:{ theme:{type:'string'}, description:{type:'string'}, trendReason:{type:'string'} }, required:['theme','description','trendReason'], additionalProperties:false } },
  chat: { type:'object', properties:{ text:{type:'string'} }, required:['text'], additionalProperties:false },
}

function promptFor(action: string, input: any) {
  switch (action) {
    case 'socialContent': return `Generate 3 post drafts for ${input.platform} about: ${input.topic}. ${BRAND}`
    case 'assetContent': return `Analyze this uploaded asset data summary/base64 payload for marketing themes and generate 3 educational ${input.platform} social posts. MIME: ${input.mimeType}. Asset excerpt/base64: ${(input.base64Data || '').slice(0, 12000)}. ${BRAND}`
    case 'bulkCampaign': return `Architect a 4-post Legacy Campaign. Goal: ${input.goal}. Persona: ${input.persona}. Include sequence days 1,7,14,21. ${BRAND}`
    case 'funnelStrategy': return `Architect a 3-stage Legacy Funnel: Awareness, Engagement, Trust. Goal: ${input.goal}. Persona: ${input.persona}. ${BRAND}`
    case 'templateStructure': return `Create a concise social media content template for: ${input.prompt}. ${BRAND}`
    case 'clientSnapshot': return `Analyze client notes and household into an insurance CRM snapshot. Notes: ${input.notes}. Household: ${input.household}. ${BRAND}`
    case 'reviewScript': return `Create an annual review call script for this client JSON: ${JSON.stringify(input.clientData)}. ${BRAND}`
    case 'socialStrategy': return `Create 3 post ideas, 3 draft captions, and regional/industry hashtags for: ${input.topic}. ${BRAND}`
    case 'trends': return `Identify 3 current durable content themes related to life insurance, mortgage protection, annuities, IUL, and financial planning in Central Pennsylvania. Avoid unsupported claims. ${BRAND}`
    case 'chat': return `Answer as the Latimore Legacy Business Co-Pilot. User message: ${input.message}. ${BRAND}`
    default: return ''
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAdminSession()
  if (!auth.ok) return auth.response

  try {
    const body = await req.json()
    const action = String(body?.action || '')
    const schema = schemas[action]
    if (!schema) return NextResponse.json({ ok:false, error:'Unsupported Social OS AI action' }, { status:400 })
    const result = await createOpenAIJsonCompletion<any>({
      system: 'You are a server-side AI engine for an authenticated insurance admin dashboard. Return only schema-valid JSON.',
      user: promptFor(action, body),
      schemaName: `social_os_${action}`,
      schema,
      temperature: 0.35,
    })
    return NextResponse.json({ ok:true, data: result.output, model: result.model })
  } catch (e:any) {
    return NextResponse.json({ ok:false, error:e?.message || 'AI request failed' }, { status:500 })
  }
}
