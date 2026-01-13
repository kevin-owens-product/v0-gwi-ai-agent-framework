-- =====================================================
-- ENTERPRISE PLATFORM TABLES MIGRATION
-- Adds Security Center, Compliance, Platform Operations,
-- API Management, and Analytics tables
-- =====================================================

-- ==================== ENUMS ====================

-- Security Policy Types
CREATE TYPE "SecurityPolicyType" AS ENUM ('PASSWORD', 'SESSION', 'MFA', 'IP_ALLOWLIST', 'DATA_ACCESS', 'FILE_SHARING', 'EXTERNAL_SHARING', 'DLP', 'ENCRYPTION', 'DEVICE_TRUST', 'API_ACCESS', 'RETENTION');

CREATE TYPE "SecurityPolicyScope" AS ENUM ('PLATFORM', 'ENTERPRISE_ONLY', 'SPECIFIC_ORGS', 'SPECIFIC_PLANS');

CREATE TYPE "EnforcementMode" AS ENUM ('MONITOR', 'WARN', 'ENFORCE', 'STRICT');

CREATE TYPE "SecurityViolationType" AS ENUM ('WEAK_PASSWORD', 'FAILED_MFA', 'SUSPICIOUS_LOGIN', 'IP_BLOCKED', 'UNAUTHORIZED_ACCESS', 'DATA_EXFILTRATION', 'FILE_POLICY_VIOLATION', 'EXTERNAL_SHARING_BLOCKED', 'SESSION_VIOLATION', 'DEVICE_NOT_COMPLIANT', 'API_ABUSE', 'RATE_LIMIT_EXCEEDED', 'BRUTE_FORCE_DETECTED', 'IMPOSSIBLE_TRAVEL', 'ANOMALOUS_BEHAVIOR');

CREATE TYPE "ViolationStatus" AS ENUM ('OPEN', 'INVESTIGATING', 'RESOLVED', 'FALSE_POSITIVE', 'ESCALATED');

CREATE TYPE "ThreatEventType" AS ENUM ('BRUTE_FORCE', 'CREDENTIAL_STUFFING', 'PHISHING_ATTEMPT', 'ACCOUNT_TAKEOVER', 'DATA_BREACH', 'MALWARE_DETECTED', 'RANSOMWARE', 'DLP_VIOLATION', 'INSIDER_THREAT', 'API_ABUSE', 'BOT_ATTACK', 'DDOS_ATTEMPT', 'SUSPICIOUS_ACTIVITY', 'COMPLIANCE_VIOLATION');

CREATE TYPE "ThreatStatus" AS ENUM ('ACTIVE', 'CONTAINED', 'MITIGATED', 'RESOLVED', 'FALSE_POSITIVE');

CREATE TYPE "IPBlockType" AS ENUM ('MANUAL', 'AUTOMATIC', 'THREAT_INTEL', 'BRUTE_FORCE', 'GEOGRAPHIC');

-- Compliance Types
CREATE TYPE "AttestationStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'PENDING_REVIEW', 'COMPLIANT', 'NON_COMPLIANT', 'EXPIRED');

CREATE TYPE "AuditType" AS ENUM ('INTERNAL', 'EXTERNAL', 'REGULATORY', 'CUSTOMER_REQUESTED');

CREATE TYPE "ComplianceAuditStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'PENDING_REVIEW', 'COMPLETED', 'CANCELLED');

CREATE TYPE "LegalHoldStatus" AS ENUM ('ACTIVE', 'RELEASED', 'EXPIRED', 'PENDING_RELEASE');

CREATE TYPE "DataExportType" AS ENUM ('GDPR_REQUEST', 'LEGAL_DISCOVERY', 'USER_DATA_REQUEST', 'ADMIN_EXPORT', 'BACKUP', 'MIGRATION');

CREATE TYPE "DataExportStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'EXPIRED', 'CANCELLED');

CREATE TYPE "DeleteAction" AS ENUM ('SOFT_DELETE', 'HARD_DELETE', 'ARCHIVE', 'ANONYMIZE');

-- Platform Operations Types
CREATE TYPE "IncidentSeverity" AS ENUM ('MINOR', 'MODERATE', 'MAJOR', 'CRITICAL');

CREATE TYPE "IncidentStatus" AS ENUM ('INVESTIGATING', 'IDENTIFIED', 'MONITORING', 'RESOLVED', 'POSTMORTEM');

CREATE TYPE "IncidentType" AS ENUM ('OUTAGE', 'DEGRADATION', 'SECURITY', 'DATA_ISSUE', 'THIRD_PARTY', 'CAPACITY', 'NETWORK', 'DATABASE');

CREATE TYPE "MaintenanceType" AS ENUM ('SCHEDULED', 'EMERGENCY', 'UPGRADE', 'MIGRATION', 'SECURITY_PATCH');

CREATE TYPE "MaintenanceStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'EXTENDED');

CREATE TYPE "ReleaseType" AS ENUM ('MAJOR', 'MINOR', 'PATCH', 'HOTFIX');

