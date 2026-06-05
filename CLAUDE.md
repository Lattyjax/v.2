# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start Next.js dev server (localhost:3000)
npm run build        # prisma generate + next build
npm run lint         # ESLint
npm run validate     # lint + build (pre-deploy check)

# Database
npm run db:deploy    # prisma migrate deploy (production)
npm run db:push      # prisma db push (schema sync, dev only)
npm run db:seed      # seed test data via prisma/seed.ts
```

No test suite is configured. `npm run validate` is the closest to a CI gate.

## Architecture

### Data flow

Every user interaction funnels through two server endpoints:

- `POST /api/event` — analytics (page views, CTA clicks, etc.)
- `POST /api/lead` — lead capture (requires email or phone)

Webhook adapters (`/api/webhooks/fillout`, `/api/webhooks/booking`, `/api/webhooks/card`) and the legacy `/api/fillout` route normalize third-party payloads into these same service-layer functions.

### Service layer (`lib/hub/`)

All business logic lives here, called by API routes — never directly from pages:

| File | Purpose |
|------|---------|
| `upsert-lead.ts` | Upsert Contact + create Inquiry + auto-create follow-up Task + fire `lead_created` event |
| `ingest-event.ts` | Upsert LeadSession + write Event row |
| `change-stage.ts` | Update Inquiry stage + write InquiryStageHistory + fire `stage_changed` event |
| `record-appointment.ts` | Create Appointment record |
| `normalizers.ts` | `normalizeStage`, `normalizeProductInterest`, `normalizeEventType`, `cleanString` — sanitize and map all external strings |

### Database (Prisma + Supabase PostgreSQL)

Two connection URLs are required: `DATABASE_URL` (port 6543, pooled) for runtime queries, `DIRECT_URL` (port 5432) for migrations. Core models: `LeadSession → Contact → Inquiry → Event`. `InquiryStageHistory` provides a full audit trail of pipeline moves.

### Client-side tracking

`PublicTracker` (mounted in `app/layout.tsx`) auto-fires `page_view` on route change and captures `cta_click`, `call_click`, `book_click`, etc. via a delegated click listener. It infers `productInterest` and `county` from element text, href, and `data-product-interest` / `data-county` attributes. Tracking failures are silently swallowed.

### Auth & protection

`middleware.ts` uses `next-auth/middleware` to guard `/admin/*`. Admin emails are controlled by the `ADMIN_EMAILS` env var (comma-separated). All protected API routes call `requireAdminSession()` from `lib/ai/shared.ts`.

### AI layer (`lib/ai/`)

`lib/ai/client.ts` exposes `createOpenAIJsonCompletion` — a single function that dispatches to OpenAI (default, `gpt-4.1-mini`) or Gemini based on `AI_PROVIDER` env var. All AI routes log runs to the `AiRun` table and support dual auth: admin session **or** `x-cron-secret` header for scheduled jobs.

### API conventions

- Every route file that must not be statically cached declares `export const dynamic = 'force-dynamic'` at the top.
- All POST body validation uses Zod schemas from `lib/schemas.ts` via `.safeParse()`.
- Rate limiting uses an in-memory store (`lib/rate-limit.ts`) keyed by IP — separate limits per route type (`fillout`, `inquiries`, `booking`, `reports`).
- Fillout webhook verifies HMAC-SHA256 signatures from `FILLOUT_SECRET` before processing.

### Key env vars

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Supabase pooled (port 6543) |
| `DIRECT_URL` | Supabase direct (port 5432, migrations) |
| `ADMIN_EMAILS` | Comma-separated list of allowed admin Google accounts |
| `FILLOUT_SECRET` | Webhook HMAC secret |
| `RESEND_API_KEY` | Transactional email |
| `NOTIFY_TO` / `THANKYOU_FROM` | Email addresses for lead notifications |
| `AI_PROVIDER` | `openai` (default) or `gemini` |
| `OPENAI_API_KEY` / `GEMINI_API_KEY` | Required for AI features |
| `CRON_SECRET` | Allows cron jobs to call AI routes without an admin session |
| `NEXT_PUBLIC_BASE_URL` | Canonical domain for metadata/OG tags |
| `NEXT_PUBLIC_GA4_ID` | Optional GA4 measurement ID |
