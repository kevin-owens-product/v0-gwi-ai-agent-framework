-- CreateEnum
CREATE TYPE "FeatureCategory" AS ENUM ('CORE', 'ANALYTICS', 'AGENTS', 'INTEGRATIONS', 'SECURITY', 'SUPPORT', 'CUSTOMIZATION', 'API', 'ADVANCED');

-- CreateEnum
CREATE TYPE "FeatureValueType" AS ENUM ('BOOLEAN', 'NUMBER', 'STRING', 'JSON');

-- CreateTable
CREATE TABLE "Plan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "description" TEXT,
    "tier" "PlanTier" NOT NULL DEFAULT 'STARTER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "monthlyPrice" INTEGER NOT NULL DEFAULT 0,
    "yearlyPrice" INTEGER NOT NULL DEFAULT 0,
    "stripePriceIdMonthly" TEXT,
    "stripePriceIdYearly" TEXT,
    "trialDays" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Feature" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" "FeatureCategory" NOT NULL DEFAULT 'CORE',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "valueType" "FeatureValueType" NOT NULL DEFAULT 'BOOLEAN',
    "defaultValue" JSONB NOT NULL DEFAULT 'false',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Feature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanFeature" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "featureId" TEXT NOT NULL,
    "value" JSONB NOT NULL DEFAULT 'true',
    "limit" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlanFeature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenantEntitlement" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "planId" TEXT,
    "featureId" TEXT,
    "value" JSONB,
    "limit" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" TIMESTAMP(3),
    "grantedBy" TEXT,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TenantEntitlement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Plan_name_key" ON "Plan"("name");

-- CreateIndex
CREATE INDEX "Plan_tier_idx" ON "Plan"("tier");

-- CreateIndex
CREATE INDEX "Plan_isActive_idx" ON "Plan"("isActive");

-- CreateIndex
CREATE INDEX "Plan_isPublic_idx" ON "Plan"("isPublic");

-- CreateIndex
CREATE UNIQUE INDEX "Feature_key_key" ON "Feature"("key");

-- CreateIndex
CREATE INDEX "Feature_key_idx" ON "Feature"("key");

-- CreateIndex
CREATE INDEX "Feature_category_idx" ON "Feature"("category");

-- CreateIndex
CREATE INDEX "Feature_isActive_idx" ON "Feature"("isActive");

-- CreateIndex
CREATE INDEX "PlanFeature_planId_idx" ON "PlanFeature"("planId");

-- CreateIndex
CREATE INDEX "PlanFeature_featureId_idx" ON "PlanFeature"("featureId");

-- CreateIndex
CREATE UNIQUE INDEX "PlanFeature_planId_featureId_key" ON "PlanFeature"("planId", "featureId");

-- CreateIndex
CREATE INDEX "TenantEntitlement_orgId_idx" ON "TenantEntitlement"("orgId");

-- CreateIndex
CREATE INDEX "TenantEntitlement_planId_idx" ON "TenantEntitlement"("planId");

-- CreateIndex
CREATE INDEX "TenantEntitlement_featureId_idx" ON "TenantEntitlement"("featureId");

-- CreateIndex
CREATE INDEX "TenantEntitlement_isActive_idx" ON "TenantEntitlement"("isActive");

-- CreateIndex
CREATE INDEX "TenantEntitlement_expiresAt_idx" ON "TenantEntitlement"("expiresAt");

-- AddForeignKey
ALTER TABLE "PlanFeature" ADD CONSTRAINT "PlanFeature_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanFeature" ADD CONSTRAINT "PlanFeature_featureId_fkey" FOREIGN KEY ("featureId") REFERENCES "Feature"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantEntitlement" ADD CONSTRAINT "TenantEntitlement_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantEntitlement" ADD CONSTRAINT "TenantEntitlement_featureId_fkey" FOREIGN KEY ("featureId") REFERENCES "Feature"("id") ON DELETE CASCADE ON UPDATE CASCADE;
