# Global Nav CTA Update

Patched site navigation to make **Join Our Team** a persistent CTA button across desktop and mobile.

## Changes
- `app/_components/site-shell.tsx`
  - Styled `/join` as a gold CTA button in desktop nav
  - Added `/pahs` as a secondary outline CTA labeled `Get Covered`
  - Kept sticky header behavior intact
- `app/_components/mobile-nav.tsx`
  - Styled `/join` as a gold CTA button in mobile menu
  - Added `/pahs` as a secondary outline CTA labeled `Get Covered`

## Result
- Global nav now highlights recruiting and coverage funnels on every page using `SiteHeader`.
