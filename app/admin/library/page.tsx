'use client'

import { useState } from 'react'
import PageHeader from '../_components/PageHeader'
import { LIBRARY_TEMPLATES } from '../_lib/templates'

type Template = typeof LIBRARY_TEMPLATES[number]

export default function StrategyLibraryPage() {
  const [preview, setPreview] = useState<Template | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [searchQ, setSearchQ] = useState('')

  const filtered = LIBRARY_TEMPLATES.filter(t =>
    !searchQ || t.title.toLowerCase().includes(searchQ.toLowerCase()) ||
    t.category.toLowerCase().includes(searchQ.toLowerCase()) ||
    t.subCategory.toLowerCase().includes(searchQ.toLowerCase())
  )

  const grouped = filtered.reduce<Record<string, Template[]>>((acc, t) => {
    if (!acc[t.category]) acc[t.category] = []
    acc[t.category].push(t)
    return acc
  }, {})

  const copyTemplate = async (t: Template) => {
    const text = `${t.title}\n\n${t.structure}\n\n${t.hashtags.map(h => h.startsWith('#') ? h : `#${h}`).join(' ')}`
    try {
      await navigator.clipboard.writeText(text)
      setCopied(t.id)
      setTimeout(() => setCopied(null), 2000)
    } catch {
      setCopied(t.id)
      setTimeout(() => setCopied(null), 2000)
    }
  }

  return (
    <div className="p-6 md:p-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <PageHeader
          eyebrow="Content Strategy"
          title="Strategy Library"
          description="Pre-built content templates and messaging frameworks"
        />
        <input
          type="text"
          placeholder="Search templates..."
          value={searchQ}
          onChange={e => setSearchQ(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#C9A25F] w-full sm:w-64"
        />
      </div>

      {Object.entries(grouped).map(([category, templates]) => (
        <div key={category}>
          <h3 className="text-sm font-black uppercase tracking-widest text-[#C9A25F] mb-4">{category}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map(t => (
              <div key={t.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/8 hover:border-white/20 transition flex flex-col">
                <h4 className="text-white font-bold mb-1">{t.title}</h4>
                <p className="text-sm text-slate-400 mb-1">{t.description}</p>
                <p className="text-xs text-slate-500 mb-3">{t.subCategory}</p>

                <div className="flex flex-wrap gap-1 mb-4">
                  {t.hashtags.map((tag, idx) => (
                    <span key={idx} className="text-xs bg-[#C9A25F]/15 text-[#F4E6C5] px-2 py-0.5 rounded-full">
                      {tag.startsWith('#') ? tag : `#${tag}`}
                    </span>
                  ))}
                </div>

                <div className="mt-auto flex gap-2">
                  <button
                    onClick={() => copyTemplate(t)}
                    className={`flex-1 text-xs font-black uppercase tracking-widest py-2 rounded-lg transition ${copied === t.id ? 'bg-emerald-500/20 text-emerald-400' : 'bg-[#C9A25F]/20 hover:bg-[#C9A25F]/30 text-[#F4E6C5]'}`}
                  >
                    {copied === t.id ? '✓ Copied!' : 'Use Template'}
                  </button>
                  <button
                    onClick={() => setPreview(preview?.id === t.id ? null : t)}
                    className="flex-1 bg-white/5 hover:bg-white/10 text-white text-xs font-black uppercase tracking-widest py-2 rounded-lg transition"
                  >
                    {preview?.id === t.id ? 'Close' : 'Preview'}
                  </button>
                </div>

                {preview?.id === t.id && (
                  <div className="mt-4 bg-black/30 border border-white/10 rounded-xl p-4 text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {t.structure}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {filtered.length === 0 && (
        <div className="text-center py-16 text-slate-500">No templates match your search</div>
      )}
    </div>
  )
}
