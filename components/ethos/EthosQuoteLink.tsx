'use client'

import { buildFilloutParams } from '@/lib/lead'

type Props = React.PropsWithChildren<{
  style?: React.CSSProperties
  className?: string
}>

export default function EthosQuoteLink({ children, style, className }: Props) {
  function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    // Use tracked redirect with lead_session_id when JS is available
    e.preventDefault()
    const qs = buildFilloutParams({ intent: 'quick_term' })
    const url = `/api/redirect/ethos?${qs}&intent=quick_term`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  // Fallback href still logs (but without lead_session_id)
  return (
    <a
      href="/api/redirect/ethos?intent=quick_term"
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      style={style}
      className={className}
    >
      {children}
    </a>
  )
}