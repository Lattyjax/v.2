This package includes a best-effort Latimore Hub OS upgrade on top of the uploaded repository.

Included:
- Expanded Prisma schema for CRM messaging, AI runs, content, and calendar events
- AI API routes:
  - /api/ai/daily-brief
  - /api/ai/contact-brief
  - /api/ai/draft-message
  - /api/ai/lead-score
- Messaging send route:
  - /api/messages/send
- Content routes:
  - /api/content/generate
  - /api/content/schedule
  - /api/content/publish
- Calendar routes:
  - /api/calendar/calendly/webhook
  - /api/calendar/book
  - /api/cron/appointment-reminders
- Admin pages:
  - /admin
  - /admin/contacts
  - /admin/contacts/[id]
  - /admin/messages
  - /admin/analytics
  - /admin/ai-advisor
  - /admin/content
  - /admin/calendar
- Seed file:
  - prisma/seed.ts

Before running:
1. npm install
2. Configure environment variables
3. Run prisma generate
4. Run prisma db push or prisma migrate dev
5. Run npm run db:seed
6. Run npm run dev

Important:
- I did not execute a full dependency install/build in this environment.
- Some routes assume valid provider credentials for OpenAI, Twilio, Resend, and auth.
- Calendly signature verification was not added in this package.
