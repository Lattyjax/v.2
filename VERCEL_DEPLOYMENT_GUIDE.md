# 🚀 Latimore Hub OS - Complete Vercel Deployment Guide

**Mission**: Get your Latimore Life & Legacy Hub OS live on Vercel with full functionality

---

## ✅ Pre-Deployment Checklist

- [x] Git repository initialized with all files committed
- [ ] GitHub repository created and code pushed
- [ ] Supabase PostgreSQL database created
- [ ] Resend email service configured
- [ ] Google OAuth credentials created
- [ ] Vercel project created and deployed
- [ ] Environment variables configured
- [ ] Fillout webhook configured
- [ ] Production smoke test completed

---

## 📋 Step-by-Step Deployment

### **Step 1: Supabase Database Setup** (15 minutes)

#### 1.1 Create New Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Click **"New Project"**
3. **Organization**: Select or create one
4. **Project Name**: `latimore-hub-production`
5. **Database Password**: Generate strong password (save securely!)
6. **Region**: Choose closest to Pennsylvania (us-east-1 recommended)
7. Click **"Create new project"** (takes ~2 minutes)

#### 1.2 Get Database Connection Strings
1. In Supabase dashboard, go to **Settings → Database**
2. Scroll to **"Connection String"** section
3. Copy **TWO URLs**:

   **A) Pooled Connection (Transaction Mode)** - Port 6543
   ```
   postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
   ```
   → Save as `DATABASE_URL` (for runtime)

   **B) Direct Connection** - Port 5432
   ```
   postgresql://postgres.[PROJECT_REF]:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
   ```
   → Save as `DIRECT_URL` (for migrations)

#### 1.3 Apply Database Schema
You'll do this AFTER Vercel deployment using Vercel CLI:
```bash
# Install Vercel CLI (if not already installed)
npm i -g vercel

# Login to Vercel
vercel login

# Link to your Vercel project
vercel link

# Run Prisma migration (this creates all tables)
vercel env pull .env.local
npx prisma migrate deploy
```

#### 1.4 Apply Row Level Security (RLS)
1. In Supabase dashboard, go to **SQL Editor**
2. Click **"New Query"**
3. Open `/home/user/webapp/supabase-rls.sql` in your local editor
4. Copy all SQL content
5. Paste into Supabase SQL Editor
6. Click **"Run"** (bottom right)
7. Verify: Should see "Success. No rows returned"

---

### **Step 2: Resend Email Service Setup** (20 minutes)

