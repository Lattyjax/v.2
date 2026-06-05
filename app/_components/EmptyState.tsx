import { AlertCircle } from 'lucide-react'

export default function EmptyState({
  title,
  description,
}: {
  title: string
  description?: string | null
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center">
      <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/5">
        <AlertCircle size={18} className="text-[#C9A25F]" />
      </div>
      <h3 className="text-sm font-semibold text-white">{title}</h3>
      {description ? <p className="mt-1 text-sm text-[#A9B1BE]">{description}</p> : null}
    </div>
  )
}
