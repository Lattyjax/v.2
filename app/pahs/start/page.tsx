import type { Metadata } from 'next'
import { Suspense } from 'react'
import Image from 'next/image'
import StartForm from './StartForm'

export const metadata: Metadata = {
  title: 'Start Your Quote',
  description: 'Capture the PAHS QR lead inside the Latimore Hub before routing to Ethos.',
}

const navy = '#223446'
const navyDark = '#16222d'
const gold = '#C49A6C'
const white = '#FFFFFF'
const text = 'rgba(255,255,255,0.86)'

export default function PahsStartPage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        background: `radial-gradient(circle at top, rgba(196,154,108,0.14), transparent 30%), linear-gradient(180deg, ${navy} 0%, ${navyDark} 100%)`,
        padding: '22px 14px 48px',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      <section
        style={{
          maxWidth: 680,
          margin: '0 auto',
          borderRadius: 28,
          border: '1px solid rgba(255,255,255,0.12)',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.05))',
          boxShadow: '0 24px 60px rgba(0,0,0,0.24)',
          overflow: 'hidden',
        }}
      >
        <div style={{ padding: '30px 22px 34px' }}>
          <div style={{ textAlign: 'center', color: gold, fontWeight: 800, letterSpacing: '0.22em', fontSize: '0.82rem' }}>
            PAHS FOOTBALL 2026
          </div>
          <h1 style={{ margin: '14px 0 0', textAlign: 'center', color: white, fontSize: 'clamp(2rem, 6vw, 3rem)', lineHeight: 1.06 }}>
            Start Your Quick Quote.
          </h1>
          <p style={{ margin: '14px auto 0', maxWidth: 520, textAlign: 'center', color: text, lineHeight: 1.7, fontSize: '1.05rem' }}>
            This page captures the lead in your hub first. After that, the visitor routes to Ethos to finish the quote flow.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
            <div style={{ width: 116, height: 116, borderRadius: '50%', overflow: 'hidden', border: `4px solid ${gold}`, boxShadow: '0 14px 28px rgba(0,0,0,0.24)' }}>
              <Image src="/jackson-headshot.jpg" alt="Jackson Latimore" width={116} height={116} style={{ width: '100%', height: '100%', objectFit: 'cover' }} priority />
            </div>
          </div>

          <div style={{ maxWidth: 500, margin: '28px auto 0' }}>
            <Suspense fallback={<div style={{ color: '#FFFFFF', textAlign: 'center' }}>Loading form...</div>}>
              <StartForm />
            </Suspense>
          </div>
        </div>
      </section>
    </main>
  )
}