CREATE TYPE "ReleaseStatus" AS ENUM ('PLANNED', 'IN_DEVELOPMENT', 'STAGING', 'ROLLING_OUT', 'COMPLETED', 'ROLLBACK', 'CANCELLED');

CREATE TYPE "RolloutStrategy" AS ENUM ('BIG_BANG', 'STAGED', 'CANARY', 'BLUE_GREEN', 'RING');

CREATE TYPE "CapacityStatus" AS ENUM ('NORMAL', 'WARNING', 'CRITICAL', 'OVER_CAPACITY');

-- Domain & Identity Types
CREATE TYPE "DomainStatus" AS ENUM ('PENDING', 'VERIFIED', 'FAILED', 'EXPIRED');

CREATE TYPE "DomainVerificationMethod" AS ENUM ('DNS_TXT', 'DNS_CNAME', 'META_TAG', 'FILE_UPLOAD');

CREATE TYPE "SSOProvider" AS ENUM ('SAML', 'OIDC', 'AZURE_AD', 'OKTA', 'GOOGLE_WORKSPACE', 'ONELOGIN', 'PING_IDENTITY', 'CUSTOM');

CREATE TYPE "SSOStatus" AS ENUM ('CONFIGURING', 'TESTING', 'ACTIVE', 'DISABLED', 'ERROR');

CREATE TYPE "SCIMStatus" AS ENUM ('CONFIGURING', 'ACTIVE', 'PAUSED', 'ERROR');

-- Device Trust Types
CREATE TYPE "DeviceType" AS ENUM ('DESKTOP', 'LAPTOP', 'MOBILE', 'TABLET', 'OTHER');

CREATE TYPE "DeviceTrustStatus" AS ENUM ('PENDING', 'TRUSTED', 'BLOCKED', 'REVOKED');

-- API & Integration Types
CREATE TYPE "APIClientType" AS ENUM ('CONFIDENTIAL', 'PUBLIC', 'SERVICE');

CREATE TYPE "APIClientStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'REVOKED');

CREATE TYPE "WebhookStatus" AS ENUM ('ACTIVE', 'PAUSED', 'DISABLED', 'FAILED');

CREATE TYPE "DeliveryStatus" AS ENUM ('PENDING', 'DELIVERED', 'FAILED', 'RETRYING');

CREATE TYPE "IntegrationCategory" AS ENUM ('PRODUCTIVITY', 'COMMUNICATION', 'PROJECT_MANAGEMENT', 'CRM', 'ANALYTICS', 'SECURITY', 'DEVELOPER_TOOLS', 'HR', 'FINANCE', 'MARKETING', 'CUSTOMER_SUPPORT', 'OTHER');

CREATE TYPE "IntegrationStatus" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'APPROVED', 'PUBLISHED', 'DEPRECATED', 'REMOVED');

CREATE TYPE "InstallStatus" AS ENUM ('ACTIVE', 'PAUSED', 'UNINSTALLED');

-- Analytics Types
CREATE TYPE "SnapshotType" AS ENUM ('PLATFORM', 'USAGE', 'REVENUE', 'ENGAGEMENT', 'SECURITY');

CREATE TYPE "CustomReportType" AS ENUM ('USAGE', 'REVENUE', 'SECURITY', 'COMPLIANCE', 'USER_ACTIVITY', 'CUSTOM_SQL');

-- Broadcast Types
CREATE TYPE "BroadcastType" AS ENUM ('ANNOUNCEMENT', 'PRODUCT_UPDATE', 'MAINTENANCE', 'SECURITY_ALERT', 'MARKETING', 'SURVEY');

CREATE TYPE "BroadcastPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

CREATE TYPE "BroadcastChannel" AS ENUM ('IN_APP', 'EMAIL', 'PUSH', 'SMS', 'SLACK');

CREATE TYPE "BroadcastStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'SENDING', 'SENT', 'CANCELLED');

-- ==================== SECURITY TABLES ====================

-- SecurityPolicy
CREATE TABLE "SecurityPolicy" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "SecurityPolicyType" NOT NULL,
    "scope" "SecurityPolicyScope" NOT NULL DEFAULT 'PLATFORM',
    "targetOrgs" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "targetPlans" "PlanTier"[] DEFAULT ARRAY[]::"PlanTier"[],
    "settings" JSONB NOT NULL DEFAULT '{}',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "enforcementMode" "EnforcementMode" NOT NULL DEFAULT 'ENFORCE',
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SecurityPolicy_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "SecurityPolicy_type_idx" ON "SecurityPolicy"("type");
CREATE INDEX "SecurityPolicy_scope_idx" ON "SecurityPolicy"("scope");
CREATE INDEX "SecurityPolicy_isActive_idx" ON "SecurityPolicy"("isActive");

