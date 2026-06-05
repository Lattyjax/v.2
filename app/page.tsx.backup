'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { BRAND } from '@/lib/brand'


const services = [
  { title: 'Tax-Advantaged Wealth Accumulation', desc: 'Build wealth using tax-deferred and tax-free growth strategies' },
  { title: 'Asset Protection & Plan Rollovers', desc: 'Protect wealth and roll over 401(k), 403(b), pension plans strategically' },
  { title: 'College Education Funding', desc: 'Strategic funding for higher education without crippling debt' },
  { title: 'Debt Management', desc: 'Consolidation strategies to eliminate high-interest debt' },
  { title: 'Life Insurance & Living Benefits', desc: 'Income replacement, critical illness, and final expense coverage' },
  { title: 'Estate & Legacy Planning', desc: 'Wealth transfer strategies and estate tax solutions' },
  { title: 'Indexed Growth Strategies', desc: 'Market-linked growth with downside protection' },
  { title: 'Mortgage Protection', desc: 'Ensure your family keeps the home if something happens to you' },
  { title: 'Business & Key-Person Insurance', desc: 'Protect your business from loss of critical personnel' },
  { title: 'Retirement Income Strategies', desc: 'Guaranteed lifetime income with annuities and safe-money vehicles' },
]

function Nav() {
  const [open, setOpen] = useState(false)
  return (
    <nav style={{ background: '#0E1A2B', padding: '1rem 0', position: 'sticky', top: 0, zIndex: 1000, boxShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: '#fff', fontSize: '1.2rem', fontWeight: 700 }}>
          <img src="/logo.jpg" alt="Latimore Life & Legacy LLC" style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover' }} />
          {BRAND.name}
        </Link>

        {/* Desktop nav */}
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }} className="desktop-nav">
          {[['/', 'Home'], ['/about', 'About'], ['/products', 'Products'], ['/services', 'Services'], ['/education', 'Education'], ['/contact', 'Contact']].map(([href, label]) => (
            <Link key={href} href={href} style={{ color: '#fff', textDecoration: 'none', fontSize: '0.95rem' }}>{label}</Link>
          ))}
          <a href={BRAND.bookingUrl} target="_blank" rel="noopener noreferrer"
            style={{ background: '#C9A24D', color: '#0E1A2B', padding: '0.5rem 1rem', borderRadius: 5, fontWeight: 600, textDecoration: 'none', fontSize: '0.9rem' }}>
            Book Consultation
          </a>
          <a href={BRAND.ethosUrl} target="_blank" rel="noopener noreferrer"
            style={{ background: '#E5C882', color: '#0E1A2B', padding: '0.5rem 1rem', borderRadius: 5, fontWeight: 700, textDecoration: 'none', fontSize: '0.9rem', boxShadow: '0 0 15px rgba(197,162,77,0.4)' }}>
            Get Quote
          </a>
        </div>

        {/* Mobile hamburger */}
        <button onClick={() => setOpen(!open)} style={{ display: 'none', background: 'none', border: 'none', color: '#fff', fontSize: '1.5rem', cursor: 'pointer' }} className="mobile-btn">
          {open ? 'Close' : 'Menu'}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div style={{ background: '#0E1A2B', padding: '1rem 20px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[['/', 'Home'], ['/about', 'About'], ['/products', 'Products'], ['/services', 'Services'], ['/education', 'Education'], ['/contact', 'Contact']].map(([href, label]) => (
            <Link key={href} href={href} onClick={() => setOpen(false)} style={{ color: '#fff', textDecoration: 'none', fontSize: '1.1rem' }}>{label}</Link>
          ))}
          <a href={BRAND.bookingUrl} target="_blank" rel="noopener noreferrer"
            style={{ background: '#C9A24D', color: '#0E1A2B', padding: '0.75rem 1rem', borderRadius: 5, fontWeight: 600, textDecoration: 'none', textAlign: 'center' }}>
            Book Consultation
          </a>
          <a href={BRAND.ethosUrl} target="_blank" rel="noopener noreferrer"
            style={{ background: '#E5C882', color: '#0E1A2B', padding: '0.75rem 1rem', borderRadius: 5, fontWeight: 700, textDecoration: 'none', textAlign: 'center' }}>
            Get Quote
          </a>
        </div>
      )}

      <style>{`
        /* Collapse desktop navigation sooner on wider tablet screens */
        @media (max-width: 1100px) {
          .desktop-nav { display: none !important; }
          .mobile-btn { display: block !important; }
        }
      `}</style>
    </nav>
  )
}

