import { prisma } from '@/lib/prisma'
import PageHeader from '../_components/PageHeader'

export const dynamic = 'force-dynamic'

const TYPE_ICONS: Record<string, string> = {
  social_post: 'fa-share-nodes',
  email: 'fa-envelope',
  sms: 'fa-message',
  blog: 'fa-newspaper',
  landing_page: 'fa-browser',
}

const STATUS_COLORS: Record<string, string> = {
  draft: 'text-amber-400 bg-amber-500/10',
  approved: 'text-sky-400 bg-sky-500/10',
  scheduled: 'text-blue-400 bg-blue-500/10',
  published: 'text-emerald-400 bg-emerald-500/10',
  archived: 'text-slate-400 bg-slate-500/10',
}

export default async function AssetVaultPage() {
  const assets = await prisma.contentAsset.findMany({
    orderBy: { createdAt: 'desc' },
    take: 200,
  })

  const byType = assets.reduce<Record<string, number>>((acc, a) => {
    acc[a.type] = (acc[a.type] ?? 0) + 1
    return acc
  }, {})

  return (
    <div className="p-6 md:p-8 space-y-8">
      <PageHeader
        eyebrow="Media Library"
        title="Asset Vault"
        description="Every piece of content ever created — posts, emails, campaigns, and more"
      />

      {/* Type breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {['social_post', 'email', 'sms', 'blog', 'landing_page'].map(t => (
          <div key={t} className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
            <i className={`fa-solid ${TYPE_ICONS[t]} text-[#C9A25F] text-xl mb-2`}></i>
            <p className="text-xl font-black text-white">{byType[t] ?? 0}</p>
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-1">
              {t.replace('_', ' ')}
            </p>
          </div>
        ))}
      </div>

      {/* Asset list */}
      <div className="space-y-3">
        {assets.length === 0 && (
          <div className="bg-white/5 border border-white/10 rounded-3xl p-12 text-center">
            <i className="fa-solid fa-vault text-5xl text-slate-600 mb-4"></i>
            <p className="text-slate-400">No assets yet — create content in the Content Architect tab</p>
          </div>
        )}
        {assets.map(asset => (
          <div key={asset.id} className="flex items-start gap-4 bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/8 transition">
            <div className="w-10 h-10 rounded-xl bg-[#C9A25F]/15 flex items-center justify-center flex-shrink-0 mt-0.5">
              <i className={`fa-solid ${TYPE_ICONS[asset.type] ?? 'fa-file'} text-[#C9A25F] text-sm`}></i>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-bold text-white text-sm">{asset.title}</p>
                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${STATUS_COLORS[asset.status] ?? 'bg-slate-500/10 text-slate-400'}`}>
                  {asset.status}
                </span>
              </div>
              {asset.bodyText && (
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">{asset.bodyText}</p>
              )}
              <p className="text-[10px] text-slate-500 mt-1">
                {[asset.channel, asset.campaign, new Date(asset.createdAt).toLocaleDateString()].filter(Boolean).join(' · ')}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
