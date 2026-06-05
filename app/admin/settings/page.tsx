import Link from 'next/link'

export default function SettingsPage() {
  const sections = [
    {
      href: '/admin/settings/analytics',
      icon: 'fa-chart-bar',
      title: 'Analytics',
      description: 'Configure GA4, tracking pixels, and event settings.',
    },
    {
      href: '/admin/settings/calendar',
      icon: 'fa-calendar-check',
      title: 'Calendar',
      description: 'Manage booking calendar integrations and availability.',
    },
  ]

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <div className="mb-10">
        <h1 className="text-2xl font-black tracking-wide text-[#F7F7F5]">Settings</h1>
        <p className="mt-1 text-sm text-[#A9B1BE]">Configure platform integrations and preferences.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {sections.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="group flex items-start gap-4 rounded-2xl border border-white/8 bg-white/4 p-5 transition hover:border-[#C9A25F]/40 hover:bg-white/6"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#C9A25F]/10">
              <i className={`fa-solid ${s.icon} text-[#C9A25F]`}></i>
            </div>
            <div>
              <p className="font-semibold text-[#F7F7F5] group-hover:text-[#C9A25F] transition">{s.title}</p>
              <p className="mt-0.5 text-sm text-[#A9B1BE]">{s.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
