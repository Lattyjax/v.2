import Link from 'next/link'

export default function ThankYouPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#0E1A2B', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", textAlign: 'center' }}>
      <div style={{ maxWidth: 560 }}>
        <div style={{ width: 72, height: 72, background: 'rgba(201,162,77,0.15)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', fontSize: '2rem' }}></div>
        <h1 style={{ color: '#fff', fontSize: 'clamp(1.8rem,4vw,2.5rem)', marginBottom: '1rem', lineHeight: 1.2 }}>
          You&apos;re All Set
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.05rem', lineHeight: 1.8, marginBottom: '2rem' }}>
          Thank you for reaching out. Jackson will be in touch within one business day to confirm your consultation and prepare for your conversation.
        </p>
        <div style={{ background: 'rgba(201,162,77,0.1)', border: '1px solid rgba(201,162,77,0.3)', borderRadius: 10, padding: '1.25rem', marginBottom: '2rem' }}>
          <p style={{ color: '#E5C882', fontWeight: 600, marginBottom: '0.4rem' }}>What happens next?</p>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.9rem', lineHeight: 1.7 }}>
            Jackson reviews your submission and reaches out to confirm your appointment time, answer any initial questions, and prepare a personalized overview for your call.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/" style={{ background: '#C9A24D', color: '#0E1A2B', padding: '0.9rem 2rem', borderRadius: 6, fontWeight: 700, textDecoration: 'none' }}>Back to Home</Link>
          <Link href="/education" style={{ background: 'transparent', color: '#fff', border: '2px solid rgba(255,255,255,0.3)', padding: '0.9rem 2rem', borderRadius: 6, fontWeight: 600, textDecoration: 'none' }}>Read Education Center</Link>
        </div>
      </div>
    </div>
  )
}
