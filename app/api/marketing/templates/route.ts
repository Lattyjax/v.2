export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { rateLimit } from '@/lib/rate-limit'

const CreateSchema = z.object({
  title: z.string().min(1).max(200),
  category: z.string().min(1).max(100),
  platform: z.string().max(50).optional().nullable(),
  audienceTrack: z.string().max(100).optional().nullable(),
  body: z.string().min(1).max(10000),
  cta: z.string().max(300).optional().nullable(),
  hashtags: z.array(z.string().max(50)).max(30).optional(),
  suggestedDay: z.string().max(50).optional().nullable(),
  suggestedTime: z.string().max(50).optional().nullable(),
  campaign: z.string().max(100).optional().nullable(),
  complianceStatus: z.enum(['draft', 'approved', 'flagged']).default('draft'),
})

// Built-in starter templates seeded on first GET
const STARTER_TEMPLATES = [
  {
    title: 'Community Protection — Facebook Feed',
    category: 'Life Insurance',
    platform: 'facebook',
    audienceTrack: 'Young Families',
    body: 'Families connected to our community work hard to protect what matters most.\n\nToday is a good day to review your life insurance, final expense, or mortgage protection plan — before it becomes urgent.\n\nScan the QR code or DM "PROTECT" to start a simple, pressure-free review.',
    cta: 'DM "PROTECT" or scan the QR code',
    hashtags: ['#TheBeatGoesOn', '#ProtectYourFamily', '#LifeInsurance', '#LatimoreLegacy'],
    suggestedDay: 'Tuesday',
    suggestedTime: '12:00 PM',
    campaign: 'Community Awareness',
    complianceStatus: 'approved',
  },
  {
    title: 'Final Expense — SMS Follow-Up',
    category: 'Final Expense',
    platform: 'sms',
    audienceTrack: 'Pre-Retirees',
    body: 'Hi {{first_name}}, this is Jackson with Latimore Life & Legacy. A quick final expense plan can protect your family from unexpected costs. Reply PROTECT to learn more.',
    cta: 'Reply PROTECT',
    hashtags: [],
    suggestedDay: 'Wednesday',
    suggestedTime: '10:00 AM',
    campaign: 'Final Expense',
    complianceStatus: 'approved',
  },
  {
    title: 'Mortgage Protection — LinkedIn Article Hook',
    category: 'Mortgage Protection',
    platform: 'linkedin',
    audienceTrack: 'Homeowners',
    body: 'Most homeowners insure their car, their phone, and their health — but not the mortgage payment that keeps their family in their home.\n\nMortgage protection insurance is one of the most overlooked tools in financial planning. Here\'s what it covers and why it matters.',
    cta: 'Connect with me to learn more',
    hashtags: ['#MortgageProtection', '#FinancialPlanning', '#TheBeatGoesOn'],
    suggestedDay: 'Thursday',
    suggestedTime: '7:30 AM',
    campaign: 'Professional Authority',
    complianceStatus: 'approved',
  },
  {
    title: 'IUL Wealth Builder — Instagram Reel Hook',
    category: 'IUL',
    platform: 'instagram',
    audienceTrack: 'Young Professionals',
    body: '🔒 What if your life insurance could also build tax-free wealth?\n\nAn Indexed Universal Life (IUL) policy can:\n✅ Protect your family\n✅ Grow cash value tied to market indices\n✅ Provide tax-free retirement income\n\nNot for everyone — but for the right person, it\'s powerful. DM me "IUL" to see if it fits your situation.',
    cta: 'DM "IUL"',
    hashtags: ['#IUL', '#TaxFreeWealth', '#LifeInsurance', '#TheBeatGoesOn', '#FinancialFreedom'],
    suggestedDay: 'Friday',
    suggestedTime: '6:00 PM',
    campaign: 'IUL Awareness',
    complianceStatus: 'approved',
  },
  {
    title: 'Annuity Safety Net — Email Subject Lines (A/B Test)',
    category: 'Annuity',
    platform: 'email',
    audienceTrack: 'Pre-Retirees',
    body: 'Subject A: "Your retirement income — guaranteed for life?"\nSubject B: "How families near you are securing $2,000+/month in retirement"\nSubject C: "One decision that could change how you retire"\n\n---\n\nHi {{first_name}},\n\nMost people spend 30+ years saving for retirement — then spend it worrying about running out of money.\n\nA fixed indexed annuity can lock in guaranteed income for life, regardless of market conditions. No risk to principal. No market losses.\n\nI\'d love to show you what a $100K premium could generate in guaranteed monthly income starting at your target retirement age.\n\nReply to this email or call (717) 615-2613.',
    cta: 'Reply to schedule a 15-minute call',
    hashtags: [],
    suggestedDay: 'Tuesday',
    suggestedTime: '9:00 AM',
    campaign: 'Annuity Campaign',
    complianceStatus: 'draft',
  },
  {
    title: 'PAHS Community — Google Business Profile Post',
    category: 'Community',
    platform: 'gbp',
    audienceTrack: 'Local Community',
    body: 'Proud to serve families connected to PAHS and the surrounding community. Whether you\'re looking to protect your income, plan for final expenses, or secure your family\'s future — we keep it simple and pressure-free.\n\nCall (717) 615-2613 or scan the QR code to schedule a free review.',
    cta: 'Call (717) 615-2613',
    hashtags: ['#TheBeatGoesOn', '#PAHS', '#LocalInsurance'],
    suggestedDay: 'Monday',
    suggestedTime: '8:00 AM',
    campaign: 'PAHS Partnership',
    complianceStatus: 'approved',
  },
  {
    title: 'Key Person Insurance — School Administrator Email',
    category: 'Key Person',
    platform: 'email',
    audienceTrack: 'School Administrators',
    body: 'Hi {{first_name}},\n\nSchool administrators and principals carry enormous responsibility — and their sudden absence can create significant financial and operational challenges for the institution.\n\nKey person insurance is a simple, tax-deductible solution that protects school budgets against the unexpected loss of a critical leader.\n\nWould 15 minutes be worth exploring whether it fits your district\'s risk management plan?\n\n— Jackson Latimore, NIPR #21638507',
    cta: 'Reply to schedule a discovery call',
    hashtags: [],
    suggestedDay: 'Wednesday',
    suggestedTime: '7:00 AM',
    campaign: 'Key Person Education',
    complianceStatus: 'approved',
  },
]

