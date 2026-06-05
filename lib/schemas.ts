import { z } from 'zod'

const stageEnum = z.enum(['New', 'Attempted_Contact', 'Qualified', 'Booked', 'Sold', 'Follow_Up', 'Lost'])
const productEnum = z.enum([
  'Mortgage_Protection',
  'Final_Expense',
  'Term_Life',
  'Whole_Life',
  'Child_Whole_Life',
  'Accident',
  'Critical_Illness',
  'IUL',
  'Annuity',
  'Retirement',
  'Business',
  'General',
])
const eventEnum = z.enum([
  'page_view',
  'cta_click',
  'call_click',
  'text_click',
  'email_click',
  'book_click',
  'form_submit',
  'lead_created',
  'appointment_booked',
  'stage_changed',
  'county_selected',
  'product_selected',
  'lead_magnet_download',
  'post_viewed',
  'post_created',
  'post_published',
  'reaction_added',
])

export const FilloutSchema = z.object({
  email: z.string().email('Invalid email').optional().nullable(),
  first_name: z.string().max(100).optional().nullable(),
  firstName: z.string().max(100).optional().nullable(),
  last_name: z.string().max(100).optional().nullable(),
  lastName: z.string().max(100).optional().nullable(),
  phone: z.string().max(40).optional().nullable(),
  county: z.string().max(100).optional().nullable(),
  product_interest: z.string().max(100).optional().nullable(),
  productInterest: z.string().max(100).optional().nullable(),
  interest_type: z.string().max(100).optional().nullable(),
  interestType: z.string().max(100).optional().nullable(),
  lead_session_id: z.string().max(191).optional().nullable(),
  page_url: z.string().max(500).optional().nullable(),
  landing_page: z.string().max(500).optional().nullable(),
  utm_source: z.string().max(100).optional().nullable(),
  utm_medium: z.string().max(100).optional().nullable(),
  utm_campaign: z.string().max(150).optional().nullable(),
  utm_term: z.string().max(100).optional().nullable(),
  utm_content: z.string().max(100).optional().nullable(),
  referrer: z.string().max(500).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
}).passthrough()

export const EventIngestSchema = z.object({
  eventType: z.string().min(1).max(100),
  occurredAt: z.string().optional().nullable(),
  leadSessionId: z.string().max(191).optional().nullable(),
  contactId: z.string().max(191).optional().nullable(),
  inquiryId: z.string().max(191).optional().nullable(),
  pageUrl: z.string().max(500).optional().nullable(),
  referrer: z.string().max(500).optional().nullable(),
  source: z.string().max(100).optional().nullable(),
  medium: z.string().max(100).optional().nullable(),
  campaign: z.string().max(150).optional().nullable(),
  county: z.string().max(100).optional().nullable(),
  productInterest: z.string().max(100).optional().nullable(),
  metadata: z.record(z.any()).optional().nullable(),
})

export const LeadIngestSchema = z.object({
  firstName: z.string().max(100).optional().nullable(),
  lastName: z.string().max(100).optional().nullable(),
  email: z.string().email().optional().nullable(),
  phone: z.string().max(40).optional().nullable(),
  county: z.string().max(100).optional().nullable(),
  productInterest: z.string().max(100).optional().nullable(),
  leadSessionId: z.string().max(191).optional().nullable(),
  source: z.string().max(100).optional().nullable(),
  medium: z.string().max(100).optional().nullable(),
  campaign: z.string().max(150).optional().nullable(),
  term: z.string().max(100).optional().nullable(),
  content: z.string().max(100).optional().nullable(),
  referrer: z.string().max(500).optional().nullable(),
  landingPage: z.string().max(500).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
  metadata: z.record(z.any()).optional().nullable(),
}).refine((value) => !!(value.email || value.phone), {
  message: 'Lead must include at least an email or phone number',
  path: ['email'],
})

export const InquiryPatchSchema = z.object({
  stage: stageEnum,
  notes: z.string().max(2000).optional().nullable(),
  actor: z.string().max(100).optional().nullable(),
})

export const BookingNotifySchema = z.object({
  inquiryId: z.string().max(191).optional().nullable(),
  lead_session_id: z.string().min(1).max(191).optional().nullable(),
  gcal_id: z.string().max(200).optional().nullable(),
  scheduled_for: z.string().optional().nullable(),
  start_at: z.string().optional().nullable(),
  end_at: z.string().optional().nullable(),
  booking_source: z.string().max(100).optional().nullable(),
  source: z.string().max(100).optional().nullable(),
  medium: z.string().max(100).optional().nullable(),
  campaign: z.string().max(150).optional().nullable(),
  location: z.string().max(250).optional().nullable(),
}).refine((value) => !!(value.inquiryId || value.lead_session_id), {
  message: 'Booking webhook must include inquiryId or lead_session_id',
  path: ['lead_session_id'],
})

export const CardEventSchema = z.object({
  event: z.string().min(1).max(100),
  label: z.string().max(200).optional().nullable(),
  pageUrl: z.string().max(500).optional().nullable(),
  referrer: z.string().max(500).optional().nullable(),
  userAgent: z.string().max(300).optional().nullable(),
  timestamp: z.string().optional().nullable(),
  leadSessionId: z.string().max(191).optional().nullable(),
  productInterest: z.string().max(100).optional().nullable(),
  county: z.string().max(100).optional().nullable(),
  metadata: z.record(z.any()).optional().nullable(),
})

export { stageEnum as PipelineStageSchema, productEnum as ProductInterestSchema, eventEnum as EventTypeSchema }
