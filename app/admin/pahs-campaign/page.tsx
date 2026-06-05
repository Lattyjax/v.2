export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import PAHSCampaignClient from './PAHSCampaignClient'

const PAHS_WHERE = {
  OR: [
    { source: { contains: 'PAHS', mode: 'insensitive' as const } },
    { landingPage: { contains: 'pahs', mode: 'insensitive' as const } },
  ],
}

export default async function PAHSCampaignPage() {
  const [leadsTotal, leadsByStage, pageVisits, qrSessions, appointmentsTotal, recentLeads] =
    await Promise.all([
      prisma.inquiry.count({ where: PAHS_WHERE }),

      prisma.inquiry.groupBy({
        by: ['stage'],
        where: PAHS_WHERE,
        _count: { _all: true },
      }),

      prisma.event.count({
        where: {
          eventType: 'page_view',
          pageUrl: { contains: 'pahs', mode: 'insensitive' },
        },
      }),

      prisma.leadSession.count({
        where: { landingPage: { contains: 'pahs', mode: 'insensitive' } },
      }),

      prisma.appointment.count({
        where: {
          inquiry: { is: PAHS_WHERE },
        },
      }),

      prisma.inquiry.findMany({
        where: PAHS_WHERE,
        orderBy: { createdAt: 'desc' },
        take: 15,
        include: {
          contact: {
            select: { firstName: true, lastName: true, email: true, phone: true },
          },
        },
      }),
    ])

  const pipelineMap = Object.fromEntries(
    leadsByStage.map((r) => [r.stage, r._count._all])
  )

  return (
    <PAHSCampaignClient
      stats={{
        leadsTotal,
        pipelineMap,
        pageVisits,
        qrSessions,
        appointmentsTotal,
        recentLeads: recentLeads.map((i) => ({
          id: i.id,
          name:
            [i.contact?.firstName, i.contact?.lastName].filter(Boolean).join(' ') || 'Unknown',
          email: i.contact?.email ?? '',
          phone: i.contact?.phone ?? '',
          stage: i.stage,
          source: i.source ?? '',
          productInterest: String(i.productInterest).replace(/_/g, ' '),
          createdAt: i.createdAt.toISOString(),
        })),
      }}
    />
  )
}
