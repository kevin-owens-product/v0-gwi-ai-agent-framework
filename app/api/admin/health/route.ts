import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { validateSuperAdminSession } from "@/lib/super-admin"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const riskLevel = searchParams.get("riskLevel")

    const where: Record<string, unknown> = {}
    if (riskLevel && riskLevel !== "all") {
      where.riskLevel = riskLevel
    }

    // Get most recent health score for each org
    const scores = await prisma.tenantHealthScore.findMany({
      where,
      orderBy: [
        { calculatedAt: "desc" },
      ],
      distinct: ["orgId"],
    })

    // Get organization details for each score
    const orgIds = scores.map(s => s.orgId)
    const orgs = await prisma.organization.findMany({
      where: { id: { in: orgIds } },
      select: { id: true, name: true, slug: true, planTier: true },
    })

    const orgMap = new Map(orgs.map(o => [o.id, o]))

    const scoresWithOrgs = scores.map(score => ({
      ...score,
      organization: orgMap.get(score.orgId),
    }))

    return NextResponse.json({ scores: scoresWithOrgs })
  } catch (error) {
    console.error("Get health scores error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
