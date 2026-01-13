import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { validateSuperAdminSession } from "@/lib/super-admin"
import { cookies } from "next/headers"
import { getTenantEntitlements } from "@/lib/entitlements"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("adminToken")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const session = await validateSuperAdminSession(token)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: orgId } = await params

    // Check if org exists
    const org = await prisma.organization.findUnique({
      where: { id: orgId },
      select: { id: true, name: true, planTier: true },
    })

    if (!org) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 })
    }

    // Get entitlements
    const entitlements = await getTenantEntitlements(orgId)

    // Get all entitlement overrides for this tenant
    const overrides = await prisma.tenantEntitlement.findMany({
      where: { orgId },
      include: {
        plan: {
          select: { id: true, name: true, displayName: true },
        },
        feature: {
          select: { id: true, key: true, name: true },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({
      org,
      entitlements,
      overrides,
    })
  } catch (error) {
    console.error("Get tenant entitlements error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("adminToken")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const session = await validateSuperAdminSession(token)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: orgId } = await params
    const body = await request.json()
    const { type, planId, featureId, value, limit, expiresAt, reason } = body

    // Check if org exists
    const org = await prisma.organization.findUnique({
      where: { id: orgId },
    })

    if (!org) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 })
    }

    let entitlement

    if (type === "plan" && planId) {
      // Assign plan to tenant
      // First, deactivate existing plan assignments
      await prisma.tenantEntitlement.updateMany({
        where: {
          orgId,
          planId: { not: null },
          isActive: true,
        },
        data: { isActive: false },
      })

      // Get the plan to update org's planTier
      const plan = await prisma.plan.findUnique({
        where: { id: planId },
      })

      if (!plan) {
        return NextResponse.json({ error: "Plan not found" }, { status: 404 })
      }

      // Create new plan assignment
      entitlement = await prisma.tenantEntitlement.create({
        data: {
          orgId,
          planId,
          expiresAt: expiresAt ? new Date(expiresAt) : null,
          grantedBy: session.admin.id,
          reason,
          isActive: true,
        },
        include: {
          plan: true,
        },
      })

      // Update org's planTier
      await prisma.organization.update({
        where: { id: orgId },
        data: { planTier: plan.tier },
      })

      // Log action
      await prisma.platformAuditLog.create({
        data: {
          adminId: session.admin.id,
          action: "PLAN_ASSIGNED",
          resourceType: "TenantEntitlement",
          resourceId: entitlement.id,
          targetOrgId: orgId,
          details: { planId, planName: plan.name, reason },
        },
      })
    } else if (type === "feature" && featureId) {
      // Grant feature override to tenant
      const feature = await prisma.feature.findUnique({
        where: { id: featureId },
      })

      if (!feature) {
        return NextResponse.json({ error: "Feature not found" }, { status: 404 })
      }

      // Check if override already exists
      const existingOverride = await prisma.tenantEntitlement.findFirst({
        where: {
          orgId,
          featureId,
          isActive: true,
        },
      })

      if (existingOverride) {
        // Update existing override
        entitlement = await prisma.tenantEntitlement.update({
          where: { id: existingOverride.id },
          data: {
            value: value ?? true,
            limit,
            expiresAt: expiresAt ? new Date(expiresAt) : null,
            grantedBy: session.admin.id,
            reason,
          },
          include: { feature: true },
        })
      } else {
        // Create new override
        entitlement = await prisma.tenantEntitlement.create({
          data: {
            orgId,
            featureId,
            value: value ?? true,
            limit,
            expiresAt: expiresAt ? new Date(expiresAt) : null,
            grantedBy: session.admin.id,
            reason,
            isActive: true,
          },
          include: { feature: true },
        })
      }

      // Log action
      await prisma.platformAuditLog.create({
        data: {
          adminId: session.admin.id,
          action: "FEATURE_GRANTED",
          resourceType: "TenantEntitlement",
          resourceId: entitlement.id,
          targetOrgId: orgId,
          details: { featureId, featureKey: feature.key, value, limit, reason },
        },
      })
    } else {
      return NextResponse.json(
        { error: "Invalid request: must specify type (plan or feature) with corresponding ID" },
        { status: 400 }
      )
    }

    return NextResponse.json({ entitlement }, { status: 201 })
  } catch (error) {
    console.error("Create tenant entitlement error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("adminToken")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const session = await validateSuperAdminSession(token)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: orgId } = await params
    const { searchParams } = new URL(request.url)
    const entitlementId = searchParams.get("entitlementId")

    if (!entitlementId) {
      return NextResponse.json(
        { error: "entitlementId is required" },
        { status: 400 }
      )
    }

    // Check if entitlement exists and belongs to this org
    const entitlement = await prisma.tenantEntitlement.findFirst({
      where: {
        id: entitlementId,
        orgId,
      },
      include: {
        plan: true,
        feature: true,
      },
    })

    if (!entitlement) {
      return NextResponse.json(
        { error: "Entitlement not found" },
        { status: 404 }
      )
    }

    // Deactivate the entitlement
    await prisma.tenantEntitlement.update({
      where: { id: entitlementId },
      data: { isActive: false },
    })

    // Log action
    await prisma.platformAuditLog.create({
      data: {
        adminId: session.admin.id,
        action: entitlement.planId ? "PLAN_REVOKED" : "FEATURE_REVOKED",
        resourceType: "TenantEntitlement",
        resourceId: entitlementId,
        targetOrgId: orgId,
        details: {
          planId: entitlement.planId,
          planName: entitlement.plan?.name,
          featureId: entitlement.featureId,
          featureKey: entitlement.feature?.key,
        },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete tenant entitlement error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
