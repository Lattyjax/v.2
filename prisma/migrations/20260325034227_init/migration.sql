-- CreateEnum
CREATE TYPE "PipelineStage" AS ENUM ('New', 'Attempted_Contact', 'Qualified', 'Booked', 'Sold', 'Follow_Up', 'Lost');

-- CreateEnum
CREATE TYPE "ProductInterest" AS ENUM ('Mortgage_Protection', 'Final_Expense', 'Term_Life', 'Whole_Life', 'Child_Whole_Life', 'Accident', 'Critical_Illness', 'IUL', 'Annuity', 'Retirement', 'Business', 'General');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('page_view', 'cta_click', 'call_click', 'text_click', 'email_click', 'book_click', 'form_submit', 'lead_created', 'appointment_booked', 'stage_changed', 'county_selected', 'product_selected', 'lead_magnet_download');

-- CreateEnum
CREATE TYPE "ThreadChannel" AS ENUM ('sms', 'email');

-- CreateEnum
CREATE TYPE "MessageDirection" AS ENUM ('inbound', 'outbound');

-- CreateEnum
CREATE TYPE "MessageStatus" AS ENUM ('queued', 'sent', 'delivered', 'failed', 'received', 'opened', 'clicked', 'bounced');

-- CreateEnum
CREATE TYPE "AiRunStatus" AS ENUM ('queued', 'running', 'succeeded', 'failed');

-- CreateEnum
CREATE TYPE "AiRunType" AS ENUM ('daily_brief', 'draft_message', 'contact_brief', 'lead_score', 'content_generation');

-- CreateEnum
CREATE TYPE "ContentType" AS ENUM ('sms', 'email', 'social_post', 'blog', 'landing_page');

-- CreateEnum
CREATE TYPE "ContentStatus" AS ENUM ('draft', 'approved', 'scheduled', 'published', 'archived');

-- CreateEnum
CREATE TYPE "CalendarProvider" AS ENUM ('calendly', 'google', 'outlook', 'manual');

-- CreateEnum
CREATE TYPE "CalendarEventStatus" AS ENUM ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show', 'rescheduled');