export async function GET(req: NextRequest) {
  const limited = await rateLimit(req, 'inquiries')
  if (limited) return limited

  try {
    const count = await prisma.socialTemplate.count()
    // Seed starter templates if gallery is empty
    if (count === 0) {
      await prisma.socialTemplate.createMany({ data: STARTER_TEMPLATES.map(t => ({ ...t, hashtags: t.hashtags })) })
    }

    const { searchParams } = new URL(req.url)
    const platform = searchParams.get('platform')
    const category = searchParams.get('category')

    const templates = await prisma.socialTemplate.findMany({
      where: {
        ...(platform ? { platform } : {}),
        ...(category ? { category } : {}),
      },
      orderBy: [{ complianceStatus: 'asc' }, { createdAt: 'desc' }],
    })
    return NextResponse.json({ ok: true, templates })
  } catch {
    return NextResponse.json({ ok: false, error: 'Failed to load templates' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const limited = await rateLimit(req, 'inquiries')
  if (limited) return limited

  const body = await req.json().catch(() => null)
  const parsed = CreateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.flatten() }, { status: 422 })
  }

  try {
    const template = await prisma.socialTemplate.create({ data: { ...parsed.data, hashtags: parsed.data.hashtags ?? [] } })
    return NextResponse.json({ ok: true, template }, { status: 201 })
  } catch {
    return NextResponse.json({ ok: false, error: 'Failed to create template' }, { status: 500 })
  }
}
