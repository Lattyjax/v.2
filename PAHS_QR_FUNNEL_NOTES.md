# PAHS QR Funnel Added

## New routes
- `/pahs`
- `/pahs/start`

## Funnel behavior
1. QR should point to `/pahs?utm_source=pahs&utm_medium=qr&utm_campaign=football2026`
2. Visitor can click Quick Quote on `/pahs`
3. `/pahs/start` captures lead into `/api/lead`
4. Visitor is then redirected to Ethos with UTM parameters

## What changed
- Added bridge page inside the actual Next.js hub
- Added hub-first capture page inside the actual Next.js hub
- Used existing `/api/lead` route instead of fake local storage

## Important
Your hub API must be working in production. If `/api/lead` fails, the page will stop and show an error instead of leaking traffic straight to Ethos.
