'use client'

import { useState, useEffect } from 'react'

type DocCategory = 'All' | 'Brochure' | 'Product Guide' | 'Presentation' | 'Script' | 'Compliance' | 'Other'

interface DocItem {
  id: string
  title: string
  category: Exclude<DocCategory, 'All'>
  carrier?: string
  url?: string
  tags: string[]
  notes?: string
  createdAt: string
}

const now = new Date().toISOString()

const DEFAULT_DOCS: DocItem[] = [
  { id: 'd1', title: 'North American Builder Plus 4 — IUL Brochure', category: 'Brochure', carrier: 'North American', url: 'https://www.northamericancompany.com/', tags: ['iul', 'builder plus', 'north american'], notes: 'Key IUL product brochure. Emphasize tax-free growth bucket, 0% floor, living benefits.', createdAt: now },
  { id: 'd2', title: 'F&G Safe Income Advantage — FIA Brochure', category: 'Brochure', carrier: 'F&G', url: 'https://www.fglife.com/', tags: ['fia', 'annuity', 'safe income', 'rule of 72'], notes: '7.2% roll-up rate. Market-proof income. Ideal for retirees 60+.', createdAt: now },
  { id: 'd3', title: 'Ethos Velocity Term — Spec Sheet', category: 'Product Guide', carrier: 'Ethos', url: 'https://www.ethoslife.com/', tags: ['term', 'velocity', 'instant decision'], notes: '10-minute online application. No medical exam for many. Instant decisions.', createdAt: now },
  { id: 'd4', title: 'Foresters Final Expense — Product Overview', category: 'Product Guide', carrier: 'Foresters', url: 'https://www.foresters.com/', tags: ['final expense', 'foresters', 'seniors'], notes: 'Soft and empathetic positioning for seniors. Remove burden from children.', createdAt: now },
  { id: 'd5', title: 'Latimore Life & Legacy — Main Website', category: 'Other', carrier: '', url: 'https://www.latimorelifelegacy.com', tags: ['website', 'main', 'brand'], notes: 'Public-facing site. Brand assets, hero copy, services.', createdAt: now },
  { id: 'd6', title: 'The 3-Bucket Strategy — Education Script', category: 'Script', carrier: '', tags: ['script', 'education', '3 buckets', 'discovery'], notes: 'Taxable, Tax-Deferred, Tax-Free buckets. Core discovery call framework.', createdAt: now },
  { id: 'd7', title: 'Mortgage Protection Discovery Script', category: 'Script', carrier: '', tags: ['script', 'mortgage protection', 'homeowners'], notes: '"What is your biggest monthly expense?" → risk of income loss → term policy as mortgage safety net.', createdAt: now },
  { id: 'd8', title: 'IRS Codes Reference — 7702A, 72E, 101A', category: 'Compliance', carrier: '', tags: ['compliance', 'irs', 'iul', '7702a'], notes: 'Key codes for IUL tax-free positioning. 7702A: MEC test. 101A: Death benefit exclusion.', createdAt: now },
  { id: 'd9', title: 'PAHS Football 2026 — Sponsorship Proposal', category: 'Presentation', carrier: '', url: 'https://pahs.latimorelifelegacy.com', tags: ['pahs', 'sponsorship', 'community'], notes: 'CampusBox/SpiritStop sponsorship. $1,700 total, $1,240 paid, $460 due 05/18/2026.', createdAt: now },
  { id: 'd10', title: 'Key Person Insurance — School Districts Pitch', category: 'Presentation', carrier: '', tags: ['key person', 'school districts', 'b2b'], notes: 'Targeting superintendents and district administrators in Schuylkill, Luzerne, Northumberland.', createdAt: now },
  { id: 'd11', title: 'American Equity — FIA Overview', category: 'Product Guide', carrier: 'American Equity', url: 'https://www.american-equity.com/', tags: ['fia', 'annuity', 'american equity'], notes: 'Asset preservation & FIA portfolio for risk-averse clients.', createdAt: now },
  { id: 'd12', title: 'Corebridge / AGL — Product Portfolio', category: 'Product Guide', carrier: 'Corebridge', url: 'https://www.corebridgefinancial.com/', tags: ['corebridge', 'agl', 'broad market'], notes: 'Broad market protection products.', createdAt: now },
]

const CATEGORIES: DocCategory[] = ['All', 'Brochure', 'Product Guide', 'Presentation', 'Script', 'Compliance', 'Other']

