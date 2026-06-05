'use client'

import { RefreshCw } from 'lucide-react'
import { Range } from '../lib/types'

export default function FilterBar({
  range,
  onRange,
  onRefresh,
  loading,
}: {
  range: Range
  onRange: (r: Range) => void
  onRefresh: () => void
  loading: boolean
}) {
  const ranges: Range[] = ['7d', '30d', '90d']

  return (
    <div className="mb-6 flex flex-wrap items-center gap-3">
      <div className="flex gap-2">
        {ranges.map(r => (
          <button
            key={r}
            type="button"
            onClick={() => onRange(r)}
            className={`rounded-md border px-3 py-1.5 text-sm transition ${
              range === r
                ? 'border-[#C9A25F] bg-[#C9A25F]/20 font-semibold text-[#C9A25F]'
                : 'border-white/10 text-[#A9B1BE] hover:border-white/20 hover:text-white'
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={onRefresh}
        disabled={loading}
        className="flex items-center gap-2 rounded-md bg-[#C9A25F] px-4 py-1.5 text-sm font-semibold text-[#0B0F17] disabled:opacity-60"
      >
        <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
        Refresh
      </button>
    </div>
  )
}
