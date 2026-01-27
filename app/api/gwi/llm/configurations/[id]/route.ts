import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/db"
import { Prisma } from "@prisma/client"
import { validateSuperAdminSession } from "@/lib/super-admin"
import { hasGWIPermission } from "@/lib/gwi-permissions"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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

    const configuration = await prisma.lLMConfiguration.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            usageRecords: true,
          },
        },
      },
    })

    if (!configuration) {
      return NextResponse.json(
        { error: "LLM configuration not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(configuration)
  } catch (error) {
    console.error("Failed to fetch LLM configuration:", error)
    return NextResponse.json(
      { error: "Failed to fetch LLM configuration" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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

    const existingConfiguration = await prisma.lLMConfiguration.findUnique({
      where: { id },
    })

    if (!existingConfiguration) {
      return NextResponse.json(
        { error: "LLM configuration not found" },
        { status: 404 }
      )
    }

    const body = await request.json()
    const {
      name,
      provider,
      model,
      apiKeyRef,
      defaultParams,
      rateLimits,
      isActive,
    } = body

    // Validate required fields if provided
    if (name !== undefined && !name.trim()) {
      return NextResponse.json(
        { error: "Name cannot be empty" },
        { status: 400 }
      )
    }

    if (provider !== undefined && !provider.trim()) {
      return NextResponse.json(
        { error: "Provider cannot be empty" },
        { status: 400 }
      )
    }

    if (model !== undefined && !model.trim()) {
      return NextResponse.json(
        { error: "Model cannot be empty" },
        { status: 400 }
      )
    }

    if (apiKeyRef !== undefined && !apiKeyRef.trim()) {
      return NextResponse.json(
        { error: "API key reference cannot be empty" },
        { status: 400 }
      )
    }

    // Build update data object with only provided fields
    const updateData: Record<string, unknown> = {}
    if (name !== undefined) updateData.name = name.trim()
    if (provider !== undefined) updateData.provider = provider.trim()
    if (model !== undefined) updateData.model = model.trim()
    if (apiKeyRef !== undefined) updateData.apiKeyRef = apiKeyRef.trim()
    if (defaultParams !== undefined) updateData.defaultParams = defaultParams
    if (rateLimits !== undefined) updateData.rateLimits = rateLimits
    if (isActive !== undefined) updateData.isActive = isActive

    // Check for unique constraint violation if provider/model are being updated
    if (provider !== undefined || model !== undefined) {
      const newProvider = provider?.trim() || existingConfiguration.provider
      const newModel = model?.trim() || existingConfiguration.model

      const duplicateCheck = await prisma.lLMConfiguration.findFirst({
        where: {
          provider: newProvider,
          model: newModel,
          id: { not: id },
        },
      })

      if (duplicateCheck) {
        return NextResponse.json(
          { error: "A configuration with this provider and model already exists" },
          { status: 409 }
        )
      }
    }

    const configuration = await prisma.lLMConfiguration.update({
      where: { id },
      data: updateData,
    })

    // Log the action
    await prisma.gWIAuditLog.create({
      data: {
        adminId: session.admin.id,
        action: "UPDATE_LLM_CONFIG",
        resourceType: "llm_configuration",
        resourceId: configuration.id,
        previousState: {
          name: existingConfiguration.name,
          provider: existingConfiguration.provider,
          model: existingConfiguration.model,
          isActive: existingConfiguration.isActive,
        },
        newState: updateData as Prisma.InputJsonValue,
      },
    })

    return NextResponse.json(configuration)
  } catch (error) {
    console.error("Failed to update LLM configuration:", error)
    return NextResponse.json(
      { error: "Failed to update LLM configuration" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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

    const configuration = await prisma.lLMConfiguration.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            usageRecords: true,
          },
        },
      },
    })

    if (!configuration) {
      return NextResponse.json(
        { error: "LLM configuration not found" },
        { status: 404 }
      )
    }

    // Delete associated usage records first (cascade)
    await prisma.lLMUsageRecord.deleteMany({
      where: { configurationId: id },
    })

    // Delete the configuration
    await prisma.lLMConfiguration.delete({
      where: { id },
    })

    // Log the action
    await prisma.gWIAuditLog.create({
      data: {
        adminId: session.admin.id,
        action: "DELETE_LLM_CONFIG",
        resourceType: "llm_configuration",
        resourceId: id,
        previousState: {
          name: configuration.name,
          provider: configuration.provider,
          model: configuration.model,
          isActive: configuration.isActive,
          usageRecordCount: configuration._count.usageRecords,
        },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete LLM configuration:", error)
    return NextResponse.json(
      { error: "Failed to delete LLM configuration" },
      { status: 500 }
    )
  }
}