function Footer() {
  return (
    <footer style={{ background: '#0E1A2B', color: '#fff', padding: '3rem 0 1rem' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
          <div>
            <h4 style={{ color: '#E5C882', marginBottom: '1rem' }}>{BRAND.name}</h4>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.9rem', lineHeight: 1.7 }}>Protection-first strategies for working families, professionals, and local organizations across Central Pennsylvania.</p>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <a href={BRAND.instagram} target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none' }}>Instagram</a>
              <a href={BRAND.linkedin} target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none' }}>LinkedIn</a>
              <a href={BRAND.facebook} target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none' }}>Facebook</a>
            </div>
          </div>
          <div>
            <h4 style={{ color: '#E5C882', marginBottom: '1rem' }}>Quick Links</h4>
            {[['/about','About Jackson'],['/products','Products'],['/services','Services'],['/contact','Contact']].map(([href, label]) => (
              <Link key={href} href={href} style={{ display: 'block', color: 'rgba(255,255,255,0.8)', textDecoration: 'none', marginBottom: '0.5rem' }}>{label}</Link>
            ))}
          </div>
          <div>
            <h4 style={{ color: '#E5C882', marginBottom: '1rem' }}>Contact</h4>
            <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '0.5rem' }}><strong>Phone:</strong> {BRAND.phone}</p>
            <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '0.5rem' }}><strong>Email:</strong> {BRAND.email}</p>
            <p style={{ color: 'rgba(255,255,255,0.8)' }}><strong>Service Area:</strong> Schuylkill, Luzerne & Northumberland Counties, PA</p>
          </div>
          <div>
            <h4 style={{ color: '#E5C882', marginBottom: '1rem' }}>Get Started</h4>
            <a href={BRAND.bookingUrl} target="_blank" rel="noopener noreferrer"
              style={{ display: 'inline-block', background: '#C9A24D', color: '#0E1A2B', padding: '0.5rem 1rem', borderRadius: 5, fontWeight: 600, textDecoration: 'none', marginBottom: '0.75rem' }}>
              Book Consultation
            </a><br />
            <a href={BRAND.ethosUrl} target="_blank" rel="noopener noreferrer"
              style={{ display: 'inline-block', background: '#C9A24D', color: '#0E1A2B', padding: '0.5rem 1rem', borderRadius: 5, fontWeight: 600, textDecoration: 'none', marginBottom: '0.75rem' }}>
              Instant Quote
            </a><br />
            <div style={{ marginTop: '1rem' }}>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginBottom: '0.5rem' }}>Scan to apply:</p>
              <img src="/ethos-qr.png" alt="Ethos QR Code" style={{ width: 80, height: 80, borderRadius: 8 }} />
            </div>
          </div>
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '1.5rem', textAlign: 'center' }}>
          <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', maxWidth: 900, margin: '0 auto 1rem' }}>
            Licensed in Pennsylvania (DOI #{BRAND.paLicense}, NIPR #{BRAND.nipr}). Independent contractor affiliated with Global Financial Impact. Products offered through appointed carriers. For educational purposes only; not tax or legal advice.
          </p>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>© {new Date().getFullYear()} Latimore Life & Legacy LLC. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default function HomePage() {
  return (
    <>
      <Nav />
      <main>
        {/* Hero */}
        <section style={{ background: 'linear-gradient(135deg, #0E1A2B 0%, #1a2942 100%)', color: '#fff', padding: '2.5rem 0' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px', display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '3rem', alignItems: 'flex-start' }} className="hero-grid">
            <div style={{ paddingTop: 0 }}>
              <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', marginBottom: '1rem', marginTop: 0, lineHeight: 1.2 }}>
                Life Insurance & Financial Protection for Families in <span style={{ color: '#E5C882' }}>Schuylkill, Luzerne & Northumberland Counties</span>
              </h1>
              <p style={{ textAlign: 'center', fontSize: '1.2rem', fontWeight: 600, color: '#E5C882', margin: '1.5rem 0' }}>Father | Survivor | Leader</p>
              <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.9)', marginBottom: '2rem', lineHeight: 1.7 }}>
                Independent insurance consultant serving Schuylkill, Luzerne & Northumberland Counties with life insurance, annuities, and financial protection strategies.
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
                {['PA Licensed (DOI #1268820)', 'MBA Candidate', '3 Counties Served'].map(b => (
                  <span key={b} style={{ background: 'rgba(197,162,77,0.2)', padding: '0.5rem 1rem', borderRadius: 20, fontSize: '0.9rem', border: '1px solid #C9A24D' }}>{b}</span>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <a href={BRAND.bookingUrl} target="_blank" rel="noopener noreferrer"
                  style={{ background: '#C9A24D', color: '#0E1A2B', padding: '1rem 2rem', borderRadius: 5, fontWeight: 700, textDecoration: 'none', fontSize: '1rem' }}>
                  Book Free Consultation
                </a>
                <a href={BRAND.ethosUrl} target="_blank" rel="noopener noreferrer"
                  style={{ background: '#E5C882', color: '#0E1A2B', padding: '1rem 2rem', borderRadius: 5, fontWeight: 700, textDecoration: 'none', fontSize: '1rem', boxShadow: '0 0 20px rgba(197,162,77,0.5)' }}>
                  Get Instant Quote
                </a>
              </div>
            </div>
            <div>
              <img
                src="/jackson-library.jpg"
                alt="Jackson M. Latimore Sr. — Independent Insurance Consultant"
                style={{
                  width: '100%',
                  borderRadius: 10,
                  boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                  objectFit: 'cover',
                  objectPosition: 'center 25%',
                  display: 'block',
                  maxHeight: 560,
                }}
              />
              <div style={{ background: 'rgba(255,255,255,0.1)', padding: '1.5rem', borderRadius: 10, marginTop: '1rem', textAlign: 'center' }}>
                <h3 style={{ color: '#E5C882', marginBottom: '0.5rem' }}>Jackson M. Latimore Sr.</h3>
                <p style={{ color: 'rgba(255,255,255,0.8)' }}>CEO & Founder</p>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>Independent Financial Consultant</p>
              </div>
            </div>
          </div>
          <style>{`
            @media(max-width:1024px){
              .hero-grid{
                grid-template-columns:1fr !important;
                gap:1.5rem !important;
              }
            }
            @media(max-width:768px){
              .hero-grid{
                grid-template-columns:1fr !important;
              }
            }
            @media(max-width:1100px){
              .services-grid{
                grid-template-columns:repeat(3,1fr) !important;
              }
            }
            @media(max-width:640px){
              .services-grid{
                grid-template-columns:repeat(2,1fr) !important;
              }
            }
          `}</style>
        </section>

        {/* Services Grid */}
        <section style={{ padding: '4rem 0', background: '#F5F5F5' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
            <h2 style={{ textAlign: 'center', fontSize: 'clamp(1.8rem,4vw,2.5rem)', marginBottom: '1rem', color: '#0E1A2B' }}>Comprehensive Financial Protection</h2>
            <p style={{ textAlign: 'center', fontSize: '1.1rem', color: '#666', marginBottom: '3rem' }}>10 strategies to build, protect, and transfer wealth</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1.5rem' }} className="services-grid">
              {services.map((s, i) => (
                <div key={i} style={{ background: '#fff', padding: '1.5rem', borderRadius: 8, boxShadow: '0 2px 10px rgba(0,0,0,0.08)', borderTop: '3px solid #C9A24D' }}>
                  <h3 style={{ color: '#0E1A2B', fontSize: '1.05rem', marginBottom: '0.5rem' }}>{s.title}</h3>
                  <p style={{ color: '#666', fontSize: '0.95rem', lineHeight: 1.6 }}>{s.desc}</p>
                </div>
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
              <a href={BRAND.bookingUrl} target="_blank" rel="noopener noreferrer"
                style={{ background: '#C9A24D', color: '#0E1A2B', padding: '1rem 2.5rem', borderRadius: 5, fontWeight: 700, textDecoration: 'none', fontSize: '1rem' }}>
                Ready to Explore Your Options?
              </a>
            </div>
          </div>
        </section>

        {/* My Story */}
        <section style={{ background: '#0E1A2B', color: '#fff', padding: '4rem 0' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
            <h2 style={{ textAlign: 'center', fontSize: 'clamp(1.8rem,4vw,2.5rem)', marginBottom: '2rem', color: '#fff' }}>My Story: Why Protection Matters</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '3rem' }} className="story-grid">
              <div style={{ textAlign: 'center' }}>
                <img src="/hospital-recovery.jpg" alt="Jackson recovering in hospital" style={{ width: '100%', borderRadius: 10, boxShadow: '0 5px 20px rgba(0,0,0,0.3)', marginBottom: '0.75rem' }} />
                <p style={{ color: '#E5C882', fontSize: '0.9rem' }}>December 2010 - Pocono Medical Center</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <img src="/news-headline.jpg" alt="Pocono Record coverage" style={{ width: '100%', borderRadius: 10, boxShadow: '0 5px 20px rgba(0,0,0,0.3)', marginBottom: '0.75rem' }} />
                <p style={{ color: '#E5C882', fontSize: '0.9rem' }}>Local news coverage of the life-saving event</p>
              </div>
            </div>
            <div style={{ maxWidth: 800, margin: '0 auto' }}>
              <p style={{ marginBottom: '1.5rem', fontSize: '1.1rem', lineHeight: 1.8 }}>
                During a college basketball game on December 7, 2010, my heart stopped. I went into sudden cardiac arrest at East Stroudsburg University. I was 22 years old.
              </p>
              <p style={{ marginBottom: '1.5rem', fontSize: '1.1rem', lineHeight: 1.8 }}>
                I survived because athletic trainers had immediate access to an AED — placed there by the Gregory W. Moyer Defibrillator Fund after 15-year-old Greg Moyer died of cardiac arrest in 2000.
              </p>
              <p style={{ background: 'rgba(197,162,77,0.2)', padding: '1.5rem', borderLeft: '4px solid #C9A24D', fontSize: '1.15rem', fontWeight: 600, color: '#E5C882', marginBottom: '2rem', lineHeight: 1.7 }}>
                That experience taught me that preparedness is everything. Financial protection isn&apos;t about selling policies — it&apos;s about ensuring families have what they need when the unexpected happens.
              </p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link href="/about" style={{ background: 'transparent', color: '#fff', border: '2px solid #C9A24D', padding: '0.9rem 2rem', borderRadius: 5, fontWeight: 600, textDecoration: 'none' }}>
                  Read Full Story
                </Link>
                <Link href="/contact" style={{ background: '#C9A24D', color: '#0E1A2B', padding: '0.9rem 2rem', borderRadius: 5, fontWeight: 700, textDecoration: 'none' }}>
                  Work With Me
                </Link>
              </div>
            </div>
          </div>
          <style>{`@media(max-width:768px){.story-grid{grid-template-columns:1fr !important;}}`}</style>
        </section>

        {/* CTA Section */}
        <section style={{ background: 'linear-gradient(135deg, #C9A24D 0%, #E5C882 100%)', padding: '4rem 0', textAlign: 'center' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
            <h2 style={{ fontSize: 'clamp(1.8rem,4vw,2.5rem)', color: '#0E1A2B', marginBottom: '1rem' }}>Ready to Protect Your Family&apos;s Future?</h2>
            <p style={{ fontSize: '1.2rem', color: '#0E1A2B', marginBottom: '2rem' }}>Let&apos;s discuss your financial protection strategy</p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href={BRAND.bookingUrl} target="_blank" rel="noopener noreferrer"
                style={{ background: '#0E1A2B', color: '#fff', padding: '1rem 2rem', borderRadius: 5, fontWeight: 700, textDecoration: 'none', fontSize: '1rem' }}>
                Book Free Consultation
              </a>
              <a href={`tel:${BRAND.phoneRaw}`}
                style={{ background: 'transparent', color: '#0E1A2B', border: '2px solid #0E1A2B', padding: '1rem 2rem', borderRadius: 5, fontWeight: 700, textDecoration: 'none', fontSize: '1rem' }}>
                Call {BRAND.phone}
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}