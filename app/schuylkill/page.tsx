import type { Metadata } from 'next'
import { BRAND, COLORS } from '@/lib/brand'
import { SiteHeader, SiteFooter, JOIN_NAV_LINKS } from '@/app/_components/site-shell'
import SchuylkillLeadForm from './SchuylkillLeadForm'

export const metadata: Metadata = {
  title: 'Protecting What Matters Most | Schuylkill County Life Insurance Guide',
  description:
    'A local guide to modern life insurance for Schuylkill County families — term life with living benefits, IUL, juvenile policies, and final expense planning. Serving Pottsville, Tamaqua, Schuylkill Haven, and the full Coal Region.',
  openGraph: {
    title: 'Protecting What Matters Most | Schuylkill County Life Insurance Guide',
    description:
      'From Pottsville to Tamaqua — a plain-English breakdown of the four financial tools every Schuylkill County family should know.',
    url: `${BRAND.baseUrl}/schuylkill`,
  },
}

const navy = COLORS.navy
const gold = COLORS.gold
const goldLight = COLORS.goldLight

const PRODUCTS = [
  {
    num: '01',
    title: 'Term Life with Living Benefits',
    subtitle: 'Protection for the "What Ifs"',
    icon: '🛡️',
    color: '#e8f4fd',
    border: '#bee3f8',
    body: `Traditional life insurance only pays out if you pass away. But what happens if you suffer a major health crisis and survive?

With Living Benefits, your term life policy lets you access your death benefit while still alive if you're diagnosed with a critical, chronic, or terminal illness — like a heart attack, stroke, or cancer.`,
    local:
      'Heart disease and cancer remain leading health concerns in our region. Living benefits ensure that if you need to travel to Allentown or Hershey for medical treatment, your mortgage and utilities are still covered. It\'s protection for life\'s curveballs, not just the end of life.',
  },
  {
    num: '02',
    title: 'Indexed Universal Life (IUL)',
    subtitle: 'Growth and Security Combined',
    icon: '📈',
    color: '#fef9e7',
    border: '#fde68a',
    body: `If you want your money to work harder without risking it all in a volatile stock market, an IUL might be the answer. It provides a death benefit and builds cash value tied to a market index like the S&P 500.

The best part? The 0% floor. When the market goes up, your cash value grows. When the market dips, you never lose your principal due to market crashes.`,
    local:
      "With the rising cost of living, relying solely on a traditional savings account or a volatile 401(k) can feel risky. An IUL offers Schuylkill residents a reliable way to build tax-free retirement income with a built-in safety net.",
  },
  {
    num: '03',
    title: 'Juvenile IUL',
    subtitle: "Locking in Your Child's Financial Future",
    icon: '👦',
    color: '#f0fdf4',
    border: '#bbf7d0',
    body: `A Juvenile IUL is a policy taken out on a child or grandchild that pulls double duty — it secures incredibly low insurance rates for life while maximizing the time the cash value has to compound and grow.`,
    local:
      "By the time your child graduates from Pottsville, North Schuylkill, or Schuylkill Haven, this policy can have accumulated significant cash value. They can borrow against it tax-free to pay for college, buy their first home in the county, or start a local business — all while keeping their life insurance protection intact.",
  },
  {
    num: '04',
    title: 'Final Expense',
    subtitle: 'Peace of Mind for Your Loved Ones',
    icon: '🕊️',
    color: '#fdf4ff',
    border: '#e9d5ff',
    body: `Final Expense insurance is a permanent whole life policy specifically designed to cover funeral costs, burial fees, and outstanding medical bills. No medical exam required. Guaranteed acceptance options available.`,
    local:
      "The average funeral today can easily cost $8,000–$10,000+. A Final Expense policy ensures your family can focus on celebrating your legacy at a local funeral home rather than stressing over how to pay for it. Because we are a tight-knit community, the last thing anyone wants is to leave a financial burden behind.",
  },
]

