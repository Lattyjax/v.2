import { ReactNode } from 'react'
import { OverviewData } from '../lib/types'
import SectionLoader from './SectionLoader'
import EmptyState from '@/app/_components/EmptyState'
import {
  Users,
  Calendar,
  TrendingUp,
  MousePointerClick,
  Target,
  Clock,
  Zap,
  Activity,
} from 'lucide-react'

function fmt(n: number, decimals = 0) {
  return n.toLocaleString('en-US', { maximumFractionDigits: decimals })
}

function pct(n: number) {
  const value = n <= 1 ? n * 100 : n
  return `${value.toFixed(1)}%`
}

function KpiCard({
  label,
  value,
  icon,
  sub,
}: {
  label: string
  value: string
  icon: ReactNode
  sub?: string
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider text-[#A9B1BE]">{label}</span>
        {icon}
      </div>

      <div className="text-2xl font-bold text-[#C9A25F]">{value}</div>

      {sub ? <div className="mt-1 text-xs text-[#A9B1BE]">{sub}</div> : null}
    </div>
  )
}

export default function KpiSection({
  overview,
  loading,
  error,
}: {
  overview: OverviewData | null
  loading: boolean
  error: string | null
}) {
  if (loading) return <SectionLoader />
  if (error) return <EmptyState title="Overview unavailable" description={error} />
  if (!overview) return null

  return (
    <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      <KpiCard label="Total Leads" value={fmt(overview.leadCount)} icon={<Users size={18} className="text-[#C9A25F]" />} />
      <KpiCard label="Contacts" value={fmt(overview.contactCount)} icon={<Activity size={18} className="text-[#C9A25F]" />} />
      <KpiCard label="Booked" value={fmt(overview.appointmentBookedCount)} icon={<Calendar size={18} className="text-[#C9A25F]" />} />
      <KpiCard label="Sold" value={fmt(overview.soldCount)} icon={<Target size={18} className="text-[#C9A25F]" />} />
      <KpiCard label="CTA Clicks" value={fmt(overview.ctaClickCount)} icon={<MousePointerClick size={18} className="text-[#C9A25F]" />} />
      <KpiCard label="Lead → Booking" value={pct(overview.leadToBookingRate)} icon={<TrendingUp size={18} className="text-[#C9A25F]" />} />
      <KpiCard label="Lead → Sold" value={pct(overview.leadToSoldRate)} icon={<TrendingUp size={18} className="text-[#C9A25F]" />} />
      <KpiCard label="Avg Score" value={fmt(overview.avgLeadScore, 1)} icon={<Zap size={18} className="text-[#C9A25F]" />} />
      <KpiCard label="Stale Leads" value={fmt(overview.staleLeadCount)} icon={<Clock size={18} className="text-[#C9A25F]" />} />
      <KpiCard label="Overdue Tasks" value={fmt(overview.taskOverdueCount)} icon={<Clock size={18} className="text-[#C9A25F]" />} />
      <KpiCard label="Social Clicks" value={fmt(overview.socialClickCount)} icon={<MousePointerClick size={18} className="text-[#C9A25F]" />} />
      <KpiCard
        label="AI Success"
        value={pct(overview.aiSuccessRate)}
        icon={<Zap size={18} className="text-[#C9A25F]" />}
        sub={`${fmt(overview.aiAvgLatencyMs)}ms avg latency`}
      />
    </div>
  )
}
