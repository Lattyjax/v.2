export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { addMinutes, parseISO } from 'date-fns'
import { prisma } from '@/lib/prisma'
import { BOOKING_CONFIG } from '@/lib/booking/config'
import { fetchGoogleFreeBusy } from '@/lib/calendar/availability'
import { createGoogleCalendarEvent } from '@/lib/calendar/events'
import { upsertLead } from '@/lib/hub/upsert-lead'
import { changeInquiryStage } from '@/lib/hub/change-stage'
import { sendMail } from '@/lib/mailer'
import { InquiryNotification, ThankYou } from '@/emails/templates'
import { rateLimit } from '@/lib/rate-limit'
import { LeadIntent, LeadSource, LeadStatus } from '@prisma/client'
import { inferLeadSource } from '@/lib/tracking/infer'
import { triggerLeadScoring } from '@/lib/ai/lead-score-trigger'

const BodySchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email(),
  phone: z.string().min(7).max(40),

  mailingAddress: z.string().max(200).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  state: z.string().max(100).optional().nullable(),
  zip: z.string().max(20).optional().nullable(),
  dateOfBirth: z.string().max(50).optional().nullable(),
  jobTitle: z.string().max(120).optional().nullable(),
  height: z.string().max(50).optional().nullable(),
  weight: z.string().max(50).optional().nullable(),

  maritalStatus: z.enum(['Single', 'Married', 'Separated', 'Widowed']).optional().nullable(),
  childrenCount: z.number().int().min(0).max(20).optional().nullable(),
  healthConditions: z.string().max(2000).optional().nullable(),
  tobaccoUse: z.enum(['Yes', 'No']).optional().nullable(),
  familyCriticalIllness: z.enum(['Yes', 'No', 'Unsure']).optional().nullable(),

  monthlyBudget: z.string().max(50).optional().nullable(),
  hasExistingInsurance: z.enum(['Yes', 'No']).optional().nullable(),
  existingInsuranceTypes: z.array(z.string().max(100)).max(20).optional().nullable(),

  willingToRefer: z.enum(['Yes', 'No']).optional().nullable(),
  knowsSomeoneWhoBenefits: z.enum(['Yes', 'No', 'Maybe']).optional().nullable(),

  county: z.string().max(100).optional().nullable(),
  productInterest: z.string().max(100).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),

  leadSessionId: z.string().max(191).optional().nullable(),
  pageUrl: z.string().max(500).optional().nullable(),
  referrer: z.string().max(500).optional().nullable(),
  source: z.string().max(100).optional().nullable(),
  medium: z.string().max(100).optional().nullable(),
  campaign: z.string().max(150).optional().nullable(),
  term: z.string().max(100).optional().nullable(),
  content: z.string().max(100).optional().nullable(),

  slotStart: z.string().datetime(),
})

function overlaps(a: { start: Date; end: Date }, b: { start: Date; end: Date }) {
  return a.start < b.end && b.start < a.end
}

function buildIntakeSummary(input: z.infer<typeof BodySchema>) {
  const lines = [
    'Insurance Intake Submission',
    '',
    `Name: ${input.firstName} ${input.lastName}`,
    `Email: ${input.email}`,
    `Phone: ${input.phone}`,
    input.mailingAddress ? `Address: ${input.mailingAddress}` : null,
    input.city ? `City: ${input.city}` : null,
    input.state ? `State: ${input.state}` : null,
    input.zip ? `ZIP: ${input.zip}` : null,
    input.dateOfBirth ? `Date of Birth: ${input.dateOfBirth}` : null,
    input.jobTitle ? `Industry / Job Title: ${input.jobTitle}` : null,
    input.height ? `Height: ${input.height}` : null,
    input.weight ? `Weight: ${input.weight}` : null,
    input.maritalStatus ? `Marital Status: ${input.maritalStatus}` : null,
    input.childrenCount !== null && input.childrenCount !== undefined ? `Children: ${input.childrenCount}` : null,
    input.healthConditions ? `Health Conditions: ${input.healthConditions}` : null,
    input.tobaccoUse ? `Tobacco Use: ${input.tobaccoUse}` : null,
    input.familyCriticalIllness ? `Family History of Critical Illness: ${input.familyCriticalIllness}` : null,
    input.monthlyBudget ? `Monthly Budget: ${input.monthlyBudget}` : null,
    input.hasExistingInsurance ? `Existing Insurance: ${input.hasExistingInsurance}` : null,
    input.existingInsuranceTypes?.length ? `Existing Policy Types: ${input.existingInsuranceTypes.join(', ')}` : null,
    input.willingToRefer ? `Willing to Refer: ${input.willingToRefer}` : null,
    input.knowsSomeoneWhoBenefits ? `Knows Someone Who Would Benefit: ${input.knowsSomeoneWhoBenefits}` : null,
    input.county ? `County: ${input.county}` : null,
    input.productInterest ? `Product Interest: ${input.productInterest}` : null,
    input.notes ? `Additional Notes: ${input.notes}` : null,
  ]

  return lines.filter(Boolean).join('\n')
}

