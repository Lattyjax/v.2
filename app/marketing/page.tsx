'use client'

import React, { useState, useEffect, useCallback, useRef, type JSX } from 'react'

// ─── Brand tokens ────────────────────────────────────────────────────────────
const G = '#C9A25F'
const NAVY = '#0B0F17'
const SURF = '#131929'
const SURF2 = '#1a2535'
const INK = '#F7F7F5'
const MUTED = '#A9B1BE'
const BORDER = '#2a3548'

// ─── Types ───────────────────────────────────────────────────────────────────
type TriggerType = 'manual' | 'webhook' | 'cron' | 'crm_stage'
type StepType = 'email' | 'sms' | 'social_post' | 'ai_generate' | 'delay' | 'condition'
type TabType = 'builder' | 'campaigns' | 'campaign' | 'templates' | 'assets' | 'calculator'

interface WorkflowStep {
  id?: string
  order: number
  type: StepType
  label: string
  config: Record<string, string | number | boolean | string[]>
}

interface Workflow {
  id?: string
  name: string
  description: string
  triggerType: TriggerType
  triggerValue: string
  category: string
  tags: string[]
  isActive: boolean
  isPreset?: boolean
  runCount?: number
  lastRunAt?: string
  steps: WorkflowStep[]
}

interface SocialTemplate {
  id: string
  title: string
  category: string
  platform: string | null
  audienceTrack: string | null
  body: string
  cta: string | null
  hashtags: string[]
  suggestedDay: string | null
  suggestedTime: string | null
  campaign: string | null
  complianceStatus: 'draft' | 'approved' | 'flagged'
  createdAt: string
}

interface UploadedAsset {
  id: string
  fileName: string
  mimeType: string
  storageUrl: string | null
  status: string
  metadata: Record<string, unknown>
  createdAt: string
}

