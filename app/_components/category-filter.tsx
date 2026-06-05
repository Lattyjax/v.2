'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { CATEGORIES } from '@/lib/blog-constants'

const TRACK_COLOR: Record<string, string> = {
  'Young Families': '#2d5f8a',
  'Pre-Retirees': '#4a7c59',
  'School Districts': '#7a4f2e',
}

export default function CategoryFilter() {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const active = params?.get('category') ?? 'all'

  function select(value: string) {
    const next = new URLSearchParams(params?.toString() ?? '')
    if (value === 'all') next.delete('category')
    else next.set('category', value)
    router.push(`${pathname}?${next.toString()}`, { scroll: false })
  }

  return (
    <div className="flex items-center gap-2 flex-wrap mb-12 pb-6 border-b border-[#e2dcd4]">
      <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-[#6b6460] mr-1">
        Filter by:
      </span>

      <button
        onClick={() => select('all')}
        style={{
          background: active === 'all' ? '#2C3E50' : '#fff',
          color: active === 'all' ? '#fff' : '#6b6460',
          border: `1px solid ${active === 'all' ? '#2C3E50' : '#e2dcd4'}`,
        }}
        className="font-mono text-[11px] tracking-[0.08em] uppercase px-4 py-[7px] rounded-sm cursor-pointer transition-all"
      >
        All Articles
      </button>

      {CATEGORIES.map((cat) => {
        const isActive = active === cat
        const color = TRACK_COLOR[cat]
        return (
          <button
            key={cat}
            onClick={() => select(cat)}
            style={{
              background: isActive ? color : '#fff',
              color: isActive ? '#fff' : '#6b6460',
              border: `1px solid ${isActive ? color : '#e2dcd4'}`,
            }}
            className="font-mono text-[11px] tracking-[0.08em] uppercase px-4 py-[7px] rounded-sm cursor-pointer transition-all"
          >
            {cat}
          </button>
        )
      })}
    </div>
  )
}
