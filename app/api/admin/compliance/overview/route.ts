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

    // Fetch compliance statistics in parallel
    const [
      totalFrameworks,
      activeFrameworks,
      compliantAttestations,
      nonCompliantAttestations,
      pendingAudits,
      activeLegalHolds,
      pendingExports,
      retentionPolicies,
      frameworks,
      recentExports,
      recentLegalHolds,
    ] = await Promise.all([
      // Total frameworks
      prisma.complianceFramework.count().catch(() => 0),

      // Active frameworks
      prisma.complianceFramework.count({ where: { isActive: true } }).catch(() => 0),

      // Compliant attestations
      prisma.complianceAttestation.count({
        where: { status: "COMPLIANT" },
      }).catch(() => 0),

      // Non-compliant attestations
      prisma.complianceAttestation.count({
        where: { status: "NON_COMPLIANT" },
      }).catch(() => 0),

      // Pending audits
      prisma.complianceAudit.count({
        where: { status: { in: ["SCHEDULED", "IN_PROGRESS"] } },
      }).catch(() => 0),

      // Active legal holds
      prisma.legalHold.count({
        where: { status: "ACTIVE" },
      }).catch(() => 0),

      // Pending exports
      prisma.dataExport.count({
        where: { status: { in: ["PENDING", "PROCESSING"] } },
      }).catch(() => 0),

      // Retention policies
      prisma.dataRetentionPolicy.count({
        where: { isActive: true },
      }).catch(() => 0),

      // Frameworks with stats
      prisma.complianceFramework.findMany({
        where: { isActive: true },
        include: {
          _count: {
            select: { attestations: true },
          },
          attestations: {
            where: { status: "COMPLIANT" },
          },
        },
      }).catch(() => []),

      // Recent exports
      prisma.dataExport.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
      }).catch(() => []),

      // Recent legal holds
      prisma.legalHold.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
      }).catch(() => []),
    ])

    // Calculate overall compliance score
    const totalAttestations = compliantAttestations + nonCompliantAttestations
    const overallComplianceScore = totalAttestations > 0
      ? Math.round((compliantAttestations / totalAttestations) * 100)
      : 100

    // Get unique compliant orgs
    const compliantOrgs = compliantAttestations
    const nonCompliantOrgs = nonCompliantAttestations

    // Format frameworks data
    const formattedFrameworks = frameworks.map((framework) => ({
      id: framework.id,
      name: framework.name,
      code: framework.code,
      attestationCount: framework._count.attestations,
      compliantCount: framework.attestations.length,
      score: framework._count.attestations > 0
        ? Math.round((framework.attestations.length / framework._count.attestations) * 100)
        : 100,
    }))

    // Format recent activity
    const recentActivity = [
      ...recentExports.map((exp) => ({
        id: exp.id,
        type: "DATA_EXPORT",
        description: `${exp.type} export requested`,
        timestamp: exp.createdAt.toISOString(),
        status: exp.status,
      })),
      ...recentLegalHolds.map((hold) => ({
        id: hold.id,
        type: "LEGAL_HOLD",
        description: `Legal hold: ${hold.name}`,
        timestamp: hold.createdAt.toISOString(),
        status: hold.status,
      })),
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10)

    const stats = {
      totalFrameworks,
      activeFrameworks,
      compliantOrgs,
      nonCompliantOrgs,
      pendingAudits,
      activeLegalHolds,
      pendingExports,
      retentionPolicies,
      overallComplianceScore,
    }

    return NextResponse.json({
      stats,
      frameworks: formattedFrameworks,
      recentActivity,
    })
  } catch (error) {
    console.error("Compliance overview error:", error)
    return NextResponse.json(
      { error: "Failed to fetch compliance overview" },
      { status: 500 }
    )
  }
}
