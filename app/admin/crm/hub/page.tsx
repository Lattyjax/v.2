export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import LifeHubCRMContent from './LifeHubCRM'

export default async function LifeHubPage() {
  const contacts = await prisma.contact.findMany({
    include: {
      inquiries: {
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
    },
    orderBy: { leadScore: 'desc' },
    take: 500,
  })

  return <LifeHubCRMContent initialContacts={contacts} />
}
