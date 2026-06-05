import { Opportunity } from '../lib/types'
import SectionLoader from './SectionLoader'
import EmptyState from '@/app/_components/EmptyState'

function fmtDate(value: string | null) {
  if (!value) return 'No activity'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function fallback(value: string | null | undefined, text = '—') {
  return value && value.trim().length > 0 ? value : text
}

export default function OpportunitiesTable({
  opportunities,
  loading,
  error,
}: {
  opportunities: Opportunity[] | null
  loading: boolean
  error: string | null
}) {
  if (loading) return <SectionLoader />
  if (error) return <EmptyState title="Opportunities unavailable" description={error} />
  if (!opportunities || opportunities.length === 0) {
    return <EmptyState title="No priority opportunities yet" description="Hot leads and follow-up priorities will appear once scoring data is available." />
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
      <div className="border-b border-white/10 p-5">
        <h2 className="text-lg font-semibold text-white">Priority Opportunities</h2>
        <p className="text-sm text-[#A9B1BE]">High-value leads that need attention.</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-white/5 text-xs uppercase tracking-wider text-[#A9B1BE]">
            <tr>
              <th className="px-5 py-3 font-medium">Contact</th>
              <th className="px-5 py-3 font-medium">County</th>
              <th className="px-5 py-3 font-medium">Interest</th>
              <th className="px-5 py-3 font-medium">Stage</th>
              <th className="px-5 py-3 font-medium">Score</th>
              <th className="px-5 py-3 font-medium">Last Activity</th>
              <th className="px-5 py-3 font-medium">Reason</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {opportunities.map(item => (
              <tr key={item.id} className="text-[#E5E7EB]">
                <td className="px-5 py-3 font-medium text-white">{fallback(item.contactName, 'Unnamed lead')}</td>
                <td className="px-5 py-3">{fallback(item.county)}</td>
                <td className="px-5 py-3">{fallback(item.productInterest)}</td>
                <td className="px-5 py-3">{item.stage}</td>
                <td className="px-5 py-3 font-semibold text-[#C9A25F]">{item.leadScore}</td>
                <td className="px-5 py-3">{fmtDate(item.lastActivityAt)}</td>
                <td className="px-5 py-3 text-[#A9B1BE]">{item.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
