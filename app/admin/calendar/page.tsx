import { prisma } from '@/lib/prisma'
import PageHeader from '../_components/PageHeader'
import StatPill from '../_components/StatPill'
import EmptyState from '../_components/EmptyState'
import { CalendarDays } from 'lucide-react'

export const dynamic = 'force-dynamic'

function fmtDate(value: Date | null | undefined) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(value)
}

function displayName(contact: { firstName?: string | null; lastName?: string | null; email?: string | null } | null) {
  if (!contact) return '—'
  const name = [contact.firstName, contact.lastName].filter(Boolean).join(' ')
  return name || contact.email || '—'
}

export default async function CalendarPage() {
  const events = await prisma.calendarEvent.findMany({
    orderBy: { startAt: 'desc' },
    take: 100,
    include: {
      contact: { select: { firstName: true, lastName: true, email: true } },
      inquiry: { select: { stage: true } },
    },
  })

  return (
    <div className="p-6 md:p-8">
      <PageHeader
        eyebrow="Scheduling"
        title="Calendar"
        description="Synced calendar events linked to contacts and pipeline inquiries."
      />

      <div className="mt-6">
        {events.length === 0 ? (
          <EmptyState
            title="No calendar events yet"
            description="Connect your Google Calendar to begin syncing events."
            icon={<CalendarDays size={18} />}
          />
        ) : (
          <div className="space-y-3">
            {events.map((event) => (
              <div
                key={event.id}
                className="rounded-2xl border border-white/10 bg-white/[0.02] p-4"
              >
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white">{event.title}</p>
                    <p className="mt-1 text-xs text-[#A9B1BE]">
                      {event.contact ? displayName(event.contact) : 'Unlinked contact'} · {event.provider}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <StatPill label="Status" value={event.status} />
                    <StatPill label="Stage" value={event.inquiry?.stage ?? '—'} />
                  </div>
                </div>

                <div className="grid gap-2 text-sm text-[#D7DCE5] md:grid-cols-2">
                  <div>Start: {fmtDate(event.startAt)}</div>
                  <div>End: {fmtDate(event.endAt)}</div>
                  <div>Timezone: {event.timezone ?? '—'}</div>
                  <div>Meeting URL: {event.meetingUrl ?? '—'}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