-- SecurityViolation
CREATE TABLE "SecurityViolation" (
    "id" TEXT NOT NULL,
    "policyId" TEXT NOT NULL,
    "orgId" TEXT,
    "userId" TEXT,
    "violationType" "SecurityViolationType" NOT NULL,
    "severity" "AlertSeverity" NOT NULL DEFAULT 'WARNING',
    "description" TEXT NOT NULL,
    "details" JSONB NOT NULL DEFAULT '{}',
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "resourceType" TEXT,
    "resourceId" TEXT,
    "status" "ViolationStatus" NOT NULL DEFAULT 'OPEN',
    "resolvedBy" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "resolution" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SecurityViolation_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "SecurityViolation_policyId_idx" ON "SecurityViolation"("policyId");
CREATE INDEX "SecurityViolation_orgId_idx" ON "SecurityViolation"("orgId");
CREATE INDEX "SecurityViolation_userId_idx" ON "SecurityViolation"("userId");
CREATE INDEX "SecurityViolation_violationType_idx" ON "SecurityViolation"("violationType");
CREATE INDEX "SecurityViolation_severity_idx" ON "SecurityViolation"("severity");
CREATE INDEX "SecurityViolation_status_idx" ON "SecurityViolation"("status");
CREATE INDEX "SecurityViolation_createdAt_idx" ON "SecurityViolation"("createdAt");

ALTER TABLE "SecurityViolation" ADD CONSTRAINT "SecurityViolation_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "SecurityPolicy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ThreatEvent
CREATE TABLE "ThreatEvent" (
    "id" TEXT NOT NULL,
    "type" "ThreatEventType" NOT NULL,
    "severity" "AlertSeverity" NOT NULL DEFAULT 'WARNING',
    "source" TEXT NOT NULL,
    "orgId" TEXT,
    "userId" TEXT,
    "description" TEXT NOT NULL,
    "details" JSONB NOT NULL DEFAULT '{}',
    "indicators" JSONB NOT NULL DEFAULT '[]',
    "status" "ThreatStatus" NOT NULL DEFAULT 'ACTIVE',
    "mitigatedBy" TEXT,
    "mitigatedAt" TIMESTAMP(3),
    "mitigation" TEXT,
    "relatedEvents" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ThreatEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ThreatEvent_type_idx" ON "ThreatEvent"("type");
CREATE INDEX "ThreatEvent_severity_idx" ON "ThreatEvent"("severity");
CREATE INDEX "ThreatEvent_orgId_idx" ON "ThreatEvent"("orgId");
CREATE INDEX "ThreatEvent_status_idx" ON "ThreatEvent"("status");
CREATE INDEX "ThreatEvent_createdAt_idx" ON "ThreatEvent"("createdAt");

-- IPBlocklist
CREATE TABLE "IPBlocklist" (
    "id" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "ipRange" TEXT,
    "type" "IPBlockType" NOT NULL DEFAULT 'MANUAL',
    "reason" TEXT NOT NULL,
    "orgId" TEXT,
    "blockedBy" TEXT,
    "expiresAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IPBlocklist_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "IPBlocklist_ipAddress_orgId_key" ON "IPBlocklist"("ipAddress", "orgId");
CREATE INDEX "IPBlocklist_ipAddress_idx" ON "IPBlocklist"("ipAddress");
CREATE INDEX "IPBlocklist_orgId_idx" ON "IPBlocklist"("orgId");
CREATE INDEX "IPBlocklist_isActive_idx" ON "IPBlocklist"("isActive");
CREATE INDEX "IPBlocklist_expiresAt_idx" ON "IPBlocklist"("expiresAt");

-- ==================== COMPLIANCE TABLES ====================

-- ComplianceFramework
CREATE TABLE "ComplianceFramework" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "version" TEXT,
    "requirements" JSONB NOT NULL DEFAULT '[]',
    "controls" JSONB NOT NULL DEFAULT '[]',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ComplianceFramework_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ComplianceFramework_code_key" ON "ComplianceFramework"("code");
CREATE INDEX "ComplianceFramework_code_idx" ON "ComplianceFramework"("code");
CREATE INDEX "ComplianceFramework_isActive_idx" ON "ComplianceFramework"("isActive");

-- ComplianceAttestation
CREATE TABLE "ComplianceAttestation" (
    "id" TEXT NOT NULL,
    "frameworkId" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "status" "AttestationStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "score" DOUBLE PRECISION,
    "findings" JSONB NOT NULL DEFAULT '[]',
    "evidence" JSONB NOT NULL DEFAULT '[]',
    "attestedBy" TEXT,
    "attestedAt" TIMESTAMP(3),
    "validUntil" TIMESTAMP(3),
    "notes" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ComplianceAttestation_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ComplianceAttestation_frameworkId_orgId_key" ON "ComplianceAttestation"("frameworkId", "orgId");
CREATE INDEX "ComplianceAttestation_frameworkId_idx" ON "ComplianceAttestation"("frameworkId");
CREATE INDEX "ComplianceAttestation_orgId_idx" ON "ComplianceAttestation"("orgId");
CREATE INDEX "ComplianceAttestation_status_idx" ON "ComplianceAttestation"("status");

ALTER TABLE "ComplianceAttestation" ADD CONSTRAINT "ComplianceAttestation_frameworkId_fkey" FOREIGN KEY ("frameworkId") REFERENCES "ComplianceFramework"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ComplianceAudit
CREATE TABLE "ComplianceAudit" (
    "id" TEXT NOT NULL,
    "frameworkId" TEXT NOT NULL,
    "orgId" TEXT,
    "type" "AuditType" NOT NULL DEFAULT 'INTERNAL',
    "status" "ComplianceAuditStatus" NOT NULL DEFAULT 'SCHEDULED',
    "scheduledDate" TIMESTAMP(3) NOT NULL,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "auditor" TEXT,
    "findings" JSONB NOT NULL DEFAULT '[]',
    "recommendations" JSONB NOT NULL DEFAULT '[]',
    "score" DOUBLE PRECISION,
    "reportUrl" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ComplianceAudit_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ComplianceAudit_frameworkId_idx" ON "ComplianceAudit"("frameworkId");
CREATE INDEX "ComplianceAudit_orgId_idx" ON "ComplianceAudit"("orgId");
CREATE INDEX "ComplianceAudit_status_idx" ON "ComplianceAudit"("status");
CREATE INDEX "ComplianceAudit_scheduledDate_idx" ON "ComplianceAudit"("scheduledDate");

ALTER TABLE "ComplianceAudit" ADD CONSTRAINT "ComplianceAudit_frameworkId_fkey" FOREIGN KEY ("frameworkId") REFERENCES "ComplianceFramework"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- LegalHold
CREATE TABLE "LegalHold" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "caseNumber" TEXT,
    "orgId" TEXT,
    "custodians" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "status" "LegalHoldStatus" NOT NULL DEFAULT 'ACTIVE',
    "scope" JSONB NOT NULL DEFAULT '{}',
    "createdBy" TEXT NOT NULL,
    "releasedBy" TEXT,
    "releasedAt" TIMESTAMP(3),
    "notes" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LegalHold_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "LegalHold_caseNumber_key" ON "LegalHold"("caseNumber");
CREATE INDEX "LegalHold_orgId_idx" ON "LegalHold"("orgId");
CREATE INDEX "LegalHold_caseNumber_idx" ON "LegalHold"("caseNumber");
CREATE INDEX "LegalHold_status_idx" ON "LegalHold"("status");
CREATE INDEX "LegalHold_startDate_idx" ON "LegalHold"("startDate");

-- DataExport
CREATE TABLE "DataExport" (
    "id" TEXT NOT NULL,
    "type" "DataExportType" NOT NULL,
    "requestedBy" TEXT NOT NULL,
    "orgId" TEXT,
    "userId" TEXT,
    "legalHoldId" TEXT,
    "status" "DataExportStatus" NOT NULL DEFAULT 'PENDING',
    "scope" JSONB NOT NULL DEFAULT '{}',
    "format" TEXT NOT NULL DEFAULT 'json',
    "fileUrl" TEXT,
    "fileSize" BIGINT,
    "expiresAt" TIMESTAMP(3),
    "error" TEXT,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DataExport_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "DataExport_type_idx" ON "DataExport"("type");
CREATE INDEX "DataExport_orgId_idx" ON "DataExport"("orgId");
CREATE INDEX "DataExport_userId_idx" ON "DataExport"("userId");
CREATE INDEX "DataExport_legalHoldId_idx" ON "DataExport"("legalHoldId");
CREATE INDEX "DataExport_status_idx" ON "DataExport"("status");

ALTER TABLE "DataExport" ADD CONSTRAINT "DataExport_legalHoldId_fkey" FOREIGN KEY ("legalHoldId") REFERENCES "LegalHold"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- DataRetentionPolicy
CREATE TABLE "DataRetentionPolicy" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "dataType" TEXT NOT NULL,
    "retentionDays" INTEGER NOT NULL,
    "scope" "SecurityPolicyScope" NOT NULL DEFAULT 'PLATFORM',
    "targetOrgs" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "targetPlans" "PlanTier"[] DEFAULT ARRAY[]::"PlanTier"[],
    "deleteAction" "DeleteAction" NOT NULL DEFAULT 'SOFT_DELETE',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastRun" TIMESTAMP(3),
    "nextRun" TIMESTAMP(3),
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DataRetentionPolicy_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "DataRetentionPolicy_dataType_idx" ON "DataRetentionPolicy"("dataType");
CREATE INDEX "DataRetentionPolicy_scope_idx" ON "DataRetentionPolicy"("scope");
CREATE INDEX "DataRetentionPolicy_isActive_idx" ON "DataRetentionPolicy"("isActive");

-- ==================== PLATFORM OPERATIONS TABLES ====================

-- PlatformIncident
CREATE TABLE "PlatformIncident" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "severity" "IncidentSeverity" NOT NULL DEFAULT 'MINOR',
    "status" "IncidentStatus" NOT NULL DEFAULT 'INVESTIGATING',
    "type" "IncidentType" NOT NULL,
    "affectedServices" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "affectedOrgs" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "affectedRegions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "impact" TEXT,
    "rootCause" TEXT,
    "timeline" JSONB NOT NULL DEFAULT '[]',
    "responders" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "commanderId" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "detectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acknowledgedAt" TIMESTAMP(3),
    "mitigatedAt" TIMESTAMP(3),
    "resolvedAt" TIMESTAMP(3),
    "postmortemUrl" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlatformIncident_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "PlatformIncident_severity_idx" ON "PlatformIncident"("severity");
CREATE INDEX "PlatformIncident_status_idx" ON "PlatformIncident"("status");
CREATE INDEX "PlatformIncident_type_idx" ON "PlatformIncident"("type");
CREATE INDEX "PlatformIncident_startedAt_idx" ON "PlatformIncident"("startedAt");

-- IncidentUpdate
CREATE TABLE "IncidentUpdate" (
    "id" TEXT NOT NULL,
    "incidentId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" "IncidentStatus",
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "postedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IncidentUpdate_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "IncidentUpdate_incidentId_idx" ON "IncidentUpdate"("incidentId");
CREATE INDEX "IncidentUpdate_createdAt_idx" ON "IncidentUpdate"("createdAt");

ALTER TABLE "IncidentUpdate" ADD CONSTRAINT "IncidentUpdate_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "PlatformIncident"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- MaintenanceWindow
CREATE TABLE "MaintenanceWindow" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" "MaintenanceType" NOT NULL DEFAULT 'SCHEDULED',
    "status" "MaintenanceStatus" NOT NULL DEFAULT 'SCHEDULED',
    "affectedServices" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "affectedRegions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "scheduledStart" TIMESTAMP(3) NOT NULL,
    "scheduledEnd" TIMESTAMP(3) NOT NULL,
    "actualStart" TIMESTAMP(3),
    "actualEnd" TIMESTAMP(3),
    "notifyBefore" INTEGER NOT NULL DEFAULT 24,
    "createdBy" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MaintenanceWindow_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "MaintenanceWindow_status_idx" ON "MaintenanceWindow"("status");
CREATE INDEX "MaintenanceWindow_scheduledStart_idx" ON "MaintenanceWindow"("scheduledStart");

-- ReleaseManagement
CREATE TABLE "ReleaseManagement" (
    "id" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "name" TEXT,
    "description" TEXT,
    "type" "ReleaseType" NOT NULL DEFAULT 'MINOR',
    "status" "ReleaseStatus" NOT NULL DEFAULT 'PLANNED',
    "features" JSONB NOT NULL DEFAULT '[]',
    "bugFixes" JSONB NOT NULL DEFAULT '[]',
    "breakingChanges" JSONB NOT NULL DEFAULT '[]',
    "rolloutStrategy" "RolloutStrategy" NOT NULL DEFAULT 'STAGED',
    "rolloutPercentage" INTEGER NOT NULL DEFAULT 0,
    "rolloutRegions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "plannedDate" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "rollbackedAt" TIMESTAMP(3),
    "changelogUrl" TEXT,
    "createdBy" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReleaseManagement_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ReleaseManagement_version_key" ON "ReleaseManagement"("version");
CREATE INDEX "ReleaseManagement_status_idx" ON "ReleaseManagement"("status");
CREATE INDEX "ReleaseManagement_plannedDate_idx" ON "ReleaseManagement"("plannedDate");

-- CapacityMetric
CREATE TABLE "CapacityMetric" (
    "id" TEXT NOT NULL,
    "metricType" TEXT NOT NULL,
    "region" TEXT,
    "service" TEXT,
    "currentValue" DOUBLE PRECISION NOT NULL,
    "maxValue" DOUBLE PRECISION NOT NULL,
    "threshold" DOUBLE PRECISION NOT NULL DEFAULT 80,
    "unit" TEXT NOT NULL DEFAULT 'percent',
    "status" "CapacityStatus" NOT NULL DEFAULT 'NORMAL',
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB NOT NULL DEFAULT '{}',

    CONSTRAINT "CapacityMetric_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "CapacityMetric_metricType_idx" ON "CapacityMetric"("metricType");
CREATE INDEX "CapacityMetric_region_idx" ON "CapacityMetric"("region");
CREATE INDEX "CapacityMetric_service_idx" ON "CapacityMetric"("service");
CREATE INDEX "CapacityMetric_status_idx" ON "CapacityMetric"("status");
CREATE INDEX "CapacityMetric_recordedAt_idx" ON "CapacityMetric"("recordedAt");

-- ==================== DOMAIN & IDENTITY TABLES ====================

-- DomainVerification
CREATE TABLE "DomainVerification" (
    "id" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "status" "DomainStatus" NOT NULL DEFAULT 'PENDING',
    "verificationMethod" "DomainVerificationMethod" NOT NULL DEFAULT 'DNS_TXT',
    "verificationToken" TEXT NOT NULL,
    "verifiedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "autoJoin" BOOLEAN NOT NULL DEFAULT false,
    "ssoEnforced" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DomainVerification_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "DomainVerification_domain_key" ON "DomainVerification"("domain");
CREATE INDEX "DomainVerification_domain_idx" ON "DomainVerification"("domain");
CREATE INDEX "DomainVerification_orgId_idx" ON "DomainVerification"("orgId");
CREATE INDEX "DomainVerification_status_idx" ON "DomainVerification"("status");

-- EnterpriseSSO
CREATE TABLE "EnterpriseSSO" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "provider" "SSOProvider" NOT NULL,
    "status" "SSOStatus" NOT NULL DEFAULT 'CONFIGURING',
    "displayName" TEXT,
    "entityId" TEXT,
    "ssoUrl" TEXT,
    "sloUrl" TEXT,
    "certificate" TEXT,
    "clientId" TEXT,
    "clientSecret" TEXT,
    "discoveryUrl" TEXT,
    "authorizationUrl" TEXT,
    "tokenUrl" TEXT,
    "userInfoUrl" TEXT,
    "defaultRole" "Role" NOT NULL DEFAULT 'MEMBER',
    "jitProvisioning" BOOLEAN NOT NULL DEFAULT true,
    "autoDeactivate" BOOLEAN NOT NULL DEFAULT false,
    "attributeMapping" JSONB NOT NULL DEFAULT '{}',
    "allowedDomains" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "lastSyncAt" TIMESTAMP(3),
    "syncErrors" JSONB NOT NULL DEFAULT '[]',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EnterpriseSSO_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "EnterpriseSSO_orgId_key" ON "EnterpriseSSO"("orgId");
CREATE INDEX "EnterpriseSSO_provider_idx" ON "EnterpriseSSO"("provider");
CREATE INDEX "EnterpriseSSO_status_idx" ON "EnterpriseSSO"("status");

-- SCIMIntegration
CREATE TABLE "SCIMIntegration" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "status" "SCIMStatus" NOT NULL DEFAULT 'CONFIGURING',
    "endpoint" TEXT,
    "bearerToken" TEXT,
    "tokenPrefix" TEXT,
    "syncUsers" BOOLEAN NOT NULL DEFAULT true,
    "syncGroups" BOOLEAN NOT NULL DEFAULT true,
    "autoDeactivate" BOOLEAN NOT NULL DEFAULT true,
    "defaultRole" "Role" NOT NULL DEFAULT 'MEMBER',
    "lastSyncAt" TIMESTAMP(3),
    "usersProvisioned" INTEGER NOT NULL DEFAULT 0,
    "usersSynced" INTEGER NOT NULL DEFAULT 0,
    "groupsSynced" INTEGER NOT NULL DEFAULT 0,
    "syncErrors" JSONB NOT NULL DEFAULT '[]',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SCIMIntegration_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SCIMIntegration_orgId_key" ON "SCIMIntegration"("orgId");
CREATE INDEX "SCIMIntegration_status_idx" ON "SCIMIntegration"("status");

-- ==================== DEVICE TRUST TABLES ====================

-- TrustedDevice
CREATE TABLE "TrustedDevice" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "name" TEXT,
    "type" "DeviceType" NOT NULL,
    "platform" TEXT,
    "osVersion" TEXT,
    "appVersion" TEXT,
    "model" TEXT,
    "manufacturer" TEXT,
    "isCompliant" BOOLEAN NOT NULL DEFAULT true,
    "complianceChecks" JSONB NOT NULL DEFAULT '[]',
    "lastComplianceCheck" TIMESTAMP(3),
    "trustStatus" "DeviceTrustStatus" NOT NULL DEFAULT 'PENDING',
    "trustedAt" TIMESTAMP(3),
    "trustedBy" TEXT,
    "lastActiveAt" TIMESTAMP(3),
    "lastIpAddress" TEXT,
    "lastLocation" TEXT,
    "isManaged" BOOLEAN NOT NULL DEFAULT false,
    "mdmEnrolledAt" TIMESTAMP(3),
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrustedDevice_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "TrustedDevice_deviceId_key" ON "TrustedDevice"("deviceId");
CREATE INDEX "TrustedDevice_userId_idx" ON "TrustedDevice"("userId");
CREATE INDEX "TrustedDevice_deviceId_idx" ON "TrustedDevice"("deviceId");
CREATE INDEX "TrustedDevice_trustStatus_idx" ON "TrustedDevice"("trustStatus");
CREATE INDEX "TrustedDevice_isCompliant_idx" ON "TrustedDevice"("isCompliant");

-- DevicePolicy
CREATE TABLE "DevicePolicy" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "scope" "SecurityPolicyScope" NOT NULL DEFAULT 'PLATFORM',
    "targetOrgs" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "targetPlans" "PlanTier"[] DEFAULT ARRAY[]::"PlanTier"[],
    "requireEncryption" BOOLEAN NOT NULL DEFAULT false,
    "requirePasscode" BOOLEAN NOT NULL DEFAULT false,
    "requireBiometric" BOOLEAN NOT NULL DEFAULT false,
    "requireMDM" BOOLEAN NOT NULL DEFAULT false,
    "minOSVersion" JSONB NOT NULL DEFAULT '{}',
    "allowedPlatforms" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "blockedPlatforms" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "blockOnViolation" BOOLEAN NOT NULL DEFAULT false,
    "wipeOnViolation" BOOLEAN NOT NULL DEFAULT false,
    "notifyOnViolation" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DevicePolicy_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "DevicePolicy_scope_idx" ON "DevicePolicy"("scope");
CREATE INDEX "DevicePolicy_isActive_idx" ON "DevicePolicy"("isActive");

-- ==================== API & INTEGRATION TABLES ====================

-- APIClient
CREATE TABLE "APIClient" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "clientId" TEXT NOT NULL,
    "clientSecretHash" TEXT NOT NULL,
    "type" "APIClientType" NOT NULL DEFAULT 'CONFIDENTIAL',
    "status" "APIClientStatus" NOT NULL DEFAULT 'ACTIVE',
    "redirectUris" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "allowedScopes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "allowedGrants" TEXT[] DEFAULT ARRAY['authorization_code']::TEXT[],
    "rateLimit" INTEGER NOT NULL DEFAULT 1000,
    "dailyLimit" INTEGER,
    "monthlyLimit" INTEGER,
    "totalRequests" BIGINT NOT NULL DEFAULT 0,
    "lastUsedAt" TIMESTAMP(3),
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "APIClient_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "APIClient_clientId_key" ON "APIClient"("clientId");
CREATE INDEX "APIClient_orgId_idx" ON "APIClient"("orgId");
CREATE INDEX "APIClient_clientId_idx" ON "APIClient"("clientId");
CREATE INDEX "APIClient_status_idx" ON "APIClient"("status");

-- WebhookEndpoint
CREATE TABLE "WebhookEndpoint" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "name" TEXT,
    "description" TEXT,
    "events" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" "WebhookStatus" NOT NULL DEFAULT 'ACTIVE',
    "secret" TEXT NOT NULL,
    "retryPolicy" JSONB NOT NULL DEFAULT '{}',
    "timeout" INTEGER NOT NULL DEFAULT 30,
    "totalDeliveries" BIGINT NOT NULL DEFAULT 0,
    "successfulDeliveries" BIGINT NOT NULL DEFAULT 0,
    "failedDeliveries" BIGINT NOT NULL DEFAULT 0,
    "lastDeliveryAt" TIMESTAMP(3),
    "lastStatus" INTEGER,
    "isHealthy" BOOLEAN NOT NULL DEFAULT true,
    "consecutiveFailures" INTEGER NOT NULL DEFAULT 0,
    "disabledAt" TIMESTAMP(3),
    "disabledReason" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WebhookEndpoint_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "WebhookEndpoint_orgId_idx" ON "WebhookEndpoint"("orgId");
CREATE INDEX "WebhookEndpoint_status_idx" ON "WebhookEndpoint"("status");
CREATE INDEX "WebhookEndpoint_isHealthy_idx" ON "WebhookEndpoint"("isHealthy");

-- WebhookDelivery
CREATE TABLE "WebhookDelivery" (
    "id" TEXT NOT NULL,
    "webhookId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "status" "DeliveryStatus" NOT NULL DEFAULT 'PENDING',
    "httpStatus" INTEGER,
    "response" TEXT,
    "error" TEXT,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "nextRetryAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WebhookDelivery_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "WebhookDelivery_webhookId_idx" ON "WebhookDelivery"("webhookId");
CREATE INDEX "WebhookDelivery_status_idx" ON "WebhookDelivery"("status");
CREATE INDEX "WebhookDelivery_eventType_idx" ON "WebhookDelivery"("eventType");
CREATE INDEX "WebhookDelivery_createdAt_idx" ON "WebhookDelivery"("createdAt");

ALTER TABLE "WebhookDelivery" ADD CONSTRAINT "WebhookDelivery_webhookId_fkey" FOREIGN KEY ("webhookId") REFERENCES "WebhookEndpoint"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- IntegrationApp
CREATE TABLE "IntegrationApp" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "shortDescription" TEXT,
    "category" "IntegrationCategory" NOT NULL,
    "developer" TEXT NOT NULL,
    "developerUrl" TEXT,
    "supportUrl" TEXT,
    "privacyUrl" TEXT,
    "iconUrl" TEXT,
    "bannerUrl" TEXT,
    "status" "IntegrationStatus" NOT NULL DEFAULT 'DRAFT',
    "isOfficial" BOOLEAN NOT NULL DEFAULT false,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "requiredScopes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "optionalScopes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "setupInstructions" TEXT,
    "configSchema" JSONB NOT NULL DEFAULT '{}',
    "installCount" INTEGER NOT NULL DEFAULT 0,
    "rating" DOUBLE PRECISION,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "allowedPlans" "PlanTier"[] DEFAULT ARRAY[]::"PlanTier"[],
    "blockedOrgs" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IntegrationApp_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "IntegrationApp_slug_key" ON "IntegrationApp"("slug");
CREATE INDEX "IntegrationApp_slug_idx" ON "IntegrationApp"("slug");
CREATE INDEX "IntegrationApp_category_idx" ON "IntegrationApp"("category");
CREATE INDEX "IntegrationApp_status_idx" ON "IntegrationApp"("status");
CREATE INDEX "IntegrationApp_isFeatured_idx" ON "IntegrationApp"("isFeatured");

-- IntegrationInstall
CREATE TABLE "IntegrationInstall" (
    "id" TEXT NOT NULL,
    "appId" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "status" "InstallStatus" NOT NULL DEFAULT 'ACTIVE',
    "installedBy" TEXT NOT NULL,
    "configuration" JSONB NOT NULL DEFAULT '{}',
    "grantedScopes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "lastUsedAt" TIMESTAMP(3),
    "uninstalledAt" TIMESTAMP(3),
    "uninstalledBy" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IntegrationInstall_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "IntegrationInstall_appId_orgId_key" ON "IntegrationInstall"("appId", "orgId");
CREATE INDEX "IntegrationInstall_appId_idx" ON "IntegrationInstall"("appId");
CREATE INDEX "IntegrationInstall_orgId_idx" ON "IntegrationInstall"("orgId");
CREATE INDEX "IntegrationInstall_status_idx" ON "IntegrationInstall"("status");

ALTER TABLE "IntegrationInstall" ADD CONSTRAINT "IntegrationInstall_appId_fkey" FOREIGN KEY ("appId") REFERENCES "IntegrationApp"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ==================== ANALYTICS TABLES ====================

-- AnalyticsSnapshot
CREATE TABLE "AnalyticsSnapshot" (
    "id" TEXT NOT NULL,
    "type" "SnapshotType" NOT NULL,
    "period" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "totalOrgs" INTEGER NOT NULL DEFAULT 0,
    "activeOrgs" INTEGER NOT NULL DEFAULT 0,
    "newOrgs" INTEGER NOT NULL DEFAULT 0,
    "churnedOrgs" INTEGER NOT NULL DEFAULT 0,
    "totalUsers" INTEGER NOT NULL DEFAULT 0,
    "activeUsers" INTEGER NOT NULL DEFAULT 0,
    "newUsers" INTEGER NOT NULL DEFAULT 0,
    "totalAgentRuns" INTEGER NOT NULL DEFAULT 0,
    "totalTokens" BIGINT NOT NULL DEFAULT 0,
    "totalApiCalls" BIGINT NOT NULL DEFAULT 0,
    "totalStorage" BIGINT NOT NULL DEFAULT 0,
    "mrr" INTEGER NOT NULL DEFAULT 0,
    "arr" INTEGER NOT NULL DEFAULT 0,
    "newMrr" INTEGER NOT NULL DEFAULT 0,
    "churnedMrr" INTEGER NOT NULL DEFAULT 0,
    "expansionMrr" INTEGER NOT NULL DEFAULT 0,
    "orgsByPlan" JSONB NOT NULL DEFAULT '{}',
    "orgsByRegion" JSONB NOT NULL DEFAULT '{}',
    "orgsByIndustry" JSONB NOT NULL DEFAULT '{}',
    "metrics" JSONB NOT NULL DEFAULT '{}',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnalyticsSnapshot_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AnalyticsSnapshot_type_period_periodStart_key" ON "AnalyticsSnapshot"("type", "period", "periodStart");
CREATE INDEX "AnalyticsSnapshot_type_idx" ON "AnalyticsSnapshot"("type");
CREATE INDEX "AnalyticsSnapshot_period_idx" ON "AnalyticsSnapshot"("period");
CREATE INDEX "AnalyticsSnapshot_periodStart_idx" ON "AnalyticsSnapshot"("periodStart");

-- CustomReport
CREATE TABLE "CustomReport" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "CustomReportType" NOT NULL,
    "query" JSONB NOT NULL,
    "schedule" TEXT,
    "recipients" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "format" TEXT NOT NULL DEFAULT 'csv',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastRunAt" TIMESTAMP(3),
    "nextRunAt" TIMESTAMP(3),
    "lastResult" JSONB,
    "createdBy" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomReport_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "CustomReport_type_idx" ON "CustomReport"("type");
CREATE INDEX "CustomReport_isActive_idx" ON "CustomReport"("isActive");
CREATE INDEX "CustomReport_nextRunAt_idx" ON "CustomReport"("nextRunAt");

-- ==================== BROADCAST TABLES ====================

-- BroadcastMessage
CREATE TABLE "BroadcastMessage" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "contentHtml" TEXT,
    "type" "BroadcastType" NOT NULL,
    "priority" "BroadcastPriority" NOT NULL DEFAULT 'NORMAL',
    "targetType" "NotificationTargetType" NOT NULL DEFAULT 'ALL',
    "targetOrgs" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "targetPlans" "PlanTier"[] DEFAULT ARRAY[]::"PlanTier"[],
    "targetRoles" "Role"[] DEFAULT ARRAY[]::"Role"[],
    "channels" "BroadcastChannel"[] DEFAULT ARRAY['IN_APP']::"BroadcastChannel"[],
    "status" "BroadcastStatus" NOT NULL DEFAULT 'DRAFT',
    "scheduledFor" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "totalRecipients" INTEGER NOT NULL DEFAULT 0,
    "delivered" INTEGER NOT NULL DEFAULT 0,
    "opened" INTEGER NOT NULL DEFAULT 0,
    "clicked" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BroadcastMessage_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "BroadcastMessage_type_idx" ON "BroadcastMessage"("type");
CREATE INDEX "BroadcastMessage_status_idx" ON "BroadcastMessage"("status");
CREATE INDEX "BroadcastMessage_scheduledFor_idx" ON "BroadcastMessage"("scheduledFor");
