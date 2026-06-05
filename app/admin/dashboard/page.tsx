export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import PageHeader from '../_components/PageHeader'
import { BRAND_STORY } from '../_lib/templates'
import DailyBrief from './DailyBrief'
import { logger } from '@/lib/logger'

const StatCard = ({ title, value, trend, icon, color }: any) => (
  <div className="bg-white/5 border border-white/10 p-6 rounded-2xl transition-all hover:bg-white/10 hover:border-white/20">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl ${color} bg-opacity-20`}>
        <i className={`fa-solid ${icon} text-xl`}></i>
      </div>
      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${trend >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
        {trend >= 0 ? '+' : ''}{trend}%
      </span>
    </div>
    <h3 className="text-slate-400 text-sm font-medium">{title}</h3>
    <p className="text-2xl font-bold text-white mt-1">{value.toLocaleString()}</p>
  </div>
)

export default async function LegacyPulsePage() {
  let contactCount = 0
  let inquiryCount = 0
  let appointmentCount = 0
  let recentContacts: any[] = []
  let isDbConnected = true

  try {
    const counts = await Promise.all([
      prisma.contact.count(),
      prisma.inquiry.count(),
      prisma.appointment.count(),
    ])
    contactCount = counts[0]
    inquiryCount = counts[1]
    appointmentCount = counts[2]

    recentContacts = await prisma.contact.findMany({
      take: 6,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        leadScore: true,
        status: true,
      },
    })
  } catch (error: any) {
    isDbConnected = false
    logger.error({ err: error?.message }, 'Dashboard DB fetch failed')
  }

  return (
    <div className="p-6 md:p-8 space-y-8">
      <PageHeader
        eyebrow="Latimore Hub OS"
        title="Legacy Pulse"
        description={`${BRAND_STORY.tagline} ${BRAND_STORY.hashtag}`}
        actions={
          <>
            <Link href="/admin/crm/hub" className="inline-flex items-center gap-2 rounded-xl border border-[#C9A25F]/25 bg-[#C9A25F]/10 px-4 py-2 text-sm font-medium text-[#F4E6C5] transition hover:bg-[#C9A25F]/15">
              <i className="fa-solid fa-users-gear" /> CRM Hub
            </Link>
            <Link href="/admin/content/creator" className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10">
              <i className="fa-solid fa-pen-nib" /> Create Content
            </Link>
          </>
        }
      />

      {!isDbConnected && (
        <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl text-rose-400 text-sm flex items-center gap-3">
          <i className="fa-solid fa-triangle-exclamation text-lg" />
          <div>
            <p className="font-bold">Database connection unreachable</p>
            <p className="text-rose-400/70 text-xs">Displaying placeholder values. Check your DATABASE_URL configuration.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        <StatCard title="Total Contacts" value={contactCount} trend={12} icon="fa-address-book" color="text-blue-400 bg-blue-500" />
        <StatCard title="Active Inquiries" value={inquiryCount} trend={5} icon="fa-comment-dots" color="text-[#C9A25F] bg-[#C9A25F]" />
        <StatCard title="Appointments" value={appointmentCount} trend={-2} icon="fa-calendar-check" color="text-purple-400 bg-purple-500" />
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { id: 'links', label: 'Portals', icon: 'fa-link', href: '/admin/links' },
          { id: 'docs', label: 'Docs', icon: 'fa-folder-open', href: '/admin/docs' },
          { id: 'crm', label: 'CRM', icon: 'fa-users-gear', href: '/admin/crm/hub' },
          { id: 'creator', label: 'Create', icon: 'fa-pen-nib', href: '/admin/content/creator' },
        ].map((a) => (
          <Link
            key={a.id}
            href={a.href}
            className="bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-left hover:bg-white/10 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white">
                <i className={`fa-solid ${a.icon}`}></i>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Quick</p>
                <p className="text-sm font-black text-white">{a.label}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Mission Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl">
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="space-y-4">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#C49A6C]">Mission Grounding</span>
              <h2 className="text-3xl font-black leading-tight">Protecting what matters. Building legacies that outlive them.</h2>
              <p className="text-slate-400 text-sm leading-relaxed italic max-w-md">
                "{BRAND_STORY.origin}"
              </p>
            </div>
          </div>
        </div>

        {/* Daily Brief */}
        <DailyBrief />
      </div>

      {/* Recent Contacts */}
      <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10">
          <h3 className="text-xl font-black text-white">Recent Contacts</h3>
        </div>
        <div className="overflow-x-auto">
          {recentContacts.length === 0 ? (
            <p className="p-8 text-center text-slate-400 text-sm">No contacts in the system yet.</p>
          ) : null}
          <table className={`w-full text-sm${recentContacts.length === 0 ? ' hidden' : ''}`}>
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-6 py-3 text-left text-xs font-black uppercase tracking-widest text-slate-400">Name</th>
                <th className="px-6 py-3 text-left text-xs font-black uppercase tracking-widest text-slate-400">Email</th>
                <th className="px-6 py-3 text-left text-xs font-black uppercase tracking-widest text-slate-400">Lead Score</th>
                <th className="px-6 py-3 text-left text-xs font-black uppercase tracking-widest text-slate-400">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentContacts.map((contact) => (
                <tr key={contact.id} className="border-b border-white/5 hover:bg-white/5 transition">
                  <td className="px-6 py-3">
                    <Link href={`/admin/contacts/${contact.id}`} className="text-white hover:text-[#C9A25F] transition">
                      {contact.firstName} {contact.lastName}
                    </Link>
                  </td>
                  <td className="px-6 py-3 text-slate-400">{contact.email}</td>
                  <td className="px-6 py-3">
                    <span className="text-yellow-400 font-semibold">{contact.leadScore || 0}%</span>
                  </td>
                  <td className="px-6 py-3">
                    <span className="inline-flex items-center gap-2 text-xs font-semibold px-2 py-1 rounded-full bg-blue-500/20 text-blue-400">
                      {contact.status || 'New Lead'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
