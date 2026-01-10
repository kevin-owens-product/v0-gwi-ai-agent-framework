-- Add performance indexes for commonly queried fields

-- Agent indexes
CREATE INDEX IF NOT EXISTS "Agent_status_idx" ON "Agent"("status");
CREATE INDEX IF NOT EXISTS "Agent_createdAt_idx" ON "Agent"("createdAt");
CREATE INDEX IF NOT EXISTS "Agent_orgId_status_idx" ON "Agent"("orgId", "status");
CREATE INDEX IF NOT EXISTS "Agent_orgId_createdAt_idx" ON "Agent"("orgId", "createdAt");

-- AgentRun indexes
CREATE INDEX IF NOT EXISTS "AgentRun_createdAt_idx" ON "AgentRun"("startedAt");
CREATE INDEX IF NOT EXISTS "AgentRun_completedAt_idx" ON "AgentRun"("completedAt");
CREATE INDEX IF NOT EXISTS "AgentRun_orgId_status_idx" ON "AgentRun"("orgId", "status");
CREATE INDEX IF NOT EXISTS "AgentRun_orgId_createdAt_idx" ON "AgentRun"("orgId", "startedAt");

-- Workflow indexes
CREATE INDEX IF NOT EXISTS "Workflow_status_idx" ON "Workflow"("status");
CREATE INDEX IF NOT EXISTS "Workflow_createdAt_idx" ON "Workflow"("createdAt");
CREATE INDEX IF NOT EXISTS "Workflow_lastRun_idx" ON "Workflow"("lastRun");
CREATE INDEX IF NOT EXISTS "Workflow_orgId_status_idx" ON "Workflow"("orgId", "status");

-- WorkflowRun indexes
CREATE INDEX IF NOT EXISTS "WorkflowRun_createdAt_idx" ON "WorkflowRun"("createdAt");
CREATE INDEX IF NOT EXISTS "WorkflowRun_completedAt_idx" ON "WorkflowRun"("completedAt");
CREATE INDEX IF NOT EXISTS "WorkflowRun_orgId_status_idx" ON "WorkflowRun"("orgId", "status");
CREATE INDEX IF NOT EXISTS "WorkflowRun_orgId_createdAt_idx" ON "WorkflowRun"("orgId", "createdAt");

-- Insight indexes
CREATE INDEX IF NOT EXISTS "Insight_type_idx" ON "Insight"("type");
CREATE INDEX IF NOT EXISTS "Insight_createdAt_idx" ON "Insight"("createdAt");
CREATE INDEX IF NOT EXISTS "Insight_orgId_type_idx" ON "Insight"("orgId", "type");
CREATE INDEX IF NOT EXISTS "Insight_orgId_createdAt_idx" ON "Insight"("orgId", "createdAt");
CREATE INDEX IF NOT EXISTS "Insight_confidenceScore_idx" ON "Insight"("confidenceScore");

-- Memory indexes
CREATE INDEX IF NOT EXISTS "Memory_expiresAt_idx" ON "Memory"("expiresAt");
CREATE INDEX IF NOT EXISTS "Memory_agentId_idx" ON "Memory"("agentId");
CREATE INDEX IF NOT EXISTS "Memory_createdAt_idx" ON "Memory"("createdAt");
CREATE INDEX IF NOT EXISTS "Memory_orgId_agentId_idx" ON "Memory"("orgId", "agentId");

-- AuditLog indexes
CREATE INDEX IF NOT EXISTS "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");
CREATE INDEX IF NOT EXISTS "AuditLog_action_idx" ON "AuditLog"("action");
CREATE INDEX IF NOT EXISTS "AuditLog_resourceType_idx" ON "AuditLog"("resourceType");
CREATE INDEX IF NOT EXISTS "AuditLog_orgId_createdAt_idx" ON "AuditLog"("orgId", "createdAt");
CREATE INDEX IF NOT EXISTS "AuditLog_userId_createdAt_idx" ON "AuditLog"("userId", "createdAt");

-- UsageRecord indexes
CREATE INDEX IF NOT EXISTS "UsageRecord_createdAt_idx" ON "UsageRecord"("createdAt");
CREATE INDEX IF NOT EXISTS "UsageRecord_metricType_idx" ON "UsageRecord"("metricType");
CREATE INDEX IF NOT EXISTS "UsageRecord_orgId_metricType_idx" ON "UsageRecord"("orgId", "metricType");
CREATE INDEX IF NOT EXISTS "UsageRecord_orgId_createdAt_idx" ON "UsageRecord"("orgId", "createdAt");

-- Report indexes
CREATE INDEX IF NOT EXISTS "Report_type_idx" ON "Report"("type");
CREATE INDEX IF NOT EXISTS "Report_status_idx" ON "Report"("status");
CREATE INDEX IF NOT EXISTS "Report_createdAt_idx" ON "Report"("createdAt");
CREATE INDEX IF NOT EXISTS "Report_orgId_status_idx" ON "Report"("orgId", "status");

-- Dashboard indexes
CREATE INDEX IF NOT EXISTS "Dashboard_createdAt_idx" ON "Dashboard"("createdAt");
CREATE INDEX IF NOT EXISTS "Dashboard_updatedAt_idx" ON "Dashboard"("updatedAt");

-- BrandTracking indexes
CREATE INDEX IF NOT EXISTS "BrandTracking_status_idx" ON "BrandTracking"("status");
CREATE INDEX IF NOT EXISTS "BrandTracking_createdAt_idx" ON "BrandTracking"("createdAt");
CREATE INDEX IF NOT EXISTS "BrandTracking_orgId_status_idx" ON "BrandTracking"("orgId", "status");

-- BrandSnapshot indexes
CREATE INDEX IF NOT EXISTS "BrandTrackingSnapshot_createdAt_idx" ON "BrandTrackingSnapshot"("createdAt");
CREATE INDEX IF NOT EXISTS "BrandTrackingSnapshot_brandId_createdAt_idx" ON "BrandTrackingSnapshot"("brandTrackingId", "createdAt");

-- Audience indexes
CREATE INDEX IF NOT EXISTS "Audience_status_idx" ON "Audience"("status");
CREATE INDEX IF NOT EXISTS "Audience_createdAt_idx" ON "Audience"("createdAt");
CREATE INDEX IF NOT EXISTS "Audience_orgId_status_idx" ON "Audience"("orgId", "status");

-- Crosstab indexes
CREATE INDEX IF NOT EXISTS "Crosstab_status_idx" ON "Crosstab"("status");
CREATE INDEX IF NOT EXISTS "Crosstab_createdAt_idx" ON "Crosstab"("createdAt");

-- Chart indexes
CREATE INDEX IF NOT EXISTS "Chart_type_idx" ON "Chart"("type");
CREATE INDEX IF NOT EXISTS "Chart_createdAt_idx" ON "Chart"("createdAt");

-- Session indexes (for cleanup)
CREATE INDEX IF NOT EXISTS "Session_expires_idx" ON "Session"("expires");

-- VerificationToken indexes (for cleanup)
CREATE INDEX IF NOT EXISTS "VerificationToken_expires_idx" ON "VerificationToken"("expires");
