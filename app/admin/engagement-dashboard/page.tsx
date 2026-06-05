import { requireAdminSession } from '@/lib/ai/shared'
import EngagementDashboardClient from './EngagementDashboardClient'

export const dynamic = 'force-dynamic'

export default async function EngagementDashboardPage() {
  await requireAdminSession()
  return <EngagementDashboardClient />
}
