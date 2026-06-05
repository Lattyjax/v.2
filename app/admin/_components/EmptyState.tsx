import { ReactNode } from 'react'

export default function EmptyState({
  title,
  description,
  icon,
}: {
  title: string
  description?: string
  icon?: ReactNode
}) {
  return (
    <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-12 text-center">
      {icon ? <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/5 text-[#C9A25F]">{icon}</div> : null}
      <h3 className="text-sm font-semibold text-white">{title}</h3>
      {description ? <p className="mx-auto mt-2 max-w-xl text-sm text-[#A9B1BE]">{description}</p> : null}
    </div>
  )
}
