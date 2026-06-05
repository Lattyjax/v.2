# AI Backend Consolidation — May 2026

## What Changed
All Gemini/AI calls moved from client-side service files to server-side Next.js API routes.

## Architecture (BEFORE → AFTER)

BEFORE (unsafe):
  Browser → geminiService.ts → Gemini API (API_KEY exposed in bundle)

AFTER (production-safe):
  Browser → /api/admin/ai/* → lib/ai/client.ts → Gemini or OpenAI

## New API Routes

| Route | Replaces | Used By |
|-------|----------|---------|
| `/api/admin/ai/chat` | `chatWithGemini`, `generateSocialStrategy`, `analyzeTrends` | ChatBot.tsx |
| `/api/admin/ai/social` | `generateSocialContent` | ContentCreator.tsx |
| `/api/admin/ai/funnel` | `generateFunnelStrategy` | LegacyFunnels.tsx |
| `/api/admin/ai/asset` | `generateContentFromAsset` | AssetVault.tsx |
| `/api/admin/ai/review-script` | `generateReviewScript` | CRM.tsx |
| `/api/admin/ai/campaign` | `generateBulkCampaign` | MarketingTools.tsx |
| `/api/admin/ai/client-snapshot` | `generateClientSnapshot` | CRM.tsx (existing route, unchanged) |
| `/api/admin/ai/generate-content` | (existing route, unchanged) | Legacy content gen |

## Files Modified
- `app/admin/social-os/_components/ContentCreator.tsx` — removed geminiService import
- `app/admin/social-os/_components/ChatBot.tsx` — removed geminiService import
- `app/admin/social-os/_components/LegacyFunnels.tsx` — removed geminiService import
- `app/admin/social-os/_components/AssetVault.tsx` — removed geminiService import
- `app/admin/social-os/_components/CRM.tsx` — removed geminiService import
- `app/admin/social-os/_components/MarketingTools.tsx` — removed geminiService import
- `package.json` — fixed next `^16.2.1` → `^15.2.1`, removed unused `@google/genai`

## Files Deleted
- `app/api/admin/social-os/*` — stale intermediate routes that still imported geminiService

## geminiService.ts Status
The file at `app/admin/social-os/_services/geminiService.ts` is now ORPHANED.
- No component or route imports it
- Safe to delete after confirming build passes
- Kept as reference for prompt logic during transition

## Environment Variables Required (Vercel)
```
GEMINI_API_KEY=          # Primary AI key (used by lib/ai/client.ts)
OPENAI_API_KEY=          # Alternative AI provider
AI_PROVIDER=gemini       # or 'openai' — controls which provider lib/ai/client uses
DATABASE_URL=            # Supabase Postgres connection string
NEXTAUTH_SECRET=         # Auth secret
NEXTAUTH_URL=            # https://latimorelifelegacy.com
```

## Deploy Commands
```bash
npm install
npx prisma generate
npm run build
npx vercel --prod
```
