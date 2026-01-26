import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/db"
import { validateSuperAdminSession } from "@/lib/super-admin"
import { hasGWIPermission } from "@/lib/gwi-permissions"

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

    if (!hasGWIPermission(session.admin.role, "agents:read")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const templates = await prisma.systemAgentTemplate.findMany({
      include: {
        createdBy: { select: { id: true, name: true } },
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
    const token = cookieStore.get("adminToken")?.value

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
    } = body

    if (!name || !category || !configuration) {
      return NextResponse.json(
        { error: "Name, category, and configuration are required" },
        { status: 400 }
      )
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
      },
      include: {
        createdBy: { select: { id: true, name: true } },
      },
    })

    await prisma.gWIAuditLog.create({
      data: {
        adminId: session.admin.id,
        action: "CREATE_AGENT_TEMPLATE",
        resourceType: "agent_template",
        resourceId: template.id,
        newState: { name, category, isPublished },
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
