'use client'

import { useState } from 'react'
import Link from 'next/link'
import BlogCard from '@/components/blog/BlogCard'
import { COLORS } from '@/lib/brand'
import type { ArticleMeta, Track } from '@/lib/mdx'

// ── Brand tokens — aligned to globals.css :root and lib/brand.ts COLORS ──────
const C = {
  navy:       COLORS.navy,       // #0E1A2B  --color-navy-800
  navyDeep:   COLORS.navyDeep,   // #0B0F17  --color-navy-900
  gold:       COLORS.gold,       // #C9A25F  --color-gold-500
  goldPale:   COLORS.goldPale,   // #fdf6ee  --color-gold-100
  goldBorder: COLORS.goldBorder, // #e8d5b8  --color-gold-200
  cream:      COLORS.goldCream,  // #f9f6f0  --color-gold-50
  ink:        COLORS.text,       // #0E1A2B  --color-text
  muted:      COLORS.textMuted,  // #475467  --color-text-muted
  rule:       COLORS.gray200,    // #e5e7eb  --color-border
  white:      COLORS.white,
  trackA:     COLORS.trackA,     // --color-track-a
  trackB:     COLORS.trackB,     // --color-track-b
  trackC:     COLORS.trackC,     // --color-track-c
} as const

const TRACK_COLOR: Record<Track, string> = {
  A: C.trackA,
  B: C.trackB,
  C: C.trackC,
}

type Filter = 'all' | Track

interface BlogIndexClientProps {
  articles: ArticleMeta[]
}

