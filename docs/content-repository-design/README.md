# Handoff: Latimore Content Repository

## Overview
The **Content Repository** is an internal tool for the Latimore Life & Legacy marketing team. It lets a team member bring in a piece of content (a web link or an uploaded PDF/Word/Google doc), attach consistent **UTM tracking parameters**, and **publish it to the company website** (`latimorelifelegacy.com`), which is hosted on **Vercel**.

The core flow is a 3-step drawer:
1. **Import** — paste a URL *or* upload a document. The tool auto-detects content type and suggests a display title.
2. **Track** — configure `utm_source`, `utm_medium`, `utm_campaign` (pick an existing campaign or auto-generate a consistent new name), and optional `utm_content`. A live preview of the final tagged URL updates as you type.
3. **Publish** — pick a destination section on the site, choose publish-now / schedule / save-draft, review a summary, and trigger a deploy.

The main screen is a **library dashboard**: a filterable table of all resources with their campaign, destination, status, and date, plus bulk selection to apply UTMs or publish many items at once.

## About the Design Files
The files in this bundle are **design references created in HTML/React-via-Babel** — a clickable prototype showing intended look and behavior. **They are not production code to ship directly.** Publishing in the prototype is simulated: clicking "Publish & deploy" only updates local React state and shows a toast; nothing is sent anywhere.

The task is to **recreate these designs in a real, deployable application** using an appropriate production stack, and to **build the real integrations** the prototype only mocks (see "Integration Points / What's Real vs. Mocked" below). The prototype's visual design, layout, copy, and the UTM-building logic should be carried over faithfully; everything that touches the network, file storage, or authentication must be built for real.

## Fidelity
**High-fidelity (hifi).** Final colors, typography, spacing, component styling, interaction states, and copy are all defined. Recreate the UI pixel-faithfully. Exact tokens are listed in **Design Tokens** below and are also present as CSS custom properties in `Content Repository.html`.

## Recommended Stack
The target site is hosted on **Vercel**. A natural fit:
- **Next.js (App Router)** deployed on Vercel
- **Vercel Blob** (or S3-compatible storage) for uploaded documents
- A content source the site builds from — either the existing CMS's API, or a Git-based content collection (MDX/JSON) committed to the repo so a Vercel build picks it up
- **Vercel Deploy Hooks** or the Vercel REST API to trigger a production deploy after content is committed
- Auth via the team's existing SSO/login, or a simple protected internal route

If a codebase already exists for `latimorelifelegacy.com`, integrate into its existing patterns and component library rather than introducing new ones.

---

## Integration Points / What's Real vs. Mocked
This is the most important section — it lists exactly what an engineer must build.

| Capability | In prototype | Needs to be built |
|---|---|---|
| UTM URL construction | ✅ Real, working (`buildUrl`, `autoCampaign` in `data.jsx`) | Lift as-is |
| Link metadata detection | ⚠️ Heuristic from URL string (`typeFromUrl`, `guessTitleFromUrl`) | Optionally fetch real OpenGraph/title server-side |
| File upload | ❌ Fake (two hardcoded sample files) | Real upload to Vercel Blob / S3, return stored URL |
| Campaign list | ❌ Hardcoded array (`CAMPAIGNS`) | Load from CMS/DB; allow create |
| Destinations | ❌ Hardcoded array (`DESTINATIONS`) | Map to real site sections/routes |
| "Publish" | ❌ Local state push + toast | Write content record to source, then trigger Vercel deploy |
| "Schedule" | ❌ Date stored, nothing fires | A cron/queued job that publishes + deploys on the date |
| Status (published/draft/scheduled) | ❌ Local only | Persist in CMS/DB |
| Auth / "by Jackson L." | ❌ Hardcoded | Real authenticated user |
| Bulk apply UTM / bulk publish | ❌ Local state mutation | Real batched writes + single deploy |

### Suggested publish sequence (real implementation)
1. If upload: PUT file to Vercel Blob → get permanent URL.
2. Build the tagged URL with `buildUrl(baseUrl, utm)` (logic already written).
3. Write a content record (title, type, sourceUrl, taggedUrl, utm{}, destination, status, date, author) to the content source.
4. If `status === "published"`: trigger a Vercel production deploy (Deploy Hook or REST API). If `scheduled`: enqueue for the date. If `draft`: stop after step 3.
5. Surface real deploy status back to the UI (queued → building → ready) instead of the prototype's fixed "~40s" copy.

