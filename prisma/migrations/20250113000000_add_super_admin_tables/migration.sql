-- CreateEnum
CREATE TYPE "SuperAdminRole" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'SUPPORT', 'ANALYST');

-- CreateEnum
CREATE TYPE "FeatureFlagType" AS ENUM ('BOOLEAN', 'STRING', 'NUMBER', 'JSON');

-- CreateEnum
CREATE TYPE "SystemRuleType" AS ENUM ('RATE_LIMIT', 'CONTENT_POLICY', 'SECURITY', 'BILLING', 'USAGE', 'COMPLIANCE', 'NOTIFICATION', 'AUTO_SUSPEND');

-- CreateEnum
CREATE TYPE "BanType" AS ENUM ('TEMPORARY', 'PERMANENT', 'SHADOW');

-- CreateEnum
CREATE TYPE "AppealStatus" AS ENUM ('NONE', 'PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "TicketCategory" AS ENUM ('BILLING', 'TECHNICAL', 'FEATURE_REQUEST', 'BUG_REPORT', 'ACCOUNT', 'SECURITY', 'OTHER');

-- CreateEnum
CREATE TYPE "TicketPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'WAITING_ON_CUSTOMER', 'WAITING_ON_INTERNAL', 'RESOLVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('HEALTHY', 'AT_RISK', 'CRITICAL');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('INFO', 'WARNING', 'ALERT', 'MAINTENANCE', 'FEATURE', 'PROMOTION');

-- CreateEnum
CREATE TYPE "NotificationTargetType" AS ENUM ('ALL', 'SPECIFIC_ORGS', 'SPECIFIC_PLANS');

-- CreateEnum
CREATE TYPE "SuspensionType" AS ENUM ('FULL', 'PARTIAL', 'BILLING_HOLD', 'INVESTIGATION');

-- CreateEnum
CREATE TYPE "ChangeType" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'REGENERATE', 'RESTORE');

-- CreateEnum
CREATE TYPE "ChangeAlertType" AS ENUM ('SIGNIFICANT_INCREASE', 'SIGNIFICANT_DECREASE', 'THRESHOLD_CROSSED', 'TREND_REVERSAL', 'NEW_DATA_AVAILABLE', 'ANALYSIS_CHANGED', 'ANOMALY_DETECTED');

-- CreateEnum
CREATE TYPE "AlertSeverity" AS ENUM ('INFO', 'WARNING', 'CRITICAL');

