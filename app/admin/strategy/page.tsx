'use client'

import { useState } from 'react'

interface Strategy {
  id: string
  category: string
  subCategory: string
  title: string
  description: string
  structure: string
  hashtags: string[]
  isFavorite?: boolean
}

const STRATEGIES: Strategy[] = [
  {
    id: 's0', category: 'Legacy & Estate', subCategory: 'Legacy Protection',
    title: 'The Importance of Securing Legacy',
    description: 'A high-impact strategy explaining how life insurance acts as the ultimate bedrock for a family\'s future.',
    structure: 'Open with the concept that a legacy isn\'t just what you leave FOR someone, but what you leave IN them. Transition to the financial tools (IUL/Term) that ensure the mission continues. Emphasize preparation over fear. CTA: Start building your legacy blueprint today.',
    hashtags: ['LegacyBuilding', 'FamilyFirst', 'TheBeatGoesOn', 'LatimoreLegacy'], isFavorite: true
  },
  {
    id: 's1', category: 'Life Insurance', subCategory: 'Mortgage Protection',
    title: 'Home Security Beyond the Locks',
    description: 'A compelling post explaining why life insurance is the ultimate mortgage safety net.',
    structure: 'Start by asking homeowners what their biggest monthly expense is. Transition to the risk of losing income. Explain how mortgage protection works as a specific term policy. CTA: "Ensure your family keeps the keys, no matter what."',
    hashtags: ['MortgageProtection', 'Homeowners', 'PeaceOfMind']
  },
  {
    id: 's2', category: 'Life Insurance', subCategory: 'IUL',
    title: 'The "And" Asset Strategy (Builder Plus 4)',
    description: 'Explaining Indexed Universal Life for both protection and supplemental retirement using the North American Builder Plus 4.',
    structure: 'Focus on the "Tax-Free" bucket. Compare traditional savings to IUL growth potential with a 0% floor. Emphasize the death benefit AND the living benefits. End with a legacy-building prompt. Reference IRS codes 7702A, 72E, and 101A.',
    hashtags: ['IUL', 'TaxFreeRetirement', 'WealthBuilding'], isFavorite: true
  },
  {
    id: 's3', category: 'Annuities', subCategory: 'FIA',
    title: 'Safe Income Advantage (Rule of 72)',
    description: 'Breaking down Fixed Indexed Annuities (FIA) for retirees worried about market volatility, highlighting the F&G Safe Income Advantage.',
    structure: 'Acknowledge the stress of market swings. Introduce the "Personal Pension". Detail the Rule of 72 benefit: 7.2% compounded roll-up rate that doubles the income base every 10 years if deferred.',
    hashtags: ['Annuities', 'RetirementPlanning', 'FinancialSafety']
  },
  {
    id: 's4', category: 'Life Insurance', subCategory: 'Final Expense',
    title: 'A Gift of Love, Not a Burden',
    description: 'Soft and empathetic approach to Final Expense coverage for seniors.',
    structure: 'Open with a warm family memory. Pivot to the reality of funeral costs ($8,000–$12,000 average). Explain how a small policy removes the financial burden from children. Tagline: #TheBeatGoesOn.',
    hashtags: ['FinalExpense', 'Seniors', 'LegacyLove']
  },
  {
    id: 's5', category: 'Business Protection', subCategory: 'Key Person',
    title: 'Protecting the Leadership Beat',
    description: 'Business insurance for key employees and partners, specifically for school districts and SMEs.',
    structure: 'Ask a superintendent or business owner what happens if a vital leader is lost. Discuss transition costs and continuity. Propose Key Person Insurance as a stabilizer for the organization. Target: Blue Mountain SD, Wyoming Valley Chamber.',
    hashtags: ['SchoolDistricts', 'KeyPersonInsurance', 'ContinuityPlanning'], isFavorite: true
  },
  {
    id: 's6', category: 'Life Insurance', subCategory: 'Ethos Velocity',
    title: 'Protection in 10 Minutes',
    description: 'Highlighting the "Velocity Engine" via the Ethos platform for quick term life needs.',
    structure: 'Focus on speed and simplicity. 10-minute online application, no medical exams for many, instant decisions. Ideal for busy young families in Central PA. Direct link CTA to Ethos application.',
    hashtags: ['Ethos', 'QuickLifeInsurance', 'ModernProtection']
  },
  {
    id: 's7', category: 'Life Insurance', subCategory: 'Mortgage Protection',
    title: 'The Mortgage Protection Mastery Funnel',
    description: 'A full funnel strategy converting recent homebuyers via Facebook/Instagram targeting.',
    structure: 'Stage 1: Regional Facebook hook — "New homeowner in Schuylkill County? Read this." Stage 2: Home Security Webinar landing page. Stage 3: Direct Ethos application link. Follow up via Resend email drip.',
    hashtags: ['MortgageProtection', 'FunnelStrategy', 'CentralPA']
  },
  {
    id: 's8', category: 'Annuities', subCategory: 'FIA',
    title: 'The Personal Pension Positioning',
    description: 'Position FIA as a self-directed pension for clients without traditional pensions.',
    structure: 'Hook: "What if you could build your own pension?" Explain that traditional pensions are nearly extinct. Show how FIA creates guaranteed income floor. Emphasize the psychological safety of knowing income won\'t run out.',
    hashtags: ['PersonalPension', 'RetirementSecurity', 'FIA']
  },
  {
    id: 's9', category: 'Life Insurance', subCategory: 'IUL',
    title: 'The 3-Bucket Money Strategy',
    description: 'Core educational framework for discovery calls and Facebook educational content.',
    structure: 'Bucket 1: Taxable (savings, brokerage) — always taxed. Bucket 2: Tax-Deferred (401k, IRA) — taxed on withdrawal. Bucket 3: Tax-Free (IUL, Roth) — never taxed. IUL sits in Bucket 3 AND provides death benefit. IRS code 101A.',
    hashtags: ['3Buckets', 'TaxStrategy', 'WealthBuilding', 'FinancialEducation'], isFavorite: true
  },
]

