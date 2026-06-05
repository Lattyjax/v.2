'use client'

import { useState } from 'react'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts'

// ── BRAND TOKENS ──────────────────────────────────────────────────────────────
const CRIMSON = '#6B1C20'      // PAHS Crimson Tide
const CRIMSON_LIGHT = '#8B2328'
const N = '#1B2D4A'            // Latimore navy
const G = '#C49A6C'            // Latimore gold
const LG = '#F0E6D8'
const GR = '#1A6B2A'
const WA = '#8B6914'
const RE = '#B03030'

// ── TYPES ─────────────────────────────────────────────────────────────────────
type Metric = {
  id: number; name: string; baseline: number; target: number
  current: number; unit: string; kpi: string; tool: string
}
type PipelineStage = {
  id: number; stage: string; count: number; color: string; desc: string; kpi: string
}
type MonthData = { month: string; views: number; scans: number; leads: number; bookings: number }
type ScriptStep = { label: string; color: string; text: string }
type DmScript = { id: number; title: string; trigger: string; badge: string; color: string; steps: ScriptStep[] }
type TrendForm = { month: string; views: string; scans: string; leads: string; bookings: string }

type RecentLead = {
  id: string; name: string; email: string; phone: string
  stage: string; source: string; productInterest: string; createdAt: string
}

type Stats = {
  leadsTotal: number
  pipelineMap: Record<string, number>
  pageVisits: number
  qrSessions: number
  appointmentsTotal: number
  recentLeads: RecentLead[]
}

// ── INITIAL DATA ──────────────────────────────────────────────────────────────
function buildMetrics(stats: Stats): Metric[] {
  return [
    { id:1, name:'Post Reach / Views',   baseline:274, target:1000, current:274,                       unit:'views',    kpi:'Brand Awareness',         tool:'Native Analytics (manual)' },
    { id:2, name:'QR Code Scans',        baseline:169, target:50,   current:stats.qrSessions,          unit:'scans',    kpi:'Physical-Digital Bridge',  tool:'Supabase · Live' },
    { id:3, name:'Landing Page Visits',  baseline:0,   target:100,  current:stats.pageVisits,          unit:'visits',   kpi:'Gateway Effectiveness',   tool:'GA4 · Live' },
    { id:4, name:'Leads Captured',       baseline:0,   target:10,   current:stats.leadsTotal,          unit:'leads',    kpi:'Pipeline Fill Rate',       tool:'CRM · Live' },
    { id:5, name:'Assessments Booked',   baseline:0,   target:5,    current:stats.appointmentsTotal,   unit:'bookings', kpi:'Monthly App Volume',       tool:'CRM · Live' },
    { id:6, name:'Referral Rate',        baseline:0,   target:25,   current:0,                         unit:'%',        kpi:'Referral Growth',          tool:'Manual + Supabase' },
    { id:7, name:'District Contacts',    baseline:0,   target:2,    current:0,                         unit:'meetings', kpi:'District Penetration',     tool:'CRM (manual)' },
  ]
}

function buildPipeline(pm: Record<string, number>): PipelineStage[] {
  return [
    { id:1, stage:'New Lead',             count: pm['New']               ?? 0, color:G,         desc:'Capture confirmed. Zapier triggers fired.',          kpi:'Did automation fire within 60s?' },
    { id:2, stage:'Contacted',            count: pm['Attempted_Contact'] ?? 0, color:'#4A90C4', desc:'Manual DM or direct outreach initiated.',            kpi:'Was script delivered within timeline?' },
    { id:3, stage:'Assessment Scheduled', count: pm['Booked']            ?? 0, color:'#7B68EE', desc:'Lead used Google Calendar booking page.',            kpi:'Is the booking link loading on mobile?' },
    { id:4, stage:'Proposal Sent',        count: pm['Qualified']         ?? 0, color:WA,        desc:'Tailored protection strategy delivered.',             kpi:'Was proposal personalized?' },
    { id:5, stage:'Closed',               count: pm['Sold']              ?? 0, color:GR,        desc:'Mission fulfilled. Secured legacy.',                 kpi:'Was referral ask made within 7 days?' },
  ]
}

const MONTHLY_HISTORY: MonthData[] = [
  { month:"Nov '25", views:40, scans:22, leads:0, bookings:0 },
  { month:"Dec '25", views:38, scans:20, leads:0, bookings:0 },
  { month:"Jan '26", views:44, scans:28, leads:0, bookings:0 },
  { month:"Feb '26", views:48, scans:32, leads:0, bookings:0 },
  { month:"Mar '26", views:52, scans:35, leads:0, bookings:0 },
  { month:"Apr '26", views:52, scans:32, leads:0, bookings:0 },
]

