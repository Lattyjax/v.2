'use client'

import Link from 'next/link'
import { BRAND } from '@/lib/brand'

export default function BookNowPage() {
  return (
    <div className="min-h-screen flex flex-col bg-brand-bg">
      {/* Sticky header with logo and quick contact on desktop */}
      <header className="sticky top-0 z-20 w-full border-b border-brand-gold/20 bg-brand-bg">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-3 text-brand-ink no-underline">
            <img
              src="/logo.jpg"
              alt={BRAND.name}
              className="h-8 w-8 rounded-md object-cover"
            />
            <span className="font-semibold leading-none text-brand-ink">
              {BRAND.name}
            </span>
          </Link>
          <div className="hidden md:flex gap-6 text-sm font-medium">
            <a href={`tel:${BRAND.phoneRaw}`} className="text-brand-gold hover:underline">
              {BRAND.phone}
            </a>
            <a href={`mailto:${BRAND.email}`} className="text-brand-gold hover:underline">
              {BRAND.email}
            </a>
          </div>
        </div>
      </header>

      {/* Main content area */}
      <main className="flex flex-1 flex-col md:flex-row gap-10 max-w-6xl mx-auto w-full px-4 py-12">
        {/* Left column: pitch and CTA */}
        <section className="flex-1 flex flex-col justify-center">
          <p className="uppercase tracking-widest text-xs font-semibold text-brand-gold mb-2">
            Complimentary Consultation
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-brand-ink mb-4 leading-tight">
            Secure Your Legacy Today
          </h1>
          <p className="text-brand-muted mb-6 text-base md:text-lg leading-relaxed max-w-prose">
            Start your journey toward peace of mind. Book a free 30 minute strategy call
            with Jackson to discover how to protect your income, family and retirement
            using proven protection and legacy planning strategies.
          </p>
          <Link
            href={BRAND.bookingUrl}
            className="inline-block bg-brand-gold text-brand-bg font-semibold px-6 py-3 rounded-md shadow-lg hover:bg-brand-gold/90 transition-colors"
          >
            Book 30 Minute Call
          </Link>
          <div className="mt-8 space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-brand-gold text-lg">✓</span>
              <span className="text-brand-muted text-sm md:text-base">
                No obligation — just a conversation
              </span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-brand-gold text-lg">✓</span>
              <span className="text-brand-muted text-sm md:text-base">
                Personalized protection & legacy overview
              </span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-brand-gold text-lg">✓</span>
              <span className="text-brand-muted text-sm md:text-base">
                Tailored action plan for your goals
              </span>
            </div>
          </div>
        </section>

        {/* Right column: contact sidebar */}
        <aside className="w-full md:w-80 flex-shrink-0">
          <div className="bg-brand-surface border border-brand-gold/25 rounded-xl p-6 space-y-4 shadow-lg">
            <h2 className="text-brand-ink text-xl font-semibold text-center">
              Ready to Talk?
            </h2>
            <Link
              href={BRAND.bookingUrl}
              className="block w-full text-center bg-brand-gold text-brand-bg font-semibold py-2 rounded-md hover:bg-brand-gold/90 transition-colors"
            >
              Book Now
            </Link>
            <div className="text-center text-brand-muted text-sm space-y-1">
              <p>Prefer a quick chat?</p>
              <a href={`tel:${BRAND.phoneRaw}`} className="text-brand-gold hover:underline">
                {BRAND.phone}
              </a>
              <a href={`mailto:${BRAND.email}`} className="block text-brand-gold hover:underline">
                {BRAND.email}
              </a>
            </div>
            {/* Digital card link uses the new BRAND.cardUrl property. It's optional but
               provides a simple contact card for mobile users. */}
            <div className="text-center pt-2 border-t border-brand-gold/20 mt-2">
              <Link
                href={BRAND.cardUrl}
                className="text-brand-gold text-sm font-medium hover:underline"
              >
                View Digital Card
              </Link>
            </div>
          </div>
        </aside>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-brand-muted text-sm border-t border-brand-gold/10 px-4">
        © {new Date().getFullYear()} {BRAND.fullName}
      </footer>
    </div>
  )
}


/*
  Landing page for booking a free consultation.

  This page is intentionally minimal and conversion-focused. It presents a clear
  headline, a concise explanation of the benefits of a complimentary strategy
  call, and a single dominant call-to-action leading to the main booking page
  (`/book`). A secondary sidebar surfaces alternative contact methods like
  calling, emailing, or viewing the digital business card, without distracting
  from the primary CTA. The header sticks to the top on scroll and shows
  contact details on larger screens. This file does not modify or depend on
  existing page layouts so the rest of the site remains untouched.
*/
