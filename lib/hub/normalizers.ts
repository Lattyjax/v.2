type PipelineStage = 'New' | 'Attempted_Contact' | 'Qualified' | 'Booked' | 'Sold' | 'Follow_Up' | 'Lost'
type ProductInterest =
  | 'Mortgage_Protection'
  | 'Final_Expense'
  | 'Term_Life'
  | 'Whole_Life'
  | 'Child_Whole_Life'
  | 'Accident'
  | 'Critical_Illness'
  | 'IUL'
  | 'Annuity'
  | 'Retirement'
  | 'Business'
  | 'General'
type EventType =
  | 'page_view'
  | 'cta_click'
  | 'call_click'
  | 'text_click'
  | 'email_click'
  | 'book_click'
  | 'form_submit'
  | 'lead_created'
  | 'appointment_booked'
  | 'stage_changed'
  | 'county_selected'
  | 'product_selected'
  | 'lead_magnet_download'
  | 'post_viewed'
  | 'post_created'
  | 'post_published'
  | 'reaction_added'

const STAGE_MAP: Record<string, PipelineStage> = {
  new: 'New',
  new_inquiry: 'New',
  attempted_contact: 'Attempted_Contact',
  attemptedcontact: 'Attempted_Contact',
  qualified: 'Qualified',
  booked: 'Booked',
  sold: 'Sold',
  closed_won: 'Sold',
  won: 'Sold',
  follow_up: 'Follow_Up',
  followup: 'Follow_Up',
  closed_lost: 'Lost',
  lost: 'Lost',
}

const PRODUCT_MAP: Record<string, ProductInterest> = {
  mortgage_protection: 'Mortgage_Protection',
  mortgage: 'Mortgage_Protection',
  mortgageprotection: 'Mortgage_Protection',
  final_expense: 'Final_Expense',
  finalexpense: 'Final_Expense',
  term_life: 'Term_Life',
  termlife: 'Term_Life',
  whole_life: 'Whole_Life',
  wholelife: 'Whole_Life',
  child_whole_life: 'Child_Whole_Life',
  childwholelife: 'Child_Whole_Life',
  accident: 'Accident',
  critical_illness: 'Critical_Illness',
  criticalillness: 'Critical_Illness',
  iul: 'IUL',
  annuity: 'Annuity',
  retirement: 'Retirement',
  business: 'Business',
  velocity: 'General',
  depth: 'General',
  group: 'General',
  general: 'General',
}

const EVENT_MAP: Record<string, EventType> = {
  page_view: 'page_view',
  pageview: 'page_view',
  visit: 'page_view',
  cta_click: 'cta_click',
  click: 'cta_click',
  call_click: 'call_click',
  text_click: 'text_click',
  sms_click: 'text_click',
  email_click: 'email_click',
  book_click: 'book_click',
  form_submit: 'form_submit',
  submit: 'form_submit',
  lead_created: 'lead_created',
  appointment_booked: 'appointment_booked',
  booking_confirmed: 'appointment_booked',
  stage_changed: 'stage_changed',
  county_selected: 'county_selected',
  product_selected: 'product_selected',
  lead_magnet_download: 'lead_magnet_download',
  download: 'lead_magnet_download',
  post_viewed: 'post_viewed',
  post_created: 'post_created',
  post_published: 'post_published',
  reaction_added: 'reaction_added',
}

function normalizeKey(value?: string | null): string {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[^\w]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

export function normalizeStage(value?: string | null): PipelineStage {
  return STAGE_MAP[normalizeKey(value)] ?? 'New'
}

export function normalizeProductInterest(value?: string | null): ProductInterest {
  return PRODUCT_MAP[normalizeKey(value)] ?? 'General'
}

export function normalizeEventType(value?: string | null): EventType {
  return EVENT_MAP[normalizeKey(value)] ?? 'page_view'
}

export function cleanString(value?: string | null, max = 255): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  if (!trimmed) return null
  return trimmed.slice(0, max)
}

export function pickFirst(...values: Array<string | null | undefined>): string | null {
  for (const value of values) {
    const cleaned = cleanString(value)
    if (cleaned) return cleaned
  }
  return null
}

export type { PipelineStage, ProductInterest, EventType }
