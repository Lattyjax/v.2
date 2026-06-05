import { prisma } from '@/lib/prisma'
import PageHeader from '../../_components/PageHeader'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

const STATUS_COLORS: Record<string, string> = {
  draft: 'text-amber-400 bg-amber-500/10',
  approved: 'text-sky-400 bg-sky-500/10',
  scheduled: 'text-blue-400 bg-blue-500/10',
  published: 'text-emerald-400 bg-emerald-500/10',
  archived: 'text-slate-400 bg-slate-500/10',
}

export default async function CampaignsPage() {
  const assets = await prisma.contentAsset.findMany({
    orderBy: { createdAt: 'desc' },
    take: 500,
  })

  // Group by campaign name (null = "Uncategorized")
  const grouped = assets.reduce<Record<string, typeof assets>>((acc, a) => {
    const key = a.campaign ?? '__none__'
    if (!acc[key]) acc[key] = []
    acc[key].push(a)
    return acc
  }, {})

  const campaigns = Object.entries(grouped)
    .filter(([k]) => k !== '__none__')
    .sort((a, b) => b[1].length - a[1].length)

  const uncategorized = grouped['__none__'] ?? []

  return (
    <div className="p-6 md:p-8 space-y-8">
      <PageHeader
        eyebrow="Campaign Management"
        title="Campaigns"
        description="Content grouped by campaign — create posts in Content Architect to build campaigns"
      />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Active Campaigns', value: campaigns.length },
          { label: 'Total Assets', value: assets.length },
          { label: 'Published', value: assets.filter(a => a.status === 'published').length },
        ].map(s => (
          <div key={s.label} className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
            <p className="text-2xl font-black text-white">{s.value}</p>
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {campaigns.length === 0 && uncategorized.length === 0 && (
        <div className="bg-white/5 border border-white/10 rounded-3xl p-12 text-center">
          <i className="fa-solid fa-calendar-days text-5xl text-slate-600 mb-4"></i>
          <p className="text-slate-400 mb-2">No campaigns yet</p>
          <p className="text-slate-500 text-sm">Use Campaign Auto-Pilot in Social OS or tag content with a campaign name in Content Architect</p>
          <Link href="/admin/social-os" className="inline-block mt-4 px-5 py-2 bg-[#C9A25F] text-slate-900 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-[#D4AF77] transition">
            Go to Social OS
          </Link>
        </div>
      )}

      {/* Campaign groups */}
      <div className="space-y-6">
        {campaigns.map(([name, posts]) => {
          const published = posts.filter(p => p.status === 'published').length
          const scheduled = posts.filter(p => p.status === 'scheduled').length
          return (
            <div key={name} className="bg-white/5 border border-white/10 rounded-3xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-black text-white text-lg">{name}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {posts.length} assets · {published} published · {scheduled} scheduled
                  </p>
                </div>
                <div className="flex gap-3 text-center">
                  <div>
                    <p className="text-xl font-black text-[#C9A25F]">{published}</p>
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Live</p>
                  </div>
                  <div>
                    <p className="text-xl font-black text-blue-400">{scheduled}</p>
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Queued</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                {posts.slice(0, 4).map(p => (
                  <div key={p.id} className="flex items-center gap-3 bg-white/4 rounded-xl px-4 py-2.5">
                    <i className="fa-solid fa-share-nodes text-[#C9A25F] text-xs w-4"></i>
                    <p className="flex-1 text-sm text-slate-300 truncate">{p.title}</p>
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${STATUS_COLORS[p.status] ?? 'bg-slate-500/10 text-slate-400'}`}>
                      {p.status}
                    </span>
                  </div>
                ))}
                {posts.length > 4 && (
                  <p className="text-xs text-slate-500 pl-4">+{posts.length - 4} more assets</p>
                )}
              </div>
            </div>
          )
        })}

        {/* Uncategorized */}
        {uncategorized.length > 0 && (
          <div className="bg-white/3 border border-white/6 rounded-3xl p-6">
            <h3 className="font-bold text-slate-400 mb-3 text-sm">Uncampaigned ({uncategorized.length})</h3>
            <div className="space-y-2">
              {uncategorized.slice(0, 5).map(p => (
                <div key={p.id} className="flex items-center gap-3 bg-white/3 rounded-xl px-4 py-2">
                  <p className="flex-1 text-sm text-slate-500 truncate">{p.title}</p>
                  <span className="text-[9px] text-slate-600">{new Date(p.createdAt).toLocaleDateString()}</span>
                </div>
              ))}
              {uncategorized.length > 5 && (
                <p className="text-xs text-slate-600 pl-4">+{uncategorized.length - 5} more</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
