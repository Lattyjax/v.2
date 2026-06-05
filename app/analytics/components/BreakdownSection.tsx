import { BreakdownRow } from '../lib/types'
import SectionLoader from './SectionLoader'
import EmptyState from '@/app/_components/EmptyState'

const G = '#C9A25F'

function label(value: string | null | undefined) {
  if (!value) return 'Unknown'
  return value.replace(/_/g, ' ').replace(/\b\w/g, letter => letter.toUpperCase())
}

export default function BreakdownSection({
  rows,
  loading,
  error,
}: {
  rows: BreakdownRow[] | null
  loading: boolean
  error: string | null
}) {
  if (loading) return <SectionLoader />
  if (error) return <EmptyState title="Breakdown unavailable" description={error} />
  if (!rows || rows.length === 0) {
    return <EmptyState title="No source data yet" description="Traffic and lead source data will appear once tracked events are available." />
  }

  const sorted = [...rows].sort((a, b) => b.value - a.value)
  const max = Math.max(...sorted.map(row => row.value), 1)

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-white">Source Breakdown</h2>
        <p className="text-sm text-[#A9B1BE]">Where tracked activity is coming from.</p>
      </div>

      <div className="space-y-4">
        {sorted.map(row => {
          const width = Math.max((row.value / max) * 100, 4)
          return (
            <div key={`${row.dimension}-${row.dimensionValue}-${row.metricKey}`}>
              <div className="mb-1 flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-white">{label(row.dimensionValue)}</span>
                <span className="text-xs text-[#A9B1BE]">
                  {row.value.toLocaleString()} {row.unit}
                </span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full" style={{ width: `${width}%`, backgroundColor: G }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
