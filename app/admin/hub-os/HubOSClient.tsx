'use client'

import { useState } from 'react'

// ── Data ──────────────────────────────────────────────────────────────────────

type TaskPri = 'high' | 'med' | 'low'
interface Task { text: string; pri: TaskPri; done: boolean }

const INITIAL_TASKS: Task[] = [
  { text: 'Pay PAHS CampusBox balance — $460 DUE TODAY', pri: 'high', done: false },
  { text: 'Follow up with Schuylkill Chamber EVP Samantha Chivinski re: Finance & Admin Coordinator role', pri: 'high', done: false },
  { text: 'Submit LAT-2026-01 pre-suit demand package to Diocese of Allentown', pri: 'high', done: false },
  { text: 'Review North American carrier appointment paperwork', pri: 'med', done: false },
  { text: 'Deploy Latimore Hub OS leads dashboard admin page to Vercel', pri: 'med', done: false },
  { text: 'Activate PAHS Full Circle Legacy QR funnel on latimorelifelegacy.com', pri: 'med', done: false },
  { text: 'Build Luzerne County Latino market landing page', pri: 'low', done: false },
  { text: 'Verify GA4 events — G-WZWMX83WXQ and G-S0Q3E4DEBJ', pri: 'low', done: false },
]

const PIPELINE = [
  { initials: 'SP', name: 'Schuylkill Pre-Retiree', stage: 'Quote', cls: 'quote', val: '$4,800/yr' },
  { initials: 'YF', name: 'Young Family — Frackville', stage: 'Lead', cls: 'lead', val: '$1,200/yr' },
  { initials: 'SV', name: 'Schuylkill Valley SD', stage: 'Active Prospect', cls: 'active', val: '$18,000/yr' },
  { initials: 'RC', name: 'Referral — Coal Region', stage: 'Closing', cls: 'close', val: '$2,400/yr' },
]

const DOCS = [
  { name: 'LAT-2026-01 Final Civil Complaint', date: 'May 2026', tag: 'Legal' },
  { name: 'Schuylkill Chamber Cover Letter & Resume', date: 'Apr 2026', tag: 'Career' },
  { name: 'PAHS Full Circle Sponsorship Invoice', date: 'Apr 2026', tag: 'Sponsorship' },
  { name: 'MBA Diploma — AIU Apr 7 2026', date: 'Apr 2026', tag: 'Credentials' },
  { name: 'Latino Market Playbook — Luzerne County', date: 'Apr 2026', tag: 'Marketing' },
  { name: 'Hub OS Vercel deploy config', date: 'May 2026', tag: 'Code' },
]

const LOGS = [
  { time: '09:14', cls: 'text-emerald-400', msg: '✓  Latimore Hub OS — Vercel build passed' },
  { time: '09:10', cls: 'text-blue-400', msg: '→  Supabase medxfhhxvmczmpurkmrp — schema sync OK' },
  { time: '08:55', cls: 'text-emerald-400', msg: '✓  GA4 G-WZWMX83WXQ — events firing correctly' },
  { time: '08:40', cls: 'text-yellow-400', msg: '⚠  PAHS invoice $460 — DUE TODAY' },
  { time: '08:30', cls: 'text-blue-400', msg: '→  Brand guardrails loaded — all workflows active' },
  { time: 'Yesterday', cls: 'text-emerald-400', msg: '✓  LAT-2026-01 complaint package — finalized' },
]

const WORKFLOW_PROMPTS: Record<string, string> = {
  email: 'Run the Latimore brand content builder: create an on-brand email campaign for Pre-Retirees in Schuylkill County. Primary KPI: monthly application volume. Tone: urgent but NOT fear-based, empathetic, legacy-focused. Include a strong CTA. Use the Latimore Life & Legacy LLC voice — Protecting Today. Securing Tomorrow. #TheBeatGoesOn.',
  proposal: 'Run the school district proposal builder for a Schuylkill County district. Build a full proposal covering: Executive Summary, Current Risk Landscape, Latimore Solution Overview, Implementation Plan, Pricing, and Next Steps with CTA.',
  'brand-check': 'Run a Latimore brand compliance review. Return a compliance table with PASS/SOFT WARNING/FAIL ratings and a priority fix list against brand guardrails.',
  cta: 'Run the KPI-aligned CTA generator for Latimore Life & Legacy LLC. Target ICP: Pre-Retirees in Schuylkill County. Channel: Facebook. Generate 6 strong, on-brand calls to action.',
  audit: 'Run a Codex codebase audit on the Latimore Hub OS. Identify broken routes, missing env vars, Vercel deployment issues, and API route errors.',
  deploy: 'Generate deployment-ready Termux (Android) commands to push the latest Latimore Hub OS changes to GitHub and trigger a Vercel deploy. Include git add, git commit, git push, and Vercel CLI deploy command.',
  supabase: 'Run a Supabase data health check on project medxfhhxvmczmpurkmrp. Check CRM tables, admin routes, migration status, and Prisma schema drift.',
  'admin-page': 'Generate a new Latimore Hub OS admin page component — a leads dashboard (Next.js 14 App Router, TypeScript, Tailwind) that pulls from Supabase leads table with county filter. Output the full component code for /app/admin/leads/page.tsx.',
}

