import type { ReactNode } from 'react'
import { BRAND } from '@/lib/brand'
import {
  TrendingUp,
  Lock,
  GraduationCap,
  CreditCard,
  Shield,
  Building2,
  LineChart,
  Home,
  Users,
  Wallet,
  

  Baby,
  Target,
  Briefcase,
  Landmark,
  HeartPulse,
  Wrench,
  Check,
} from 'lucide-react'
import { SiteHeader, SiteFooter, DEFAULT_NAV_LINKS } from '@/app/_components/site-shell'

interface Service {
  number: string
  icon: ReactNode
  title: string
  who: string
  summary: string
  points: string[]
}

interface ClientSegment {
  icon: ReactNode
  title: string
  description: string
}

const NAVY = '#0E1A2B'
const GOLD = '#C9A24D'
const GOLD_LIGHT = '#E5C882'


const services: Service[] = [
  {
    number: '01',
    icon: <TrendingUp size={28} aria-hidden="true" />,
    title: 'Tax-Advantaged Wealth Accumulation',
    who: 'Working professionals, self-employed individuals, high earners',
    summary:
      'Build wealth using vehicles that grow tax-deferred or tax-free — reducing what you pay the IRS over your lifetime.',
    points: [
      'Indexed and fixed strategies that grow without market risk',
      'Tax-deferred accumulation inside annuities and permanent life policies',
      'Tax-free distributions via policy loans for retirement income',
      'Reduces your taxable estate over time',
      'Complements — not replaces — your existing 401(k) or IRA',
    ],
  },
  {
    number: '02',
    icon: <Lock size={28} aria-hidden="true" />,
    title: 'Asset Protection & Plan Rollovers',
    who: 'Job changers, retirees, anyone with a 401(k), 403(b), or pension',
    summary:
      'When you leave a job or retire, your retirement funds need a safe destination. A strategic rollover protects your principal.',
    points: [
      'Tax-free, penalty-free 401(k) and 403(b) rollover guidance',
      'Pension lump-sum vs. annuity analysis',
      'Principal protection from market volatility',
      'Guaranteed growth options through fixed vehicles',
      'Retain control of your funds without employer restrictions',
    ],
  },
  {
    number: '03',
    icon: <GraduationCap size={28} aria-hidden="true" />,
    title: 'College Education Funding',
    who: "Parents and grandparents planning ahead for a child's education",
    summary:
      'Fund higher education without putting your retirement at risk — using strategies that grow tax-free.',
    points: [
      'Cash-value life insurance as a flexible education savings vehicle',
      'No restrictions on how funds are used — not just tuition',
      'Tax-free access via policy loans when needed',
      'May not count against financial aid eligibility',
      'Funds remain available if the child does not attend college',
    ],
  },
  {
    number: '04',
    icon: <CreditCard size={28} aria-hidden="true" />,
    title: 'Debt Management',
    who: 'Families carrying high-interest debt limiting their financial progress',
    summary:
      'High-interest debt is one of the biggest barriers to building wealth. Strategic planning frees up cash flow.',
    points: [
      'Identify which debts to prioritize and in what order',
      'Use policy cash value to consolidate or eliminate debt',
      'Free up monthly cash flow for savings and protection',
      'Build a foundation that does not collapse under unexpected expenses',
      'Coordination with life insurance and living benefit strategies',
    ],
  },
  {
    number: '05',
    icon: <Shield size={28} aria-hidden="true" />,
    title: 'Life Insurance & Living Benefits',
    who: 'Individuals and families at any stage of life',
    summary:
      'Life insurance is the foundation of financial protection. Modern policies include living benefit riders.',
    points: [
      'Term, whole life, and indexed universal life options',
      'Critical illness, chronic illness, and terminal illness riders',
      'Income replacement for your family if you pass away',
      'Final expense coverage to prevent burial costs falling on loved ones',
      'Disability waiver of premium to keep coverage in force',
    ],
  },
  {
    number: '06',
    icon: <Building2 size={28} aria-hidden="true" />,
    title: 'Estate & Legacy Planning',
    who: 'Business owners, property owners, families wanting to transfer wealth',
    summary:
      'A proper estate strategy ensures your assets go to who you intend without being eroded by taxes or probate.',
    points: [
      'Life insurance as a tax-free wealth transfer vehicle',
      'Beneficiary designation review and optimization',
      'Strategies to minimize estate tax exposure',
      'Funding for buy-sell agreements between business partners',
      'Coordination with your attorney for wills and trusts',
    ],
  },
  {
    number: '07',
    icon: <LineChart size={28} aria-hidden="true" />,
    title: 'Indexed Growth Strategies',
    who: 'Savers and pre-retirees who want market-linked growth without market risk',
    summary:
      'Indexed products track market performance while protecting your principal with a floor.',
    points: [
      'Cash value linked to indexes like the S&P 500',
      'Zero-loss floor — market drops cannot reduce your balance',
      'Participation rates and cap rates determine your share of gains',
      'Available inside both indexed universal life and fixed indexed annuities',
      'Tax-deferred growth throughout the accumulation phase',
    ],
  },
  {
    number: '08',
    icon: <Home size={28} aria-hidden="true" />,
    title: 'Mortgage Protection',
    who: 'Homeowners with a mortgage and dependents relying on their income',
    summary:
      'If you pass away unexpectedly, your family should not lose the home. Mortgage protection ensures they stay.',
    points: [
      'Coverage designed to match your mortgage balance',
      'Pays directly to your beneficiary — not the lender',
      'Many policies include return-of-premium options',
      'Living benefit riders available on many policies',
      'Affordable coverage often available without a full medical exam',
    ],
  },
  {
    number: '09',
    icon: <Users size={28} aria-hidden="true" />,
    title: 'Business & Key-Person Insurance',
    who: 'Small business owners, partnerships, organizations dependent on key staff',
    summary:
      'The sudden loss of a key employee can devastate a business. Key-person insurance provides capital to survive.',
    points: [
      'Policy owned by the business on a critical employee',
      'Tax-free death benefit received directly by the business',
      'Funds buy-sell agreements between partners',
      'Covers revenue loss, loan obligations, and recruitment costs',
      'Can be used to attract and retain key talent as a benefit',
    ],
  },
  {
    number: '10',
    icon: <Wallet size={28} aria-hidden="true" />,
    title: 'Retirement Income Strategies',
    who: 'Pre-retirees and retirees wanting guaranteed income they cannot outlive',
    summary:
      'Running out of money in retirement is one of the greatest financial risks. Guaranteed income removes that fear.',
    points: [
      'Fixed and fixed-indexed annuities for principal-protected accumulation',
      'Guaranteed lifetime income riders — payments you cannot outlive',
      'Structured to complement Social Security and other income',
      'Eliminate sequence-of-returns risk in your portfolio',
      'Joint life options to protect a surviving spouse',
    ],
  },
]

