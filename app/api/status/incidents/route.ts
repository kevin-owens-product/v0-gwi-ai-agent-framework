import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

// Public endpoint - no auth required
// Get incident history (last 30 days by default)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const days = parseInt(searchParams.get("days") || "30")

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    startDate.setHours(0, 0, 0, 0)

    const where = {
      isPublic: true,
      startedAt: { gte: startDate },
    }

    const [incidents, total] = await Promise.all([
      prisma.statusPageIncident.findMany({
        where,
        include: {
          updates: {
            where: { isPublic: true },
            orderBy: { createdAt: "desc" },
          },
        },
        orderBy: { startedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.statusPageIncident.count({ where }),
    ])

    return NextResponse.json({
      incidents: incidents.map((incident) => ({
        id: incident.id,
        title: incident.title,
        description: incident.description,
        status: incident.status,
        impact: incident.impact,
        affectedSystems: incident.affectedSystems,
        startedAt: incident.startedAt.toISOString(),
        resolvedAt: incident.resolvedAt?.toISOString() || null,
        postmortemUrl: incident.postmortemUrl,
        updates: incident.updates.map((update) => ({
          id: update.id,
          status: update.status,
          message: update.message,
          createdAt: update.createdAt.toISOString(),
          isPublic: update.isPublic,
        })),
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error("Get incident history error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
