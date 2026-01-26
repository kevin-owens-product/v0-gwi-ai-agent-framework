import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/db"
import { validateSuperAdminSession } from "@/lib/super-admin"
import { hasGWIPermission } from "@/lib/gwi-permissions"

// Helper to get organization ID from request
function getOrganizationId(request: NextRequest): string | null {
  return request.headers.get("X-Organization-Id")
}

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("gwiToken")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const session = await validateSuperAdminSession(token)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!hasGWIPermission(session.admin.role, "agents:read")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const orgId = getOrganizationId(request)

    // For agent templates, show both global (orgId=null) and org-specific templates
    const where: Record<string, unknown> = orgId
      ? {
          OR: [
            { orgId: null },  // Global templates
            { orgId: orgId }, // Org-specific templates
          ],
        }
      : {}

    const templates = await prisma.systemAgentTemplate.findMany({
      where,
      include: {
        createdBy: { select: { id: true, name: true } },
        organization: { select: { id: true, name: true, slug: true } },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(templates)
  } catch (error) {
    console.error("Failed to fetch agent templates:", error)
    return NextResponse.json(
      { error: "Failed to fetch templates" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("gwiToken")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const session = await validateSuperAdminSession(token)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!hasGWIPermission(session.admin.role, "agents:write")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const {
      name,
      description,
      category,
      configuration,
      defaultTools,
      defaultPrompts,
      isPublished = false,
      orgId,
      isGlobal = false, // If true, creates a global template (orgId=null)
    } = body
    const headerOrgId = getOrganizationId(request)
    // If isGlobal is true, don't set orgId; otherwise use provided orgId or header
    const organizationId = isGlobal ? null : (orgId || headerOrgId)

    if (!name || !category || !configuration) {
      return NextResponse.json(
        { error: "Name, category, and configuration are required" },
        { status: 400 }
      )
    }

    // Validate organization exists if provided
    if (organizationId) {
      const org = await prisma.organization.findUnique({
        where: { id: organizationId },
      })
      if (!org) {
        return NextResponse.json(
          { error: "Organization not found" },
          { status: 404 }
        )
      }
    }

    const template = await prisma.systemAgentTemplate.create({
      data: {
        name,
        description,
        category,
        configuration,
        defaultTools,
        defaultPrompts,
        isPublished,
        createdById: session.admin.id,
        orgId: organizationId,
      },
      include: {
        createdBy: { select: { id: true, name: true } },
        organization: { select: { id: true, name: true, slug: true } },
      },
    })

    await prisma.gWIAuditLog.create({
      data: {
        adminId: session.admin.id,
        action: "CREATE_AGENT_TEMPLATE",
        resourceType: "agent_template",
        resourceId: template.id,
        newState: { name, category, isPublished, orgId: organizationId, isGlobal },
      },
    })

    return NextResponse.json(template, { status: 201 })
  } catch (error) {
    console.error("Failed to create agent template:", error)
    return NextResponse.json(
      { error: "Failed to create template" },
      { status: 500 }
    )
  }
}