const clientSegments: ClientSegment[] = [
  {
    icon: <Baby size={32} aria-hidden="true" />,
    title: 'Young Families',
    description:
      'Income replacement, mortgage protection, and starting a savings strategy before costs rise with age.',
  },
  {
    icon: <Target size={32} aria-hidden="true" />,
    title: 'Pre-Retirees',
    description:
      '401(k) rollovers, safe-money accumulation, and guaranteed lifetime income planning.',
  },
  {
    icon: <Briefcase size={32} aria-hidden="true" />,
    title: 'Business Owners',
    description:
      'Key-person coverage, buy-sell funding, and executive benefit strategies.',
  },
  {
    icon: <Landmark size={32} aria-hidden="true" />,
    title: 'Local Organizations',
    description:
      'Key-person insurance for school districts, nonprofits, and municipal employers.',
  },
  {
    icon: <HeartPulse size={32} aria-hidden="true" />,
    title: 'Healthcare Workers',
    description:
      'Disability protection, living benefits, and retirement income for shift workers.',
  },
  {
    icon: <Wrench size={32} aria-hidden="true" />,
    title: 'Trade Workers',
    description:
      'Affordable term coverage, final expense planning, and mortgage protection for skilled trades.',
  },
]

function CtaButtons({
  centered = false,
  large = false,
}: {
  centered?: boolean
  large?: boolean
}) {
  const paddingClass = large ? 'px-8 py-3' : 'px-4 py-2'
  const textClass = large ? 'text-base' : 'text-sm'

  return (
    <div className={`flex flex-wrap gap-4 ${centered ? 'justify-center' : ''}`}>
      <a
        href={BRAND.bookingUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`rounded-md font-bold no-underline transition-all hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#C9A24D] focus-visible:ring-offset-[#0E1A2B] bg-[#C9A24D] text-[#0E1A2B] ${paddingClass} ${textClass}`}
      >
        Book Free Consultation
      </a>
      <a
        href={BRAND.ethosUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`rounded-md font-bold no-underline transition-all hover:bg-[#C9A24D]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#C9A24D] focus-visible:ring-offset-[#0E1A2B] bg-transparent text-white border-2 border-[#C9A24D] ${paddingClass} ${textClass}`}
      >
        Get Instant Quote
      </a>
    </div>
  )
}