// ─── Presets ─────────────────────────────────────────────────────────────────
const PRESETS: Workflow[] = [
  {
    name: 'Always-Updated Audit Loop',
    description: 'Runs a nightly codebase audit and emails the daily brief to the admin inbox.',
    triggerType: 'cron',
    triggerValue: '0 0 * * *',
    category: 'Ops',
    tags: ['audit', 'nightly'],
    isActive: false,
    isPreset: true,
    steps: [
      { order: 0, type: 'ai_generate', label: 'Generate Audit Report', config: { prompt: 'Analyze pipeline activity, lead scores, and flagged contacts from the past 24 hours. Summarize in 5 bullet points.' } },
      { order: 1, type: 'email', label: 'Send Daily Brief', config: { subject: 'Latimore OS — Daily Audit Brief', bodyText: '{{ai_output}}' } },
    ],
  },
  {
    name: 'Brand Compliance Audit',
    description: 'Triggered when a lead enters the Follow Up stage. Checks messaging compliance and alerts the agent.',
    triggerType: 'crm_stage',
    triggerValue: 'Follow Up',
    category: 'Compliance',
    tags: ['brand', 'compliance', 'crm'],
    isActive: false,
    isPreset: true,
    steps: [
      { order: 0, type: 'ai_generate', label: 'Run Compliance Check', config: { prompt: 'Review the last 3 notes and messages for this contact. Flag any language that violates compliance guidelines or appears fear-based.' } },
      { order: 1, type: 'condition', label: 'Flag Check', config: { field: 'compliance_score', operator: 'lt', value: '80' } },
      { order: 2, type: 'email', label: 'Alert Agent', config: { subject: 'Brand Compliance Flag — Action Required', bodyText: 'A compliance issue was detected for {{contact_name}}. Review immediately.' } },
    ],
  },
  {
    name: 'SLA Underwriting Verification',
    description: 'Fires when a lead reaches Qualified stage. Auto-generates underwriting notes and notifies the agent.',
    triggerType: 'crm_stage',
    triggerValue: 'Qualified',
    category: 'Underwriting',
    tags: ['sla', 'underwriting', 'crm'],
    isActive: false,
    isPreset: true,
    steps: [
      { order: 0, type: 'ai_generate', label: 'Generate Underwriting Notes', config: { prompt: 'Based on the contact profile, recommend the most suitable products and flag any underwriting concerns.' } },
      { order: 1, type: 'email', label: 'Notify Agent', config: { subject: 'Underwriting Summary — {{contact_name}}', bodyText: '{{ai_output}}' } },
    ],
  },
  {
    name: 'Lead Enrichment Stream',
    description: 'Triggered by a Fillout form submission. Enriches the lead, sends a welcome email, waits 24h, then sends an SMS follow-up.',
    triggerType: 'webhook',
    triggerValue: 'fillout_form',
    category: 'Lead Gen',
    tags: ['fillout', 'webhook', 'enrichment'],
    isActive: false,
    isPreset: true,
    steps: [
      { order: 0, type: 'ai_generate', label: 'Enrich Lead Data', config: { prompt: 'Summarize the lead based on form fields and suggest the best product fit and follow-up approach.' } },
      { order: 1, type: 'email', label: 'Welcome Email', config: { subject: 'Welcome — Let\'s Protect Your Family', bodyText: 'Hi {{first_name}}, thank you for reaching out! I\'ll be in touch shortly to review your options. — Jackson Latimore' } },
      { order: 2, type: 'delay', label: 'Wait 24 Hours', config: { amount: 24, unit: 'hours' } },
      { order: 3, type: 'sms', label: 'SMS Follow-Up', config: { body: 'Hi {{first_name}}, this is Jackson with Latimore Life & Legacy. Did you have a chance to review our email? Reply PROTECT to get started.' } },
    ],
  },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────
const TRIGGER_META: Record<TriggerType, { label: string; color: string; icon: string }> = {
  manual:    { label: 'Manual',     color: '#6B7280', icon: '▶️' },
  webhook:   { label: 'Webhook',    color: '#3B82F6', icon: '🔗' },
  cron:      { label: 'Scheduled',  color: '#8B5CF6', icon: '⏰' },
  crm_stage: { label: 'CRM Stage',  color: '#F59E0B', icon: '🎯' },
}

const STEP_META: Record<StepType, { label: string; icon: string }> = {
  email:       { label: 'Send Email',        icon: '✉️' },
  sms:         { label: 'Send SMS',          icon: '📱' },
  social_post: { label: 'Social Post',       icon: '📣' },
  ai_generate: { label: 'AI Generate',       icon: '🤖' },
  delay:       { label: 'Delay / Wait',      icon: '⏳' },
  condition:   { label: 'Condition Branch',  icon: '🔀' },
}

const STAGES = ['New', 'Attempted Contact', 'Contacted', 'Qualified', 'Follow Up', 'Booked', 'In Consult', 'Closed Won', 'Nurture']

const COMPLIANCE_COLORS: Record<string, string> = {
  approved: '#22C55E',
  draft: '#F59E0B',
  flagged: '#EF4444',
}

const PLATFORM_ICONS: Record<string, string> = {
  facebook: '📘',
  instagram: '📸',
  linkedin: '💼',
  sms: '📱',
  email: '✉️',
  gbp: '📍',
}

function cronToHuman(expr: string): string {
  const m: Record<string, string> = {
    '0 0 * * *': 'Every night at midnight',
    '0 8 * * 1-5': 'Weekdays at 8:00 AM',
    '0 8 * * 1': 'Every Monday at 8:00 AM',
    '*/15 * * * *': 'Every 15 minutes',
    '0 0 * * 0': 'Every Sunday at midnight',
  }
  return m[expr] || expr
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1048576).toFixed(1)} MB`
}

function mimeIcon(mimeType: string): string {
  if (mimeType.startsWith('image/')) return '🖼️'
  if (mimeType.startsWith('video/')) return '🎬'
  if (mimeType === 'application/pdf') return '📄'
  if (mimeType.includes('zip') || mimeType.includes('compressed')) return '🗜️'
  if (mimeType.startsWith('audio/')) return '🎵'
  if (mimeType.includes('word') || mimeType.includes('document')) return '📝'
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return '📊'
  return '📁'
}

const blankWorkflow = (): Workflow => ({
  name: '', description: '', triggerType: 'manual', triggerValue: '',
  category: '', tags: [], isActive: false, steps: [],
})

const blankStep = (order: number): WorkflowStep => ({
  order, type: 'email', label: '', config: {},
})

// ─── Shared styled sub-components ────────────────────────────────────────────
function TriggerPill({ type }: { type: TriggerType }) {
  const m = TRIGGER_META[type]
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 700, background: m.color + '22', color: m.color, border: `1px solid ${m.color}55` }}>
      {m.icon} {m.label}
    </span>
  )
}

function SBtn({ children, onClick, variant = 'primary', disabled = false, small = false }: {
  children: React.ReactNode; onClick?: () => void; variant?: 'primary' | 'ghost' | 'danger'; disabled?: boolean; small?: boolean
}) {
  const bg = variant === 'primary' ? G : variant === 'danger' ? '#EF4444' : 'transparent'
  const col = variant === 'primary' ? NAVY : variant === 'danger' ? '#fff' : MUTED
  const bdr = variant === 'ghost' ? `1px solid ${BORDER}` : 'none'
  return (
    <button onClick={onClick} disabled={disabled} style={{ padding: small ? '5px 12px' : '9px 18px', borderRadius: 8, background: bg, color: col, fontWeight: 700, fontSize: small ? '0.78rem' : '0.88rem', border: bdr, cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1, transition: 'opacity 0.15s' }}>
      {children}
    </button>
  )
}

function CopyBtn({ text, label = 'Copy' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500) })
  }
  return (
    <button onClick={copy} style={{ padding: '3px 10px', borderRadius: 6, background: copied ? '#22C55E22' : SURF2, border: `1px solid ${copied ? '#22C55E' : BORDER}`, color: copied ? '#22C55E' : MUTED, fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
      {copied ? '✓ Copied' : label}
    </button>
  )
}

// ─── Step editor ─────────────────────────────────────────────────────────────
function StepEditor({ step, onChange, onDelete, onMove, isFirst, isLast }: {
  step: WorkflowStep; onChange: (s: WorkflowStep) => void; onDelete: () => void; onMove: (dir: -1 | 1) => void; isFirst: boolean; isLast: boolean
}) {
  const set = (k: string, v: string | number) => onChange({ ...step, config: { ...step.config, [k]: v } })

  return (
    <div style={{ background: NAVY, border: `1px solid ${BORDER}`, borderRadius: 10, padding: '1rem', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <span style={{ color: MUTED, fontSize: '0.75rem', fontWeight: 700, minWidth: 24 }}>#{step.order + 1}</span>
        <select value={step.type} onChange={e => onChange({ ...step, type: e.target.value as StepType, config: {} })} style={{ background: SURF2, border: `1px solid ${BORDER}`, color: INK, borderRadius: 6, padding: '4px 8px', fontSize: '0.82rem', flex: 1 }}>
          {(Object.keys(STEP_META) as StepType[]).map(t => <option key={t} value={t}>{STEP_META[t].icon} {STEP_META[t].label}</option>)}
        </select>
        <input value={step.label} onChange={e => onChange({ ...step, label: e.target.value })} placeholder="Step label…" style={{ flex: 2, background: SURF2, border: `1px solid ${BORDER}`, color: INK, borderRadius: 6, padding: '4px 8px', fontSize: '0.82rem' }} />
        <button onClick={() => onMove(-1)} disabled={isFirst} style={{ background: 'none', border: 'none', color: MUTED, cursor: 'pointer', fontSize: '1rem', opacity: isFirst ? 0.3 : 1 }}>↑</button>
        <button onClick={() => onMove(1)} disabled={isLast} style={{ background: 'none', border: 'none', color: MUTED, cursor: 'pointer', fontSize: '1rem', opacity: isLast ? 0.3 : 1 }}>↓</button>
        <button onClick={onDelete} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', fontSize: '1rem' }}>✕</button>
      </div>

      {step.type === 'email' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <input value={String(step.config.subject ?? '')} onChange={e => set('subject', e.target.value)} placeholder="Email subject…" style={{ background: SURF2, border: `1px solid ${BORDER}`, color: INK, borderRadius: 6, padding: '5px 8px', fontSize: '0.8rem' }} />
          <textarea value={String(step.config.bodyText ?? '')} onChange={e => set('bodyText', e.target.value)} placeholder="Email body… (use {{first_name}}, {{ai_output}} as variables)" rows={3} style={{ background: SURF2, border: `1px solid ${BORDER}`, color: INK, borderRadius: 6, padding: '5px 8px', fontSize: '0.8rem', resize: 'vertical' }} />
        </div>
      )}
      {step.type === 'sms' && (
        <textarea value={String(step.config.body ?? '')} onChange={e => set('body', e.target.value)} placeholder="SMS body… (use {{first_name}} as variable)" rows={2} style={{ background: SURF2, border: `1px solid ${BORDER}`, color: INK, borderRadius: 6, padding: '5px 8px', fontSize: '0.8rem', resize: 'vertical' }} />
      )}
      {step.type === 'social_post' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <select value={String(step.config.platform ?? 'facebook')} onChange={e => set('platform', e.target.value)} style={{ background: SURF2, border: `1px solid ${BORDER}`, color: INK, borderRadius: 6, padding: '5px 8px', fontSize: '0.8rem' }}>
            {['facebook', 'instagram', 'linkedin'].map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <textarea value={String(step.config.caption ?? '')} onChange={e => set('caption', e.target.value)} placeholder="Post caption… (include #TheBeatGoesOn)" rows={3} style={{ background: SURF2, border: `1px solid ${BORDER}`, color: INK, borderRadius: 6, padding: '5px 8px', fontSize: '0.8rem', resize: 'vertical' }} />
        </div>
      )}
      {step.type === 'ai_generate' && (
        <textarea value={String(step.config.prompt ?? '')} onChange={e => set('prompt', e.target.value)} placeholder="AI instruction prompt… Output is stored as {{ai_output}}" rows={3} style={{ background: SURF2, border: `1px solid ${BORDER}`, color: INK, borderRadius: 6, padding: '5px 8px', fontSize: '0.8rem', resize: 'vertical' }} />
      )}
      {step.type === 'delay' && (
        <div style={{ display: 'flex', gap: 8 }}>
          <input type="number" min={1} value={Number(step.config.amount ?? 1)} onChange={e => set('amount', +e.target.value)} style={{ background: SURF2, border: `1px solid ${BORDER}`, color: INK, borderRadius: 6, padding: '5px 8px', fontSize: '0.8rem', width: 80 }} />
          <select value={String(step.config.unit ?? 'hours')} onChange={e => set('unit', e.target.value)} style={{ background: SURF2, border: `1px solid ${BORDER}`, color: INK, borderRadius: 6, padding: '5px 8px', fontSize: '0.8rem' }}>
            {['minutes', 'hours', 'days'].map(u => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>
      )}
      {step.type === 'condition' && (
        <div style={{ display: 'flex', gap: 8 }}>
          <input value={String(step.config.field ?? '')} onChange={e => set('field', e.target.value)} placeholder="field" style={{ background: SURF2, border: `1px solid ${BORDER}`, color: INK, borderRadius: 6, padding: '5px 8px', fontSize: '0.8rem', flex: 1 }} />
          <select value={String(step.config.operator ?? 'eq')} onChange={e => set('operator', e.target.value)} style={{ background: SURF2, border: `1px solid ${BORDER}`, color: INK, borderRadius: 6, padding: '5px 8px', fontSize: '0.8rem' }}>
            {['eq', 'neq', 'gt', 'lt', 'contains'].map(o => <option key={o} value={o}>{o}</option>)}
          </select>
          <input value={String(step.config.value ?? '')} onChange={e => set('value', e.target.value)} placeholder="value" style={{ background: SURF2, border: `1px solid ${BORDER}`, color: INK, borderRadius: 6, padding: '5px 8px', fontSize: '0.8rem', flex: 1 }} />
        </div>
      )}
    </div>
  )
}

// ─── Trigger config panel ─────────────────────────────────────────────────────
function TriggerPanel({ workflow, onChange }: { workflow: Workflow; onChange: (w: Workflow) => void }) {
  const t = workflow.triggerType
  const origin = typeof window !== 'undefined' ? window.location.origin : ''

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
        {(Object.keys(TRIGGER_META) as TriggerType[]).map(tt => {
          const m = TRIGGER_META[tt]
          const active = t === tt
          return (
            <button key={tt} onClick={() => onChange({ ...workflow, triggerType: tt, triggerValue: '' })} style={{ padding: '10px 12px', borderRadius: 8, border: `2px solid ${active ? m.color : BORDER}`, background: active ? m.color + '18' : 'transparent', color: active ? m.color : MUTED, fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>{m.icon}</span> {m.label}
            </button>
          )
        })}
      </div>

      {t === 'manual' && (
        <p style={{ color: MUTED, fontSize: '0.82rem', margin: 0 }}>This workflow is triggered manually from the dashboard or via the Run Now button.</p>
      )}
      {t === 'webhook' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label style={{ color: MUTED, fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase' }}>Webhook Key</label>
          <input value={workflow.triggerValue} onChange={e => onChange({ ...workflow, triggerValue: e.target.value })} placeholder="e.g. fillout_form, contact_form, booking" style={{ background: NAVY, border: `1px solid ${BORDER}`, color: INK, borderRadius: 6, padding: '7px 10px', fontSize: '0.85rem' }} />
          <div style={{ background: NAVY, borderRadius: 8, padding: '10px 12px', border: `1px solid ${BORDER}`, fontFamily: 'monospace', fontSize: '0.75rem', color: MUTED, wordBreak: 'break-all' }}>
            POST {origin}/api/webhooks/booking?key={workflow.triggerValue || 'your-key'}
          </div>
        </div>
      )}
      {t === 'cron' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label style={{ color: MUTED, fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase' }}>Cron Expression</label>
          <input value={workflow.triggerValue} onChange={e => onChange({ ...workflow, triggerValue: e.target.value })} placeholder="0 8 * * 1-5" style={{ background: NAVY, border: `1px solid ${BORDER}`, color: INK, borderRadius: 6, padding: '7px 10px', fontSize: '0.85rem', fontFamily: 'monospace' }} />
          {workflow.triggerValue && <div style={{ color: G, fontSize: '0.8rem' }}>📅 {cronToHuman(workflow.triggerValue)}</div>}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {['0 0 * * *', '0 8 * * 1-5', '0 8 * * 1', '*/15 * * * *'].map(expr => (
              <button key={expr} onClick={() => onChange({ ...workflow, triggerValue: expr })} style={{ padding: '3px 10px', borderRadius: 20, background: SURF2, border: `1px solid ${BORDER}`, color: MUTED, fontSize: '0.72rem', cursor: 'pointer', fontFamily: 'monospace' }}>{expr}</button>
            ))}
          </div>
        </div>
      )}
      {t === 'crm_stage' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label style={{ color: MUTED, fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase' }}>CRM Stage</label>
          <select value={workflow.triggerValue} onChange={e => onChange({ ...workflow, triggerValue: e.target.value })} style={{ background: NAVY, border: `1px solid ${BORDER}`, color: INK, borderRadius: 6, padding: '7px 10px', fontSize: '0.85rem' }}>
            <option value="">Select stage…</option>
            {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          {workflow.triggerValue && <div style={{ color: G, fontSize: '0.8rem' }}>🎯 Fires when a contact enters <strong>{workflow.triggerValue}</strong></div>}
        </div>
      )}
    </div>
  )
}

// ─── Campaign output block ────────────────────────────────────────────────────
function CampaignBlock({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div style={{ background: SURF, border: `1px solid ${BORDER}`, borderRadius: 12, padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ color: G, fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{icon} {title}</div>
      {children}
    </div>
  )
}

function CopyField({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: MUTED, fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase' }}>{label}</span>
        <CopyBtn text={value} />
      </div>
      <div style={{ background: NAVY, border: `1px solid ${BORDER}`, borderRadius: 8, padding: '10px 12px', fontSize: '0.83rem', color: INK, lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{value}</div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function MarketingCommandCenter() {
  const [tab, setTab] = useState<TabType>('builder')

  // ── Workflow state ──────────────────────────────────────────────────────────
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [selected, setSelected] = useState<Workflow | null>(null)
  const [saving, setSaving] = useState(false)
  const [executing, setExecuting] = useState<string | null>(null)

  // ── Campaign generator state ────────────────────────────────────────────────
  const [campaignPrompt, setCampaignPrompt] = useState('')
  const [campaignChannels, setCampaignChannels] = useState<string[]>(['email', 'sms', 'facebook'])
  const [campaignTone, setCampaignTone] = useState<string>('warm')
  const [campaignAudience, setCampaignAudience] = useState('families and homeowners')
  const [includeVisualBrief, setIncludeVisualBrief] = useState(true)
  const [campaignResult, setCampaignResult] = useState<Record<string, any> | null>(null)
  const [campaignLoading, setCampaignLoading] = useState(false)

  // ── Template gallery state ──────────────────────────────────────────────────
  const [templates, setTemplates] = useState<SocialTemplate[]>([])
  const [templatesLoading, setTemplatesLoading] = useState(false)
  const [tplPlatform, setTplPlatform] = useState('')
  const [tplCategory, setTplCategory] = useState('')
  const [showNewTpl, setShowNewTpl] = useState(false)
  const [newTpl, setNewTpl] = useState<Record<string, string>>({ title: '', category: '', platform: '', body: '', cta: '', hashtags: '' })
  const [savingTpl, setSavingTpl] = useState(false)

  // ── Asset manager state ─────────────────────────────────────────────────────
  const [assets, setAssets] = useState<UploadedAsset[]>([])
  const [assetsLoading, setAssetsLoading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [cloudUrl, setCloudUrl] = useState('')
  const [cloudFileName, setCloudFileName] = useState('')
  const [cloudMimeType, setCloudMimeType] = useState('')
  const [uploadingCloud, setUploadingCloud] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // ── Toast ───────────────────────────────────────────────────────────────────
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)
  const showToast = (msg: string, ok = true) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 3500) }

  // ── Loaders ─────────────────────────────────────────────────────────────────
  const loadWorkflows = useCallback(async () => {
    try {
      const res = await fetch('/api/marketing/workflows')
      if (res.ok) { const d = await res.json(); setWorkflows(d.workflows ?? []) }
    } catch { /* db may be offline */ }
  }, [])

  const loadTemplates = useCallback(async () => {
    setTemplatesLoading(true)
    try {
      const p = new URLSearchParams()
      if (tplPlatform) p.set('platform', tplPlatform)
      if (tplCategory) p.set('category', tplCategory)
      const res = await fetch(`/api/marketing/templates?${p}`)
      if (res.ok) { const d = await res.json(); setTemplates(d.templates ?? []) }
    } catch { /* ignore */ }
    setTemplatesLoading(false)
  }, [tplPlatform, tplCategory])

  const loadAssets = useCallback(async () => {
    setAssetsLoading(true)
    try {
      const res = await fetch('/api/marketing/assets')
      if (res.ok) { const d = await res.json(); setAssets(d.assets ?? []) }
    } catch { /* ignore */ }
    setAssetsLoading(false)
  }, [])

  useEffect(() => { loadWorkflows() }, [loadWorkflows])
  useEffect(() => { if (tab === 'templates') loadTemplates() }, [tab, loadTemplates])
  useEffect(() => { if (tab === 'assets') loadAssets() }, [tab, loadAssets])

  // ── Workflow handlers ────────────────────────────────────────────────────────
  const save = async () => {
    if (!selected) return
    setSaving(true)
    try {
      const isNew = !selected.id
      const url = isNew ? '/api/marketing/workflows' : `/api/marketing/workflows/${selected.id}`
      const res = await fetch(url, { method: isNew ? 'POST' : 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(selected) })
      const data = await res.json()
      if (data.ok) { showToast(isNew ? 'Workflow created!' : 'Saved!'); await loadWorkflows(); setSelected(data.workflow) }
      else showToast('Save failed', false)
    } catch { showToast('Network error', false) }
    setSaving(false)
  }

  const runNow = async (id: string) => {
    setExecuting(id)
    try {
      const res = await fetch(`/api/marketing/workflows/${id}/execute`, { method: 'POST' })
      const data = await res.json()
      if (data.ok) showToast(`▶ Executed ${data.results?.length ?? 0} steps`)
      else showToast('Execution failed', false)
    } catch { showToast('Network error', false) }
    setExecuting(null)
  }

  const deleteWf = async (id: string) => {
    if (!confirm('Delete this workflow?')) return
    await fetch(`/api/marketing/workflows/${id}`, { method: 'DELETE' })
    setSelected(null); await loadWorkflows(); showToast('Deleted')
  }

  const toggleActive = async (wf: Workflow) => {
    if (!wf.id) return
    const res = await fetch(`/api/marketing/workflows/${wf.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isActive: !wf.isActive }) })
    if (res.ok) { await loadWorkflows(); if (selected?.id === wf.id) setSelected({ ...selected, isActive: !wf.isActive }) }
  }

  const addStep = () => { if (!selected) return; setSelected({ ...selected, steps: [...selected.steps, blankStep(selected.steps.length)] }) }
  const updateStep = (i: number, s: WorkflowStep) => { if (!selected) return; const steps = [...selected.steps]; steps[i] = s; setSelected({ ...selected, steps }) }
  const deleteStep = (i: number) => { if (!selected) return; setSelected({ ...selected, steps: selected.steps.filter((_, idx) => idx !== i).map((s, idx) => ({ ...s, order: idx })) }) }
  const moveStep = (i: number, dir: -1 | 1) => {
    if (!selected) return
    const steps = [...selected.steps]; const j = i + dir
    if (j < 0 || j >= steps.length) return
    ;[steps[i], steps[j]] = [steps[j], steps[i]]
    setSelected({ ...selected, steps: steps.map((s, idx) => ({ ...s, order: idx })) })
  }

  // ── Campaign generator handler ───────────────────────────────────────────────
  const generateCampaign = async () => {
    if (!campaignPrompt.trim() || campaignChannels.length === 0) return
    setCampaignLoading(true)
    setCampaignResult(null)
    try {
      const res = await fetch('/api/marketing/campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: campaignPrompt, channels: campaignChannels, tone: campaignTone, audience: campaignAudience, includeVisualBrief }),
      })
      const data = await res.json()
      if (data.ok) { setCampaignResult(data.campaign); showToast('Campaign generated!') }
      else showToast(String((data.error as { formErrors?: string[] })?.formErrors?.[0] ?? 'Generation failed — check AI key'), false)
    } catch { showToast('Network error', false) }
    setCampaignLoading(false)
  }

  const toggleChannel = (ch: string) => {
    setCampaignChannels(prev => prev.includes(ch) ? prev.filter(c => c !== ch) : [...prev, ch])
  }

  // ── Template handlers ────────────────────────────────────────────────────────
  const saveTemplate = async () => {
    if (!newTpl.title || !newTpl.category || !newTpl.body) return
    setSavingTpl(true)
    try {
      const res = await fetch('/api/marketing/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTpl.title,
          category: newTpl.category,
          platform: newTpl.platform || null,
          body: newTpl.body,
          cta: newTpl.cta || null,
          hashtags: newTpl.hashtags ? newTpl.hashtags.split(',').map(h => h.trim().replace(/^#/, '')) : [],
          complianceStatus: 'draft',
        }),
      })
      const data = await res.json()
      if (data.ok) { showToast('Template saved!'); setShowNewTpl(false); setNewTpl({ title: '', category: '', platform: '', body: '', cta: '', hashtags: '' }); loadTemplates() }
      else showToast('Save failed', false)
    } catch { showToast('Network error', false) }
    setSavingTpl(false)
  }

  // ── Asset handlers ───────────────────────────────────────────────────────────
  const uploadFile = async (file: File) => {
    const fd = new FormData()
    fd.append('file', file)
    fd.append('source', 'local')
    showToast(`Uploading ${file.name}…`)
    try {
      const res = await fetch('/api/marketing/assets', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.ok) { showToast(`Uploaded ${file.name}`); loadAssets() }
      else showToast('Upload failed', false)
    } catch { showToast('Network error', false) }
  }

  const importCloudUrl = async () => {
    if (!cloudUrl || !cloudFileName || !cloudMimeType) return
    setUploadingCloud(true)
    try {
      const res = await fetch('/api/marketing/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: cloudFileName, mimeType: cloudMimeType, storageUrl: cloudUrl, source: 'cloud' }),
      })
      const data = await res.json()
      if (data.ok) { showToast('Cloud asset imported!'); setCloudUrl(''); setCloudFileName(''); setCloudMimeType(''); loadAssets() }
      else showToast('Import failed', false)
    } catch { showToast('Network error', false) }
    setUploadingCloud(false)
  }

  const deleteAsset = async (id: string) => {
    if (!confirm('Delete this asset?')) return
    try {
      const res = await fetch(`/api/marketing/assets?id=${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.ok) { showToast('Deleted'); loadAssets() }
      else showToast('Delete failed', false)
    } catch { showToast('Network error', false) }
  }

  // ── Shared style vars ────────────────────────────────────────────────────────
  const savedWorkflows = workflows.filter(w => !w.isPreset)
  const h2 = { margin: '0 0 1rem', fontSize: '1rem', fontWeight: 800, color: G, textTransform: 'uppercase' as const, letterSpacing: '0.06em' }
  const sectionCard = { background: SURF, border: `1px solid ${BORDER}`, borderRadius: 12, padding: '1.25rem' }
  const inputStyle = { background: NAVY, border: `1px solid ${BORDER}`, color: INK, borderRadius: 8, padding: '9px 12px', fontSize: '0.88rem', width: '100%' }
  const selectStyle = { background: NAVY, border: `1px solid ${BORDER}`, color: INK, borderRadius: 8, padding: '9px 12px', fontSize: '0.88rem' }
  const TABS: { key: TabType; label: string }[] = [
    { key: 'builder', label: '⚙️ Workflows' },
    { key: 'campaigns', label: '📊 Dashboard' },
    { key: 'campaign', label: '🚀 AI Campaign' },
    { key: 'templates', label: '🖼️ Templates' },
    { key: 'assets', label: '📁 Assets' },
    { key: 'calculator', label: '🧮 Quote Calc' },
  ]

  return (
    <div style={{ background: NAVY, minHeight: '100vh', color: INK, fontFamily: 'system-ui, -apple-system, sans-serif' }}>

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999, background: toast.ok ? G : '#EF4444', color: toast.ok ? NAVY : '#fff', padding: '12px 20px', borderRadius: 10, fontWeight: 700, fontSize: '0.9rem', boxShadow: '0 4px 24px #0008', maxWidth: 320 }}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{ background: SURF, borderBottom: `1px solid ${BORDER}`, padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, background: G, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>⚡</div>
          <div>
            <div style={{ fontSize: '1.1rem', fontWeight: 900, color: INK }}>Marketing Command Center</div>
            <div style={{ fontSize: '0.75rem', color: MUTED }}>Latimore Life & Legacy · #TheBeatGoesOn</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{ padding: '7px 14px', borderRadius: 8, border: `1px solid ${tab === t.key ? G : BORDER}`, background: tab === t.key ? G + '18' : 'transparent', color: tab === t.key ? G : MUTED, fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer', whiteSpace: 'nowrap' }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Workflow Builder Tab ── */}
      {tab === 'builder' && (
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', minHeight: 'calc(100vh - 73px)' }}>
          <div style={{ background: SURF, borderRight: `1px solid ${BORDER}`, padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: 20, overflowY: 'auto' }}>
            <div>
              <h2 style={h2}>Built-In Presets</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {PRESETS.map((p, i) => {
                  const isSelected = selected?.name === p.name && !selected?.id
                  return (
                    <button key={i} onClick={() => setSelected({ ...p })} style={{ background: isSelected ? G + '18' : NAVY, border: `1px solid ${isSelected ? G : BORDER}`, borderRadius: 10, padding: '10px 12px', textAlign: 'left', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <div style={{ color: INK, fontWeight: 700, fontSize: '0.85rem' }}>{p.name}</div>
                      <TriggerPill type={p.triggerType} />
                      <div style={{ color: MUTED, fontSize: '0.75rem', lineHeight: 1.4 }}>{p.description.slice(0, 80)}…</div>
                    </button>
                  )
                })}
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <h2 style={{ ...h2, margin: 0 }}>My Workflows</h2>
                <SBtn small onClick={() => setSelected(blankWorkflow())}>+ New</SBtn>
              </div>
              {savedWorkflows.length === 0
                ? <p style={{ color: MUTED, fontSize: '0.8rem' }}>No saved workflows yet. Select a preset or click + New.</p>
                : savedWorkflows.map(wf => (
                  <button key={wf.id} onClick={() => setSelected(wf)} style={{ width: '100%', background: selected?.id === wf.id ? G + '18' : NAVY, border: `1px solid ${selected?.id === wf.id ? G : BORDER}`, borderRadius: 10, padding: '10px 12px', textAlign: 'left', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: INK, fontWeight: 700, fontSize: '0.85rem' }}>{wf.name}</span>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: wf.isActive ? '#22C55E' : '#6B7280', flexShrink: 0 }} />
                    </div>
                    <TriggerPill type={wf.triggerType} />
                    <div style={{ color: MUTED, fontSize: '0.72rem' }}>Runs: {wf.runCount ?? 0} · {wf.lastRunAt ? new Date(wf.lastRunAt).toLocaleDateString() : 'Never run'}</div>
                  </button>
                ))
              }
            </div>
          </div>

          <div style={{ padding: '1.5rem', overflowY: 'auto' }}>
            {!selected ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, gap: 16 }}>
                <div style={{ fontSize: 48 }}>⚡</div>
                <h2 style={{ margin: 0, color: INK, fontSize: '1.3rem', fontWeight: 800 }}>Select a template or create a new workflow</h2>
                <p style={{ color: MUTED, maxWidth: 400, textAlign: 'center' }}>Choose from the 4 built-in presets on the left, or click <strong>+ New</strong> to build from scratch.</p>
                <SBtn onClick={() => setSelected(blankWorkflow())}>+ Create Workflow</SBtn>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 780 }}>
                <div style={sectionCard}>
                  <h2 style={h2}>Workflow Details</h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <input value={selected.name} onChange={e => setSelected({ ...selected, name: e.target.value })} placeholder="Workflow name…" style={{ background: NAVY, border: `1px solid ${BORDER}`, color: INK, borderRadius: 8, padding: '9px 12px', fontSize: '1rem', fontWeight: 700 }} />
                    <textarea value={selected.description} onChange={e => setSelected({ ...selected, description: e.target.value })} placeholder="What does this workflow do?" rows={2} style={{ background: NAVY, border: `1px solid ${BORDER}`, color: INK, borderRadius: 8, padding: '9px 12px', fontSize: '0.88rem', resize: 'vertical' }} />
                    <div style={{ display: 'flex', gap: 10 }}>
                      <input value={selected.category} onChange={e => setSelected({ ...selected, category: e.target.value })} placeholder="Category (e.g. Lead Gen, Ops)" style={{ flex: 1, background: NAVY, border: `1px solid ${BORDER}`, color: INK, borderRadius: 8, padding: '7px 10px', fontSize: '0.85rem' }} />
                      <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: MUTED, fontSize: '0.85rem', cursor: 'pointer' }}>
                        <input type="checkbox" checked={selected.isActive} onChange={e => setSelected({ ...selected, isActive: e.target.checked })} style={{ accentColor: G }} />
                        Active
                      </label>
                    </div>
                  </div>
                </div>

                <div style={sectionCard}>
                  <h2 style={h2}>⚡ Trigger Configuration</h2>
                  <TriggerPanel workflow={selected} onChange={setSelected} />
                </div>

                <div style={sectionCard}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h2 style={{ ...h2, margin: 0 }}>📋 Steps ({selected.steps.length})</h2>
                    <SBtn small onClick={addStep}>+ Add Step</SBtn>
                  </div>
                  {selected.steps.length === 0
                    ? <p style={{ color: MUTED, fontSize: '0.85rem' }}>No steps yet. Click + Add Step to build the workflow actions.</p>
                    : selected.steps.map((s, i) => (
                      <div key={i} style={{ marginBottom: 10 }}>
                        <StepEditor step={s} onChange={ns => updateStep(i, ns)} onDelete={() => deleteStep(i)} onMove={dir => moveStep(i, dir)} isFirst={i === 0} isLast={i === selected.steps.length - 1} />
                      </div>
                    ))
                  }
                </div>

                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <SBtn onClick={save} disabled={saving || !selected.name}>{saving ? 'Saving…' : selected.id ? '💾 Save Changes' : '💾 Save Workflow'}</SBtn>
                  {selected.id && (
                    <>
                      <SBtn variant="ghost" onClick={() => toggleActive(selected)}>{selected.isActive ? '⏸ Deactivate' : '▶ Activate'}</SBtn>
                      {selected.triggerType === 'manual' && (
                        <SBtn variant="ghost" onClick={() => selected.id && runNow(selected.id)} disabled={executing === selected.id}>{executing === selected.id ? 'Running…' : '▶ Run Now'}</SBtn>
                      )}
                      <SBtn variant="danger" onClick={() => selected.id && deleteWf(selected.id)}>Delete</SBtn>
                    </>
                  )}
                  {selected.isPreset && !selected.id && (
                    <p style={{ color: MUTED, fontSize: '0.8rem', margin: 'auto 0' }}>Save this preset to activate it or customize the steps.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Active Campaigns / Dashboard Tab ── */}
      {tab === 'campaigns' && (
        <div style={{ padding: '1.5rem', maxWidth: 1100, margin: '0 auto' }}>
          <h2 style={{ ...h2, fontSize: '1.2rem' }}>📊 Workflow Dashboard</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 24 }}>
            {[
              { label: 'Total Workflows', value: workflows.length, icon: '⚙️' },
              { label: 'Active', value: workflows.filter(w => w.isActive).length, icon: '🟢' },
              { label: 'Total Runs', value: workflows.reduce((a, w) => a + (w.runCount ?? 0), 0), icon: '▶️' },
              { label: 'Presets Available', value: PRESETS.length, icon: '📦' },
            ].map(stat => (
              <div key={stat.label} style={{ background: SURF2, border: `1px solid ${BORDER}`, borderRadius: 12, padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ fontSize: '1.5rem' }}>{stat.icon}</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 900, color: G }}>{stat.value}</div>
                <div style={{ color: MUTED, fontSize: '0.8rem' }}>{stat.label}</div>
              </div>
            ))}
          </div>
          <div style={{ background: SURF, border: `1px solid ${BORDER}`, borderRadius: 14, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
                  {['Workflow', 'Trigger', 'Status', 'Steps', 'Runs', 'Last Run', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: MUTED, fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {workflows.length === 0 && (
                  <tr><td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: MUTED }}>No saved workflows yet. Go to the Workflows tab to create one.</td></tr>
                )}
                {workflows.map(wf => (
                  <tr key={wf.id} style={{ borderBottom: `1px solid ${BORDER}20` }}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 700, color: INK, fontSize: '0.88rem' }}>{wf.name}</div>
                      {wf.category && <div style={{ color: MUTED, fontSize: '0.75rem' }}>{wf.category}</div>}
                    </td>
                    <td style={{ padding: '12px 16px' }}><TriggerPill type={wf.triggerType} /></td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '0.8rem', fontWeight: 600, color: wf.isActive ? '#22C55E' : MUTED }}>
                        <span style={{ width: 7, height: 7, borderRadius: '50%', background: wf.isActive ? '#22C55E' : '#6B7280' }} />
                        {wf.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', color: MUTED, fontSize: '0.85rem' }}>{(wf.steps as WorkflowStep[]).length}</td>
                    <td style={{ padding: '12px 16px', color: G, fontWeight: 700 }}>{wf.runCount ?? 0}</td>
                    <td style={{ padding: '12px 16px', color: MUTED, fontSize: '0.8rem' }}>{wf.lastRunAt ? new Date(wf.lastRunAt).toLocaleDateString() : '—'}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <SBtn small variant="ghost" onClick={() => { setSelected(wf); setTab('builder') }}>Edit</SBtn>
                        {wf.triggerType === 'manual' && <SBtn small onClick={() => wf.id && runNow(wf.id)} disabled={executing === wf.id}>{executing === wf.id ? '…' : '▶'}</SBtn>}
                        <SBtn small variant="ghost" onClick={() => toggleActive(wf)}>{wf.isActive ? '⏸' : '▶'}</SBtn>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── AI Campaign Generator Tab ── */}
      {tab === 'campaign' && (
        <div style={{ padding: '1.5rem', maxWidth: 1000, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div>
            <h2 style={{ ...h2, fontSize: '1.2rem', marginBottom: '0.25rem' }}>🚀 AI Campaign Generator</h2>
            <p style={{ color: MUTED, fontSize: '0.85rem', margin: 0 }}>Describe your campaign goal and get fully written content for every channel — instantly.</p>
          </div>

          {/* Input form */}
          <div style={{ ...sectionCard, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ color: MUTED, fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase' }}>Campaign Prompt</label>
              <textarea
                value={campaignPrompt}
                onChange={e => setCampaignPrompt(e.target.value)}
                placeholder="Describe your campaign… e.g. 'Final expense awareness campaign targeting pre-retirees aged 55–70 in the Lancaster PA area. Focus on peace of mind and family protection.'"
                rows={4}
                style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ color: MUTED, fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase' }}>Channels</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {['email', 'sms', 'facebook', 'instagram', 'linkedin'].map(ch => {
                    const active = campaignChannels.includes(ch)
                    return (
                      <button key={ch} onClick={() => toggleChannel(ch)} style={{ padding: '6px 14px', borderRadius: 20, border: `1px solid ${active ? G : BORDER}`, background: active ? G + '18' : 'transparent', color: active ? G : MUTED, fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer' }}>
                        {PLATFORM_ICONS[ch]} {ch}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ color: MUTED, fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase' }}>Brand Tone</label>
                <select value={campaignTone} onChange={e => setCampaignTone(e.target.value)} style={selectStyle}>
                  <option value="warm">Warm & Community-Focused</option>
                  <option value="professional">Professional & Authoritative</option>
                  <option value="urgent">Urgent (Never Fear-Based)</option>
                  <option value="educational">Educational & Clear</option>
                  <option value="community">Local Community Authority</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 12, alignItems: 'flex-end' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ color: MUTED, fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase' }}>Target Audience</label>
                <input value={campaignAudience} onChange={e => setCampaignAudience(e.target.value)} placeholder="e.g. families and homeowners in Lancaster PA" style={inputStyle} />
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: MUTED, fontSize: '0.83rem', cursor: 'pointer', paddingBottom: 9 }}>
                <input type="checkbox" checked={includeVisualBrief} onChange={e => setIncludeVisualBrief(e.target.checked)} style={{ accentColor: G, width: 16, height: 16 }} />
                Visual Brief
              </label>
            </div>

            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <SBtn onClick={generateCampaign} disabled={campaignLoading || !campaignPrompt.trim() || campaignChannels.length === 0}>
                {campaignLoading ? '⏳ Generating…' : '🚀 Generate Campaign'}
              </SBtn>
              {campaignResult && <SBtn variant="ghost" onClick={() => setCampaignResult(null)}>Clear Results</SBtn>}
              <span style={{ color: MUTED, fontSize: '0.78rem' }}>{campaignChannels.length} channel{campaignChannels.length !== 1 ? 's' : ''} selected</span>
            </div>
          </div>

          {/* Results */}
          {campaignResult && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ color: G, fontWeight: 800, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Generated Campaign</div>

              {/* Email */}
              {campaignResult.email ? (() => {
                const e = campaignResult.email as { subjectLines: string[]; preheader: string; bodyHtml: string; cta: string }
                return (
                  <CampaignBlock title="Email" icon="✉️">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <span style={{ color: MUTED, fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase' }}>A/B Subject Lines</span>
                      {e.subjectLines?.map((s, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: NAVY, border: `1px solid ${BORDER}`, borderRadius: 8, padding: '8px 12px' }}>
                          <span style={{ fontSize: '0.83rem', color: INK }}>Option {i + 1}: {s}</span>
                          <CopyBtn text={s} />
                        </div>
                      ))}
                    </div>
                    {e.preheader && <CopyField label="Preheader" value={e.preheader} />}
                    {e.bodyHtml && <CopyField label="Body" value={e.bodyHtml} />}
                    {e.cta && <CopyField label="CTA" value={e.cta} />}
                  </CampaignBlock>
                )
              })() : null}

              {/* SMS */}
              {campaignResult.sms ? (() => {
                const s = campaignResult.sms as { message: string; followUp: string }
                return (
                  <CampaignBlock title="SMS" icon="📱">
                    {s.message && <CopyField label="Primary Message" value={s.message} />}
                    {s.followUp && <CopyField label="24h Follow-Up" value={s.followUp} />}
                  </CampaignBlock>
                )
              })() : null}

              {/* Facebook */}
              {campaignResult.facebook ? (() => {
                const f = campaignResult.facebook as { caption: string; hashtags: string[]; postType: string }
                return (
                  <CampaignBlock title="Facebook" icon="📘">
                    {f.caption && <CopyField label={`${f.postType ?? 'Feed'} Caption`} value={f.caption} />}
                    {f.hashtags?.length > 0 && <CopyField label="Hashtags" value={f.hashtags.map((h: string) => `#${h.replace(/^#/, '')}`).join(' ')} />}
                  </CampaignBlock>
                )
              })() : null}

              {/* Instagram */}
              {campaignResult.instagram ? (() => {
                const ig = campaignResult.instagram as { caption: string; hashtags: string[]; postType: string }
                return (
                  <CampaignBlock title="Instagram" icon="📸">
                    {ig.caption && <CopyField label={`${ig.postType ?? 'Feed'} Caption`} value={ig.caption} />}
                    {ig.hashtags?.length > 0 && <CopyField label="Hashtags" value={ig.hashtags.map((h: string) => `#${h.replace(/^#/, '')}`).join(' ')} />}
                  </CampaignBlock>
                )
              })() : null}

              {/* LinkedIn */}
              {campaignResult.linkedin ? (() => {
                const li = campaignResult.linkedin as { post: string; articleHook: string }
                return (
                  <CampaignBlock title="LinkedIn" icon="💼">
                    {li.post && <CopyField label="Post" value={li.post} />}
                    {li.articleHook && <CopyField label="Article Hook" value={li.articleHook} />}
                  </CampaignBlock>
                )
              })() : null}

              {/* Visual Brief */}
              {campaignResult.visualBrief ? (() => {
                const vb = campaignResult.visualBrief as { canvaSpec: string; colorNotes: string; imagePrompt: string }
                return (
                  <CampaignBlock title="Visual Brief (Canva)" icon="🎨">
                    {vb.canvaSpec && <CopyField label="Canva Spec" value={vb.canvaSpec} />}
                    {vb.colorNotes && <CopyField label="Color Notes" value={vb.colorNotes} />}
                    {vb.imagePrompt && <CopyField label="AI Image Prompt" value={vb.imagePrompt} />}
                  </CampaignBlock>
                )
              })() : null}

              {/* Schedule */}
              {campaignResult.scheduleSuggestion ? (() => {
                const sc = campaignResult.scheduleSuggestion as { email: string; sms: string; social: string; reasoning: string }
                return (
                  <CampaignBlock title="Optimal Schedule" icon="📅">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
                      {[['Email', sc.email], ['SMS', sc.sms], ['Social', sc.social]].map(([label, val]) => val && (
                        <div key={label} style={{ background: NAVY, border: `1px solid ${BORDER}`, borderRadius: 8, padding: '10px 12px' }}>
                          <div style={{ color: MUTED, fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>{label}</div>
                          <div style={{ color: INK, fontSize: '0.83rem' }}>{val}</div>
                        </div>
                      ))}
                    </div>
                    {sc.reasoning && <CopyField label="Reasoning" value={sc.reasoning} />}
                  </CampaignBlock>
                )
              })() : null}
            </div>
          )}
        </div>
      )}

      {/* ── Template Gallery Tab ── */}
      {tab === 'templates' && (
        <div style={{ padding: '1.5rem', maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h2 style={{ ...h2, fontSize: '1.2rem', marginBottom: '0.25rem' }}>🖼️ Template Gallery</h2>
              <p style={{ color: MUTED, fontSize: '0.85rem', margin: 0 }}>{templates.length} templates · Click any card to copy the body text</p>
            </div>
            <SBtn onClick={() => setShowNewTpl(!showNewTpl)}>{showNewTpl ? 'Cancel' : '+ New Template'}</SBtn>
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <select value={tplPlatform} onChange={e => setTplPlatform(e.target.value)} style={{ ...selectStyle, fontSize: '0.82rem', padding: '7px 12px' }}>
              <option value="">All Platforms</option>
              {['facebook', 'instagram', 'linkedin', 'email', 'sms', 'gbp'].map(p => <option key={p} value={p}>{PLATFORM_ICONS[p]} {p}</option>)}
            </select>
            <select value={tplCategory} onChange={e => setTplCategory(e.target.value)} style={{ ...selectStyle, fontSize: '0.82rem', padding: '7px 12px' }}>
              <option value="">All Categories</option>
              {['Life Insurance', 'Final Expense', 'Mortgage Protection', 'IUL', 'Annuity', 'Community', 'Key Person'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <button onClick={loadTemplates} style={{ padding: '7px 14px', borderRadius: 8, background: 'transparent', border: `1px solid ${BORDER}`, color: MUTED, fontSize: '0.82rem', cursor: 'pointer' }}>
              {templatesLoading ? '⏳' : '↺ Refresh'}
            </button>
          </div>

          {/* New template form */}
          {showNewTpl && (
            <div style={{ ...sectionCard, display: 'flex', flexDirection: 'column', gap: 12, border: `1px solid ${G}44` }}>
              <h3 style={{ margin: 0, color: G, fontSize: '0.9rem', fontWeight: 800, textTransform: 'uppercase' }}>New Template</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                <input value={newTpl.title} onChange={e => setNewTpl({ ...newTpl, title: e.target.value })} placeholder="Title *" style={{ background: NAVY, border: `1px solid ${BORDER}`, color: INK, borderRadius: 6, padding: '7px 10px', fontSize: '0.83rem' }} />
                <input value={newTpl.category} onChange={e => setNewTpl({ ...newTpl, category: e.target.value })} placeholder="Category * (e.g. Life Insurance)" style={{ background: NAVY, border: `1px solid ${BORDER}`, color: INK, borderRadius: 6, padding: '7px 10px', fontSize: '0.83rem' }} />
                <select value={newTpl.platform} onChange={e => setNewTpl({ ...newTpl, platform: e.target.value })} style={{ background: NAVY, border: `1px solid ${BORDER}`, color: newTpl.platform ? INK : MUTED, borderRadius: 6, padding: '7px 10px', fontSize: '0.83rem' }}>
                  <option value="">Platform (optional)</option>
                  {['facebook', 'instagram', 'linkedin', 'email', 'sms', 'gbp'].map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <textarea value={newTpl.body} onChange={e => setNewTpl({ ...newTpl, body: e.target.value })} placeholder="Template body * (use {{first_name}} for personalization)" rows={5} style={{ background: NAVY, border: `1px solid ${BORDER}`, color: INK, borderRadius: 6, padding: '8px 10px', fontSize: '0.83rem', resize: 'vertical' }} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <input value={newTpl.cta} onChange={e => setNewTpl({ ...newTpl, cta: e.target.value })} placeholder="CTA (e.g. DM 'PROTECT')" style={{ background: NAVY, border: `1px solid ${BORDER}`, color: INK, borderRadius: 6, padding: '7px 10px', fontSize: '0.83rem' }} />
                <input value={newTpl.hashtags} onChange={e => setNewTpl({ ...newTpl, hashtags: e.target.value })} placeholder="Hashtags (comma-separated, without #)" style={{ background: NAVY, border: `1px solid ${BORDER}`, color: INK, borderRadius: 6, padding: '7px 10px', fontSize: '0.83rem' }} />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <SBtn onClick={saveTemplate} disabled={savingTpl || !newTpl.title || !newTpl.category || !newTpl.body}>{savingTpl ? 'Saving…' : '💾 Save Template'}</SBtn>
              </div>
            </div>
          )}

          {/* Template grid */}
          {templatesLoading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: MUTED }}>Loading templates…</div>
          ) : templates.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: MUTED }}>No templates found. Click Refresh to seed the starter gallery.</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
              {templates.map(tpl => (
                <div key={tpl.id} style={{ background: SURF, border: `1px solid ${BORDER}`, borderRadius: 12, padding: '1.1rem', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                    <div style={{ fontWeight: 800, color: INK, fontSize: '0.9rem', lineHeight: 1.3 }}>{tpl.title}</div>
                    <span style={{ padding: '2px 8px', borderRadius: 10, fontSize: '0.68rem', fontWeight: 700, background: COMPLIANCE_COLORS[tpl.complianceStatus] + '22', color: COMPLIANCE_COLORS[tpl.complianceStatus], flexShrink: 0 }}>
                      {tpl.complianceStatus}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {tpl.platform && (
                      <span style={{ padding: '2px 10px', borderRadius: 12, background: '#3B82F622', color: '#60A5FA', fontSize: '0.72rem', fontWeight: 700 }}>
                        {PLATFORM_ICONS[tpl.platform] ?? '📢'} {tpl.platform}
                      </span>
                    )}
                    <span style={{ padding: '2px 10px', borderRadius: 12, background: G + '18', color: G, fontSize: '0.72rem', fontWeight: 700 }}>{tpl.category}</span>
                    {tpl.audienceTrack && <span style={{ padding: '2px 10px', borderRadius: 12, background: SURF2, color: MUTED, fontSize: '0.72rem' }}>{tpl.audienceTrack}</span>}
                  </div>

                  <div style={{ background: NAVY, borderRadius: 8, padding: '10px 12px', fontSize: '0.8rem', color: MUTED, lineHeight: 1.6, maxHeight: 100, overflow: 'hidden', position: 'relative' }}>
                    {tpl.body.slice(0, 220)}{tpl.body.length > 220 ? '…' : ''}
                  </div>

                  {tpl.cta && (
                    <div style={{ fontSize: '0.78rem', color: G, fontStyle: 'italic' }}>CTA: {tpl.cta}</div>
                  )}

                  {tpl.hashtags?.length > 0 && (
                    <div style={{ fontSize: '0.72rem', color: MUTED, lineHeight: 1.6 }}>
                      {tpl.hashtags.slice(0, 5).map(h => `#${h.replace(/^#/, '')}`).join(' ')}{tpl.hashtags.length > 5 ? ` +${tpl.hashtags.length - 5}` : ''}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 6, justifyContent: 'space-between', marginTop: 'auto' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <CopyBtn text={tpl.body} label="Copy Body" />
                      {tpl.hashtags?.length > 0 && <CopyBtn text={tpl.hashtags.map(h => `#${h.replace(/^#/, '')}`).join(' ')} label="Copy Tags" />}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: MUTED, alignSelf: 'flex-end' }}>
                      {tpl.suggestedDay && `${tpl.suggestedDay} ${tpl.suggestedTime ?? ''}`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Asset Manager Tab ── */}
      {tab === 'assets' && (
        <div style={{ padding: '1.5rem', maxWidth: 1100, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h2 style={{ ...h2, fontSize: '1.2rem', marginBottom: '0.25rem' }}>📁 Asset Manager</h2>
              <p style={{ color: MUTED, fontSize: '0.85rem', margin: 0 }}>{assets.length} assets · Upload files up to 500 MB or import from cloud storage</p>
            </div>
            <button onClick={loadAssets} style={{ padding: '7px 14px', borderRadius: 8, background: 'transparent', border: `1px solid ${BORDER}`, color: MUTED, fontSize: '0.82rem', cursor: 'pointer' }}>
              {assetsLoading ? '⏳' : '↺ Refresh'}
            </button>
          </div>

          {/* Upload zone */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {/* Drag & Drop */}
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => {
                e.preventDefault(); setDragOver(false)
                const file = e.dataTransfer.files[0]
                if (file) uploadFile(file)
              }}
              onClick={() => fileInputRef.current?.click()}
              style={{ background: dragOver ? G + '12' : SURF, border: `2px dashed ${dragOver ? G : BORDER}`, borderRadius: 12, padding: '2.5rem 1.5rem', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}
            >
              <div style={{ fontSize: 40 }}>☁️</div>
              <div style={{ color: INK, fontWeight: 700, fontSize: '0.95rem' }}>Drop file here or click to browse</div>
              <div style={{ color: MUTED, fontSize: '0.78rem' }}>Supports any file type up to 500 MB</div>
              <input ref={fileInputRef} type="file" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) uploadFile(f) }} />
            </div>

            {/* Cloud URL import */}
            <div style={{ ...sectionCard, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ color: G, fontWeight: 700, fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>☁️ Import from Cloud URL</div>
              <input value={cloudUrl} onChange={e => setCloudUrl(e.target.value)} placeholder="Storage URL (Supabase, S3, Google Drive…)" style={{ background: NAVY, border: `1px solid ${BORDER}`, color: INK, borderRadius: 6, padding: '7px 10px', fontSize: '0.82rem' }} />
              <input value={cloudFileName} onChange={e => setCloudFileName(e.target.value)} placeholder="File name (e.g. campaign-banner.png)" style={{ background: NAVY, border: `1px solid ${BORDER}`, color: INK, borderRadius: 6, padding: '7px 10px', fontSize: '0.82rem' }} />
              <select value={cloudMimeType} onChange={e => setCloudMimeType(e.target.value)} style={{ background: NAVY, border: `1px solid ${BORDER}`, color: cloudMimeType ? INK : MUTED, borderRadius: 6, padding: '7px 10px', fontSize: '0.82rem' }}>
                <option value="">Select file type…</option>
                <option value="image/png">PNG Image</option>
                <option value="image/jpeg">JPEG Image</option>
                <option value="image/gif">GIF</option>
                <option value="video/mp4">MP4 Video</option>
                <option value="application/pdf">PDF Document</option>
                <option value="application/zip">ZIP Archive</option>
                <option value="application/octet-stream">Other</option>
              </select>
              <SBtn onClick={importCloudUrl} disabled={uploadingCloud || !cloudUrl || !cloudFileName || !cloudMimeType} small>
                {uploadingCloud ? 'Importing…' : '↓ Import Asset'}
              </SBtn>
            </div>
          </div>

          {/* Asset grid */}
          {assetsLoading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: MUTED }}>Loading assets…</div>
          ) : assets.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: MUTED }}>No assets yet. Upload a file or import a cloud URL above.</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
              {assets.map(asset => {
                const meta = (asset.metadata ?? {}) as Record<string, unknown>
                const sizeBytes = typeof meta.sizeBytes === 'number' ? meta.sizeBytes : null
                return (
                  <div key={asset.id} style={{ background: SURF, border: `1px solid ${BORDER}`, borderRadius: 12, padding: '1rem', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <div style={{ fontSize: 32, lineHeight: 1, flexShrink: 0 }}>{mimeIcon(asset.mimeType)}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, color: INK, fontSize: '0.83rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{asset.fileName}</div>
                        <div style={{ color: MUTED, fontSize: '0.72rem' }}>{asset.mimeType}</div>
                        {sizeBytes && <div style={{ color: MUTED, fontSize: '0.72rem' }}>{formatBytes(sizeBytes)}</div>}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ padding: '2px 8px', borderRadius: 10, fontSize: '0.68rem', fontWeight: 700, background: asset.status === 'processed' ? '#22C55E22' : SURF2, color: asset.status === 'processed' ? '#22C55E' : MUTED }}>
                        {asset.status}
                      </span>
                      <span style={{ color: MUTED, fontSize: '0.7rem' }}>{new Date(asset.createdAt).toLocaleDateString()}</span>
                    </div>

                    <div style={{ display: 'flex', gap: 6, marginTop: 'auto' }}>
                      {asset.storageUrl && (
                        <a href={asset.storageUrl} target="_blank" rel="noreferrer" style={{ padding: '4px 10px', borderRadius: 6, background: SURF2, border: `1px solid ${BORDER}`, color: MUTED, fontSize: '0.72rem', fontWeight: 700, textDecoration: 'none' }}>View ↗</a>
                      )}
                      {asset.storageUrl && <CopyBtn text={asset.storageUrl} label="Copy URL" />}
                      <button onClick={() => deleteAsset(asset.id)} style={{ marginLeft: 'auto', padding: '4px 10px', borderRadius: 6, background: '#EF444418', border: `1px solid #EF444444`, color: '#EF4444', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}>Delete</button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Quote Calculator Tab ── */}
      {tab === 'calculator' && (
        <div style={{ padding: '1.5rem' }}>
          <div style={{ marginBottom: 16, display: 'flex', gap: 10, alignItems: 'center' }}>
            <h2 style={{ ...h2, margin: 0 }}>🧮 Insurance Quote Calculator</h2>
            <a href="/marketing/quote-calculator" target="_blank" rel="noreferrer" style={{ color: G, fontSize: '0.8rem', textDecoration: 'none', border: `1px solid ${G}44`, padding: '4px 10px', borderRadius: 6 }}>Open full page ↗</a>
          </div>
          <iframe src="/marketing/quote-calculator" style={{ width: '100%', height: 'calc(100vh - 160px)', border: 'none', borderRadius: 12 }} title="Quote Calculator" />
        </div>
      )}
    </div>
  )
}
