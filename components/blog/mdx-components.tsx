import Image from 'next/image'
import type { MDXComponents } from 'mdx/types'


/* ── Custom MDX Components ──────────────────────────────── */

function Callout({
  type = 'tip',
  children,
}: {
  type?: 'tip' | 'warning' | 'story'
  children: React.ReactNode
}) {
  const icons = { tip: '💡', warning: '⚠️', story: '📖' }
  return (
    <div className={`callout callout--${type}`}>
      <span className="callout__icon">{icons[type]}</span>
      <div className="callout__body">{children}</div>
    </div>
  )
}

function KeyTakeaway({ children }: { children: React.ReactNode }) {
  return (
    <div className="key-takeaway">
      <p className="key-takeaway__label">Key Takeaway</p>
      <div className="key-takeaway__body">{children}</div>
    </div>
  )
}

function ComparisonTable({
  headers,
  rows,
}: {
  headers: string[]
  rows: string[][]
}) {
  return (
    <table className="comparison-table">
      <thead>
        <tr>
          {headers.map((h, i) => (
            <th key={i}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, ri) => (
          <tr key={ri}>
            {row.map((cell, ci) => (
              <td key={ci}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function StatsRow({ children }: { children: React.ReactNode }) {
  return <div className="stats-row">{children}</div>
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="stat">
      <span className="stat__value">{value}</span>
      <span className="stat__label">{label}</span>
    </div>
  )
}

function InlineCTA({
  text,
  href,
  buttonText,
}: {
  text: string
  href: string
  buttonText: string
}) {
  const isExternal = href.startsWith('http')
  return (
    <div className="inline-cta">
      <p className="inline-cta__text">{text}</p>
      <a
        href={href}
        className="inline-cta__btn"
        {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      >
        {buttonText}
      </a>
    </div>
  )
}

/* ── Element overrides ──────────────────────────────────── */

function MdxImage({
  src,
  alt,
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement>) {
  if (!src) return null
  return (
    <Image
      src={src}
      alt={alt ?? ''}
      width={800}
      height={450}
      style={{ width: '100%', height: 'auto', borderRadius: 8 }}
      {...(props as Record<string, unknown>)}
    />
  )
}

function MdxAnchor({
  href,
  children,
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  const isExternal = href?.startsWith('http')
  return (
    <a
      href={href}
      {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      {...props}
    >
      {children}
      {isExternal && ' ↗'}
    </a>
  )
}

function MdxBlockquote({ children }: { children: React.ReactNode }) {
  return <blockquote style={{ borderLeft: '4px solid var(--gold)' }}>{children}</blockquote>
}

/* ── Export ─────────────────────────────────────────────── */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getMDXComponents(): Record<string, any> {
  return {
    // Custom components
    Callout,
    KeyTakeaway,
    ComparisonTable,
    StatsRow,
    Stat,
    InlineCTA,
    // Element overrides
    img: MdxImage as MDXComponents['img'],
    a: MdxAnchor,
    blockquote: MdxBlockquote as MDXComponents['blockquote'],
  }
}
