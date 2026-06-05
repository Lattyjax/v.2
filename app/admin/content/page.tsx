export const dynamic = 'force-dynamic'

import { FileText } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import PageHeader from '../_components/PageHeader'
import AdminCard from '../_components/AdminCard'
import EmptyState from '../_components/EmptyState'
import StatPill from '../_components/StatPill'
import { countAll } from '@/lib/prisma-helpers'


function fmtDate(value?: Date | null) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(value)
}

export default async function ContentPage() {
  const [assets, counts] = await Promise.all([
    prisma.contentAsset.findMany({ orderBy: { createdAt: 'desc' }, take: 30 }),
    prisma.contentAsset.groupBy({ by: ['status'], _count: { _all: true } }),
  ])

  return (
    <div className="p-6 md:p-8">
      <PageHeader eyebrow="Marketing OS" title="Content" description="AI-assisted content drafts for SMS, email, social, blog, and landing page workflows." />
      <div className="mb-4 flex flex-wrap gap-2">{counts.map((row) => <StatPill key={row.status} label={row.status} value={countAll(row._count)} />)}</div>
      <AdminCard title="Recent content assets">
        {assets.length === 0 ? <EmptyState title="No content yet" description="Use /api/content/generate to create your first AI draft." icon={<FileText size={18} />} /> : <div className="space-y-3">{assets.map((asset) => <div key={asset.id} className="rounded-2xl border border-white/8 bg-white/[0.02] p-4"><div className="mb-3 flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm font-semibold text-white">{asset.title}</p><p className="mt-1 text-xs text-[#A9B1BE]">{asset.type} · {asset.channel ?? 'no channel'} · {asset.campaign ?? 'no campaign'}</p></div><div className="flex flex-wrap gap-2"><StatPill label="Status" value={asset.status} /><StatPill label="Product" value={asset.productInterest ?? '—'} /></div></div><p className="line-clamp-4 whitespace-pre-wrap text-sm leading-6 text-[#E6EAF0]">{asset.bodyText ?? '(No body text)'}</p><div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-[#8F98A8]"><span>Created: {fmtDate(asset.createdAt)}</span><span>Scheduled: {fmtDate(asset.scheduledFor)}</span><span>Published: {fmtDate(asset.publishedAt)}</span></div></div>)}</div>}
      </AdminCard>
    </div>
  )
}
