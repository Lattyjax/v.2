# Latimore OS — CRM Recovery Runbook

Status: **Recovery Mode**

This runbook is the authoritative operating procedure to restore CRM trust and move from fragmented operations to a single production command center.

---

## 1) Recovery goals (what “fixed” means)

CRM is considered recovered only when all conditions are true:

1. One production Vercel project is designated and documented.
2. `hub.latimorelifelegacy.com` routes to that single project.
3. `/admin/leads` reliably displays real leads (`Contact` + `Inquiry`).
4. All lead capture endpoints write to the same Supabase project (`Latimore-hub`).
5. Security hardening track is in progress (API-only writes + staged RLS policy rollout).
6. Manual fallback process is actively used until automated confidence is restored.

---

## 2) Lead semantics (enforced system definitions)

Use these definitions everywhere (UI labels, reports, endpoint logic, SOPs):

- `LeadSession`: not a lead (anonymous traffic/session metadata).
- `Event`: not a lead (behavior analytics).
- `Inquiry`: lead intent (raised hand).
- `Contact`: identified person/prospect.
- `Appointment`: high-intent lead.

**Operational rule:** real lead population = `Contact + Inquiry`.

---

## 3) Ownership map

Assign these roles before execution starts:

- **Incident Owner (IO):** accountable for end-to-end recovery.
- **Platform Owner:** Vercel project/domain cleanup.
- **App Owner:** admin screens + endpoint normalization.
- **Data Owner:** Supabase schema integrity + row-level security plan.
- **Ops Owner:** manual fallback SOP and daily reconciliation.

No work starts until names are assigned.

---

## 4) 72-hour execution plan

## Phase A (0–24h): Stabilize deployment ownership

### Tasks

1. Select one production Vercel project (recommended: `latimore-hub-main-main` or `latimore-pahs-next`).
2. Map `hub.latimorelifelegacy.com` only to that project.
3. Mark all similarly named projects as legacy/experimental in naming and team docs.
4. Freeze new project creation until recovery closes.

### Pass/fail criteria

- **PASS:** one and only one project receives production traffic.
- **FAIL:** multiple candidate projects still appear “possibly live.”

---

## Phase B (24–48h): Restore usable CRM center

### Tasks

1. Build/verify `/admin/leads` view with these columns:
   - Name
   - Phone
   - Email
   - Status
   - Source
   - Campaign
   - Product Interest
   - Last Activity
   - Next Follow-Up
2. Restrict default records in this view to `Contact` + `Inquiry`.
3. Add explicit indicator/badge for `Appointment` as high-intent.

### Pass/fail criteria

- **PASS:** operators can review and action every real lead from one table.
- **FAIL:** lead list still mixes raw events/sessions as leads.

---

## Phase C (48–72h): Normalize writes + security baseline

### Tasks

1. Verify all inbound endpoints write to the same Supabase project:
   - `/api/track`
   - `/api/lead`
   - `/api/pahs-lead`
   - `/api/fillout`
2. Ensure public clients do not write directly to broad Supabase tables.
3. Route writes: browser -> Next.js API route -> server-side service role -> Supabase.
4. Start staged RLS rollout table-by-table with tested policies.

### Pass/fail criteria

- **PASS:** one data core, one write path model, tested endpoint parity.
- **FAIL:** mixed projects/keys or direct client-side writes still active.

---

## 5) Endpoint acceptance test checklist

Run these checks per endpoint (`/api/lead`, `/api/pahs-lead`, `/api/fillout`):

1. **Create test lead payload** with deterministic marker (`source=recovery_test_YYYYMMDD`).
2. **POST succeeds** (2xx expected).
3. **Contact record exists** with expected identity fields.
4. **Inquiry record exists** linked to contact.
5. **Admin visibility:** appears in `/admin/leads` within expected delay.
6. **No duplicate creation** on safe retry behavior.
7. **Auditability:** timestamps and source fields populated.

Only mark endpoint green when all seven checks pass.

---

## 6) Manual fallback SOP (active until go-live)

For every inbound prospect event (DM/call/text/form/scan/quote request):

1. Create `Contact`.
2. Create linked `Inquiry`.
3. Create follow-up `Task`.
4. Create/confirm `Appointment` when applicable.
5. Reconcile at end of day against message channels and call logs.

This manual SOP remains mandatory until recovery closure criteria are met.

---

## 7) Daily operating cadence during recovery

Daily standup must answer exactly:

1. What is the single production project?
2. Did any endpoint fail acceptance checks in the last 24h?
3. How many new `Contact`, `Inquiry`, and `Appointment` records were created?
4. Any lead-capture incidents and how were they resolved?
5. What remains before recovery close?

---

## 8) Recovery close criteria (exit Recovery Mode)

Exit only when all are true for 7 consecutive days:

1. Production routing unchanged and correct.
2. `/admin/leads` is primary daily workflow for operators.
3. Endpoint checks pass continuously.
4. No unresolved lead-capture incidents.
5. Security hardening plan has active RLS rollout with tested policies.

When achieved, declare transition from **CRM Recovery Mode** to **Operational Mode**.
