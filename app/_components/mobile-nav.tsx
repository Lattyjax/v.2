'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { NavLink } from './site-shell'
import { BRAND } from '@/lib/brand'
import { SITE_COLORS } from './site-shell'

type MobileNavProps = {
  navLinks: readonly NavLink[]
  currentPath?: string
  mobileBreakpoint?: number
}

export function MobileNav({
  navLinks,
  currentPath = '',
  mobileBreakpoint = 900,
}: MobileNavProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        aria-expanded={open}
        aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
        onClick={() => setOpen((value) => !value)}
        className="site-mobile-nav-toggle"
        style={{
          display: 'none',
          background: 'none',
          border: 'none',
          color: '#fff',
          fontSize: '1.5rem',
          cursor: 'pointer',
          lineHeight: 1,
        }}
      >
        {open ? '✕' : '☰'}
      </button>

      {open && (
        <div
          style={{
            background: SITE_COLORS.navy,
            padding: '1rem 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            position: 'absolute',
            left: 0,
            right: 0,
            top: '100%',
            boxShadow: '0 8px 18px rgba(0,0,0,0.15)',
          }}
        >
          {navLinks.map(([href, label]) => {
            const isActive = href === currentPath
            const isJoin = href === '/join'
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                style={isJoin ? {
                  background: SITE_COLORS.gold,
                  color: SITE_COLORS.navy,
                  padding: '0.85rem 1rem',
                  borderRadius: 8,
                  fontWeight: 800,
                  textDecoration: 'none',
                  textAlign: 'center',
                } : {
                  color: isActive ? SITE_COLORS.goldLight : '#fff',
                  textDecoration: 'none',
                  fontSize: '1.05rem',
                  fontWeight: isActive ? 600 : 400,
                }}
              >
                {label}
              </Link>
            )
          })}

          <a
            href="/pahs"
            onClick={() => setOpen(false)}
            style={{
              border: `1px solid ${SITE_COLORS.goldLight}`,
              color: SITE_COLORS.goldLight,
              padding: '0.75rem',
              borderRadius: 8,
              fontWeight: 700,
              textDecoration: 'none',
              textAlign: 'center',
            }}
          >
            PAHS FOOTBALL 2026
          </a>

          <a
            href={BRAND.bookingUrl}
            onClick={() => setOpen(false)}
            style={{
              background: SITE_COLORS.gold,
              color: SITE_COLORS.navy,
              padding: '0.75rem',
              borderRadius: 8,
              fontWeight: 600,
              textDecoration: 'none',
              textAlign: 'center',
            }}
          >
            Book Consultation
          </a>
        </div>
      )}

      <style>{`
        nav[aria-label="Primary"] { position: sticky; }
        @media (max-width: ${mobileBreakpoint}px) {
          .site-desktop-nav { display: none !important; }
          .site-mobile-nav-toggle { display: block !important; }
        }
      `}</style>
    </>
  )
}
