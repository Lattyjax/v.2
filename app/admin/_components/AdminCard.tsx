import { ReactNode } from 'react'

export default function AdminCard({
  title,
  subtitle,
  action,
  children,
  className = '',
}: {
  title?: string
  subtitle?: string
  action?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section className={`rounded-2xl border border-white/8 bg-[#111827] shadow-[0_10px_40px_rgba(0,0,0,0.18)] ${className}`}>
      {(title || subtitle || action) && (
        <div className="flex items-start justify-between gap-4 border-b border-white/6 px-5 py-4">
          <div>
            {title ? <h2 className="text-sm font-semibold tracking-wide text-white">{title}</h2> : null}
            {subtitle ? <p className="mt-1 text-xs text-[#A9B1BE]">{subtitle}</p> : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      )}
      <div className="p-5">{children}</div>
    </section>
  )
}
