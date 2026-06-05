-- AlterEnum: add social event types
ALTER TYPE "EventType" ADD VALUE IF NOT EXISTS 'post_viewed';
ALTER TYPE "EventType" ADD VALUE IF NOT EXISTS 'post_created';
ALTER TYPE "EventType" ADD VALUE IF NOT EXISTS 'post_published';
ALTER TYPE "EventType" ADD VALUE IF NOT EXISTS 'reaction_added';

-- CreateEnum
DO $$ BEGIN
  CREATE TYPE "SocialProvider" AS ENUM ('linkedin', 'facebook', 'instagram', 'twitter');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- CreateEnum
DO $$ BEGIN
  CREATE TYPE "SocialPostStatus" AS ENUM ('draft', 'scheduled', 'approved', 'published', 'failed', 'archived');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- CreateEnum
DO $$ BEGIN
  CREATE TYPE "AnalyticsJobStatus" AS ENUM ('queued', 'running', 'succeeded', 'failed', 'skipped');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- CreateEnum
DO $$ BEGIN
  CREATE TYPE "PostStatus" AS ENUM ('draft', 'flagged', 'approved', 'published', 'archived');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- CreateTable: SocialConnection
CREATE TABLE IF NOT EXISTS "SocialConnection" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "provider" "SocialProvider" NOT NULL,
    "accountName" TEXT,
    "externalId" TEXT,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "tokenExpiresAt" TIMESTAMP(3),
    "metadata" JSONB,
    "status" TEXT,
    CONSTRAINT "SocialConnection_pkey" PRIMARY KEY ("id")
);

