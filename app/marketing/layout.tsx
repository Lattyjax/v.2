import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Marketing Command Center | Latimore Life & Legacy',
  description: 'Workflow builder, campaign automation, and multi-channel scheduling for Latimore Life & Legacy.',
}

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: '#0B0F17', minHeight: '100vh', color: '#F7F7F5' }}>
      {children}
    </div>
  )
}
