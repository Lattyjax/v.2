// ── Simple leads table (public.leads) ────────────────────────────────────────
// Created by supabase-leads-table.sql — flat record for PAHS/QR form leads.
export interface SimpleLead {
  id: string;
  created_at?: string;
  full_name: string;
  phone: string;
  email?: string;
  promo_code?: string;
  product_interest?: string;
  lead_source?: string;
  page_source?: string;
  status?: string;
  county?: string;
  notes?: string;
}

// ── Prisma-managed Contact model ──────────────────────────────────────────────
// Table name in Postgres: "Contact" (Prisma camelCase field names as columns)
export interface Contact {
  id: string;
  createdAt?: string;
  updatedAt?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  phone?: string;
  county?: string;
  primarySource?: string;
  primarySourceType?: string;
  primaryIntent?: string;
  currentIntent?: string;
  status?: string;
  leadScore?: number;
  lastActivityAt?: string;
  nextFollowUpAt?: string;
  notesSummary?: string;
}

// ── Prisma-managed Inquiry model ──────────────────────────────────────────────
// Table name in Postgres: "Inquiry"
export interface Inquiry {
  id: string;
  createdAt?: string;
  updatedAt?: string;
  contactId: string;
  leadSessionId?: string;
  stage?: string;
  productInterest?: string;
  source?: string;
  sourceType?: string;
  intent?: string;
  status?: string;
  county?: string;
  notes?: string;
  leadScore?: number;
}

export interface QueryResult<T> {
  data: T[];
  count: number;
  has_more: boolean;
  next_offset?: number;
}

export interface MutationResult {
  success: boolean;
  id?: string;
  message: string;
}

// ── Enum constants matching the Prisma schema ─────────────────────────────────

export const COUNTIES = ["Schuylkill", "Luzerne", "Northumberland"] as const;
export type County = typeof COUNTIES[number];

// Values from the LeadStatus enum in schema.prisma
export const LEAD_STATUSES = [
  "NEW",
  "ATTEMPTED_CONTACT",
  "CONTACTED",
  "QUALIFIED",
  "BOOKED",
  "IN_CONSULT",
  "REFERRED_TO_ETHOS",
  "ETHOS_APPLIED",
  "ETHOS_APPROVED",
  "JOIN_EXPLORING",
  "JOIN_ONBOARDING",
  "JOIN_ACTIVE",
  "CLOSED_WON",
  "CLOSED_LOST",
  "NURTURE",
  "ON_HOLD",
  "DORMANT"
] as const;
export type LeadStatus = typeof LEAD_STATUSES[number];

// Values from the PipelineStage enum in schema.prisma
export const PIPELINE_STAGES = [
  "New",
  "Attempted_Contact",
  "Qualified",
  "Booked",
  "Sold",
  "Follow_Up",
  "Lost"
] as const;
export type PipelineStage = typeof PIPELINE_STAGES[number];

// Values from the ProductInterest enum in schema.prisma
export const PRODUCT_INTERESTS = [
  "Mortgage_Protection",
  "Final_Expense",
  "Term_Life",
  "Whole_Life",
  "Child_Whole_Life",
  "Accident",
  "Critical_Illness",
  "IUL",
  "Annuity",
  "Retirement",
  "Business",
  "General"
] as const;
export type ProductInterest = typeof PRODUCT_INTERESTS[number];

// Simple leads table status values (text column, not an enum)
export const SIMPLE_LEAD_STATUSES = [
  "New", "Contacted", "Qualified", "Quoted", "Applied", "Issued",
  "Closed - Lost", "Do Not Contact"
] as const;

export const CHARACTER_LIMIT = 8000;
