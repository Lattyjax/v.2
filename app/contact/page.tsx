import Image from 'next/image'
import { BRAND } from '@/lib/brand'
import { Calendar, Phone, Mail, Quote, Facebook, QrCode } from 'lucide-react'
import { SiteHeader, SiteFooter, DEFAULT_NAV_LINKS } from '@/app/_components/site-shell'



const navy = '#0E1A2B'
const gold = '#C9A24D'
const goldLight = '#E5C882'



export default function ContactPage() {
  return (
    <>
      <SiteHeader currentPath="/contact" navLinks={DEFAULT_NAV_LINKS} />
      <main style={{ fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>

        {/* Header */}
        <section style={{ background: `linear-gradient(135deg, ${navy} 0%, #1a2942 100%)`, color: '#fff', padding: '4rem 0', textAlign: 'center' }}>
          <div style={{ maxWidth: 700, margin: '0 auto', padding: '0 20px' }}>
            <p style={{ color: goldLight, fontWeight: 600, letterSpacing: 2, fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '1rem' }}>Get in Touch</p>
            <h1 style={{ fontSize: 'clamp(1.8rem,4vw,2.8rem)', marginBottom: '1.25rem', lineHeight: 1.2 }}>
              Ready to Protect<br /><span style={{ color: goldLight }}>What Matters Most?</span>
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1.1rem', lineHeight: 1.8 }}>
              Reach out by phone, email, or book directly online. No pressure, no obligation — just a real conversation about your family&apos;s financial protection.
            </p>
          </div>
        </section>

        {/* Contact Options */}
        <section style={{ padding: '4rem 0', background: '#F5F5F5' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '2rem', marginBottom: '3rem' }}>

              {/* Book */}
              <div style={{ background: '#fff', borderRadius: 12, padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', borderTop: `4px solid ${gold}`, textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}><Calendar size={44} color="#C9A24D" /></div>
                <h2 style={{ color: navy, fontSize: '1.3rem', marginBottom: '0.75rem' }}>Book a Consultation</h2>
                <p style={{ color: '#555', lineHeight: 1.7, marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                  Schedule a free, no-obligation consultation at a time that works for you. Jackson will review your situation and walk you through your options.
                </p>
                <a href={BRAND.bookingUrl} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'block', background: gold, color: navy, padding: '0.9rem', borderRadius: 6, fontWeight: 700, textDecoration: 'none', fontSize: '1rem' }}>
                  Schedule Now →
                </a>
              </div>

              {/* Phone */}
              <div style={{ background: '#fff', borderRadius: 12, padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', borderTop: `4px solid ${gold}`, textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}><Phone size={44} color="#C9A24D" /></div>
                <h2 style={{ color: navy, fontSize: '1.3rem', marginBottom: '0.75rem' }}>Call or Text</h2>
                <p style={{ color: '#555', lineHeight: 1.7, marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                  Prefer to call? Reach Jackson directly. Calls and texts welcome during business hours across Schuylkill, Luzerne, and Northumberland Counties.
                </p>
                <a href={`tel:${BRAND.phoneRaw}`}
                  style={{ display: 'block', background: gold, color: navy, padding: '0.9rem', borderRadius: 6, fontWeight: 700, textDecoration: 'none', fontSize: '1rem' }}>
                  {BRAND.phone}
                </a>
              </div>

              {/* Email */}
              <div style={{ background: '#fff', borderRadius: 12, padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', borderTop: `4px solid ${gold}`, textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}><Mail size={44} color="#C9A24D" /></div>
                <h2 style={{ color: navy, fontSize: '1.3rem', marginBottom: '0.75rem' }}>Send an Email</h2>
                <p style={{ color: '#555', lineHeight: 1.7, marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                  Have a question or want to share some background before your consultation? Send a message and expect a response within one business day.
                </p>
                <a href={`mailto:${BRAND.email}`}
                  style={{ display: 'block', background: gold, color: navy, padding: '0.9rem', borderRadius: 6, fontWeight: 700, textDecoration: 'none', fontSize: '0.95rem', wordBreak: 'break-all' }}>
                  {BRAND.email}
                </a>
              </div>

              {/* Get Quote */}
              <div style={{ background: '#fff', borderRadius: 12, padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', borderTop: `4px solid ${gold}`, textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}><Quote size={44} color="#C9A24D" /></div>
                <h2 style={{ color: navy, fontSize: '1.3rem', marginBottom: '0.75rem' }}>Get an Instant Quote</h2>
                <p style={{ color: '#555', lineHeight: 1.7, marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                  Want a quick term life insurance quote online? Apply in minutes. No medical exam required for many applicants. Fast approval decisions.
                </p>
                <a href={BRAND.ethosUrl} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'block', background: gold, color: navy, padding: '0.9rem', borderRadius: 6, fontWeight: 700, textDecoration: 'none', fontSize: '1rem' }}>
                  Get Quote Now →
                </a>
              </div>

              {/* Facebook */}
              <div style={{ background: '#fff', borderRadius: 12, padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', borderTop: `4px solid ${gold}`, textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}><Facebook size={44} color="#C9A24D" /></div>
                <h2 style={{ color: navy, fontSize: '1.3rem', marginBottom: '0.75rem' }}>Follow on Facebook</h2>
                <p style={{ color: '#555', lineHeight: 1.7, marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                  Follow the Latimore Life & Legacy Facebook page for educational content, community updates, and financial protection tips.
                </p>
                <a href={BRAND.facebook} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'block', background: gold, color: navy, padding: '0.9rem', borderRadius: 6, fontWeight: 700, textDecoration: 'none', fontSize: '1rem' }}>
                  Visit Facebook Page →
                </a>
              </div>

              {/* QR */}
              <div style={{ background: '#fff', borderRadius: 12, padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', borderTop: `4px solid ${gold}`, textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}><QrCode size={44} color="#C9A24D" /></div>
                <h2 style={{ color: navy, fontSize: '1.3rem', marginBottom: '0.75rem' }}>Scan to Apply</h2>
                <p style={{ color: '#555', lineHeight: 1.7, marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                  Scan the QR code to go directly to the instant life insurance application. Takes minutes on your phone.
                </p>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <Image src="/ethos-qr.png" alt="Scan to apply for life insurance" width={120} height={120} sizes="120px" style={{ borderRadius: 8 }} />
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Social / Location */}
        <section style={{ background: navy, padding: '4rem 0' }}>
          <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 20px', textAlign: 'center' }}>
            <h2 style={{ color: '#fff', fontSize: 'clamp(1.4rem,3vw,2rem)', marginBottom: '1rem' }}>Stay Connected</h2>
            <p style={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.8, marginBottom: '2rem' }}>
              Follow along on social media for educational content on life insurance, annuities, and financial protection for Pennsylvania families.
            </p>
            <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '3rem' }}>
              {[
                [' Instagram', BRAND.instagram],
                [' LinkedIn', BRAND.linkedin],
                [' Facebook', BRAND.facebook],
              ].map(([label, href]) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                  style={{ background: 'rgba(255,255,255,0.08)', border: `1px solid ${gold}50`, color: goldLight, padding: '0.75rem 1.5rem', borderRadius: 6, textDecoration: 'none', fontWeight: 600, fontSize: '0.95rem' }}>
                  {label}
                </a>
              ))}
            </div>
            <div style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${gold}30`, borderRadius: 10, padding: '2rem', maxWidth: 600, margin: '0 auto' }}>
              <p style={{ color: goldLight, fontWeight: 700, marginBottom: '0.5rem' }}> Service Area</p>
              <p style={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.7 }}>
                Schuylkill County · Luzerne County · Northumberland County<br />
                <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>Central & Northeastern Pennsylvania</span>
              </p>
            </div>
          </div>
        </section>

      </main>
      <SiteFooter />
    </>
  )
}
