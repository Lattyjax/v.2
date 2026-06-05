'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, useCallback } from 'react'
import { FileText, Plus, Copy, Trash2, CheckCircle, Clock, Filter } from 'lucide-react'
import PageHeader from '../../_components/PageHeader'
import AdminCard from '../../_components/AdminCard'
import EmptyState from '../../_components/EmptyState'

interface SocialTemplate {
  id:               string
  title:            string
  category:         string
  platform:         string | null
  audienceTrack:    string | null
  body:             string
  cta:              string | null
  hashtags:         string[]
  suggestedDay:     string | null
  suggestedTime:    string | null
  campaign:         string | null
  complianceStatus: string
  createdAt:        string
  updatedAt:        string
  _count:           { usages: number }
}

interface CategoryGroup { category: string; _count: { _all: number } }

const STATUS_COLOR: Record<string, string> = {
  draft:    'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  approved: 'bg-green-500/10  text-green-400  border-green-500/20',
  archived: 'bg-white/5       text-[#8F98A8]  border-white/10',
}

const PLATFORM_EMOJI: Record<string, string> = {
  facebook:  '📘',
  instagram: '📸',
  linkedin:  '💼',
  twitter:   '🐦',
}

export default function TemplatesPage() {
  const [templates,  setTemplates]  = useState<SocialTemplate[]>([])
  const [categories, setCategories] = useState<CategoryGroup[]>([])
  const [filter,     setFilter]     = useState('')
  const [platform,   setPlatform]   = useState('')
  const [loading,    setLoading]    = useState(true)
  const [creating,   setCreating]   = useState(false)
  const [newTitle,   setNewTitle]   = useState('')
  const [newCat,     setNewCat]     = useState('Educational')
  const [newPlatform,setNewPlatform]= useState('')
  const [newBody,    setNewBody]    = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ take: '100' })
    if (platform) params.set('platform', platform)
    const res = await fetch(`/api/social/templates?\${params}`)
    const data = await res.json()
    if (data.ok) {
      setTemplates(data.templates)
      setCategories(data.categories)
    }
    setLoading(false)
  }, [platform])

  useEffect(() => { load() }, [load])

  const clone = async (id: string) => {
    await fetch('/api/social/templates', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, clone: true }) })
    load()
  }

  const remove = async (id: string) => {
    if (!confirm('Delete this template?')) return
    await fetch(`/api/social/templates?id=\${id}`, { method: 'DELETE' })
    load()
  }

  const approve = async (id: string) => {
    await fetch('/api/social/templates', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, complianceStatus: 'approved' }) })
    load()
  }

  const create = async () => {
    if (!newTitle || !newBody) return
    await fetch('/api/social/templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTitle, category: newCat, platform: newPlatform || null, body: newBody }),
    })
    setNewTitle(''); setNewBody(''); setNewPlatform(''); setCreating(false)
    load()
  }

  const filtered = templates.filter(t =>
    !filter || t.title.toLowerCase().includes(filter.toLowerCase()) || t.body.toLowerCase().includes(filter.toLowerCase())
  )

  const grouped = filtered.reduce<Record<string, SocialTemplate[]>>((acc, t) => {
    acc[t.category] = acc[t.category] ?? []
    acc[t.category].push(t)
    return acc
  }, {})

  return (
    <div className="p-6 md:p-8">
      <PageHeader
        eyebrow="Content OS"
        title="Social Templates"
        description="Reusable post templates by platform, audience, and campaign. Clone to schedule, approve before publishing."
      />

      {/* Stats row */}
      <div className="mb-6 flex flex-wrap gap-3">
        {categories.map(c => (
          <button
            key={c.category}
            onClick={() => setFilter(f => f === c.category ? '' : c.category)}
            className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-[#A9B1BE] transition hover:border-white/20 hover:text-white"
          >
            {c.category} <span className="ml-1 text-[#5E6673]">({c._count._all})</span>
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Filter size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5E6673]" />
          <input
            value={filter}
            onChange={e => setFilter(e.target.value)}
            placeholder="Search templates…"
            className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-2 pl-8 pr-4 text-sm text-white placeholder:text-[#5E6673] focus:outline-none focus:ring-1 focus:ring-[#C49A6C]/40"
          />
        </div>
        <select
          value={platform}
          onChange={e => setPlatform(e.target.value)}
          className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white focus:outline-none"
        >
          <option value="">All platforms</option>
          {['facebook','instagram','linkedin','twitter'].map(p => (
            <option key={p} value={p}>{PLATFORM_EMOJI[p]} {p}</option>
          ))}
        </select>
        <button
          onClick={() => setCreating(c => !c)}
          className="flex items-center gap-2 rounded-xl bg-[#2C3E50] px-4 py-2 text-sm font-medium text-[#C49A6C] transition hover:opacity-90"
        >
          <Plus size={14} /> New Template
        </button>
      </div>

      {/* Create form */}
      {creating && (
        <AdminCard title="New Template" className="mb-6">
          <div className="space-y-3">
            <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Title" className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-white placeholder:text-[#5E6673] focus:outline-none" />
            <div className="flex gap-3">
              <select value={newCat} onChange={e => setNewCat(e.target.value)} className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white focus:outline-none">
                {['Educational','Engagement','Seasonal','Promotional','Tips','Story','LinkedIn','General'].map(c => <option key={c}>{c}</option>)}
              </select>
              <select value={newPlatform} onChange={e => setNewPlatform(e.target.value)} className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white focus:outline-none">
                <option value="">All platforms</option>
                {['facebook','instagram','linkedin','twitter'].map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <textarea value={newBody} onChange={e => setNewBody(e.target.value)} placeholder="Post body…" rows={4} className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-white placeholder:text-[#5E6673] focus:outline-none resize-none" />
            <div className="flex gap-2">
              <button onClick={create} className="rounded-xl bg-[#2C3E50] px-4 py-2 text-sm font-medium text-[#C49A6C] hover:opacity-90">Save Template</button>
              <button onClick={() => setCreating(false)} className="rounded-xl border border-white/10 px-4 py-2 text-sm text-[#A9B1BE] hover:border-white/20">Cancel</button>
            </div>
          </div>
        </AdminCard>
      )}

      {/* Template groups */}
      {loading ? (
        <p className="text-sm text-[#5E6673]">Loading templates…</p>
      ) : filtered.length === 0 ? (
        <EmptyState title="No templates found" description="Create your first template or adjust filters." icon={<FileText size={18} />} />
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([cat, items]) => (
            <AdminCard key={cat} title={cat}>
              <div className="space-y-3">
                {items.map(t => (
                  <div key={t.id} className="rounded-2xl border border-white/8 bg-white/[0.02] p-4">
                    <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-white">
                          {t.platform ? PLATFORM_EMOJI[t.platform] + ' ' : ''}{t.title}
                        </p>
                        <p className="mt-0.5 text-xs text-[#5E6673]">
                          {t.audienceTrack ?? 'General audience'} · Used {t._count.usages}×
                          {t.suggestedDay ? ` · ${t.suggestedDay}` : ''}
                          {t.suggestedTime ? ` @ ${t.suggestedTime}` : ''}
                        </p>
                      </div>
                      <span className={`rounded-full border px-2 py-0.5 text-[10px] \${STATUS_COLOR[t.complianceStatus] ?? STATUS_COLOR.draft}`}>
                        {t.complianceStatus}
                      </span>
                    </div>
                    <p className="line-clamp-3 whitespace-pre-wrap text-sm leading-6 text-[#E6EAF0]">{t.body}</p>
                    {t.cta && <p className="mt-1 text-xs text-[#C49A6C]">CTA: {t.cta}</p>}
                    {Array.isArray(t.hashtags) && t.hashtags.length > 0 && (
                      <p className="mt-1 text-xs text-[#5E6673]">{(t.hashtags as string[]).join(' ')}</p>
                    )}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {t.complianceStatus !== 'approved' && (
                        <button onClick={() => approve(t.id)} className="flex items-center gap-1 rounded-lg border border-green-500/20 bg-green-500/5 px-3 py-1 text-xs text-green-400 hover:bg-green-500/10">
                          <CheckCircle size={11} /> Approve
                        </button>
                      )}
                      <button onClick={() => clone(t.id)} className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-[#A9B1BE] hover:border-white/20">
                        <Copy size={11} /> Clone
                      </button>
                      <button onClick={() => remove(t.id)} className="flex items-center gap-1 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-1 text-xs text-red-400 hover:bg-red-500/10">
                        <Trash2 size={11} /> Delete
                      </button>
                      <span className="ml-auto flex items-center gap-1 text-[10px] text-[#5E6673]">
                        <Clock size={10} /> {new Date(t.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </AdminCard>
          ))}
        </div>
      )}
    </div>
  )
}
