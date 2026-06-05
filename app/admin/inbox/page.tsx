import { prisma } from '@/lib/prisma'
import PageHeader from '../_components/PageHeader'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

const STAGE_COLORS: Record<string, string> = {
  New: 'bg-sky-500/10 text-sky-400',
  Attempted_Contact: 'bg-amber-500/10 text-amber-400',
  Qualified: 'bg-violet-500/10 text-violet-400',
  Booked: 'bg-emerald-500/10 text-emerald-400',
  Sold: 'bg-green-500/10 text-green-400',
  Follow_Up: 'bg-orange-500/10 text-orange-400',
  Lost: 'bg-red-500/10 text-red-400',
}

export default async function InboxPage() {
  const inquiries = await prisma.inquiry.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: { contact: { select: { fullName: true, email: true, phone: true, county: true } } },
  })

  const stageCount = inquiries.reduce<Record<string, number>>((acc, i) => {
    acc[i.stage] = (acc[i.stage] ?? 0) + 1
    return acc
  }, {})

  return (
    <div className="p-6 md:p-8 space-y-8">
      <PageHeader
        eyebrow="Lead Management"
        title="Inbox (Intake)"
        description="All form submissions and new inquiries from every channel"
      />

      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Inquiries', value: inquiries.length },
          { label: 'New', value: stageCount['New'] ?? 0 },
          { label: 'Booked', value: stageCount['Booked'] ?? 0 },
          { label: 'Sold', value: stageCount['Sold'] ?? 0 },
        ].map(s => (
          <div key={s.label} className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
            <p className="text-2xl font-black text-white">{s.value}</p>
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Inquiry list */}
      <div className="space-y-3">
        {inquiries.length === 0 && (
          <div className="bg-white/5 border border-white/10 rounded-3xl p-12 text-center">
            <i className="fa-solid fa-inbox text-5xl text-slate-600 mb-4"></i>
            <p className="text-slate-400">No inquiries yet</p>
          </div>
        )}
        {inquiries.map(inq => (
          <Link
            key={inq.id}
            href={`/admin/crm/hub?contact=${inq.contactId}`}
            className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/8 hover:border-white/20 transition group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#C9A25F]/15 flex items-center justify-center flex-shrink-0">
              <i className="fa-solid fa-user text-[#C9A25F] text-sm"></i>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-white text-sm truncate">
                {inq.contact?.fullName ?? inq.contact?.email ?? 'Unknown'}
              </p>
              <p className="text-xs text-slate-400 truncate">
                {[inq.productInterest.replace(/_/g, ' '), inq.contact?.county, inq.source]
                  .filter(Boolean).join(' · ')}
              </p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full ${STAGE_COLORS[inq.stage] ?? 'bg-slate-500/10 text-slate-400'}`}>
                {inq.stage.replace(/_/g, ' ')}
              </span>
              <span className="text-[10px] text-slate-500 hidden sm:block">
                {new Date(inq.createdAt).toLocaleDateString()}
              </span>
              <i className="fa-solid fa-chevron-right text-slate-600 text-xs group-hover:text-[#C9A25F] transition"></i>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
