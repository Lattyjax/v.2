import { RecentEvent } from '../lib/types'
import SectionLoader from './SectionLoader'
import EmptyState from '@/app/_components/EmptyState'

function fmtDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function sourceLine(event: RecentEvent) {
  const parts = [event.source, event.medium, event.campaign].filter(Boolean)
  return parts.length ? parts.join(' / ') : 'Unattributed'
}

export default function RecentEventsSection({
  events,
  loading,
  error,
}: {
  events: RecentEvent[] | null
  loading: boolean
  error: string | null
}) {
  if (loading) return <SectionLoader />
  if (error) return <EmptyState title="Recent events unavailable" description={error} />
  if (!events || events.length === 0) {
    return <EmptyState title="No recent events yet" description="Tracked activity will appear here once visitors, leads, or automations fire events." />
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-white">Recent Events</h2>
        <p className="text-sm text-[#A9B1BE]">Latest tracked activity inside Latimore OS.</p>
      </div>

      <div className="divide-y divide-white/10">
        {events.map(event => (
          <div key={event.id} className="py-3 first:pt-0 last:pb-0">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-medium text-white">{event.description || event.type}</div>
                <div className="mt-1 text-xs text-[#A9B1BE]">{sourceLine(event)}</div>
              </div>
              <div className="shrink-0 text-right text-xs text-[#A9B1BE]">{fmtDate(event.occurredAt)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
