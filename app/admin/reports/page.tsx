'use client'
export const dynamic = 'force-dynamic'
import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function Reports() {
  const [overview, setOverview] = useState<any>(null)

  useEffect(() => {
    fetch('/api/reports/overview').then((r) => r.json()).then(setOverview).catch(() => {})
  }, [])

  if (!overview) return <div className="p-6 text-[#A9B1BE]">Loading reports…</div>

  const kpis = [
    { label: 'Leads (month)', value: overview.kpis.leadsThisMonth },
    { label: 'Clicks (month)', value: overview.kpis.clicksThisMonth },
    { label: 'Bookings (month)', value: overview.kpis.bookingsThisMonth },
    { label: 'Stale Leads', value: overview.kpis.staleLeads },
  ]

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#F7F7F5]">Reports</h1>
        <p className="text-[#A9B1BE] text-sm mt-1">Unified pipeline performance overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {kpis.map((k) => (
          <div key={k.label} className="bg-[#1a2535] border border-[#F7F7F5]/6 rounded-xl p-4">
            <p className="text-[#A9B1BE] text-xs">{k.label}</p>
            <p className="text-3xl font-bold text-[#F7F7F5] mt-1">{k.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-[#1a2535] border border-[#F7F7F5]/6 rounded-xl p-5">
          <h2 className="font-semibold text-[#F7F7F5] mb-4">Pipeline by Stage</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={overview.pipeline}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F7F7F5" strokeOpacity={0.05} />
                <XAxis dataKey="status" tick={{ fill: '#A9B1BE', fontSize: 11 }} />
                <YAxis tick={{ fill: '#A9B1BE', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#0B0F17', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#F7F7F5' }} />
                <Bar dataKey="count" fill="#C9A25F" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#1a2535] border border-[#F7F7F5]/6 rounded-xl p-5">
          <h2 className="font-semibold text-[#F7F7F5] mb-4">Top Performers</h2>
          <div className="space-y-4 text-sm">
            <div>
              <p className="text-[#A9B1BE] text-xs uppercase tracking-wider">Top County</p>
              <p className="text-[#F7F7F5] font-semibold mt-1">{overview.highlights?.topCounty?.county ?? '—'}</p>
            </div>
            <div>
              <p className="text-[#A9B1BE] text-xs uppercase tracking-wider">Top Source</p>
              <p className="text-[#F7F7F5] font-semibold mt-1">{overview.highlights?.topSource?.source ?? '—'}</p>
            </div>
            <div>
              <p className="text-[#A9B1BE] text-xs uppercase tracking-wider">Top Interest</p>
              <p className="text-[#F7F7F5] font-semibold mt-1">{overview.highlights?.topInterest?.productInterest ?? '—'}</p>
            </div>
            <div>
              <p className="text-[#A9B1BE] text-xs uppercase tracking-wider">Top Page</p>
              <p className="text-[#F7F7F5] font-semibold mt-1">{overview.highlights?.topPage?.page ?? '—'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
