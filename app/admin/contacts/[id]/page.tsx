export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import PageHeader from '../../_components/PageHeader'
import AdminCard from '../../_components/AdminCard'
import StatPill from '../../_components/StatPill'
import EmptyState from '../../_components/EmptyState'

function fmtDate(value?: Date | null) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(value)
}

function displayName(contact: { fullName?: string | null; firstName?: string | null; lastName?: string | null; email?: string | null; phone?: string | null }) {
  return contact.fullName || [contact.firstName, contact.lastName].filter(Boolean).join(' ') || contact.email || contact.phone || 'Unknown Contact'
}

export default async function ContactDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const contact = await prisma.contact.findUnique({
    where: { id },
    include: {
      inquiries: { orderBy: { updatedAt: 'desc' } },
      tasks: { orderBy: { dueAt: 'asc' } },
      conversationThreads: { include: { messages: { orderBy: { createdAt: 'desc' }, take: 20 } }, orderBy: { updatedAt: 'desc' } },
      notes: { orderBy: { createdAt: 'desc' } },
      aiRuns: { orderBy: { createdAt: 'desc' }, take: 10 },
      systemEvents: { orderBy: { occurredAt: 'desc' }, take: 20 },
      appointments: { orderBy: { scheduledFor: 'desc' } },
      calendarEvents: { orderBy: { startAt: 'desc' }, take: 10 },
    },
  })
  if (!contact) return notFound()

  // Extract join application details from contact notes
  const joinNote = contact.notes?.find((note) => note.title?.toLowerCase().includes('join application'))
  let joinDetails: { key: string; value: string }[] = []
  if (joinNote?.body) {
    joinDetails = joinNote.body
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.includes(':'))
      .map((line) => {
        const [key, ...rest] = line.split(':')
        return { key: key.trim(), value: rest.join(':').trim() }
      })
      .filter((item) => item.value)
  }

  return (
    <div className="p-6 md:p-8 space-y-4">
      <PageHeader eyebrow="CRM Contact" title={displayName(contact)} description="Complete contact profile, pipeline status, communications, and AI insights." />
      <div className="grid gap-4 xl:grid-cols-[1fr,1.2fr]">
        <AdminCard title="Profile">
          <div className="grid gap-3 md:grid-cols-2 text-sm text-[#D7DCE5]">
            <div>Email: {contact.email ?? '—'}</div>
            <div>Phone: {contact.phone ?? '—'}</div>
            <div>County: {contact.county ?? '—'}</div>
            <div>Lead Score: {contact.leadScore}</div>
            <div>Source: {contact.primarySource ?? '—'}</div>
            <div>Campaign: {contact.primaryCampaign ?? '—'}</div>
            <div>Last Activity: {fmtDate(contact.lastActivityAt)}</div>
            <div>Next Follow-Up: {fmtDate(contact.nextFollowUpAt)}</div>
          </div>
        </AdminCard>
        <AdminCard title="Pipeline">
          {contact.inquiries.length === 0 ? <EmptyState title="No pipeline entries" /> : <div className="space-y-3">{contact.inquiries.map((inq) => <div key={inq.id} className="border border-white/8 rounded-xl p-4"><div className="flex justify-between gap-3"><div><p className="font-semibold text-white">{inq.productInterest}</p><p className="text-xs text-[#A9B1BE]">Source: {inq.source ?? 'Unknown'}</p></div><div className="flex gap-2"><StatPill label="Stage" value={inq.stage} /><StatPill label="Score" value={inq.leadScore} /></div></div><p className="mt-2 text-sm text-[#D7DCE5]">{inq.notes ?? 'No notes'}</p></div>)}</div>}
        </AdminCard>
      </div>

      {/* Show join application details if available */}
      {joinDetails.length > 0 && (
        <AdminCard title="Application Info">
          <div className="grid gap-3 md:grid-cols-2 text-sm text-[#D7DCE5]">
            {joinDetails.map(({ key, value }, idx) => (
              <div key={idx} className="flex flex-col gap-1">
                <span className="font-medium text-white">{key}</span>
                <span className="text-[#D7DCE5]">{value}</span>
              </div>
            ))}
          </div>
        </AdminCard>
      )}

      <div className="grid gap-4 xl:grid-cols-2">
        <AdminCard title="Tasks">
          {contact.tasks.length === 0 ? <EmptyState title="No tasks yet" /> : <div className="space-y-2">{contact.tasks.map((task) => <div key={task.id} className="border border-white/8 rounded-xl p-3"><div className="flex justify-between"><p className="text-white">{task.title}</p><StatPill label="Status" value={task.status} /></div><p className="text-xs text-[#A9B1BE] mt-1">Due: {fmtDate(task.dueAt)}</p>{task.description ? <p className="mt-2 text-sm text-[#D7DCE5]">{task.description}</p> : null}</div>)}</div>}
        </AdminCard>
        <AdminCard title="Appointments & Calendar">
          {contact.calendarEvents.length === 0 && contact.appointments.length === 0 ? <EmptyState title="No scheduling activity yet" /> : <div className="space-y-2">
            {contact.calendarEvents.map((event) => <div key={event.id} className="border border-white/8 rounded-xl p-3"><div className="flex justify-between gap-3"><p className="text-white">{event.title}</p><StatPill label="Status" value={event.status} /></div><p className="text-xs text-[#A9B1BE] mt-1">{fmtDate(event.startAt)} · {event.provider}</p>{event.meetingUrl ? <p className="mt-2 truncate text-sm text-[#D7DCE5]">{event.meetingUrl}</p> : null}</div>)}
          </div>}
        </AdminCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <AdminCard title="Recent Messages">
          {contact.conversationThreads.length === 0 ? <EmptyState title="No conversations yet" /> : <div className="space-y-4">{contact.conversationThreads.map((thread) => <div key={thread.id}><p className="mb-2 text-xs uppercase tracking-[0.16em] text-[#A9B1BE]">{thread.channel}</p>{thread.messages.map((msg) => <div key={msg.id} className="mb-2 border border-white/8 rounded-lg p-3 text-sm"><p className="text-[#E6EAF0]">{msg.bodyText ?? '(No body)'}</p><p className="text-xs text-[#8F98A8] mt-1">{msg.direction} · {fmtDate(msg.createdAt)}</p></div>)}</div>)}</div>}
        </AdminCard>
        <AdminCard title="AI Insights">
          {contact.aiRuns.length === 0 ? <EmptyState title="No AI insights yet" /> : <div className="space-y-2">{contact.aiRuns.map((run) => <div key={run.id} className="border border-white/8 rounded-xl p-3"><div className="flex justify-between gap-3"><p className="text-sm font-semibold text-white">{run.type}</p><StatPill label="Status" value={run.status} /></div><p className="text-xs text-[#A9B1BE] mt-1">{fmtDate(run.createdAt)}</p></div>)}</div>}
        </AdminCard>
      </div>

      <AdminCard title="System Events">
        {contact.systemEvents.length === 0 ? <EmptyState title="No system events yet" /> : <div className="space-y-2">{contact.systemEvents.map((event) => <div key={event.id} className="border border-white/8 rounded-xl p-3"><div className="flex justify-between"><p className="text-sm text-white">{event.type}</p><p className="text-xs text-[#8F98A8]">{fmtDate(event.occurredAt)}</p></div><p className="text-xs text-[#A9B1BE] mt-1">{[event.source, event.medium, event.campaign].filter(Boolean).join(' · ') || 'No attribution'}</p></div>)}</div>}
      </AdminCard>
    </div>
  )
}