export default function SchuylkillPage() {
  return (
    <>
      <SiteHeader currentPath="/schuylkill" navLinks={JOIN_NAV_LINKS} />

      {/* ── Hero ── */}
      <section
        style={{
          background: `linear-gradient(135deg, ${navy} 0%, #1a2942 100%)`,
          color: '#fff',
          padding: '5rem 0 4rem',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: 860, margin: '0 auto', padding: '0 24px' }}>
          <div
            style={{
              display: 'inline-block',
              background: 'rgba(201,162,95,0.18)',
              border: `1px solid rgba(201,162,95,0.45)`,
              color: goldLight,
              fontSize: '0.78rem',
              fontWeight: 700,
              letterSpacing: '.1em',
              textTransform: 'uppercase',
              padding: '6px 16px',
              borderRadius: 999,
              marginBottom: '1.5rem',
            }}
          >
            Schuylkill County · Coal Region · Central Pennsylvania
          </div>

          <h1
            style={{
              fontSize: 'clamp(2rem, 5vw, 3.4rem)',
              lineHeight: 1.1,
              margin: '0 0 1rem',
              fontWeight: 800,
            }}
          >
            Protecting What Matters Most
          </h1>

          <p
            style={{
              fontSize: 'clamp(1.1rem, 2.5vw, 1.35rem)',
              color: goldLight,
              margin: '0 0 1.25rem',
              fontWeight: 600,
            }}
          >
            A Schuylkill County Guide to Modern Life Insurance
          </p>

          <p
            style={{
              fontSize: '1.1rem',
              color: 'rgba(255,255,255,0.85)',
              maxWidth: '65ch',
              margin: '0 auto 2.5rem',
              lineHeight: 1.75,
            }}
          >
            From the coal region roots to Friday night football in Pottsville, Tamaqua, and Blue Mountain
            — family is everything. Let&apos;s make sure yours is protected.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a
              href="#get-started"
              style={{
                display: 'inline-block',
                background: gold,
                color: navy,
                padding: '15px 32px',
                borderRadius: 999,
                fontWeight: 700,
                textDecoration: 'none',
                fontSize: '1.05rem',
              }}
              data-county="Schuylkill"
            >
              🛡️ Get My Free Consultation
            </a>
            <a
              href={`tel:+1${BRAND.phoneRaw}`}
              style={{
                display: 'inline-block',
                background: 'rgba(255,255,255,0.1)',
                border: '1.5px solid rgba(255,255,255,0.3)',
                color: '#fff',
                padding: '15px 32px',
                borderRadius: 999,
                fontWeight: 600,
                textDecoration: 'none',
                fontSize: '1.05rem',
              }}
              data-county="Schuylkill"
            >
              ☎️ Call Jackson Direct
            </a>
          </div>
        </div>
      </section>

      {/* ── Intro ── */}
      <section style={{ padding: '4rem 0', background: '#f9fafb' }}>
        <div style={{ maxWidth: 780, margin: '0 auto', padding: '0 24px' }}>
          <p
            style={{
              fontSize: '1.12rem',
              color: '#374151',
              lineHeight: 1.85,
              margin: '0 0 1.5rem',
            }}
          >
            Here in Schuylkill County, we pride ourselves on grit, community, and looking out for our
            own. But looking out for your family means planning for the unexpected.
          </p>

          <p style={{ fontSize: '1.12rem', color: '#374151', lineHeight: 1.85, margin: '0 0 1.5rem' }}>
            Many &ldquo;Skook&rdquo; residents think life insurance is just a payout for when
            you&apos;re gone. The truth is, modern financial tools do so much more — whether
            you&apos;re trying to protect your mortgage, build a tax-free retirement, or give your kids
            a head start.
          </p>

          <div
            style={{
              background: `rgba(201,162,95,0.12)`,
              borderLeft: `4px solid ${gold}`,
              padding: '1.25rem 1.5rem',
              borderRadius: 10,
              fontStyle: 'italic',
              color: navy,
              fontSize: '1.05rem',
              lineHeight: 1.7,
            }}
          >
            There is a tailored solution for your household. Let&apos;s break down the four essential
            tools every Schuylkill County family should know about.
          </div>
        </div>
      </section>

      {/* ── Product Cards ── */}
      <section style={{ padding: '4rem 0', background: '#fff' }}>
        <div style={{ maxWidth: 1060, margin: '0 auto', padding: '0 24px' }}>
          <h2
            style={{
              fontSize: 'clamp(1.6rem, 2.5vw, 2.2rem)',
              color: navy,
              textAlign: 'center',
              margin: '0 0 0.5rem',
            }}
          >
            Four Essential Financial Tools
          </h2>
          <p
            style={{
              textAlign: 'center',
              color: '#667085',
              marginBottom: '3rem',
              fontSize: '1.05rem',
            }}
          >
            Built for Coal Region families — not cookie-cutter plans.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {PRODUCTS.map(product => (
              <article
                key={product.num}
                style={{
                  background: product.color,
                  border: `1px solid ${product.border}`,
                  borderRadius: 20,
                  padding: '2rem 2.25rem',
                  display: 'grid',
                  gridTemplateColumns: '64px 1fr',
                  gap: '1.5rem',
                  alignItems: 'start',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.05)',
                }}
                className="product-card"
              >
                <div style={{ textAlign: 'center' }}>
                  <div
                    style={{
                      background: navy,
                      color: goldLight,
                      fontWeight: 800,
                      fontSize: '0.78rem',
                      letterSpacing: '.06em',
                      padding: '4px 0',
                      borderRadius: 6,
                      marginBottom: '0.5rem',
                    }}
                  >
                    {product.num}
                  </div>
                  <div style={{ fontSize: '2rem' }}>{product.icon}</div>
                </div>

                <div>
                  <h3 style={{ color: navy, fontSize: '1.3rem', margin: '0 0 0.2rem', fontWeight: 700 }}>
                    {product.title}
                  </h3>
                  <p style={{ color: '#667085', fontSize: '0.9rem', margin: '0 0 1rem', fontStyle: 'italic' }}>
                    {product.subtitle}
                  </p>

                  {product.body.split('\n\n').map((para, i) => (
                    <p key={i} style={{ color: '#374151', lineHeight: 1.8, margin: '0 0 0.85rem' }}>
                      {para}
                    </p>
                  ))}

                  <div
                    style={{
                      background: 'rgba(14,26,43,0.06)',
                      borderLeft: `3px solid ${navy}`,
                      padding: '0.85rem 1rem',
                      borderRadius: '0 8px 8px 0',
                      marginTop: '0.25rem',
                    }}
                  >
                    <span
                      style={{
                        display: 'block',
                        fontWeight: 700,
                        color: navy,
                        fontSize: '0.8rem',
                        letterSpacing: '.06em',
                        textTransform: 'uppercase',
                        marginBottom: '0.4rem',
                      }}
                    >
                      Why it matters locally
                    </span>
                    <p style={{ color: '#374151', lineHeight: 1.75, margin: 0, fontSize: '0.97rem' }}>
                      {product.local}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Term vs. Whole Life Comparison Chart ── */}
      <section style={{ padding: '4rem 0', background: '#f9fafb' }}>
        <div style={{ maxWidth: 1060, margin: '0 auto', padding: '0 24px' }}>
          <h2
            style={{
              fontSize: 'clamp(1.5rem, 2.5vw, 2rem)',
              color: navy,
              textAlign: 'center',
              margin: '0 0 0.5rem',
            }}
          >
            Term Life vs. Whole Life — Which Fits Your Family?
          </h2>
          <p style={{ textAlign: 'center', color: '#667085', marginBottom: '2.5rem', fontSize: '1rem' }}>
            Understanding the difference is the first step to building the right plan.
          </p>

          {/* Comparison table */}
          <div style={{ overflowX: 'auto', borderRadius: 16, boxShadow: '0 4px 20px rgba(14,26,43,0.08)', border: '1px solid #e5e7eb' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.97rem' }}>
              <thead>
                <tr style={{ background: navy }}>
                  {['Policy Type', 'How It Works', 'Best Fit'].map(h => (
                    <th
                      key={h}
                      style={{
                        padding: '1rem 1.25rem',
                        textAlign: 'left',
                        color: goldLight,
                        fontWeight: 700,
                        fontSize: '0.88rem',
                        letterSpacing: '.06em',
                        textTransform: 'uppercase',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr style={{ background: '#e8f4fd', borderBottom: '1px solid #bee3f8' }}>
                  <td style={{ padding: '1.25rem', fontWeight: 700, color: navy, verticalAlign: 'top', whiteSpace: 'nowrap' }}>
                    🛡️ Term Life
                  </td>
                  <td style={{ padding: '1.25rem', color: '#374151', lineHeight: 1.75, verticalAlign: 'top' }}>
                    Provides coverage for a defined period — commonly 10, 20, or 30 years. Premiums are generally lower, and the death benefit is paid if the insured passes away during the term.
                  </td>
                  <td style={{ padding: '1.25rem', color: '#374151', lineHeight: 1.75, verticalAlign: 'top' }}>
                    Families seeking the largest amount of coverage during the years they are most financially vulnerable — mortgage years, child-raising years, income-replacement years.
                  </td>
                </tr>
                <tr style={{ background: '#fff' }}>
                  <td style={{ padding: '1.25rem', fontWeight: 700, color: navy, verticalAlign: 'top', whiteSpace: 'nowrap' }}>
                    🏛️ Whole Life
                  </td>
                  <td style={{ padding: '1.25rem', color: '#374151', lineHeight: 1.75, verticalAlign: 'top' }}>
                    Provides lifelong coverage as long as required premiums are paid. It can also build cash value over time.
                  </td>
                  <td style={{ padding: '1.25rem', color: '#374151', lineHeight: 1.75, verticalAlign: 'top' }}>
                    Families seeking permanent protection, final expense planning, estate planning, or a policy designed to last beyond working years.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Local examples */}
          <div
            style={{
              marginTop: '2.5rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '1.25rem',
            }}
            className="examples-grid"
          >
            {[
              {
                icon: '👨‍👩‍👧‍👦',
                label: 'Young couple in Tamaqua',
                desc: 'With two children and a new mortgage, they may need the largest amount of coverage for the lowest practical cost — a 20- or 30-year term policy may be the right fit.',
              },
              {
                icon: '💼',
                label: 'Small business owner in Pottsville',
                desc: 'May need a more permanent strategy to protect the family, support succession planning, or create a policy that stays in place for life.',
              },
              {
                icon: '🕊️',
                label: 'Retired widow in Frackville or Minersville',
                desc: 'May not need a large income-replacement policy, but a smaller final expense policy may help ensure children are not left paying costs out of pocket.',
              },
            ].map(ex => (
              <div
                key={ex.label}
                style={{
                  background: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: 14,
                  padding: '1.5rem',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                }}
              >
                <div style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>{ex.icon}</div>
                <div style={{ fontWeight: 700, color: navy, fontSize: '0.95rem', marginBottom: '0.5rem' }}>{ex.label}</div>
                <p style={{ color: '#475467', fontSize: '0.92rem', lineHeight: 1.7, margin: 0 }}>{ex.desc}</p>
              </div>
            ))}
          </div>

          {/* 10x income rule callout */}
          <div
            style={{
              marginTop: '2rem',
              background: `linear-gradient(135deg, ${navy} 0%, #1a2942 100%)`,
              borderRadius: 16,
              padding: '1.75rem 2rem',
              color: '#fff',
              display: 'flex',
              gap: '1rem',
              alignItems: 'flex-start',
            }}
          >
            <div style={{ fontSize: '2rem', flexShrink: 0 }}>💡</div>
            <div>
              <div style={{ fontWeight: 700, color: goldLight, marginBottom: '0.4rem', fontSize: '1rem' }}>
                How much life insurance should you consider?
              </div>
              <p style={{ margin: 0, color: 'rgba(255,255,255,0.88)', lineHeight: 1.75, fontSize: '0.97rem' }}>
                There is no one-size-fits-all answer. The right policy depends on your age, health, income,
                dependents, goals, budget, and existing coverage. A common starting point is the{' '}
                <strong style={{ color: goldLight }}>10x income rule</strong> — multiply your annual salary
                by 10 to estimate a starting coverage amount. Then we refine from there.
              </p>
            </div>
          </div>
        </div>

        <style>{`
          @media (max-width: 700px) {
            .examples-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </section>

      {/* ── "Which is right for you?" bridge ── */}
      <section
        style={{
          padding: '4rem 0',
          background: `linear-gradient(135deg, ${navy} 0%, #1a2942 100%)`,
          color: '#fff',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: 760, margin: '0 auto', padding: '0 24px' }}>
          <h2 style={{ fontSize: 'clamp(1.6rem, 2.8vw, 2.2rem)', margin: '0 0 1rem' }}>
            Which Option is Right for Your Family?
          </h2>
          <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.85)', lineHeight: 1.75, marginBottom: '1.5rem' }}>
            Financial security isn&apos;t one-size-fits-all. A young family buying a home in Orwigsburg
            needs a very different plan than a grandparent in Mahanoy City looking to protect their legacy.
          </p>
          <p style={{ fontSize: '1.05rem', color: goldLight, fontWeight: 600, margin: 0 }}>
            As your local financial professional, I&apos;m dedicated to helping Schuylkill County
            families find the exact coverage they need — to fit their budget and their goals.
          </p>
        </div>
      </section>

      {/* ── Lead Capture Form ── */}
      <section id="get-started" style={{ padding: '5rem 0', background: '#f9fafb' }}>
        <div style={{ maxWidth: 640, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <div
              style={{
                display: 'inline-block',
                background: `rgba(201,162,95,0.15)`,
                border: `1px solid rgba(201,162,95,0.4)`,
                color: gold,
                fontSize: '0.78rem',
                fontWeight: 700,
                letterSpacing: '.1em',
                textTransform: 'uppercase',
                padding: '6px 16px',
                borderRadius: 999,
                marginBottom: '1rem',
              }}
            >
              Free · No Obligation
            </div>
            <h2 style={{ fontSize: 'clamp(1.6rem, 2.5vw, 2rem)', color: navy, margin: '0 0 0.75rem' }}>
              Let&apos;s Build Your Plan
            </h2>
            <p style={{ color: '#475467', fontSize: '1.05rem', lineHeight: 1.7, margin: 0 }}>
              Tell me a little about yourself and I&apos;ll reach out to schedule your
              complimentary consultation — no pressure, just clarity.
            </p>
          </div>

          <div
            style={{
              background: '#fff',
              borderRadius: 20,
              padding: '2.5rem',
              boxShadow: '0 8px 32px rgba(14,26,43,0.1)',
              border: '1px solid #e5e7eb',
            }}
          >
            <SchuylkillLeadForm />
          </div>

          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <p style={{ color: '#667085', fontSize: '0.95rem', margin: '0 0 0.5rem' }}>
              Prefer to talk right now?
            </p>
            <a
              href={`tel:+1${BRAND.phoneRaw}`}
              style={{ color: gold, fontWeight: 700, fontSize: '1.1rem', textDecoration: 'none' }}
              data-county="Schuylkill"
            >
              ☎️ {BRAND.phone}
            </a>
          </div>
        </div>
      </section>

      {/* ── Service Area ── */}
      <section style={{ padding: '3.5rem 0', background: '#fff', borderTop: '1px solid #e5e7eb' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
          <h3 style={{ color: navy, fontSize: '1.25rem', margin: '0 0 0.75rem' }}>
            Proudly Serving Schuylkill County
          </h3>
          <p style={{ color: '#667085', margin: '0 0 1.5rem', fontSize: '1rem' }}>
            Pottsville · Tamaqua · Schuylkill Haven · Orwigsburg · Mahanoy City · Minersville · Shenandoah · Saint Clair
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
            {['PA Licensed DOI #1268820', 'NIPR #21638507', 'MBA · Independent Broker'].map(badge => (
              <span
                key={badge}
                style={{
                  background: '#f3f4f6',
                  padding: '8px 16px',
                  borderRadius: 20,
                  fontSize: '0.85rem',
                  color: '#374151',
                  fontWeight: 600,
                  border: '1px solid #e5e7eb',
                }}
              >
                {badge}
              </span>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />

      <style>{`
        @media (max-width: 680px) {
          .product-card {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  )
}
