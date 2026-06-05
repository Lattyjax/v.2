export const dynamic = 'force-dynamic'

import { Bot } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import PageHeader from '../_components/PageHeader'
import AdminCard from '../_components/AdminCard'
import EmptyState from '../_components/EmptyState'
import StatPill from '../_components/StatPill'

/* ----------------------------- Types ----------------------------- */

type DailyBriefOutput = {
  brief?: {
    summary?: string
    recommendedFocus?: string[]
  }
}

type ContactBriefOutput = {
  brief?: {
    summary?: string
    relationshipStatus?: string
  }
}

type DraftMessageOutput = {
  channel?: string
  draft?: {
    message?: string
  }
}

type LeadScoreOutput = {
  result?: {
    total?: number
    category?: string
  }
}

type AiRunOutput =
  | DailyBriefOutput
  | ContactBriefOutput
  | DraftMessageOutput
  | LeadScoreOutput
  | Record<string, unknown>

/* ----------------------------- Helpers ----------------------------- */

function fmtDate(value?: Date | null) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(value)
}

function displayName(contact?: {
  fullName?: string | null
  firstName?: string | null
  lastName?: string | null
  email?: string | null
  phone?: string | null
} | null) {
  if (!contact) return 'Unknown Contact'
  return (
    contact.fullName ||
    [contact.firstName, contact.lastName].filter(Boolean).join(' ') ||
    contact.email ||
    contact.phone ||
    'Unknown Contact'
  )
}

/* ----------------------------- Page ----------------------------- */

export default async function AiAdvisorPage() {
  let latestDailyBrief = null
  let latestContactBriefs: any[] = []
  let latestDrafts: any[] = []
  let latestScores: any[] = []

  try {
    const [brief, contactBriefs, drafts, scores] = await Promise.all([
      prisma.aiRun.findFirst({
        where: { type: 'daily_brief', status: 'succeeded' },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.aiRun.findMany({
        where: { type: 'contact_brief', status: 'succeeded' },
        orderBy: { createdAt: 'desc' },
        take: 6,
        include: { contact: true },
      }),
      prisma.aiRun.findMany({
        where: { type: 'draft_message', status: 'succeeded' },
        orderBy: { createdAt: 'desc' },
        take: 6,
        include: { contact: true },
      }),
      prisma.aiRun.findMany({
        where: { type: 'lead_score', status: 'succeeded' },
        orderBy: { createdAt: 'desc' },
        take: 6,
        include: { contact: true },
      }),
    ])

    latestDailyBrief = brief
    latestContactBriefs = contactBriefs
    latestDrafts = drafts
    latestScores = scores
  } catch (err) {
    console.warn('AI Advisor DB connection failed:', err)
  }

  const brief = (latestDailyBrief?.output ?? {}) as DailyBriefOutput

  return (
    <div className="p-6 md:p-8">
      <PageHeader
        eyebrow="Legacy AI Advisor"
        title="AI operating panel"
        description="Review the latest AI briefs, message drafts, contact summaries, and score calculations generated from CRM data."
      />

      <div className="grid gap-4 xl:grid-cols-[1.2fr,1fr]">
        {/* ---------------- Daily Brief ---------------- */}
        <AdminCard
          title="Latest daily brief"
          subtitle={
            latestDailyBrief
              ? `Generated ${fmtDate(latestDailyBrief.createdAt)}`
              : 'No successful daily brief yet'
          }
        >
          {!brief?.brief ? (
            <EmptyState
              title="No AI brief available"
              description="Run /api/ai/daily-brief to create the latest operating summary."
              icon={<Bot size={18} />}
            />
          ) : (
            <div className="space-y-4">
              <div className="rounded-2xl border border-[#C9A25F]/15 bg-[#C9A25F]/6 p-4">
                <p className="text-sm leading-6 text-[#F7F7F5]">
                  {brief.brief.summary ?? 'No summary available.'}
                </p>
              </div>

              <div className="space-y-2">
                {(brief.brief.recommendedFocus ?? [])
                  .slice(0, 4)
                  .map((item, i) => (
                    <div
                      key={i}
                      className="rounded-xl border border-white/8 bg-white/[0.02] p-3 text-sm text-[#E6EAF0]"
                    >
                      {item}
                    </div>
                  ))}
              </div>
            </div>
          )}
        </AdminCard>

        {/* ---------------- Scores + Drafts ---------------- */}
        <div className="space-y-4">
          {/* Scores */}
          <AdminCard title="Latest score runs">
            {latestScores.length === 0 ? (
              <EmptyState title="No score runs yet" />
            ) : (
              <div className="space-y-3">
                {latestScores.map((run) => {
                  const output = (run.output ?? {}) as LeadScoreOutput
                  return (
                    <div
                      key={run.id}
                      className="rounded-xl border border-white/8 bg-white/[0.02] p-3"
                    >
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-white">
                          {displayName(run.contact)}
                        </p>
                        <StatPill
                          label="Score"
                          value={output?.result?.total ?? '—'}
                        />
                      </div>
                      <p className="text-xs text-[#A9B1BE]">
                        {output?.result?.category ?? 'Unknown'} ·{' '}
                        {fmtDate(run.createdAt)}
                      </p>
                    </div>
                  )
                })}
              </div>
            )}
          </AdminCard>

          {/* Drafts */}
          <AdminCard title="Recent message drafts">
            {latestDrafts.length === 0 ? (
              <EmptyState title="No drafts yet" />
            ) : (
              <div className="space-y-3">
                {latestDrafts.map((run) => {
                  const output = (run.output ?? {}) as DraftMessageOutput
                  return (
                    <div
                      key={run.id}
                      className="rounded-xl border border-white/8 bg-white/[0.02] p-3"
                    >
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-white">
                          {displayName(run.contact)}
                        </p>
                        <StatPill
                          label="Channel"
                          value={output?.channel ?? '—'}
                        />
                      </div>
                      <p className="line-clamp-3 text-sm leading-6 text-[#E6EAF0]">
                        {output?.draft?.message ?? 'No message available.'}
                      </p>
                    </div>
                  )
                })}
              </div>
            )}
          </AdminCard>
        </div>
      </div>

      {/* ---------------- Contact Briefs ---------------- */}
      <div className="mt-4">
        <AdminCard title="Recent contact briefs">
          {latestContactBriefs.length === 0 ? (
            <EmptyState title="No contact briefs yet" />
          ) : (
            <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
              {latestContactBriefs.map((run) => {
                const output = (run.output ?? {}) as ContactBriefOutput
                return (
                  <div
                    key={run.id}
                    className="rounded-2xl border border-white/8 bg-white/[0.02] p-4"
                  >
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-white">
                        {displayName(run.contact)}
                      </p>
                      <StatPill
                        label="Status"
                        value={output?.brief?.relationshipStatus ?? '—'}
                      />
                    </div>
                    <p className="text-sm leading-6 text-[#E6EAF0]">
                      {output?.brief?.summary ?? 'No summary available.'}
                    </p>
                  </div>
                )
              })}
            </div>
          )}
        </AdminCard>
      </div>
    </div>
  )
}
