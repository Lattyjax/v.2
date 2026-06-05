
import Image from 'next/image'
import { BRAND, COLORS } from '@/lib/brand'
import { BadgeCheck, GraduationCap, FileText } from 'lucide-react'
import { SiteHeader, SiteFooter, DEFAULT_NAV_LINKS } from '@/app/_components/site-shell'

// Design tokens — sourced from lib/brand.ts (COLORS) which mirrors globals.css :root vars.
const navy      = COLORS.navy       // #0E1A2B  --color-navy-800
const gold      = COLORS.gold       // #C9A25F  --color-gold-500
const goldLight = COLORS.goldLight  // #E5C882  --color-gold-300



export default function AboutPage() {
  return (
    <>
      <SiteHeader currentPath="/about" navLinks={DEFAULT_NAV_LINKS} />
      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg, #0E1A2B 0%, #1a2942 100%)', color: '#fff', padding: '4rem 0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'center' }} className="about-grid">
          <div>
            <p style={{ color: '#E5C882', fontWeight: 600, marginBottom: '0.5rem', letterSpacing: 2, fontSize: '0.85rem', textTransform: 'uppercase' }}>About Jackson</p>
            <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', marginBottom: '1.5rem', lineHeight: 1.2 }}>
              Father. Survivor.<br /><span style={{ color: '#E5C882' }}>Your Trusted Advisor.</span>
            </h1>
            <p style={{ fontSize: '1.15rem', color: 'rgba(255,255,255,0.85)', lineHeight: 1.8, marginBottom: '1.5rem' }}>
              I didn't get into insurance to sell policies. I got into it because I know firsthand that life can change in a single heartbeat — and most families aren't prepared when it does.
            </p>
            <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.75)', lineHeight: 1.8 }}>
              My mission is simple: educate first, protect always. Every family I serve gets the same honest guidance I'd give my own.
            </p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <img
              src="/jackson-blue.jpg"
              alt="Jackson M. Latimore Sr."
              style={{ width: '100%', maxWidth: 420, borderRadius: 12, boxShadow: '0 20px 50px rgba(0,0,0,0.4)', objectFit: 'cover', objectPosition: 'center 15%', height: 480 }}
            />
          </div>
        </div>
        <style>{`@media(max-width:768px){.about-grid{grid-template-columns:1fr !important;}}`}</style>
      </section>

      {/* Cardiac Arrest Story */}
      <section style={{ background: '#fff', padding: '5rem 0' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 20px' }}>
          <p style={{ color: '#C9A24D', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, fontSize: '0.85rem', marginBottom: '0.75rem' }}>The Story Behind the Mission</p>
          <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', color: '#0E1A2B', marginBottom: '2rem', lineHeight: 1.3 }}>
            December 7, 2010.<br />My Heart Stopped.
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2.5rem' }} className="story-photos">
            <div>
              <Image src="/hospital-recovery.jpg" alt="Jackson recovering at Pocono Medical Center" width={700} height={500} sizes="(max-width: 960px) 100vw, 50vw" style={{ width: '100%', borderRadius: 10, boxShadow: '0 5px 20px rgba(0,0,0,0.12)', height: 'auto' }} />
              <p style={{ color: '#C9A24D', fontSize: '0.85rem', marginTop: '0.5rem', textAlign: 'center' }}>Pocono Medical Center — December 2010</p>
            </div>
            <div>
              <Image src="/news-headline.jpg" alt="Pocono Record news coverage" width={700} height={500} sizes="(max-width: 960px) 100vw, 50vw" style={{ width: '100%', borderRadius: 10, boxShadow: '0 5px 20px rgba(0,0,0,0.12)', height: 'auto' }} />
              <p style={{ color: '#C9A24D', fontSize: '0.85rem', marginTop: '0.5rem', textAlign: 'center' }}>Pocono Record coverage of the event</p>
            </div>
          </div>

          <p style={{ fontSize: '1.15rem', lineHeight: 1.9, color: '#333', marginBottom: '1.5rem' }}>
            I was 22 years old, playing basketball at East Stroudsburg University, when I went into sudden cardiac arrest on the court. I collapsed. My heart stopped. Everything went dark.
          </p>
          <p style={{ fontSize: '1.15rem', lineHeight: 1.9, color: '#333', marginBottom: '1.5rem' }}>
            I'm alive today because athletic trainers had immediate access to an AED — a defibrillator placed at ESU by the Gregory W. Moyer Defibrillator Fund, established after 15-year-old Greg Moyer died of cardiac arrest in 2000. Someone else's tragedy funded my second chance.
          </p>
          <p style={{ fontSize: '1.15rem', lineHeight: 1.9, color: '#333', marginBottom: '2rem' }}>
            That experience rewired how I see everything. Preparedness isn't a luxury — it's the difference between a family that survives a crisis and one that's destroyed by it. When I sit across from a client, I'm not thinking about commission. I'm thinking about the version of them that needs protection when life does what life does.
          </p>
          <blockquote style={{ background: 'rgba(197,162,77,0.1)', borderLeft: '5px solid #C9A24D', padding: '1.5rem 2rem', borderRadius: '0 10px 10px 0', margin: '0 0 2rem' }}>
            <p style={{ fontSize: '1.2rem', fontWeight: 600, color: '#0E1A2B', lineHeight: 1.7, margin: 0 }}>
              "The AED didn't save me — a plan did. Someone made a decision years earlier to be prepared. That's what I do for families every single day."
            </p>
            <p style={{ color: '#C9A24D', fontWeight: 700, marginTop: '0.75rem', margin: '0.75rem 0 0' }}>— Jackson M. Latimore Sr.</p>
          </blockquote>
        </div>
        <style>{`@media(max-width:640px){.story-photos{grid-template-columns:1fr !important;}}`}</style>
      </section>

      {/* Community Section with Coaching Photo */}
      <section style={{ background: '#0E1A2B', color: '#fff', padding: '4rem 0' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'center' }} className="community-grid">
          <div>
            <p style={{ color: '#E5C882', fontWeight: 600, letterSpacing: 2, fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '1rem' }}>Beyond the Office</p>
            <h2 style={{ fontSize: 'clamp(1.8rem,4vw,2.3rem)', marginBottom: '1.5rem', lineHeight: 1.3 }}>
              Rooted in the <span style={{ color: '#E5C882' }}>Community I Serve</span>
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.85)', lineHeight: 1.9, fontSize: '1.05rem', marginBottom: '1.25rem' }}>
              I coach youth baseball in Frackville through the Black Diamond program. The same kids I coach on the diamond are the ones whose families I help protect with life insurance and financial planning.
            </p>
            <p style={{ color: 'rgba(255,255,255,0.75)', lineHeight: 1.9, fontSize: '1rem' }}>
              When I sit across from a client, I'm not just their advisor — I'm their neighbor. That changes everything about how I work.
            </p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <img
              src="/jackson-coaching-baseball.jpg"
              alt="Jackson coaching Frackville Baseball 2024"
              style={{ width: '100%', maxWidth: 420, borderRadius: 12, boxShadow: '0 8px 30px rgba(0,0,0,0.4)', objectFit: 'cover' }}
            />
            <p style={{ color: '#E5C882', fontSize: '0.85rem', marginTop: '0.75rem' }}>Frackville Black Diamond Baseball — 2024</p>
          </div>
        </div>
        <style>{`@media(max-width:768px){.community-grid{grid-template-columns:1fr !important;}}`}</style>
      </section>

      {/* Credentials */}
      <section style={{ background: '#F5F5F5', padding: '4rem 0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
          <h2 style={{ textAlign: 'center', fontSize: 'clamp(1.8rem,4vw,2.3rem)', color: '#0E1A2B', marginBottom: '3rem' }}>Credentials & Background</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }} className="creds-grid">
            {[
              { icon: <BadgeCheck size={32} color={navy} />, title: 'Licensed in Pennsylvania', body: 'PA DOI License #1268820 | NIPR #21638507 — Independent contractor. I work for you, not a captive company.' },
              { icon: <GraduationCap size={32} color={navy} />, title: 'MBA — American InterContinental University', body: 'Master of Business Administration (2026). Also holds an MS in Management & Leadership with Public Administration concentration from East Stroudsburg University.' },
              { icon: <FileText size={32} color={navy} />, title: 'Political Science & Public Admin', body: 'B.S. Political Science. Background in Social Security paralegal work and home health aide services — I understand real families.' },
              { icon: '', title: 'Affiliated with Global Financial Impact', body: 'Independent contractor operating under GFI — giving me access to top-tier carriers without the limitations of captive agents.' },
              { icon: '', title: 'Youth Sports Coach', body: 'Active coach in Schuylkill County. Community is everything. I serve the same families I root for on the sidelines.' },
              { icon: '', title: 'Cardiac Arrest Survivor', body: 'Survived sudden cardiac arrest at age 22. This isn\'t a job — it\'s a calling born from personal experience with life\'s fragility.' },
            ].map((c, i) => (
              <div key={i} style={{ background: '#fff', padding: '2rem', borderRadius: 10, boxShadow: '0 2px 15px rgba(0,0,0,0.07)', borderTop: '3px solid #C9A24D' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{c.icon}</div>
                <h3 style={{ color: '#0E1A2B', fontSize: '1.05rem', marginBottom: '0.5rem' }}>{c.title}</h3>
                <p style={{ color: '#666', fontSize: '0.95rem', lineHeight: 1.7 }}>{c.body}</p>
              </div>
            ))}
          </div>
        </div>
        <style>{`@media(max-width:900px){.creds-grid{grid-template-columns:repeat(2,1fr) !important;}} @media(max-width:580px){.creds-grid{grid-template-columns:1fr !important;}}`}</style>
      </section>

      {/* Service Area */}
      <section style={{ background: '#0E1A2B', color: '#fff', padding: '4rem 0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(1.8rem,4vw,2.3rem)', marginBottom: '1rem' }}>Service Area</h2>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '1.1rem', marginBottom: '3rem' }}>Proudly serving families and employers across Central Pennsylvania</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
            {['Schuylkill County', 'Luzerne County', 'Northumberland County'].map(c => (
              <div key={c} style={{ background: 'rgba(197,162,77,0.15)', border: '1px solid #C9A24D', padding: '1.5rem 2.5rem', borderRadius: 10 }}>
                <p style={{ color: '#E5C882', fontWeight: 700, fontSize: '1.1rem', margin: 0 }}> {c}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: 'linear-gradient(135deg, #C9A24D 0%, #E5C882 100%)', padding: '4rem 0', textAlign: 'center' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 20px' }}>
          <h2 style={{ fontSize: 'clamp(1.8rem,4vw,2.3rem)', color: '#0E1A2B', marginBottom: '1rem' }}>Ready to Work with Jackson?</h2>
          <p style={{ fontSize: '1.1rem', color: '#0E1A2B', marginBottom: '2rem' }}>No pressure. No jargon. Just honest guidance built around your family's needs.</p>
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
      <SiteFooter />
    </>
  )
                       }