const CHECKLIST: Record<string, string[]> = {
  'Print & QR Integrity': [
    'All physical assets exported at 300 DPI minimum',
    'QR codes are minimum 1.5" × 1.5" on all formats',
    'QR scan tested from 18" on both iPhone & Android',
    'QR routes correctly to card.latimorelifelegacy.com/pahs',
    'Vanity URL typed manually also routes correctly',
  ],
  'Data & Automation': [
    'Test lead submitted — all 4 fields appear in Supabase within 30s',
    'Zapier confirmation email fires within 60s',
    'Zapier confirmation SMS fires within 60s',
    'Google Calendar booking link loads correctly on mobile',
    'Authorized redirect URIs confirmed active (/api/auth/callback/google)',
  ],
  'UTM & Analytics': [
    'Unique UTM links generated for all 5 channels (FB, IG, LI, print, direct)',
    'GA4 G-S0Q3E4DEBJ active on www.latimorelifelegacy.com',
    'GA4 G-91DT7W1KRP active on card.latimorelifelegacy.com',
    'Supabase Source field captures UTM value correctly',
    'Vercel live at hub.latimorelifelegacy.com with no build errors',
  ],
  'Social & Mobile': [
    'Landing page tested on iOS Safari and Android Chrome',
    'Instagram Link-in-Bio updated to PAHS URL with UTM',
    'Facebook post pinned; LinkedIn post set as Featured',
    '60-second self-comment drafted and ready for each platform',
    'Reels/TikTok end card shows QR + URL for minimum 3 seconds',
  ],
}

const DM_SCRIPTS: DmScript[] = [
  {
    id: 1, title: 'Primary Diagnostic', badge: 'Social Engagers', color: N,
    trigger: 'Use within response window for all post likes, comments & shares.',
    steps: [
      { label: 'INITIAL OUTREACH', color: G,  text: 'Appreciate the support on the PAHS post! Quick question: Have you reviewed your life insurance or retirement strategy in the last 12–18 months?' },
      { label: 'IF YES →',         color: GR, text: "That's great. Most people I talk to haven't looked at it in years. Would it be worth a quick 15-minute review to make sure you're still in the best position? I can send a link." },
      { label: 'IF NO →',          color: WA, text: "That's actually really common — a lot can change in a year. I'd love to offer a free 15-minute assessment to see where you stand. Want me to send a link?" },
    ],
  },
  {
    id: 2, title: "Keyword DM Trigger", badge: 'Automated', color: '#4A7FC1',
    trigger: "Auto-fires when prospect DMs the keyword 'PROTECT'.",
    steps: [
      { label: 'FIRST RESPONSE (auto)', color: G,  text: "Thanks for reaching out! I'm Jackson Latimore with Latimore Life & Legacy — I help families in Schuylkill County protect what matters most. Here's your free assessment link: [BOOKING LINK]. Takes about 2 minutes to schedule. #TheBeatGoesOn" },
      { label: 'FOLLOW-UP (24h, no booking)', color: WA, text: "Hey [Name] — just wanted to make sure the link came through okay. Have you reviewed your coverage in the last year or so? Happy to answer any questions before you book." },
    ],
  },
  {
    id: 3, title: 'Post-Assessment Referral Ask', badge: 'Post-Close', color: GR,
    trigger: 'Send within 7 days of a successfully closed assessment or policy.',
    steps: [
      { label: 'REFERRAL REQUEST', color: GR, text: "[Name], I genuinely appreciate the trust you placed in me. If you know anyone — a family member, coworker, or neighbor — who could benefit from a quick conversation about their financial protection, I'd be grateful for the introduction. A simple text or DM is all it takes. I'll take great care of them.\n\n\"Protecting Today. Securing Tomorrow. #TheBeatGoesOn\"" },
    ],
  },
]

// ── COMPONENTS ────────────────────────────────────────────────────────────────
function NavBar({ tab, setTab }: { tab: string; setTab: (t: string) => void }) {
  const tabs = [
    { id:'overview',   label:'📊 Overview' },
    { id:'pipeline',   label:'🔄 Pipeline' },
    { id:'leads',      label:'👥 Leads' },
    { id:'trends',     label:'📈 Trends' },
    { id:'checklist',  label:'✅ Checklist' },
    { id:'scripts',    label:'💬 DM Scripts' },
    { id:'compliance', label:'🛡 Compliance' },
  ]
  return (
    <div style={{ background:'#fff', borderBottom:'1px solid #e8e8e8', display:'flex', overflowX:'auto', gap:0 }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => setTab(t.id)}
          style={{ padding:'12px 18px', border:'none', borderBottom: tab===t.id ? `3px solid ${CRIMSON}` : '3px solid transparent',
            background:'none', color: tab===t.id ? CRIMSON : '#888', fontWeight: tab===t.id ? 700 : 400,
            cursor:'pointer', fontSize:13, whiteSpace:'nowrap', fontFamily:'Arial, sans-serif' }}>
          {t.label}
        </button>
      ))}
    </div>
  )
}