-- CreateTable
CREATE TABLE "LeadSession" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "firstSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "landingPage" TEXT,
    "referrer" TEXT,
    "source" TEXT,
    "medium" TEXT,
    "campaign" TEXT,
    "term" TEXT,
    "content" TEXT,
    "county" TEXT,
    "productInterest" "ProductInterest",
    "contactId" TEXT,

    CONSTRAINT "LeadSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contact" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "email" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "fullName" TEXT,
    "phone" TEXT,
    "county" TEXT,
    "primarySource" TEXT,
    "primaryMedium" TEXT,
    "primaryCampaign" TEXT,
    "leadScore" INTEGER NOT NULL DEFAULT 0,
    "lastActivityAt" TIMESTAMP(3),
    "nextFollowUpAt" TIMESTAMP(3),
    "notesSummary" TEXT,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Inquiry" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "contactId" TEXT NOT NULL,
    "leadSessionId" TEXT,
    "stage" "PipelineStage" NOT NULL DEFAULT 'New',
    "productInterest" "ProductInterest" NOT NULL DEFAULT 'General',
    "source" TEXT,
    "medium" TEXT,
    "campaign" TEXT,
    "landingPage" TEXT,
    "county" TEXT,
    "notes" TEXT,
    "leadScore" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Inquiry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Appointment" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "contactId" TEXT NOT NULL,
    "inquiryId" TEXT,
    "bookingSource" TEXT,
    "source" TEXT,
    "medium" TEXT,
    "campaign" TEXT,
    "scheduledFor" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'Booked',
    "location" TEXT,
    "calendlyEventId" TEXT,
    "metadata" JSONB,

    CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Open',
    "dueAt" TIMESTAMP(3),
    "inquiryId" TEXT,
    "contactId" TEXT,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "eventType" "EventType" NOT NULL,
    "contactId" TEXT,
    "inquiryId" TEXT,
    "leadSessionId" TEXT,
    "pageUrl" TEXT,
    "referrer" TEXT,
    "source" TEXT,
    "medium" TEXT,
    "campaign" TEXT,
    "county" TEXT,
    "productInterest" "ProductInterest",
    "metadata" JSONB,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemEvent" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" TEXT NOT NULL,
    "contactId" TEXT,
    "inquiryId" TEXT,
    "leadSessionId" TEXT,
    "threadId" TEXT,
    "source" TEXT,
    "medium" TEXT,
    "campaign" TEXT,
    "payload" JSONB NOT NULL,
    "metadata" JSONB,

    CONSTRAINT "SystemEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConversationThread" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "contactId" TEXT NOT NULL,
    "inquiryId" TEXT,
    "channel" "ThreadChannel" NOT NULL,
    "externalId" TEXT,
    "subject" TEXT,
    "lastMessageAt" TIMESTAMP(3),
    "lastInboundAt" TIMESTAMP(3),
    "lastOutboundAt" TIMESTAMP(3),
    "isArchived" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ConversationThread_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConversationMessage" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "threadId" TEXT NOT NULL,
    "contactId" TEXT,
    "inquiryId" TEXT,
    "direction" "MessageDirection" NOT NULL,
    "channel" "ThreadChannel" NOT NULL,
    "status" "MessageStatus",
    "subject" TEXT,
    "bodyText" TEXT,
    "providerMessageId" TEXT,
    "fromAddress" TEXT,
    "toAddress" TEXT,
    "sentAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "metadata" JSONB,

    CONSTRAINT "ConversationMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiRun" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "type" "AiRunType" NOT NULL,
    "status" "AiRunStatus" NOT NULL DEFAULT 'queued',
    "model" TEXT,
    "contactId" TEXT,
    "inquiryId" TEXT,
    "input" JSONB NOT NULL,
    "output" JSONB,
    "tokensInput" INTEGER,
    "tokensOutput" INTEGER,
    "latencyMs" INTEGER,
    "error" TEXT,

    CONSTRAINT "AiRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Note" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "contactId" TEXT,
    "inquiryId" TEXT,
    "title" TEXT,
    "body" TEXT NOT NULL,
    "author" TEXT,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Note_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InquiryStageHistory" (
    "id" TEXT NOT NULL,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "inquiryId" TEXT NOT NULL,
    "fromStage" "PipelineStage",
    "toStage" "PipelineStage" NOT NULL,
    "actor" TEXT,
    "note" TEXT,

    CONSTRAINT "InquiryStageHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailLog" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "contactId" TEXT,
    "toAddr" TEXT NOT NULL,
    "fromAddr" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "template" TEXT,
    "status" TEXT NOT NULL,
    "providerId" TEXT,
    "error" TEXT,

    CONSTRAINT "EmailLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentAsset" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "type" "ContentType" NOT NULL,
    "status" "ContentStatus" NOT NULL DEFAULT 'draft',
    "channel" TEXT,
    "audience" TEXT,
    "campaign" TEXT,
    "productInterest" "ProductInterest",
    "prompt" TEXT,
    "bodyText" TEXT,
    "bodyHtml" TEXT,
    "metadata" JSONB,
    "scheduledFor" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "createdBy" TEXT,

    CONSTRAINT "ContentAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CalendarConnection" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "provider" "CalendarProvider" NOT NULL,
    "accountEmail" TEXT,
    "externalId" TEXT,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "tokenExpiresAt" TIMESTAMP(3),
    "metadata" JSONB,

    CONSTRAINT "CalendarConnection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CalendarEvent" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "contactId" TEXT,
    "inquiryId" TEXT,
    "appointmentId" TEXT,
    "provider" "CalendarProvider" NOT NULL,
    "externalId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3),
    "timezone" TEXT,
    "location" TEXT,
    "meetingUrl" TEXT,
    "status" "CalendarEventStatus" NOT NULL DEFAULT 'scheduled',
    "payload" JSONB,

    CONSTRAINT "CalendarEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LeadSession_source_medium_campaign_idx" ON "LeadSession"("source", "medium", "campaign");

