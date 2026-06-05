'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  BarChart3,
  RefreshCw,
  TrendingUp,
  Users,
  Calendar,
  MousePointerClick,
  AlertTriangle,
  Download,
  Target,
  Clock,
  Zap,
} from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import PageHeader from '../_components/PageHeader'
import AdminCard from '../_components/AdminCard'
import EmptyState from '../_components/EmptyState'

const G = '#C9A25F'
const NAVY = '#0B0F17'
const SURF = '#131929'
const DIM = '#A9B1BE'
const MUTED = '#8F98A8'

// ─── Types ────────────────────────────────────────────────────────────────────

type Range = '7d' | '30d' | '90d'

type OverviewData = {
  leadCount: number
  contactCount: number
  appointmentBookedCount: number
  soldCount: number
  ctaClickCount: number
  formSubmitCount: number
  leadToBookingRate: number
  leadToSoldRate: number
  avgLeadScore: number
  staleLeadCount: number
  taskOverdueCount: number
  socialClickCount: number
  socialEngagementCount: number
  aiSuccessRate: number
  aiAvgLatencyMs: number
  delta: {
    leadCount: number | null
    contactCount: number | null
    appointmentBookedCount: number | null
    soldCount: number | null
    ctaClickCount: number | null
  }
}

type FunnelStage = {
  stageKey: string
  stageOrder: number
  count: number
  conversionRate: number
}

type TimeSeriesPoint = {
  date: string
  lead_count?: number
  contact_count?: number
  appointment_booked_count?: number
  cta_click_count?: number
  [key: string]: number | string | undefined
}

type BreakdownRow = {
  dimension: string
  dimensionValue: string
  value: number
  unit: string
  metricKey: string
}

type RecentEvent = {
  id: string
  type: string
  source: string | null
  medium: string | null
  campaign: string | null
  occurredAt: string
  description: string
}

type Opportunity = {
  id: string
  contactName: string | null
  county: string | null
  productInterest: string | null
  stage: string
  leadScore: number
  lastActivityAt: string | null
  reason: string
}

type ApiEnvelope<T> = {
  ok: boolean
  data?: T
  range?: { from: string; to: string }
  meta?: { generatedAt: string; source: string; warnings: string[] }
  error?: string
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildQs(range: Range, extra: Record<string, string> = {}) {
  const params = new URLSearchParams({ range, ...extra })
  return params.toString()
}

function fmt(n: number, decimals = 0) {
  return n.toLocaleString('en-US', { maximumFractionDigits: decimals })
}

function pctFmt(n: number | null) {
  if (n === null) return null
  const sign = n >= 0 ? '+' : ''
  return `${sign}${n.toFixed(1)}%`
}

function deltaColor(n: number | null) {
  if (n === null) return MUTED
  return n >= 0 ? '#10B981' : '#EF4444'
}

// ─── Filter Bar ───────────────────────────────────────────────────────────────

function FilterBar({
  range,
  onRange,
  onRefresh,
  loading,
}: {
  range: Range
  onRange: (r: Range) => void
  onRefresh: () => void
  loading: boolean
}) {
  const ranges: Range[] = ['7d', '30d', '90d']
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '24px' }}>
      <div style={{ display: 'flex', gap: '6px' }}>
        {ranges.map(r => (
          <button
            key={r}
            onClick={() => onRange(r)}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              border: `1px solid ${range === r ? G : 'rgba(255,255,255,0.1)'}`,
              background: range === r ? `${G}22` : 'transparent',
              color: range === r ? G : DIM,
              fontWeight: range === r ? 700 : 400,
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {r}
          </button>
        ))}
      </div>
      <button
        onClick={onRefresh}
        disabled={loading}
        style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '6px 16px', borderRadius: '8px',
          background: G, color: NAVY, fontWeight: 600, fontSize: '13px',
          border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.6 : 1,
        }}
      >
        <RefreshCw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
        Refresh
      </button>
    </div>
  )
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  delta,
  icon: Icon,
  color = G,
  sublabel,
}: {
  label: string
  value: string | number
  delta?: number | null
  icon: React.ElementType
  color?: string
  sublabel?: string
}) {
  return (
    <div
      style={{
        borderRadius: '14px',
        border: '1px solid rgba(255,255,255,0.08)',
        background: 'rgba(255,255,255,0.02)',
        padding: '18px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', color: DIM }}>
          {label}
        </span>
        <Icon size={18} style={{ color }} />
      </div>
      <div style={{ fontSize: '28px', fontWeight: 700, color, lineHeight: 1 }}>{value}</div>
      {sublabel && <div style={{ fontSize: '11px', color: MUTED }}>{sublabel}</div>}
      {delta !== undefined && delta !== null && (
        <div style={{ fontSize: '12px', color: deltaColor(delta), fontWeight: 600 }}>
          {pctFmt(delta)} vs prior period
        </div>
      )}
    </div>
  )
}