const FOLDERS = [
  { key: 'insurance', icon: '📁', name: 'Insurance & Carriers', sub: 'Appointments · Policies · Compliance' },
  { key: 'hubos', icon: '💻', name: 'Hub OS / Codebase', sub: 'Next.js · Supabase · Vercel' },
  { key: 'legal', icon: '⚖️', name: 'Legal — LAT-2026-01', sub: 'Complaint · Exhibits · Letters' },
  { key: 'pahs', icon: '🛡️', name: 'PAHS Campaign', sub: 'Sponsorship · QR Funnel · Invoice' },
  { key: 'marketing', icon: '📣', name: 'Marketing & Content', sub: 'Emails · Social · Landing Pages' },
  { key: 'credentials', icon: '🎓', name: 'Credentials & Licenses', sub: 'MBA · License #1268820 · GFI' },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

async function callAI(prompt: string): Promise<string> {
  const res = await fetch('/api/hub-os/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(json?.error ?? 'Request failed')
  return json?.text ?? ''
}

const PRI_STYLES: Record<TaskPri, string> = {
  high: 'bg-red-100 text-red-700',
  med: 'bg-amber-100 text-amber-700',
  low: 'bg-emerald-100 text-emerald-700',
}

const STAGE_STYLES: Record<string, string> = {
  lead: 'bg-amber-100 text-amber-700',
  quote: 'bg-blue-100 text-blue-700',
  close: 'bg-emerald-100 text-emerald-700',
  active: 'bg-[#e8d5b7] text-[#8b6a45]',
}

// ── Main component ────────────────────────────────────────────────────────────

type Tab = 'dashboard' | 'revenue' | 'files' | 'tasks' | 'codex'

export default function HubOSClient() {
  const [tab, setTab] = useState<Tab>('dashboard')
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS)

  // Revenue Engine
  const [revIcp, setRevIcp] = useState('Pre-Retirees — Schuylkill County')
  const [revAsset, setRevAsset] = useState('Email campaign')
  const [revKpi, setRevKpi] = useState('Monthly applications')
  const [revBrief, setRevBrief] = useState('')
  const [revOutput, setRevOutput] = useState('')
  const [revLoading, setRevLoading] = useState(false)

  // Tasks AI
  const [taskQ, setTaskQ] = useState('')
  const [taskOutput, setTaskOutput] = useState('')
  const [taskLoading, setTaskLoading] = useState(false)

  // Codex AI
  const [codexQ, setCodexQ] = useState('')
  const [codexOutput, setCodexOutput] = useState('')
  const [codexLoading, setCodexLoading] = useState(false)

  function toggleTask(i: number) {
    setTasks(prev => prev.map((t, idx) => idx === i ? { ...t, done: !t.done } : t))
  }

  async function runRevenueAI() {
    setRevLoading(true)
    setRevOutput('Generating…')
    try {
      const prompt = `You are the brand content builder for Latimore Life & Legacy LLC, an independent insurance brokerage in Pennsylvania's Coal Region (Schuylkill, Luzerne, Northumberland Counties). Founder: Jackson M. Latimore Sr. — survived cardiac arrest Dec 2010, saved by AED. Tagline: "Protecting Today. Securing Tomorrow. #TheBeatGoesOn."

Write a ${revAsset} for ICP: ${revIcp}. Primary KPI: ${revKpi}.${revBrief ? ' Additional context: ' + revBrief : ''}

Rules: urgent but NOT fear-based. Empathetic, legacy-focused. No guarantees of returns. Strong, specific CTA. Output ONLY the final copy, ready to use.`
      const text = await callAI(prompt)
      setRevOutput(text)
    } catch (e: any) {
      setRevOutput('Error: ' + e.message)
    } finally {
      setRevLoading(false)
    }
  }

  async function runTaskAI() {
    if (!taskQ.trim()) return
    setTaskLoading(true)
    setTaskOutput('Thinking…')
    try {
      const openTasks = tasks.filter(t => !t.done).map(t => '• ' + t.text).join('\n')
      const prompt = `You are the operations assistant for Jackson M. Latimore Sr., Founder & CEO of Latimore Life & Legacy LLC (Frackville, PA). Today is ${new Date().toLocaleDateString()}.

Open tasks:\n${openTasks}\n\nUser request: ${taskQ}`
      const text = await callAI(prompt)
      setTaskOutput(text)
    } catch (e: any) {
      setTaskOutput('Error: ' + e.message)
    } finally {
      setTaskLoading(false)
    }
  }

  async function runCodexAI() {
    if (!codexQ.trim()) return
    setCodexLoading(true)
    setCodexOutput('Running…')
    try {
      const prompt = `You are a senior full-stack developer working on the Latimore Hub OS for Latimore Life & Legacy LLC. Stack: Next.js 14 App Router, TypeScript, Prisma, Supabase (project: medxfhhxvmczmpurkmrp), Vercel, GitHub org: latimorelifelegacy25.

Task: ${codexQ}

Provide production-ready, copy-paste code or commands. Be specific and complete.`
      const text = await callAI(prompt)
      setCodexOutput(text)
    } catch (e: any) {
      setCodexOutput('Error: ' + e.message)
    } finally {
      setCodexLoading(false)
    }
  }

  async function launchWorkflow(key: string) {
    const prompt = WORKFLOW_PROMPTS[key]
    if (!prompt) return
    setTab('codex')
    setCodexQ(prompt)
    setCodexLoading(true)
    setCodexOutput('Running…')
    try {
      const text = await callAI(prompt)
      setCodexOutput(text)
    } catch (e: any) {
      setCodexOutput('Error: ' + e.message)
    } finally {
      setCodexLoading(false)
    }
  }

  const openTasks = tasks.filter(t => !t.done).length

  const NAV_TABS: { id: Tab; label: string; icon: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: 'fa-layout-dashboard' },
    { id: 'revenue', label: 'Revenue Engine', icon: 'fa-dollar-sign' },
    { id: 'files', label: 'File Vault', icon: 'fa-folder' },
    { id: 'tasks', label: `Tasks (${openTasks})`, icon: 'fa-check-square' },
    { id: 'codex', label: 'Codex Sync', icon: 'fa-terminal' },
  ]

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      {/* Topbar */}
      <div className="rounded-t-xl bg-[#2C3E50] px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#C49A6C] rounded-md flex items-center justify-center text-[#2C3E50] font-black text-sm">LL</div>
          <div>
            <div className="text-white text-sm font-semibold leading-tight">Latimore Hub OS</div>
            <div className="text-[#C49A6C] text-[11px]">Revenue & Operations Command Center</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-white/50 text-[11px]">Live</span>
          <span className="text-[#C49A6C] text-[11px] bg-[#C49A6C]/15 rounded-full px-3 py-0.5">
            {new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Tab nav */}
      <div className="flex overflow-x-auto bg-white border-x border-white/20">
        {NAV_TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs whitespace-nowrap border-b-2 transition-all ${
              tab === t.id
                ? 'border-[#C49A6C] text-[#2C3E50] font-semibold bg-amber-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            <i className={`fa-solid ${t.icon}`} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Panel */}
      <div className="bg-white border border-t-0 border-slate-200 rounded-b-xl p-5 min-h-[440px]">

        {/* ── DASHBOARD ──────────────────────────────────────────── */}
        {tab === 'dashboard' && (
          <div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
              {[
                { label: 'Active Policies', value: '1', sub: 'Target: 5/mo by Mo.12', warn: true },
                { label: 'Pipeline Value', value: '$26.4K', sub: '4 active prospects', warn: false },
                { label: 'Referral Rate', value: '12%', sub: 'Target: 20–30%', warn: true },
                { label: 'District Contacts', value: '1', sub: 'Target: 3–5 by Mo.12', warn: true },
              ].map(k => (
                <div key={k.label} className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                  <div className="text-[11px] text-slate-500 mb-1">{k.label}</div>
                  <div className="text-2xl font-bold text-[#2C3E50]">{k.value}</div>
                  <div className={`text-[11px] mt-1 ${k.warn ? 'text-amber-600' : 'text-emerald-600'}`}>{k.sub}</div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-slate-800">Quick-launch workflows</span>
              <span className="text-[10px] bg-[#e8d5b7] text-[#8b6a45] px-2.5 py-0.5 rounded-full font-medium">#TheBeatGoesOn</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
              {[
                { key: 'email', icon: 'fa-envelope', title: 'Email Campaign Builder', desc: 'On-brand emails for pre-retirees, families, or school districts.' },
                { key: 'proposal', icon: 'fa-school', title: 'District Proposal Builder', desc: 'Full school district B2B proposals covering risk and continuity.' },
                { key: 'brand-check', icon: 'fa-shield-check', title: 'Brand Compliance Check', desc: 'Scored report against brand guardrails with a priority fix list.' },
                { key: 'cta', icon: 'fa-bullseye', title: 'CTA Generator', desc: 'Generate KPI-linked calls to action for any ICP or channel.' },
              ].map(w => (
                <button
                  key={w.key}
                  onClick={() => launchWorkflow(w.key)}
                  className="text-left border border-slate-200 rounded-lg p-3.5 hover:border-[#C49A6C] hover:shadow-sm transition-all group"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#e8d5b7] flex items-center justify-center mb-2">
                    <i className={`fa-solid ${w.icon} text-[#8b6a45]`} />
                  </div>
                  <div className="text-xs font-semibold text-slate-800 mb-1">{w.title}</div>
                  <div className="text-[11px] text-slate-500 leading-snug mb-2">{w.desc}</div>
                  <div className="text-[11px] text-[#8b6a45] font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                    <i className="fa-solid fa-play text-[9px]" /> Launch in Claude ↗
                  </div>
                </button>
              ))}
            </div>

            <div className="text-sm font-semibold text-slate-800 mb-2">Today's priorities</div>
            {tasks.slice(0, 3).map((t, i) => (
              <TaskRow key={i} task={t} index={i} onToggle={toggleTask} />
            ))}
          </div>
        )}

        {/* ── REVENUE ENGINE ─────────────────────────────────────── */}
        {tab === 'revenue' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-slate-800">Revenue pipeline</span>
              <span className="text-[10px] bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full font-medium">Coal Region</span>
            </div>
            {PIPELINE.map((p, i) => (
              <div key={i} className="flex items-center gap-3 py-2.5 border-b border-slate-100 last:border-0">
                <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[11px] font-semibold text-slate-600 shrink-0">
                  {p.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-slate-800">{p.name}</div>
                  <div className="text-[11px] text-slate-500">{p.stage}</div>
                </div>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${STAGE_STYLES[p.cls]}`}>{p.stage}</span>
                <div className="text-xs font-semibold text-[#8b6a45] shrink-0">{p.val}</div>
              </div>
            ))}

            <div className="h-px bg-slate-100 my-4" />

            {/* AI Content Builder */}
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <div className="bg-[#2C3E50] px-4 py-2 flex items-center gap-2">
                <i className="fa-solid fa-sparkles text-[#C49A6C] text-sm" />
                <span className="text-[#C49A6C] text-xs font-semibold">Latimore Brand Content Builder — Powered by Claude</span>
              </div>
              <div className="flex gap-2 p-3 bg-slate-50 border-b border-slate-100 flex-wrap">
                <select value={revIcp} onChange={e => setRevIcp(e.target.value)} className="text-xs px-2 py-1.5 border border-slate-200 rounded-md bg-white text-slate-700 flex-1 min-w-[140px]">
                  <option>Pre-Retirees — Schuylkill County</option>
                  <option>Young Families — Coal Region</option>
                  <option>School Districts — Schuylkill</option>
                  <option>Latino Market — Luzerne County</option>
                </select>
                <select value={revAsset} onChange={e => setRevAsset(e.target.value)} className="text-xs px-2 py-1.5 border border-slate-200 rounded-md bg-white text-slate-700 flex-1 min-w-[140px]">
                  <option>Email campaign</option>
                  <option>Social post</option>
                  <option>One-page flyer</option>
                  <option>Follow-up phone script</option>
                  <option>Landing page copy</option>
                  <option>Referral request message</option>
                </select>
                <select value={revKpi} onChange={e => setRevKpi(e.target.value)} className="text-xs px-2 py-1.5 border border-slate-200 rounded-md bg-white text-slate-700 flex-1 min-w-[140px]">
                  <option>Monthly applications</option>
                  <option>Referral rate</option>
                  <option>District penetration</option>
                </select>
              </div>
              <div className="flex gap-2 p-3">
                <textarea
                  value={revBrief}
                  onChange={e => setRevBrief(e.target.value)}
                  placeholder="Optional: add a specific angle, product, event, or compliance note…"
                  className="flex-1 text-xs p-2 border border-slate-200 rounded-md bg-slate-50 text-slate-700 resize-none h-14 focus:outline-none focus:border-[#C49A6C]"
                />
                <button
                  onClick={runRevenueAI}
                  disabled={revLoading}
                  className="bg-[#2C3E50] text-white text-xs font-semibold px-4 rounded-md hover:bg-[#3d5166] disabled:opacity-60 transition-colors whitespace-nowrap"
                >
                  {revLoading ? 'Generating…' : 'Generate ↗'}
                </button>
              </div>
              {revOutput && (
                <div className="px-4 py-3 text-xs text-slate-600 leading-relaxed bg-slate-50 border-t border-slate-100 whitespace-pre-wrap max-h-72 overflow-y-auto">
                  {revOutput}
                </div>
              )}
              {!revOutput && (
                <div className="px-4 py-3 text-xs text-slate-400 bg-slate-50 border-t border-slate-100">
                  Select your ICP, asset type, and KPI — then hit Generate to build on-brand revenue content.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── FILE VAULT ─────────────────────────────────────────── */}
        {tab === 'files' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-slate-800">File vault</span>
              <span className="text-[10px] bg-[#e8d5b7] text-[#8b6a45] px-2.5 py-0.5 rounded-full font-medium">Organized</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-5">
              {FOLDERS.map(f => (
                <button
                  key={f.key}
                  className="text-left border border-slate-200 rounded-lg p-3 hover:border-[#C49A6C] transition-colors"
                  onClick={() => {
                    navigator.clipboard?.writeText(`Open the Latimore ${f.name} folder.`).catch(() => {})
                  }}
                >
                  <div className="text-2xl mb-2">{f.icon}</div>
                  <div className="text-xs font-semibold text-slate-800 mb-1">{f.name}</div>
                  <div className="text-[11px] text-slate-500">{f.sub}</div>
                </button>
              ))}
            </div>

            <div className="text-sm font-semibold text-slate-800 mb-3">Recent documents</div>
            {DOCS.map((d, i) => (
              <div key={i} className="flex items-center gap-3 py-2 border-b border-slate-100 last:border-0">
                <i className="fa-solid fa-file-lines text-slate-400 text-sm shrink-0" />
                <div className="flex-1 text-xs text-slate-700">{d.name}</div>
                <span className="text-[10px] bg-[#e8d5b7] text-[#8b6a45] px-2 py-0.5 rounded-full font-medium shrink-0">{d.tag}</span>
                <div className="text-[11px] text-slate-400 shrink-0">{d.date}</div>
              </div>
            ))}
          </div>
        )}

        {/* ── TASKS ──────────────────────────────────────────────── */}
        {tab === 'tasks' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-slate-800">Active tasks</span>
              <span className="text-[10px] bg-[#e8d5b7] text-[#8b6a45] px-2.5 py-0.5 rounded-full font-medium">{openTasks} open</span>
            </div>
            {tasks.map((t, i) => (
              <TaskRow key={i} task={t} index={i} onToggle={toggleTask} />
            ))}

            <div className="h-px bg-slate-100 my-4" />

            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <div className="bg-[#2C3E50] px-4 py-2 flex items-center gap-2">
                <i className="fa-solid fa-sparkles text-[#C49A6C] text-sm" />
                <span className="text-[#C49A6C] text-xs font-semibold">Task assistant — Claude</span>
              </div>
              <div className="flex gap-2 p-3">
                <textarea
                  value={taskQ}
                  onChange={e => setTaskQ(e.target.value)}
                  placeholder="Ask Claude to prioritize your list, draft a task plan, or help with a specific item…"
                  className="flex-1 text-xs p-2 border border-slate-200 rounded-md bg-slate-50 text-slate-700 resize-none h-12 focus:outline-none focus:border-[#C49A6C]"
                />
                <button
                  onClick={runTaskAI}
                  disabled={taskLoading}
                  className="bg-[#2C3E50] text-white text-xs font-semibold px-4 rounded-md hover:bg-[#3d5166] disabled:opacity-60 transition-colors"
                >
                  {taskLoading ? '…' : 'Ask ↗'}
                </button>
              </div>
              {taskOutput && (
                <div className="px-4 py-3 text-xs text-slate-600 leading-relaxed bg-slate-50 border-t border-slate-100 whitespace-pre-wrap max-h-60 overflow-y-auto">
                  {taskOutput}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── CODEX SYNC ─────────────────────────────────────────── */}
        {tab === 'codex' && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-slate-800">Codex sync log</span>
              <span className="text-[10px] bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full font-medium">Latimore Hub OS</span>
            </div>

            <div className="bg-[#1a1f2e] rounded-lg p-3 font-mono text-[11.5px] leading-7 mb-4 max-h-40 overflow-y-auto">
              {LOGS.map((l, i) => (
                <div key={i} className="flex gap-3">
                  <span className="text-[#C49A6C] shrink-0">[{l.time}]</span>
                  <span className={l.cls}>{l.msg}</span>
                </div>
              ))}
            </div>

            <div className="text-sm font-semibold text-slate-800 mb-3">Codex workflows — run with Claude</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
              {[
                { key: 'audit', icon: 'fa-magnifying-glass-chart', title: 'Codebase audit', desc: 'Scan Hub OS for broken routes, missing env vars, and deploy issues.' },
                { key: 'deploy', icon: 'fa-code-branch', title: 'Termux deploy', desc: 'Ready-to-paste git + Vercel deploy commands for Android Termux sessions.' },
                { key: 'supabase', icon: 'fa-database', title: 'Supabase health check', desc: 'Audit CRM tables, admin routes, and Prisma schema.' },
                { key: 'admin-page', icon: 'fa-table-columns', title: 'Generate admin page', desc: 'Build a new Hub OS page — leads, CRM, docs, or strategy.' },
              ].map(w => (
                <button
                  key={w.key}
                  onClick={() => launchWorkflow(w.key)}
                  className="text-left border border-slate-200 rounded-lg p-3.5 hover:border-[#C49A6C] hover:shadow-sm transition-all group"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#e8d5b7] flex items-center justify-center mb-2">
                    <i className={`fa-solid ${w.icon} text-[#8b6a45]`} />
                  </div>
                  <div className="text-xs font-semibold text-slate-800 mb-1">{w.title}</div>
                  <div className="text-[11px] text-slate-500 leading-snug mb-2">{w.desc}</div>
                  <div className="text-[11px] text-[#8b6a45] font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                    <i className="fa-solid fa-play text-[9px]" /> Launch ↗
                  </div>
                </button>
              ))}
            </div>

            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <div className="bg-[#2C3E50] px-4 py-2 flex items-center gap-2">
                <i className="fa-solid fa-sparkles text-[#C49A6C] text-sm" />
                <span className="text-[#C49A6C] text-xs font-semibold">Codex / Claude integrated prompt</span>
              </div>
              <div className="flex gap-2 p-3">
                <textarea
                  value={codexQ}
                  onChange={e => setCodexQ(e.target.value)}
                  placeholder="e.g. Generate a Next.js CRM lead table component that pulls from Supabase leads table, sorted by county…"
                  className="flex-1 text-xs p-2 border border-slate-200 rounded-md bg-slate-50 text-slate-700 resize-none h-14 focus:outline-none focus:border-[#C49A6C]"
                />
                <button
                  onClick={runCodexAI}
                  disabled={codexLoading}
                  className="bg-[#2C3E50] text-white text-xs font-semibold px-4 rounded-md hover:bg-[#3d5166] disabled:opacity-60 transition-colors"
                >
                  {codexLoading ? 'Running…' : 'Run ↗'}
                </button>
              </div>
              {codexOutput && (
                <div className="px-4 py-3 text-xs text-slate-600 leading-relaxed bg-slate-50 border-t border-slate-100 whitespace-pre-wrap max-h-72 overflow-y-auto">
                  {codexOutput}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Shared sub-component ──────────────────────────────────────────────────────

function TaskRow({ task, index, onToggle }: { task: Task; index: number; onToggle: (i: number) => void }) {
  return (
    <div className="flex items-start gap-2.5 py-2 border-b border-slate-100 last:border-0">
      <button
        onClick={() => onToggle(index)}
        className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center shrink-0 border transition-colors ${
          task.done ? 'bg-[#2C3E50] border-[#2C3E50]' : 'border-slate-300'
        }`}
      >
        {task.done && <span className="text-white text-[9px] font-bold">✓</span>}
      </button>
      <div className={`flex-1 text-xs leading-snug ${task.done ? 'line-through text-slate-400' : 'text-slate-700'}`}>
        {task.text}
      </div>
      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 ${PRI_STYLES[task.pri]}`}>
        {task.pri}
      </span>
    </div>
  )
}
