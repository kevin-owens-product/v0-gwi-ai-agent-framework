-- =====================================================
-- COMPREHENSIVE HIERARCHY SYSTEM MIGRATION
-- Adds all missing enums, columns, and tables for
-- multi-level tenant hierarchy functionality
-- =====================================================

-- ==================== ENUMS ====================

-- CreateEnum
CREATE TYPE "OrganizationType" AS ENUM ('STANDARD', 'AGENCY', 'HOLDING_COMPANY', 'SUBSIDIARY', 'BRAND', 'SUB_BRAND', 'DIVISION', 'DEPARTMENT', 'FRANCHISE', 'FRANCHISEE', 'RESELLER', 'CLIENT', 'REGIONAL', 'PORTFOLIO_COMPANY');

-- CreateEnum
CREATE TYPE "CompanySize" AS ENUM ('SOLO', 'SMALL', 'MEDIUM', 'LARGE', 'ENTERPRISE', 'GLOBAL');

-- CreateEnum
CREATE TYPE "OrgRelationshipType" AS ENUM ('OWNERSHIP', 'MANAGEMENT', 'PARTNERSHIP', 'LICENSING', 'RESELLER', 'WHITE_LABEL', 'DATA_SHARING', 'CONSORTIUM');

-- CreateEnum
CREATE TYPE "RelationshipStatus" AS ENUM ('PENDING', 'ACTIVE', 'SUSPENDED', 'TERMINATED');

-- CreateEnum
CREATE TYPE "BillingRelationship" AS ENUM ('INDEPENDENT', 'PARENT_PAYS', 'CONSOLIDATED', 'PASS_THROUGH', 'SUBSIDIZED');

-- CreateEnum
CREATE TYPE "ResourceSharingScope" AS ENUM ('NONE', 'READ_ONLY', 'FULL_ACCESS', 'INHERIT');

-- CreateEnum
CREATE TYPE "SharedResourceType" AS ENUM ('TEMPLATE', 'AUDIENCE', 'DATA_SOURCE', 'BRAND_TRACKING', 'WORKFLOW', 'AGENT', 'CHART', 'ALL');

-- CreateEnum
CREATE TYPE "HierarchyAction" AS ENUM ('ORG_CREATED', 'ORG_MOVED', 'ORG_TYPE_CHANGED', 'RELATIONSHIP_CREATED', 'RELATIONSHIP_UPDATED', 'RELATIONSHIP_TERMINATED', 'RESOURCE_SHARED', 'RESOURCE_UNSHARED', 'ACCESS_GRANTED', 'ACCESS_REVOKED', 'ROLE_INHERITED', 'SETTINGS_INHERITED', 'BILLING_CHANGED');

-- CreateEnum
CREATE TYPE "CrossOrgInviteStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'EXPIRED', 'REVOKED');

-- ==================== ORGANIZATION TABLE UPDATES ====================

-- Add missing columns to Organization table
ALTER TABLE "Organization" ADD COLUMN "orgType" "OrganizationType" NOT NULL DEFAULT 'STANDARD';
ALTER TABLE "Organization" ADD COLUMN "parentOrgId" TEXT;
ALTER TABLE "Organization" ADD COLUMN "rootOrgId" TEXT;
ALTER TABLE "Organization" ADD COLUMN "hierarchyPath" TEXT NOT NULL DEFAULT '/';
ALTER TABLE "Organization" ADD COLUMN "hierarchyLevel" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Organization" ADD COLUMN "maxChildDepth" INTEGER NOT NULL DEFAULT 5;
ALTER TABLE "Organization" ADD COLUMN "displayOrder" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Organization" ADD COLUMN "hierarchySettings" JSONB NOT NULL DEFAULT '{}';
ALTER TABLE "Organization" ADD COLUMN "inheritSettings" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Organization" ADD COLUMN "allowChildOrgs" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Organization" ADD COLUMN "logoUrl" TEXT;
ALTER TABLE "Organization" ADD COLUMN "brandColor" TEXT;
ALTER TABLE "Organization" ADD COLUMN "domain" TEXT;
ALTER TABLE "Organization" ADD COLUMN "industry" TEXT;
ALTER TABLE "Organization" ADD COLUMN "companySize" "CompanySize";
ALTER TABLE "Organization" ADD COLUMN "country" TEXT;
ALTER TABLE "Organization" ADD COLUMN "timezone" TEXT NOT NULL DEFAULT 'UTC';

-- Add unique constraint on domain
ALTER TABLE "Organization" ADD CONSTRAINT "Organization_domain_key" UNIQUE ("domain");

