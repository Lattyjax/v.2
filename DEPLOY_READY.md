# Deploy-ready changes

This package was updated for a safer first deploy:

- Added checked-in Prisma migration:
  - `prisma/migrations/202603060001_init/migration.sql`
  - `prisma/migrations/migration_lock.toml`
- Switched build flow to `prisma migrate deploy` instead of relying on ad-hoc `db push`
- Added `DIRECT_URL` support in `prisma/schema.prisma`
- Updated `vercel.json` to run `npm run build`
- Added scripts:
  - `npm run db:deploy`
  - `npm run db:push`
  - `npm run build:fresh-db`

Recommended Vercel env vars:
- `DATABASE_URL` = Supabase pooler / transaction URL
- `DIRECT_URL` = Supabase direct connection URL
