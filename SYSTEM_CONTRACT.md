# Latimore Hub unified data contract

This build locks the hub around one pipeline:

- every click posts to `POST /api/event`
- every lead posts to `POST /api/lead`
- Fillout, booking, and digital-card routes are adapters that normalize into the same service layer
- the admin reads from unified `Event`, `Inquiry`, `Appointment`, and `Task` records

## Core service layer

- `lib/hub/ingest-event.ts`
- `lib/hub/upsert-lead.ts`
- `lib/hub/record-appointment.ts`
- `lib/hub/change-stage.ts`

## Core tables

- `LeadSession`
- `Contact`
- `Inquiry`
- `Event`
- `Appointment`
- `Task`
- `InquiryStageHistory`

## New canonical event names

- `page_view`
- `cta_click`
- `call_click`
- `text_click`
- `email_click`
- `book_click`
- `form_submit`
- `lead_created`
- `appointment_booked`
- `stage_changed`
- `county_selected`
- `product_selected`
- `lead_magnet_download`

## Deploy steps

1. Back up the current database.
2. Run `prisma generate`.
3. Run `prisma db push`.
4. Seed or migrate any old `CardEvent` data into `Event`.
5. Verify:
   - `/api/event`
   - `/api/lead`
   - `/api/webhooks/fillout`
   - `/api/webhooks/booking`
   - `/api/webhooks/card`
   - `/api/dashboard/overview`

## Important note

This refactor changes the Prisma schema materially. Existing database rows and any dashboards that depended on
`CardEvent`, `Inquiry.status`, or `Inquiry.interestType` need a database push/migration before production traffic
should be sent through the new routes.