-- Add indexes for Organization hierarchy columns
CREATE INDEX "Organization_parentOrgId_idx" ON "Organization"("parentOrgId");
CREATE INDEX "Organization_rootOrgId_idx" ON "Organization"("rootOrgId");
CREATE INDEX "Organization_hierarchyPath_idx" ON "Organization"("hierarchyPath");
CREATE INDEX "Organization_orgType_idx" ON "Organization"("orgType");
CREATE INDEX "Organization_industry_idx" ON "Organization"("industry");
CREATE INDEX "Organization_domain_idx" ON "Organization"("domain");

-- Add foreign key constraints for hierarchy relationships
ALTER TABLE "Organization" ADD CONSTRAINT "Organization_parentOrgId_fkey" FOREIGN KEY ("parentOrgId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Organization" ADD CONSTRAINT "Organization_rootOrgId_fkey" FOREIGN KEY ("rootOrgId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ==================== NEW TABLES ====================

-- CreateTable: OrgRelationship
CREATE TABLE "OrgRelationship" (
    "id" TEXT NOT NULL,
    "fromOrgId" TEXT NOT NULL,
    "toOrgId" TEXT NOT NULL,
    "relationshipType" "OrgRelationshipType" NOT NULL,
    "status" "RelationshipStatus" NOT NULL DEFAULT 'PENDING',
    "permissions" JSONB NOT NULL DEFAULT '{}',
    "accessLevel" "ResourceSharingScope" NOT NULL DEFAULT 'READ_ONLY',
    "billingRelation" "BillingRelationship" NOT NULL DEFAULT 'INDEPENDENT',
    "billingConfig" JSONB NOT NULL DEFAULT '{}',
    "contractStart" TIMESTAMP(3),
    "contractEnd" TIMESTAMP(3),
    "notes" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "initiatedBy" TEXT NOT NULL,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrgRelationship_pkey" PRIMARY KEY ("id")
);

-- CreateTable: SharedResourceAccess
CREATE TABLE "SharedResourceAccess" (
    "id" TEXT NOT NULL,
    "ownerOrgId" TEXT NOT NULL,
    "targetOrgId" TEXT NOT NULL,
    "resourceType" "SharedResourceType" NOT NULL,
    "resourceId" TEXT,
    "accessLevel" "ResourceSharingScope" NOT NULL,
    "canView" BOOLEAN NOT NULL DEFAULT true,
    "canEdit" BOOLEAN NOT NULL DEFAULT false,
    "canDelete" BOOLEAN NOT NULL DEFAULT false,
    "canShare" BOOLEAN NOT NULL DEFAULT false,
    "propagateToChildren" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "grantedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SharedResourceAccess_pkey" PRIMARY KEY ("id")
);

-- CreateTable: RoleInheritanceRule
CREATE TABLE "RoleInheritanceRule" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sourceRole" "Role" NOT NULL,
    "sourceOrgType" "OrganizationType",
    "targetRole" "Role" NOT NULL,
    "inheritUp" BOOLEAN NOT NULL DEFAULT false,
    "inheritDown" BOOLEAN NOT NULL DEFAULT true,
    "inheritLevels" INTEGER NOT NULL DEFAULT 1,
    "requiresApproval" BOOLEAN NOT NULL DEFAULT false,
    "conditions" JSONB NOT NULL DEFAULT '{}',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoleInheritanceRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable: HierarchyAuditLog
CREATE TABLE "HierarchyAuditLog" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "actorOrgId" TEXT,
    "actorUserId" TEXT NOT NULL,
    "action" "HierarchyAction" NOT NULL,
    "targetOrgId" TEXT,
    "previousState" JSONB,
    "newState" JSONB,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HierarchyAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable: HierarchyTemplate
CREATE TABLE "HierarchyTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "structure" JSONB NOT NULL,
    "defaultSettings" JSONB NOT NULL DEFAULT '{}',
    "defaultRules" JSONB NOT NULL DEFAULT '{}',
    "applicableToTypes" "OrganizationType"[] DEFAULT ARRAY[]::"OrganizationType"[],
    "industry" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "isOfficial" BOOLEAN NOT NULL DEFAULT false,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HierarchyTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable: CrossOrgInvitation
CREATE TABLE "CrossOrgInvitation" (
    "id" TEXT NOT NULL,
    "fromOrgId" TEXT NOT NULL,
    "toEmail" TEXT NOT NULL,
    "toOrgId" TEXT,
    "relationshipType" "OrgRelationshipType" NOT NULL,
    "proposedRole" "Role" NOT NULL DEFAULT 'MEMBER',
    "proposedAccess" "ResourceSharingScope" NOT NULL DEFAULT 'READ_ONLY',
    "newOrgName" TEXT,
    "newOrgType" "OrganizationType",
    "message" TEXT,
    "token" TEXT NOT NULL,
    "status" "CrossOrgInviteStatus" NOT NULL DEFAULT 'PENDING',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "respondedAt" TIMESTAMP(3),
    "invitedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CrossOrgInvitation_pkey" PRIMARY KEY ("id")
);

-- ==================== INDEXES ====================

-- OrgRelationship indexes
CREATE INDEX "OrgRelationship_fromOrgId_idx" ON "OrgRelationship"("fromOrgId");
CREATE INDEX "OrgRelationship_toOrgId_idx" ON "OrgRelationship"("toOrgId");
CREATE INDEX "OrgRelationship_relationshipType_idx" ON "OrgRelationship"("relationshipType");
CREATE INDEX "OrgRelationship_status_idx" ON "OrgRelationship"("status");
CREATE UNIQUE INDEX "OrgRelationship_fromOrgId_toOrgId_relationshipType_key" ON "OrgRelationship"("fromOrgId", "toOrgId", "relationshipType");

-- SharedResourceAccess indexes
CREATE INDEX "SharedResourceAccess_ownerOrgId_idx" ON "SharedResourceAccess"("ownerOrgId");
CREATE INDEX "SharedResourceAccess_targetOrgId_idx" ON "SharedResourceAccess"("targetOrgId");
CREATE INDEX "SharedResourceAccess_resourceType_idx" ON "SharedResourceAccess"("resourceType");
CREATE INDEX "SharedResourceAccess_isActive_idx" ON "SharedResourceAccess"("isActive");
CREATE UNIQUE INDEX "SharedResourceAccess_ownerOrgId_targetOrgId_resourceType_resourceId_key" ON "SharedResourceAccess"("ownerOrgId", "targetOrgId", "resourceType", "resourceId");

-- RoleInheritanceRule indexes
CREATE INDEX "RoleInheritanceRule_orgId_idx" ON "RoleInheritanceRule"("orgId");
CREATE INDEX "RoleInheritanceRule_sourceRole_idx" ON "RoleInheritanceRule"("sourceRole");
CREATE INDEX "RoleInheritanceRule_isActive_idx" ON "RoleInheritanceRule"("isActive");

-- HierarchyAuditLog indexes
CREATE INDEX "HierarchyAuditLog_orgId_idx" ON "HierarchyAuditLog"("orgId");
CREATE INDEX "HierarchyAuditLog_actorOrgId_idx" ON "HierarchyAuditLog"("actorOrgId");
CREATE INDEX "HierarchyAuditLog_actorUserId_idx" ON "HierarchyAuditLog"("actorUserId");
CREATE INDEX "HierarchyAuditLog_action_idx" ON "HierarchyAuditLog"("action");
CREATE INDEX "HierarchyAuditLog_timestamp_idx" ON "HierarchyAuditLog"("timestamp");

-- HierarchyTemplate indexes
CREATE INDEX "HierarchyTemplate_isPublic_idx" ON "HierarchyTemplate"("isPublic");
CREATE INDEX "HierarchyTemplate_applicableToTypes_idx" ON "HierarchyTemplate"("applicableToTypes");
CREATE INDEX "HierarchyTemplate_industry_idx" ON "HierarchyTemplate"("industry");

-- CrossOrgInvitation indexes
CREATE INDEX "CrossOrgInvitation_fromOrgId_idx" ON "CrossOrgInvitation"("fromOrgId");
CREATE INDEX "CrossOrgInvitation_toEmail_idx" ON "CrossOrgInvitation"("toEmail");
CREATE INDEX "CrossOrgInvitation_toOrgId_idx" ON "CrossOrgInvitation"("toOrgId");
CREATE INDEX "CrossOrgInvitation_token_idx" ON "CrossOrgInvitation"("token");
CREATE INDEX "CrossOrgInvitation_status_idx" ON "CrossOrgInvitation"("status");
CREATE UNIQUE INDEX "CrossOrgInvitation_token_key" ON "CrossOrgInvitation"("token");

-- ==================== FOREIGN KEYS ====================

-- OrgRelationship foreign keys
ALTER TABLE "OrgRelationship" ADD CONSTRAINT "OrgRelationship_fromOrgId_fkey" FOREIGN KEY ("fromOrgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OrgRelationship" ADD CONSTRAINT "OrgRelationship_toOrgId_fkey" FOREIGN KEY ("toOrgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SharedResourceAccess foreign keys
ALTER TABLE "SharedResourceAccess" ADD CONSTRAINT "SharedResourceAccess_ownerOrgId_fkey" FOREIGN KEY ("ownerOrgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SharedResourceAccess" ADD CONSTRAINT "SharedResourceAccess_targetOrgId_fkey" FOREIGN KEY ("targetOrgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- RoleInheritanceRule foreign key
ALTER TABLE "RoleInheritanceRule" ADD CONSTRAINT "RoleInheritanceRule_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ==================== PLAN TABLE FIX ====================

-- Add missing limits column to Plan table
ALTER TABLE "Plan" ADD COLUMN "limits" JSONB NOT NULL DEFAULT '{}';
