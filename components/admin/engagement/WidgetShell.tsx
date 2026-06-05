'use client'

import type { ReactNode } from 'react'

type Props = {
  title: string
  subtitle?: string
  children: ReactNode
  action?: ReactNode
  className?: string
}

export default function WidgetShell({ title, subtitle, children, action, className = '' }: Props) {
  return (
    <div
      className={className}
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(196,154,108,0.15)',
        borderRadius: 12,
        padding: '20px 22px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: '0.72rem', color: '#C49A6C', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 2 }}>
            {title}
          </div>
          {subtitle && (
            <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)' }}>{subtitle}</div>
          )}
        </div>
        {action && <div>{action}</div>}
      </div>
      {children}
    </div>
  )
}