-- CreateIndex
CREATE INDEX "LeadSession_county_idx" ON "LeadSession"("county");

-- CreateIndex
CREATE INDEX "LeadSession_contactId_idx" ON "LeadSession"("contactId");

-- CreateIndex
CREATE UNIQUE INDEX "Contact_email_key" ON "Contact"("email");

-- CreateIndex
CREATE INDEX "Contact_county_idx" ON "Contact"("county");

-- CreateIndex
CREATE INDEX "Contact_phone_idx" ON "Contact"("phone");

-- CreateIndex
CREATE INDEX "Contact_leadScore_idx" ON "Contact"("leadScore");

-- CreateIndex
CREATE INDEX "Contact_lastActivityAt_idx" ON "Contact"("lastActivityAt");

-- CreateIndex
CREATE INDEX "Inquiry_stage_idx" ON "Inquiry"("stage");

-- CreateIndex
CREATE INDEX "Inquiry_productInterest_idx" ON "Inquiry"("productInterest");

-- CreateIndex
CREATE INDEX "Inquiry_source_medium_campaign_idx" ON "Inquiry"("source", "medium", "campaign");

-- CreateIndex
CREATE INDEX "Inquiry_county_idx" ON "Inquiry"("county");

-- CreateIndex
CREATE INDEX "Inquiry_contactId_idx" ON "Inquiry"("contactId");

-- CreateIndex
CREATE INDEX "Inquiry_leadScore_idx" ON "Inquiry"("leadScore");

-- CreateIndex
CREATE INDEX "Appointment_scheduledFor_idx" ON "Appointment"("scheduledFor");

-- CreateIndex
CREATE INDEX "Appointment_status_idx" ON "Appointment"("status");

-- CreateIndex
CREATE INDEX "Task_status_idx" ON "Task"("status");

-- CreateIndex
CREATE INDEX "Task_dueAt_idx" ON "Task"("dueAt");

-- CreateIndex
CREATE INDEX "Event_eventType_occurredAt_idx" ON "Event"("eventType", "occurredAt");

-- CreateIndex
CREATE INDEX "Event_source_medium_campaign_idx" ON "Event"("source", "medium", "campaign");

-- CreateIndex
CREATE INDEX "Event_county_idx" ON "Event"("county");

-- CreateIndex
CREATE INDEX "Event_contactId_idx" ON "Event"("contactId");

-- CreateIndex
CREATE INDEX "Event_inquiryId_idx" ON "Event"("inquiryId");

-- CreateIndex
CREATE INDEX "Event_leadSessionId_idx" ON "Event"("leadSessionId");

-- CreateIndex
CREATE INDEX "SystemEvent_type_occurredAt_idx" ON "SystemEvent"("type", "occurredAt");

-- CreateIndex
CREATE INDEX "SystemEvent_contactId_idx" ON "SystemEvent"("contactId");

-- CreateIndex
CREATE INDEX "SystemEvent_inquiryId_idx" ON "SystemEvent"("inquiryId");

-- CreateIndex
CREATE INDEX "ConversationThread_contactId_updatedAt_idx" ON "ConversationThread"("contactId", "updatedAt");

-- CreateIndex
CREATE INDEX "ConversationThread_channel_idx" ON "ConversationThread"("channel");

-- CreateIndex
CREATE INDEX "ConversationMessage_threadId_createdAt_idx" ON "ConversationMessage"("threadId", "createdAt");

-- CreateIndex
CREATE INDEX "ConversationMessage_contactId_idx" ON "ConversationMessage"("contactId");

-- CreateIndex
CREATE INDEX "AiRun_type_createdAt_idx" ON "AiRun"("type", "createdAt");

-- CreateIndex
CREATE INDEX "AiRun_status_idx" ON "AiRun"("status");

-- CreateIndex
CREATE INDEX "AiRun_contactId_idx" ON "AiRun"("contactId");

-- CreateIndex
CREATE INDEX "Note_contactId_createdAt_idx" ON "Note"("contactId", "createdAt");

-- CreateIndex
CREATE INDEX "Note_inquiryId_createdAt_idx" ON "Note"("inquiryId", "createdAt");

