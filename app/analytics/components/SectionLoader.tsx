import { RefreshCw } from 'lucide-react'

export default function SectionLoader() {
  return (
    <div className="flex items-center justify-center py-10">
      <RefreshCw size={20} className="mr-2 animate-spin text-[#C9A25F]" />
      <span className="text-sm text-[#A9B1BE]">Loading…</span>
    </div>
  )
}
