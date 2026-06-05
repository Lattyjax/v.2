'use client'

import { useState } from 'react'
import PageHeader from '../_components/PageHeader'

type LinkCategory = 'Carrier Portal' | 'Client Portal' | 'Tools' | 'Community' | 'Compliance' | 'Other'

interface LinkItem {
  id: string
  title: string
  url: string
  category: LinkCategory
  description?: string
}

const DEFAULT_LINKS: LinkItem[] = [
  { id: 'l1', title: 'North American Company — Agent Portal', url: 'https://www.northamericancompany.com/agent-portal', category: 'Carrier Portal', description: 'Builder Plus IUL applications and policy management' },
  { id: 'l2', title: 'F&G Life — Agent Access', url: 'https://www.fglife.com/agent', category: 'Carrier Portal', description: 'Safe Income Advantage FIA quotes and submissions' },
  { id: 'l3', title: 'Ethos Life — Agent Invite', url: 'https://agents.ethoslife.com/invite/29ad1', category: 'Carrier Portal', description: 'Velocity Term instant decision applications' },
  { id: 'l4', title: 'Foresters Financial — Agent Portal', url: 'https://www.foresters.com/agent', category: 'Carrier Portal', description: 'Final expense and whole life products' },
  { id: 'l5', title: 'American Equity — Agent Portal', url: 'https://www.american-equity.com/agent', category: 'Carrier Portal', description: 'FIA products for risk-averse clients' },
  { id: 'l6', title: 'Corebridge Financial (AGL) — Agent Portal', url: 'https://www.corebridgefinancial.com/agent', category: 'Carrier Portal', description: 'Broad market protection portfolio' },
  { id: 'l7', title: 'Latimore Life & Legacy — Main Website', url: 'https://www.latimorelifelegacy.com', category: 'Client Portal', description: 'Public-facing brand site' },
  { id: 'l8', title: 'Digital Business Card', url: 'https://card.latimorelifelegacy.com', category: 'Client Portal', description: 'NFC/QR share card' },
  { id: 'l9', title: 'Fillout Consultation Form', url: 'https://latimorelifelegacy.fillout.com/latimorelifelegacy', category: 'Client Portal', description: 'Primary booking and intake form' },
  { id: 'l10', title: 'PAHS Sponsorship Page', url: 'https://pahs.latimorelifelegacy.com', category: 'Community', description: 'Pottsville Area High School 2026 sponsorship' },
  { id: 'l11', title: 'Global Financial Impact (GFI)', url: 'https://www.globalfinancialimpact.com', category: 'Tools', description: 'Upline affiliation and training resources' },
  { id: 'l12', title: 'PA DOI License Lookup', url: 'https://pls.pa.gov/pals', category: 'Compliance', description: 'PA Department of Insurance — verify license #1268820' },
  { id: 'l13', title: 'NIPR License Record', url: 'https://www.nipr.com/PacNpnSearch.htm', category: 'Compliance', description: 'NPN #21638507 national producer record' },
]

const CATEGORIES: LinkCategory[] = ['Carrier Portal', 'Client Portal', 'Tools', 'Community', 'Compliance', 'Other']

const CAT_COLORS: Record<string, string> = {
  'Carrier Portal': 'bg-blue-500/10 text-blue-400',
  'Client Portal': 'bg-emerald-500/10 text-emerald-400',
  'Tools': 'bg-violet-500/10 text-violet-400',
  'Community': 'bg-amber-500/10 text-amber-400',
  'Compliance': 'bg-red-500/10 text-red-400',
  'Other': 'bg-slate-500/10 text-slate-400',
}

const CAT_ICONS: Record<string, string> = {
  'Carrier Portal': 'fa-building-columns',
  'Client Portal': 'fa-user-tie',
  'Tools': 'fa-wrench',
  'Community': 'fa-people-group',
  'Compliance': 'fa-scale-balanced',
  'Other': 'fa-link',
}