---

## Screens / Views

### 1. Dashboard (`App` in `app.jsx`)
- **Purpose:** Browse, filter, and manage every resource; entry point to add new content.
- **Layout:** Full-height flex column.
  - **Top bar** — 64px tall, fixed height, `--navy-900` background. Left: Latimore wordmark + vertical divider + "CONTENT REPOSITORY" uppercase label. Right: search input (pill, 280px, translucent white) + "Add to Repository" primary button.
  - **Body** — flex row. **Sidebar** (258px, `--paper-2`) + **Main** (flex-1, scrollable, padding 30px 36px 120px).
- **Sidebar components:**
  - "Status" group: Everything / Published / Scheduled / Drafts — each a full-width button with a right-aligned count chip. Active item = `--navy-900` bg, white text, gold count.
  - "Campaigns" group: All campaigns + one row per campaign with a 6px gold square tick and count.
  - Footer pinned to bottom: "#TheBeatGoesOn" (Newsreader 16px, `--navy-800`) + italic tagline "Protecting Today. Securing Tomorrow." (Newsreader italic 11px, `--ink-3`).
- **Main components:**
  - **Page head:** "Repository" (Newsreader 34px, weight 500, `--navy-900`) + subtitle (`--ink-2`, 14.5px).
  - **Stat tiles:** 4-up grid, 14px gap. Each: white card, 1px `--line` border, `--r` radius, `--shadow-sm`; 38px rounded icon chip (`--paper-2` bg, `--navy-700` icon) + value (Newsreader 26px) + label (12px `--ink-2`). Tiles: Resources, Published, Scheduled, Campaigns.
  - **Type filter bar:** pill row — All types / Links / PDFs / Docs / Videos. Active pill = `--navy-900` bg, white.
  - **Table:** white card. Grid columns `38px minmax(0,1fr) 168px 150px 116px 64px 38px` = [checkbox, Resource, Campaign, Destination, Status, Date, more]. Header row `--paper-2` bg, 11px uppercase `--ink-3` labels. Each data row 13px vertical padding, 1px `--line-2` bottom border, hover `#FCFAF4`, selected `#FBF5E6`.
    - **Resource cell:** type glyph (38px rounded, color-coded) + title (weight 600, ellipsis) + meta line (domain · monospace tagged-URL preview, `--ink-3`).
    - **Campaign cell:** pill chip (`--paper-2` bg, `--navy-700` text).
    - **Status cell:** colored badge with dot (see Status badges).
- **Bulk action bar:** appears fixed at bottom-center when ≥1 row selected. `--navy-900` pill, `--shadow-lg`, slide-up animation. Shows count chip (gold) + "selected" + "Clear", and actions "Apply UTM" (ghost) + "Publish" (gold). 

### 2. Add to Repository drawer (`AddDrawer` in `drawer.jsx`)
- **Purpose:** The 3-step import → track → publish flow.
- **Layout:** Right-side drawer, 540px wide (max 94vw), full height, `--paper` bg, `--shadow-lg`, slide-in from right over a blurred `rgba(11,18,38,.46)` scrim. Click scrim to close.
  - **Header:** eyebrow "ADD TO REPOSITORY" (gold, uppercase) + dynamic title (Newsreader 23px) + close icon button.
  - **Stepper:** Import / Track / Publish. Current step = navy filled dot; completed = gold dot with check; 34px connector lines.
  - **Body:** scrollable, vertical stack, 18px gap.
  - **Footer:** Back (ghost) on left once past step 0; Continue (primary) / final action (gold) on right. Continue is disabled until the step's required fields are filled.

- **Step 0 — Import:**
  - Segmented control: "Paste a link" / "Upload a document".
  - **Link mode:** URL input with globe icon. On blur, auto-fills title (from last path segment) and detects type. Shows a preview card (type glyph + detected domain + title + "{Type} detected" gold badge).
  - **Upload mode:** dashed dropzone (upload icon, "Drag & drop your file here", subcopy "PDF, Word, or Google Docs export · up to 25 MB"). In the prototype two fake-file buttons stand in for a real picker — **replace with a real file input + upload.** Selected file shows the same preview card with size and a remove button.
  - **Display title** input (required).