function StatCard({ metric, onUpdate }: { metric: Metric; onUpdate: (id: number, val: number) => void }) {
  const [editing, setEditing] = useState(false)
  const [val, setVal] = useState(String(metric.current))
  const pct = Math.min(100, Math.round((metric.current / metric.target) * 100))
  const status = pct >= 100 ? 'ON TARGET' : pct >= 60 ? 'PROGRESSING' : pct >= 20 ? 'BUILDING' : 'START'
  const sc = pct >= 100 ? GR : pct >= 60 ? WA : pct >= 20 ? G : '#999'
  const isLive = metric.tool.includes('Live')

  return (
    <div style={{ background:'#fff', border:`1px solid ${isLive ? G+'55' : '#e8e8e8'}`, borderRadius:10, padding:18, boxShadow: isLive ? `0 2px 12px ${G}22` : '0 2px 8px rgba(0,0,0,0.05)' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
        <div>
          <div style={{ fontWeight:700, color:N, fontSize:13, fontFamily:'Arial' }}>{metric.name}</div>
          <div style={{ fontSize:11, color: isLive ? GR : '#999', marginTop:2, fontFamily:'Arial', display:'flex', alignItems:'center', gap:4 }}>
            {isLive && <span style={{ width:6, height:6, borderRadius:'50%', background:GR, display:'inline-block' }} />}
            {metric.tool}
          </div>
        </div>
        <span style={{ background:sc+'22', color:sc, fontSize:10, fontWeight:700, padding:'3px 8px', borderRadius:10, fontFamily:'Arial', whiteSpace:'nowrap' }}>{status}</span>
      </div>
      <div style={{ display:'flex', alignItems:'baseline', gap:6, margin:'10px 0 6px' }}>
        {editing ? (
          <div style={{ display:'flex', gap:6, alignItems:'center', flexWrap:'wrap' }}>
            <input type="number" value={val} onChange={e => setVal(e.target.value)}
              style={{ width:70, fontSize:20, fontWeight:700, color:N, border:`1px solid ${G}`, borderRadius:4, padding:'2px 6px', fontFamily:'Arial' }} />
            <span style={{ fontSize:12, color:'#999', fontFamily:'Arial' }}>{metric.unit}</span>
            <button onClick={() => { onUpdate(metric.id, Number(val)); setEditing(false) }}
              style={{ background:GR, color:'#fff', border:'none', borderRadius:5, padding:'4px 10px', cursor:'pointer', fontSize:12, fontWeight:600, fontFamily:'Arial' }}>Save</button>
            <button onClick={() => setEditing(false)}
              style={{ background:'#eee', color:'#555', border:'none', borderRadius:5, padding:'4px 8px', cursor:'pointer', fontSize:12, fontFamily:'Arial' }}>✕</button>
          </div>
        ) : (
          <>
            <span style={{ fontSize:26, fontWeight:800, color:N, fontFamily:'Arial' }}>{metric.current}</span>
            <span style={{ fontSize:12, color:'#bbb', fontFamily:'Arial' }}>/ {metric.target} {metric.unit}</span>
            {!isLive && (
              <button onClick={() => setEditing(true)}
                style={{ background:'none', border:`1px solid ${G}`, borderRadius:5, color:G, padding:'2px 8px', cursor:'pointer', fontSize:11, marginLeft:'auto', fontFamily:'Arial' }}>Update</button>
            )}
          </>
        )}
      </div>
      <div style={{ background:'#eee', borderRadius:6, height:8, overflow:'hidden' }}>
        <div style={{ width:`${pct}%`, background: pct>=100 ? GR : pct>=60 ? G : pct>=20 ? G+'99' : '#ddd', height:'100%', borderRadius:6, transition:'width 0.4s' }} />
      </div>
      <div style={{ display:'flex', justifyContent:'space-between', marginTop:5 }}>
        <span style={{ fontSize:11, color:'#aaa', fontFamily:'Arial' }}>Baseline: {metric.baseline}</span>
        <span style={{ fontSize:11, fontWeight:700, color:sc, fontFamily:'Arial' }}>{pct}%</span>
      </div>
    </div>
  )
}

function PipelineView({ pipeline, setPipeline }: { pipeline: PipelineStage[]; setPipeline: React.Dispatch<React.SetStateAction<PipelineStage[]>> }) {
  const total = pipeline.reduce((a, s) => a + s.count, 0) || 1
  const updateCount = (id: number, v: number) =>
    setPipeline(prev => prev.map(s => s.id===id ? {...s, count:Math.max(0,v)} : s))

  return (
    <div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(160px, 1fr))', gap:12, marginBottom:24 }}>
        {pipeline.map(s => (
          <div key={s.id} style={{ background:'#fff', border:'1px solid #e8e8e8', borderRadius:10, padding:16, borderTop:`4px solid ${s.color}` }}>
            <div style={{ fontSize:11, color:'#999', fontWeight:700, marginBottom:4, fontFamily:'Arial', textTransform:'uppercase' }}>Stage {s.id}</div>
            <div style={{ fontWeight:700, color:N, fontSize:13, marginBottom:8, fontFamily:'Arial' }}>{s.stage}</div>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
              <button onClick={() => updateCount(s.id, s.count-1)}
                style={{ width:26, height:26, border:'1px solid #ddd', borderRadius:5, background:'#f5f5f5', cursor:'pointer', fontSize:14, display:'flex', alignItems:'center', justifyContent:'center' }}>−</button>
              <span style={{ fontSize:28, fontWeight:800, color:s.color, fontFamily:'Arial', minWidth:32, textAlign:'center' }}>{s.count}</span>
              <button onClick={() => updateCount(s.id, s.count+1)}
                style={{ width:26, height:26, border:'1px solid #ddd', borderRadius:5, background:'#f5f5f5', cursor:'pointer', fontSize:14, display:'flex', alignItems:'center', justifyContent:'center' }}>+</button>
            </div>
            <div style={{ background:'#eee', borderRadius:4, height:5, overflow:'hidden', marginBottom:8 }}>
              <div style={{ width:`${Math.min(100,(s.count/total)*100*5)}%`, background:s.color, height:'100%', borderRadius:4 }} />
            </div>
            <div style={{ fontSize:11, color:'#888', fontFamily:'Arial', lineHeight:1.4 }}>{s.desc}</div>
          </div>
        ))}
      </div>
      <div style={{ background:'#fff', border:'1px solid #e8e8e8', borderRadius:10, padding:20 }}>
        <div style={{ fontWeight:700, color:N, fontSize:14, marginBottom:16, fontFamily:'Arial', borderBottom:`2px solid ${CRIMSON}`, paddingBottom:8 }}>Funnel Conversion Analysis</div>
        {pipeline.slice(0,-1).map((s, i) => {
          const next = pipeline[i+1]
          const rate = s.count > 0 ? Math.round((next.count / s.count) * 100) : 0
          const color = rate >= 60 ? GR : rate >= 30 ? WA : '#ccc'
          return (
            <div key={s.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'8px 0', borderBottom:'1px solid #f0f0f0' }}>
              <span style={{ fontSize:12, color:N, fontFamily:'Arial', fontWeight:700, minWidth:180 }}>{s.stage}</span>
              <span style={{ fontSize:12, color:'#aaa', fontFamily:'Arial' }}>→</span>
              <span style={{ fontSize:12, color:'#666', fontFamily:'Arial', minWidth:200 }}>{next.stage}</span>
              <div style={{ flex:1, background:'#eee', borderRadius:4, height:8, overflow:'hidden' }}>
                <div style={{ width:`${rate}%`, background:color, height:'100%', borderRadius:4, transition:'width 0.4s' }} />
              </div>
              <span style={{ fontSize:13, fontWeight:700, color, fontFamily:'Arial', minWidth:50, textAlign:'right' }}>{s.count > 0 ? `${rate}%` : '—'}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function LeadsView({ leads }: { leads: RecentLead[] }) {
  const stageColor: Record<string, string> = {
    New: G, Attempted_Contact: '#4A90C4', Booked: '#7B68EE',
    Qualified: WA, Sold: GR, Follow_Up: '#f97316', Lost: '#6b7280',
  }
  return (
    <div style={{ background:'#fff', border:'1px solid #e8e8e8', borderRadius:10, overflow:'hidden' }}>
      <div style={{ padding:'16px 20px', borderBottom:'1px solid #e8e8e8', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div style={{ fontWeight:700, color:N, fontSize:15, fontFamily:'Arial' }}>PAHS Campaign Leads</div>
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          <span style={{ width:8, height:8, borderRadius:'50%', background:GR, display:'inline-block' }} />
          <span style={{ fontSize:12, color:GR, fontFamily:'Arial', fontWeight:600 }}>Live from CRM</span>
        </div>
      </div>
      {leads.length === 0 ? (
        <div style={{ padding:'40px 20px', textAlign:'center', color:'#999', fontFamily:'Arial', fontSize:14 }}>
          No PAHS leads yet. QR scans and form submissions will appear here automatically.
        </div>
      ) : (
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontFamily:'Arial' }}>
            <thead>
              <tr style={{ background:'#f9f9f9' }}>
                {['Name', 'Contact', 'Interest', 'Stage', 'Source', 'Date'].map(h => (
                  <th key={h} style={{ padding:'10px 16px', textAlign:'left', fontSize:11, fontWeight:700, color:'#888', textTransform:'uppercase', letterSpacing:'0.08em', borderBottom:'1px solid #e8e8e8' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {leads.map((lead, i) => (
                <tr key={lead.id} style={{ borderBottom:'1px solid #f0f0f0', background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                  <td style={{ padding:'12px 16px', fontWeight:700, color:N, fontSize:13 }}>{lead.name}</td>
                  <td style={{ padding:'12px 16px', fontSize:12, color:'#666' }}>
                    {lead.phone && <div>{lead.phone}</div>}
                    {lead.email && <div style={{ color:'#999' }}>{lead.email}</div>}
                  </td>
                  <td style={{ padding:'12px 16px' }}>
                    <span style={{ background:G+'22', color:WA, fontSize:11, fontWeight:600, padding:'3px 8px', borderRadius:8, fontFamily:'Arial' }}>{lead.productInterest}</span>
                  </td>
                  <td style={{ padding:'12px 16px' }}>
                    <span style={{ background:(stageColor[lead.stage] ?? '#999')+'22', color:stageColor[lead.stage] ?? '#999', fontSize:11, fontWeight:700, padding:'3px 8px', borderRadius:8 }}>{lead.stage.replace(/_/g,' ')}</span>
                  </td>
                  <td style={{ padding:'12px 16px', fontSize:11, color:'#aaa' }}>{lead.source || 'PAHS'}</td>
                  <td style={{ padding:'12px 16px', fontSize:11, color:'#aaa' }}>{new Date(lead.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function TrendsView({ history, setHistory }: { history: MonthData[]; setHistory: React.Dispatch<React.SetStateAction<MonthData[]>> }) {
  const [form, setForm] = useState<TrendForm>({ month:'', views:'', scans:'', leads:'', bookings:'' })
  const addMonth = () => {
    if (!form.month) return
    setHistory(prev => [...prev, { month:form.month, views:+form.views||0, scans:+form.scans||0, leads:+form.leads||0, bookings:+form.bookings||0 }])
    setForm({ month:'', views:'', scans:'', leads:'', bookings:'' })
  }
  const fields: Array<[keyof TrendForm, string, string]> = [
    ['month', "Month (e.g. May '26)", "May '26"],
    ['views', 'Views', '0'],
    ['scans', 'Scans', '0'],
    ['leads', 'Leads', '0'],
    ['bookings', 'Bookings', '0'],
  ]

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      <div style={{ background:'#fff', border:'1px solid #e8e8e8', borderRadius:10, padding:20 }}>
        <div style={{ fontWeight:700, color:N, fontSize:14, marginBottom:16, fontFamily:'Arial' }}>Views &amp; Scans — Monthly</div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={history}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize:11, fill:'#999' }} />
            <YAxis tick={{ fontSize:11, fill:'#999' }} />
            <Tooltip contentStyle={{ fontFamily:'Arial', fontSize:12 }} />
            <ReferenceLine y={1000} stroke={GR} strokeDasharray="4 4" />
            <Line type="monotone" dataKey="views" stroke={CRIMSON} strokeWidth={2} dot={{ r:4 }} name="Views" />
            <Line type="monotone" dataKey="scans" stroke={G} strokeWidth={2} dot={{ r:4 }} name="Scans" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
        <div style={{ background:'#fff', border:'1px solid #e8e8e8', borderRadius:10, padding:20 }}>
          <div style={{ fontWeight:700, color:N, fontSize:13, marginBottom:12, fontFamily:'Arial' }}>Leads Captured</div>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={history}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize:10, fill:'#999' }} />
              <YAxis tick={{ fontSize:10, fill:'#999' }} />
              <Tooltip contentStyle={{ fontFamily:'Arial', fontSize:12 }} />
              <ReferenceLine y={10} stroke={GR} strokeDasharray="4 4" />
              <Bar dataKey="leads" fill={G} name="Leads" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={{ background:'#fff', border:'1px solid #e8e8e8', borderRadius:10, padding:20 }}>
          <div style={{ fontWeight:700, color:N, fontSize:13, marginBottom:12, fontFamily:'Arial' }}>Assessments Booked</div>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={history}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize:10, fill:'#999' }} />
              <YAxis tick={{ fontSize:10, fill:'#999' }} />
              <Tooltip contentStyle={{ fontFamily:'Arial', fontSize:12 }} />
              <ReferenceLine y={5} stroke={GR} strokeDasharray="4 4" />
              <Bar dataKey="bookings" fill={CRIMSON} name="Bookings" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ background:'#fff', border:`1px solid ${G}`, borderRadius:10, padding:20 }}>
        <div style={{ fontWeight:700, color:N, fontSize:13, marginBottom:12, fontFamily:'Arial' }}>Log a New Month</div>
        <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
          {fields.map(([k, l, p]) => (
            <div key={k} style={{ display:'flex', flexDirection:'column', gap:4 }}>
              <label style={{ fontSize:11, color:'#888', fontFamily:'Arial' }}>{l}</label>
              <input value={form[k]} onChange={e => setForm(prev => ({ ...prev, [k]: e.target.value }))} placeholder={p}
                style={{ padding:'6px 10px', border:'1px solid #ddd', borderRadius:5, fontSize:13, width:k==='month'?120:80, fontFamily:'Arial' }} />
            </div>
          ))}
          <div style={{ display:'flex', alignItems:'flex-end' }}>
            <button onClick={addMonth}
              style={{ background:CRIMSON, color:'#fff', border:'none', borderRadius:6, padding:'8px 18px', cursor:'pointer', fontWeight:700, fontSize:13, fontFamily:'Arial' }}>Add Month</button>
          </div>
        </div>
      </div>
    </div>
  )
}

function ChecklistView() {
  const [checked, setChecked] = useState<Record<number, boolean>>({})
  const toggle = (key: number) => setChecked(prev => ({ ...prev, [key]: !prev[key] }))

  const allItems = Object.values(CHECKLIST).flat()
  const doneCount = allItems.filter((_, i) => checked[i]).length

  const sections = Object.entries(CHECKLIST)
  let globalOffset = 0

  return (
    <div>
      <div style={{ background:'#fff', border:'1px solid #e8e8e8', borderRadius:10, padding:20, marginBottom:16 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
          <div style={{ fontWeight:700, color:N, fontSize:15, fontFamily:'Arial' }}>Pre-Launch Go / No-Go Checklist</div>
          <div style={{ textAlign:'right' }}>
            <span style={{ fontSize:22, fontWeight:800, color: doneCount===allItems.length ? GR : N, fontFamily:'Arial' }}>{doneCount}/{allItems.length}</span>
            <div style={{ fontSize:11, color:'#999', fontFamily:'Arial' }}>complete</div>
          </div>
        </div>
        <div style={{ background:'#eee', borderRadius:6, height:10, overflow:'hidden' }}>
          <div style={{ width:`${(doneCount/allItems.length)*100}%`, background: doneCount===allItems.length ? GR : CRIMSON, height:'100%', borderRadius:6, transition:'width 0.3s' }} />
        </div>
        {doneCount < allItems.length && (
          <div style={{ marginTop:10, padding:'8px 12px', background:'#fff8ee', borderRadius:6, border:`1px solid ${G}`, fontSize:12, color:'#7a5c20', fontFamily:'Arial' }}>
            ⚠️ DO NOT distribute assets until all {allItems.length} items are confirmed.
          </div>
        )}
        {doneCount === allItems.length && (
          <div style={{ marginTop:10, padding:'8px 12px', background:'#f0fff4', borderRadius:6, border:`1px solid ${GR}`, fontSize:12, color:GR, fontWeight:700, fontFamily:'Arial' }}>
            ✅ GO — All pre-launch criteria met. Clear for distribution.
          </div>
        )}
      </div>

      {sections.map(([section, items]) => {
        const offset = globalOffset
        globalOffset += items.length
        return (
          <div key={section} style={{ background:'#fff', border:'1px solid #e8e8e8', borderRadius:10, padding:20, marginBottom:12 }}>
            <div style={{ fontWeight:700, color:N, fontSize:13, marginBottom:12, paddingBottom:8, borderBottom:`2px solid ${CRIMSON}`, fontFamily:'Arial' }}>{section}</div>
            {items.map((item, i) => {
              const key = offset + i
              return (
                <div key={i} onClick={() => toggle(key)}
                  style={{ display:'flex', gap:12, padding:'10px 8px', cursor:'pointer', borderRadius:6,
                    background: checked[key] ? '#f0fff4' : 'transparent',
                    borderBottom: i < items.length-1 ? '1px solid #f5f5f5' : 'none', transition:'background 0.2s' }}>
                  <div style={{ width:22, height:22, border:`2px solid ${checked[key] ? GR : '#ccc'}`, borderRadius:5, flexShrink:0,
                    background: checked[key] ? GR : 'transparent', display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.2s' }}>
                    {checked[key] && <span style={{ color:'#fff', fontSize:13, fontWeight:700 }}>✓</span>}
                  </div>
                  <span style={{ fontSize:13, color: checked[key] ? '#888' : '#333', textDecoration: checked[key] ? 'line-through' : 'none', fontFamily:'Arial', lineHeight:1.4 }}>{item}</span>
                </div>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}

function ScriptCard({ script }: { script: DmScript }) {
  const [copied, setCopied] = useState<string | null>(null)
  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text).catch(() => { /* noop */ })
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div style={{ background:'#fff', border:'1px solid #e8e8e8', borderRadius:12, padding:20, boxShadow:'0 2px 8px rgba(0,0,0,0.04)' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
        <div>
          <div style={{ fontWeight:700, color:N, fontSize:15, fontFamily:'Arial' }}>{script.title}</div>
          <div style={{ fontSize:12, color:'#999', marginTop:3, fontFamily:'Arial' }}>{script.trigger}</div>
        </div>
        <span style={{ background:script.color+'18', color:script.color, fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:10, fontFamily:'Arial', whiteSpace:'nowrap' }}>{script.badge}</span>
      </div>
      {script.steps.map((step, i) => (
        <div key={i} style={{ marginTop:14 }}>
          <div style={{ fontSize:11, fontWeight:700, color:step.color, fontFamily:'Arial', marginBottom:6, letterSpacing:'0.05em' }}>{step.label}</div>
          <div style={{ background:'#f9f9f9', border:`1px solid ${step.color}33`, borderLeft:`4px solid ${step.color}`, borderRadius:6, padding:'12px 16px', position:'relative' }}>
            <p style={{ margin:0, fontSize:14, color:'#333', fontFamily:'Arial', lineHeight:1.6, whiteSpace:'pre-line' }}>{step.text}</p>
            <button onClick={() => copyText(step.text, `${script.id}-${i}`)}
              style={{ position:'absolute', top:8, right:8, background: copied===`${script.id}-${i}` ? GR : '#eee',
                color: copied===`${script.id}-${i}` ? '#fff' : '#666', border:'none', borderRadius:5, padding:'3px 10px',
                cursor:'pointer', fontSize:11, fontWeight:600, fontFamily:'Arial', transition:'all 0.2s' }}>
              {copied===`${script.id}-${i}` ? '✓ Copied' : 'Copy'}
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

function ComplianceView() {
  const items = [
    { area:'Voice & Tone',          status:'PASS',          evidence:'Urgent but legacy-forward throughout. No fear-based language.',                                       action:"Maintain. Reinforce 'preparedness' framing in all marketing adaptations." },
    { area:'ICP Alignment',         status:'PASS',          evidence:'Content speaks directly to Schuylkill County families, Pre-Retirees, and community members.',          action:'Add Pre-Retiree-specific hook to DM follow-up sequences.' },
    { area:'Founder Story Protocol',status:'ACTION NEEDED', evidence:'AED legacy and #TheBeatGoesOn not yet woven into PAHS section or game-day assets.',                    action:'Integrate cardiac survival narrative into PAHS content — dignity-first, preparedness-focused.' },
    { area:'Compliance Language',   status:'PASS',          evidence:'No definitive insurance outcome claims or guarantees stated.',                                          action:"Apply 'may' / 'can' qualifiers to all marketing adaptations of any outcome statements." },
    { area:'KPI Alignment',         status:'PASS',          evidence:'Baselines set; monthly targets defined; optimization triggers established.',                             action:'Referral rate target (20–30%) now added to KPI matrix.' },
    { area:'Visual Brand Lock',     status:'ACTION NEEDED', evidence:'Navy #1B2D4A and Gold #C49A6C not yet confirmed on all print asset files.',                              action:'Confirm exact hex values applied to all print assets before production print run.' },
  ]
  const actions = [
    'Integrate AED/cardiac survival narrative into PAHS content and game-day assets — dignity-first.',
    'Confirm all print assets use Navy #1B2D4A and Gold #C49A6C as exact hex values.',
    "Apply 'may' / 'can' conditional qualifiers to any insurance outcome statements.",
    'Commission a designer brief for press-style assets using the Master Playbook as foundation.',
    'Complete the Pre-Launch Technical Checklist (Checklist tab) before any distribution.',
  ]

  return (
    <div>
      <div style={{ background:'#fff', border:'1px solid #e8e8e8', borderRadius:10, padding:20, marginBottom:16 }}>
        <div style={{ fontWeight:700, color:N, fontSize:15, marginBottom:4, fontFamily:'Arial' }}>Brand Guardrail Scorecard</div>
        <div style={{ fontSize:12, color:'#999', marginBottom:16, fontFamily:'Arial' }}>Latimore OS Master Playbook — All Three Source Documents Reviewed</div>
        {items.map((r, i) => {
          const sc = r.status === 'PASS' ? GR : r.status === 'ACTION NEEDED' ? RE : WA
          return (
            <div key={i} style={{ display:'grid', gridTemplateColumns:'1fr 110px 1fr 1fr', gap:12, padding:'14px 0',
              borderBottom: i < items.length-1 ? '1px solid #f0f0f0' : 'none', alignItems:'start' }}>
              <div style={{ fontWeight:700, color:N, fontSize:13, fontFamily:'Arial' }}>{r.area}</div>
              <div><span style={{ background:sc+'18', color:sc, fontSize:10, fontWeight:700, padding:'3px 8px', borderRadius:10, fontFamily:'Arial' }}>{r.status}</span></div>
              <div style={{ fontSize:12, color:'#555', fontFamily:'Arial', lineHeight:1.5 }}>{r.evidence}</div>
              <div style={{ fontSize:12, color:'#444', fontFamily:'Arial', lineHeight:1.5, fontStyle:'italic' }}>{r.action}</div>
            </div>
          )
        })}
      </div>
      <div style={{ background:LG, border:`1px solid ${G}`, borderRadius:10, padding:20 }}>
        <div style={{ fontWeight:700, color:N, fontSize:14, marginBottom:12, fontFamily:'Arial' }}>Priority Actions Before First Distribution</div>
        {actions.map((a, i) => (
          <div key={i} style={{ display:'flex', gap:10, padding:'8px 0', fontSize:13, color:'#333', fontFamily:'Arial', borderBottom: i < actions.length-1 ? '1px solid #e8d5bc' : 'none' }}>
            <span style={{ color:CRIMSON, fontWeight:800, minWidth:20, fontFamily:'Arial' }}>{i+1}.</span>
            <span>{a}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── MAIN CLIENT COMPONENT ────────────────────────────────────────────────────
export default function PAHSCampaignClient({ stats }: { stats: Stats }) {
  const [tab, setTab] = useState('overview')
  const [metrics, setMetrics] = useState<Metric[]>(() => buildMetrics(stats))
  const [pipeline, setPipeline] = useState<PipelineStage[]>(() => buildPipeline(stats.pipelineMap))
  const [history, setHistory] = useState<MonthData[]>(MONTHLY_HISTORY)

  const handleUpdateMetric = (id: number, val: number) =>
    setMetrics(prev => prev.map(m => m.id===id ? {...m, current:val} : m))

  const totalPct = Math.round(metrics.reduce((a, m) => a + Math.min(100, (m.current/m.target)*100), 0) / metrics.length)
  const totalLeads = pipeline.reduce((a, s) => a + s.count, 0)

  return (
    <div style={{ fontFamily:'Arial, sans-serif', background:'#f6f6f6', minHeight:'100vh', display:'flex', flexDirection:'column' }}>

      {/* ── HEADER ── */}
      <div style={{ background: `linear-gradient(135deg, ${CRIMSON} 0%, ${CRIMSON_LIGHT} 40%, ${N} 100%)`, padding:'20px 24px' }}>
        {/* Sponsor badge */}
        <div style={{ textAlign:'center', marginBottom:14 }}>
          <span style={{ background:'rgba(196,154,108,0.25)', border:`1px solid ${G}`, color:G, fontSize:10, fontWeight:800, padding:'4px 14px', borderRadius:20, letterSpacing:'0.2em', fontFamily:'Arial' }}>
            ★ PROUD ALL-STAR SPONSOR ★
          </span>
        </div>

        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:16 }}>
          {/* Left — PAHS identity */}
          <div>
            <div style={{ color:'#fff', fontWeight:900, fontSize:20, letterSpacing:1, fontFamily:'Arial', textTransform:'uppercase' }}>
              Pottsville Area High School &apos;26
            </div>
            <div style={{ color:G, fontSize:12, marginTop:3, fontFamily:'Arial', fontStyle:'italic' }}>
              Supporting Our Athletes. Strengthening Our Community.
            </div>
            <div style={{ color:'rgba(255,255,255,0.6)', fontSize:11, marginTop:4, fontFamily:'Arial' }}>
              Schuylkill, Luzerne &amp; Northumberland Counties
            </div>
          </div>

          {/* Center — live stats pills */}
          <div style={{ display:'flex', gap:12, flexWrap:'wrap', justifyContent:'center' }}>
            {[
              { label:'Leads', value:stats.leadsTotal, color:G },
              { label:'Booked', value:stats.appointmentsTotal, color:'#7B68EE' },
              { label:'Page Visits', value:stats.pageVisits, color:'#4A90C4' },
              { label:'QR Sessions', value:stats.qrSessions, color:'#22c55e' },
            ].map(s => (
              <div key={s.label} style={{ textAlign:'center', background:'rgba(0,0,0,0.25)', borderRadius:10, padding:'8px 16px', minWidth:70 }}>
                <div style={{ color:s.color, fontWeight:800, fontSize:22, fontFamily:'Arial', lineHeight:1 }}>{s.value}</div>
                <div style={{ color:'rgba(255,255,255,0.6)', fontSize:10, fontFamily:'Arial', marginTop:2 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Right — KPI progress */}
          <div style={{ textAlign:'right' }}>
            <div style={{ color:G, fontWeight:800, fontSize:28, fontFamily:'Arial' }}>{totalPct}%</div>
            <div style={{ color:'rgba(255,255,255,0.6)', fontSize:11, fontFamily:'Arial' }}>KPI Progress</div>
            <div style={{ color:'#fff', fontWeight:700, fontSize:18, fontFamily:'Arial', marginTop:4 }}>{totalLeads}</div>
            <div style={{ color:'rgba(255,255,255,0.6)', fontSize:11, fontFamily:'Arial' }}>Pipeline Leads</div>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ background:'rgba(255,255,255,0.2)', borderRadius:6, height:5, marginTop:16, overflow:'hidden' }}>
          <div style={{ width:`${totalPct}%`, background:G, height:'100%', borderRadius:6, transition:'width 0.5s' }} />
        </div>

        {/* Latimore branding strip */}
        <div style={{ marginTop:12, display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
          <span style={{ color:'rgba(255,255,255,0.5)', fontSize:11, fontFamily:'Arial' }}>Official Protection Partner:</span>
          <span style={{ color:G, fontWeight:800, fontSize:12, fontFamily:'Arial', letterSpacing:0.5 }}>LATIMORE LIFE &amp; LEGACY LLC</span>
          <span style={{ color:'rgba(255,255,255,0.4)', fontSize:11, fontFamily:'Arial' }}>· #TheBeatGoesOn</span>
        </div>
      </div>

      <NavBar tab={tab} setTab={setTab} />

      <div style={{ flex:1, padding:20, maxWidth:1100, width:'100%', boxSizing:'border-box', margin:'0 auto' }}>
        {tab === 'overview' && (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(260px, 1fr))', gap:14 }}>
            {metrics.map(m => <StatCard key={m.id} metric={m} onUpdate={handleUpdateMetric} />)}
          </div>
        )}
        {tab === 'pipeline'    && <PipelineView pipeline={pipeline} setPipeline={setPipeline} />}
        {tab === 'leads'       && <LeadsView leads={stats.recentLeads} />}
        {tab === 'trends'      && <TrendsView history={history} setHistory={setHistory} />}
        {tab === 'checklist'   && <ChecklistView />}
        {tab === 'scripts'     && (
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            {DM_SCRIPTS.map(s => <ScriptCard key={s.id} script={s} />)}
          </div>
        )}
        {tab === 'compliance'  && <ComplianceView />}
      </div>

      <div style={{ background:N, color:G, textAlign:'center', padding:'10px 20px', fontSize:12, fontStyle:'italic', fontFamily:'Arial' }}>
        Protecting Today. Securing Tomorrow. — #TheBeatGoesOn · latimorelifelegacy.com · 717-615-2613
      </div>
    </div>
  )
}