export default function BlogIndexClient({ articles }: BlogIndexClientProps) {
  const [filter, setFilter] = useState<Filter>('all')

  const visible =
    filter === 'all' ? articles : articles.filter((a) => a.track === filter)

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=Source+Serif+4:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Mono:wght@400;500&display=swap');

        .blog-root { font-family:'Source Serif 4',Georgia,serif; background:${C.cream}; color:${C.ink}; font-size:17px; line-height:1.7; -webkit-font-smoothing:antialiased; min-height:100vh; }
        .blog-root *, .blog-root *::before, .blog-root *::after { box-sizing:border-box; margin:0; padding:0; }

        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .blog-card { animation:fadeUp 0.4s ease forwards; opacity:0; }
        .blog-card:hover { box-shadow:0 4px 20px rgba(44,62,80,0.12); transform:translateY(-2px); }
      `}</style>

      <div className="blog-root">
        {/* ── Header ── */}
        <header style={{ background: C.navyDeep, borderBottom: `2px solid ${C.gold}`, padding: '0 2rem', position: 'sticky', top: 0, zIndex: 100 }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64, gap: '2rem' }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
              <div style={{ width: 36, height: 36, background: C.gold, clipPath: 'polygon(50% 0%,100% 20%,100% 70%,50% 100%,0% 70%,0% 20%)', flexShrink: 0 }} />
              <div>
                <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 700, color: C.white, lineHeight: 1.1 }}>Latimore Life &amp; Legacy</div>
                <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: C.gold, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Protecting Today. Securing Tomorrow.</div>
              </div>
            </Link>
            <nav style={{ display: 'flex', gap: '1.75rem' }}>
              {([['/', 'Home'], ['/about', 'About'], ['/products', 'Products'], ['/contact', 'Contact']] as [string, string][]).map(([href, label]) => (
                <Link key={href} href={href} style={{ color: 'rgba(255,255,255,0.75)', textDecoration: 'none', fontSize: 13, fontFamily: "'DM Mono',monospace", letterSpacing: '0.06em', textTransform: 'uppercase' }}>{label}</Link>
              ))}
              <Link href="/blog" style={{ color: C.gold, textDecoration: 'none', fontSize: 13, fontFamily: "'DM Mono',monospace", letterSpacing: '0.06em', textTransform: 'uppercase' }}>Blog</Link>
            </nav>
            <a href="tel:7176152613" style={{ background: C.gold, color: C.navyDeep, fontFamily: "'DM Mono',monospace", fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 500, padding: '8px 16px', borderRadius: 2, textDecoration: 'none', whiteSpace: 'nowrap' }}>(717) 615-2613</a>
          </div>
        </header>

        {/* ── Hero ── */}
        <section style={{ background: C.navy, backgroundImage: `radial-gradient(ellipse at 80% 20%,rgba(196,154,108,0.12) 0%,transparent 60%),radial-gradient(ellipse at 10% 90%,rgba(196,154,108,0.08) 0%,transparent 50%)`, padding: '5rem 2rem 4rem', borderBottom: `1px solid rgba(196,154,108,0.25)`, overflow: 'hidden' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: C.gold, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ display: 'block', width: 32, height: 1, background: C.gold }} />
              Financial Education · Coal Region PA
            </div>
            <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(2.5rem,5vw,4rem)', fontWeight: 900, color: C.white, lineHeight: 1.1, maxWidth: 680, marginBottom: '1.5rem' }}>
              Real talk on life insurance,<br />retirement, and <em style={{ color: C.gold, fontStyle: 'italic' }}>leaving something behind</em>.
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.65)', maxWidth: 540, fontSize: 17, fontWeight: 300, marginBottom: '2.5rem', lineHeight: 1.8 }}>
              Plain-language guides written by Jackson Latimore — an independent broker and cardiac arrest survivor who understands exactly what's at stake when there's no plan in place.
            </p>
            <div style={{ display: 'flex', gap: '2.5rem', flexWrap: 'wrap', borderTop: `1px solid rgba(196,154,108,0.2)`, paddingTop: '2rem' }}>
              {([['12', 'Articles Published'], ['3', 'Audience Tracks'], ['3', 'Counties Served']] as [string, string][]).map(([n, l]) => (
                <div key={l}>
                  <div style={{ fontFamily: "'Playfair Display',serif", fontSize: '2.25rem', fontWeight: 700, color: C.gold, lineHeight: 1 }}>{n}</div>
                  <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Main ── */}
        <main style={{ maxWidth: 1200, margin: '0 auto', padding: '3.5rem 2rem' }}>
          {/* Filter bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: '3rem', paddingBottom: '1.5rem', borderBottom: `1px solid ${C.rule}` }}>
            <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.muted, marginRight: 4 }}>Filter by:</span>
            {([['all', 'All Articles'], ['A', 'Track A — Young Families'], ['B', 'Track B — Pre-Retirees'], ['C', 'Track C — School Districts']] as [Filter, string][]).map(([val, label]) => (
              <button key={val} onClick={() => setFilter(val)}
                style={{
                  fontFamily: "'DM Mono',monospace", fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase',
                  padding: '7px 16px',
                  border: `1px solid ${filter === val ? (val === 'all' ? C.navy : TRACK_COLOR[val as Track]) : C.rule}`,
                  borderRadius: 2, cursor: 'pointer', transition: 'all 0.18s',
                  background: filter === val ? (val === 'all' ? C.navy : TRACK_COLOR[val as Track]) : C.white,
                  color: filter === val ? C.white : C.muted,
                }}
              >{label}</button>
            ))}
          </div>

          {/* Article grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(340px,1fr))', gap: '1.75rem' }}>
            {visible.map((article, i) => (
              <BlogCard key={article.slug} article={article} index={i} />
            ))}
          </div>
        </main>

        {/* ── Author strip ── */}
        <div style={{ background: C.navyDeep, borderTop: `1px solid rgba(196,154,108,0.2)`, borderBottom: `1px solid rgba(196,154,108,0.2)`, padding: '3rem 2rem', margin: '2rem 0' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', gap: '2.5rem', flexWrap: 'wrap' }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: C.gold, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontFamily: "'Playfair Display',serif", fontSize: '1.75rem', color: C.navyDeep, fontWeight: 900 }}>JL</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.25rem', fontWeight: 700, color: C.white }}>Jackson M. Latimore Sr.</div>
              <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.gold, margin: '4px 0 10px' }}>Founder &amp; CEO — Latimore Life &amp; Legacy LLC · Independent Insurance Broker · PA DOI #1268820</div>
              <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 15, fontWeight: 300, lineHeight: 1.7, maxWidth: 600 }}>In December 2010, I collapsed on the basketball court at East Stroudsburg University's Koehler Fieldhouse. My heart stopped. An AED funded by the Gregory W. Moyer Defibrillator Fund brought me back. That question — what would have happened to the people who depended on me if I had not survived — drives everything I do.</p>
              <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 12, color: C.gold, marginTop: 8, display: 'block', letterSpacing: '0.08em' }}>#TheBeatGoesOn · Affiliated with Global Financial Impact (GFI)</span>
            </div>
          </div>
        </div>

        {/* ── Footer CTA ── */}
        <div style={{ background: C.goldPale, border: `1px solid ${C.goldBorder}`, borderRadius: 3, padding: '3rem', maxWidth: 1200, margin: '0 auto 3rem', textAlign: 'center' }}>
          <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: C.gold, marginBottom: '0.875rem' }}>No cost. No pressure. Just clarity.</div>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: '2rem', fontWeight: 700, color: C.navy, marginBottom: '1rem' }}>Ready to close the gap?</h2>
          <p style={{ color: C.muted, maxWidth: 500, margin: '0 auto 2rem', fontSize: 16 }}>Schedule a free 20-minute protection review. We look at what you have, what you owe, and what your family would actually need.</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="tel:7176152613" style={{ background: C.navy, color: C.white, fontFamily: "'DM Mono',monospace", fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '14px 28px', borderRadius: 2, textDecoration: 'none' }}>(717) 615-2613 — Call Now</a>
            <a href="mailto:jackson1989@latimorelegacy.com" style={{ background: 'transparent', color: C.navy, fontFamily: "'DM Mono',monospace", fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '13px 28px', borderRadius: 2, textDecoration: 'none', border: `1px solid ${C.navy}` }}>Email Jackson</a>
          </div>
        </div>

        {/* ── Site footer ── */}
        <footer style={{ background: C.navyDeep, borderTop: `2px solid ${C.gold}`, padding: '2rem', textAlign: 'center' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 12, color: C.gold, marginBottom: '0.75rem', letterSpacing: '0.08em' }}>#TheBeatGoesOn</div>
            <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '1rem' }}>
              {([['/', 'Home'], ['/blog', 'Blog'], ['tel:7176152613', '(717) 615-2613'], ['mailto:jackson1989@latimorelegacy.com', 'Email']] as [string, string][]).map(([href, label]) => (
                <a key={href} href={href} style={{ color: 'rgba(255,255,255,0.5)', fontFamily: "'DM Mono',monospace", fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none' }}>{label}</a>
              ))}
            </div>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', lineHeight: 1.6 }}>
              Latimore Life &amp; Legacy LLC · 1544 Route 61 Highway S, Suite 6104, Pottsville, PA 17901<br />
              PA DOI License #1268820 · NIPR #21638507 · Affiliated with Global Financial Impact<br />
              Content is for educational purposes only and does not constitute personalized financial or insurance advice.
            </p>
          </div>
        </footer>
      </div>
    </>
  )
}