export async function POST(req: NextRequest) {
  const limited = await rateLimit(req, 'booking')
  if (limited) return limited

  const body = await req.json().catch(() => null)
  const parsed = BodySchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.flatten() }, { status: 422 })
  }

  try {
    const input = parsed.data
    const sourceType = inferLeadSource({
      utmSource: input.source ?? null,
      utmMedium: input.medium ?? null,
      referrer: input.referrer ?? null,
      landingPage: input.pageUrl ?? '/consult',
    })
    const slotStart = parseISO(input.slotStart)
    const slotEnd = addMinutes(slotStart, BOOKING_CONFIG.durationMinutes)

    const busy = await fetchGoogleFreeBusy({
      timeMin: new Date(slotStart.getTime() - BOOKING_CONFIG.bufferMinutes * 60_000).toISOString(),
      timeMax: new Date(slotEnd.getTime() + BOOKING_CONFIG.bufferMinutes * 60_000).toISOString(),
      calendarId: BOOKING_CONFIG.calendarId,
    })

    const requestedWindow = {
      start: new Date(slotStart.getTime() - BOOKING_CONFIG.bufferMinutes * 60_000),
      end: new Date(slotEnd.getTime() + BOOKING_CONFIG.bufferMinutes * 60_000),
    }

    const busyConflict = busy.some((b) =>
      overlaps(requestedWindow, {
        start: new Date(b.start),
        end: new Date(b.end),
      })
    )

    if (busyConflict) {
      return NextResponse.json({ ok: false, error: 'That time is no longer available.' }, { status: 409 })
    }

    const sameEmailFutureAppointment = await prisma.appointment.findFirst({
      where: {
        scheduledFor: { gte: new Date() },
        status: { in: ['Booked', 'Confirmed'] },
        contact: {
          email: input.email.toLowerCase(),
        },
      },
      include: { contact: true },
    })

    if (sameEmailFutureAppointment) {
      return NextResponse.json(
        { ok: false, error: 'A future consultation is already booked for this contact.' },
        { status: 409 }
      )
    }

    const intakeSummary = buildIntakeSummary(input)
    const intakeMetadata = {
      mailingAddress: input.mailingAddress ?? null,
      city: input.city ?? null,
      state: input.state ?? null,
      zip: input.zip ?? null,
      dateOfBirth: input.dateOfBirth ?? null,
      jobTitle: input.jobTitle ?? null,
      height: input.height ?? null,
      weight: input.weight ?? null,
      maritalStatus: input.maritalStatus ?? null,
      childrenCount: input.childrenCount ?? null,
      healthConditions: input.healthConditions ?? null,
      tobaccoUse: input.tobaccoUse ?? null,
      familyCriticalIllness: input.familyCriticalIllness ?? null,
      monthlyBudget: input.monthlyBudget ?? null,
      hasExistingInsurance: input.hasExistingInsurance ?? null,
      existingInsuranceTypes: input.existingInsuranceTypes ?? [],
      willingToRefer: input.willingToRefer ?? null,
      knowsSomeoneWhoBenefits: input.knowsSomeoneWhoBenefits ?? null,
    }

    const { contact, inquiry } = await upsertLead({
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      phone: input.phone,
      county: input.county,
      productInterest: input.productInterest,
      leadSessionId: input.leadSessionId,
      source: input.source ?? 'website',
      medium: input.medium ?? 'booking',
      campaign: input.campaign ?? 'native_scheduler',
      term: input.term,
      content: input.content,
      referrer: input.referrer,
      landingPage: input.pageUrl,
      notes: input.notes ?? intakeSummary,
      metadata: {
        bookingIntent: true,
        intake: intakeMetadata,
      },
    })

    const displayName = [contact.firstName, contact.lastName].filter(Boolean).join(' ') || contact.email || 'Consultation'

    const googleEvent = await createGoogleCalendarEvent({
      summary: `Consultation - ${displayName}`,
      description: [
        `Consultation scheduled via website.`,
        `Name: ${displayName}`,
        contact.email ? `Email: ${contact.email}` : null,
        contact.phone ? `Phone: ${contact.phone}` : null,
        contact.county ? `County: ${contact.county}` : null,
        inquiry.productInterest ? `Interest: ${inquiry.productInterest}` : null,
        input.notes ? `Notes: ${input.notes}` : null,
      ]
        .filter(Boolean)
        .join('\n'),
      start: slotStart.toISOString(),
      end: slotEnd.toISOString(),
      attendeeEmail: contact.email ?? undefined,
      attendeeName: displayName,
    })

    const appointment = await prisma.appointment.create({
      data: {
        contactId: contact.id,
        inquiryId: inquiry.id,
        bookingSource: 'native_scheduler',
        source: input.source ?? inquiry.source ?? 'website',
        medium: input.medium ?? inquiry.medium ?? 'booking',
        campaign: input.campaign ?? inquiry.campaign ?? 'native_scheduler',
        scheduledFor: slotStart,
        status: 'Booked',
        location: googleEvent.hangoutLink ?? googleEvent.htmlLink ?? 'Google Calendar',
        calendlyEventId: googleEvent.id,
        metadata: {
          provider: 'google',
          eventLink: googleEvent.htmlLink ?? null,
          meetingUrl: googleEvent.hangoutLink ?? null,
          intake: intakeMetadata,
          intakeSummary,
        },
      },
    })

    // Trigger lead scoring when appointment is booked
    await triggerLeadScoring({
      contactId: contact.id,
      inquiryId: inquiry.id,
      reason: 'appointment_booked'
    })

    await prisma.calendarEvent.create({
      data: {
        contactId: contact.id,
        inquiryId: inquiry.id,
        appointmentId: appointment.id,
        provider: 'google',
        externalId: googleEvent.id,
        title: `Consultation - ${displayName}`,
        description: intakeSummary,
        startAt: slotStart,
        endAt: slotEnd,
        timezone: BOOKING_CONFIG.timezone,
        location: 'Google Calendar',
        meetingUrl: googleEvent.hangoutLink ?? googleEvent.htmlLink ?? undefined,
        status: 'scheduled',
        payload: {
          googleEvent,
          intake: intakeMetadata,
        },
      },
    })

    await prisma.note.create({
      data: {
        contactId: contact.id,
        inquiryId: inquiry.id,
        title: 'Insurance Intake Submission',
        body: intakeSummary,
        author: 'native-scheduler',
      },
    })

    await changeInquiryStage({
      inquiryId: inquiry.id,
      stage: 'Booked',
      actor: 'native-scheduler',
      notes: input.notes ?? undefined,
      occurredAt: slotStart,
    })
     // Typed tracking updates (source/intent/status)
    await prisma.inquiry.update({
        where: { id: inquiry.id },
        data: {
          sourceType,
          intent: LeadIntent.CONSULT,
          status: LeadStatus.BOOKED,
        },
    })

    await prisma.contact.update({
      where: { id: contact.id },
      data: {
        primarySourceType: contact.primarySourceType === LeadSource.UNKNOWN ? sourceType : contact.primarySourceType,
        primaryIntent: contact.primaryIntent === LeadIntent.UNKNOWN ? LeadIntent.CONSULT : contact.primaryIntent,
        currentIntent: LeadIntent.CONSULT,
        status: LeadStatus.BOOKED,
      },
    })

    await prisma.task.create({
      data: {
        title: `Prepare for consultation with ${displayName}`,
        description: `Booked for ${slotStart.toISOString()}`,
        dueAt: new Date(slotStart.getTime() - 2 * 60 * 60 * 1000),
        contactId: contact.id,
        inquiryId: inquiry.id,
      },
    })

    if (process.env.NOTIFY_TO && process.env.THANKYOU_FROM) {
      await sendMail({
        to: process.env.NOTIFY_TO,
        from: process.env.THANKYOU_FROM,
        subject: `New consultation booked - ${displayName}`,
        html: InquiryNotification({
          firstName: contact.firstName ?? undefined,
          lastName: contact.lastName ?? undefined,
          email: contact.email ?? undefined,
          phone: contact.phone ?? undefined,
          productInterest: inquiry.productInterest,
          county: contact.county ?? undefined,
          leadSessionId: input.leadSessionId ?? undefined,
          source: input.source ?? 'website',
          campaign: input.campaign ?? 'native_scheduler',
        }),
      })

      if (contact.email) {
        await sendMail({
          to: contact.email,
          from: process.env.THANKYOU_FROM,
          subject: 'Your consultation is booked',
          html: ThankYou({ firstName: contact.firstName ?? undefined }),
        })
      }
    }

    return NextResponse.json({
      ok: true,
      contactId: contact.id,
      inquiryId: inquiry.id,
      appointmentId: appointment.id,
      scheduledFor: slotStart.toISOString(),
      eventId: googleEvent.id,
      meetingUrl: googleEvent.hangoutLink ?? googleEvent.htmlLink ?? null,
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        error: error?.message || 'Failed to book appointment',
      },
      { status: 500 }
    )
  }
}