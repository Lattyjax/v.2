'use client'

import { useState } from 'react'
import { BRAND } from '@/lib/brand'
import { Shield, PiggyBank, TrendingUp, Clock } from 'lucide-react'
import { SiteHeader, SiteFooter, DEFAULT_NAV_LINKS } from '@/app/_components/site-shell'


const navy = '#0E1A2B'
const gold = '#C9A24D'
const goldLight = '#E5C882'



const topics = [
  {
    icon: <Shield size={28} />,
    title: 'What Is Life Insurance and Why Do You Need It?',
    body: `Life insurance pays a tax-free lump sum to your chosen beneficiary when you pass away. That money can replace your income, pay off your mortgage, cover final expenses, or fund your children's education — whatever your family needs most.

Without it, your family absorbs every financial obligation you leave behind. With it, they have time to grieve without financial pressure. Life insurance is not about death — it is about protecting the life your family would need to rebuild.`,
    callout: 'Key fact: The death benefit is generally income-tax-free to your beneficiary.',
  },
  {
    icon: <Clock size={28} />,
    title: 'Term vs. Permanent Insurance — What Is the Difference?',
    body: `Term insurance covers you for a specific period — 10, 20, or 30 years. If you pass during that term, your beneficiary receives the death benefit. If the term ends and you are still living, coverage expires. It is the most affordable type of life insurance and ideal for income replacement during your working years.

Permanent insurance (whole life or universal life) never expires as long as premiums are paid. It also builds cash value over time — a living asset you can borrow against. Permanent coverage costs more but provides lifelong protection and can serve as a financial planning tool.`,
    callout: 'The right choice depends on your age, income, health, and long-term goals — not a one-size formula.',
  },
  {
    icon: <PiggyBank size={28} />,
    title: 'What Are Living Benefits?',
    body: `Living benefits allow you to access a portion of your death benefit while you are still alive if you experience a qualifying health event — such as a heart attack, stroke, cancer diagnosis, or a condition that prevents you from performing daily activities.

This is a game-changer. Your life insurance policy becomes a safety net not just for your family after you die, but for you and your family during a serious illness. Medical bills are the leading cause of bankruptcy in America. Living benefits can prevent that.`,
    callout: 'Many policies include living benefit riders at no additional cost.',
  },
  {
    icon: <TrendingUp size={28} />,
    title: 'How Do Annuities Work?',
    body: `An annuity is a contract between you and an insurance company. You make a lump-sum or series of payments, and in return the company guarantees growth and/or a stream of income — either immediately or at a future date.

Annuities are not market investments. They are insurance products designed to protect your principal while providing growth and income you cannot outlive. They are particularly valuable for rolling over 401(k)s, pensions, or other retirement funds into a protected vehicle.`,
    callout: 'Fixed and fixed-indexed annuities offer principal protection — your balance cannot go negative due to market losses.',
  },
  {
    icon: '',
    title: 'What Is a 401(k) Rollover and When Should You Do One?',
    body: `When you leave a job, you have options for your 401(k) funds: leave them with your former employer, roll them to your new employer's plan, roll them to an IRA, or convert them to an annuity or other protected vehicle.

Done correctly, a rollover is tax-free and penalty-free. Done incorrectly — or left sitting in a former employer's plan where you have no control — it can cost you in fees, poor investment options, or tax consequences you did not anticipate. A rollover consultation can save you thousands.`,
    callout: 'You typically have 60 days from receiving a distribution to complete a rollover without penalty.',
  },
  {
    icon: '',
    title: 'What Is Key Person Insurance for a Business?',
    body: `Key person insurance is a life insurance policy owned by a business on a critical employee or owner. If that person passes away or becomes disabled, the business receives a tax-free death benefit to cover losses — lost revenue, recruitment and training costs, loan repayments, or to fund a buy-sell agreement.

For small businesses, the loss of one key person can be fatal to operations. This coverage buys the business time to survive and recover.`,
    callout: 'Any business that would suffer a serious financial loss from losing one individual should consider key person coverage.',
  },
  {
    icon: '',
    title: 'What Is Mortgage Protection Insurance?',
    body: `Mortgage protection is a life insurance policy structured to cover your outstanding mortgage balance if you pass away. Your family stays in the home — the bank gets paid, and your loved ones are not forced to sell or move during an already devastating time.

Unlike private mortgage insurance (PMI), which protects the lender, mortgage protection insurance protects your family. It is one of the most straightforward and impactful policies a homeowner can have.`,
    callout: 'Mortgage protection is typically structured as a decreasing term policy that mirrors your mortgage balance.',
  },
  {
    icon: '',
    title: 'How Can Life Insurance Fund College Education?',
    body: `Certain permanent life insurance policies — particularly indexed universal life — can be structured as a college funding vehicle. You overfund the policy during your working years, allowing the cash value to grow tax-deferred. When college expenses arrive, you access funds through tax-free policy loans.

Unlike 529 plans, there are no restrictions on how you use the funds. And unlike savings accounts, the cash value is protected from market downturns and may not count against financial aid eligibility the same way other assets do.`,
    callout: 'This strategy works best when started early — the more time the cash value has to grow, the more powerful it becomes.',
  },
]