#### 2.1 Create Resend Account
1. Go to [resend.com](https://resend.com)
2. Sign up with email
3. Verify email address

#### 2.2 Add Your Domain
1. In Resend dashboard, click **"Domains"**
2. Click **"Add Domain"**
3. Enter: `latimorelegacy.com`
4. Click **"Add"**

#### 2.3 Configure DNS Records
**You need to add 4 DNS records to your domain registrar:**

| Type  | Name/Host           | Value                                    | Priority |
|-------|---------------------|------------------------------------------|----------|
| TXT   | `@` or root         | `v=spf1 include:_spf.resend.com ~all`    | -        |
| CNAME | `resend._domainkey` | `resend._domainkey.resend.com`           | -        |
| CNAME | `resend2._domainkey`| `resend2._domainkey.resend.com`          | -        |
| TXT   | `_dmarc`            | `v=DMARC1; p=none; rua=mailto:jackson1989@latimorelegacy.com` | - |

**DNS Provider Instructions:**
- **GoDaddy**: DNS Management → Add Record
- **Namecheap**: Advanced DNS → Add New Record
- **Cloudflare**: DNS → Add Record

**Verification Time**: 15-60 minutes (DNS propagation)

#### 2.4 Get API Key
1. In Resend dashboard, go to **"API Keys"**
2. Click **"Create API Key"**
3. **Name**: `Latimore Hub Production`
4. **Permission**: Full Access
5. Click **"Add"**
6. **COPY THE KEY** (starts with `re_`) - you won't see it again
7. Save securely → This is your `RESEND_API_KEY`

---

### **Step 3: Google OAuth Setup** (10 minutes)

#### 3.1 Create OAuth Credentials
1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Select project or create new: **"Latimore Hub"**
3. Navigate: **APIs & Services → Credentials**
4. Click **"Create Credentials" → "OAuth client ID"**
5. **Application type**: Web application
6. **Name**: `Latimore Hub Production`

#### 3.2 Configure Authorized URLs
**Authorized JavaScript origins:**
```
https://latimorelifelegacy.com
```

**Authorized redirect URIs:**
```
https://latimorelifelegacy.com/api/auth/callback/google
```

#### 3.3 Save Credentials
1. Click **"Create"**
2. **Copy Client ID** → Save as `GOOGLE_CLIENT_ID`
3. **Copy Client Secret** → Save as `GOOGLE_CLIENT_SECRET`

---

### **Step 4: Vercel Deployment** (15 minutes)

#### 4.1 Connect GitHub Repository
1. Go to [vercel.com](https://vercel.com)
2. Click **"Add New..." → "Project"**
3. **Import Git Repository**:
   - Connect GitHub account if needed
   - Select your `latimore-hub` repository
4. Click **"Import"**

#### 4.2 Configure Project Settings
**Framework Preset**: Next.js (auto-detected) ✅
**Root Directory**: `./` (leave default) ✅
**Build Command**: `npm run build` (auto-detected) ✅
**Output Directory**: `.next` (auto-detected) ✅

#### 4.3 Add Environment Variables
Click **"Environment Variables"** and add these:

```bash
# ─── Database (from Supabase Step 1.2) ───────────────────────────
DATABASE_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres"

# ─── NextAuth (generate secret below) ────────────────────────────
NEXTAUTH_URL="https://latimorelifelegacy.com"
NEXTAUTH_SECRET="<GENERATE_THIS>"
ADMIN_EMAILS="jackson1989@latimorelegacy.com"

# ─── Google OAuth (from Step 3.3) ────────────────────────────────
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"

# ─── Resend Email (from Step 2.4) ────────────────────────────────
RESEND_API_KEY="re_xxxxxxxxxxxx"
NOTIFY_TO="leads@latimorelegacy.com"
THANKYOU_FROM="Latimore Life & Legacy <hello@latimorelegacy.com>"

# ─── Fillout Webhook (get after first deploy) ────────────────────
FILLOUT_SECRET="<GET_FROM_FILLOUT>"

# ─── Booking Webhook Secret (generate random) ─────────────────────
BOOKING_WEBHOOK_SECRET="<GENERATE_RANDOM>"

# ─── Public URL ───────────────────────────────────────────────────
NEXT_PUBLIC_BASE_URL="https://latimorelifelegacy.com"

# ─── Optional: Analytics & Logging ────────────────────────────────
GA4_ID="G-XXXXXXXXXX"
LOG_LEVEL="info"
ALLOW_GMAIL_DEV="false"
```

#### 4.4 Generate Secrets
Open terminal and run:
```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Generate BOOKING_WEBHOOK_SECRET (or use same as above)
openssl rand -base64 32
```

Copy outputs and paste into Vercel env vars.

#### 4.5 Deploy
1. Click **"Deploy"** button
2. Wait for build (~2-3 minutes)
3. **First deploy will show errors** - this is expected (needs database migration)

---

### **Step 5: Database Migration** (5 minutes)

#### 5.1 Install Vercel CLI Locally
```bash
npm i -g vercel
```

#### 5.2 Link to Your Project
```bash
vercel login
cd /home/user/webapp
vercel link
```
Follow prompts:
- **Scope**: Your account
- **Link to existing project?**: Yes
- **Project**: latimore-hub (or your project name)

#### 5.3 Pull Environment Variables
```bash
vercel env pull .env.local
```
This downloads all env vars to local file.

#### 5.4 Run Prisma Migration
```bash
npx prisma migrate deploy
```
This creates all database tables in Supabase.

#### 5.5 Optional: Seed Test Data
```bash
npx prisma db seed
```

#### 5.6 Trigger Redeploy
```bash
vercel --prod
```
Or in Vercel dashboard: **Deployments → Click "..." → Redeploy**

---

### **Step 6: Fillout Webhook Configuration** (5 minutes)

#### 6.1 Get Webhook URL
Your webhook URL is:
```
https://latimorelifelegacy.com/api/fillout
```

#### 6.2 Configure in Fillout
1. Go to [fillout.com](https://fillout.com)
2. Open your form: **ID `tMz7ZcqpaZus`**
3. Go to **Settings → Webhooks**
4. Click **"Add Webhook"**
5. **URL**: `https://latimorelifelegacy.com/api/fillout`
6. **Events**: Select all (or at minimum: form_response)
7. Click **"Save"**

#### 6.3 Get Signing Secret
1. In webhook settings, find **"Signing Secret"**
2. Click **"Reveal"** or **"Copy"**
3. Go back to Vercel → **Settings → Environment Variables**
4. Edit `FILLOUT_SECRET` and paste the signing secret
5. **Redeploy** (required for env var changes)

---

### **Step 7: Custom Domain Setup** (Optional - 10 minutes)

#### 7.1 Add Domain in Vercel
1. In Vercel project, go to **Settings → Domains**
2. Click **"Add"**
3. Enter: `latimorelifelegacy.com`
4. Click **"Add"**

#### 7.2 Configure DNS
Vercel will show you DNS records to add:

**Option A: Vercel Nameservers (Recommended)**
- Point your domain's nameservers to Vercel
- Vercel manages all DNS

**Option B: CNAME/A Records**
- Keep existing nameservers
- Add Vercel's A record: `76.76.21.21`
- Add CNAME for www: `cname.vercel-dns.com`

#### 7.3 Wait for Verification
- DNS propagation: 15 minutes - 48 hours
- Vercel auto-provisions SSL certificate

#### 7.4 Update Environment Variables
Once domain is active:
1. Update `NEXTAUTH_URL` to `https://latimorelifelegacy.com`
2. Update `NEXT_PUBLIC_BASE_URL` to `https://latimorelifelegacy.com`
3. Redeploy

---

## 🧪 Step 8: Production Smoke Test

Run through this checklist to verify everything works:

### Health Check
```bash
curl https://latimorelifelegacy.com/api/health
```
**Expected**: `{"ok":true,"db":"connected"}`

### Public Pages
- [ ] Homepage loads: `https://latimorelifelegacy.com`
- [ ] About page: `https://latimorelifelegacy.com/about`
- [ ] Services page: `https://latimorelifelegacy.com/services`
- [ ] Contact page: `https://latimorelifelegacy.com/contact`
- [ ] Sitemap: `https://latimorelifelegacy.com/sitemap.xml`
- [ ] Robots: `https://latimorelifelegacy.com/robots.txt`

### Form Submission Test
1. Go to your Fillout form
2. Submit a test entry with your email
3. Check Supabase database: Should see new `Inquiry` record
4. Check email: 
   - [ ] Notification to `leads@latimorelegacy.com`
   - [ ] Thank you to your test email

### Admin Panel Test
1. Go to `https://latimorelifelegacy.com/admin/login`
2. Sign in with Google (using `jackson1989@latimorelegacy.com`)
3. [ ] Dashboard loads with stats
4. [ ] Pipeline page shows test inquiry
5. [ ] Drag test inquiry to different stage → Updates successfully
6. [ ] Reports page loads with charts
7. [ ] Contact detail page opens

### Security Headers Check
1. Go to [securityheaders.com](https://securityheaders.com)
2. Enter: `https://latimorelifelegacy.com`
3. Run scan
4. **Target**: A or A+ rating

---

## 🔧 Post-Deployment Configuration

### Email Forwarding
Set up email forwarding for notification email:
- `leads@latimorelegacy.com` → Forward to your Gmail/Outlook

### Google Analytics (Optional)
1. Create GA4 property at [analytics.google.com](https://analytics.google.com)
2. Copy Measurement ID (G-XXXXXXXXXX)
3. Add to Vercel env vars as `GA4_ID`
4. Redeploy

### Monitoring Setup (Optional)
Consider setting up:
- **Vercel Analytics**: Built-in, enable in project settings
- **Sentry**: Error tracking (requires code integration)
- **UptimeRobot**: Uptime monitoring (free tier available)

---

## 🐛 Troubleshooting

### Build Fails with "Prisma Client Not Generated"
```bash
# Locally:
npm run postinstall

# Then redeploy
vercel --prod
```

### Database Connection Errors
- Verify `DATABASE_URL` uses port **6543** (pooled connection)
- Verify `DIRECT_URL` uses port **5432** (direct connection)
- Check Supabase project is not paused (free tier pauses after 7 days inactivity)

### OAuth "Redirect URI Mismatch"
- Verify authorized redirect URI in Google Console exactly matches:
  `https://latimorelifelegacy.com/api/auth/callback/google`
- No trailing slash
- HTTPS required

### Email Not Sending
- Check Resend domain verification status (must be green checkmark)
- Verify DNS records are correct
- Check Vercel logs for email errors
- Verify `RESEND_API_KEY` is correct

### Admin Access Denied
- Verify email in `ADMIN_EMAILS` matches Google sign-in email exactly
- Check for typos or extra spaces
- Must use domain email (not Gmail) unless `ALLOW_GMAIL_DEV=true`

### Webhook Not Receiving Data
- Verify `FILLOUT_SECRET` matches Fillout's signing secret
- Check Vercel logs for webhook errors
- Test webhook manually using curl:
```bash
curl -X POST https://latimorelifelegacy.com/api/fillout \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

---

## 📊 Success Metrics

Once deployed, your system tracks:
- ✅ **Lead Generation**: Form submissions via Fillout
- ✅ **Pipeline Management**: Drag-and-drop stages in `/admin/pipeline`
- ✅ **Email Automation**: Welcome emails + lead notifications
- ✅ **Analytics**: Page views, CTA clicks, conversion tracking
- ✅ **Appointment Booking**: Integration-ready endpoints
- ✅ **Contact Management**: Full CRM in `/admin/contacts`
- ✅ **Reporting**: County-level, source, and conversion reports

---

## 🎯 Next Steps After Deployment

1. **Test All Flows**: Submit test forms, check emails, verify admin panel
2. **Update Fillout Form**: Point to production URLs if needed
3. **Configure Email Templates**: Customize in `emails/templates.ts` if needed
4. **Set Up Backups**: Supabase has automatic backups (check schedule)
5. **Monitor Performance**: Check Vercel analytics daily for first week
6. **Launch Marketing**: Share your live URL! 🚀

---

## 📞 Support Resources

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Next.js Docs**: [nextjs.org/docs](https://nextjs.org/docs)
- **Prisma Docs**: [prisma.io/docs](https://prisma.io/docs)
- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **Resend Docs**: [resend.com/docs](https://resend.com/docs)

---

**#TheBeatGoesOn** 🚀

*Your Latimore Hub OS is production-ready. Let's get it live!*