-- CreateTable
CREATE TABLE "ToolMemory" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "toolName" TEXT NOT NULL,
    "inputHash" TEXT NOT NULL,
    "output" JSONB NOT NULL,
    "resourceIds" TEXT[],
    "executionTimeMs" INTEGER NOT NULL DEFAULT 0,
    "tokensUsed" INTEGER NOT NULL DEFAULT 0,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "ToolMemory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SuperAdmin" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "SuperAdminRole" NOT NULL DEFAULT 'ADMIN',
    "permissions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "lastLoginIp" TEXT,
    "twoFactorSecret" TEXT,
    "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SuperAdmin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SuperAdminSession" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SuperAdminSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeatureFlag" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "FeatureFlagType" NOT NULL DEFAULT 'BOOLEAN',
    "defaultValue" JSONB NOT NULL DEFAULT 'false',
    "isEnabled" BOOLEAN NOT NULL DEFAULT false,
    "rolloutPercentage" INTEGER NOT NULL DEFAULT 0,
    "allowedOrgs" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "blockedOrgs" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "allowedPlans" "PlanTier"[] DEFAULT ARRAY[]::"PlanTier"[],
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeatureFlag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemRule" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "SystemRuleType" NOT NULL,
    "conditions" JSONB NOT NULL DEFAULT '{}',
    "actions" JSONB NOT NULL DEFAULT '{}',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "appliesTo" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "excludeOrgs" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "triggerCount" INTEGER NOT NULL DEFAULT 0,
    "lastTriggered" TIMESTAMP(3),
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserBan" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "orgId" TEXT,
    "reason" TEXT NOT NULL,
    "bannedBy" TEXT NOT NULL,
    "banType" "BanType" NOT NULL DEFAULT 'TEMPORARY',
    "expiresAt" TIMESTAMP(3),
    "appealStatus" "AppealStatus" NOT NULL DEFAULT 'NONE',
    "appealNotes" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserBan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupportTicket" (
    "id" TEXT NOT NULL,
    "ticketNumber" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "userId" TEXT,
    "subject" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "TicketCategory" NOT NULL,
    "priority" "TicketPriority" NOT NULL DEFAULT 'MEDIUM',
    "status" "TicketStatus" NOT NULL DEFAULT 'OPEN',
    "assignedTo" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "resolvedAt" TIMESTAMP(3),
    "firstResponseAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupportTicket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TicketResponse" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "responderId" TEXT NOT NULL,
    "responderType" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isInternal" BOOLEAN NOT NULL DEFAULT false,
    "attachments" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TicketResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenantHealthScore" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "overallScore" DOUBLE PRECISION NOT NULL,
    "engagementScore" DOUBLE PRECISION NOT NULL,
    "usageScore" DOUBLE PRECISION NOT NULL,
    "healthIndicators" JSONB NOT NULL DEFAULT '{}',
    "riskLevel" "RiskLevel" NOT NULL DEFAULT 'HEALTHY',
    "churnProbability" DOUBLE PRECISION,
    "recommendations" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TenantHealthScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlatformAuditLog" (
    "id" TEXT NOT NULL,
    "adminId" TEXT,
    "action" TEXT NOT NULL,
    "resourceType" TEXT NOT NULL,
    "resourceId" TEXT,
    "targetOrgId" TEXT,
    "targetUserId" TEXT,
    "details" JSONB NOT NULL DEFAULT '{}',
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlatformAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemNotification" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "targetType" "NotificationTargetType" NOT NULL DEFAULT 'ALL',
    "targetOrgs" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "targetPlans" "PlanTier"[] DEFAULT ARRAY[]::"PlanTier"[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "scheduledFor" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemNotification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemConfig" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL DEFAULT 'general',
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationSuspension" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "suspendedBy" TEXT NOT NULL,
    "suspensionType" "SuspensionType" NOT NULL DEFAULT 'FULL',
    "expiresAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrganizationSuspension_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EntityVersion" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "data" JSONB NOT NULL,
    "delta" JSONB,
    "changedFields" TEXT[],
    "changeType" "ChangeType" NOT NULL,
    "changeSummary" TEXT,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EntityVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnalysisHistory" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "analysisType" TEXT NOT NULL,
    "referenceId" TEXT NOT NULL,
    "analysisVersion" INTEGER NOT NULL,
    "results" JSONB NOT NULL,
    "aiInsights" TEXT[],
    "keyMetrics" JSONB NOT NULL,
    "confidence" DOUBLE PRECISION,
    "dataSourceDate" TIMESTAMP(3),
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnalysisHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChangeSummary" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "summaryType" TEXT NOT NULL,
    "metrics" JSONB NOT NULL,
    "highlights" JSONB NOT NULL,
    "newItems" INTEGER NOT NULL DEFAULT 0,
    "updatedItems" INTEGER NOT NULL DEFAULT 0,
    "deletedItems" INTEGER NOT NULL DEFAULT 0,
    "significantChanges" INTEGER NOT NULL DEFAULT 0,
    "topChanges" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChangeSummary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserChangeTracker" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lastVisit" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenChanges" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "preferences" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserChangeTracker_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChangeAlert" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "alertType" "ChangeAlertType" NOT NULL,
    "severity" "AlertSeverity" NOT NULL DEFAULT 'INFO',
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "metric" TEXT,
    "previousValue" JSONB,
    "currentValue" JSONB,
    "changePercent" DOUBLE PRECISION,
    "threshold" DOUBLE PRECISION,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "isDismissed" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChangeAlert_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ToolMemory_orgId_sessionId_idx" ON "ToolMemory"("orgId", "sessionId");

-- CreateIndex
CREATE INDEX "ToolMemory_toolName_inputHash_idx" ON "ToolMemory"("toolName", "inputHash");

-- CreateIndex
CREATE INDEX "ToolMemory_sessionId_createdAt_idx" ON "ToolMemory"("sessionId", "createdAt");

-- CreateIndex
CREATE INDEX "ToolMemory_expiresAt_idx" ON "ToolMemory"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "SuperAdmin_email_key" ON "SuperAdmin"("email");

-- CreateIndex
CREATE INDEX "SuperAdmin_email_idx" ON "SuperAdmin"("email");

-- CreateIndex
CREATE INDEX "SuperAdmin_role_idx" ON "SuperAdmin"("role");

-- CreateIndex
CREATE UNIQUE INDEX "SuperAdminSession_token_key" ON "SuperAdminSession"("token");

-- CreateIndex
CREATE INDEX "SuperAdminSession_adminId_idx" ON "SuperAdminSession"("adminId");

-- CreateIndex
CREATE INDEX "SuperAdminSession_token_idx" ON "SuperAdminSession"("token");

-- CreateIndex
CREATE UNIQUE INDEX "FeatureFlag_key_key" ON "FeatureFlag"("key");

-- CreateIndex
CREATE INDEX "FeatureFlag_key_idx" ON "FeatureFlag"("key");

-- CreateIndex
CREATE INDEX "FeatureFlag_isEnabled_idx" ON "FeatureFlag"("isEnabled");

-- CreateIndex
CREATE INDEX "SystemRule_type_idx" ON "SystemRule"("type");

-- CreateIndex
CREATE INDEX "SystemRule_isActive_idx" ON "SystemRule"("isActive");

-- CreateIndex
CREATE INDEX "SystemRule_priority_idx" ON "SystemRule"("priority");

-- CreateIndex
CREATE INDEX "UserBan_userId_idx" ON "UserBan"("userId");

-- CreateIndex
CREATE INDEX "UserBan_orgId_idx" ON "UserBan"("orgId");

-- CreateIndex
CREATE INDEX "UserBan_banType_idx" ON "UserBan"("banType");

-- CreateIndex
CREATE INDEX "UserBan_expiresAt_idx" ON "UserBan"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "SupportTicket_ticketNumber_key" ON "SupportTicket"("ticketNumber");

-- CreateIndex
CREATE INDEX "SupportTicket_orgId_idx" ON "SupportTicket"("orgId");

-- CreateIndex
CREATE INDEX "SupportTicket_userId_idx" ON "SupportTicket"("userId");

-- CreateIndex
CREATE INDEX "SupportTicket_status_idx" ON "SupportTicket"("status");

-- CreateIndex
CREATE INDEX "SupportTicket_priority_idx" ON "SupportTicket"("priority");

-- CreateIndex
CREATE INDEX "SupportTicket_assignedTo_idx" ON "SupportTicket"("assignedTo");

-- CreateIndex
CREATE INDEX "SupportTicket_ticketNumber_idx" ON "SupportTicket"("ticketNumber");

-- CreateIndex
CREATE INDEX "TicketResponse_ticketId_idx" ON "TicketResponse"("ticketId");

-- CreateIndex
CREATE INDEX "TicketResponse_responderId_idx" ON "TicketResponse"("responderId");

-- CreateIndex
CREATE INDEX "TenantHealthScore_orgId_idx" ON "TenantHealthScore"("orgId");

-- CreateIndex
CREATE INDEX "TenantHealthScore_riskLevel_idx" ON "TenantHealthScore"("riskLevel");

-- CreateIndex
CREATE INDEX "TenantHealthScore_calculatedAt_idx" ON "TenantHealthScore"("calculatedAt");

-- CreateIndex
CREATE INDEX "PlatformAuditLog_adminId_idx" ON "PlatformAuditLog"("adminId");

-- CreateIndex
CREATE INDEX "PlatformAuditLog_action_idx" ON "PlatformAuditLog"("action");

-- CreateIndex
CREATE INDEX "PlatformAuditLog_resourceType_idx" ON "PlatformAuditLog"("resourceType");

-- CreateIndex
CREATE INDEX "PlatformAuditLog_targetOrgId_idx" ON "PlatformAuditLog"("targetOrgId");

-- CreateIndex
CREATE INDEX "PlatformAuditLog_targetUserId_idx" ON "PlatformAuditLog"("targetUserId");

-- CreateIndex
CREATE INDEX "PlatformAuditLog_timestamp_idx" ON "PlatformAuditLog"("timestamp");

-- CreateIndex
CREATE INDEX "SystemNotification_type_idx" ON "SystemNotification"("type");

-- CreateIndex
CREATE INDEX "SystemNotification_isActive_idx" ON "SystemNotification"("isActive");

-- CreateIndex
CREATE INDEX "SystemNotification_scheduledFor_idx" ON "SystemNotification"("scheduledFor");

-- CreateIndex
CREATE UNIQUE INDEX "SystemConfig_key_key" ON "SystemConfig"("key");

-- CreateIndex
CREATE INDEX "SystemConfig_key_idx" ON "SystemConfig"("key");

-- CreateIndex
CREATE INDEX "SystemConfig_category_idx" ON "SystemConfig"("category");

-- CreateIndex
CREATE INDEX "OrganizationSuspension_orgId_idx" ON "OrganizationSuspension"("orgId");

-- CreateIndex
CREATE INDEX "OrganizationSuspension_isActive_idx" ON "OrganizationSuspension"("isActive");

-- CreateIndex
CREATE INDEX "OrganizationSuspension_expiresAt_idx" ON "OrganizationSuspension"("expiresAt");

-- CreateIndex
CREATE INDEX "EntityVersion_orgId_idx" ON "EntityVersion"("orgId");

-- CreateIndex
CREATE INDEX "EntityVersion_orgId_entityType_idx" ON "EntityVersion"("orgId", "entityType");

-- CreateIndex
CREATE INDEX "EntityVersion_entityType_entityId_idx" ON "EntityVersion"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "EntityVersion_createdAt_idx" ON "EntityVersion"("createdAt");

-- CreateIndex
CREATE INDEX "EntityVersion_createdBy_idx" ON "EntityVersion"("createdBy");

-- CreateIndex
CREATE UNIQUE INDEX "EntityVersion_entityType_entityId_version_key" ON "EntityVersion"("entityType", "entityId", "version");

-- CreateIndex
CREATE INDEX "AnalysisHistory_orgId_idx" ON "AnalysisHistory"("orgId");

-- CreateIndex
CREATE INDEX "AnalysisHistory_orgId_analysisType_idx" ON "AnalysisHistory"("orgId", "analysisType");

-- CreateIndex
CREATE INDEX "AnalysisHistory_analysisType_referenceId_idx" ON "AnalysisHistory"("analysisType", "referenceId");

-- CreateIndex
CREATE INDEX "AnalysisHistory_createdAt_idx" ON "AnalysisHistory"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "AnalysisHistory_analysisType_referenceId_analysisVersion_key" ON "AnalysisHistory"("analysisType", "referenceId", "analysisVersion");

-- CreateIndex
CREATE INDEX "ChangeSummary_orgId_idx" ON "ChangeSummary"("orgId");

-- CreateIndex
CREATE INDEX "ChangeSummary_orgId_period_idx" ON "ChangeSummary"("orgId", "period");

-- CreateIndex
CREATE INDEX "ChangeSummary_periodStart_periodEnd_idx" ON "ChangeSummary"("periodStart", "periodEnd");

-- CreateIndex
CREATE UNIQUE INDEX "ChangeSummary_orgId_period_periodStart_summaryType_key" ON "ChangeSummary"("orgId", "period", "periodStart", "summaryType");

-- CreateIndex
CREATE INDEX "UserChangeTracker_orgId_idx" ON "UserChangeTracker"("orgId");

-- CreateIndex
CREATE INDEX "UserChangeTracker_userId_idx" ON "UserChangeTracker"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserChangeTracker_orgId_userId_key" ON "UserChangeTracker"("orgId", "userId");

-- CreateIndex
CREATE INDEX "ChangeAlert_orgId_idx" ON "ChangeAlert"("orgId");

-- CreateIndex
CREATE INDEX "ChangeAlert_orgId_entityType_idx" ON "ChangeAlert"("orgId", "entityType");

-- CreateIndex
CREATE INDEX "ChangeAlert_orgId_isRead_idx" ON "ChangeAlert"("orgId", "isRead");

-- CreateIndex
CREATE INDEX "ChangeAlert_orgId_alertType_idx" ON "ChangeAlert"("orgId", "alertType");

-- CreateIndex
CREATE INDEX "ChangeAlert_createdAt_idx" ON "ChangeAlert"("createdAt");

-- AddForeignKey
ALTER TABLE "SuperAdminSession" ADD CONSTRAINT "SuperAdminSession_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "SuperAdmin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketResponse" ADD CONSTRAINT "TicketResponse_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "SupportTicket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlatformAuditLog" ADD CONSTRAINT "PlatformAuditLog_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "SuperAdmin"("id") ON DELETE SET NULL ON UPDATE CASCADE;
