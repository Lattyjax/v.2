import { requireAdminSession } from '@/lib/ai/shared'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

async function getKpis() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  const [totalContacts, newLeads30d, newLeads7d, openInsights, recentReports, recentMetrics] = await Promise.all([
    prisma.contact.count(),
    prisma.contact.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.contact.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.insight.count({ where: { status: 'open' } }),
    prisma.weeklyReport.findMany({ orderBy: { weekStart: 'desc' }, take: 4 }),
    prisma.socialMetric.findMany({ where: { metricDate: { gte: thirtyDaysAgo } } }),
  ])

  const totals = recentMetrics.reduce(
    (a, m) => ({
      impressions: a.impressions + m.impressions,
      reach: a.reach + m.reach,
      clicks: a.clicks + m.clicks,
      reactions: a.reactions + m.reactions,
      leads: a.leads + m.leads,
    }),
    { impressions: 0, reach: 0, clicks: 0, reactions: 0, leads: 0 }
  )

  return { totalContacts, newLeads30d, newLeads7d, openInsights, recentReports, totals }
}

const PHASES = [
  { phase: 1, label: 'Foundation', status: 'complete', description: 'CRM, lead capture, analytics baseline, admin portal' },
  { phase: 2, label: 'Engagement AI', status: 'active', description: 'Social metrics, sentiment analysis, weekly reports, spike detection' },
  { phase: 3, label: 'Revenue Engine', status: 'upcoming', description: 'Pipeline automation, appointment conversion, revenue attribution' },
  { phase: 4, label: 'Scale & Expand', status: 'upcoming', description: 'Multi-agent AI, referral system, expanded geo coverage' },
]

const STATUS_COLORS: Record<string, string> = {
  complete: '#22c55e',
  active: '#C49A6C',
  upcoming: 'rgba(255,255,255,0.25)',
}

function KpiTile({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(196,154,108,0.2)', borderRadius: 10, padding: '18px 22px' }}>
      <div style={{ fontSize: '0.7rem', color: '#C49A6C', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: '2rem', fontWeight: 700, color: '#fff', lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>{sub}</div>}
    </div>
  )
}

export default async function MasterDashboard() {
  await requireAdminSession()
  const { totalContacts, newLeads30d, newLeads7d, openInsights, recentReports, totals } = await getKpis()

  return (
    <div style={{ padding: '28px 24px', maxWidth: 1100, margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', marginBottom: 4 }}>Master Dashboard</h1>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.85rem' }}>Latimore Life & Legacy — Hub OS command center</p>
      </div>

      {/* KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12, marginBottom: 28 }}>
        <KpiTile label="Total Contacts" value={totalContacts.toLocaleString()} />
        <KpiTile label="New Leads (30d)" value={newLeads30d} />
        <KpiTile label="New Leads (7d)" value={newLeads7d} />
        <KpiTile label="Open Insights" value={openInsights} />
        <KpiTile label="Impressions (30d)" value={totals.impressions.toLocaleString()} />
        <KpiTile label="Reach (30d)" value={totals.reach.toLocaleString()} />
        <KpiTile label="Social Leads (30d)" value={totals.leads.toLocaleString()} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 28 }}>
        {/* Marketing Phases */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(196,154,108,0.15)', borderRadius: 12, padding: '20px 22px' }}>
          <div style={{ fontSize: '0.72rem', color: '#C49A6C', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 16 }}>
            Marketing Roadmap
          </div>
          {PHASES.map(p => (
            <div key={p.phase} style={{ display: 'flex', gap: 14, marginBottom: 14, alignItems: 'flex-start' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: STATUS_COLORS[p.status] + '20', border: `2px solid ${STATUS_COLORS[p.status]}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: STATUS_COLORS[p.status] }}>{p.phase}</span>
              </div>
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 600, color: STATUS_COLORS[p.status], marginBottom: 2 }}>
                  Phase {p.phase}: {p.label}
                  <span style={{ marginLeft: 8, fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: 1, opacity: 0.7 }}>{p.status}</span>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)' }}>{p.description}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Reports */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(196,154,108,0.15)', borderRadius: 12, padding: '20px 22px' }}>
          <div style={{ fontSize: '0.72rem', color: '#C49A6C', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 16 }}>
            Recent Weekly Reports
          </div>
          {recentReports.length === 0 && (
            <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem' }}>No reports generated yet.</div>
          )}
          {recentReports.map(r => {
            const kpis = r.kpis as Record<string, number>
            return (
              <div key={r.id} style={{ marginBottom: 12, padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
                <div style={{ fontSize: '0.82rem', color: '#fff', fontWeight: 600, marginBottom: 4 }}>
                  {r.weekStart.toLocaleDateString()} – {r.weekEnd.toLocaleDateString()}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)' }}>
                  Reach {(kpis?.reach ?? 0).toLocaleString()} · Leads {kpis?.leads ?? 0}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Quick Links */}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(196,154,108,0.15)', borderRadius: 12, padding: '20px 22px' }}>
        <div style={{ fontSize: '0.72rem', color: '#C49A6C', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 16 }}>
          Quick Actions
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {[
            { href: '/admin/engagement-dashboard', label: 'Engagement Intel' },
            { href: '/admin/crm/hub', label: 'Life Hub CRM' },
            { href: '/admin/social-os', label: 'Social OS' },
            { href: '/admin/content/creator', label: 'Content Architect' },
            { href: '/admin/reports', label: 'Reports' },
            { href: '/admin/analytics', label: 'Analytics' },
          ].map(link => (
            <a
              key={link.href}
              href={link.href}
              style={{
                background: 'rgba(196,154,108,0.12)',
                border: '1px solid rgba(196,154,108,0.25)',
                color: '#C49A6C',
                padding: '8px 16px',
                borderRadius: 6,
                fontSize: '0.82rem',
                fontWeight: 500,
                textDecoration: 'none',
              }}
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
