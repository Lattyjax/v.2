import { prisma } from '@/lib/prisma'

export async function computeLeadScore(input: { contactId?: string | null; inquiryId?: string | null }) {
  if (!input.contactId && !input.inquiryId) throw new Error('contactId or inquiryId is required')

  const inquiry =
    input.inquiryId
      ? await prisma.inquiry.findUnique({ where: { id: input.inquiryId }, include: { contact: true } })
      : null

  const contactId = input.contactId ?? inquiry?.contactId
  if (!contactId) throw new Error('Unable to resolve contact')

  const contact = await prisma.contact.findUnique({
    where: { id: contactId },
    include: {
      inquiries: { orderBy: { updatedAt: 'desc' }, take: 10 },
      tasks: { orderBy: { createdAt: 'desc' }, take: 20 },
      appointments: { orderBy: { createdAt: 'desc' }, take: 20 },
      conversationMessages: { orderBy: { createdAt: 'desc' }, take: 25 },
      systemEvents: { orderBy: { occurredAt: 'desc' }, take: 50 },
    },
  })
  if (!contact) throw new Error('Contact not found')
  const activeInquiry = inquiry ?? contact.inquiries[0] ?? null
  const now = new Date()

  let score = 0
  const reasons: string[] = []
  const recommendations: string[] = []

  if (contact.lastActivityAt) {
    const days = Math.floor((now.getTime() - contact.lastActivityAt.getTime()) / 86400000)
    if (days <= 1) { score += 20; reasons.push('Recent activity within 24 hours.') }
    else if (days <= 7) { score += 10; reasons.push('Recent activity within 7 days.') }
    else if (days >= 14) { score -= 15; reasons.push('Inactive for at least 14 days.'); recommendations.push('Send a follow-up touchpoint now.') }
  } else {
    score -= 5
    reasons.push('No recent activity timestamp recorded.')
  }

  const inboundCount = contact.conversationMessages.filter((m) => m.direction === 'inbound').length
  if (inboundCount >= 3) { score += 18; reasons.push('Multiple inbound replies received.') }
  else if (inboundCount >= 1) { score += 8; reasons.push('Lead has replied at least once.') }

  switch (activeInquiry?.stage) {
    case 'Booked':
      score += 18
      reasons.push('Lead has a booked appointment.')
      recommendations.push('Prepare a meeting brief and confirm attendance.')
      break
    case 'Qualified':
      score += 12
      reasons.push('Lead is marked qualified.')
      recommendations.push('Move toward quote presentation.')
      break
    case 'Sold':
      score += 20
      reasons.push('Contact is already sold/client.')
      recommendations.push('Look for retention or referral opportunities.')
      break
    case 'Follow_Up':
      score += 6
      recommendations.push('Resume follow-up cadence before lead cools off.')
      break
    case 'Lost':
      score -= 20
      reasons.push('Lead is marked lost.')
      recommendations.push('Only reactivate if a fresh signal appears.')
      break
    default:
      score += 4
  }

  const upcomingAppointments = contact.appointments.filter((a) => a.scheduledFor && a.scheduledFor > now && a.status === 'Booked')
  if (upcomingAppointments.length >= 1) {
    score += 15
    reasons.push('Upcoming appointment exists.')
  }

  const openTasks = contact.tasks.filter((task) => task.status !== 'Completed' && task.status !== 'Cancelled')
  const overdueTasks = openTasks.filter((task) => task.dueAt && task.dueAt < now)
  if (openTasks.length >= 1) score += 4
  if (overdueTasks.length >= 1) {
    score -= 6
    reasons.push('There are overdue follow-up tasks.')
    recommendations.push('Clear overdue follow-up tasks.')
  }

  score = Math.max(0, Math.min(100, score))
  const category = score >= 80 ? 'hot' : score >= 60 ? 'warm' : score >= 35 ? 'cool' : 'cold'
  if (category === 'hot') recommendations.unshift('Contact this lead today.')
  else if (category === 'warm') recommendations.unshift('Keep this lead active this week.')
  else recommendations.unshift('Use a nurture or reactivation sequence.')

  await prisma.contact.update({
    where: { id: contact.id },
    data: { leadScore: score, lastActivityAt: contact.lastActivityAt ?? undefined },
  })
  if (activeInquiry) {
    await prisma.inquiry.update({
      where: { id: activeInquiry.id },
      data: { leadScore: score },
    })
  }

  return {
    contactId: contact.id,
    inquiryId: activeInquiry?.id ?? null,
    result: {
      total: score,
      category,
      reasons: Array.from(new Set(reasons)),
      recommendations: Array.from(new Set(recommendations)),
    },
  }
}
