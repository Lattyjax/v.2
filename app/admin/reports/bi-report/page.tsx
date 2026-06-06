'use client'
export const dynamic = 'force-dynamic'

import { useState } from 'react'

const DEFAULT_WEEK = (() => {
  const d = new Date()
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  const mon = new Date(d.setDate(diff))
  const sun = new Date(mon)
  sun.setDate(mon.getDate() + 6)
  const fmt = (dt: Date) =>
    dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  return `${fmt(mon)} – ${fmt(sun)}`
})()

type Fields = {
  report_week: string
  marketing_activity: string
  sales_activity: string
  crm_snapshot: string
  operations_status: string
  analytics_snapshot: string
  community_notes: string
}

const FIELD_META: { key: keyof Fields; label: string; placeholder: string }[] = [
  {
    key: 'report_week',
    label: 'Report Week',
    placeholder: 'e.g. Jun 2 – Jun 8, 2025',
  },
  {
    key: 'marketing_activity',
    label: 'Marketing Activity',
    placeholder: 'Ads run, content posted, email campaigns, SEO work, outreach…',
  },
  {
    key: 'sales_activity',
    label: 'Sales Activity',
    placeholder: 'Calls made, appointments, proposals sent, policies written, closes…',
  },
  {
    key: 'crm_snapshot',
    label: 'CRM Snapshot',
    placeholder: 'New leads, lead sources, pipeline stages, follow-up status, stale leads…',
  },
  {
    key: 'operations_status',
    label: 'Operations Status',
    placeholder: 'Tech issues, site changes, integrations, admin tasks, compliance…',
  },
  {
    key: 'analytics_snapshot',
    label: 'Analytics Snapshot',
    placeholder: 'Website traffic, form fills, click-through rates, conversion data…',
  },
  {
    key: 'community_notes',
    label: 'Community Notes',
    placeholder: 'Local events, networking, referrals, partnerships, social pulse…',
  },
]

type SectionKey = 'scaffold' | 'marketing' | 'sales' | 'crm' | 'community' | 'ops' | 'roi'
const SECTION_LABELS: Record<SectionKey, string> = {
  scaffold: 'Planning Scaffold',
  marketing: 'Marketing Analysis',
  sales: 'Sales Analysis',
  crm: 'CRM Review',
  community: 'Community Scan',
  ops: 'Ops & Analytics',
  roi: 'ROI Actions',
}

export default function BIReportPage() {
  const [fields, setFields] = useState<Fields>({
    report_week: DEFAULT_WEEK,
    marketing_activity: '',
    sales_activity: '',
    crm_snapshot: '',
    operations_status: '',
    analytics_snapshot: '',
    community_notes: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<{
    report: string
    report_week: string
    sections: Record<SectionKey, string>
  } | null>(null)
  const [activeTab, setActiveTab] = useState<'report' | SectionKey>('report')

  async function generate() {
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const res = await fetch('/api/reports/bi-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Generation failed')
      setResult(json)
      setActiveTab('report')
    } catch (e: any) {
      setError(e.message ?? 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const sectionTabs: Array<{ key: 'report' | SectionKey; label: string }> = [
    { key: 'report', label: 'Full Report' },
    ...Object.entries(SECTION_LABELS).map(([k, v]) => ({ key: k as SectionKey, label: v })),
  ]

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#F7F7F5]">Weekly BI Report Generator</h1>
        <p className="text-[#A9B1BE] text-sm mt-1">
          Latimore Life & Legacy LLC — multi-step AI chain report
        </p>
      </div>

      <div className="bg-[#1a2535] border border-[#F7F7F5]/6 rounded-xl p-6 mb-6">
        <div className="grid grid-cols-1 gap-4">
          {FIELD_META.map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="block text-xs text-[#A9B1BE] uppercase tracking-wider mb-1">
                {label}
                {key === 'report_week' && (
                  <span className="ml-1 text-[#C9A25F] normal-case tracking-normal font-normal">
                    (required)
                  </span>
                )}
              </label>
              {key === 'report_week' ? (
                <input
                  className="w-full bg-[#0B0F17] border border-[#F7F7F5]/10 rounded-lg px-3 py-2 text-[#F7F7F5] text-sm focus:outline-none focus:border-[#C9A25F]/50"
                  value={fields[key]}
                  onChange={(e) => setFields((f) => ({ ...f, [key]: e.target.value }))}
                  placeholder={placeholder}
                />
              ) : (
                <textarea
                  rows={3}
                  className="w-full bg-[#0B0F17] border border-[#F7F7F5]/10 rounded-lg px-3 py-2 text-[#F7F7F5] text-sm focus:outline-none focus:border-[#C9A25F]/50 resize-y"
                  value={fields[key]}
                  onChange={(e) => setFields((f) => ({ ...f, [key]: e.target.value }))}
                  placeholder={placeholder}
                />
              )}
            </div>
          ))}
        </div>

        <button
          onClick={generate}
          disabled={loading || !fields.report_week.trim()}
          className="mt-5 px-6 py-2.5 bg-[#C9A25F] text-[#0B0F17] font-semibold rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#d4af6e] transition-colors"
        >
          {loading ? 'Generating report…' : 'Generate Report'}
        </button>

        {loading && (
          <p className="mt-3 text-xs text-[#A9B1BE]">
            Running 5-step AI chain — this takes 60–120 seconds…
          </p>
        )}
        {error && (
          <p className="mt-3 text-sm text-red-400">{error}</p>
        )}
      </div>

      {result && (
        <div className="bg-[#1a2535] border border-[#F7F7F5]/6 rounded-xl overflow-hidden">
          <div className="flex overflow-x-auto border-b border-[#F7F7F5]/6">
            {sectionTabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`flex-shrink-0 px-4 py-3 text-xs font-medium transition-colors ${
                  activeTab === t.key
                    ? 'text-[#C9A25F] border-b-2 border-[#C9A25F]'
                    : 'text-[#A9B1BE] hover:text-[#F7F7F5]'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs text-[#A9B1BE]">Week of {result.report_week}</p>
              <button
                onClick={() => {
                  const text = activeTab === 'report' ? result.report : result.sections[activeTab as SectionKey]
                  navigator.clipboard.writeText(text).catch(() => {})
                }}
                className="text-xs text-[#A9B1BE] hover:text-[#F7F7F5] transition-colors px-3 py-1 border border-[#F7F7F5]/10 rounded"
              >
                Copy
              </button>
            </div>
            <pre className="whitespace-pre-wrap text-[#F7F7F5] text-sm leading-relaxed font-sans">
              {activeTab === 'report'
                ? result.report
                : result.sections[activeTab as SectionKey]}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}