-- CreateTable: SocialAccount
CREATE TABLE IF NOT EXISTS "SocialAccount" (
    "id" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "accountName" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "accessTokenRef" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "SocialAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable: SocialPost
CREATE TABLE IF NOT EXISTS "SocialPost" (
    "id" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "accountId" TEXT,
    "externalPostId" TEXT,
    "status" "SocialPostStatus" NOT NULL DEFAULT 'draft',
    "caption" TEXT NOT NULL,
    "mediaUrls" JSONB,
    "scheduledAt" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "approvedBy" TEXT,
    "campaign" TEXT,
    "rawPublishResult" JSONB,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "SocialPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable: SocialMetric
CREATE TABLE IF NOT EXISTS "SocialMetric" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "metricDate" TIMESTAMP(3) NOT NULL,
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "reach" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "reactions" INTEGER NOT NULL DEFAULT 0,
    "comments" INTEGER NOT NULL DEFAULT 0,
    "shares" INTEGER NOT NULL DEFAULT 0,
    "saves" INTEGER NOT NULL DEFAULT 0,
    "leads" INTEGER NOT NULL DEFAULT 0,
    "conversions" INTEGER NOT NULL DEFAULT 0,
    "revenueCents" INTEGER NOT NULL DEFAULT 0,
    "raw" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SocialMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable: SocialComment
CREATE TABLE IF NOT EXISTS "SocialComment" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "externalCommentId" TEXT,
    "authorHandle" TEXT,
    "body" TEXT NOT NULL,
    "raw" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SocialComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable: AIAnalysis
CREATE TABLE IF NOT EXISTS "AIAnalysis" (
    "id" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "commentId" TEXT,
    "provider" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "sentiment" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "intent" TEXT,
    "urgency" TEXT,
    "topics" JSONB NOT NULL,
    "trendingTerms" JSONB,
    "leadPotential" TEXT,
    "complianceRisk" TEXT,
    "suggestedAction" TEXT,
    "tokenEstimate" INTEGER,
    "costEstimate" DECIMAL(10,6),
    "latencyMs" INTEGER,
    "raw" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AIAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Insight
CREATE TABLE IF NOT EXISTS "Insight" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "action" TEXT,
    "source" JSONB,
    "status" TEXT NOT NULL DEFAULT 'open',
    "postId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Insight_pkey" PRIMARY KEY ("id")
);

-- CreateTable: AutomationRule
CREATE TABLE IF NOT EXISTS "AutomationRule" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "trigger" JSONB NOT NULL,
    "condition" JSONB NOT NULL,
    "actions" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "AutomationRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable: WeeklyReport
CREATE TABLE IF NOT EXISTS "WeeklyReport" (
    "id" TEXT NOT NULL,
    "weekStart" TIMESTAMP(3) NOT NULL,
    "weekEnd" TIMESTAMP(3) NOT NULL,
    "kpis" JSONB NOT NULL,
    "insights" JSONB NOT NULL,
    "opportunities" JSONB NOT NULL,
    "recommendations" JSONB,
    "pdfUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WeeklyReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable: UploadedWorkDocument
CREATE TABLE IF NOT EXISTS "UploadedWorkDocument" (
    "id" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "storageUrl" TEXT,
    "extractedText" TEXT,
    "metadata" JSONB,
    "status" TEXT NOT NULL DEFAULT 'processed',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UploadedWorkDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable: SocialTemplate
CREATE TABLE IF NOT EXISTS "SocialTemplate" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "platform" TEXT,
    "audienceTrack" TEXT,
    "body" TEXT NOT NULL,
    "cta" TEXT,
    "hashtags" JSONB,
    "suggestedDay" TEXT,
    "suggestedTime" TEXT,
    "campaign" TEXT,
    "complianceStatus" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "SocialTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable: SocialTemplateUsage
CREATE TABLE IF NOT EXISTS "SocialTemplateUsage" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "postId" TEXT,
    "usedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "performance" JSONB,
    "notes" TEXT,
    CONSTRAINT "SocialTemplateUsage_pkey" PRIMARY KEY ("id")
);

-- CreateTable: AnalyticsDailyMetric
CREATE TABLE IF NOT EXISTS "AnalyticsDailyMetric" (
    "id" TEXT NOT NULL,
    "metricDate" TIMESTAMP(3) NOT NULL,
    "metricKey" TEXT NOT NULL,
    "value" DECIMAL(18,4) NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'count',
    "source" TEXT NOT NULL DEFAULT 'aggregation_job',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "AnalyticsDailyMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable: AnalyticsBreakdownDaily
CREATE TABLE IF NOT EXISTS "AnalyticsBreakdownDaily" (
    "id" TEXT NOT NULL,
    "metricDate" TIMESTAMP(3) NOT NULL,
    "metricKey" TEXT NOT NULL,
    "dimension" TEXT NOT NULL,
    "dimensionValue" TEXT NOT NULL,
    "value" DECIMAL(18,4) NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'count',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "AnalyticsBreakdownDaily_pkey" PRIMARY KEY ("id")
);

-- CreateTable: AnalyticsFunnelDaily
CREATE TABLE IF NOT EXISTS "AnalyticsFunnelDaily" (
    "id" TEXT NOT NULL,
    "metricDate" TIMESTAMP(3) NOT NULL,
    "funnelKey" TEXT NOT NULL DEFAULT 'lead_funnel',
    "stageKey" TEXT NOT NULL,
    "stageOrder" INTEGER NOT NULL,
    "count" INTEGER NOT NULL,
    "conversionRate" DECIMAL(8,4),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "AnalyticsFunnelDaily_pkey" PRIMARY KEY ("id")
);

-- CreateTable: AnalyticsJobRun
CREATE TABLE IF NOT EXISTS "AnalyticsJobRun" (
    "id" TEXT NOT NULL,
    "jobKey" TEXT NOT NULL,
    "status" "AnalyticsJobStatus" NOT NULL DEFAULT 'queued',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "targetStart" TIMESTAMP(3),
    "targetEnd" TIMESTAMP(3),
    "rowsProcessed" INTEGER NOT NULL DEFAULT 0,
    "error" TEXT,
    "metadata" JSONB,
    CONSTRAINT "AnalyticsJobRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable: AnalyticsTarget
CREATE TABLE IF NOT EXISTS "AnalyticsTarget" (
    "id" TEXT NOT NULL,
    "metricKey" TEXT NOT NULL,
    "period" TEXT NOT NULL DEFAULT 'weekly',
    "targetValue" DECIMAL(18,4) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "AnalyticsTarget_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Post
CREATE TABLE IF NOT EXISTS "Post" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "tags" TEXT[],
    "status" "PostStatus" NOT NULL DEFAULT 'draft',
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "createdBy" TEXT,
    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable: PostReaction
CREATE TABLE IF NOT EXISTS "PostReaction" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "emoji" TEXT NOT NULL,
    CONSTRAINT "PostReaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable: PostComment
CREATE TABLE IF NOT EXISTS "PostComment" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "postId" TEXT NOT NULL,
    "authorId" TEXT,
    "body" TEXT NOT NULL,
    CONSTRAINT "PostComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable: WorkflowTemplate
CREATE TABLE IF NOT EXISTS "WorkflowTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "triggerType" TEXT NOT NULL,
    "triggerValue" TEXT,
    "category" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isPreset" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "runCount" INTEGER NOT NULL DEFAULT 0,
    "lastRunAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "WorkflowTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable: WorkflowStep
CREATE TABLE IF NOT EXISTS "WorkflowStep" (
    "id" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "config" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "WorkflowStep_pkey" PRIMARY KEY ("id")
);

-- Indexes: SocialConnection
CREATE INDEX IF NOT EXISTS "SocialConnection_provider_idx" ON "SocialConnection"("provider");
CREATE INDEX IF NOT EXISTS "SocialConnection_externalId_idx" ON "SocialConnection"("externalId");

-- Indexes: SocialAccount
CREATE INDEX IF NOT EXISTS "SocialAccount_platform_idx" ON "SocialAccount"("platform");

-- Indexes: SocialPost
CREATE UNIQUE INDEX IF NOT EXISTS "SocialPost_platform_externalPostId_key" ON "SocialPost"("platform", "externalPostId");
CREATE INDEX IF NOT EXISTS "SocialPost_platform_idx" ON "SocialPost"("platform");
CREATE INDEX IF NOT EXISTS "SocialPost_status_idx" ON "SocialPost"("status");
CREATE INDEX IF NOT EXISTS "SocialPost_campaign_idx" ON "SocialPost"("campaign");

-- Indexes: SocialMetric
CREATE UNIQUE INDEX IF NOT EXISTS "SocialMetric_postId_metricDate_key" ON "SocialMetric"("postId", "metricDate");
CREATE INDEX IF NOT EXISTS "SocialMetric_platform_metricDate_idx" ON "SocialMetric"("platform", "metricDate");

-- Indexes: SocialComment
CREATE INDEX IF NOT EXISTS "SocialComment_postId_idx" ON "SocialComment"("postId");

-- Indexes: AIAnalysis
CREATE INDEX IF NOT EXISTS "AIAnalysis_targetType_targetId_idx" ON "AIAnalysis"("targetType", "targetId");
CREATE INDEX IF NOT EXISTS "AIAnalysis_sentiment_createdAt_idx" ON "AIAnalysis"("sentiment", "createdAt");
CREATE INDEX IF NOT EXISTS "AIAnalysis_provider_model_idx" ON "AIAnalysis"("provider", "model");

-- Indexes: Insight
CREATE INDEX IF NOT EXISTS "Insight_type_createdAt_idx" ON "Insight"("type", "createdAt");
CREATE INDEX IF NOT EXISTS "Insight_severity_status_idx" ON "Insight"("severity", "status");

-- Indexes: WeeklyReport
CREATE UNIQUE INDEX IF NOT EXISTS "WeeklyReport_weekStart_weekEnd_key" ON "WeeklyReport"("weekStart", "weekEnd");
CREATE INDEX IF NOT EXISTS "WeeklyReport_weekStart_idx" ON "WeeklyReport"("weekStart");

-- Indexes: UploadedWorkDocument
CREATE INDEX IF NOT EXISTS "UploadedWorkDocument_mimeType_idx" ON "UploadedWorkDocument"("mimeType");
CREATE INDEX IF NOT EXISTS "UploadedWorkDocument_createdAt_idx" ON "UploadedWorkDocument"("createdAt");

-- Indexes: SocialTemplate
CREATE INDEX IF NOT EXISTS "SocialTemplate_platform_category_idx" ON "SocialTemplate"("platform", "category");

-- Indexes: SocialTemplateUsage
CREATE INDEX IF NOT EXISTS "SocialTemplateUsage_templateId_idx" ON "SocialTemplateUsage"("templateId");

-- Indexes: AnalyticsDailyMetric
CREATE UNIQUE INDEX IF NOT EXISTS "AnalyticsDailyMetric_metricDate_metricKey_key" ON "AnalyticsDailyMetric"("metricDate", "metricKey");
CREATE INDEX IF NOT EXISTS "AnalyticsDailyMetric_metricKey_metricDate_idx" ON "AnalyticsDailyMetric"("metricKey", "metricDate");

-- Indexes: AnalyticsBreakdownDaily
CREATE UNIQUE INDEX IF NOT EXISTS "AnalyticsBreakdownDaily_metricDate_metricKey_dimension_dimensionValue_key" ON "AnalyticsBreakdownDaily"("metricDate", "metricKey", "dimension", "dimensionValue");
CREATE INDEX IF NOT EXISTS "AnalyticsBreakdownDaily_dimension_dimensionValue_metricDate_idx" ON "AnalyticsBreakdownDaily"("dimension", "dimensionValue", "metricDate");
CREATE INDEX IF NOT EXISTS "AnalyticsBreakdownDaily_metricKey_metricDate_idx" ON "AnalyticsBreakdownDaily"("metricKey", "metricDate");

-- Indexes: AnalyticsFunnelDaily
CREATE UNIQUE INDEX IF NOT EXISTS "AnalyticsFunnelDaily_metricDate_funnelKey_stageKey_key" ON "AnalyticsFunnelDaily"("metricDate", "funnelKey", "stageKey");
CREATE INDEX IF NOT EXISTS "AnalyticsFunnelDaily_funnelKey_metricDate_idx" ON "AnalyticsFunnelDaily"("funnelKey", "metricDate");

-- Indexes: AnalyticsJobRun
CREATE INDEX IF NOT EXISTS "AnalyticsJobRun_jobKey_startedAt_idx" ON "AnalyticsJobRun"("jobKey", "startedAt");
CREATE INDEX IF NOT EXISTS "AnalyticsJobRun_status_startedAt_idx" ON "AnalyticsJobRun"("status", "startedAt");

-- Indexes: AnalyticsTarget
CREATE UNIQUE INDEX IF NOT EXISTS "AnalyticsTarget_metricKey_period_key" ON "AnalyticsTarget"("metricKey", "period");
CREATE INDEX IF NOT EXISTS "AnalyticsTarget_active_idx" ON "AnalyticsTarget"("active");

-- Indexes: Post
CREATE UNIQUE INDEX IF NOT EXISTS "Post_slug_key" ON "Post"("slug");
CREATE INDEX IF NOT EXISTS "Post_status_publishedAt_idx" ON "Post"("status", "publishedAt");
CREATE INDEX IF NOT EXISTS "Post_deletedAt_idx" ON "Post"("deletedAt");
CREATE INDEX IF NOT EXISTS "Post_createdBy_idx" ON "Post"("createdBy");

-- Indexes: PostReaction
CREATE UNIQUE INDEX IF NOT EXISTS "PostReaction_postId_userId_emoji_key" ON "PostReaction"("postId", "userId", "emoji");
CREATE INDEX IF NOT EXISTS "PostReaction_postId_idx" ON "PostReaction"("postId");

-- Indexes: PostComment
CREATE INDEX IF NOT EXISTS "PostComment_postId_createdAt_idx" ON "PostComment"("postId", "createdAt");

-- Indexes: WorkflowTemplate
CREATE INDEX IF NOT EXISTS "WorkflowTemplate_triggerType_idx" ON "WorkflowTemplate"("triggerType");
CREATE INDEX IF NOT EXISTS "WorkflowTemplate_isActive_idx" ON "WorkflowTemplate"("isActive");
CREATE INDEX IF NOT EXISTS "WorkflowTemplate_isPreset_idx" ON "WorkflowTemplate"("isPreset");

-- Indexes: WorkflowStep
CREATE INDEX IF NOT EXISTS "WorkflowStep_workflowId_order_idx" ON "WorkflowStep"("workflowId", "order");

-- Foreign Keys
ALTER TABLE "SocialPost" DROP CONSTRAINT IF EXISTS "SocialPost_accountId_fkey";
ALTER TABLE "SocialPost" ADD CONSTRAINT "SocialPost_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "SocialAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "SocialMetric" DROP CONSTRAINT IF EXISTS "SocialMetric_postId_fkey";
ALTER TABLE "SocialMetric" ADD CONSTRAINT "SocialMetric_postId_fkey" FOREIGN KEY ("postId") REFERENCES "SocialPost"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "SocialComment" DROP CONSTRAINT IF EXISTS "SocialComment_postId_fkey";
ALTER TABLE "SocialComment" ADD CONSTRAINT "SocialComment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "SocialPost"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "AIAnalysis" DROP CONSTRAINT IF EXISTS "AIAnalysis_commentId_fkey";
ALTER TABLE "AIAnalysis" ADD CONSTRAINT "AIAnalysis_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "SocialComment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Insight" DROP CONSTRAINT IF EXISTS "Insight_postId_fkey";
ALTER TABLE "Insight" ADD CONSTRAINT "Insight_postId_fkey" FOREIGN KEY ("postId") REFERENCES "SocialPost"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "SocialTemplateUsage" DROP CONSTRAINT IF EXISTS "SocialTemplateUsage_templateId_fkey";
ALTER TABLE "SocialTemplateUsage" ADD CONSTRAINT "SocialTemplateUsage_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "SocialTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "PostReaction" DROP CONSTRAINT IF EXISTS "PostReaction_postId_fkey";
ALTER TABLE "PostReaction" ADD CONSTRAINT "PostReaction_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "PostComment" DROP CONSTRAINT IF EXISTS "PostComment_postId_fkey";
ALTER TABLE "PostComment" ADD CONSTRAINT "PostComment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "WorkflowStep" DROP CONSTRAINT IF EXISTS "WorkflowStep_workflowId_fkey";
ALTER TABLE "WorkflowStep" ADD CONSTRAINT "WorkflowStep_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "WorkflowTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
