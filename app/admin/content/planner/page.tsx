'use client'

import { useMemo, useState } from 'react'

type TrackKey = 'families' | 'retirees' | 'districts'

type Article = { num: string; ctaType: 'application' | 'referral' | 'district'; title: string; angle: string; painPoint: string; format: string; cta: string; kpi: string; seo: string[] }

const tracks: Record<TrackKey, Article[]> = {
  families: [{ num: 'A1', ctaType: 'application', title: 'What happens to your family if you die before your mortgage is paid off?', angle: 'Founder story hook — the AED that saved a life, and what the absence of a plan would have meant', painPoint: 'Fear of leaving a spouse and kids with debt and no income replacement', format: '2,000-word narrative + decision checklist', cta: 'Book a no-cost 20-minute protection review', kpi: 'Monthly applications', seo: ['life insurance Schuylkill County PA'] }],
  retirees: [{ num: 'B1', ctaType: 'application', title: "One hospital stay wiped out 20 years of savings — how to make sure it doesn't happen to you", angle: 'Illustrative composite case study; living benefits introduced as the practical solution', painPoint: 'Fear that one health event erases decades of careful saving', format: '1,800-word narrative + living benefits explainer sidebar', cta: 'Find out if your current policy has living benefits — free policy review', kpi: 'Monthly applications', seo: ['living benefits life insurance PA'] }],
  districts: [{ num: 'C1', ctaType: 'district', title: 'What happens to your school district if the superintendent dies on Monday?', angle: 'Operational continuity framing; targets school board members and business administrators directly', painPoint: 'Risk of organizational chaos', format: '2,000-word authoritative post + District Risk & Continuity Checklist', cta: 'Request the School District Risk & Continuity Briefing — no cost', kpi: 'District contract pipeline', seo: ['key person insurance school district PA'] }],
}

export default function PlannerPage() {
  const [activeTrack, setActiveTrack] = useState<TrackKey>('families')
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const current = useMemo(() => tracks[activeTrack], [activeTrack])

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl mb-4">Latimore Life & Legacy — Blog Series Planner</h1>
      <div className="flex gap-2 mb-4">
        {(['families', 'retirees', 'districts'] as TrackKey[]).map((track) => (
          <button key={track} onClick={() => setActiveTrack(track)} className={`px-3 py-2 rounded ${activeTrack === track ? 'bg-amber-500 text-black' : 'bg-slate-700'}`}>{track}</button>
        ))}
      </div>
      <div className="space-y-3">
        {current.map((article) => (
          <div key={article.num} className="border border-white/20 rounded p-3">
            <button className="w-full text-left" onClick={() => setExpanded((prev) => ({ ...prev, [article.num]: !prev[article.num] }))}>
              <p className="font-semibold">{article.num} — {article.title}</p>
              <p className="text-sm text-slate-300">{article.angle}</p>
            </button>
            {expanded[article.num] && <div className="mt-2 text-sm text-slate-300"><p>{article.painPoint}</p><p>{article.format}</p><p>{article.cta}</p></div>}
          </div>
        ))}
      </div>
    </div>
  )
}
