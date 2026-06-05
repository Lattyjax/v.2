import Link from 'next/link'
import Image from 'next/image'
import { BRAND, COLORS } from '@/lib/brand'
import { SiteHeader, SiteFooter, JOIN_NAV_LINKS } from '@/app/_components/site-shell'
import EthosQuoteLink from '@/components/ethos/EthosQuoteLink'

// Design tokens — sourced from lib/brand.ts (COLORS) which mirrors globals.css :root vars.
const navy     = COLORS.navy       // #0E1A2B  --color-navy-800
const gold     = COLORS.gold       // #C9A25F  --color-gold-500
const goldLight = COLORS.goldLight // #E5C882  --color-gold-300




export default function HomePage() {
  return (
    <>
      <SiteHeader currentPath="/" navLinks={JOIN_NAV_LINKS} />

      {/* Hero Section */}
      <section style={{ background: `linear-gradient(135deg, ${navy} 0%, #1a2942 100%)`, color: '#fff', padding: '4rem 0 3rem' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.15fr .85fr', gap: '3rem', alignItems: 'center' }} className="hero-grid">
            <div>
              <div style={{ color: goldLight, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', fontSize: '.82rem', marginBottom: 10 }}>Protecting Today. Securing Tomorrow.</div>
              <h1 style={{ fontSize: 'clamp(2rem,4.5vw,3.6rem)', lineHeight: 1.1, margin: '0 0 1.5rem' }}>
                Life Insurance & Financial Protection for Central Pennsylvania Families
              </h1>
              <p style={{ fontSize: '1.15rem', color: 'rgba(255,255,255,0.9)', marginBottom: '1.5rem', lineHeight: 1.7, maxWidth: '65ch' }}>
                Serving <strong>Schuylkill, Luzerne & Northumberland Counties</strong> with education-first strategies for life insurance, annuities, and legacy planning.
              </p>
              
              <div style={{ background: 'rgba(229,200,130,0.15)', borderLeft: `4px solid ${goldLight}`, padding: '16px 18px', borderRadius: 14, margin: '1.5rem 0', fontStyle: 'italic' }}>
                "December 7, 2010 — an AED saved my life at ESU's Koehler Fieldhouse. That second chance became a mission: helping families protect what matters most."
              </div>

              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
                <a href={BRAND.bookingUrl} style={{ display: 'inline-block', background: gold, color: navy, padding: '14px 28px', borderRadius: 999, fontWeight: 700, textDecoration: 'none', fontSize: '1.05rem', transition: 'transform .18s ease' }} className="btn-hover">Book Free Consultation</a>
                <EthosQuoteLink style={{ display: 'inline-block', background: goldLight, color: navy, padding: '14px 28px', borderRadius: 999, fontWeight: 700, textDecoration: 'none', fontSize: '1.05rem', boxShadow: '0 0 20px rgba(197,162,77,0.4)' }} className="btn-hover">Get Instant Quote</EthosQuoteLink>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                {['PA Licensed DOI #1268820', 'MBA', '560K+ Residents Served'].map(badge => (
                  <span key={badge} style={{ background: 'rgba(197,162,77,0.15)', padding: '8px 14px', borderRadius: 20, fontSize: '0.88rem', border: '1px solid rgba(197,162,77,0.4)', color: goldLight, fontWeight: 600 }}>{badge}</span>
                ))}
              </div>
            </div>

            <div>
              <Image src="/jackson-library.jpg" alt="Jackson M. Latimore Sr. — Independent Insurance Consultant" width={900} height={600} priority sizes="(max-width: 960px) 100vw, 50vw" style={{ width: '100%', borderRadius: 18, boxShadow: '0 14px 40px rgba(0,0,0,0.3)', objectFit: 'cover', maxHeight: 500, height: 'auto' }} />
              <div style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', padding: '1.5rem', borderRadius: 14, marginTop: '1rem', textAlign: 'center' }}>
                <h3 style={{ color: goldLight, marginBottom: '0.5rem', fontSize: '1.3rem' }}>Jackson M. Latimore Sr.</h3>
                <p style={{ color: 'rgba(255,255,255,0.8)', margin: '0.25rem 0', fontSize: '0.95rem' }}>Founder & CEO</p>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', margin: '0.25rem 0' }}>Independent Insurance Consultant</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section style={{ padding: '3rem 0', background: '#f9fafb' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 20px', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(1.5rem,2.5vw,2rem)', color: navy, margin: '0 0 1rem' }}>Our Mission</h2>
          <p style={{ fontSize: '1.15rem', color: '#475467', maxWidth: '80ch', margin: '0 auto', lineHeight: 1.8 }}>
            We don't just sell insurance — we educate, prepare, and protect. Every client conversation starts with understanding your goals, your family, and your future. Then we build strategies that work.
          </p>
        </div>
      </section>

      {/* Services Overview */}
      <section style={{ padding: '4rem 0', background: '#fff' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
          <h2 style={{ fontSize: 'clamp(1.6rem,2.5vw,2.2rem)', color: navy, margin: '0 0 0.5rem', textAlign: 'center' }}>Comprehensive Protection Strategies</h2>
          <p style={{ textAlign: 'center', color: '#667085', marginBottom: '2.5rem', fontSize: '1.05rem' }}>Three pillars of financial security for Pennsylvania families.</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }} className="grid-3">
            {[
              {
                title: 'Wealth Accumulation',
                icon: '📈',
                color: '#e8f4fd',
                border: '#bee3f8',
                items: ['Tax-Advantaged Growth Strategies', 'Indexed Universal Life (IUL)', 'Roth & Traditional IRAs', 'College Education Funding']
              },
              {
                title: 'Protection & Risk',
                icon: '🛡️',
                color: '#fef9e7',
                border: '#fde68a',
                items: ['Life Insurance & Living Benefits', 'Mortgage Protection', 'Final Expense Planning', 'Critical Illness Coverage']
              },
              {
                title: 'Legacy & Planning',
                icon: '🏛️',
                color: '#f0fdf4',
                border: '#bbf7d0',
                items: ['Estate & Wealth Transfer', 'Business Continuity Planning', 'Retirement Income Strategies', 'Debt Elimination']
              }
            ].map(({ title, icon, color, border, items }) => (
              <article key={title} style={{ background: color, border: `1px solid ${border}`, borderRadius: 18, padding: '1.75rem', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem', textAlign: 'center' }}>{icon}</div>
                <h3 style={{ color: navy, fontSize: '1.25rem', marginBottom: '1rem', textAlign: 'center' }}>{title}</h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {items.map(item => (
                    <li key={item} style={{ margin: '0.6rem 0', paddingLeft: 22, position: 'relative', color: '#333', fontSize: '0.92rem' }}>
                      <span style={{ position: 'absolute', left: 0, top: 0, color: '#0b7a55', fontWeight: 700 }}>✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
            <Link href="/services" style={{ display: 'inline-block', background: navy, color: '#fff', padding: '14px 28px', borderRadius: 999, fontWeight: 600, textDecoration: 'none', fontSize: '1rem' }} className="btn-hover">View All Services</Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section style={{ padding: '4rem 0', background: '#f9fafb' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
          <h2 style={{ fontSize: 'clamp(1.6rem,2.5vw,2.2rem)', color: navy, margin: '0 0 2.5rem', textAlign: 'center' }}>Why Families Choose {BRAND.name}</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2rem' }} className="grid-2">
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 18, padding: '2rem', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
              <h3 style={{ color: navy, fontSize: '1.3rem', marginBottom: '1rem' }}>Education-First Approach</h3>
              <p style={{ color: '#475467', lineHeight: 1.8, margin: 0 }}>
                We don't pressure. We educate. Every conversation starts with understanding your goals and helping you make informed decisions about protecting your family's future.
              </p>
            </div>

            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 18, padding: '2rem', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
              <h3 style={{ color: navy, fontSize: '1.3rem', marginBottom: '1rem' }}>Local & Independent</h3>
              <p style={{ color: '#475467', lineHeight: 1.8, margin: 0 }}>
                Born and raised in Pennsylvania. Serving the tri-county area with unbiased advice. No corporate quotas — just honest recommendations based on your needs.
              </p>
            </div>

            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 18, padding: '2rem', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
              <h3 style={{ color: navy, fontSize: '1.3rem', marginBottom: '1rem' }}>Carrier Diversity</h3>
              <p style={{ color: '#475467', lineHeight: 1.8, margin: 0 }}>
                As an independent broker, I work with a carefully selected portfolio of highly-rated carriers — so I can shop the market to find the right fit for your family's needs and budget.
              </p>
            </div>

            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 18, padding: '2rem', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
              <h3 style={{ color: navy, fontSize: '1.3rem', marginBottom: '1rem' }}>Lifetime Support</h3>
              <p style={{ color: '#475467', lineHeight: 1.8, margin: 0 }}>
                We don't disappear after the sale. Annual reviews, claims assistance, policy adjustments — we're with you for the long haul. Your success is our success.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Service Area */}
      <section style={{ padding: '4rem 0', background: '#fff' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 20px', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(1.6rem,2.5vw,2.2rem)', color: navy, margin: '0 0 1rem' }}>Proudly Serving Central Pennsylvania</h2>
          <p style={{ fontSize: '1.1rem', color: '#475467', marginBottom: '2rem' }}>
            560,000+ residents across three counties trust local advisors like {BRAND.name} for their protection needs.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginTop: '2rem' }} className="stats-grid">
            {[
              { county: 'Schuylkill County', population: '140K', highlight: 'Pottsville, Tamaqua, Schuylkill Haven' },
              { county: 'Luzerne County', population: '325K', highlight: 'Wilkes-Barre, Hazleton, Kingston' },
              { county: 'Northumberland County', population: '91K', highlight: 'Sunbury, Shamokin, Milton' }
            ].map(({ county, population, highlight }) => (
              <div key={county} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 14, padding: '1.5rem' }}>
                <h4 style={{ color: navy, fontSize: '1.15rem', marginBottom: '0.5rem' }}>{county}</h4>
                <p style={{ color: goldLight, fontWeight: 700, fontSize: '1.8rem', margin: '0.25rem 0' }}>{population}</p>
                <p style={{ color: '#667085', fontSize: '0.9rem', margin: 0 }}>{highlight}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ padding: '4rem 0', background: `linear-gradient(135deg, ${navy} 0%, #1a2942 100%)`, color: '#fff' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 20px', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(1.8rem,3vw,2.5rem)', margin: '0 0 1rem' }}>Ready to Protect Your Family's Future?</h2>
          <p style={{ fontSize: '1.15rem', color: 'rgba(255,255,255,0.85)', marginBottom: '2rem', lineHeight: 1.7 }}>
            Book a free consultation or get an instant quote in minutes. No pressure, just honest education and guidance.
          </p>
          
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href={BRAND.bookingUrl} style={{ display: 'inline-block', background: gold, color: navy, padding: '16px 32px', borderRadius: 999, fontWeight: 700, textDecoration: 'none', fontSize: '1.1rem' }} className="btn-hover">Book Free Consultation</a>
            <EthosQuoteLink style={{ display: 'inline-block', background: goldLight, color: navy, padding: '16px 32px', borderRadius: 999, fontWeight: 700, textDecoration: 'none', fontSize: '1.1rem', boxShadow: '0 0 20px rgba(197,162,77,0.4)' }} className="btn-hover">Get Instant Quote</EthosQuoteLink>
          </div>

          <div style={{ marginTop: '2.5rem', padding: '1.5rem', background: 'rgba(255,255,255,0.08)', borderRadius: 14, border: '1px solid rgba(255,255,255,0.15)' }}>
            <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.8)', margin: 0, lineHeight: 1.7 }}>
              📍 <strong>Office:</strong> 1544 Route 61 Hwy S, Ste 6104, Pottsville, PA 17901<br />
              📞 <strong>Phone:</strong> <a href={`tel:+1${BRAND.phoneRaw}`} style={{ color: goldLight, textDecoration: 'none' }}>{BRAND.phone}</a><br />
              📧 <strong>Email:</strong> <a href={`mailto:${BRAND.email}`} style={{ color: goldLight, textDecoration: 'none' }}>{BRAND.email}</a>
            </p>
          </div>
        </div>
      </section>

      {/* Tagline Banner */}
      <section style={{ padding: '2rem 0', background: '#f9fafb', textAlign: 'center', borderTop: '1px solid #e2e8f0' }}>
        <p style={{ color: '#667085', fontStyle: 'italic', margin: 0, fontSize: '1.05rem' }}>
          {BRAND.tagline} · {BRAND.hashtag}
        </p>
        <p style={{ color: navy, fontWeight: 700, marginTop: '0.5rem', fontSize: '1.1rem' }}>
          Building Wealth. Preserving Futures. Creating Legacies.
        </p>
      </section>

      {/* Community Sponsorship */}
      <section style={{ padding: '3rem 0', background: '#fff', borderTop: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: 560, margin: '0 auto', padding: '0 20px', textAlign: 'center' }}>
          <p style={{ color: '#667085', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', fontSize: '.8rem', marginBottom: '1.25rem' }}>Community Sponsorship</p>
          <Image
            src="/pahs-sponsor-flyer.png"
            alt="Latimore Life & Legacy LLC — Official All-Star Sponsor of the Pottsville Area Crimson Tide"
            width={560}
            height={700}
            style={{ width: '100%', height: 'auto', borderRadius: 18, boxShadow: '0 12px 36px rgba(0,0,0,0.12)' }}
          />
        </div>
      </section>

      <SiteFooter />

      <style>{`
        .btn-hover:hover {
          transform: translateY(-2px);
          transition: transform .18s ease;
        }
        @media (max-width: 960px) {
          .hero-grid, .grid-3, .grid-2 { grid-template-columns: 1fr !important; }
          .stats-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  )
}
