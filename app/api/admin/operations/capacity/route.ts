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
    const metricType = searchParams.get("metricType")
    const region = searchParams.get("region")
    const service = searchParams.get("service")
    const status = searchParams.get("status")
    const limit = parseInt(searchParams.get("limit") || "100")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    const where: Record<string, unknown> = {}

    if (metricType) {
      where.metricType = metricType
    }

    if (region) {
      where.region = region
    }

    if (service) {
      where.service = service
    }

    if (status) {
      where.status = status
    }

    if (startDate || endDate) {
      where.recordedAt = {}
      if (startDate) {
        (where.recordedAt as Record<string, Date>).gte = new Date(startDate)
      }
      if (endDate) {
        (where.recordedAt as Record<string, Date>).lte = new Date(endDate)
      }
    }

    // Get latest metrics per type/region/service combination
    const metrics = await prisma.capacityMetric.findMany({
      where,
      orderBy: { recordedAt: "desc" },
      take: limit,
    })

    // Get unique values for filters
    const [metricTypes, regions, services] = await Promise.all([
      prisma.capacityMetric.findMany({
        select: { metricType: true },
        distinct: ["metricType"],
      }),
      prisma.capacityMetric.findMany({
        select: { region: true },
        distinct: ["region"],
        where: { region: { not: null } },
      }),
      prisma.capacityMetric.findMany({
        select: { service: true },
        distinct: ["service"],
        where: { service: { not: null } },
      }),
    ])

    // Calculate overall health score
    const recentMetrics = await prisma.capacityMetric.findMany({
      where: {
        recordedAt: {
          gte: new Date(Date.now() - 60 * 60 * 1000),
        },
      },
      orderBy: { recordedAt: "desc" },
    })

    // Deduplicate to get latest per metric type/region/service
    const latestMetricsMap = new Map<string, typeof recentMetrics[0]>()
    for (const metric of recentMetrics) {
      const key = `${metric.metricType}-${metric.region}-${metric.service}`
      if (!latestMetricsMap.has(key)) {
        latestMetricsMap.set(key, metric)
      }
    }
    const latestMetrics = Array.from(latestMetricsMap.values())

    const criticalCount = latestMetrics.filter(m => m.status === "CRITICAL" || m.status === "OVER_CAPACITY").length
    const warningCount = latestMetrics.filter(m => m.status === "WARNING").length
    const normalCount = latestMetrics.filter(m => m.status === "NORMAL").length
    const totalCount = latestMetrics.length

    const healthScore = totalCount > 0
      ? Math.round(((normalCount * 100 + warningCount * 50) / (totalCount * 100)) * 100)
      : 100

    // Get historical data for trending
    const historicalMetrics = await prisma.capacityMetric.findMany({
      where: {
        recordedAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        },
      },
      orderBy: { recordedAt: "asc" },
      select: {
        metricType: true,
        currentValue: true,
        maxValue: true,
        recordedAt: true,
        region: true,
        service: true,
      },
    })

    return NextResponse.json({
      metrics,
      summary: {
        healthScore,
        statusCounts: {
          normal: normalCount,
          warning: warningCount,
          critical: criticalCount,
          total: totalCount,
        },
      },
      filters: {
        metricTypes: metricTypes.map(m => m.metricType),
        regions: regions.map(r => r.region).filter(Boolean),
        services: services.map(s => s.service).filter(Boolean),
      },
      historicalMetrics,
    })
  } catch (error) {
    console.error("Get capacity metrics error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

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

    const {
      metricType,
      region,
      service,
      currentValue,
      maxValue,
      threshold = 80,
      unit = "percent",
    } = body

    if (!metricType || currentValue === undefined || maxValue === undefined) {
      return NextResponse.json(
        { error: "metricType, currentValue, and maxValue are required" },
        { status: 400 }
      )
    }

    // Calculate status based on usage percentage
    const usagePercent = (currentValue / maxValue) * 100
    let status: "NORMAL" | "WARNING" | "CRITICAL" | "OVER_CAPACITY" = "NORMAL"
    if (usagePercent >= 100) {
      status = "OVER_CAPACITY"
    } else if (usagePercent >= 90) {
      status = "CRITICAL"
    } else if (usagePercent >= threshold) {
      status = "WARNING"
    }

    const metric = await prisma.capacityMetric.create({
      data: {
        metricType,
        region,
        service,
        currentValue,
        maxValue,
        threshold,
        unit,
        status,
        recordedAt: new Date(),
      },
    })

    return NextResponse.json({ metric }, { status: 201 })
  } catch (error) {
    console.error("Create capacity metric error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
