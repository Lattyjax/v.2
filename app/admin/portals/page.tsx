'use client'

import { useState } from 'react'

type LinkCategory = 'All' | 'Carrier' | 'GFI' | 'Portals' | 'Social' | 'Tools' | 'Funnels' | 'Other'

interface LinkItem {
  id: string
  name: string
  url: string
  category: Exclude<LinkCategory, 'All'>
  tags: string[]
  notes?: string
  isFavorite?: boolean
}

const DEFAULT_LINKS: LinkItem[] = [
  { id: 'gfi-portal', name: 'GFI Portal', url: 'https://globalfinancialimpact.com/', category: 'GFI', tags: ['gfi', 'portal'], notes: 'Main GFI portal login.', isFavorite: true },
  { id: 'gfi-training', name: 'GFI Training Hub', url: 'https://globalfinancialimpact.com/training', category: 'GFI', tags: ['gfi', 'training'], notes: 'Carrier training & certifications.' },
  { id: 'carrier-northam', name: 'North American', url: 'https://www.northamericancompany.com/', category: 'Carrier', tags: ['iul', 'builder plus'], notes: 'IUL underwriting & Builder Plus 4.', isFavorite: true },
  { id: 'carrier-fg', name: 'F&G Annuities', url: 'https://www.fglife.com/', category: 'Carrier', tags: ['annuity', 'fia', 'safe income'], notes: 'Fixed Indexed Annuities & Safe Income Advantage.' },
  { id: 'carrier-ethos', name: 'Ethos Velocity', url: 'https://www.ethoslife.com/', category: 'Carrier', tags: ['term', 'velocity', 'instant decision'], notes: 'Instant decision term underwriting.', isFavorite: true },
  { id: 'carrier-ameq', name: 'American Equity', url: 'https://www.american-equity.com/', category: 'Carrier', tags: ['annuity', 'fia'], notes: 'Asset preservation & FIA portfolio.' },
  { id: 'carrier-foresters', name: 'Foresters Financial', url: 'https://www.foresters.com/', category: 'Carrier', tags: ['whole life', 'final expense'], notes: 'Whole life & final expense.' },
  { id: 'carrier-corebridge', name: 'Corebridge / AGL', url: 'https://www.corebridgefinancial.com/', category: 'Carrier', tags: ['corebridge', 'agl', 'term'], notes: 'Corebridge / American General Life.' },
  { id: 'carrier-trustage', name: 'TruStage / Ethos', url: 'https://www.trustage.com/', category: 'Carrier', tags: ['trustage', 'ethos'], notes: 'TruStage life products.' },
  { id: 'portal-calendly', name: 'Google Calendar Booking', url: 'https://calendar.app.google/qsZrpBUF78SPnJ6y9', category: 'Portals', tags: ['booking', 'calendar'], notes: 'Public booking link — share with prospects.', isFavorite: true },
  { id: 'portal-nipr', name: 'NIPR License Portal', url: 'https://www.nipr.com/', category: 'Portals', tags: ['license', 'nipr'], notes: 'PA License #1268820 / NIPR #21638507.' },
  { id: 'portal-supabase', name: 'Supabase Dashboard', url: 'https://supabase.com/dashboard', category: 'Portals', tags: ['supabase', 'database'], notes: 'Hub database admin.' },
  { id: 'portal-vercel', name: 'Vercel Dashboard', url: 'https://vercel.com/jackson-latimore-s-projects', category: 'Portals', tags: ['vercel', 'deploy'], notes: 'Deployment & domain management.' },
  { id: 'portal-resend', name: 'Resend Email', url: 'https://resend.com/dashboard', category: 'Portals', tags: ['email', 'resend'], notes: 'Email infrastructure dashboard.' },
  { id: 'portal-ga4', name: 'Google Analytics', url: 'https://analytics.google.com/', category: 'Portals', tags: ['analytics', 'ga4'], notes: 'GA4: G-S0Q3E4DEBJ (main) / G-91DT7W1KRP (card).' },
  { id: 'social-fb', name: 'Facebook Business', url: 'https://business.facebook.com/', category: 'Social', tags: ['facebook', 'social'], isFavorite: true },
  { id: 'social-linkedin', name: 'LinkedIn', url: 'https://www.linkedin.com/', category: 'Social', tags: ['linkedin', 'b2b'] },
  { id: 'tools-canva', name: 'Canva', url: 'https://www.canva.com/', category: 'Tools', tags: ['design', 'canva'], notes: 'Brand graphics & marketing materials.' },
  { id: 'tools-github', name: 'GitHub Org', url: 'https://github.com/latimorelifelegacy25', category: 'Tools', tags: ['github', 'code'], notes: 'latimorelifelegacy25 org.' },
  { id: 'funnel-pahs', name: 'PAHS Football 2026', url: 'https://pahs.latimorelifelegacy.com', category: 'Funnels', tags: ['pahs', 'sponsorship'], notes: 'PAHS Football sponsorship landing page.', isFavorite: true },
  { id: 'funnel-main', name: 'Main Site', url: 'https://www.latimorelifelegacy.com', category: 'Funnels', tags: ['website', 'main'], notes: 'Primary public-facing site.' },
]

