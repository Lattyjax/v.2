'use client'

import { useEffect, useState } from 'react'
import { Eye, MousePointerClick, Link2 } from 'lucide-react'

import PageHeader from '../_components/PageHeader'
import AdminCard from '../_components/AdminCard'
import StatPill from '../_components/StatPill'
import EmptyState from '../_components/EmptyState'

type ClickStat = { label: string | null; _count: { label: number } }
type CardEventRow = {
  id: string
  event: string
  label: string | null
  referrer: string | null
  timestamp: string
}
type DayStat = { day: string; count: number }

type AnalyticsData = {
  totalVisits: number
  totalClicks: number
  clicks: ClickStat[]
  recent: CardEventRow[]
  visitsByDay: DayStat[]
}

const gold = '#C9A25F'
const navy = '#0D1117'

function getReferrerHost(ref: string | null): string {
  if (!ref) return 'Direct'
  try { return new URL(ref).hostname } catch { return ref }
}

function MiniBarChart({ data }: { data: DayStat[] }) {
  if (!data.length) {
    return <p className="text-sm text-[#A9B1BE]">No data yet.</p>
  }

  const max = Math.max(...data.map(d => d.count), 1)

  return (
    <div className="flex items-end gap-1 h-24 overflow-x-auto">
      {data.map((d) => (
        <div key={d.day} className="flex flex-col items-center">
          <div
            className="w-3 rounded-t-md transition-all"
            style={{
              height: `${Math.max((d.count / max) * 80, 4)}px`,
              background: gold,
            }}
          />
          <span classname="text-[10px] text-[#A9B1BE] mt-1 whitespace-nowrap">
            {d.day.slice(5)}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function CardAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const refresh = () => {
    setLoading(true)
    fetch('/api/card-events')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => { setError(true); setLoading(false) })
  }

  useEffect(() => {
    refresh()
  }, [])

  if (loading) {
    return (
      <div className="p-8 text-center text-[#A9B1BE]">
        Loading analytics…
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center text-red-400">
        Failed to load. Check database connection.
      </div>
    )
  }

  const conversionRate = data.totalVisits > 0
    ? (
        ((data.clicks.find(c => c.label === 'Book' || c.label === 'Free Legacy Strategy Review')?._count.label ?? 0)
        / data.totalVisits) * 100
      ).toFixed(1)
    : '0.0'

  return (
    <div className="p-6 md:p-8">
      <PageHeader
        eyebrow="Analytics OS"
        title="Digital Card Analytics"
        description="Live tracking for legacylandingpage.vercel.app"
      />

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <AdminCard>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase tracking-wider text-[#A9B1BE]">Total Visits</span>
            <Eye size={18} className="text-[#C9A25F]" />
          </div>
          <p className="text-3xl font-bold text-white">{data.totalVisits.toLocaleString()}</p>
        </AdminCard>

        <AdminCard>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase tracking-wider text-[#A9B1BE]">Total Clicks</span>
            <MousePointerClick size={18} className="text-[#C9A25F]" />
          </div>
          <p className="text-3xl font-bold text-white">{data.totalClicks.toLocaleString()}</p>
        </AdminCard>

        <AdminCard>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase tracking-wider text-[#A9B1BE]">Actions Tracked</span>
            <Link2 size={18} className="text-[#C9A25F]" />
          </div>
          <p className="text-3xl font-bold text-white">{data.clicks.length}</p>
        </AdminCard>

        <AdminCard>
          <div className="text-xs uppercase tracking-wider text-[#A9B1BE] mb-2">Booking CVR</div>
          <p className="text-3xl font-bold text-white">{conversionRate}%</p>
        </AdminCard>
      </div>

      {/* Two Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <AdminCard title="Visits — Last 30 Days">
          <MiniBarChart data={data.visitsByDay} />
        </AdminCard>

        <AdminCard title="Clicks by Button">
          {data.clicks.length === 0 ? (
            <p className="text-sm text-[#A9B1BE]">No clicks recorded yet.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {data.clicks.map((c, i) => {
                const pct = data.totalClicks > 0
                  ? Math.round((c._count.label / data.totalClicks) * 100)
                  : 0

                return (
                  <div key={i}>
                    <div className="flex justify-between mb-1">
                      <span className="text-white font-semibold">{c.label ?? '(unknown)'}</span>
                      <span className="text-[#A9B1BE] text-sm">{c._count.label} ({pct}%)</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded">
                      <div
                        className="h-full rounded bg-[#C9A25F] transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </AdminCard>
      </div>

      {/* Recent Activity */}
      <AdminCard title="Recent Activity">
        {data.recent.length === 0 ? (
          <EmptyState
            title="No activity yet"
            description="Deploy the card update to start tracking."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  {['Time', 'Event', 'Label / Action', 'Referrer'].map(h => (
                    <th
                      key={h}
                      className="text-left py-2 px-3 text-[#A9B1BE] uppercase text-xs tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.recent.map((e) => (
                  <tr key={e.id} className="border-b border-white/5">
                    <td className="py-2 px-3 text-[#A9B1BE] whitespace-nowrap">
                      {new Date(e.timestamp).toLocaleString()}
                    </td>
                    <td className="py-2 px-3">
                      <span
                        className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wide ${
                          e.event === 'visit'
                            ? 'bg-white/10 text-white'
                            : 'bg-[#C9A25F]/20 text-[#C9A25F]'
                        }`}
                      >
                        {e.event}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-white">{e.label ?? '—'}</td>
                    <td className="py-2 px-3 text-[#A9B1BE]">
                      {getReferrerHost(e.referrer)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>
    </div>
  )
}
