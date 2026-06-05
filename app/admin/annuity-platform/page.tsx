'use client'

import { useMemo, useState } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────
interface CaseStudy {
  name: string
  premium: string
  result: string
}

interface Product {
  id: string
  name: string
  carrier: string
  carrierShort: string
  type: string
  tag: string
  color: string
  surrenderYrs: number
  issueAges: string
  minPremium: string
  freeWithdrawal: string
  mgsv: string
  surrenderSchedule: number[]
  indexes: string[]
  strategies: string[]
  riders: string[]
  incomeBenefit: boolean
  liberFee: string
  liberCost: number | null
  wellbeingBenefit: boolean
  keyPoints: string[]
  bestFor: string[]
  notFor: string[]
  excludedStates: string[]
  highlight: string
  iavRate?: string
  payoutTable?: string
  incomeStart?: string
  wellbeingDetail?: string
  glwbRollUp?: string
  lpaOptions?: string[]
  levelPayoutSingle?: Record<string, string>
  levelPayoutJoint?: Record<string, string>
  nursingMultiplier?: string
  lpaReserve?: string
  spousalContinuation?: boolean
  rmdFriendly?: boolean
  caseStudies?: CaseStudy[]
  bavBonus?: string
  bavMultiplier?: string
  payoutByAge?: Record<string, string>
  payoutNote?: string
  enhancedDB?: string
  exampleRollup?: number[]
}

interface ScoredProduct {
  product: Product
  score: number
  reasons: string[]
  cautions: string[]
}

interface Answers {
  age: string
  needIncomeNow: boolean
  needIncomeSoon: boolean
  growthOnly: boolean
  legacyPriority: boolean
  healthConcern: boolean
  avoidFees: boolean
  surrenderTolerance: 'short' | 'medium' | 'long'
  stateCode: string
}

