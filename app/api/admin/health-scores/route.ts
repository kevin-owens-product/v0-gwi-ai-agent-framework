/**
 * @prompt-id forge-v4.1:feature:customer-health-scoring:002
 * @generated-at 2026-01-25T00:00:00Z
 * @model claude-opus-4-5
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { validateSuperAdminSession } from "@/lib/super-admin"
import { cookies } from "next/headers"
import type { ChurnRisk } from "@prisma/client"

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
    const churnRisk = searchParams.get("churnRisk") as ChurnRisk | null
    const minScore = searchParams.get("minScore")
    const maxScore = searchParams.get("maxScore")
    const planTier = searchParams.get("planTier")
    const page = parseInt(searchParams.get("page") || "1", 10)
    const limit = parseInt(searchParams.get("limit") || "20", 10)

    // Build filter criteria
    const where: Record<string, unknown> = {}

    if (churnRisk && churnRisk !== "all") {
      where.churnRisk = churnRisk
    }

    if (minScore || maxScore) {
      where.overallScore = {}
      if (minScore) {
        (where.overallScore as Record<string, number>).gte = parseInt(minScore, 10)
      }
      if (maxScore) {
        (where.overallScore as Record<string, number>).lte = parseInt(maxScore, 10)
      }
    }

    // Get distinct latest scores per org using subquery approach
    const scores = await prisma.customerHealthScore.findMany({
      where,
      orderBy: [{ calculatedAt: "desc" }],
      distinct: ["orgId"],
      skip: (page - 1) * limit,
      take: limit,
    })

    // Get total count of unique orgs with scores
    const totalOrgs = await prisma.customerHealthScore.groupBy({
      by: ["orgId"],
      where,
    })

    // Get organization details
    const orgIds = scores.map(s => s.orgId)
    const orgs = await prisma.organization.findMany({
      where: {
        id: { in: orgIds },
        ...(planTier && planTier !== "all" ? { planTier } : {}),
      },
      select: { id: true, name: true, slug: true, planTier: true },
    })

    const orgMap = new Map(orgs.map(o => [o.id, o]))

    // Filter scores to only include orgs that match planTier filter
    const filteredScores = planTier && planTier !== "all"
      ? scores.filter(s => orgMap.has(s.orgId))
      : scores

    const scoresWithOrgs = filteredScores.map(score => ({
      ...score,
      organization: orgMap.get(score.orgId),
    }))

    // Calculate summary statistics
    const allScores = await prisma.customerHealthScore.findMany({
      where,
      orderBy: [{ calculatedAt: "desc" }],
      distinct: ["orgId"],
      select: {
        overallScore: true,
        churnRisk: true,
      },
    })

    const summary = {
      total: totalOrgs.length,
      avgScore: allScores.length > 0
        ? Math.round(allScores.reduce((sum, s) => sum + s.overallScore, 0) / allScores.length)
        : 0,
      byRisk: {
        LOW: allScores.filter(s => s.churnRisk === "LOW").length,
        MEDIUM: allScores.filter(s => s.churnRisk === "MEDIUM").length,
        HIGH: allScores.filter(s => s.churnRisk === "HIGH").length,
        CRITICAL: allScores.filter(s => s.churnRisk === "CRITICAL").length,
      },
    }

    return NextResponse.json({
      scores: scoresWithOrgs,
      total: planTier && planTier !== "all" ? filteredScores.length : totalOrgs.length,
      page,
      limit,
      totalPages: Math.ceil((planTier && planTier !== "all" ? filteredScores.length : totalOrgs.length) / limit),
      summary,
    })
  } catch (error) {
    console.error("Get health scores error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
