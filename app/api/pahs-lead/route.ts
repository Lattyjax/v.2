import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { upsertLead } from '@/lib/hub/upsert-lead';
import { rateLimit } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type LeadBody = {
  name?: string;
  phone?: string;
  email?: string;
  promo?: string;
  interest?: string;
  source?: string;
  page?: string;
};

function clean(value: unknown, max = 500) {
  return String(value || '').trim().slice(0, max);
}

function splitName(full: string): { firstName: string | null; lastName: string | null } {
  const parts = full.trim().split(/\s+/);
  if (parts.length === 1) return { firstName: parts[0] || null, lastName: null };
  return { firstName: parts[0], lastName: parts.slice(1).join(' ') };
}

async function saveToCRM(lead: Required<LeadBody>) {
  const { firstName, lastName } = splitName(lead.name);
  const { contact, inquiry } = await upsertLead({
    firstName,
    lastName,
    email: lead.email || null,
    phone: lead.phone,
    productInterest: lead.interest,
    source: lead.source,
    landingPage: lead.page,
    notes: lead.promo ? `Promo/Coupon: ${lead.promo}` : 'PAHS sponsorship landing page consultation request.',
    metadata: { form: 'pahs-lead', promo: lead.promo || null },
  });
  return { contact: contact.id, inquiry: inquiry.id };
}

async function saveToSupabase(lead: Required<LeadBody>) {
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return { skipped: true, reason: 'Supabase env vars not configured.' };

  const table = process.env.PAHS_LEADS_TABLE || 'pahs_leads';
  const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });
  const { error } = await supabase.from(table).insert({
    full_name: lead.name,
    phone: lead.phone,
    email: lead.email || null,
    promo_code: lead.promo || null,
    product_interest: lead.interest,
    lead_source: lead.source,
    page_source: lead.page,
    status: 'New',
    county: null,
    notes: 'PAHS sponsorship landing page consultation request.',
  });

  if (error) throw new Error(`Supabase insert failed: ${error.message}`);
  return { skipped: false };
}

async function sendNotification(lead: Required<LeadBody>) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { skipped: true, reason: 'RESEND_API_KEY not configured.' };

  const resend = new Resend(apiKey);
  const to = process.env.LEAD_NOTIFY_TO || process.env.NOTIFY_TO || 'Jackson1989@latimorelegacy.com';
  const from = process.env.LEAD_NOTIFY_FROM || process.env.THANKYOU_FROM || 'Latimore Life & Legacy <leads@latimorelifelegacy.com>';

  const text = `New PAHS consultation request\n\nName: ${lead.name}\nPhone: ${lead.phone}\nEmail: ${lead.email || 'Not provided'}\nPromo/Coupon: ${lead.promo || 'None'}\nInterest: ${lead.interest}\nSource: ${lead.source}\nPage: ${lead.page}`;

  const { error } = await resend.emails.send({
    from,
    to,
    subject: `New PAHS Consultation Request: ${lead.name}`,
    text,
  });

  if (error) throw new Error(`Resend notification failed: ${error.message}`);
  return { skipped: false };
}

export async function POST(req: NextRequest) {
  const limited = await rateLimit(req, 'lead')
  if (limited) return limited

  try {
    const body = (await req.json()) as LeadBody;
    const lead: Required<LeadBody> = {
      name: clean(body.name, 150),
      phone: clean(body.phone, 50),
      email: clean(body.email, 150),
      promo: clean(body.promo, 100),
      interest: clean(body.interest, 150),
      source: clean(body.source || 'PAHS Sponsorship Page', 100),
      page: clean(body.page || 'pahs.latimorelifelegacy.com', 200),
    };

    if (!lead.name || !lead.phone || !lead.interest) {
      return NextResponse.json({ ok: false, error: 'Name, phone, and interest are required.' }, { status: 400 });
    }

    const target = process.env.PAHS_LEAD_TARGET ?? 'crm';

    let saveResult: Record<string, unknown>;
    if (target === 'crm') {
      saveResult = await saveToCRM(lead);
    } else {
      saveResult = await saveToSupabase(lead);
    }

    const emailResult = await sendNotification(lead);

    return NextResponse.json({ ok: true, target, save: saveResult, email: emailResult });
  } catch (error) {
    logger.error({ err: error instanceof Error ? error.message : String(error) }, '[pahs-lead] submission error');
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Lead submission failed.' },
      { status: 500 }
    );
  }
}
