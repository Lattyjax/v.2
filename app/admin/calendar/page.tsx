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
        className="rounded-2xl border border-white/8 bg-white/[0.02] p-4"
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