- **Step 1 — Track:**
  - 2-col grid: `utm_source` select (Facebook, Instagram, Email, LinkedIn, YouTube, SMS/Text, QR Code (print), Google Ads) and `utm_medium` select (social, email, cpc, referral, qr, banner, organic).
  - `utm_campaign` field with an "Existing / New" toggle. Existing = select from `CAMPAIGNS`. New = monospace text input + "Auto-name" button that generates `latimore-{topic}-{source}-2026` via `autoCampaign()`. Hint: "We keep names consistent: `latimore-topic-source-year`".
  - `utm_content` optional monospace input.
  - **Live tagged-URL preview:** `--navy-900` card. Header "● LIVE TAGGED URL" with a pulsing green dot + Copy button (changes to "Copied" with check for 1.6s). Body = full tagged URL, monospace, `#EDE6D4`, word-break.
  - Required to continue: source, medium, campaign.

- **Step 2 — Publish:**
  - **Destination** select (Vercel routes — see DESTINATIONS). Hint shows `latimorelifelegacy.com{path}`.
  - **Vercel deploy card:** white card. Header: a CSS triangle "mark" + "Vercel · Production" (left) and a monospace `latimorelifelegacy.com` domain chip (right). Rows: "Deploys from `main`" (branch icon), "Build & go live in ~40s" (clock icon). Conditional note for draft ("Drafts don't deploy — saved to the repository only.") and schedule ("Deploy triggers automatically on the scheduled date."). **Note:** the ~40s and branch are placeholder copy — wire to real Vercel deploy metadata.
  - **When** radio cards: Publish now (send icon) / Schedule (calendar) / Save as draft (edit). Selected card = navy border, `#FCFAF4` bg, navy check badge. Schedule reveals a date input.
  - **Summary** card: Resource, Type, Campaign (mono), Destination, Tagged URL (mono, word-break).
  - Final button label: "Publish & deploy" / "Schedule publish" / "Save draft".

### 3. Bulk UTM modal (`BulkUtmModal` in `app.jsx`)
- **Purpose:** Apply UTM fields to all selected resources at once.
- **Layout:** Centered modal, 520px, `--paper`, 16px radius. Same header pattern (eyebrow "BULK ACTION" + "Apply UTM to N items").
- **Body:** note explaining only chosen fields overwrite, empty fields left as-is. Then `utm_campaign` select, and a 2-col grid of `utm_source` / `utm_medium`. All default to "Leave unchanged".
- **Footer:** Cancel (ghost) + "Apply to N" (gold, disabled until at least one field set).

## Interactions & Behavior
- **Open drawer:** "Add to Repository" or empty-state button → drawer slides in; state resets on open.
- **URL blur:** auto-fills title + detects type (`handleUrlBlur`).
- **Auto-name campaign:** generates consistent kebab campaign name from topic + source.
- **Live URL:** recomputed via `buildUrl()` on every UTM keystroke (`useMemo`).
- **Copy URL:** writes to clipboard, button shows "Copied" for 1.6s.
- **Publish:** prepends a new record to the list, closes drawer, fires a toast (text varies by publish mode). **In production this must instead persist + deploy.**
- **Row select / select-all:** checkboxes drive the bulk bar. Select-all toggles only the currently filtered rows.
- **Bulk apply UTM:** patches `utm` on selected rows for any non-empty field; sets campaign if chosen.
- **Bulk publish:** sets selected rows to `published`.
- **Filtering:** sidebar status + campaign, type pills, and search box all combine (`filtered` useMemo). Search matches title + domain.
- **Toasts:** bottom-right, navy card, auto-dismiss after 2.6s.
- **Animations:** drawer slide `.26s cubic-bezier(.2,.7,.2,1)`; scrim fade `.2s`; bulk bar & toast pop `.22-.24s`; live-dot pulse `1.8s` infinite.
- **Responsive:** under 1080px the sidebar hides, stats go 2-up, and the table drops the Destination + Date columns.

## State Management
Prototype keeps everything in React state inside `App`:
- `items` — array of resource records (seeded from `SEED` in `data.jsx`)
- `drawer`, `bulk` — modal open flags
- `sel` — `{ [id]: bool }` selection map
- `toast` — `{ id, msg }` or null
- `q`, `fType`, `fStatus`, `fCampaign` — filters

