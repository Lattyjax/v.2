import { FunnelStage } from '../lib/types'
import SectionLoader from './SectionLoader'
import EmptyState from '@/app/_components/EmptyState'

const G = '#C9A25F'

function formatStage(stageKey: string) {
  return stageKey
    .replace(/_/g, ' ')
    .replace(/\b\w/g, letter => letter.toUpperCase())
}

function formatRate(value: number) {
  const pct = value <= 1 ? value * 100 : value
  return `${pct.toFixed(1)}%`
}

export default function FunnelSection({
  funnel,
  loading,
  error,
}: {
  funnel: FunnelStage[] | null
  loading: boolean
  error: string | null
}) {
  if (loading) return <SectionLoader />
  if (error) return <EmptyState title="Funnel unavailable" description={error} />
  if (!funnel || funnel.length === 0) {
    return <EmptyState title="No funnel data yet" description="Funnel activity will appear once leads move through the pipeline." />
  }

  const sorted = [...funnel].sort((a, b) => a.stageOrder - b.stageOrder)
  const max = Math.max(...sorted.map(stage => stage.count), 1)

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-white">Pipeline Funnel</h2>
        <p className="text-sm text-[#A9B1BE]">Lead movement through the Latimore OS sales pipeline.</p>
      </div>

      <div className="space-y-4">
        {sorted.map(stage => {
          const width = Math.max((stage.count / max) * 100, 4)

          return (
            <div key={stage.stageKey}>
              <div className="mb-1 flex items-center justify-between gap-3">
                <div className="text-sm font-medium text-white">{formatStage(stage.stageKey)}</div>
                <div className="text-xs text-[#A9B1BE]">
                  {stage.count.toLocaleString()} · {formatRate(stage.conversionRate)}
                </div>
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
