import MarketingTools from '../social-os/_components/MarketingTools'
import { MarketingDashboard } from '@/components/nexus/MarketingDashboard'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Marketing | Latimore Hub OS',
}

export default function MarketingToolsPage() {
  return (
    <div className="space-y-8">
      <div className="p-6 md:p-8">
        <MarketingTools />
      </div>
      <MarketingDashboard />
    </div>
  )
}