const CATEGORIES: LinkCategory[] = ['All', 'Carrier', 'GFI', 'Portals', 'Social', 'Tools', 'Funnels', 'Other']

const CATEGORY_ICONS: Record<string, string> = {
  'All': '🔗', 'Carrier': '🛡️', 'GFI': '🏢', 'Portals': '🚪',
  'Social': '📱', 'Tools': '🔧', 'Funnels': '🎯', 'Other': '📎'
}

export default function PortalsPage() {
  const [links, setLinks] = useState<LinkItem[]>(DEFAULT_LINKS)
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<LinkCategory>('All')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingLink, setEditingLink] = useState<LinkItem | null>(null)
  const [newLink, setNewLink] = useState<Partial<LinkItem>>({ category: 'Other', tags: [] })
  const [copied, setCopied] = useState<string | null>(null)

  const filtered = links.filter(l => {
    const matchCat = activeCategory === 'All' || l.category === activeCategory
    const q = query.toLowerCase()
    const matchQuery = !q || l.name.toLowerCase().includes(q) || l.url.toLowerCase().includes(q) ||
      l.tags.join(' ').toLowerCase().includes(q) || (l.notes || '').toLowerCase().includes(q)
    return matchCat && matchQuery
  })

  const favorites = filtered.filter(l => l.isFavorite)
  const rest = filtered.filter(l => !l.isFavorite)

  const handleCopy = (url: string, id: string) => {
    navigator.clipboard.writeText(url)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const toggleFavorite = (id: string) => {
    setLinks(prev => prev.map(l => l.id === id ? { ...l, isFavorite: !l.isFavorite } : l))
  }

  const handleSave = () => {
    if (!newLink.name || !newLink.url) return
    if (editingLink) {
      setLinks(prev => prev.map(l => l.id === editingLink.id ? { ...editingLink, ...newLink } as LinkItem : l))
    } else {
      const item: LinkItem = {
        id: Math.random().toString(36).substr(2, 9),
        name: newLink.name!,
        url: newLink.url!,
        category: (newLink.category as Exclude<LinkCategory, 'All'>) || 'Other',
        tags: typeof newLink.tags === 'string' ? (newLink.tags as string).split(',').map(t => t.trim()) : (newLink.tags || []),
        notes: newLink.notes,
        isFavorite: false,
      }
      setLinks(prev => [item, ...prev])
    }
    setShowAddModal(false)
    setEditingLink(null)
    setNewLink({ category: 'Other', tags: [] })
  }

  const handleEdit = (link: LinkItem) => {
    setEditingLink(link)
    setNewLink({ ...link, tags: link.tags })
    setShowAddModal(true)
  }

  const handleDelete = (id: string) => {
    setLinks(prev => prev.filter(l => l.id !== id))
  }

  const LinkCard = ({ link }: { link: LinkItem }) => (
    <div className="bg-white border border-slate-100 rounded-2xl p-4 hover:shadow-md transition-all group flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[9px] font-black uppercase tracking-widest text-[#C49A6C] bg-[#C49A6C]/10 px-2 py-0.5 rounded-full">
              {link.category}
            </span>
            {link.isFavorite && <span className="text-[#C49A6C] text-xs">★</span>}
          </div>
          <h3 className="font-black text-slate-900 text-sm truncate">{link.name}</h3>
          <p className="text-xs text-slate-400 truncate mt-0.5">{link.url}</p>
        </div>
        <button
          onClick={() => toggleFavorite(link.id)}
          className="text-slate-300 hover:text-[#C49A6C] transition-colors flex-shrink-0"
        >
          {link.isFavorite ? '★' : '☆'}
        </button>
      </div>

      {link.notes && (
        <p className="text-xs text-slate-500 bg-slate-50 rounded-xl px-3 py-2 leading-relaxed">{link.notes}</p>
      )}

      {link.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {link.tags.map(tag => (
            <span key={tag} className="text-[9px] font-bold text-slate-400">#{tag}</span>
          ))}
        </div>
      )}

      <div className="flex gap-2 pt-1">
        <a
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 bg-slate-900 text-white text-center py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#C49A6C] transition-all"
        >
          Open
        </a>
        <button
          onClick={() => handleCopy(link.url, link.id)}
          className="px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-black text-slate-500 hover:border-[#C49A6C] hover:text-[#C49A6C] transition-all"
        >
          {copied === link.id ? '✓' : 'Copy'}
        </button>
        <button
          onClick={() => handleEdit(link)}
          className="px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-black text-slate-500 hover:border-slate-400 transition-all"
        >
          Edit
        </button>
      </div>
    </div>
  )

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Portals & Links</h1>
          <p className="text-slate-500 font-medium mt-1">Every carrier, tool, and portal — one place.</p>
        </div>
        <button
          onClick={() => { setEditingLink(null); setNewLink({ category: 'Other', tags: [] }); setShowAddModal(true) }}
          className="flex items-center gap-2 bg-slate-900 text-white px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#C49A6C] transition-all"
        >
          <span>+</span> Add Link
        </button>
      </div>

      {/* Search + Filters */}
      <div className="bg-white border border-slate-100 rounded-2xl p-4 space-y-4">
        <input
          type="text"
          placeholder="Search links, tags, or notes..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#C49A6C] font-medium"
        />
        <div className="flex gap-2 overflow-x-auto pb-1">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                activeCategory === cat
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-slate-50 text-slate-400 border border-slate-100 hover:text-slate-700'
              }`}
            >
              <span>{CATEGORY_ICONS[cat]}</span> {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total Links', value: links.length },
          { label: 'Favorites', value: links.filter(l => l.isFavorite).length },
          { label: 'Carriers', value: links.filter(l => l.category === 'Carrier').length },
          { label: 'Showing', value: filtered.length },
        ].map(stat => (
          <div key={stat.label} className="bg-white border border-slate-100 rounded-2xl p-4 text-center">
            <p className="text-2xl font-black text-slate-900">{stat.value}</p>
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Favorites Section */}
      {favorites.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xs font-black uppercase tracking-widest text-[#C49A6C] flex items-center gap-2">
            <span>★</span> Favorites
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {favorites.map(link => <LinkCard key={link.id} link={link} />)}
          </div>
        </div>
      )}

      {/* All Links */}
      {rest.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xs font-black uppercase tracking-widest text-slate-400">
            {favorites.length > 0 ? 'All Links' : 'Links'} ({rest.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {rest.map(link => <LinkCard key={link.id} link={link} />)}
          </div>
        </div>
      )}

      {filtered.length === 0 && (
        <div className="py-24 text-center">
          <p className="text-slate-300 text-5xl mb-4">🔗</p>
          <p className="font-black text-slate-400">No links found</p>
          <p className="text-sm text-slate-300 mt-1">Try a different search or category</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-black text-slate-900">{editingLink ? 'Edit Link' : 'Add New Link'}</h2>
              <button onClick={() => { setShowAddModal(false); setEditingLink(null) }} className="text-slate-400 hover:text-slate-700 text-xl">✕</button>
            </div>
            <div className="space-y-3">
              <input
                placeholder="Name *"
                value={newLink.name || ''}
                onChange={e => setNewLink(p => ({ ...p, name: e.target.value }))}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#C49A6C]"
              />
              <input
                placeholder="URL * (https://...)"
                value={newLink.url || ''}
                onChange={e => setNewLink(p => ({ ...p, url: e.target.value }))}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#C49A6C]"
              />
              <select
                value={newLink.category || 'Other'}
                onChange={e => setNewLink(p => ({ ...p, category: e.target.value as any }))}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#C49A6C]"
              >
                {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
              </select>
              <input
                placeholder="Tags (comma separated)"
                value={Array.isArray(newLink.tags) ? newLink.tags.join(', ') : (newLink.tags || '')}
                onChange={e => setNewLink(p => ({ ...p, tags: e.target.value as any }))}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#C49A6C]"
              />
              <textarea
                placeholder="Notes (optional)"
                value={newLink.notes || ''}
                onChange={e => setNewLink(p => ({ ...p, notes: e.target.value }))}
                rows={2}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#C49A6C] resize-none"
              />
            </div>
            <div className="flex gap-3 pt-2">
              {editingLink && (
                <button
                  onClick={() => { handleDelete(editingLink.id); setShowAddModal(false); setEditingLink(null) }}
                  className="px-4 py-3 bg-red-50 text-red-500 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-100 transition-all"
                >
                  Delete
                </button>
              )}
              <button
                onClick={handleSave}
                className="flex-1 bg-slate-900 text-white py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#C49A6C] transition-all"
              >
                {editingLink ? 'Save Changes' : 'Add Link'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