function ServiceCard({ service }: { service: Service }) {
  return (
    <article className="bg-white rounded-xl shadow-md border border-black/5 overflow-hidden">
      <div className="p-6" style={{ background: NAVY }}>
        <div className="flex items-center gap-4 mb-3">
          <span className="font-extrabold text-lg" style={{ color: GOLD }}>
            {service.number}
          </span>
          <span className="text-2xl text-white" aria-hidden="true">
            {service.icon}
          </span>
        </div>

        <h3 className="text-white text-xl font-semibold mb-1">{service.title}</h3>
        <p className="text-sm" style={{ color: GOLD_LIGHT }}>
          Best for: {service.who}
        </p>
      </div>

      <div className="p-6">
        <p className="text-gray-700 leading-relaxed mb-4 text-sm">{service.summary}</p>

        <ul className="space-y-2">
          {service.points.map((point) => (
            <li key={point} className="flex gap-3 text-gray-700 text-sm">
              <Check
                size={16}
                className="flex-shrink-0 mt-0.5"
                style={{ color: GOLD }}
                aria-hidden="true"
              />
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </div>
    </article>
  )
}

function ClientSegmentCard({ segment }: { segment: ClientSegment }) {
  return (
    <article
      className="rounded-xl p-6 border border-white/10 hover:border-[#C9A24D]/50 transition-all"
      style={{ background: 'rgba(255,255,255,0.05)' }}
    >
      <div className="mb-4" style={{ color: GOLD }} aria-hidden="true">
        {segment.icon}
      </div>
      <h3 className="text-white font-semibold text-lg mb-2">{segment.title}</h3>
      <p className="text-white/65 text-sm leading-relaxed">{segment.description}</p>
    </article>
  )
}

export default function ServicesPage() {
  return (
    <>
      <SiteHeader currentPath="/services" navLinks={DEFAULT_NAV_LINKS} />

      <main className="font-sans">
        <section
          className="text-center text-white py-16"
          style={{ background: `linear-gradient(135deg, ${NAVY} 0%, #1a2942 100%)` }}
        >
          <div className="max-w-3xl mx-auto px-5">
            <p
              className="text-sm font-semibold tracking-widest uppercase mb-4"
              style={{ color: GOLD_LIGHT }}
            >
              What We Do
            </p>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-5 leading-tight">
              10 Strategies to
              <br />
              <span style={{ color: GOLD_LIGHT }}>Build, Protect &amp; Transfer Wealth</span>
            </h1>

            <p className="text-white/85 text-lg leading-relaxed mb-8">
              As an independent consultant, every strategy is customized to your income,
              family situation, and goals — not a product quota.
            </p>

            <CtaButtons centered large />
          </div>
        </section>

        <section className="py-16 bg-gray-100" aria-labelledby="services-heading">
          <div className="max-w-6xl mx-auto px-5">
            <div className="text-center mb-10">
              <h2 id="services-heading" className="text-3xl md:text-4xl font-bold text-gray-900">
                Services
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {services.map((service) => (
                <ServiceCard key={service.number} service={service} />
              ))}
            </div>
          </div>
        </section>

        <section
          className="py-16"
          style={{ background: NAVY }}
          aria-labelledby="who-we-serve-heading"
        >
          <div className="max-w-6xl mx-auto px-5">
            <div className="text-center mb-12">
              <p
                className="text-sm font-semibold tracking-widest uppercase mb-3"
                style={{ color: GOLD_LIGHT }}
              >
                Who We Serve
              </p>

              <h2
                id="who-we-serve-heading"
                className="text-3xl md:text-4xl font-bold text-white mb-4"
              >
                Built for the Communities
                <br />
                <span style={{ color: GOLD_LIGHT }}>
                  That Built Central Pennsylvania
                </span>
              </h2>

              <p className="text-white/75 text-lg max-w-2xl mx-auto">
                Every strategy is shaped around where you are in life — your income, your
                family, and what you&apos;re trying to protect.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {clientSegments.map((segment) => (
                <ClientSegmentCard key={segment.title} segment={segment} />
              ))}
            </div>
          </div>
        </section>

        <section
          className="py-16 text-center text-white"
          style={{ background: `linear-gradient(135deg, #1a2942 0%, ${NAVY} 100%)` }}
        >
          <div className="max-w-2xl mx-auto px-5">
            <p
              className="text-sm font-semibold tracking-widest uppercase mb-3"
              style={{ color: GOLD_LIGHT }}
            >
              Ready to Start?
            </p>

            <h2 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
              Let&apos;s Build a Strategy
              <br />
              <span style={{ color: GOLD_LIGHT }}>Around Your Life</span>
            </h2>

            <p className="text-white/75 text-lg mb-8 leading-relaxed">
              No pressure. No product quotas. Just an honest conversation about where you
              are and where you want to go.
            </p>

            <CtaButtons centered large />
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  )
}