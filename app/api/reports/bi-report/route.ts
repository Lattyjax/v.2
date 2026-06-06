import { NextRequest, NextResponse } from 'next/server'
import { requireAdminSession } from '@/lib/ai/shared'
import { createTextCompletion } from '@/lib/ai/client'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 300

const BUSINESS_NAME = 'Latimore Life & Legacy LLC'
const SERVICE_AREA = 'Schuylkill County, Pottsville, Coal Region, Luzerne County, Pennsylvania'
const CORE_OFFERS =
  'life insurance, living benefits, mortgage protection, annuities, retirement income planning, final expense, key person coverage, recruiting'
const STRATEGIC_PRIORITY =
  'move from brand-building into operational revenue execution with one funnel, CRM discipline, and measurable attribution'

async function step(prompt: string): Promise<string> {
  return createTextCompletion({
    system:
      'You are a senior business intelligence analyst for an independent insurance advisory firm. Be specific, practical, and business-focused.',
    user: prompt,
    temperature: 0.5,
  })
}

export async function POST(req: NextRequest) {
  const auth = await requireAdminSession()
  if (!auth.ok) return auth.response

  const body = await req.json()
  const {
    report_week,
    marketing_activity = '',
    sales_activity = '',
    crm_snapshot = '',
    operations_status = '',
    analytics_snapshot = '',
    community_notes = '',
  } = body as Record<string, string>

  if (!report_week) return NextResponse.json({ error: 'report_week is required' }, { status: 400 })

  // ── Step 1: Scaffold ──────────────────────────────────────────────────────────
  const scaffold = await step(
    `Create a structured weekly business intelligence scaffold for ${BUSINESS_NAME} for the week of ${report_week}. ` +
    `Context: service area: ${SERVICE_AREA}; core offers: ${CORE_OFFERS}; strategic priority: ${STRATEGIC_PRIORITY}. ` +
    `Output a concise planning brief with: executive theme, likely growth drivers, likely constraints, ` +
    `revenue opportunities, operational risks, and report structure.`
  )

  // ── Step 2: Parallel analysis nodes ──────────────────────────────────────────
  const [marketing, sales, crm, community] = await Promise.all([
    step(
      `Strategic context:\n${scaffold}\n\n` +
      `Analyze this week's marketing activity for ${BUSINESS_NAME}: ${marketing_activity || '(none provided)'}. ` +
      `Focus on positioning, local SEO relevance, campaign clarity, messaging pillars, conversion paths, attribution gaps. ` +
      `Output: wins, issues needing attention, strongest messaging pillars, weak spots, recommended marketing KPI targets for next week.`
    ),
    step(
      `Strategic context:\n${scaffold}\n\n` +
      `Analyze this week's sales activity for ${BUSINESS_NAME}: ${sales_activity || '(none provided)'}. ` +
      `Identify highest-ROI prospect segments, recommended offer lanes, pipeline risks, follow-up gaps, stage definitions. ` +
      `Output: current sales pipeline focus, priority segments, sales risk, recommended pipeline stages, required action by stage.`
    ),
    step(
      `Strategic context:\n${scaffold}\n\n` +
      `Review this CRM snapshot for ${BUSINESS_NAME}: ${crm_snapshot || '(none provided)'}. ` +
      `Identify urgent lead categories, missing data fields, follow-up risks, task rules. ` +
      `Output: immediate CRM priorities, urgency table, required lead fields, next-action rule, dropped-lead risk warning.`
    ),
    step(
      `Strategic context:\n${scaffold}\n\n` +
      `Analyze community and local-market opportunities for ${BUSINESS_NAME} in ${SERVICE_AREA} ` +
      `based on: ${community_notes || '(none provided)'}. ` +
      `Identify local events, seasonal hooks, networking opportunities, content angles supporting trust, referrals, ` +
      `family protection, business-owner protection, recruitment, and local SEO. ` +
      `Output: local opportunity watch, recommended community positioning, event-to-offer mapping, content ideas.`
    ),
  ])

  // ── Step 3: Ops & Analytics ───────────────────────────────────────────────────
  const ops = await step(
    `Prior findings:\n${scaffold}\n\nMarketing:\n${marketing}\n\nSales:\n${sales}\n\nCRM:\n${crm}\n\nCommunity:\n${community}\n\n` +
    `Analyze operational status and analytics readiness for ${BUSINESS_NAME}. ` +
    `Operations: ${operations_status || '(none provided)'}. Analytics: ${analytics_snapshot || '(none provided)'}. ` +
    `Identify deployment risks, admin/security risks, tracking gaps, brand/file management risks, proof-of-performance gaps. ` +
    `Output: deployment and tech issues, analytics requirements, brand operations concerns, critical risks, immediate fixes.`
  )

  // ── Step 4: ROI Actions ───────────────────────────────────────────────────────
  const roi = await step(
    `Based on all findings below, create the top 5 ROI actions for ${BUSINESS_NAME} for the next week.\n\n` +
    `Scaffold:\n${scaffold}\nMarketing:\n${marketing}\nSales:\n${sales}\nCRM:\n${crm}\nCommunity:\n${community}\nOps:\n${ops}\n\n` +
    `Each action must include: action title, ROI reason, exact execution step, owner/responsible function, measurable success indicator. ` +
    `Prioritize actions that improve revenue, lead capture, CRM discipline, conversion tracking, deployment readiness, local-market visibility.`
  )

  // ── Step 5: Final Report ──────────────────────────────────────────────────────
  const report = await step(
    `Synthesize all previous outputs into a polished Weekly Business Intelligence Report for ${BUSINESS_NAME}. ` +
    `Use a confident executive tone.\n\n` +
    `Scaffold:\n${scaffold}\nMarketing:\n${marketing}\nSales:\n${sales}\nCRM:\n${crm}\nCommunity:\n${community}\nOps:\n${ops}\nROI Actions:\n${roi}\n\n` +
    `Include these sections: Executive Summary, Marketing Performance, Sales Activity, CRM Priorities, Community Activity, ` +
    `Operations Issues, Top Wins This Week, Issues Requiring Immediate Attention, Next Week's Top 5 ROI Actions, Final Readout. ` +
    `Include a plain-language overall status. Make it specific, actionable, measurable, and suitable for leadership review.`
  )

  return NextResponse.json({
    ok: true,
    report_week,
    sections: { scaffold, marketing, sales, crm, community, ops, roi },
    report,
  })
}
