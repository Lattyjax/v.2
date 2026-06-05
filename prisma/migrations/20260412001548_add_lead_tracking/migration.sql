-- CreateEnum
CREATE TYPE "LeadSource" AS ENUM ('WEBSITE_DIRECT', 'GOOGLE_ORGANIC', 'GOOGLE_ADS', 'SOCIAL_ORGANIC', 'QR_CAMPAIGN', 'EMAIL_CAMPAIGN', 'REFERRAL', 'PARTNER_ORG', 'PHONE_INBOUND', 'SMS_INBOUND', 'EMAIL_INBOUND', 'EVENT', 'WORKSHOP', 'FILLOUT', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "LeadIntent" AS ENUM ('CONSULT', 'JOIN_PARTNERSHIP', 'JOIN_AGENT', 'JOIN_BOTH', 'QUICK_TERM', 'GENERAL_INQUIRY', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'ATTEMPTED_CONTACT', 'CONTACTED', 'QUALIFIED', 'BOOKED', 'IN_CONSULT', 'REFERRED_TO_ETHOS', 'ETHOS_APPLIED', 'ETHOS_APPROVED', 'JOIN_EXPLORING', 'JOIN_ONBOARDING', 'JOIN_ACTIVE', 'CLOSED_WON', 'CLOSED_LOST', 'NURTURE', 'ON_HOLD', 'DORMANT');

-- AlterTable
ALTER TABLE "Contact" ADD COLUMN     "currentIntent" "LeadIntent" NOT NULL DEFAULT 'UNKNOWN',
ADD COLUMN     "primaryIntent" "LeadIntent" NOT NULL DEFAULT 'UNKNOWN',
ADD COLUMN     "primarySourceType" "LeadSource" NOT NULL DEFAULT 'UNKNOWN',
ADD COLUMN     "status" "LeadStatus" NOT NULL DEFAULT 'NEW';

-- AlterTable
ALTER TABLE "Inquiry" ADD COLUMN     "intent" "LeadIntent" NOT NULL DEFAULT 'UNKNOWN',
ADD COLUMN     "sourceType" "LeadSource" NOT NULL DEFAULT 'UNKNOWN',
ADD COLUMN     "status" "LeadStatus" NOT NULL DEFAULT 'NEW';

-- CreateIndex
CREATE INDEX "Contact_primarySourceType_idx" ON "Contact"("primarySourceType");

-- CreateIndex
CREATE INDEX "Contact_primaryIntent_idx" ON "Contact"("primaryIntent");

-- CreateIndex
CREATE INDEX "Contact_currentIntent_idx" ON "Contact"("currentIntent");

-- CreateIndex
CREATE INDEX "Contact_status_idx" ON "Contact"("status");

-- CreateIndex
CREATE INDEX "Inquiry_sourceType_idx" ON "Inquiry"("sourceType");

-- CreateIndex
CREATE INDEX "Inquiry_intent_idx" ON "Inquiry"("intent");

-- CreateIndex
CREATE INDEX "Inquiry_status_idx" ON "Inquiry"("status");
