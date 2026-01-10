import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { z } from "zod"
import { logAuditEvent, createAuditEventFromRequest } from "@/lib/audit"
import { recordUsage } from "@/lib/billing"
import { cookies } from "next/headers"
import { getUserMembership } from "@/lib/tenant"
import { hasPermission } from "@/lib/permissions"

const createTemplateSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  category: z.enum(["research", "analysis", "briefs", "custom"]),
  prompt: z.string().min(1),
  tags: z.array(z.string()).optional(),
  variables: z.array(z.object({
    name: z.string(),
    type: z.enum(["text", "number", "select", "multiselect"]),
    required: z.boolean(),
    defaultValue: z.any().optional(),
    options: z.array(z.string()).optional(),
  })).optional(),
})

async function getOrgId(request: NextRequest, userId: string): Promise<string | null> {
  const headerOrgId = request.headers.get('x-organization-id')
  if (headerOrgId) return headerOrgId

  const cookieStore = await cookies()
  const memberships = await prisma.organizationMember.findMany({
    where: { userId },
    include: { organization: true },
    orderBy: { joinedAt: 'asc' },
  })

  if (memberships.length === 0) return null

  return cookieStore.get('currentOrgId')?.value || memberships[0].organization.id
}

// GET /api/v1/templates - List templates
export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const orgId = await getOrgId(req, session.user.id)
    if (!orgId) {
      return NextResponse.json({ error: "No organization found" }, { status: 404 })
    }

    const membership = await getUserMembership(session.user.id, orgId)
    if (!membership) {
      return NextResponse.json({ error: 'Not a member of this organization' }, { status: 403 })
    }

    if (!hasPermission(membership.role, 'dashboards:read')) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Math.min(Number.parseInt(searchParams.get("limit") || "20"), 100)
    const category = searchParams.get("category")
    const search = searchParams.get("search")
    const scope = searchParams.get("scope") || "all" // "all", "my", "global"

    const where: any = {
      OR: [
        { orgId }, // Organization templates
        { isGlobal: true }, // Global templates
      ],
    }

    if (scope === "my") {
      where.createdBy = session.user.id
      delete where.OR
      where.orgId = orgId
    } else if (scope === "global") {
      where.isGlobal = true
      delete where.OR
    }

    if (category && category !== "all") {
      where.category = category.toUpperCase()
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { tags: { has: search.toLowerCase() } },
      ]
    }

    const [templates, total] = await Promise.all([
      prisma.template.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [
          { usageCount: "desc" },
          { createdAt: "desc" },
        ],
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.template.count({ where }),
    ])

    recordUsage(orgId, "API_CALLS", 1).catch(console.error)

    return NextResponse.json({
      templates,
      data: templates,
      total,
      meta: {
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching templates:", error)
    return NextResponse.json({ error: "Failed to fetch templates" }, { status: 500 })
  }
}

// POST /api/v1/templates - Create template
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const orgId = await getOrgId(req, session.user.id)
    if (!orgId) {
      return NextResponse.json({ error: "No organization found" }, { status: 404 })
    }

    const membership = await getUserMembership(session.user.id, orgId)
    if (!membership) {
      return NextResponse.json({ error: 'Not a member of this organization' }, { status: 403 })
    }

    if (!hasPermission(membership.role, 'dashboards:write')) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    const body = await req.json()
    const validated = createTemplateSchema.parse(body)

    const template = await prisma.template.create({
      data: {
        orgId,
        name: validated.name,
        description: validated.description,
        category: validated.category.toUpperCase(),
        prompt: validated.prompt,
        tags: validated.tags || [],
        variables: validated.variables || [],
        createdBy: session.user.id,
        usageCount: 0,
        isGlobal: false,
        isFavorite: false,
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    await logAuditEvent(createAuditEventFromRequest(req, {
      orgId,
      userId: session.user.id,
      action: "create",
      resourceType: "template",
      resourceId: template.id,
      metadata: { name: template.name, category: template.category },
    }))

    recordUsage(orgId, "API_CALLS", 1).catch(console.error)

    return NextResponse.json(template, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error("Error creating template:", error)
    return NextResponse.json({ error: "Failed to create template" }, { status: 500 })
  }
}
