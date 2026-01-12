import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { validateSuperAdminSession, calculateTenantHealthScore } from "@/lib/super-admin"
import { cookies } from "next/headers"

export async function POST() {
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

    // Get all organizations
    const orgs = await prisma.organization.findMany({
      select: { id: true },
    })

    // Calculate health scores for each org
    const results = await Promise.allSettled(
      orgs.map(org => calculateTenantHealthScore(org.id))
    )

    const succeeded = results.filter(r => r.status === "fulfilled").length
    const failed = results.filter(r => r.status === "rejected").length

    return NextResponse.json({
      success: true,
      calculated: succeeded,
      failed,
      total: orgs.length,
    })
  } catch (error) {
    console.error("Calculate health scores error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
