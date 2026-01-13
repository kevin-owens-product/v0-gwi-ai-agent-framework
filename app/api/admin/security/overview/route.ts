import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/db"
import { validateSuperAdminSession } from "@/lib/super-admin"

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("adminToken")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const session = await validateSuperAdminSession(token)
    if (!session) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)

    // Fetch all security-related statistics in parallel
    const [
      totalPolicies,
      activePolicies,
      totalViolations,
      openViolations,
      criticalViolations,
      activeThreats,
      blockedIPs,
      recentViolations,
      totalUsers,
      usersWithMFA,
      orgsWithSSO,
      totalOrgs,
    ] = await Promise.all([
      // Policies
      prisma.securityPolicy.count().catch(() => 0),
      prisma.securityPolicy.count({ where: { isActive: true } }).catch(() => 0),

      // Violations
      prisma.securityViolation.count().catch(() => 0),
      prisma.securityViolation.count({
        where: { status: { in: ["OPEN", "INVESTIGATING"] } },
      }).catch(() => 0),
      prisma.securityViolation.count({
        where: { severity: "CRITICAL", status: { in: ["OPEN", "INVESTIGATING"] } },
      }).catch(() => 0),

      // Threats
      prisma.threatEvent.count({
        where: { status: { in: ["ACTIVE", "CONTAINED"] } },
      }).catch(() => 0),

      // IP Blocklist
      prisma.iPBlocklist.count({ where: { isActive: true } }).catch(() => 0),

      // Recent violations for events
      prisma.securityViolation.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
      }).catch(() => []),

      // User stats
      prisma.user.count().catch(() => 0),
      prisma.superAdmin.count({ where: { twoFactorEnabled: true } }).catch(() => 0),

      // SSO stats
      prisma.enterpriseSSO.count({ where: { status: "ACTIVE" } }).catch(() => 0),
      prisma.organization.count().catch(() => 0),
    ])

    // Calculate adoption rates
    const mfaAdoption = totalUsers > 0 ? Math.round((usersWithMFA / totalUsers) * 100) : 0
    const ssoAdoption = totalOrgs > 0 ? Math.round((orgsWithSSO / totalOrgs) * 100) : 0

    // Get recent login attempts from audit logs
    const recentLoginAttempts = await prisma.platformAuditLog.count({
      where: {
        action: { in: ["login", "login_failed"] },
        timestamp: { gte: twentyFourHoursAgo },
      },
    }).catch(() => 0)

    const failedLogins = await prisma.platformAuditLog.count({
      where: {
        action: "login_failed",
        timestamp: { gte: twentyFourHoursAgo },
      },
    }).catch(() => 0)

    // Format recent events
    const recentEvents = recentViolations.map((v) => ({
      id: v.id,
      type: v.violationType,
      severity: v.severity,
      description: v.description,
      timestamp: v.createdAt.toISOString(),
      orgId: v.orgId,
      userId: v.userId,
    }))

    const stats = {
      totalPolicies,
      activePolicies,
      totalViolations,
      openViolations,
      criticalViolations,
      activeThreats,
      blockedIPs,
      recentLoginAttempts,
      failedLogins,
      suspiciousActivities: activeThreats,
      mfaAdoption,
      ssoAdoption,
    }

    return NextResponse.json({ stats, recentEvents })
  } catch (error) {
    console.error("Security overview error:", error)
    return NextResponse.json(
      { error: "Failed to fetch security overview" },
      { status: 500 }
    )
  }
}
