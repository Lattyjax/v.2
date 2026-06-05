import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import AdminMobileNav from './_components/AdminMobileNav'
import NotificationCenter from './_components/NotificationCenter'

const navItems = [
  { href: '/admin/master-dashboard', label: 'Master Dashboard', icon: 'fa-gauge-high' },
  { href: '/admin/dashboard', label: 'Dashboard', icon: 'fa-chart-line' },
  { href: '/admin/nexus-agent', label: 'Nexus Agent', icon: 'fa-robot' },
  { href: '/admin/workflow', label: 'Workflow Builder', icon: 'fa-diagram-project' },
  { href: '/admin/autonomous-monitor', label: 'Auto Monitor', icon: 'fa-tower-broadcast' },
  { href: '/admin/social-os', label: 'Social OS', icon: 'fa-shield-heart' },
  { href: '/admin/links', label: 'Portals & Links', icon: 'fa-link' },
  { href: '/admin/docs', label: 'Brochures & Docs', icon: 'fa-folder-open' },
  { href: '/admin/inbox', label: 'Inbox (Intake)', icon: 'fa-inbox' },
  { href: '/admin/crm/hub', label: 'Life Hub CRM', icon: 'fa-users-gear' },
  { href: '/admin/library', label: 'Strategy Library', icon: 'fa-book-bookmark' },
  { href: '/admin/annuity-platform', label: 'Annuity Platform', icon: 'fa-shield-halved' },
  { href: '/admin/vault', label: 'Asset Vault', icon: 'fa-vault' },
  { href: '/admin/content/creator', label: 'Content Architect', icon: 'fa-pen-nib' },
  { href: '/admin/marketing', label: 'Marketing Tools', icon: 'fa-toolbox' },
  { href: '/admin/funnels', label: 'Legacy Hub', icon: 'fa-filter-circle-dollar' },
  { href: '/admin/content/calendar', label: 'Content Calendar', icon: 'fa-calendar-week' },
  { href: '/admin/content/schedule', label: 'Schedule', icon: 'fa-calendar-check' },
  { href: '/admin/content/campaigns', label: 'Campaigns', icon: 'fa-calendar-days' },
  { href: '/admin/pahs-campaign', label: 'PAHS Campaign', icon: 'fa-football' },
  { href: '/admin/connectors', label: 'Integrations', icon: 'fa-plug' },
  { href: '/admin/settings', label: 'Settings', icon: 'fa-gear' },
  { href: '/admin/messages', label: 'Messages', icon: 'fa-message' },
  { href: '/admin/tasks', label: 'Tasks', icon: 'fa-check-square' },
  { href: '/admin/analytics', label: 'Analytics', icon: 'fa-chart-bar' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#0B0F17] text-[#F7F7F5]">

      {/* Desktop sidebar — visible xl+ */}
      <aside className="hidden w-64 shrink-0 border-r border-white/6 bg-[#0E1420] xl:flex xl:flex-col">
        <div className="border-b border-white/6 px-5 py-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-black tracking-[0.35em] text-[#C9A25F]">LATIMORE</p>
              <p className="mt-1 text-xs text-[#A9B1BE]">Hub OS Admin</p>
            </div>
            <NotificationCenter />
          </div>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[#A9B1BE] transition hover:bg-white/5 hover:text-white"
            >
              <i className={`fa-solid ${item.icon} w-4 text-center text-[#C9A25F]`}></i>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="border-t border-white/6 p-3">
          <Link href="/" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[#A9B1BE] transition hover:bg-white/5 hover:text-white">
            <ArrowLeft size={16} />
            <span>Back to Site</span>
          </Link>
        </div>
      </aside>

      {/* Mobile top bar + drawer — visible below xl */}
      <div className="fixed inset-x-0 top-0 z-50 xl:hidden">
        <AdminMobileNav navItems={navItems} />
      </div>

      <main className="min-w-0 flex-1 overflow-auto xl:mt-0 mt-14">
        <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(201,162,95,0.08),transparent_28%),linear-gradient(to_bottom,#0B0F17,#101826)]">
          {children}
        </div>
      </main>
    </div>
  )
}