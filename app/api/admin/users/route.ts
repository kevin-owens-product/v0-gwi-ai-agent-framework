import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { validateSuperAdminSession } from "@/lib/super-admin"
import { cookies } from "next/headers"
import { Role } from "@prisma/client"
import bcrypt from "bcryptjs"

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
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const search = searchParams.get("search")
    const status = searchParams.get("status")

    const where: Record<string, unknown> = {}

    if (search) {
      where.OR = [
        { email: { contains: search, mode: "insensitive" } },
        { name: { contains: search, mode: "insensitive" } },
      ]
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          memberships: {
            include: {
              organization: {
                select: { id: true, name: true, slug: true },
              },
            },
          },
          _count: {
            select: { sessions: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.user.count({ where }),
    ])

    // Get ban status
    const bans = await prisma.userBan.findMany({
      where: {
        userId: { in: users.map(u => u.id) },
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
    })

    const banMap = new Map(bans.map(b => [b.userId, b]))

    let usersWithStatus = users.map(user => ({
      ...user,
      isBanned: banMap.has(user.id),
      ban: banMap.get(user.id),
    }))

    if (status === "banned") {
      usersWithStatus = usersWithStatus.filter(u => u.isBanned)
    } else if (status === "active") {
      usersWithStatus = usersWithStatus.filter(u => !u.isBanned)
    }

    return NextResponse.json({
      users: usersWithStatus,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error("Get users error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// Create a new user
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
      email,
      name,
      password,
      avatarUrl,
      orgId,
      role = "MEMBER",
      sendInvite = false,
    } = body

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      // If org specified, just add them to the org
      if (orgId) {
        const existingMembership = await prisma.organizationMember.findUnique({
          where: {
            orgId_userId: {
              orgId,
              userId: existingUser.id,
            },
          },
        })

        if (existingMembership) {
          return NextResponse.json(
            { error: "User is already a member of this organization" },
            { status: 400 }
          )
        }

        await prisma.organizationMember.create({
          data: {
            orgId,
            userId: existingUser.id,
            role: role as Role,
          },
        })

        return NextResponse.json({
          user: existingUser,
          message: "User added to organization",
        })
      }

      return NextResponse.json({ error: "User with this email already exists" }, { status: 400 })
    }

    // Hash password if provided
    let passwordHash: string | undefined
    if (password) {
      passwordHash = await bcrypt.hash(password, 10)
    }

    // Create the user
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email,
          name: name || null,
          passwordHash,
          avatarUrl: avatarUrl || null,
          emailVerified: sendInvite ? null : new Date(), // Mark as verified if not sending invite
        },
      })

      // If org specified, add as member
      if (orgId) {
        // Verify org exists
        const org = await tx.organization.findUnique({ where: { id: orgId } })
        if (!org) {
          throw new Error("Organization not found")
        }

        await tx.organizationMember.create({
          data: {
            orgId,
            userId: newUser.id,
            role: role as Role,
          },
        })
      }

      // Log to audit
      if (orgId) {
        await tx.auditLog.create({
          data: {
            orgId,
            userId: newUser.id,
            action: "user.created",
            details: {
              email: newUser.email,
              role,
              createdBy: session.adminId,
            },
          },
        })
      }

      return newUser
    })

    return NextResponse.json({ user }, { status: 201 })
  } catch (error) {
    console.error("Create user error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    )
  }
}
