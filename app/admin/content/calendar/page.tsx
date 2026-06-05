'use client'

import { useState, useMemo } from 'react'
import PageHeader from '../../_components/PageHeader'
import calendarData from '@/lib/data/content-calendar-2026.json'

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

type DailyPost = {
  date: string
  dateDisplay: string
  contentType: string
  title: string
  platform: string
  status: string
}

type WeeklyHighlight = {
  week: string
  channel: string
  topic: string
  icp: string
  contentType: string
  cta: string
}

type MonthData = {
  focus: string
  keyDates: string
  theme: string
  dailyPosts: DailyPost[]
  weeklyHighlights: WeeklyHighlight[]
}

const CONTENT_TYPE_COLORS: Record<string, string> = {
  Educational: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  Community: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  'Personal Story': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  Football: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  'Weekend Inspiration': 'bg-rose-500/20 text-rose-300 border-rose-500/30',
  'Campaign Content': 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  Testimonial: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
}

const CHANNEL_ICONS: Record<string, string> = {
  'Facebook': 'fa-facebook',
  'Instagram': 'fa-instagram',
  'LinkedIn': 'fa-linkedin',
  'Facebook/Instagram': 'fa-share-nodes',
  'Football/Instagram': 'fa-football',
  'Email Newsletter': 'fa-envelope',
  'Website/Blog': 'fa-blog',
  'In-Person / Print': 'fa-print',
}

