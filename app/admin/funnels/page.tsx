'use client'

import { useState } from 'react'
import PageHeader from '../_components/PageHeader'
import { FUNNEL_BLUEPRINTS } from '../_lib/templates'

type FunnelBlueprint = typeof FUNNEL_BLUEPRINTS[number]

interface GeneratedFunnel {
  name: string
  strategy: string
  assetCopy: string
}

export default function LegacyHubPage() {
  const [expanded, setExpanded] = useState<string | null>(null)
  const [loading, setLoading] = useState<string | null>(null)
  const [generated, setGenerated] = useState<Record<string, GeneratedFunnel[]>>({})
  const [error, setError] = useState<string | null>(null)

  const launch = async (funnel: FunnelBlueprint) => {
    setLoading(funnel.id)
    setError(null)
    try {
      const res = await fetch('/api/admin/ai/funnel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal: funnel.name, persona: funnel.persona }),
      })
      if (!res.ok) throw new Error('AI request failed')
      const data = await res.json()
      setGenerated(prev => ({ ...prev, [funnel.id]: data.stages ?? data.data ?? [] }))
      setExpanded(funnel.id)
    } catch (e: any) {
      setError(e?.message ?? 'Failed to generate funnel')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="p-6 md:p-8 space-y-8">
      <PageHeader
        eyebrow="Funnel Strategy"
        title="Legacy Hub"
        description="Pre-built funnel blueprints — launch any to generate a full AI strategy"
      />

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl px-5 py-3 text-sm text-red-400">{error}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {FUNNEL_BLUEPRINTS.map(funnel => (
          <div key={funnel.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/8 hover:border-white/20 transition flex flex-col">
            <h4 className="text-white font-bold text-lg mb-2">{funnel.name}</h4>
            <p className="text-sm text-slate-400 mb-4">{funnel.description}</p>

            <div className="space-y-3 mb-4 flex-1">
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Category</p>
                <p className="text-white text-sm">{funnel.category}</p>
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Target Persona</p>
                <p className="text-white text-sm">{funnel.persona}</p>
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Stages</p>
                <div className="flex flex-wrap gap-2 mt-1.5">
                  {funnel.stages.map((stage, idx) => (
                    <span key={idx} className="text-xs bg-[#C9A25F]/15 text-[#F4E6C5] px-2 py-0.5 rounded-full">{stage}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => launch(funnel)}
                disabled={loading === funnel.id}
                className="flex-1 bg-[#C9A25F] hover:bg-[#D4AF77] disabled:opacity-60 text-slate-900 font-black text-xs uppercase tracking-widest py-2.5 rounded-xl transition flex items-center justify-center gap-2"
              >
                {loading === funnel.id ? <><i className="fa-solid fa-gear fa-spin"></i> Generating...</> : <><i className="fa-solid fa-rocket"></i> Launch</>}
              </button>
              <button
                onClick={() => setExpanded(prev => prev === funnel.id ? null : funnel.id)}
                className="flex-1 bg-white/5 hover:bg-white/10 text-white font-black text-xs uppercase tracking-widest py-2.5 rounded-xl transition"
              >
                {expanded === funnel.id ? 'Collapse' : 'Details'}
              </button>
            </div>

            {/* Generated AI Strategy */}
            {expanded === funnel.id && generated[funnel.id] && (
              <div className="mt-4 space-y-3 border-t border-white/10 pt-4">
                <p className="text-[9px] font-black uppercase tracking-widest text-[#C9A25F]">AI-Generated Strategy</p>
                {generated[funnel.id].map((stage, i) => (
                  <div key={i} className="bg-black/20 border border-white/8 rounded-xl p-3">
                    <p className="text-xs font-black text-white mb-1">{stage.name}</p>
                    <p className="text-[11px] text-slate-400 leading-relaxed mb-2">{stage.strategy}</p>
                    {stage.assetCopy && (
                      <p className="text-[11px] text-[#C9A25F] italic leading-relaxed">"{stage.assetCopy}"</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Expanded blueprint details (no AI yet) */}
            {expanded === funnel.id && !generated[funnel.id] && (
              <div className="mt-4 border-t border-white/10 pt-4">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2">Blueprint Stages</p>
                {funnel.stages.map((stage, i) => (
                  <div key={i} className="flex items-center gap-3 py-2">
                    <div className="w-6 h-6 rounded-full bg-[#C9A25F]/15 flex items-center justify-center text-[10px] font-black text-[#C9A25F] flex-shrink-0">{i + 1}</div>
                    <p className="text-sm text-slate-300">{stage}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