const CATEGORY_COLORS: Record<string, string> = {
  'Brochure': 'bg-blue-50 text-blue-600 border-blue-100',
  'Product Guide': 'bg-emerald-50 text-emerald-600 border-emerald-100',
  'Presentation': 'bg-purple-50 text-purple-600 border-purple-100',
  'Script': 'bg-amber-50 text-amber-600 border-amber-100',
  'Compliance': 'bg-red-50 text-red-600 border-red-100',
  'Other': 'bg-slate-50 text-slate-600 border-slate-100',
}

const CATEGORY_ICONS: Record<string, string> = {
  'All': '📁', 'Brochure': '📄', 'Product Guide': '📋',
  'Presentation': '📊', 'Script': '📝', 'Compliance': '⚖️', 'Other': '📎'
}

const LS_KEY = 'latimore_docs_v2'

function loadDocs(): DocItem[] {
  if (typeof window === 'undefined') return DEFAULT_DOCS
  try {
    const saved = localStorage.getItem(LS_KEY)
    return saved ? JSON.parse(saved) : DEFAULT_DOCS
  } catch { return DEFAULT_DOCS }
}

export default function DocsPage() {
  const [docs, setDocs] = useState<DocItem[]>(() => loadDocs())
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<DocCategory>('All')
  const [showModal, setShowModal] = useState(false)
  const [editingDoc, setEditingDoc] = useState<DocItem | null>(null)
  const [newDoc, setNewDoc] = useState<Partial<DocItem>>({ category: 'Other', tags: [] })
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => { try { localStorage.setItem(LS_KEY, JSON.stringify(docs)) } catch {} }, [docs])

  const filtered = docs.filter(d => {
    const matchCat = activeCategory === 'All' || d.category === activeCategory
    const q = query.toLowerCase()
    const matchQ = !q || d.title.toLowerCase().includes(q) ||
      (d.carrier || '').toLowerCase().includes(q) ||
      d.tags.join(' ').toLowerCase().includes(q) ||
      (d.notes || '').toLowerCase().includes(q)
    return matchCat && matchQ
  }).sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  const handleSave = () => {
    if (!newDoc.title) return
    const tags = typeof newDoc.tags === 'string'
      ? (newDoc.tags as string).split(',').map(t => t.trim()).filter(Boolean)
      : (newDoc.tags || [])
    if (editingDoc) {
      setDocs(prev => prev.map(d => d.id === editingDoc.id ? { ...editingDoc, ...newDoc, tags } as DocItem : d))
    } else {
      setDocs(prev => [{
        id: Math.random().toString(36).substr(2, 9),
        title: newDoc.title!,
        category: (newDoc.category as Exclude<DocCategory, 'All'>) || 'Other',
        carrier: newDoc.carrier,
        url: newDoc.url,
        tags,
        notes: newDoc.notes,
        createdAt: new Date().toISOString(),
      }, ...prev])
    }
    setShowModal(false)
    setEditingDoc(null)
    setNewDoc({ category: 'Other', tags: [] })
  }

  const handleEdit = (doc: DocItem) => {
    setEditingDoc(doc)
    setNewDoc({ ...doc, tags: doc.tags })
    setShowModal(true)
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Brochures & Docs</h1>
          <p className="text-slate-500 font-medium mt-1">All carrier materials, scripts, and presentations.</p>
        </div>
        <button
          onClick={() => { setEditingDoc(null); setNewDoc({ category: 'Other', tags: [] }); setShowModal(true) }}
          className="flex items-center gap-2 bg-slate-900 text-white px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#C49A6C] transition-all"
        >
          <span>+</span> Add Doc
        </button>
      </div>

      {/* Search + Filters */}
      <div className="bg-white border border-slate-100 rounded-2xl p-4 space-y-4">
        <input
          type="text"
          placeholder="Search by title, carrier, or tag..."
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

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total Docs', value: docs.length },
          { label: 'Scripts', value: docs.filter(d => d.category === 'Script').length },
          { label: 'Brochures', value: docs.filter(d => d.category === 'Brochure').length },
          { label: 'Showing', value: filtered.length },
        ].map(s => (
          <div key={s.label} className="bg-white border border-slate-100 rounded-2xl p-4 text-center">
            <p className="text-2xl font-black text-slate-900">{s.value}</p>
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Document List */}
      <div className="space-y-3">
        {filtered.map(doc => (
          <div
            key={doc.id}
            className="bg-white border border-slate-100 rounded-2xl overflow-hidden hover:shadow-md transition-all"
          >
            <div
              className="flex items-center gap-4 p-4 cursor-pointer"
              onClick={() => setExpandedId(expandedId === doc.id ? null : doc.id)}
            >
              <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-lg flex-shrink-0">
                {CATEGORY_ICONS[doc.category]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-black text-slate-900 text-sm">{doc.title}</h3>
                  <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${CATEGORY_COLORS[doc.category]}`}>
                    {doc.category}
                  </span>
                  {doc.carrier && (
                    <span className="text-[9px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">
                      {doc.carrier}
                    </span>
                  )}
                </div>
                <div className="flex gap-1 mt-1 flex-wrap">
                  {doc.tags.slice(0, 4).map(tag => (
                    <span key={tag} className="text-[9px] font-bold text-slate-300">#{tag}</span>
                  ))}
                </div>
              </div>
              <span className="text-slate-300 text-sm flex-shrink-0">
                {expandedId === doc.id ? '▲' : '▼'}
              </span>
            </div>

            {expandedId === doc.id && (
              <div className="border-t border-slate-100 p-4 bg-slate-50/50 space-y-3">
                {doc.notes && (
                  <p className="text-sm text-slate-600 leading-relaxed">{doc.notes}</p>
                )}
                <div className="flex gap-2">
                  {doc.url && (
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-slate-900 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#C49A6C] transition-all flex items-center gap-1.5"
                    >
                      <i className={`fa-solid ${doc.url.startsWith('blob:') ? 'fa-file-pdf' : 'fa-external-link'} text-[9px]`}></i>
                      {doc.url.startsWith('blob:') ? 'View File' : 'Open Site →'}
                    </a>
                  )}
                  <button
                    onClick={() => handleEdit(doc)}
                    className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-slate-400 transition-all"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setDocs(prev => prev.filter(d => d.id !== doc.id))}
                    className="bg-white border border-red-100 text-red-400 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-50 transition-all"
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="py-24 text-center">
            <p className="text-slate-300 text-5xl mb-4">📁</p>
            <p className="font-black text-slate-400">No documents found</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-black text-slate-900">{editingDoc ? 'Edit Document' : 'Add Document'}</h2>
              <button onClick={() => { setShowModal(false); setEditingDoc(null) }} className="text-slate-400 hover:text-slate-700 text-xl">✕</button>
            </div>
            <div className="space-y-3">
              <input placeholder="Title *" value={newDoc.title || ''} onChange={e => setNewDoc(p => ({ ...p, title: e.target.value }))} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#C49A6C]" />
              <select value={newDoc.category || 'Other'} onChange={e => setNewDoc(p => ({ ...p, category: e.target.value as any }))} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#C49A6C]">
                {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
              </select>
              <input placeholder="Carrier (optional)" value={newDoc.carrier || ''} onChange={e => setNewDoc(p => ({ ...p, carrier: e.target.value }))} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#C49A6C]" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Upload File or Enter URL</p>
                <label className="flex items-center gap-3 cursor-pointer border border-dashed border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-500 hover:border-[#C49A6C] hover:text-[#C49A6C] transition-all mb-2">
                  <i className="fa-solid fa-file-arrow-up text-[#C49A6C]"></i>
                  <span>{newDoc.url?.startsWith('blob:') || newDoc.url?.startsWith('data:') ? '✓ File attached' : 'Choose PDF or image...'}</span>
                  <input type="file" accept=".pdf,image/*" className="hidden" onChange={e => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    const url = URL.createObjectURL(file)
                    setNewDoc(p => ({ ...p, url, title: p.title || file.name }))
                  }} />
                </label>
                <input placeholder="— or paste a URL —" value={(newDoc.url?.startsWith('blob:') || newDoc.url?.startsWith('data:')) ? '' : (newDoc.url || '')} onChange={e => setNewDoc(p => ({ ...p, url: e.target.value }))} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#C49A6C]" />
              </div>
              <input placeholder="Tags (comma separated)" value={Array.isArray(newDoc.tags) ? newDoc.tags.join(', ') : (newDoc.tags || '')} onChange={e => setNewDoc(p => ({ ...p, tags: e.target.value as any }))} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#C49A6C]" />
              <textarea placeholder="Notes (optional)" value={newDoc.notes || ''} onChange={e => setNewDoc(p => ({ ...p, notes: e.target.value }))} rows={3} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#C49A6C] resize-none" />
            </div>
            <button onClick={handleSave} className="w-full bg-slate-900 text-white py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#C49A6C] transition-all">
              {editingDoc ? 'Save Changes' : 'Add Document'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
