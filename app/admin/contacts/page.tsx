export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { Mail, Phone, UserRound } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import PageHeader from '../_components/PageHeader'
import AdminCard from '../_components/AdminCard'
import StatPill from '../_components/StatPill'
import EmptyState from '../_components/EmptyState'

function fmtDate(value?: Date | null) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(value)
}

function displayName(contact: { fullName?: string | null; firstName?: string | null; lastName?: string | null; email?: string | null; phone?: string | null }) {
  return contact.fullName || [contact.firstName, contact.lastName].filter(Boolean).join(' ') || contact.email || contact.phone || 'Unknown Contact'
}

export default async function ContactsPage() {
  const contacts = await prisma.contact.findMany({
    take: 50,
    orderBy: [{ leadScore: 'desc' }, { updatedAt: 'desc' }],
    include: {
      inquiries: { orderBy: { updatedAt: 'desc' }, take: 1 },
      tasks: { where: { status: { in: ['Open', 'In_Progress', 'Snoozed'] } }, take: 3, orderBy: { dueAt: 'asc' } },
    },
  })

  return (
    <div className="p-6 md:p-8">
      <PageHeader eyebrow="CRM" title="Contacts" description="Unified lead and client directory with pipeline stage and recent activity." />
      <AdminCard title="Lead and client records" subtitle="Top 50 contacts ordered by lead score and freshness.">
        {contacts.length === 0 ? <EmptyState title="No contacts available" description="Once leads are captured, they will appear here." icon={<UserRound size={18} />} /> : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-y-3">
              <thead>
                <tr className="text-left text-xs uppercase tracking-[0.18em] text-[#8F98A8]">
                  <th className="px-3 py-2">Contact</th>
                  <th className="px-3 py-2">Stage</th>
                  <th className="px-3 py-2">Score</th>
                  <th className="px-3 py-2">Source</th>
                  <th className="px-3 py-2">Tasks</th>
                  <th className="px-3 py-2">Last Activity</th>
                  <th className="px-3 py-2">Open</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((contact) => {
                  const inquiry = contact.inquiries[0]
                  return (
                    <tr key={contact.id} className="rounded-2xl bg-white/[0.02]">
                      <td className="rounded-l-2xl border-y border-l border-white/8 px-3 py-4">
                        <div>
                          <p className="text-sm font-semibold text-white">{displayName(contact)}</p>
                          <div className="mt-2 flex flex-wrap gap-3 text-xs text-[#A9B1BE]">
                            {contact.email ? <span className="inline-flex items-center gap-1.5"><Mail size={12} />{contact.email}</span> : null}
                            {contact.phone ? <span className="inline-flex items-center gap-1.5"><Phone size={12} />{contact.phone}</span> : null}
                          </div>
                        </div>
                      </td>
                      <td className="border-y border-white/8 px-3 py-4"><StatPill label="Stage" value={inquiry?.stage ?? '—'} /></td>
                      <td className="border-y border-white/8 px-3 py-4"><StatPill label="Lead" value={contact.leadScore} tone={contact.leadScore >= 80 ? 'good' : contact.leadScore >= 60 ? 'warn' : 'default'} /></td>
                      <td className="border-y border-white/8 px-3 py-4">
                        <div className="text-sm text-white">{contact.primarySource ?? '—'}</div>
                        <div className="mt-1 text-xs text-[#A9B1BE]">{[contact.primaryMedium, contact.primaryCampaign].filter(Boolean).join(' · ') || 'No attribution'}</div>
                      </td>
                      <td className="border-y border-white/8 px-3 py-4">
                        <div className="text-sm text-white">{contact.tasks.length}</div>
                        <div className="mt-1 text-xs text-[#A9B1BE]">{contact.tasks[0]?.title ?? 'No open tasks'}</div>
                      </td>
                      <td className="border-y border-white/8 px-3 py-4 text-sm text-[#D7DCE5]">{fmtDate(contact.lastActivityAt)}</td>
                      <td className="rounded-r-2xl border-y border-r border-white/8 px-3 py-4">
                        <Link href={`/admin/contacts/${contact.id}`} className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white transition hover:bg-white/10">Details</Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>
    </div>
  )
}