export default function PortalsAndLinksPage() {
  const [links, setLinks] = useState<LinkItem[]>(DEFAULT_LINKS)
  const [filter, setFilter] = useState<LinkCategory | 'All'>('All')
  const [query, setQuery] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<LinkItem | null>(null)
  const [form, setForm] = useState<Partial<LinkItem>>({ category: 'Other' })

  const filtered = links.filter(l => {
    const matchCat = filter === 'All' || l.category === filter
    const q = query.toLowerCase()
    const matchQ = !q || l.title.toLowerCase().includes(q) || l.url.toLowerCase().includes(q) || (l.description ?? '').toLowerCase().includes(q)
    return matchCat && matchQ
  })

  const openAdd = () => { setEditing(null); setForm({ category: 'Other' }); setShowModal(true) }
  const openEdit = (l: LinkItem) => { setEditing(l); setForm({ ...l }); setShowModal(true) }

  const save = () => {
    if (!form.title || !form.url) return
    if (editing) {
      setLinks(prev => prev.map(l => l.id === editing.id ? { ...editing, ...form } as LinkItem : l))
    } else {
      setLinks(prev => [...prev, { id: Date.now().toString(), title: form.title!, url: form.url!, category: form.category as LinkCategory, description: form.description }])
    }
    setShowModal(false)
  }

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <PageHeader eyebrow="Resource Hub" title="Portals & Links" description="Carrier portals, client portals, and important links" />
        <button onClick={openAdd} className="flex items-center gap-2 bg-[#C9A25F] text-slate-900 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#D4AF77] transition flex-shrink-0">
          <i className="fa-solid fa-plus"></i> Add Link
        </button>
      </div>

      {/* Search + filters */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
        <input
          type="text"
          placeholder="Search links..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#C9A25F]"
        />
        <div className="flex gap-2 overflow-x-auto pb-1">
          {(['All', ...CATEGORIES] as const).map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${filter === cat ? 'bg-[#C9A25F] text-slate-900' : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'}`}
            >
              {cat !== 'All' && <i className={`fa-solid ${CAT_ICONS[cat]}`}></i>} {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(link => (
          <div key={link.id} className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col gap-3 hover:bg-white/8 hover:border-white/20 transition group">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-[#C9A25F]/15 flex items-center justify-center flex-shrink-0">
                  <i className={`fa-solid ${CAT_ICONS[link.category]} text-[#C9A25F] text-sm`}></i>
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-white text-sm truncate">{link.title}</p>
                  <span className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full ${CAT_COLORS[link.category]}`}>
                    {link.category}
                  </span>
                </div>
              </div>
              <button onClick={() => openEdit(link)} className="opacity-0 group-hover:opacity-100 transition text-slate-500 hover:text-white flex-shrink-0">
                <i className="fa-solid fa-pen text-xs"></i>
              </button>
            </div>
            {link.description && <p className="text-xs text-slate-400 leading-relaxed">{link.description}</p>}
            <div className="flex gap-2 mt-auto">
              <a href={link.url} target="_blank" rel="noopener noreferrer"
                className="flex-1 text-center bg-[#C9A25F]/10 hover:bg-[#C9A25F]/20 text-[#C9A25F] text-[10px] font-black uppercase tracking-widest py-2 rounded-lg transition">
                Open →
              </a>
              <button onClick={() => { navigator.clipboard.writeText(link.url) }}
                className="px-3 py-2 bg-white/5 hover:bg-white/10 text-slate-400 text-[10px] rounded-lg transition" title="Copy URL">
                <i className="fa-solid fa-copy"></i>
              </button>
              <button onClick={() => setLinks(prev => prev.filter(l => l.id !== link.id))}
                className="px-3 py-2 bg-red-500/5 hover:bg-red-500/10 text-red-400 text-[10px] rounded-lg transition" title="Remove">
                <i className="fa-solid fa-trash"></i>
              </button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-slate-500">No links found</div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-[#0E1420] border border-white/10 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-black text-white">{editing ? 'Edit Link' : 'Add Link'}</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <input placeholder="Title *" value={form.title ?? ''} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#C9A25F]" />
            <input placeholder="URL *" value={form.url ?? ''} onChange={e => setForm(p => ({ ...p, url: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#C9A25F]" />
            <select value={form.category ?? 'Other'} onChange={e => setForm(p => ({ ...p, category: e.target.value as LinkCategory }))}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#C9A25F]">
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input placeholder="Description (optional)" value={form.description ?? ''} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#C9A25F]" />
            <button onClick={save} className="w-full bg-[#C9A25F] text-slate-900 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#D4AF77] transition">
              {editing ? 'Save Changes' : 'Add Link'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
