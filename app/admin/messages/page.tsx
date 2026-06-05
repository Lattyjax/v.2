export const dynamic = 'force-dynamic'

import { MessageSquareText } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import PageHeader from '../_components/PageHeader'
import AdminCard from '../_components/AdminCard'
import StatPill from '../_components/StatPill'
import EmptyState from '../_components/EmptyState'
import ReplyComposer from './ReplyComposer'

function fmtDate(value?: Date | null) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(value)
}

function displayName(contact: {
  fullName?: string | null
  firstName?: string | null
  lastName?: string | null
  email?: string | null
  phone?: string | null
}) {
  return (
    contact.fullName ||
    [contact.firstName, contact.lastName].filter(Boolean).join(' ') ||
    contact.email ||
    contact.phone ||
    'Unknown Contact'
  )
}

export default async function MessagesPage({
  searchParams,
}: {
  searchParams?: Promise<{ contactId?: string }>
}) {
  const params = (await searchParams) ?? {}
  const threads = await prisma.conversationThread.findMany({
    where: params.contactId ? { contactId: params.contactId } : undefined,
    orderBy: [{ lastMessageAt: 'desc' }, { updatedAt: 'desc' }],
    take: 30,
    include: {
      contact: true,
      inquiry: true,
      messages: { orderBy: { createdAt: 'desc' }, take: 8 },
    },
  })

  return (
    <div className="p-6 md:p-8">
      <PageHeader
        eyebrow="Communications"
        title="Messages"
        description="Unified inbox for SMS and email threads linked to contacts and inquiries."
      />

      {threads.length === 0 ? (
        <EmptyState
          title="No message threads yet"
          description="Once Twilio SMS or email integrations are connected, conversation threads will appear here."
          icon={<MessageSquareText size={18} />}
        />
      ) : (
        <div className="space-y-4">
          {threads.map((thread) => {
            const name = displayName(thread.contact)

            return (
              <AdminCard
                key={thread.id}
                title={name}
                subtitle={`${thread.channel.toUpperCase()}${thread.subject ? ` · ${thread.subject}` : ''}`}
                action={
                  <div className="flex gap-2">
                    <StatPill label="Last inbound" value={fmtDate(thread.lastInboundAt)} />
                    <StatPill label="Last outbound" value={fmtDate(thread.lastOutboundAt)} />
                  </div>
                }
              >
                <div className="space-y-3">
                  {thread.messages.slice().reverse().map((message) => (
                    <div
                      key={message.id}
                      className={`rounded-2xl border px-4 py-3 ${
                        message.direction === 'outbound'
                          ? 'border-[#C9A25F]/20 bg-[#C9A25F]/6'
                          : 'border-white/8 bg-white/[0.03]'
                      }`}
                    >
                      <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <StatPill label="Direction" value={message.direction} />
                          <StatPill label="Status" value={message.status ?? '—'} />
                        </div>
                        <p className="text-xs text-[#8F98A8]">{fmtDate(message.createdAt)}</p>
                      </div>

                      {message.subject ? (
                        <p className="mb-2 text-sm font-semibold text-white">{message.subject}</p>
                      ) : null}

                      <p className="whitespace-pre-wrap text-sm leading-6 text-[#E6EAF0]">
                        {message.bodyText ?? '(No body text)'}
                      </p>
                    </div>
                  ))}
                </div>

                <ReplyComposer
                  contactId={thread.contactId}
                  inquiryId={thread.inquiryId}
                  channel={thread.channel}
                  defaultSubject={thread.subject}
                  contactName={name}
                />
              </AdminCard>
            )
          })}
        </div>
      )}
    </div>
  )
}