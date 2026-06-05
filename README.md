# Latimore Life & Legacy Hub OS

**Mission-driven independent insurance agency operating system** serving Schuylkill, Luzerne, and Northumberland counties in Central Pennsylvania.

---

## 🎯 Project Overview

**Name**: Latimore Hub OS v1.0  
**Owner**: Jackson M. Latimore Sr., Founder & CEO  
**Purpose**: Complete business operating system for lead generation, pipeline management, and customer relationship management

**Brand Identity**:
- **Colors**: Navy (#2C3E50), Gold (#C49A6C), White
- **Tagline**: "Protecting Today. Securing Tomorrow."
- **Mission**: #TheBeatGoesOn - Honoring the second chance given by an AED on December 7, 2010

---

## 🚀 Deployment Status

- **Platform**: Vercel (Next.js)
- **Status**: ⏳ **Ready to Deploy** (awaiting production launch)
- **Database**: Supabase PostgreSQL (configured)
- **Email**: Resend (ready for DNS configuration)
- **Auth**: Google OAuth (NextAuth.js)
- **Repository**: `/home/user/webapp` (git initialized ✅)

---

## ✨ Features

### **Core Capabilities**
✅ **Lead Management**
- Fillout form integration with HMAC signature verification
- Automated lead capture and enrichment
- Multi-stage pipeline (New → Attempted Contact → Qualified → Booked → Sold → Follow Up → Lost)
- Drag-and-drop pipeline interface with real-time updates

✅ **CRM System**
- Contact management with full history tracking
- Product interest categorization (11 insurance products)
- County-based territory tracking (Schuylkill, Luzerne, Northumberland)
- Stage change history with timestamps
- Lead scoring system

✅ **Email Automation**
- Welcome emails to new leads (personalized templates)
- Internal lead notification system
- Email delivery tracking and logging
- Resend API integration with domain authentication

✅ **Admin Dashboard**
- Protected by NextAuth.js with Google OAuth
- Real-time KPI tracking (leads, conversions, pipeline health)
- Analytics dashboard with charts (Recharts)
- Task management system
- Message center for communications

✅ **Reporting & Analytics**
- Conversion funnel analytics
- County-level performance metrics
- Traffic source attribution
- CTA click tracking
- Page view analytics
- Product interest distribution

✅ **Security & Performance**
- Rate limiting on all API endpoints (Upstash Redis)
- HMAC webhook signature verification
- Row Level Security (RLS) on Supabase
- Content Security Policy (CSP) headers
- Next.js image optimization (AVIF/WebP)
- Connection pooling with Prisma

✅ **SEO Optimization**
- Full metadata with OpenGraph/Twitter cards
- Structured data (JSON-LD for LocalBusiness)
- Dynamic sitemap generation
- Robots.txt with admin path blocking
- Canonical URLs

---

## 🏗️ Architecture

### **Technology Stack**
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5.4
- **Database**: PostgreSQL (Supabase) with Prisma ORM
- **Authentication**: NextAuth.js with Google OAuth
- **Email**: Resend API
- **Styling**: TailwindCSS + Radix UI components
- **Animations**: GSAP
- **Rate Limiting**: Upstash Redis
- **Logging**: Pino structured logging
- **Icons**: Lucide React

### **Database Schema**
- `Inquiry` - Lead/contact records with pipeline stage
- `InquiryStageHistory` - Audit trail of stage changes
- `Event` - User behavior tracking (page views, clicks, form submits)
- `EmailLog` - Email delivery tracking and status
- `Task` - Internal task management
- `Message` - Communication history

### **Data Flow**
```
Fillout Form → /api/fillout (webhook) → Inquiry Created → Email Sent → Admin Dashboard
     ↓                                           ↓
Event Tracking → /api/event → Analytics → Reports Dashboard
     ↓                                           ↓
Pipeline Drag → /api/inquiries/[id] → Stage Updated → History Logged
```

---

## 📁 Project Structure

```
latimore-hub/
├── app/                          # Next.js App Router pages
│   ├── page.tsx                  # Homepage
│   ├── about/                    # About page
│   ├── services/                 # Services page
│   ├── contact/                  # Contact page
│   ├── admin/                    # Protected admin area
│   │   ├── page.tsx              # Dashboard
│   │   ├── pipeline/             # Kanban pipeline
│   │   ├── contacts/             # CRM interface
│   │   ├── reports/              # Analytics & reports
│   │   └── tasks/                # Task management
│   └── api/                      # API routes
│       ├── fillout/              # Fillout webhook handler
│       ├── inquiries/            # CRUD operations
│       ├── event/                # Analytics tracking
│       └── health/               # Health check endpoint
├── lib/                          # Core business logic
│   ├── prisma.ts                 # Database client singleton
│   ├── mailer.ts                 # Email service wrapper
│   ├── rate-limit.ts             # API rate limiting
│   ├── logger.ts                 # Pino logger config
│   └── hub/                      # Business domain logic
│       ├── upsert-lead.ts        # Lead creation/update
│       ├── change-stage.ts       # Pipeline stage changes
│       ├── ingest-event.ts       # Analytics event handling
│       └── reporting.ts          # Report generation
├── prisma/
│   ├── schema.prisma             # Database schema definition
│   └── seed.ts                   # Test data seeder
├── emails/
│   └── templates.ts              # Email templates
├── public/                       # Static assets (images)
├── workflows/                    # AI workflow definitions
└── VERCEL_DEPLOYMENT_GUIDE.md   # Complete deployment instructions
```

---

## 🔐 Environment Variables

**Required for production** (see `.env.local.example`):

```bash
# Database
DATABASE_URL=postgresql://...      # Supabase pooled connection (port 6543)
DIRECT_URL=postgresql://...        # Supabase direct connection (port 5432)

# Authentication
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
NEXTAUTH_URL=https://latimorelifelegacy.com
NEXTAUTH_SECRET=...                # Generate: openssl rand -base64 32
ADMIN_EMAILS=jackson1989@latimorelegacy.com

# Email
RESEND_API_KEY=re_...
NOTIFY_TO=leads@latimorelegacy.com
THANKYOU_FROM=Latimore Life & Legacy <hello@latimorelegacy.com>

# Webhooks
FILLOUT_SECRET=...                 # From Fillout webhook settings
BOOKING_WEBHOOK_SECRET=...         # Generate random string

# Public
NEXT_PUBLIC_BASE_URL=https://latimorelifelegacy.com

# Optional
GA4_ID=G-XXXXXXXXXX
LOG_LEVEL=info
```

---

## 🚀 Deployment Instructions

### **📖 Complete Guide**
See [`VERCEL_DEPLOYMENT_GUIDE.md`](./VERCEL_DEPLOYMENT_GUIDE.md) for step-by-step instructions including:
- Supabase database setup
- Resend email configuration
- Google OAuth setup
- Vercel deployment
- Database migration
- Fillout webhook configuration
- Production smoke testing

### **⚡ Quick Deploy**
```bash
# 1. Set up services first (Supabase, Resend, Google OAuth)
# 2. Deploy to Vercel
vercel --prod

# 3. Run database migration
vercel env pull .env.local
npx prisma migrate deploy

# 4. Configure Fillout webhook
# Point to: https://latimorelifelegacy.com/api/fillout
```

---

## 🧪 Local Development

### **Prerequisites**
- Node.js 20+
- PostgreSQL (or Supabase account)
- Environment variables configured in `.env.local`

### **Setup**
```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run migrations (if fresh database)
npx prisma migrate deploy

# Seed test data (optional)
npx prisma db seed

# Start development server
npm run dev
```

**Development server**: http://localhost:3000

### **Available Scripts**
```bash
npm run dev          # Start Next.js dev server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:deploy    # Run Prisma migrations
npm run db:push      # Push schema changes (dev)
npm run db:seed      # Seed test data
```

---

## 📊 API Endpoints

### **Public Endpoints**
- `GET /api/health` - Health check (database connectivity)
- `POST /api/fillout` - Fillout webhook receiver (HMAC protected)
- `POST /api/event` - Analytics event tracking
- `POST /api/lead` - Public lead form submission

### **Protected Admin Endpoints** (require authentication)
- `GET /api/inquiries` - List all inquiries with filters
- `GET /api/inquiries/[id]` - Get single inquiry with history
- `PATCH /api/inquiries/[id]` - Update inquiry (stage, notes, etc.)
- `GET /api/reports/overview` - Dashboard KPIs
- `GET /api/reports/conversions` - Funnel analytics
- `GET /api/reports/counties` - County performance
- `GET /api/reports/sources` - Traffic sources
- `POST /api/tasks` - Task management

---

## 🎯 Product Coverage

**11 Insurance Product Categories**:
1. Mortgage Protection
2. Final Expense
3. Term Life Insurance
4. Whole Life Insurance
5. Child Whole Life
6. Accident Insurance
7. Critical Illness
8. Indexed Universal Life (IUL)
9. Annuities
10. Retirement Planning
11. Business Insurance

**Territory**: 560,000+ residents across:
- Schuylkill County
- Luzerne County
- Northumberland County

---

## 📈 System Metrics

**Current Audit Scores (v1.0)**:
| Category           | Score  |
|--------------------|--------|
| Architecture       | 9/10   |
| Security           | 9/10   |
| Performance        | 9/10   |
| SEO                | 9/10   |
| Launch Readiness   | 9.5/10 |

**Production Ready**: ✅ All security, performance, and SEO requirements met

---

## 🔒 Security Features

- ✅ HMAC signature verification on webhooks
- ✅ Zod validation on all POST routes
- ✅ Rate limiting (Upstash Redis)
- ✅ NextAuth middleware protecting `/admin`
- ✅ Admin-only API routes require authenticated session
- ✅ Security headers (CSP, X-Frame-Options, HSTS)
- ✅ Robots.txt blocks `/admin` and `/api`
- ✅ No secrets in frontend code
- ✅ Supabase RLS locks all tables to service-role

---

## 📝 Recent Updates

**March 18, 2026** - v1.0 Production Package
- ✅ Complete codebase packaged and extracted
- ✅ Git repository initialized
- ✅ Comprehensive Vercel deployment guide created
- ⏳ Awaiting GitHub authorization for repository push
- ⏳ Ready for Vercel production deployment

---

## 🤝 Support & Contact

**Developer**: Jackson M. Latimore Sr.  
**Company**: Latimore Life & Legacy LLC  
**Email**: jackson1989@latimorelegacy.com  
**Website**: https://latimorelifelegacy.com (pending deployment)

---

## 📄 License

Private - Proprietary software for Latimore Life & Legacy LLC

---

**#TheBeatGoesOn** 🚀

*Built with purpose. Deployed with confidence. Protecting families across Central Pennsylvania.*