const CATEGORIES = ['All', 'Life Insurance', 'Annuities', 'Legacy & Estate', 'Business Protection']

const CATEGORY_ICONS: Record<string, string> = {
  'Life Insurance': '🛡️', 'Annuities': '📈', 'Legacy & Estate': '🏛️', 'Business Protection': '🏢'
}

const SUB_COLORS: Record<string, string> = {
  'IUL': 'bg-blue-50 text-blue-700 border-blue-100',
  'Mortgage Protection': 'bg-emerald-50 text-emerald-700 border-emerald-100',
  'FIA': 'bg-amber-50 text-amber-700 border-amber-100',
  'Final Expense': 'bg-rose-50 text-rose-700 border-rose-100',
  'Key Person': 'bg-purple-50 text-purple-700 border-purple-100',
  'Ethos Velocity': 'bg-teal-50 text-teal-700 border-teal-100',
  'Legacy Protection': 'bg-[#C49A6C]/10 text-[#C49A6C] border-[#C49A6C]/20',
}

export default function StrategyPage() {
  const [strategies, setStrategies] = useState<Strategy[]>(STRATEGIES)
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const filtered = strategies.filter(s => {
    const matchCat = activeCategory === 'All' || s.category === activeCategory
    const q = query.toLowerCase()
    const matchQ = !q || s.title.toLowerCase().includes(q) ||
      s.subCategory.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q) ||
      s.hashtags.join(' ').toLowerCase().includes(q)
    return matchCat && matchQ
  })

  const favorites = filtered.filter(s => s.isFavorite)
  const rest = filtered.filter(s => !s.isFavorite)

  const toggleFavorite = (id: string) => {
    setStrategies(prev => prev.map(s => s.id === id ? { ...s, isFavorite: !s.isFavorite } : s))
  }

  const copyStructure = (structure: string, id: string) => {
    navigator.clipboard.writeText(structure)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const StrategyCard = ({ s }: { s: Strategy }) => (
    <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden hover:shadow-lg transition-all group">
      <div className="p-5 space-y-3">
        <div className="flex justify-between items-start gap-2">
          <div className="flex flex-wrap gap-2 flex-1">
            <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${SUB_COLORS[s.subCategory] || 'bg-slate-50 text-slate-500 border-slate-100'}`}>
              {s.subCategory}
            </span>
            <span className="text-[9px] font-bold text-slate-300 bg-slate-50 px-2.5 py-1 rounded-full">
              {CATEGORY_ICONS[s.category]} {s.category}
            </span>
          </div>
          <button onClick={() => toggleFavorite(s.id)} className="text-slate-300 hover:text-[#C49A6C] transition-colors text-lg leading-none">
            {s.isFavorite ? '★' : '☆'}
          </button>
        </div>

        <h3 className="font-black text-slate-900 leading-tight group-hover:text-[#C49A6C] transition-colors">
          {s.title}
        </h3>
        <p className="text-xs text-slate-500 leading-relaxed">{s.description}</p>

        {/* Expand/collapse structure */}
        <button
          onClick={() => setExpanded(expanded === s.id ? null : s.id)}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-700 transition-colors"
        >
          <span className="w-4 h-4 bg-slate-100 rounded flex items-center justify-center text-[8px]">
            {expanded === s.id ? '▲' : '▼'}
          </span>
          {expanded === s.id ? 'Hide' : 'View'} Logic Structure
        </button>

        {expanded === s.id && (
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">📐 Logic Structure</p>
            <p className="text-xs text-slate-700 leading-relaxed">{s.structure}</p>
          </div>
        )}

        <div className="flex flex-wrap gap-1.5">
          {s.hashtags.map(tag => (
            <span key={tag} className="text-[9px] font-bold text-[#C49A6C]">#{tag}</span>
          ))}
        </div>
      </div>

      <div className="border-t border-slate-100 flex">
        <button
          onClick={() => copyStructure(s.structure, s.id)}
          className="flex-1 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-[#C49A6C] hover:text-white transition-all flex items-center justify-center gap-2"
        >
          {copiedId === s.id ? '✓ Copied' : '📋 Copy Structure'}
        </button>
        <div className="w-px bg-slate-100" />
        <button
          onClick={() => {
            const text = `**${s.title}**\n\n${s.structure}\n\n${s.hashtags.map(h => '#' + h).join(' ')}`
            navigator.clipboard.writeText(text)
            setCopiedId(s.id + '-full')
            setTimeout(() => setCopiedId(null), 2000)
          }}
          className="flex-1 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-900 hover:text-white transition-all flex items-center justify-center gap-2"
        >
          {copiedId === s.id + '-full' ? '✓ Copied' : '✍️ Copy Full Post'}
        </button>
      </div>
    </div>
  )

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Strategy Library</h1>
          <p className="text-slate-500 font-medium mt-1">Proven positioning frameworks for every product & persona.</p>
        </div>
        <div className="flex items-center gap-2 bg-[#C49A6C]/10 border border-[#C49A6C]/20 px-4 py-3 rounded-xl">
          <span className="text-[#C49A6C] text-sm">📖</span>
          <span className="text-xs font-black text-[#C49A6C] uppercase tracking-widest">{STRATEGIES.length} Proven Strategies</span>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="bg-white border border-slate-100 rounded-2xl p-4 space-y-4">
        <input
          type="text"
          placeholder="Search by product, benefit, or keyword..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#C49A6C] font-medium"
        />
        <div className="flex gap-2 overflow-x-auto pb-1">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                activeCategory === cat
                  ? 'bg-[#C49A6C] text-white shadow-lg shadow-[#C49A6C]/20'
                  : 'bg-slate-50 text-slate-400 border border-slate-100 hover:text-slate-700'
              }`}
            >
              {cat !== 'All' && CATEGORY_ICONS[cat] + ' '}{cat}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total', value: strategies.length },
          { label: 'Favorites', value: strategies.filter(s => s.isFavorite).length },
          { label: 'Life', value: strategies.filter(s => s.category === 'Life Insurance').length },
          { label: 'Showing', value: filtered.length },
        ].map(s => (
          <div key={s.label} className="bg-white border border-slate-100 rounded-2xl p-4 text-center">
            <p className="text-2xl font-black text-slate-900">{s.value}</p>
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Favorites */}
      {favorites.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xs font-black uppercase tracking-widest text-[#C49A6C] flex items-center gap-2">
            ★ Core Strategies
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {favorites.map(s => <StrategyCard key={s.id} s={s} />)}
          </div>
        </div>
      )}

      {/* Rest */}
      {rest.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xs font-black uppercase tracking-widest text-slate-400">
            All Strategies ({rest.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rest.map(s => <StrategyCard key={s.id} s={s} />)}
          </div>
        </div>
      )}

      {filtered.length === 0 && (
        <div className="py-24 text-center">
          <p className="text-slate-300 text-5xl mb-4">📖</p>
          <p className="font-black text-slate-400">No strategies found</p>
          <p className="text-sm text-slate-300 mt-1">Try a different search or category</p>
        </div>
      )}
    </div>
  )
}
