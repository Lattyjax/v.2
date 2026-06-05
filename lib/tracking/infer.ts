import { LeadSource } from '@prisma/client'

export function inferLeadSource(input: {
  utmSource?: string | null
  utmMedium?: string | null
  referrer?: string | null
  landingPage?: string | null
}): LeadSource {
  const utmSource = (input.utmSource ?? '').toLowerCase()
  const utmMedium = (input.utmMedium ?? '').toLowerCase()
  const referrer = (input.referrer ?? '').toLowerCase()
  const landing = (input.landingPage ?? '').toLowerCase()

  if (landing.includes('/pahs')) return LeadSource.QR_CAMPAIGN

  if (utmSource.includes('google') && (utmMedium.includes('cpc') || utmMedium.includes('ppc'))) return LeadSource.GOOGLE_ADS
  if (utmSource.includes('google')) return LeadSource.GOOGLE_ORGANIC
  if (referrer.includes('google.')) return LeadSource.GOOGLE_ORGANIC

  if (
    utmSource.includes('facebook') ||
    utmSource.includes('instagram') ||
    referrer.includes('facebook.com') ||
    referrer.includes('instagram.com')
  ) {
    return LeadSource.SOCIAL_ORGANIC
  }

  if (utmSource.includes('email') || utmMedium.includes('email')) return LeadSource.EMAIL_CAMPAIGN
  if (utmSource.includes('referral')) return LeadSource.REFERRAL
  if (utmSource.includes('fillout')) return LeadSource.FILLOUT

  return LeadSource.WEBSITE_DIRECT
}