Drawer-local state: `step`, `mode`, `url`, `file`, `title`, `type`, `utm{source,medium,campaign,content}`, `campaignMode`, `newCampaign`, `dest`, `publishMode`, `schedule`, `copied`.

**Resource record shape:**
```
{ id, title, type: 'link'|'pdf'|'doc'|'video', source, domain,
  campaign, utm:{source,medium,campaign,content}, destination,
  status:'published'|'draft'|'scheduled', date:'YYYY-MM-DD', by }
```
In production, replace local `items` with data fetched from the content source/DB, and replace the local mutations in `publish`, `applyBulk`, and bulk-publish with real API calls.

## Design Tokens
Colors (CSS custom properties in `Content Repository.html`):
- Navy: `--navy-900 #0B1226`, `--navy-800 #0F1E3D`, `--navy-700 #16305C`, `--navy-600 #1E3E72`
- Gold: `--gold-600 #A8791C`, `--gold-500 #C49A3C`, `--gold-400 #D9B65E`, `--gold-300 #ECD493`
- Surfaces: `--paper #FAF6EC`, `--paper-2 #F3ECDB`, `--card #FFFFFF`
- Ink: `--ink #161A22`, `--ink-2 #545A66`, `--ink-3 #8A8F99`
- Lines: `--line rgba(15,30,61,.10)`, `--line-2 rgba(15,30,61,.06)`
- Status/accent: `--pub #2E7D5B` (published), `--sched #B0831F` (scheduled), `--draft #8A8F99`, `--rust #B3402E` (PDF), `--teal #2C6E7A` (video)
- Type-glyph tints: navy/link `rgba(30,62,114,.1)`, rust/pdf `rgba(179,64,46,.1)`, gold/doc `rgba(168,121,28,.13)`, teal/video `rgba(44,110,122,.11)`

Radius: `--r 12px`, `--r-sm 9px`; buttons/inputs 9px; chips/pills 999px.
Shadows: `--shadow-sm 0 1px 2px rgba(11,18,38,.05),0 1px 3px rgba(11,18,38,.04)`; `--shadow-md 0 4px 16px rgba(11,18,38,.08),0 1px 4px rgba(11,18,38,.05)`; `--shadow-lg 0 24px 60px rgba(11,18,38,.22),0 8px 20px rgba(11,18,38,.12)`.

Typography (Google Fonts):
- **Newsreader** (serif) — headings, page titles, brand tagline. Weights 400/500/600, optical sizing. Used at 34px (page title), 26px (stat value), 23px (drawer title), 20px (empty/section), 16px (#TheBeatGoesOn).
- **Hanken Grotesk** (sans) — UI/body. Weights 400/500/600/700. Body 14px/1.5; labels 12.5px weight 700; uppercase eyebrows 11px tracked.
- **JetBrains Mono** — all URLs, UTM values, campaign names, dates.

Spacing: 64px top bar, 258px sidebar, 540px drawer, 30–36px main padding, 14–18px gaps.

## Assets
- `assets/latimore-logo.png` — the client's actual logo (provided by user). The prototype's top-bar wordmark is rendered in **CSS** (`Wordmark` component) because the full lockup doesn't read at small sizes; the real logo file is included here for use wherever it fits better.
- Icons are inline SVG stroke paths defined in the `I` object in `ui.jsx` (1.6 stroke, 24px box). No icon-font dependency.
- The "Vercel" reference uses a generic CSS triangle and plain text — do not ship Vercel's trademarked logo unless you have the right to; the real Vercel dashboard/branding is theirs.

## Files
- `Content Repository.html` — shell: all CSS (design tokens + every component style), Google Font links, React/Babel script tags, and mounts the JSX files.
- `data.jsx` — constants + seed data: `UTM_SOURCES`, `UTM_MEDIUMS`, `DESTINATIONS`, `CAMPAIGNS`, `TYPES`, `SEED`, and the **real logic** `buildUrl()` + `autoCampaign()`.
- `ui.jsx` — primitives: `Icon`, `TypeGlyph`, `Button`, `StatusBadge`, `Pill`, `Select`, `Toast`, `Wordmark`.
- `drawer.jsx` — the `AddDrawer` 3-step flow + URL/type helpers.
- `app.jsx` — `App` dashboard, `Row`, `BulkUtmModal`, all filtering/selection/publish state.
- `assets/latimore-logo.png` — client logo.