function TypeBadge({ type }: { type: string }) {
  const cls = CONTENT_TYPE_COLORS[type] ?? 'bg-slate-500/20 text-slate-300 border-slate-500/30'
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${cls}`}>
      {type}
    </span>
  )
}

export default function ContentCalendarPage() {
  const today = new Date()
  const currentMonthName = MONTHS[today.getMonth()]
  const [activeMonth, setActiveMonth] = useState<string>(
    MONTHS.includes(currentMonthName) ? currentMonthName : 'June'
  )
  const [typeFilter, setTypeFilter] = useState<string>('All')
  const [view, setView] = useState<'daily' | 'weekly'>('daily')

  const monthData = useMemo<MonthData>(
    () => (calendarData as Record<string, MonthData>)[activeMonth] ?? { focus: '', keyDates: '', theme: '', dailyPosts: [], weeklyHighlights: [] },
    [activeMonth]
  )

  const allTypes = useMemo(() => {
    const types = new Set<string>()
    MONTHS.forEach((m) => {
      const d = (calendarData as Record<string, MonthData>)[m]
      d?.dailyPosts?.forEach((p) => { if (p.contentType) types.add(p.contentType) })
    })
    return ['All', ...Array.from(types).sort()]
  }, [])

  const filteredPosts = useMemo(
    () =>
      typeFilter === 'All'
        ? monthData.dailyPosts
        : monthData.dailyPosts.filter((p) => p.contentType === typeFilter),
    [monthData.dailyPosts, typeFilter]
  )

  const totalAllMonths = useMemo(
    () => MONTHS.reduce((sum, m) => sum + ((calendarData as Record<string, MonthData>)[m]?.dailyPosts?.length ?? 0), 0),
    []
  )

  return (
    <div className="p-6 md:p-8 space-y-6">
      <PageHeader
        eyebrow="Content Strategy"
        title="2026 Content Calendar"
        description={`${totalAllMonths} scheduled posts across 12 months — social, email, blog, and in-person.`}
      />

      {/* Month selector */}
      <div className="flex flex-wrap gap-1.5">
        {MONTHS.map((m) => {
          const count = (calendarData as Record<string, MonthData>)[m]?.dailyPosts?.length ?? 0
          return (
            <button
              key={m}
              onClick={() => setActiveMonth(m)}
              className={`rounded-xl px-3 py-1.5 text-xs font-medium transition-all ${
                activeMonth === m
                  ? 'bg-[#C9A25F] text-black'
                  : 'bg-white/5 text-[#A9B1BE] hover:bg-white/10 hover:text-white'
              }`}
            >
              {m.slice(0, 3)}
              <span className="ml-1.5 opacity-60">{count}</span>
            </button>
          )
        })}
      </div>

      {/* Month header */}
      <div className="rounded-2xl border border-white/8 bg-[#111827] p-5">
        <div className="flex flex-wrap gap-x-8 gap-y-2">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-[#C9A25F]">{activeMonth} 2026</p>
            <p className="mt-1 text-sm text-[#D7DCE5]">{monthData.focus || '—'}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-[#A9B1BE]">Key Dates</p>
            <p className="mt-1 text-sm text-[#D7DCE5]">{monthData.keyDates || '—'}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-[#A9B1BE]">Pillars</p>
            <p className="mt-1 text-sm text-[#D7DCE5]">{monthData.theme || '—'}</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex rounded-xl border border-white/10 bg-white/5 p-0.5">
          <button
            onClick={() => setView('daily')}
            className={`rounded-[10px] px-4 py-1.5 text-xs font-medium transition-all ${view === 'daily' ? 'bg-[#C9A25F] text-black' : 'text-[#A9B1BE] hover:text-white'}`}
          >
            Daily Posts
          </button>
          <button
            onClick={() => setView('weekly')}
            className={`rounded-[10px] px-4 py-1.5 text-xs font-medium transition-all ${view === 'weekly' ? 'bg-[#C9A25F] text-black' : 'text-[#A9B1BE] hover:text-white'}`}
          >
            Weekly Highlights
          </button>
        </div>

        {view === 'daily' && (
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-xl border border-white/10 bg-[#111827] px-3 py-1.5 text-xs text-[#D7DCE5] focus:outline-none focus:ring-1 focus:ring-[#C9A25F]/50"
          >
            {allTypes.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        )}

        <p className="ml-auto text-xs text-[#A9B1BE]">
          {view === 'daily' ? `${filteredPosts.length} posts` : `${monthData.weeklyHighlights.length} highlights`} · {activeMonth}
        </p>
      </div>

      {/* Daily posts view */}
      {view === 'daily' && (
        <div className="rounded-2xl border border-white/8 bg-[#111827] overflow-hidden">
          {filteredPosts.length === 0 ? (
            <div className="p-8 text-center text-sm text-[#A9B1BE]">No posts for this filter.</div>
          ) : (
            <div className="divide-y divide-white/6">
              {filteredPosts.map((post, i) => (
                <div key={i} className="flex items-start gap-4 px-5 py-3.5 hover:bg-white/[0.02] transition-colors">
                  <div className="w-14 shrink-0 text-center">
                    <p className="text-[11px] font-bold text-[#C9A25F] uppercase tracking-wide">
                      {post.date ? new Date(post.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short' }) : ''}
                    </p>
                    <p className="text-lg font-bold text-white leading-none">
                      {post.date ? new Date(post.date + 'T12:00:00').getDate() : post.dateDisplay}
                    </p>
                    <p className="text-[10px] text-[#A9B1BE]">
                      {post.date ? new Date(post.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short' }) : ''}
                    </p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#E6EAF0] leading-snug">{post.title}</p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                      <TypeBadge type={post.contentType} />
                      <span className="text-[11px] text-[#8F98A8]">
                        <i className={`fa-brands ${CHANNEL_ICONS[post.platform] ?? 'fa-hashtag'} mr-1`} />
                        {post.platform}
                      </span>
                    </div>
                  </div>
                  <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium ${
                    post.status === 'Published'
                      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                      : 'border-amber-500/30 bg-amber-500/10 text-amber-200'
                  }`}>
                    {post.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Weekly highlights view */}
      {view === 'weekly' && (
        <div className="rounded-2xl border border-white/8 bg-[#111827] overflow-hidden">
          {monthData.weeklyHighlights.length === 0 ? (
            <div className="p-8 text-center text-sm text-[#A9B1BE]">No weekly highlights for this month.</div>
          ) : (
            <div className="divide-y divide-white/6">
              {monthData.weeklyHighlights.map((item, i) => (
                <div key={i} className="flex items-start gap-4 px-5 py-3.5 hover:bg-white/[0.02] transition-colors">
                  <div className="w-16 shrink-0">
                    <p className="text-[11px] font-semibold text-[#C9A25F]">{item.week}</p>
                    <p className="mt-0.5 text-[11px] text-[#8F98A8]">
                      <i className={`fa-brands ${CHANNEL_ICONS[item.channel] ?? 'fa-hashtag'} mr-1`} />
                      {item.channel}
                    </p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#E6EAF0] leading-snug">{item.topic}</p>
                    {item.cta && (
                      <p className="mt-1 text-[11px] text-[#8F98A8]">CTA: {item.cta}</p>
                    )}
                  </div>
                  <div className="shrink-0 text-right">
                    {item.icp && (
                      <span className="inline-block rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-[#A9B1BE]">
                        {item.icp}
                      </span>
                    )}
                    {item.contentType && (
                      <p className="mt-1 text-[10px] text-[#8F98A8]">{item.contentType}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
