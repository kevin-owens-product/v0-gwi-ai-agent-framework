import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/db"
import { validateSuperAdminSession } from "@/lib/super-admin"
import { hasGWIPermission } from "@/lib/gwi-permissions"

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

    if (!hasGWIPermission(session.admin.role, "llm:read")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const configurations = await prisma.lLMConfiguration.findMany({
      include: {
        _count: { select: { usageRecords: true } },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(configurations)
  } catch (error) {
    console.error("Failed to fetch LLM configurations:", error)
    return NextResponse.json(
      { error: "Failed to fetch configurations" },
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

    if (!hasGWIPermission(session.admin.role, "llm:write")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const {
      name,
      provider,
      model,
      apiKeyRef,
      defaultParams,
      rateLimits,
      isActive = true,
    } = body

    if (!name || !provider || !model || !apiKeyRef) {
      return NextResponse.json(
        { error: "Name, provider, model, and API key reference are required" },
        { status: 400 }
      )
    }

    const configuration = await prisma.lLMConfiguration.create({
      data: {
        name,
        provider,
        model,
        apiKeyRef,
        defaultParams,
        rateLimits,
        isActive,
      },
    })

    await prisma.gWIAuditLog.create({
      data: {
        adminId: session.admin.id,
        action: "CREATE_LLM_CONFIG",
        resourceType: "llm_configuration",
        resourceId: configuration.id,
        newState: { name, provider, model },
      },
    })

    return NextResponse.json(configuration, { status: 201 })
  } catch (error) {
    console.error("Failed to create LLM configuration:", error)
    return NextResponse.json(
      { error: "Failed to create configuration" },
      { status: 500 }
    )
  }
}
