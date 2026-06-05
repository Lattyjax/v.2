import type { LeadSource, PipelineStage, ProductInterest } from '@prisma/client'

export function mapLeadSource(source: LeadSource): string | null {
  const m: Partial<Record<LeadSource, string>> = {
    WEBSITE_DIRECT: '🌐 Website Form',
    GOOGLE_ADS: '🎯 Google Ad',
    QR_CAMPAIGN: '🌐 Website Form',
    EMAIL_CAMPAIGN: '📧 Email Campaign',
    EMAIL_INBOUND: '📧 Email Campaign',
    REFERRAL: '🤝 Referral',
    PARTNER_ORG: '🤝 Referral',
    PHONE_INBOUND: '📞 Cold Outreach',
    EVENT: '👥 Community Event',
    WORKSHOP: '🏢 Networking Event',
    FILLOUT: '🌐 Website Form',
  }
  return m[source] ?? null
}

export function mapPipelineStage(stage: PipelineStage): string {
  const m: Record<PipelineStage, string> = {
    New: 'Lead',
    Attempted_Contact: 'Lead',
    Qualified: 'Negotiating',
    Booked: 'Negotiating',
    Sold: 'Active',
    Follow_Up: 'Active',
    Lost: 'Lost',
  }
  return m[stage]
}

export function mapProductInterest(interest: ProductInterest): string | null {
  const m: Partial<Record<ProductInterest, string>> = {
    Mortgage_Protection: 'Mortgage Protection',
    Final_Expense: 'Final Expense',
    Term_Life: 'Income Replacement',
    Whole_Life: 'Income Replacement',
    Child_Whole_Life: 'College Funding',
    IUL: 'Tax-Advantaged Wealth Building',
    Annuity: 'Retirement Income',
    Retirement: 'Retirement Income',
    Business: 'Business Succession',
  }
  return m[interest] ?? null
}