export default function EducationPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <>
      <SiteHeader currentPath="/education" navLinks={DEFAULT_NAV_LINKS} />
      <main style={{ fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>

        {/* Header */}
        <section style={{ background: `linear-gradient(135deg, ${navy} 0%, #1a2942 100%)`, color: '#fff', padding: '4rem 0', textAlign: 'center' }}>
          <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 20px' }}>
            <p style={{ color: goldLight, fontWeight: 600, letterSpacing: 2, fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '1rem' }}>Financial Education Center</p>
            <h1 style={{ fontSize: 'clamp(1.8rem,4vw,2.8rem)', marginBottom: '1.25rem', lineHeight: 1.2 }}>
              Understand What You Are Buying<br /><span style={{ color: goldLight }}>Before You Buy It</span>
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1.1rem', lineHeight: 1.8 }}>
              An educated client makes better decisions. These guides break down the most important concepts in plain language — no jargon, no sales pitch.
            </p>
          </div>
        </section>

        {/* Accordion Topics */}
        <section style={{ padding: '4rem 0', background: '#F5F5F5' }}>
          <div style={{ maxWidth: 860, margin: '0 auto', padding: '0 20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {topics.map((t, i) => (
                <div key={i} style={{ background: '#fff', borderRadius: 10, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', overflow: 'hidden', border: openIndex === i ? `2px solid ${gold}` : '2px solid transparent' }}>
                  <button
                    onClick={() => setOpenIndex(openIndex === i ? null : i)}
                    style={{ width: '100%', background: 'none', border: 'none', padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', textAlign: 'left' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span style={{ fontSize: '1.5rem' }}>{t.icon}</span>
                      <span style={{ color: navy, fontWeight: 700, fontSize: '1rem', lineHeight: 1.4 }}>{t.title}</span>
                    </div>
                    <span style={{ color: gold, fontSize: '1.4rem', fontWeight: 700, flexShrink: 0, marginLeft: '1rem' }}>{openIndex === i ? '−' : '+'}</span>
                  </button>
                  {openIndex === i && (
                    <div style={{ padding: '0 1.5rem 1.5rem' }}>
                      {t.body.split('\n\n').map((para, j) => (
                        <p key={j} style={{ color: '#444', lineHeight: 1.8, marginBottom: '1rem', fontSize: '0.97rem' }}>{para}</p>
                      ))}
                      <div style={{ background: `${gold}18`, border: `1px solid ${gold}50`, borderRadius: 8, padding: '1rem 1.25rem', marginTop: '0.5rem' }}>
                        <p style={{ color: navy, fontWeight: 600, fontSize: '0.9rem', margin: 0 }}> {t.callout}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Glossary */}
        <section style={{ background: '#fff', padding: '4rem 0' }}>
          <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 20px' }}>
            <h2 style={{ textAlign: 'center', color: navy, fontSize: 'clamp(1.4rem,3vw,2rem)', marginBottom: '3rem' }}>Key Terms Defined</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '1.25rem' }}>
              {[
                ['Death Benefit', 'The tax-free lump sum paid to your beneficiary when you pass away.'],
                ['Beneficiary', 'The person or entity you designate to receive the death benefit.'],
                ['Premium', 'The amount you pay — monthly, quarterly, or annually — to keep your policy active.'],
                ['Cash Value', 'The savings component inside a permanent policy that grows over time and can be accessed while you are alive.'],
                ['Policy Loan', 'A loan taken against your policy\'s cash value, typically tax-free and with no credit check required.'],
                ['Rider', 'An add-on to your base policy that provides additional benefits, such as living benefits or disability waiver.'],
                ['Underwriting', 'The insurance company\'s process of evaluating your health and risk profile to determine your premium rate.'],
                ['Face Amount', 'The total death benefit your policy will pay — for example, a $500,000 policy has a $500,000 face amount.'],
                ['Term', 'The length of time a term insurance policy remains in force — typically 10, 20, or 30 years.'],
                ['Annuitization', 'Converting an annuity\'s accumulated value into a stream of regular income payments.'],
                ['Surrender Period', 'The time during which withdrawing funds from an annuity may result in a surrender charge.'],
                ['Indexed Strategy', 'A crediting method tied to a market index like the S&P 500, offering upside potential with a zero-loss floor.'],
              ].map(([term, def]) => (
                <div key={term} style={{ background: '#F9F9F9', borderRadius: 8, padding: '1.25rem', borderLeft: `3px solid ${gold}` }}>
                  <p style={{ color: navy, fontWeight: 700, marginBottom: '0.4rem', fontSize: '0.95rem' }}>{term}</p>
                  <p style={{ color: '#555', fontSize: '0.88rem', lineHeight: 1.6, margin: 0 }}>{def}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ background: `linear-gradient(135deg, ${gold} 0%, ${goldLight} 100%)`, padding: '4rem 0', textAlign: 'center' }}>
          <div style={{ maxWidth: 700, margin: '0 auto', padding: '0 20px' }}>
            <h2 style={{ color: navy, fontSize: 'clamp(1.5rem,3vw,2.2rem)', marginBottom: '1rem' }}>Questions? Let&apos;s Talk Through It.</h2>
            <p style={{ color: navy, fontSize: '1.05rem', marginBottom: '2rem', lineHeight: 1.7 }}>
              No obligation, no pressure. A 20-minute conversation can give you more clarity than hours of online research.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href={BRAND.bookingUrl} target="_blank" rel="noopener noreferrer" style={{ background: navy, color: '#fff', padding: '1rem 2rem', borderRadius: 6, fontWeight: 700, textDecoration: 'none' }}>Book Free Consultation</a>
              <a href={`tel:${BRAND.phoneRaw}`} style={{ background: 'transparent', color: navy, border: `2px solid ${navy}`, padding: '1rem 2rem', borderRadius: 6, fontWeight: 700, textDecoration: 'none' }}>Call {BRAND.phone}</a>
            </div>
          </div>
        </section>

      </main>
      <SiteFooter />
    </>
  )
}
