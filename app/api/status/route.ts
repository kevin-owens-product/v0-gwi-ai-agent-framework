import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

// Public endpoint - no auth required
export async function GET(_request: NextRequest) {
  try {
    // Get active incidents (not resolved or postmortem)
    const activeIncidents = await prisma.statusPageIncident.findMany({
      where: {
        isPublic: true,
        status: {
          in: ["INVESTIGATING", "IDENTIFIED", "MONITORING"],
        },
      },
      include: {
        updates: {
          where: { isPublic: true },
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
      orderBy: [
        { impact: "desc" },
        { startedAt: "desc" },
      ],
    })

    // Calculate overall system status based on active incidents
    let overallStatus: "operational" | "degraded" | "partial_outage" | "major_outage" = "operational"

    for (const incident of activeIncidents) {
      if (incident.impact === "CRITICAL") {
        overallStatus = "major_outage"
        break
      } else if (incident.impact === "MAJOR") {
        overallStatus = "partial_outage"
      } else if (incident.impact === "MINOR" && overallStatus === "operational") {
        overallStatus = "degraded"
      }
    }

    // Get all affected systems across active incidents
    const affectedSystems = new Set<string>()
    for (const incident of activeIncidents) {
      for (const system of incident.affectedSystems) {
        affectedSystems.add(system)
      }
    }

    // Define system components (these could be pulled from config)
    const systemComponents = [
      { name: "API Gateway", key: "api" },
      { name: "Authentication", key: "auth" },
      { name: "Database", key: "database" },
      { name: "File Storage", key: "storage" },
      { name: "Analytics", key: "analytics" },
      { name: "Search", key: "search" },
      { name: "Notifications", key: "notifications" },
    ]

    // Map components to their status
    const components = systemComponents.map((component) => {
      const isAffected = affectedSystems.has(component.name) || affectedSystems.has(component.key)

      // Find the worst incident affecting this component
      let componentStatus: "operational" | "degraded" | "partial_outage" | "major_outage" = "operational"

      if (isAffected) {
        const affectingIncidents = activeIncidents.filter(
          (i) => i.affectedSystems.includes(component.name) || i.affectedSystems.includes(component.key)
        )

        for (const incident of affectingIncidents) {
          if (incident.impact === "CRITICAL") {
            componentStatus = "major_outage"
            break
          } else if (incident.impact === "MAJOR") {
            componentStatus = "partial_outage"
          } else if (incident.impact === "MINOR" && componentStatus === "operational") {
            componentStatus = "degraded"
          }
        }
      }

      return {
        name: component.name,
        status: componentStatus,
      }
    })

    return NextResponse.json({
      status: overallStatus,
      components,
      activeIncidents: activeIncidents.map((incident) => ({
        id: incident.id,
        title: incident.title,
        description: incident.description,
        status: incident.status,
        impact: incident.impact,
        affectedSystems: incident.affectedSystems,
        startedAt: incident.startedAt.toISOString(),
        resolvedAt: incident.resolvedAt?.toISOString() || null,
        updates: incident.updates.map((update) => ({
          id: update.id,
          status: update.status,
          message: update.message,
          createdAt: update.createdAt.toISOString(),
          isPublic: update.isPublic,
        })),
      })),
      lastUpdated: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Get status error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
