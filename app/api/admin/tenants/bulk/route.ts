import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { validateSuperAdminSession, logPlatformAudit } from "@/lib/super-admin"
import { cookies } from "next/headers"

// Bulk operations for tenants
export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const { action, tenantIds, data } = body

    if (!action || !tenantIds || !Array.isArray(tenantIds) || tenantIds.length === 0) {
      return NextResponse.json(
        { error: "action and tenantIds array are required" },
        { status: 400 }
      )
    }

    // Limit bulk operations to 100 at a time
    if (tenantIds.length > 100) {
      return NextResponse.json(
        { error: "Maximum 100 tenants per bulk operation" },
        { status: 400 }
      )
    }

    let result: { success: number; failed: number; errors: string[] }

    switch (action) {
      case "suspend":
        result = await bulkSuspend(tenantIds, data, session.adminId)
        break
      case "unsuspend":
        result = await bulkUnsuspend(tenantIds, session.adminId)
        break
      case "updatePlan":
        result = await bulkUpdatePlan(tenantIds, data?.planTier, session.adminId)
        break
      case "delete":
        result = await bulkDelete(tenantIds, session.adminId)
        break
      case "enableHierarchy":
        result = await bulkEnableHierarchy(tenantIds, session.adminId)
        break
      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Bulk tenant operation error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

async function bulkSuspend(
  tenantIds: string[],
  data: { reason?: string; suspensionType?: string } = {},
  adminId: string
) {
  const result = { success: 0, failed: 0, errors: [] as string[] }
  const reason = data.reason || "Bulk suspension by admin"
  const suspensionType = data.suspensionType || "FULL"

  for (const tenantId of tenantIds) {
    try {
      await prisma.organizationSuspension.create({
        data: {
          orgId: tenantId,
          reason,
          suspendedBy: adminId,
          suspensionType: suspensionType as "FULL" | "PARTIAL" | "BILLING_HOLD" | "INVESTIGATION",
        },
      })

      await logPlatformAudit({
        adminId,
        action: "bulk_suspend_organization",
        resourceType: "organization",
        resourceId: tenantId,
        targetOrgId: tenantId,
        details: { reason, suspensionType },
      })

      result.success++
    } catch (error) {
      result.failed++
      result.errors.push(`${tenantId}: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  return result
}

async function bulkUnsuspend(tenantIds: string[], adminId: string) {
  const result = { success: 0, failed: 0, errors: [] as string[] }

  for (const tenantId of tenantIds) {
    try {
      await prisma.organizationSuspension.updateMany({
        where: { orgId: tenantId, isActive: true },
        data: { isActive: false },
      })

      await logPlatformAudit({
        adminId,
        action: "bulk_lift_suspension",
        resourceType: "organization",
        resourceId: tenantId,
        targetOrgId: tenantId,
      })

      result.success++
    } catch (error) {
      result.failed++
      result.errors.push(`${tenantId}: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  return result
}

async function bulkUpdatePlan(tenantIds: string[], planTier: string, adminId: string) {
  const result = { success: 0, failed: 0, errors: [] as string[] }

  if (!planTier || !["STARTER", "PROFESSIONAL", "ENTERPRISE"].includes(planTier)) {
    result.errors.push("Invalid plan tier")
    result.failed = tenantIds.length
    return result
  }

  for (const tenantId of tenantIds) {
    try {
      await prisma.organization.update({
        where: { id: tenantId },
        data: { planTier: planTier as "STARTER" | "PROFESSIONAL" | "ENTERPRISE" },
      })

      await logPlatformAudit({
        adminId,
        action: "bulk_update_plan",
        resourceType: "organization",
        resourceId: tenantId,
        targetOrgId: tenantId,
        details: { planTier },
      })

      result.success++
    } catch (error) {
      result.failed++
      result.errors.push(`${tenantId}: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  return result
}

async function bulkDelete(tenantIds: string[], adminId: string) {
  const result = { success: 0, failed: 0, errors: [] as string[] }

  for (const tenantId of tenantIds) {
    try {
      // Check if tenant has children
      const childCount = await prisma.organization.count({
        where: { parentOrgId: tenantId },
      })

      if (childCount > 0) {
        result.failed++
        result.errors.push(`${tenantId}: Cannot delete - has ${childCount} child organizations`)
        continue
      }

      // Log before delete
      await logPlatformAudit({
        adminId,
        action: "bulk_delete_organization",
        resourceType: "organization",
        resourceId: tenantId,
        targetOrgId: tenantId,
      })

      // Delete the organization (cascade will handle related records)
      await prisma.organization.delete({
        where: { id: tenantId },
      })

      result.success++
    } catch (error) {
      result.failed++
      result.errors.push(`${tenantId}: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  return result
}

async function bulkEnableHierarchy(tenantIds: string[], adminId: string) {
  const result = { success: 0, failed: 0, errors: [] as string[] }

  for (const tenantId of tenantIds) {
    try {
      await prisma.organization.update({
        where: { id: tenantId },
        data: { allowChildOrgs: true },
      })

      await logPlatformAudit({
        adminId,
        action: "bulk_enable_hierarchy",
        resourceType: "organization",
        resourceId: tenantId,
        targetOrgId: tenantId,
      })

      result.success++
    } catch (error) {
      result.failed++
      result.errors.push(`${tenantId}: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  return result
}