-- CreateIndex
CREATE INDEX "InquiryStageHistory_inquiryId_changedAt_idx" ON "InquiryStageHistory"("inquiryId", "changedAt");

-- CreateIndex
CREATE INDEX "EmailLog_contactId_idx" ON "EmailLog"("contactId");

-- CreateIndex
CREATE INDEX "EmailLog_status_idx" ON "EmailLog"("status");

-- CreateIndex
CREATE INDEX "ContentAsset_type_status_idx" ON "ContentAsset"("type", "status");

-- CreateIndex
CREATE INDEX "ContentAsset_campaign_idx" ON "ContentAsset"("campaign");

-- CreateIndex
CREATE INDEX "ContentAsset_scheduledFor_idx" ON "ContentAsset"("scheduledFor");

-- CreateIndex
CREATE INDEX "CalendarConnection_provider_idx" ON "CalendarConnection"("provider");

-- CreateIndex
CREATE INDEX "CalendarEvent_provider_externalId_idx" ON "CalendarEvent"("provider", "externalId");

-- CreateIndex
CREATE INDEX "CalendarEvent_contactId_idx" ON "CalendarEvent"("contactId");

-- CreateIndex
CREATE INDEX "CalendarEvent_startAt_idx" ON "CalendarEvent"("startAt");

-- CreateIndex
CREATE INDEX "CalendarEvent_status_idx" ON "CalendarEvent"("status");

-- AddForeignKey
ALTER TABLE "LeadSession" ADD CONSTRAINT "LeadSession_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inquiry" ADD CONSTRAINT "Inquiry_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inquiry" ADD CONSTRAINT "Inquiry_leadSessionId_fkey" FOREIGN KEY ("leadSessionId") REFERENCES "LeadSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_inquiryId_fkey" FOREIGN KEY ("inquiryId") REFERENCES "Inquiry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_inquiryId_fkey" FOREIGN KEY ("inquiryId") REFERENCES "Inquiry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_inquiryId_fkey" FOREIGN KEY ("inquiryId") REFERENCES "Inquiry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_leadSessionId_fkey" FOREIGN KEY ("leadSessionId") REFERENCES "LeadSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SystemEvent" ADD CONSTRAINT "SystemEvent_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SystemEvent" ADD CONSTRAINT "SystemEvent_inquiryId_fkey" FOREIGN KEY ("inquiryId") REFERENCES "Inquiry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SystemEvent" ADD CONSTRAINT "SystemEvent_leadSessionId_fkey" FOREIGN KEY ("leadSessionId") REFERENCES "LeadSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SystemEvent" ADD CONSTRAINT "SystemEvent_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "ConversationThread"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationThread" ADD CONSTRAINT "ConversationThread_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationThread" ADD CONSTRAINT "ConversationThread_inquiryId_fkey" FOREIGN KEY ("inquiryId") REFERENCES "Inquiry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationMessage" ADD CONSTRAINT "ConversationMessage_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "ConversationThread"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationMessage" ADD CONSTRAINT "ConversationMessage_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationMessage" ADD CONSTRAINT "ConversationMessage_inquiryId_fkey" FOREIGN KEY ("inquiryId") REFERENCES "Inquiry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiRun" ADD CONSTRAINT "AiRun_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiRun" ADD CONSTRAINT "AiRun_inquiryId_fkey" FOREIGN KEY ("inquiryId") REFERENCES "Inquiry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_inquiryId_fkey" FOREIGN KEY ("inquiryId") REFERENCES "Inquiry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InquiryStageHistory" ADD CONSTRAINT "InquiryStageHistory_inquiryId_fkey" FOREIGN KEY ("inquiryId") REFERENCES "Inquiry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailLog" ADD CONSTRAINT "EmailLog_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalendarEvent" ADD CONSTRAINT "CalendarEvent_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalendarEvent" ADD CONSTRAINT "CalendarEvent_inquiryId_fkey" FOREIGN KEY ("inquiryId") REFERENCES "Inquiry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalendarEvent" ADD CONSTRAINT "CalendarEvent_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
