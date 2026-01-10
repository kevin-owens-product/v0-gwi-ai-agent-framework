-- CreateEnum
CREATE TYPE "WorkflowStatus" AS ENUM ('DRAFT', 'ACTIVE', 'PAUSED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "WorkflowRunStatus" AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ReportType" AS ENUM ('PRESENTATION', 'DASHBOARD', 'PDF', 'EXPORT', 'INFOGRAPHIC');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "DashboardStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "MemoryType" AS ENUM ('CONTEXT', 'PREFERENCE', 'FACT', 'CONVERSATION', 'CACHE');

-- CreateEnum
CREATE TYPE "ChartType" AS ENUM ('BAR', 'LINE', 'PIE', 'DONUT', 'AREA', 'SCATTER', 'HEATMAP', 'TREEMAP', 'FUNNEL', 'RADAR');

-- CreateEnum
CREATE TYPE "ChartStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "TemplateCategory" AS ENUM ('RESEARCH', 'ANALYSIS', 'BRIEFS', 'CUSTOM');

-- CreateEnum
CREATE TYPE "BrandTrackingStatus" AS ENUM ('DRAFT', 'ACTIVE', 'PAUSED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "Workflow" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "WorkflowStatus" NOT NULL DEFAULT 'DRAFT',
    "schedule" TEXT,
    "agents" TEXT[],
    "configuration" JSONB NOT NULL DEFAULT '{}',
    "lastRun" TIMESTAMP(3),
    "nextRun" TIMESTAMP(3),
    "runCount" INTEGER NOT NULL DEFAULT 0,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Workflow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkflowRun" (
    "id" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "status" "WorkflowRunStatus" NOT NULL DEFAULT 'PENDING',
    "input" JSONB NOT NULL DEFAULT '{}',
    "output" JSONB,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "errorMessage" TEXT,

    CONSTRAINT "WorkflowRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" "ReportType" NOT NULL,
    "status" "ReportStatus" NOT NULL DEFAULT 'DRAFT',
    "content" JSONB NOT NULL DEFAULT '{}',
    "thumbnail" TEXT,
    "agentId" TEXT,
    "views" INTEGER NOT NULL DEFAULT 0,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Dashboard" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "layout" JSONB NOT NULL DEFAULT '[]',
    "widgets" JSONB NOT NULL DEFAULT '[]',
    "status" "DashboardStatus" NOT NULL DEFAULT 'DRAFT',
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "views" INTEGER NOT NULL DEFAULT 0,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Dashboard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Crosstab" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "audiences" TEXT[],
    "metrics" TEXT[],
    "filters" JSONB NOT NULL DEFAULT '{}',
    "results" JSONB,
    "views" INTEGER NOT NULL DEFAULT 0,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Crosstab_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Audience" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "criteria" JSONB NOT NULL DEFAULT '{}',
    "size" INTEGER,
    "markets" TEXT[],
    "isFavorite" BOOLEAN NOT NULL DEFAULT false,
    "lastUsed" TIMESTAMP(3),
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Audience_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Memory" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "agentId" TEXT,
    "type" "MemoryType" NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Memory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Chart" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "ChartType" NOT NULL,
    "config" JSONB NOT NULL DEFAULT '{}',
    "data" JSONB,
    "dataSource" TEXT,
    "status" "ChartStatus" NOT NULL DEFAULT 'DRAFT',
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Chart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Template" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" "TemplateCategory" NOT NULL,
    "prompt" TEXT NOT NULL,
    "tags" TEXT[],
    "variables" JSONB NOT NULL DEFAULT '[]',
    "isGlobal" BOOLEAN NOT NULL DEFAULT false,
    "isFavorite" BOOLEAN NOT NULL DEFAULT false,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "lastUsed" TIMESTAMP(3),
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Template_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BrandTracking" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "brandName" TEXT NOT NULL,
    "description" TEXT,
    "industry" TEXT,
    "competitors" JSONB NOT NULL DEFAULT '[]',
    "audiences" TEXT[],
    "metrics" JSONB NOT NULL DEFAULT '{}',
    "trackingConfig" JSONB NOT NULL DEFAULT '{}',
    "status" "BrandTrackingStatus" NOT NULL DEFAULT 'DRAFT',
    "schedule" TEXT,
    "alertThresholds" JSONB NOT NULL DEFAULT '{}',
    "lastSnapshot" TIMESTAMP(3),
    "nextSnapshot" TIMESTAMP(3),
    "snapshotCount" INTEGER NOT NULL DEFAULT 0,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BrandTracking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BrandTrackingSnapshot" (
    "id" TEXT NOT NULL,
    "brandTrackingId" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "snapshotDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metrics" JSONB NOT NULL DEFAULT '{}',
    "brandHealth" DOUBLE PRECISION,
    "marketShare" DOUBLE PRECISION,
    "sentimentScore" DOUBLE PRECISION,
    "awareness" DOUBLE PRECISION,
    "consideration" DOUBLE PRECISION,
    "preference" DOUBLE PRECISION,
    "loyalty" DOUBLE PRECISION,
    "nps" DOUBLE PRECISION,
    "competitorData" JSONB NOT NULL DEFAULT '{}',
    "audienceBreakdown" JSONB NOT NULL DEFAULT '{}',
    "insights" TEXT[],
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BrandTrackingSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Workflow_orgId_idx" ON "Workflow"("orgId");

-- CreateIndex
CREATE INDEX "Workflow_status_idx" ON "Workflow"("status");

-- CreateIndex
CREATE INDEX "Workflow_createdBy_idx" ON "Workflow"("createdBy");

-- CreateIndex
CREATE INDEX "WorkflowRun_workflowId_idx" ON "WorkflowRun"("workflowId");

-- CreateIndex
CREATE INDEX "WorkflowRun_orgId_idx" ON "WorkflowRun"("orgId");

-- CreateIndex
CREATE INDEX "WorkflowRun_status_idx" ON "WorkflowRun"("status");

-- CreateIndex
CREATE INDEX "Report_orgId_idx" ON "Report"("orgId");

-- CreateIndex
CREATE INDEX "Report_status_idx" ON "Report"("status");

-- CreateIndex
CREATE INDEX "Report_type_idx" ON "Report"("type");

-- CreateIndex
CREATE INDEX "Report_createdBy_idx" ON "Report"("createdBy");

-- CreateIndex
CREATE INDEX "Dashboard_orgId_idx" ON "Dashboard"("orgId");

-- CreateIndex
CREATE INDEX "Dashboard_status_idx" ON "Dashboard"("status");

-- CreateIndex
CREATE INDEX "Dashboard_createdBy_idx" ON "Dashboard"("createdBy");

-- CreateIndex
CREATE INDEX "Crosstab_orgId_idx" ON "Crosstab"("orgId");

-- CreateIndex
CREATE INDEX "Crosstab_createdBy_idx" ON "Crosstab"("createdBy");

-- CreateIndex
CREATE INDEX "Audience_orgId_idx" ON "Audience"("orgId");

-- CreateIndex
CREATE INDEX "Audience_createdBy_idx" ON "Audience"("createdBy");

-- CreateIndex
CREATE INDEX "Audience_isFavorite_idx" ON "Audience"("isFavorite");

-- CreateIndex
CREATE INDEX "Memory_orgId_idx" ON "Memory"("orgId");

-- CreateIndex
CREATE INDEX "Memory_agentId_idx" ON "Memory"("agentId");

-- CreateIndex
CREATE INDEX "Memory_type_idx" ON "Memory"("type");

-- CreateIndex
CREATE UNIQUE INDEX "Memory_orgId_agentId_type_key_key" ON "Memory"("orgId", "agentId", "type", "key");

-- CreateIndex
CREATE INDEX "Chart_orgId_idx" ON "Chart"("orgId");

-- CreateIndex
CREATE INDEX "Chart_type_idx" ON "Chart"("type");

-- CreateIndex
CREATE INDEX "Chart_createdBy_idx" ON "Chart"("createdBy");

-- CreateIndex
CREATE INDEX "Template_orgId_idx" ON "Template"("orgId");

-- CreateIndex
CREATE INDEX "Template_category_idx" ON "Template"("category");

-- CreateIndex
CREATE INDEX "Template_createdBy_idx" ON "Template"("createdBy");

-- CreateIndex
CREATE INDEX "Template_isGlobal_idx" ON "Template"("isGlobal");

-- CreateIndex
CREATE INDEX "BrandTracking_orgId_idx" ON "BrandTracking"("orgId");

-- CreateIndex
CREATE INDEX "BrandTracking_status_idx" ON "BrandTracking"("status");

-- CreateIndex
CREATE INDEX "BrandTracking_createdBy_idx" ON "BrandTracking"("createdBy");

-- CreateIndex
CREATE INDEX "BrandTracking_brandName_idx" ON "BrandTracking"("brandName");

-- CreateIndex
CREATE INDEX "BrandTrackingSnapshot_brandTrackingId_idx" ON "BrandTrackingSnapshot"("brandTrackingId");

-- CreateIndex
CREATE INDEX "BrandTrackingSnapshot_orgId_idx" ON "BrandTrackingSnapshot"("orgId");

-- CreateIndex
CREATE INDEX "BrandTrackingSnapshot_snapshotDate_idx" ON "BrandTrackingSnapshot"("snapshotDate");

-- AddForeignKey
ALTER TABLE "Workflow" ADD CONSTRAINT "Workflow_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowRun" ADD CONSTRAINT "WorkflowRun_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "Workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dashboard" ADD CONSTRAINT "Dashboard_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Crosstab" ADD CONSTRAINT "Crosstab_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Audience" ADD CONSTRAINT "Audience_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Memory" ADD CONSTRAINT "Memory_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chart" ADD CONSTRAINT "Chart_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Template" ADD CONSTRAINT "Template_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Template" ADD CONSTRAINT "Template_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrandTracking" ADD CONSTRAINT "BrandTracking_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrandTrackingSnapshot" ADD CONSTRAINT "BrandTrackingSnapshot_brandTrackingId_fkey" FOREIGN KEY ("brandTrackingId") REFERENCES "BrandTracking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrandTrackingSnapshot" ADD CONSTRAINT "BrandTrackingSnapshot_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
