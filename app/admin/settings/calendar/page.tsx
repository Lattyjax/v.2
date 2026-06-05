export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import PageHeader from '../../_components/PageHeader'
import AdminCard from '../../_components/AdminCard'
import StatPill from '../../_components/StatPill'

function fmtDate(value?: Date | null) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(value)
}

export default async function CalendarSettingsPage({
  searchParams,
}: {
  searchParams?: Promise<{ connected?: string; error?: string }>
}) {
  const params = (await searchParams) ?? {}
  const connection = await prisma.calendarConnection.findFirst({
    where: { provider: 'google' },
    orderBy: { updatedAt: 'desc' },
  })

  const connected = params.connected === '1'
  const error = params.error ?? ''

  return (
    <div className="p-6 md:p-8">
      <PageHeader
        eyebrow="Settings"
        title="Calendar Integration"
        description="Connect the owner's Google Calendar to power native availability and self-booking."
      />

      <div className="max-w-3xl">
        <AdminCard
          title="Google Calendar"
          subtitle="Used for live availability checks and automatic appointment event creation."
          action={
            <div className="flex gap-2">
              <StatPill label="Provider" value="Google" />
              <StatPill label="Calendar" value="primary" />
            </div>
          }
        >
          <div className="space-y-4">
            {connected ? (
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                Google Calendar connected successfully.
              </div>
            ) : null}

            {error ? (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error === 'state_mismatch' && 'Connection failed due to an invalid or expired OAuth state.'}
                {error === 'wrong_account' && 'The connected Google account does not match the configured owner email.'}
                {error === 'connect_failed' && 'Google Calendar connection failed. Please try again.'}
              </div>
            ) : null}

            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-[#8F98A8]">Status</p>
                <p className="mt-2 text-sm text-white">
                  {connection?.accessToken ? 'Connected' : 'Not connected'}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-[#8F98A8]">Connected account</p>
                <p className="mt-2 text-sm text-white">{connection?.accountEmail || '—'}</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-[#8F98A8]">Last updated</p>
                <p className="mt-2 text-sm text-white">{fmtDate(connection?.updatedAt)}</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-[#8F98A8]">Token expires</p>
                <p className="mt-2 text-sm text-white">{fmtDate(connection?.tokenExpiresAt)}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <a
                href="/api/calendar/google/connect"
                className="rounded-xl bg-[#C9A25F] px-4 py-2 text-sm font-medium text-black transition hover:opacity-90"
              >
                {connection ? 'Reconnect Google Calendar' : 'Connect Google Calendar'}
              </a>
            </div>

            <div className="rounded-2xl border border-[#C9A25F]/20 bg-[#C9A25F]/5 p-4">
              <p className="text-sm text-[#E6EAF0]">
                Once connected, the app will use the owner's primary Google Calendar to calculate live availability
                for consultations and create calendar events automatically when a visitor books.
              </p>
            </div>
          </div>
        </AdminCard>
      </div>
    </div>
  )
}