// ─── Section Loader ───────────────────────────────────────────────────────────

function SectionLoader() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 0' }}>
      <RefreshCw size={20} style={{ color: G, animation: 'spin 1s linear infinite', marginRight: '10px' }} />
      <span style={{ color: DIM, fontSize: '14px' }}>Loading…</span>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const [range, setRange] = useState<Range>('30d')
  const [overview, setOverview] = useState<OverviewData | null>(null)
  const [funnel, setFunnel] = useState<FunnelStage[] | null>(null)
  const [timeSeries, setTimeSeries] = useState<TimeSeriesPoint[] | null>(null)
  const [breakdowns, setBreakdowns] = useState<BreakdownRow[] | null>(null)
  const [recentEvents, setRecentEvents] = useState<RecentEvent[] | null>(null)
  const [opportunities, setOpportunities] = useState<Opportunity[] | null>(null)
  const [warnings, setWarnings] = useState<string[]>([])

  const [overviewLoading, setOverviewLoading] = useState(false)
  const [funnelLoading, setFunnelLoading] = useState(false)
  const [timeSeriesLoading, setTimeSeriesLoading] = useState(false)
  const [breakdownsLoading, setBreakdownsLoading] = useState(false)
  const [recentLoading, setRecentLoading] = useState(false)
  const [oppsLoading, setOppsLoading] = useState(false)

  const [overviewErr, setOverviewErr] = useState<string | null>(null)
  const [funnelErr, setFunnelErr] = useState<string | null>(null)
  const [timeSeriesErr, setTimeSeriesErr] = useState<string | null>(null)
  const [breakdownsErr, setBreakdownsErr] = useState<string | null>(null)

  const fetchAll = useCallback(async () => {
    const qs = buildQs(range)

    // Overview
    setOverviewLoading(true)
    setOverviewErr(null)
    fetch(`/api/analytics/v1/overview?${qs}`)
      .then(r => r.json() as Promise<ApiEnvelope<OverviewData>>)
      .then(res => {
        if (res.ok && res.data) {
          setOverview(res.data)
          setWarnings(res.meta?.warnings ?? [])
        } else {
          setOverviewErr(res.error ?? 'Failed to load overview')
        }
      })
      .catch(() => setOverviewErr('Network error'))
      .finally(() => setOverviewLoading(false))

    // Funnel
    setFunnelLoading(true)
    setFunnelErr(null)
    fetch(`/api/analytics/v1/funnel?${qs}`)
      .then(r => r.json() as Promise<ApiEnvelope<FunnelStage[]>>)
      .then(res => {
        if (res.ok && res.data) setFunnel(res.data)
        else setFunnelErr(res.error ?? 'Failed to load funnel')
      })
      .catch(() => setFunnelErr('Network error'))
      .finally(() => setFunnelLoading(false))

    // Time series
    setTimeSeriesLoading(true)
    setTimeSeriesErr(null)
    fetch(`/api/analytics/v1/time-series?${qs}&metrics=lead_count,contact_count,appointment_booked_count,cta_click_count`)
      .then(r => r.json() as Promise<ApiEnvelope<TimeSeriesPoint[]>>)
      .then(res => {
        if (res.ok && res.data) setTimeSeries(res.data)
        else setTimeSeriesErr(res.error ?? 'Failed to load time series')
      })
      .catch(() => setTimeSeriesErr('Network error'))
      .finally(() => setTimeSeriesLoading(false))

    // Breakdowns (source)
    setBreakdownsLoading(true)
    setBreakdownsErr(null)
    fetch(`/api/analytics/v1/breakdowns?${qs}&dimension=source`)
      .then(r => r.json() as Promise<ApiEnvelope<BreakdownRow[]>>)
      .then(res => {
        if (res.ok && res.data) setBreakdowns(res.data)
        else setBreakdownsErr(res.error ?? 'Failed to load breakdowns')
      })
      .catch(() => setBreakdownsErr('Network error'))
      .finally(() => setBreakdownsLoading(false))

    // Recent events
    setRecentLoading(true)
    fetch('/api/analytics/v1/recent-events?limit=15')
      .then(r => r.json() as Promise<ApiEnvelope<RecentEvent[]>>)
      .then(res => { if (res.ok && res.data) setRecentEvents(res.data) })
      .catch(() => {})
      .finally(() => setRecentLoading(false))

    // Opportunities
    setOppsLoading(true)
    fetch('/api/analytics/v1/opportunities')
      .then(r => r.json() as Promise<ApiEnvelope<Opportunity[]>>)
      .then(res => { if (res.ok && res.data) setOpportunities(res.data) })
      .catch(() => {})
      .finally(() => setOppsLoading(false))
  }, [range])

  useEffect(() => {
    void fetchAll()
  }, [fetchAll])

  const anyLoading = overviewLoading || funnelLoading || timeSeriesLoading || breakdownsLoading || recentLoading || oppsLoading

  const exportUrl = (type: string) => `/api/analytics/v1/export?type=${type}&range=${range}`

  return (
    <div style={{ padding: '24px 32px' }}>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
        <PageHeader
          eyebrow="Analytics"
          title="Data Dashboard"
          description="Aggregated KPIs, funnel metrics, lead attribution, and pipeline opportunities."
        />
        <a
          href={exportUrl('overview')}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '8px 16px', borderRadius: '8px',
            border: `1px solid ${G}`, color: G, fontSize: '13px',
            textDecoration: 'none', fontWeight: 600,
          }}
        >
          <Download size={14} /> Export CSV
        </a>
      </div>

      <FilterBar range={range} onRange={setRange} onRefresh={fetchAll} loading={anyLoading} />

      {/* Data quality warnings */}
      {warnings.length > 0 && (
        <div style={{
          marginBottom: '20px', padding: '14px 18px', borderRadius: '10px',
          background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.3)',
          display: 'flex', alignItems: 'flex-start', gap: '10px',
        }}>
          <AlertTriangle size={16} style={{ color: '#EAB308', flexShrink: 0, marginTop: '2px' }} />
          <div>
            {warnings.map((w, i) => (
              <p key={i} style={{ fontSize: '13px', color: '#EAB308', margin: 0, lineHeight: '1.5' }}>{w}</p>
            ))}
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '28px' }}>
        {overviewLoading ? (
          <div style={{ gridColumn: '1/-1' }}><SectionLoader /></div>
        ) : overviewErr ? (
          <div style={{ gridColumn: '1/-1' }}>
            <EmptyState title="Overview unavailable" description={overviewErr} />
          </div>
        ) : overview ? (
          <>
            <KpiCard label="Total Leads" value={fmt(overview.leadCount)} delta={overview.delta.leadCount} icon={Users} />
            <KpiCard label="Bookings" value={fmt(overview.appointmentBookedCount)} delta={overview.delta.appointmentBookedCount} icon={Calendar} color="#10B981" />
            <KpiCard label="Sold" value={fmt(overview.soldCount)} delta={overview.delta.soldCount} icon={TrendingUp} color="#8B5CF6" />
            <KpiCard label="CTA Clicks" value={fmt(overview.ctaClickCount)} delta={overview.delta.ctaClickCount} icon={MousePointerClick} color="#3B82F6" />
            <KpiCard label="Lead→Booking" value={`${(overview.leadToBookingRate * 100).toFixed(1)}%`} icon={Target} sublabel="Conversion rate" />
            <KpiCard label="Stale Leads" value={fmt(overview.staleLeadCount)} icon={Clock} color={overview.staleLeadCount > 10 ? '#EF4444' : G} sublabel="14+ days inactive" />
            <KpiCard label="Avg Lead Score" value={overview.avgLeadScore.toFixed(1)} icon={Zap} sublabel="Across active leads" />
          </>
        ) : null}
      </div>

      {/* Trend Chart + Funnel */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '20px', marginBottom: '24px' }}>
        <AdminCard title="Lead Generation Trend">
          {timeSeriesLoading ? (
            <SectionLoader />
          ) : timeSeriesErr ? (
            <EmptyState title="Trend unavailable" description={timeSeriesErr} />
          ) : timeSeries && timeSeries.length > 0 ? (
            <div style={{ height: '280px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timeSeries}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis
                    dataKey="date"
                    stroke={MUTED}
                    fontSize={11}
                    tickFormatter={v => new Date(v).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis stroke={MUTED} fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px', color: '#F9FAFB' }}
                    labelFormatter={v => new Date(v).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  />
                  <Line type="monotone" dataKey="lead_count" stroke={G} strokeWidth={2} name="Leads" dot={{ fill: G, r: 3 }} />
                  <Line type="monotone" dataKey="contact_count" stroke="#10B981" strokeWidth={2} name="Contacts" dot={{ fill: '#10B981', r: 3 }} />
                  <Line type="monotone" dataKey="appointment_booked_count" stroke="#3B82F6" strokeWidth={2} name="Bookings" dot={{ fill: '#3B82F6', r: 3 }} />
                  <Line type="monotone" dataKey="cta_click_count" stroke="#8B5CF6" strokeWidth={2} name="CTA Clicks" dot={{ fill: '#8B5CF6', r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState title="No trend data yet" description="Aggregated daily data will appear once the mart has been built." />
          )}
        </AdminCard>

        <AdminCard title="Funnel" action={
          <a href={exportUrl('funnel')} style={{ fontSize: '11px', color: G, textDecoration: 'none' }}>Export</a>
        }>
          {funnelLoading ? (
            <SectionLoader />
          ) : funnelErr ? (
            <EmptyState title="Funnel unavailable" description={funnelErr} />
          ) : funnel && funnel.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {funnel.map((stage, i) => {
                const maxCount = funnel[0]?.count || 1
                const pct = Math.round((stage.count / maxCount) * 100)
                const labels: Record<string, string> = {
                  visitor: 'Visitors',
                  engaged: 'Engaged',
                  lead: 'Leads',
                  qualified: 'Qualified',
                  booked: 'Booked',
                  sold: 'Sold',
                }
                return (
                  <div key={stage.stageKey}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                      <span style={{ fontSize: '13px', color: '#F7F7F5', fontWeight: 500 }}>
                        {labels[stage.stageKey] ?? stage.stageKey}
                      </span>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: G }}>{fmt(stage.count)}</span>
                        {i > 0 && <span style={{ fontSize: '11px', color: MUTED }}>{stage.conversionRate.toFixed(1)}%</span>}
                      </div>
                    </div>
                    <div style={{ height: '8px', borderRadius: '4px', background: 'rgba(255,255,255,0.08)' }}>
                      <div
                        style={{
                          height: '8px', borderRadius: '4px',
                          background: `linear-gradient(90deg, ${G}, #D4AF77)`,
                          width: `${pct}%`, transition: 'width 0.5s',
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <EmptyState title="No funnel data yet" />
          )}
        </AdminCard>
      </div>

      {/* Source Breakdowns + Recent Events */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
        <AdminCard title="Top Sources" action={
          <a href={exportUrl('breakdown')} style={{ fontSize: '11px', color: G, textDecoration: 'none' }}>Export</a>
        }>
          {breakdownsLoading ? (
            <SectionLoader />
          ) : breakdownsErr ? (
            <EmptyState title="Breakdowns unavailable" description={breakdownsErr} />
          ) : breakdowns && breakdowns.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {breakdowns.slice(0, 10).map(row => {
                const maxVal = breakdowns[0]?.value ?? 1
                const pct = Math.round((row.value / maxVal) * 100)
                return (
                  <div key={`${row.dimensionValue}-${row.metricKey}`} style={{ borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)', padding: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '13px', color: '#F7F7F5' }}>{row.dimensionValue}</span>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: G }}>{fmt(row.value)}</span>
                    </div>
                    <div style={{ height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.06)' }}>
                      <div style={{ height: '6px', borderRadius: '3px', background: G, width: `${pct}%`, transition: 'width 0.4s' }} />
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <EmptyState title="No source data yet" description="Attribution data will appear as leads come in." icon={<BarChart3 size={18} />} />
          )}
        </AdminCard>

        <AdminCard title="Recent Events">
          {recentLoading ? (
            <SectionLoader />
          ) : recentEvents && recentEvents.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {recentEvents.slice(0, 12).map(evt => (
                <div key={evt.id} style={{ borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)', padding: '10px 14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                    <div>
                      <p style={{ fontSize: '13px', fontWeight: 600, color: '#F7F7F5', margin: 0 }}>
                        {evt.type.replace(/_/g, ' ')}
                      </p>
                      {evt.description && evt.description !== evt.type && (
                        <p style={{ fontSize: '11px', color: DIM, margin: '2px 0 0' }}>{evt.description}</p>
                      )}
                      {(evt.source || evt.medium) && (
                        <p style={{ fontSize: '11px', color: MUTED, margin: '2px 0 0' }}>
                          {[evt.source, evt.medium, evt.campaign].filter(Boolean).join(' · ')}
                        </p>
                      )}
                    </div>
                    <p style={{ fontSize: '11px', color: MUTED, whiteSpace: 'nowrap', flexShrink: 0 }}>
                      {new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(evt.occurredAt))}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No recent events" description="Business activity will appear here." icon={<BarChart3 size={18} />} />
          )}
        </AdminCard>
      </div>

      {/* Opportunities */}
      <AdminCard
        title="Pipeline Opportunities"
        subtitle="Open leads with no update in 14+ days, sorted by lead score"
        action={
          <a href={exportUrl('opportunities')} style={{ fontSize: '11px', color: G, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Download size={12} /> Export
          </a>
        }
      >
        {oppsLoading ? (
          <SectionLoader />
        ) : opportunities && opportunities.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr>
                  {['Contact', 'County', 'Product', 'Stage', 'Score', 'Last Activity', 'Reason'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '8px 10px', color: MUTED, fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {opportunities.map(opp => (
                  <tr key={opp.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '10px', color: '#F7F7F5' }}>{opp.contactName ?? '—'}</td>
                    <td style={{ padding: '10px', color: DIM }}>{opp.county ?? '—'}</td>
                    <td style={{ padding: '10px', color: DIM }}>{opp.productInterest?.replace(/_/g, ' ') ?? '—'}</td>
                    <td style={{ padding: '10px' }}>
                      <span style={{ padding: '2px 8px', borderRadius: '20px', background: 'rgba(201,162,95,0.12)', color: G, fontSize: '11px', fontWeight: 600 }}>
                        {opp.stage.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td style={{ padding: '10px', color: G, fontWeight: 700 }}>{opp.leadScore}</td>
                    <td style={{ padding: '10px', color: MUTED, fontSize: '12px' }}>
                      {opp.lastActivityAt ? new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(opp.lastActivityAt)) : '—'}
                    </td>
                    <td style={{ padding: '10px', color: '#EF4444', fontSize: '12px' }}>{opp.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState title="No stale opportunities" description="All open leads have recent activity." icon={<Target size={18} />} />
        )}
      </AdminCard>
    </div>
  )
}
