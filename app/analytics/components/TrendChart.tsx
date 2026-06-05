'use client'

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import { TimeSeriesPoint } from '../lib/types'
import SectionLoader from './SectionLoader'
import EmptyState from '@/app/_components/EmptyState'

const G = '#C9A25F'
const MUTED = '#8F98A8'

export default function TrendChart({
  data,
  loading,
  error,
}: {
  data: TimeSeriesPoint[] | null
  loading: boolean
  error: string | null
}) {
  if (loading) return <SectionLoader />
  if (error) return <EmptyState title="Trend unavailable" description={error} />
  if (!data || data.length === 0) {
    return <EmptyState title="No trend data yet" description="Data will appear once analytics events are available." />
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-white">Lead Trend</h2>
        <p className="text-sm text-[#A9B1BE]">Daily lead, contact, booking, and CTA activity.</p>
      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis
              dataKey="date"
              stroke={MUTED}
              fontSize={11}
              tickFormatter={value =>
                new Date(value).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })
              }
            />
            <YAxis stroke={MUTED} fontSize={11} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#F9FAFB',
              }}
            />
            <Legend />
            <Line type="monotone" dataKey="lead_count" stroke={G} strokeWidth={2} dot={{ r: 3 }} name="Leads" />
            <Line type="monotone" dataKey="contact_count" stroke="#E5E7EB" strokeWidth={2} dot={{ r: 3 }} name="Contacts" />
            <Line type="monotone" dataKey="appointment_booked_count" stroke="#93C5FD" strokeWidth={2} dot={{ r: 3 }} name="Booked" />
            <Line type="monotone" dataKey="cta_click_count" stroke="#86EFAC" strokeWidth={2} dot={{ r: 3 }} name="CTA Clicks" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
