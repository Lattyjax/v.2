export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { upsertLead } from '@/lib/hub/upsert-lead';
import { logger } from '@/lib/logger';
import { rateLimit } from '@/lib/rate-limit';

export const runtime = 'nodejs';

type FilloutQuestion = { name: string; value: unknown };
type FilloutUrlParam = { id: string; value: unknown };
type FilloutPayload = { submissionId?: string; submissionTime?: string; questions?: FilloutQuestion[]; urlParameters?: FilloutUrlParam[] };

function field(questions: FilloutQuestion[], ...names: string[]): string {
  for (const name of names) {
    const q = questions.find(q => q.name.toLowerCase() === name.toLowerCase());
    if (q && q.value != null) return String(q.value).trim().slice(0, 500);
  }
  return '';
}

function param(urlParams: FilloutUrlParam[], id: string): string {
  const p = urlParams.find(p => p.id.toLowerCase() === id.toLowerCase());
  return p?.value != null ? String(p.value).trim().slice(0, 150) : '';
}

export async function POST(req: NextRequest) {
  const limited = await rateLimit(req, 'fillout')
  if (limited) return limited

  try {
    const body = (await req.json()) as FilloutPayload;
    const questions: FilloutQuestion[] = body.questions ?? [];
    const urlParams: FilloutUrlParam[] = body.urlParameters ?? [];

    const firstName = field(questions, 'First name', 'First Name');
    const lastName = field(questions, 'Last name', 'Last Name');
    const fullName = [firstName, lastName].filter(Boolean).join(' ') || field(questions, 'Full name', 'Full Name', 'Name');
    const email = field(questions, 'Email address', 'Email');
    const phone = field(questions, 'Phone number', 'Phone');
    const county = field(questions, 'County');
    const interest = field(questions, 'Product interest', 'Interest', 'What are you most interested in?');
    const address = [
      field(questions, 'Mailing address', 'Address'),
      field(questions, 'City'),
      field(questions, 'State'),
      field(questions, 'ZIP', 'Zip'),
    ].filter(Boolean).join(', ');
    const dob = field(questions, 'Date of birth', 'DOB');

    const utmSource = param(urlParams, 'utm_source') || param(urlParams, 'utmsource') || 'pahs_qr';
    const utmMedium = param(urlParams, 'utm_medium') || param(urlParams, 'utmmedium') || 'qr';
    const utmCampaign = param(urlParams, 'utm_campaign') || param(urlParams, 'utmcampaign') || 'pahs';
    const utmTerm = param(urlParams, 'utm_term') || param(urlParams, 'utmterm') || undefined;
    const utmContent = param(urlParams, 'utm_content') || param(urlParams, 'utmcontent') || undefined;

    const notes = [
      'Fillout PAHS form submission.',
      address && `Address: ${address}`,
      dob && `DOB: ${dob}`,
      body.submissionId && `Fillout ID: ${body.submissionId}`,
    ].filter(Boolean).join(' ');

    const supaUrl = process.env.SUPABASE_URL;
    const supaKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (supaUrl && supaKey) {
      const supabase = createClient(supaUrl, supaKey, { auth: { persistSession: false } });
      const { error } = await supabase.from('leads').insert({
        full_name: fullName || 'Unknown',
        phone: phone || null,
        email: email || null,
        product_interest: interest || null,
        lead_source: 'PAHS Fillout Form',
        page_source: 'latimorelifelegacy.fillout.com/pahs',
        status: 'New',
        county: county || null,
        utm_source: utmSource,
        utm_medium: utmMedium,
        utm_campaign: utmCampaign,
        utm_term: utmTerm || null,
        utm_content: utmContent || null,
        notes,
      });
      if (error) logger.error({ error: error.message }, 'Supabase insert error');
    }

    await upsertLead({
      firstName: firstName || undefined,
      lastName: lastName || undefined,
      email: email || null,
      phone: phone || null,
      county: county || null,
      productInterest: interest || null,
      source: utmSource,
      medium: utmMedium,
      campaign: utmCampaign,
      term: utmTerm || null,
      content: utmContent || null,
      landingPage: 'latimorelifelegacy.fillout.com/pahs',
      notes,
      metadata: { form: 'fillout-pahs', submissionId: body.submissionId ?? null },
    });

    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      const resend = new Resend(resendKey);
      const to = process.env.LEAD_NOTIFY_TO || 'Jackson1989@latimorelegacy.com';
      const from = process.env.LEAD_NOTIFY_FROM || 'Latimore Life & Legacy <leads@latimorelifelegacy.com>';
      await resend.emails.send({
        from,
        to,
        subject: `New PAHS Consultation: ${fullName || 'Unknown'}`,
        text: `New PAHS Fillout form submission\n\nName: ${fullName}\nPhone: ${phone || 'Not provided'}\nEmail: ${email || 'Not provided'}\nCounty: ${county || 'Not provided'}\nInterest: ${interest || 'Not provided'}\n${address ? `Address: ${address}\n` : ''}${dob ? `DOB: ${dob}\n` : ''}\nFillout ID: ${body.submissionId || 'N/A'}`,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    logger.error({ error }, 'Fillout webhook error');
    return NextResponse.json({ ok: false, error: 'server error' }, { status: 500 });
  }
}