// ─── Product Database ─────────────────────────────────────────────────────────
const PRODUCTS: Product[] = [
  {
    id: 'as5',
    name: 'AssetShield 5',
    carrier: 'American Equity',
    carrierShort: 'AE',
    type: 'Fixed Index Annuity',
    tag: 'Accumulation',
    color: '#2563EB',
    surrenderYrs: 5,
    issueAges: '18–85',
    minPremium: 'None specified',
    freeWithdrawal: '10% of contract value/yr (after yr 1)',
    mgsv: '87.5% of premium less withdrawals',
    surrenderSchedule: [9.2, 9, 8, 7, 6, 0, 0, 0, 0, 0, 0],
    indexes: [
      'BlackRock Adaptive US Equity 7%',
      'BNPP Patriot Technology',
      'Nasdaq Premier™',
      'NYSE® Premier',
      'S&P 500® Advantage 15% VT TCA',
      'S&P 500® Div Aristocrats® DRC 5%',
      'S&P 500®',
    ],
    strategies: ['Cap Rate', 'Participation Rate', 'Performance Trigger'],
    riders: [
      'Performance Rate Rider (optional, fee — higher participation rates)',
      'Enhanced Benefit Rider (auto ≤75, no fee: nursing care + terminal illness)',
      'Legacy Benefit (full contract value to beneficiary, no surrender charge at death)',
      'Market Value Adjustment Rider',
    ],
    incomeBenefit: false,
    liberFee: 'N/A',
    liberCost: null,
    wellbeingBenefit: false,
    keyPoints: [
      'Principal protected from index declines',
      'Interest locked in annually — never lost',
      'Tax-deferred growth',
      'Shortest surrender period — most liquidity',
      '7 diversified index options',
      'Optional Performance Rate Rider boosts participation rates',
    ],
    bestFor: [
      'Short 5-year commitment',
      'Ages 18–85',
      'Repositioning CDs or savings',
      'Smart money concept',
      'Accumulation without income need',
    ],
    notFor: ['Clients needing guaranteed lifetime income', 'Long-term income planning'],
    excludedStates: ['CA', 'OR'],
    highlight: 'Shortest surrender period. Most flexibility.',
  },
  {
    id: 'as7',
    name: 'AssetShield 7',
    carrier: 'American Equity',
    carrierShort: 'AE',
    type: 'Fixed Index Annuity',
    tag: 'Accumulation',
    color: '#7C3AED',
    surrenderYrs: 7,
    issueAges: '18–85',
    minPremium: 'None specified',
    freeWithdrawal: '10% of contract value/yr (after yr 1)',
    mgsv: '87.5% of premium less withdrawals',
    surrenderSchedule: [9.2, 9, 8, 7, 6, 4, 2, 0, 0, 0, 0],
    indexes: [
      'BlackRock Adaptive US Equity 7%',
      'BNPP Patriot Technology',
      'Nasdaq Premier™',
      'NYSE® Premier',
      'S&P 500® Advantage 15% VT TCA',
      'S&P 500® Div Aristocrats® DRC 5%',
      'S&P 500®',
    ],
    strategies: ['Cap Rate', 'Participation Rate', 'Performance Trigger'],
    riders: [
      'Performance Rate Rider (optional, fee)',
      'Enhanced Benefit Rider (auto ≤75, no fee)',
      'Legacy Benefit',
      'Market Value Adjustment Rider',
    ],
    incomeBenefit: false,
    liberFee: 'N/A',
    liberCost: null,
    wellbeingBenefit: false,
    keyPoints: [
      '7-year term = higher cap and participation rates than 5-year',
      'Same 7 index options as AssetShield 5',
      'Principal protected — zero floor',
      'Interest locked in annually',
      'Greater accumulation potential vs 5-year',
    ],
    bestFor: [
      'Medium 7-year commitment',
      'Higher growth potential than 5-year',
      'Ages 18–85',
      'Accumulation focus',
    ],
    notFor: ['Clients needing income', 'Clients needing <7-year surrender period'],
    excludedStates: ['CA', 'OR'],
    highlight: 'More growth potential. Same protection.',
  },
  {
    id: 'is10',
    name: 'IncomeShield 10',
    carrier: 'American Equity',
    carrierShort: 'AE',
    type: 'FIA with Lifetime Income Benefit Rider',
    tag: 'Income',
    color: '#059669',
    surrenderYrs: 10,
    issueAges: '40–80',
    minPremium: 'None specified',
    freeWithdrawal: '10% of contract value/yr (after yr 1)',
    mgsv: '87.5% of premium less withdrawals',
    surrenderSchedule: [9.2, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
    indexes: [
      'BlackRock Adaptive U.S. Equity 5%',
      'Nasdaq Premier™',
      'NYSE® Premier',
      'S&P 500® Advantage 15% VT TCA',
      'S&P 500® Div Aristocrats® DRC 5%',
      'S&P 500®',
    ],
    strategies: ['Cap Rate', 'Participation Rate', 'Performance Trigger'],
    riders: [
      'Lifetime Income Benefit Rider — INCLUDED, 1.20%/yr on IAV',
      'Enhanced Benefit Rider (auto ≤75, no fee)',
      'Legacy Benefit',
      'Spousal Continuation',
      'Market Value Adjustment Rider',
    ],
    incomeBenefit: true,
    liberFee: '1.20%/yr on IAV',
    liberCost: 1.2,
    iavRate: '10% simple interest for up to 10 years',
    payoutTable: '6.24%–7.90% (single) based on years deferred (age 60 example)',
    incomeStart: 'As early as 1 year after issue',
    wellbeingBenefit: true,
    wellbeingDetail:
      '2-year wait + 2 of 6 ADLs: 200% single / 150% joint, up to 5 years',
    spousalContinuation: true,
    rmdFriendly: true,
    keyPoints: [
      '10% IAV rate guaranteed for 10 years (simple interest)',
      'Income as soon as year 1',
      'Payout factor grows each year deferred',
      'Wellbeing Benefit: doubles income if unable to perform 2 ADLs',
      'If contract value > IAV, higher value used',
      'Spousal continuation',
      'RMD friendly',
    ],
    caseStudies: [
      {
        name: 'Janet, 63',
        premium: '$100K',
        result: 'At 68: IAV $150K → $11,145/yr (7.43% factor)',
      },
      {
        name: 'Kevin & Kelsey, 55',
        premium: '$200K',
        result:
          'At 65: IAV $400K → $27,240/yr; health event → $40,860/yr Wellbeing (5 years)',
      },
    ],
    bestFor: [
      'Ages 40–80 wanting guaranteed income',
      'Clients who may defer 5–10 years',
      'Couples needing spousal protection',
      'Health-event income protection',
    ],
    notFor: ['Pure accumulation', 'Ages under 40 or over 80', 'Clients wanting no rider fee'],
    excludedStates: [],
    highlight: '10% IAV rate. Income you can\'t outlive.',
  },
  {
    id: 'es10',
    name: 'EstateShield 10',
    carrier: 'American Equity',
    carrierShort: 'AE',
    type: 'FIA with LIBR + Enhanced Death Benefit',
    tag: 'Income + Legacy',
    color: '#B45309',
    surrenderYrs: 10,
    issueAges: '40–75',
    minPremium: 'None specified',
    freeWithdrawal: '10% of total premiums paid/yr (after yr 1)',
    mgsv: '87.5% of premium less withdrawals',
    surrenderSchedule: [9.2, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
    indexes: [
      'BlackRock Adaptive U.S. Equity 5%',
      'S&P 500®',
      'S&P 500® Div Aristocrats® DRC 5%',
    ],
    strategies: [
      'Monthly Point-to-Point',
      'Annual Point-to-Point',
      'Two-Year Point-to-Point',
      'Cap Rate',
      'Participation Rate',
    ],
    riders: [
      'LIBR — AUTO-INCLUDED, NO FEE',
      'Enhanced Benefit Rider (auto, no fee)',
      'Enhanced Death Benefit Rider (auto via LIBR)',
      'Wellbeing Benefit (auto via LIBR, no fee)',
      'Market Value Adjustment Rider',
    ],
    incomeBenefit: true,
    liberFee: 'NO FEE',
    liberCost: 0,
    bavBonus: '35% BAV Bonus on all year-1 premiums',
    bavMultiplier: 'Interest credited × BAV multiplier → grows income AND death benefit',
    payoutByAge: {
      '50-59': '4.5% / 4.0%',
      '60-69': '5.0% / 4.5%',
      '70-79': '5.5% / 5.0%',
      '80+': '6.0% / 5.5%',
    },
    payoutNote: 'Single / Joint | Income starts after 10-year anniversary',
    incomeStart: 'After 10-year anniversary',
    enhancedDB: '75% BAV lump sum OR 100% BAV paid over 5 years',
    wellbeingBenefit: true,
    wellbeingDetail:
      '10-year wait + 2 of 6 ADLs: 200% single / 150% joint, up to 5 years',
    spousalContinuation: true,
    keyPoints: [
      '35% BAV Bonus on year-1 premiums — immediate boost',
      'LIBR included at NO FEE',
      'Income can INCREASE — tied to BAV multiplier + positive index years',
      'Enhanced Death Benefit: 75% BAV lump sum or 100% BAV over 5 years',
      'Wellbeing Benefit included — no fee',
      'Income must wait 10 years (vs 1 year on IncomeShield)',
    ],
    bestFor: [
      'Legacy + income combination',
      'Clients with 10+ year horizon',
      'Estate planning focus',
      'Clients wanting income growth potential',
      'Those wanting LIBR with no fee',
    ],
    notFor: ['Clients needing income before year 10', 'Ages 76+', 'Short-term needs'],
    excludedStates: [],
    highlight: '35% bonus. LIBR free. Legacy + income.',
  },
  {
    id: 'ipp',
    name: 'Income Pay Pro®',
    carrier: 'North American Company',
    carrierShort: 'NA',
    type: 'FIA with Embedded GLWB Rider',
    tag: 'Income + Flexibility',
    color: '#0F766E',
    surrenderYrs: 10,
    issueAges: '40–79',
    minPremium: '$20,000',
    freeWithdrawal: '10% of beginning-of-year accumulation value (from year 1)',
    mgsv: '87.5% of all premiums less surrenders',
    surrenderSchedule: [10, 10, 9, 9, 8, 8, 7, 6, 4, 2, 0],
    indexes: [
      'S&P 500®',
      'Fidelity Multifactor Yield 5% ER',
      'Goldman Sachs Equity TimeX',
      'S&P Multi-Asset Risk Control 5% ER',
      'Morgan Stanley Dynamic Global',
    ],
    strategies: [
      'Monthly Point-to-Point (cap)',
      'Annual Point-to-Point (cap)',
      'Annual Point-to-Point (participation rate)',
      'Two-Year Point-to-Point (participation rate)',
      'Fixed Account',
    ],
    riders: [
      'GLWB Rider — EMBEDDED, 1.15%/yr on GLWB value',
      'Nursing Home Multiplier (2x LPA up to 5 payments; 2-year wait; 90-day confinement; not CA)',
      'LPA Reserve (bank unused LPA for lump sum/periodic use)',
      'Spousal Continuance',
    ],
    incomeBenefit: true,
    liberFee: '1.15%/yr on GLWB value',
    liberCost: 1.15,
    glwbRollUp: '8% compounded for up to 10 years',
    lpaOptions: [
      'Level LPA — fixed for life',
      'Increasing LPA — lower start, grows by declared % (minimum 0.25%/yr guarantee)',
    ],
    incomeStart: 'Immediately (as early as issue, age 50+)',
    nursingMultiplier:
      '2x LPA for up to 5 annual payments (2-year wait, 90-day confinement, not CA)',
    lpaReserve: 'Bank unused LPA each year; available as lump sum anytime',
    wellbeingBenefit: false,
    spousalContinuation: true,
    exampleRollup: [
      200000, 216000, 233280, 251942, 272098, 293866, 317375, 342765, 370186, 399801, 431785,
    ],
    keyPoints: [
      '8% compounded GLWB roll-up — highest of all 5 products',
      'Income available immediately at issue',
      'Level OR Increasing LPA options',
      'LPA Reserve: bank unused payments for future needs',
      'Nursing Home Multiplier: 2x income for up to 5 years',
      'Spousal continuance of GLWB',
      'GLWB value separate — not available as lump sum',
      'Charge: 1.15% of GLWB value (not accumulation)',
    ],
    bestFor: [
      'Highest roll-up rate seekers (8% compounded)',
      'Clients wanting income flexibility (level vs increasing)',
      'Nursing home income protection',
      'Ages 40–79 wanting immediate income option',
      'North American policyholders',
    ],
    notFor: [
      'Oregon residents',
      'Ages 80+',
      'Clients wanting no rider fee',
      'Those needing >$0 min with <$20K to invest',
    ],
    excludedStates: ['OR'],
    highlight: '8% compounded roll-up. Income flexibility built in.',
  },
]

// ─── Comparison Dimensions ────────────────────────────────────────────────────
const DIMS = [
  { key: 'surrenderYrs', label: 'Surrender Period' },
  { key: 'issueAges', label: 'Issue Ages' },
  { key: 'minPremium', label: 'Min Premium' },
  { key: 'liberFee', label: 'Income Rider Fee' },
  { key: 'freeWithdrawal', label: 'Free Withdrawal' },
  { key: 'incomeBenefit', label: 'Lifetime Income' },
  { key: 'wellbeingBenefit', label: 'Wellbeing / Nursing Benefit' },
] as const

// ─── Personas ─────────────────────────────────────────────────────────────────
const PERSONAS = [
  {
    icon: '🏡',
    label: 'New Retiree, Age 62–70',
    desc: 'Wants guaranteed income now or soon',
    recommend: ['is10', 'ipp'],
    avoid: ['es10'],
  },
  {
    icon: '🏛️',
    label: 'Legacy Builder, Age 55–70',
    desc: 'Income + estate maximization',
    recommend: ['es10', 'is10'],
    avoid: ['as5', 'as7'],
  },
  {
    icon: '💰',
    label: 'Saver, Age 50–65',
    desc: 'Protected growth, no income need yet',
    recommend: ['as7', 'as5'],
    avoid: ['is10', 'es10', 'ipp'],
  },
  {
    icon: '🏥',
    label: 'Health Concern, Any Age',
    desc: 'Needs nursing/care income protection',
    recommend: ['ipp', 'is10'],
    avoid: ['as5', 'as7'],
  },
  {
    icon: '⏱️',
    label: 'Short-Term, Age 18–60',
    desc: '5-year commitment, max flexibility',
    recommend: ['as5'],
    avoid: ['es10', 'is10', 'ipp'],
  },
  {
    icon: '👫',
    label: 'Married Couple, Age 55–70',
    desc: 'Joint income, spousal protection',
    recommend: ['is10', 'es10', 'ipp'],
    avoid: ['as5', 'as7'],
  },
]

// ─── Derived Filters ──────────────────────────────────────────────────────────
const CARRIERS = ['all', ...Array.from(new Set(PRODUCTS.map((p) => p.carrier)))]
const TAGS = ['all', ...Array.from(new Set(PRODUCTS.map((p) => p.tag)))]
const SURRENDER_OPTIONS = [
  'all',
  ...Array.from(new Set(PRODUCTS.map((p) => String(p.surrenderYrs)))),
].sort((a, b) => (a === 'all' ? -1 : Number(a) - Number(b)))

// ─── Helpers ──────────────────────────────────────────────────────────────────
function normalizeStateCode(v: string): string {
  return String(v || '').trim().toUpperCase().slice(0, 2)
}

function productAvailableInState(product: Product, stateCode: string): boolean {
  if (!stateCode) return true
  return !(product.excludedStates || []).includes(stateCode)
}

function scoreProduct(product: Product, answers: Answers & { stateCode: string }): { score: number; reasons: string[]; cautions: string[] } {
  let score = 0
  const reasons: string[] = []
  const cautions: string[] = []

  const age = Number(answers.age || 0)
  const ageParts = String(product.issueAges)
    .replace(/[^\d–-]/g, '')
    .split(/[–-]/)
    .map((n) => Number(n))
  const minAge = ageParts[0]
  const maxAge = ageParts[1]

  if (age && !Number.isNaN(minAge) && !Number.isNaN(maxAge)) {
    if (age >= minAge && age <= maxAge) {
      score += 4
      reasons.push(`Issue age ${age} fits ${product.issueAges}`)
    } else {
      score -= 100
      cautions.push(`Age ${age} falls outside issue range ${product.issueAges}`)
    }
  }

  if (answers.needIncomeNow) {
    if (product.incomeBenefit) {
      score += 5
      reasons.push('Provides lifetime income features')
      const incomeStart = String(product.incomeStart || '').toLowerCase()
      if (incomeStart.includes('immediately') || incomeStart.includes('1 year') || incomeStart.includes('year 1')) {
        score += 3
        reasons.push(`Income can start ${product.incomeStart}`)
      }
      if (incomeStart.includes('10-year anniversary')) {
        score -= 4
        cautions.push('Income start is deferred until after year 10')
      }
    } else {
      score -= 5
      cautions.push('No lifetime income rider')
    }
  }

  if (answers.needIncomeSoon) {
    if (product.incomeBenefit) {
      score += 3
      reasons.push('Has income functionality')
      const incomeStart = String(product.incomeStart || '').toLowerCase()
      if (incomeStart.includes('immediately') || incomeStart.includes('1 year') || incomeStart.includes('year 1')) {
        score += 2
      }
      if (incomeStart.includes('10-year anniversary')) score -= 3
    } else {
      score -= 2
    }
  }

  if (answers.growthOnly) {
    if (!product.incomeBenefit) {
      score += 5
      reasons.push('Built for accumulation rather than income')
    } else {
      score -= 3
      cautions.push('Income-oriented structure may be more than client needs')
    }
  }

  if (answers.legacyPriority) {
    if (product.enhancedDB || String(product.tag || '').toLowerCase().includes('legacy')) {
      score += 5
      reasons.push('Strong legacy / death-benefit positioning')
    } else if (product.incomeBenefit) {
      score += 1
      reasons.push('Income product may still support estate discussions')
    } else {
      score -= 2
    }
  }

  if (answers.healthConcern) {
    if (product.wellbeingBenefit || product.nursingMultiplier) {
      score += 5
      reasons.push('Includes wellbeing or nursing-related income enhancement')
    } else {
      score -= 3
      cautions.push('No enhanced care-income feature highlighted')
    }
  }

  if (answers.avoidFees) {
    if (product.liberCost === 0 || product.liberCost == null) {
      score += 3
      reasons.push('No recurring income rider fee shown')
    } else {
      score -= 3
      cautions.push(`Rider fee applies: ${product.liberFee}`)
    }
  }

  if (answers.surrenderTolerance === 'short') {
    if (product.surrenderYrs <= 5) {
      score += 4
      reasons.push('Short surrender commitment')
    } else if (product.surrenderYrs <= 7) {
      score += 1
    } else {
      score -= 4
      cautions.push('Long surrender schedule')
    }
  }

  if (answers.surrenderTolerance === 'medium') {
    if (product.surrenderYrs === 7) {
      score += 4
      reasons.push('Moderate surrender duration')
    } else if (product.surrenderYrs === 5 || product.surrenderYrs === 10) {
      score += 1
    }
  }

  if (answers.surrenderTolerance === 'long') {
    if (product.surrenderYrs >= 10) {
      score += 3
      reasons.push('Fits long-horizon planning')
    }
  }

  if (answers.stateCode) {
    if (productAvailableInState(product, answers.stateCode)) {
      score += 1
      reasons.push(`Available in ${answers.stateCode}`)
    } else {
      score -= 100
      cautions.push(`Unavailable in ${answers.stateCode}`)
    }
  }

  return { score, reasons, cautions }
}

// ─── Shared UI Components ─────────────────────────────────────────────────────
function Badge({ text, color = '#2C3E50', bg }: { text: string; color?: string; bg?: string }) {
  return (
    <span
      className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide"
      style={{ backgroundColor: bg || `${color}22`, color }}
    >
      {text}
    </span>
  )
}

function PTag({ text, color }: { text: string; color: string }) {
  return (
    <span
      className="inline-block px-2 py-0.5 rounded-full text-[9px] font-medium tracking-wider uppercase border border-opacity-35"
      style={{ backgroundColor: `${color}20`, color, borderColor: `${color}40` }}
    >
      {text}
    </span>
  )
}

function Check({ val }: { val: boolean | string }) {
  if (val === true) return <span className="text-emerald-400 font-bold text-base">✓</span>
  if (val === false) return <span className="text-white/25 text-sm">—</span>
  return <span className="text-white/80 text-[11px]">{val}</span>
}

// ─── Product Card ─────────────────────────────────────────────────────────────
function ProductCard({
  p,
  selected,
  onSelect,
  mini,
}: {
  p: Product
  selected: string[]
  onSelect: (id: string) => void
  mini?: boolean
}) {
  const sel = selected.includes(p.id)
  return (
    <div
      onClick={() => onSelect(p.id)}
      className="group relative cursor-pointer rounded-xl p-4 transition-all duration-300 transform hover:-translate-y-0.5 active:scale-95 border-2 select-none"
      style={{
        backgroundColor: sel ? `${p.color}15` : 'rgba(255,255,255,0.04)',
        borderColor: sel ? p.color : 'rgba(255,255,255,0.12)',
        boxShadow: sel ? `0 10px 15px -3px ${p.color}20` : 'none',
      }}
    >
      <div className="flex justify-between items-start gap-2 mb-2">
        <div>
          <h4 className="text-white font-bold text-sm leading-tight tracking-wide group-hover:text-amber-200 transition-colors">
            {p.name}
          </h4>
          <span className="text-slate-400 text-[10px] uppercase font-semibold">{p.carrier}</span>
        </div>
        <PTag text={p.tag} color={p.color} />
      </div>

      {!mini && (
        <p className="text-slate-300 text-[11px] font-light leading-relaxed mb-3.5 italic">
          {p.highlight}
        </p>
      )}

      <div className="flex flex-wrap gap-1.5 pt-1.5 border-t border-white/5">
        <Badge text={`${p.surrenderYrs}-yr`} color={p.color} />
        <Badge text={`Issue Ages ${p.issueAges}`} color="#cbd5e1" bg="rgba(255,255,255,0.08)" />
        {p.incomeBenefit && <Badge text="LIBR Income" color="#34d399" bg="#10b98122" />}
        {p.wellbeingBenefit && <Badge text="Wellbeing" color="#fbbf24" bg="#f59e0b22" />}
      </div>
    </div>
  )
}

// ─── Detail Panel ─────────────────────────────────────────────────────────────
function DetailPanel({ p }: { p: Product }) {
  const [tab, setTab] = useState<'overview' | 'income' | 'riders' | 'suitability'>('overview')
  const tabs: [typeof tab, string][] = [
    ['overview', 'Overview'],
    ['income', 'Income Options'],
    ['riders', 'Riders & Benefits'],
    ['suitability', 'Suitability'],
  ]

  return (
    <div
      className="mt-6 rounded-2xl border bg-slate-900 overflow-hidden shadow-2xl"
      style={{ borderColor: `${p.color}50` }}
    >
      <div
        className="px-5 py-5 border-b"
        style={{
          background: `linear-gradient(135deg, ${p.color}25, ${p.color}05)`,
          borderColor: `${p.color}30`,
        }}
      >
        <div className="flex justify-between items-start gap-3">
          <div>
            <h2 className="text-lg font-extrabold text-white tracking-wide">{p.name}</h2>
            <p className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
              {p.carrier} · {p.type}
            </p>
          </div>
          <PTag text={p.tag} color={p.color} />
        </div>
        <div className="flex flex-wrap gap-2 mt-4">
          {[`${p.surrenderYrs}-yr Surrender`, `Ages ${p.issueAges}`, `Min: ${p.minPremium}`].map((t) => (
            <span
              key={t}
              className="text-[10px] font-bold px-3 py-1 rounded-full border border-opacity-25"
              style={{ color: p.color, backgroundColor: `${p.color}15`, borderColor: `${p.color}35` }}
            >
              {t}
            </span>
          ))}
          {p.excludedStates.length > 0 && (
            <span className="text-[10px] font-bold px-3 py-1 rounded-full text-red-400 bg-red-950/20 border border-red-500/20">
              Excluded: {p.excludedStates.join(', ')}
            </span>
          )}
        </div>
      </div>

      <div className="flex border-b border-white/10 bg-slate-950">
        {tabs
          .filter(([t]) => t !== 'income' || p.incomeBenefit)
          .map(([t, label]) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="flex-1 py-3 text-center text-xs font-semibold tracking-wider uppercase border-b-2 transition-all outline-none"
              style={{
                color: tab === t ? p.color : '#64748b',
                borderBottomColor: tab === t ? p.color : 'transparent',
              }}
            >
              {label}
            </button>
          ))}
      </div>

      <div className="p-5 max-h-[420px] overflow-y-auto">
        {tab === 'overview' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                ['Free Withdrawal Allowed', p.freeWithdrawal],
                ['Minimum Guaranteed Surrender Value', p.mgsv],
                ['Income Rider Charges', p.liberFee || 'None'],
                ['Surrender Frame Duration', `${p.surrenderYrs} calendar years`],
              ].map(([k, v]) => (
                <div key={k} className="bg-white/5 p-3 rounded-lg border border-white/5">
                  <span className="block text-[10px] text-slate-400 uppercase tracking-wider mb-1 font-semibold">{k}</span>
                  <span className="text-white text-xs leading-relaxed font-medium">{v}</span>
                </div>
              ))}
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: p.color }}>
                Surrender Charge Schedule
              </h4>
              <div className="flex gap-1.5 overflow-x-auto pb-1.5">
                {p.surrenderSchedule
                  .filter((v) => v > 0)
                  .map((v, i) => (
                    <div
                      key={i}
                      className="flex-1 min-w-[54px] rounded-lg p-2 text-center border border-opacity-15"
                      style={{ backgroundColor: `${p.color}12`, borderColor: `${p.color}25` }}
                    >
                      <span className="block text-[8px] text-slate-400 uppercase font-semibold">Yr {i + 1}</span>
                      <span className="text-xs font-extrabold" style={{ color: p.color }}>{v}%</span>
                    </div>
                  ))}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: p.color }}>
                Diversified Allocation Indexes
              </h4>
              <div className="space-y-1.5">
                {p.indexes.map((idx) => (
                  <div key={idx} className="text-xs text-slate-300 pl-3 border-l-2" style={{ borderLeftColor: `${p.color}50` }}>
                    {idx}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === 'income' && p.incomeBenefit && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {p.iavRate && (
                <div className="p-4 rounded-xl text-center border bg-slate-950/40" style={{ borderColor: `${p.color}25` }}>
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold block">IAV Interest Growth Rate</span>
                  <span className="text-2xl font-black mt-1 block" style={{ color: p.color }}>{p.iavRate}</span>
                </div>
              )}
              {p.glwbRollUp && (
                <div className="p-4 rounded-xl text-center border bg-slate-950/40" style={{ borderColor: `${p.color}25` }}>
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold block">GLWB Roll-Up Compounding</span>
                  <span className="text-2xl font-black mt-1 block" style={{ color: p.color }}>{p.glwbRollUp}</span>
                </div>
              )}
              {p.bavBonus && (
                <div className="p-4 rounded-xl text-center border bg-slate-950/40 col-span-1 sm:col-span-2" style={{ borderColor: `${p.color}25` }}>
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold block">Benefit Base Premium Bonus</span>
                  <span className="text-2xl font-black mt-1 block" style={{ color: p.color }}>{p.bavBonus}</span>
                </div>
              )}
            </div>

            {p.incomeStart && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: p.color }}>Deferred Income Start Duration</h4>
                <p className="text-xs text-slate-300 leading-relaxed">{p.incomeStart}</p>
              </div>
            )}

            {p.payoutByAge && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider mb-2.5" style={{ color: p.color }}>Guaranteed Lifetime Payout Factors</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {Object.entries(p.payoutByAge).map(([age, rate]) => (
                    <div key={age} className="bg-white/5 p-2 rounded-lg text-center border border-white/5">
                      <span className="block text-[8px] text-slate-400 uppercase tracking-wider font-semibold">Ages {age}</span>
                      <span className="text-xs font-bold" style={{ color: p.color }}>{rate}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {p.lpaOptions && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: p.color }}>Lifetime Payment Options</h4>
                <div className="space-y-1.5">
                  {p.lpaOptions.map((o) => (
                    <div key={o} className="text-xs text-slate-300 pl-3 border-l-2" style={{ borderLeftColor: `${p.color}50` }}>{o}</div>
                  ))}
                </div>
              </div>
            )}

            {p.wellbeingDetail && (
              <div className="bg-amber-950/20 border border-amber-500/30 rounded-xl p-4">
                <h5 className="text-xs text-amber-400 font-bold mb-1 flex items-center gap-1.5">
                  <span className="text-sm">⚡</span> Enhanced Wellbeing Income Multiplier
                </h5>
                <p className="text-xs text-slate-300 leading-relaxed">{p.wellbeingDetail}</p>
              </div>
            )}

            {p.nursingMultiplier && (
              <div className="bg-amber-950/20 border border-amber-500/30 rounded-xl p-4">
                <h5 className="text-xs text-amber-400 font-bold mb-1 flex items-center gap-1.5">
                  <span className="text-sm">🏥</span> Double Payout Nursing Home Benefit
                </h5>
                <p className="text-xs text-slate-300 leading-relaxed">{p.nursingMultiplier}</p>
              </div>
            )}

            {p.enhancedDB && (
              <div className="bg-slate-950/60 border border-opacity-25 rounded-xl p-4" style={{ borderColor: `${p.color}30` }}>
                <h5 className="text-xs font-bold mb-1 flex items-center gap-1.5" style={{ color: p.color }}>
                  <span className="text-sm">🏛️</span> Guaranteed Estate Death Benefit Option
                </h5>
                <p className="text-xs text-slate-300 leading-relaxed">{p.enhancedDB}</p>
              </div>
            )}

            {p.caseStudies && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: p.color }}>Brochure Illustrative Case Studies</h4>
                <div className="space-y-2.5">
                  {p.caseStudies.map((c) => (
                    <div key={c.name} className="bg-white/5 p-3.5 rounded-xl border border-white/5">
                      <div className="flex justify-between items-center text-xs font-bold text-white mb-1.5">
                        <span>{c.name}</span>
                        <span style={{ color: p.color }}>{c.premium} Initial Premium</span>
                      </div>
                      <p className="text-slate-300 text-xs leading-relaxed">{c.result}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'riders' && (
          <div className="space-y-2">
            {p.riders.map((r) => {
              const isKey = r.includes('NO FEE') || r.includes('AUTO') || r.includes('INCLUDED') || r.includes('EMBEDDED')
              return (
                <div
                  key={r}
                  className="rounded-xl p-3.5 border text-xs leading-relaxed"
                  style={{
                    backgroundColor: isKey ? `${p.color}10` : 'rgba(255,255,255,0.02)',
                    borderColor: isKey ? `${p.color}25` : 'rgba(255,255,255,0.08)',
                    color: isKey ? '#ffffff' : '#cbd5e1',
                  }}
                >
                  {r}
                </div>
              )
            })}
          </div>
        )}

        {tab === 'suitability' && (
          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">✓ Ideal Suitability Target</h4>
              <div className="space-y-2">
                {p.bestFor.map((b) => (
                  <div key={b} className="text-xs text-slate-300 pl-3 border-l-2 border-emerald-500/55">{b}</div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider mb-2">✗ Non-Ideal Fit / Red Flags</h4>
              <div className="space-y-2">
                {p.notFor.map((n) => (
                  <div key={n} className="text-xs text-slate-300 pl-3 border-l-2 border-red-500/55">{n}</div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Compare Table ─────────────────────────────────────────────────────────────
function CompareTable({ selected }: { selected: string[] }) {
  const prods = PRODUCTS.filter((p) => selected.includes(p.id))
  if (prods.length < 2) {
    return (
      <div className="text-center text-slate-500 text-xs py-14 border border-dashed border-slate-700/50 rounded-2xl">
        Select between 2 and 5 annuity products to compile the dynamic comparison matrix.
      </div>
    )
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-x-auto shadow-xl">
      <table className="w-full text-left border-collapse min-w-[650px]">
        <thead>
          <tr className="border-b border-slate-800 bg-slate-950">
            <th className="py-4 px-3 w-32 text-[10px] uppercase tracking-wider text-slate-500 font-bold">Parameters</th>
            {prods.map((p) => (
              <th key={p.id} className="py-4 px-4 text-center border-b-2" style={{ borderBottomColor: p.color }}>
                <div className="text-xs font-extrabold text-white leading-tight">{p.name}</div>
                <div className="text-[10px] text-slate-500 font-semibold">{p.carrier}</div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {DIMS.map((d) => (
            <tr key={d.key} className="border-b border-slate-800/60 hover:bg-slate-800/10">
              <td className="py-3.5 px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">{d.label}</td>
              {prods.map((p) => {
                const v = p[d.key as keyof Product]
                return (
                  <td key={p.id} className="py-3.5 px-4 text-center">
                    {d.key === 'surrenderYrs' ? (
                      <Badge text={`${v}-yr surrender`} color={p.color} />
                    ) : d.key === 'incomeBenefit' || d.key === 'wellbeingBenefit' ? (
                      <Check val={v as boolean} />
                    ) : (
                      <span className="text-xs text-slate-300 font-medium">{String(v)}</span>
                    )}
                  </td>
                )
              })}
            </tr>
          ))}
          <tr className="bg-slate-950/40">
            <td className="py-4 px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Primary Selling Angle</td>
            {prods.map((p) => (
              <td key={p.id} className="py-4 px-4 text-center">
                <span className="text-[11px] font-bold leading-relaxed block" style={{ color: p.color }}>{p.highlight}</span>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  )
}

// ─── Client Personas ──────────────────────────────────────────────────────────
function ClientSummaries() {
  const [sel, setSel] = useState<number | null>(null)
  const gold = '#C49A6C'
  const goldLight = '#D4AE86'

  return (
    <div className="space-y-5">
      <div className="text-xs text-slate-400 leading-relaxed">
        Select a core prospect retirement profile to view strategic match recommendations.
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {PERSONAS.map((p, i) => (
          <div
            key={i}
            onClick={() => setSel(sel === i ? null : i)}
            className="cursor-pointer p-4 rounded-xl border transition-all duration-300 hover:scale-105 flex flex-col justify-between"
            style={{
              backgroundColor: sel === i ? 'rgba(196,154,108,0.08)' : 'rgba(255,255,255,0.03)',
              borderColor: sel === i ? gold : 'rgba(255,255,255,0.08)',
              boxShadow: sel === i ? `0 8px 24px -6px ${gold}15` : 'none',
            }}
          >
            <div>
              <div className="text-2xl mb-2">{p.icon}</div>
              <h4 className="text-xs font-bold text-white tracking-wide uppercase mb-1">{p.label}</h4>
              <p className="text-[11px] text-slate-400 leading-normal">{p.desc}</p>
            </div>
            <div
              className="mt-4 pt-2.5 border-t border-white/5 flex justify-between items-center text-[10px] font-bold uppercase"
              style={{ color: sel === i ? goldLight : '#64748b' }}
            >
              <span>Match Profile</span>
              <span>{sel === i ? 'active' : 'select'}</span>
            </div>
          </div>
        ))}
      </div>

      {sel !== null && (
        <div className="rounded-2xl border p-5 space-y-4 bg-slate-950/20" style={{ borderColor: `${gold}30` }}>
          <div className="flex items-center gap-2 border-b border-white/10 pb-3">
            <span className="text-2xl">{PERSONAS[sel].icon}</span>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest" style={{ color: goldLight }}>{PERSONAS[sel].label}</h3>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Primary Broker Recommendation Blueprint</p>
            </div>
          </div>

          <div className="space-y-3">
            <h5 className="text-[11px] font-extrabold uppercase tracking-widest" style={{ color: gold }}>✓ Recommended Carrier Matches</h5>
            {PERSONAS[sel].recommend.map((id) => {
              const p = PRODUCTS.find((pr) => pr.id === id)
              return p ? (
                <div key={id} className="rounded-xl p-4 border flex flex-col sm:flex-row justify-between sm:items-center gap-3 bg-slate-900" style={{ borderColor: `${p.color}25` }}>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white uppercase">{p.name}</span>
                      <PTag text={p.tag} color={p.color} />
                    </div>
                    <p className="text-[11px] text-slate-400 italic">"{p.highlight}"</p>
                    <p className="text-[10px] text-slate-500">{p.bestFor[0]} · {p.bestFor[1]}</p>
                  </div>
                  <span className="shrink-0 text-[10px] font-extrabold px-3 py-1 rounded bg-slate-950" style={{ color: p.color }}>
                    {p.surrenderYrs}-yr surrender
                  </span>
                </div>
              ) : null
            })}
          </div>

          <div className="pt-3 border-t border-white/5">
            <h5 className="text-[11px] font-extrabold text-red-400 uppercase tracking-widest mb-1.5">✗ Non-Ideal Options (Avoid)</h5>
            <div className="flex flex-wrap gap-2">
              {PERSONAS[sel].avoid.map((id) => {
                const p = PRODUCTS.find((pr) => pr.id === id)
                return p ? (
                  <span key={id} className="text-[10px] font-bold px-3 py-1 rounded bg-red-950/10 border border-red-500/20 text-slate-400">
                    {p.name} ({p.carrier})
                  </span>
                ) : null
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Recommendation Advisor ───────────────────────────────────────────────────
function RecommendationAdvisor() {
  const [answers, setAnswers] = useState<Answers>({
    age: '',
    needIncomeNow: false,
    needIncomeSoon: false,
    growthOnly: false,
    legacyPriority: false,
    healthConcern: false,
    avoidFees: false,
    surrenderTolerance: 'medium',
    stateCode: '',
  })

  const scored = useMemo<ScoredProduct[]>(() => {
    return PRODUCTS.map((product) => ({
      product,
      ...scoreProduct(product, { ...answers, stateCode: normalizeStateCode(answers.stateCode) }),
    })).sort((a, b) => b.score - a.score)
  }, [answers])

  const topMatches = scored.slice(0, 3)

  function update<K extends keyof Answers>(key: K, value: Answers[K]) {
    setAnswers((prev) => ({ ...prev, [key]: value }))
  }

  const gold = '#C49A6C'
  const goldLight = '#D4AE86'

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-5 space-y-5">
      <div className="border-b border-white/10 pb-3">
        <h3 className="text-sm font-black uppercase tracking-widest text-white">Smart Recommendation Advisor</h3>
        <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
          Enter client priorities to rank the strongest product fits.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="space-y-1">
          <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Client Age</label>
          <input
            type="number"
            value={answers.age}
            onChange={(e) => update('age', e.target.value)}
            placeholder="e.g. 63"
            className="w-full rounded-xl bg-slate-900 border border-white/10 px-3 py-2 text-sm text-white outline-none focus:border-amber-500/50"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Surrender Tolerance</label>
          <select
            value={answers.surrenderTolerance}
            onChange={(e) => update('surrenderTolerance', e.target.value as Answers['surrenderTolerance'])}
            className="w-full rounded-xl bg-slate-900 border border-white/10 px-3 py-2 text-sm text-white outline-none"
          >
            <option value="short">Short (5-yr)</option>
            <option value="medium">Medium (7-yr)</option>
            <option value="long">Long (10-yr+)</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">State Filter</label>
          <input
            type="text"
            value={answers.stateCode}
            onChange={(e) => update('stateCode', e.target.value.toUpperCase().slice(0, 2) as string)}
            placeholder="PA"
            className="w-full rounded-xl bg-slate-900 border border-white/10 px-3 py-2 text-sm text-white outline-none uppercase focus:border-amber-500/50"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Fee Preference</label>
          <button
            onClick={() => update('avoidFees', !answers.avoidFees)}
            className="w-full rounded-xl border px-3 py-2 text-sm font-bold transition-all"
            style={{
              borderColor: answers.avoidFees ? gold : 'rgba(255,255,255,0.12)',
              backgroundColor: answers.avoidFees ? 'rgba(196,154,108,0.12)' : 'rgba(255,255,255,0.03)',
              color: answers.avoidFees ? goldLight : '#cbd5e1',
            }}
          >
            {answers.avoidFees ? 'Avoid Rider Fees: ON' : 'Avoid Rider Fees: OFF'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {([
          ['needIncomeNow', 'Income Now'],
          ['needIncomeSoon', 'Income Soon'],
          ['growthOnly', 'Growth Only'],
          ['legacyPriority', 'Legacy Focus'],
          ['healthConcern', 'Health / Care'],
          ['avoidFees', 'No Fees'],
        ] as [keyof Answers, string][]).map(([key, label]) => {
          const active = answers[key] as boolean
          return (
            <button
              key={key}
              onClick={() => update(key, !active as Answers[typeof key])}
              className="rounded-xl border px-3 py-2 text-[11px] font-bold uppercase tracking-wider transition-all"
              style={{
                borderColor: active ? gold : 'rgba(255,255,255,0.12)',
                backgroundColor: active ? 'rgba(196,154,108,0.12)' : 'rgba(255,255,255,0.03)',
                color: active ? goldLight : '#94a3b8',
              }}
            >
              {label}
            </button>
          )
        })}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-300">Top Product Matches</h4>
          <span className="text-[10px] text-slate-500">Ranked from current client inputs</span>
        </div>

        {topMatches.map(({ product, score, reasons, cautions }) => (
          <div key={product.id} className="rounded-2xl border p-4 bg-slate-900/80" style={{ borderColor: `${product.color}30` }}>
            <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h5 className="text-sm font-black text-white">{product.name}</h5>
                  <PTag text={product.tag} color={product.color} />
                </div>
                <p className="text-[11px] text-slate-400">{product.carrier} · {product.type}</p>
                <p className="text-[11px] italic mt-2 font-semibold" style={{ color: product.color }}>"{product.highlight}"</p>
              </div>
              <div
                className="shrink-0 px-3 py-2 rounded-xl text-center border"
                style={{ borderColor: `${product.color}35`, backgroundColor: `${product.color}12`, color: product.color }}
              >
                <div className="text-[9px] uppercase tracking-widest font-bold">Match Score</div>
                <div className="text-xl font-black">{score}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <h6 className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-2">Why it ranked well</h6>
                <div className="space-y-1.5">
                  {reasons.length > 0 ? reasons.slice(0, 5).map((r) => (
                    <div key={r} className="text-[11px] text-slate-300 pl-3 border-l-2 border-emerald-500/50">{r}</div>
                  )) : <div className="text-[11px] text-slate-500">No positive factors triggered yet.</div>}
                </div>
              </div>
              <div>
                <h6 className="text-[10px] font-black uppercase tracking-widest text-red-400 mb-2">Cautions</h6>
                <div className="space-y-1.5">
                  {cautions.length > 0 ? cautions.slice(0, 5).map((c) => (
                    <div key={c} className="text-[11px] text-slate-300 pl-3 border-l-2 border-red-500/50">{c}</div>
                  )) : <div className="text-[11px] text-slate-500">No major cautions from current inputs.</div>}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
              <Badge text={`${product.surrenderYrs}-yr surrender`} color={product.color} />
              <Badge text={`Ages ${product.issueAges}`} color="#cbd5e1" bg="rgba(255,255,255,0.08)" />
              {product.incomeBenefit && <Badge text="Income Feature" color="#34d399" bg="#10b98122" />}
              {product.wellbeingBenefit && <Badge text="Wellbeing" color="#fbbf24" bg="#f59e0b22" />}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
type View = 'browse' | 'compare' | 'clients' | 'summaries'

export default function AnnuityPlatformPage() {
  const [view, setView] = useState<View>('browse')
  const [selected, setSelected] = useState<string[]>([])
  const [detail, setDetail] = useState<string | null>(null)

  const [search, setSearch] = useState('')
  const [carrierFilter, setCarrierFilter] = useState('all')
  const [tagFilter, setTagFilter] = useState('all')
  const [surrenderFilter, setSurrenderFilter] = useState('all')
  const [stateFilter, setStateFilter] = useState('')
  const [availableOnly, setAvailableOnly] = useState(false)

  const gold = '#C49A6C'
  const goldLight = '#D4AE86'

  function toggleSelect(id: string) {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id)
      if (prev.length >= 5) return prev
      return [...prev, id]
    })
  }

  function openDetail(id: string) {
    setDetail(id === detail ? null : id)
  }

  function clearBrowseFilters() {
    setSearch('')
    setCarrierFilter('all')
    setTagFilter('all')
    setSurrenderFilter('all')
    setStateFilter('')
    setAvailableOnly(false)
  }

  const filteredProducts = useMemo(() => {
    const stateCode = normalizeStateCode(stateFilter)
    return PRODUCTS.filter((p) => {
      const haystack = [p.name, p.carrier, p.type, p.tag, p.highlight, ...(p.keyPoints || [])]
        .join(' ')
        .toLowerCase()
      const matchesSearch = !search.trim() || haystack.includes(search.trim().toLowerCase())
      const matchesCarrier = carrierFilter === 'all' || p.carrier === carrierFilter
      const matchesTag = tagFilter === 'all' || p.tag === tagFilter
      const matchesSurrender = surrenderFilter === 'all' || String(p.surrenderYrs) === surrenderFilter
      const availableInState = productAvailableInState(p, stateCode)
      const matchesState = !stateCode || (availableOnly ? availableInState : true)
      return matchesSearch && matchesCarrier && matchesTag && matchesSurrender && matchesState
    })
  }, [search, carrierFilter, tagFilter, surrenderFilter, stateFilter, availableOnly])

  const NAV: [View, string][] = [
    ['browse', '📋 Products Library'],
    ['compare', '⚖️ Comparison'],
    ['clients', '👥 Client Fit'],
    ['summaries', '📄 Cheat Sheets'],
  ]

  return (
    <div className="min-h-screen text-white pb-16">
      {/* Inner header */}
      <div className="px-6 py-5 border-b border-white/6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.35em] font-black" style={{ color: gold }}>
            Annuity Platform
          </p>
          <h1 className="text-lg font-extrabold text-white tracking-wide">Product Research & Comparison</h1>
          <p className="text-xs text-slate-400 mt-0.5">5 carrier-filed products · Agent-authorized material only</p>
        </div>
        <span className="text-[9px] px-2.5 py-1 rounded border border-[#C49A6C]/20 bg-[#C49A6C]/5 font-extrabold font-mono tracking-widest" style={{ color: goldLight }}>
          FOR LICENSED AGENTS ONLY
        </span>
      </div>

      {/* Tab nav */}
      <div className="flex items-center gap-2 px-6 py-3 border-b border-white/6 overflow-x-auto whitespace-nowrap">
        {NAV.map(([v, label]) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className="px-4 py-1.5 rounded-full text-[11px] font-bold transition-all duration-150 border uppercase outline-none"
            style={{
              backgroundColor: view === v ? 'rgba(196,154,108,0.15)' : 'transparent',
              borderColor: view === v ? gold : 'transparent',
              color: view === v ? goldLight : '#94a3b8',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 md:px-6 pt-6">
        {/* ── BROWSE ── */}
        {view === 'browse' && (
          <div className="space-y-5">
            <div className="flex flex-col gap-4 border-b border-white/5 pb-4">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 text-xs text-slate-400">
                <p>Search, filter, and select products to review details or compare.</p>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-slate-500">
                    {filteredProducts.length} Results
                  </span>
                  {selected.length > 0 && (
                    <button
                      onClick={() => setView('compare')}
                      className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 transition-colors text-slate-950 text-[10px] font-black tracking-wider px-3.5 py-1.5 rounded-full uppercase"
                    >
                      Compare {selected.length} →
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-3">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search product, carrier, tag..."
                  className="xl:col-span-2 rounded-xl bg-slate-900 border border-white/10 px-3 py-2 text-sm text-white outline-none focus:border-amber-500/50"
                />
                <select
                  value={carrierFilter}
                  onChange={(e) => setCarrierFilter(e.target.value)}
                  className="rounded-xl bg-slate-900 border border-white/10 px-3 py-2 text-sm text-white outline-none"
                >
                  {CARRIERS.map((c) => (
                    <option key={c} value={c}>{c === 'all' ? 'All Carriers' : c}</option>
                  ))}
                </select>
                <select
                  value={tagFilter}
                  onChange={(e) => setTagFilter(e.target.value)}
                  className="rounded-xl bg-slate-900 border border-white/10 px-3 py-2 text-sm text-white outline-none"
                >
                  {TAGS.map((t) => (
                    <option key={t} value={t}>{t === 'all' ? 'All Tags' : t}</option>
                  ))}
                </select>
                <select
                  value={surrenderFilter}
                  onChange={(e) => setSurrenderFilter(e.target.value)}
                  className="rounded-xl bg-slate-900 border border-white/10 px-3 py-2 text-sm text-white outline-none"
                >
                  {SURRENDER_OPTIONS.map((v) => (
                    <option key={v} value={v}>{v === 'all' ? 'All Surrender Terms' : `${v}-Year`}</option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <input
                    value={stateFilter}
                    onChange={(e) => setStateFilter(e.target.value.toUpperCase().slice(0, 2))}
                    placeholder="State"
                    className="w-full rounded-xl bg-slate-900 border border-white/10 px-3 py-2 text-sm text-white outline-none uppercase focus:border-amber-500/50"
                  />
                  <button
                    onClick={clearBrowseFilters}
                    className="rounded-xl border border-white/10 px-3 py-2 text-[11px] text-slate-300 font-bold whitespace-nowrap hover:bg-white/5 transition-colors"
                  >
                    Clear
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setAvailableOnly((v) => !v)}
                  className="rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-wider transition-all"
                  style={{
                    borderColor: availableOnly ? gold : 'rgba(255,255,255,0.12)',
                    backgroundColor: availableOnly ? 'rgba(196,154,108,0.12)' : 'transparent',
                    color: availableOnly ? goldLight : '#94a3b8',
                  }}
                >
                  {availableOnly ? 'State Filter: Available Only' : 'State Filter: Off'}
                </button>
                {stateFilter && (
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                    State: {normalizeStateCode(stateFilter)}
                  </span>
                )}
                {selected.length >= 5 && (
                  <span className="text-[10px] text-amber-300 uppercase tracking-widest">
                    Max 5 products can be compared at once.
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {filteredProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  p={p}
                  selected={selected}
                  onSelect={(id) => {
                    toggleSelect(id)
                    openDetail(id)
                  }}
                />
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center text-slate-500 text-xs py-14 border border-dashed border-slate-700/50 rounded-2xl">
                No products matched the current filters.
              </div>
            )}

            {detail && (() => {
              const p = PRODUCTS.find((p) => p.id === detail)
              return p ? <DetailPanel p={p} /> : null
            })()}
          </div>
        )}

        {/* ── COMPARE ── */}
        {view === 'compare' && (
          <div className="space-y-5">
            <p className="text-xs text-slate-400 border-b border-white/5 pb-3">
              Activate or deactivate products to modify comparison (max 5).
            </p>
            {selected.length >= 5 && (
              <p className="text-[10px] text-amber-300 uppercase tracking-widest">Max 5 products at once.</p>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {PRODUCTS.map((p) => (
                <ProductCard key={p.id} p={p} selected={selected} onSelect={toggleSelect} mini />
              ))}
            </div>
            <CompareTable selected={selected} />
          </div>
        )}

        {/* ── CLIENTS ── */}
        {view === 'clients' && (
          <div className="space-y-6">
            <RecommendationAdvisor />
            <ClientSummaries />
          </div>
        )}

        {/* ── SUMMARIES ── */}
        {view === 'summaries' && (
          <div className="space-y-4">
            <p className="text-xs text-slate-400 border-b border-white/5 pb-3">
              Pre-compiled carrier cheat sheets for quick reference during consultation calls.
            </p>
            {PRODUCTS.map((p) => (
              <div key={p.id} className="bg-slate-950/40 border rounded-2xl p-5 shadow-lg" style={{ borderColor: `${p.color}30` }}>
                <div className="flex justify-between items-start gap-2 mb-3.5">
                  <div>
                    <h3 className="text-sm font-black text-white uppercase">{p.name}</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{p.carrier} · {p.type}</p>
                  </div>
                  <PTag text={p.tag} color={p.color} />
                </div>

                <p className="text-[11px] font-semibold italic mb-4" style={{ color: p.color }}>"{p.highlight}"</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 text-xs">
                  {[
                    ['Surrender Frame', `${p.surrenderYrs} calendar years`],
                    ['Issue Ages', p.issueAges],
                    ['Minimum Premium', p.minPremium],
                    ['Rider Fees', p.liberFee || 'None'],
                    ['Free Withdrawal', p.freeWithdrawal.split('(')[0].trim()],
                    ['Min Guaranteed Surrender', '87.5% of premium less surrenders'],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between py-1 border-b border-white/5 gap-2">
                      <span className="text-slate-400">{k}:</span>
                      <span className="text-white font-medium text-right">{v}</span>
                    </div>
                  ))}
                </div>

                <h5 className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: p.color }}>
                  Key Selling Points
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {p.keyPoints.slice(0, 4).map((k) => (
                    <div key={k} className="text-[11px] text-slate-300 pl-2.5 border-l-2" style={{ borderLeftColor: `${p.color}55` }}>
                      {k}
                    </div>
                  ))}
                </div>

                {p.excludedStates.length > 0 && (
                  <p className="mt-4 text-[10px] text-red-400/80 font-semibold">
                    ⚠ Restricted States: {p.excludedStates.join(', ')}
                  </p>
                )}
              </div>
            ))}

            <div className="mt-8 p-4 bg-slate-950/80 rounded-xl border border-white/10 text-[10px] text-slate-400 leading-relaxed">
              <strong className="block mb-1 text-[11px] font-bold uppercase tracking-wider" style={{ color: goldLight }}>
                Compliance & Legal Disclosures
              </strong>
              For agent training use only. Do not distribute directly to prospective clients as marketing collateral.
              Fixed index annuities are insurance products — they do not invest directly in stocks or equity index segments.
              Guarantees are backed solely by the financial strength of the issuing insurance carriers.
              American Equity Brokerage: 888-647-1371 · american-equity.com.
              North American: NorthAmericanCompany.com.
              Jackson M. Latimore Sr., PA License #1268820.
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
