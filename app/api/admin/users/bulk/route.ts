import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { validateSuperAdminSession, logPlatformAudit } from "@/lib/super-admin"
import { cookies } from "next/headers"
import { Role } from "@prisma/client"
import bcrypt from "bcryptjs"

// Bulk operations for users
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
    const { action, userIds, data } = body

    // For import action, we handle differently
    if (action === "import") {
      return handleBulkImport(data, session.adminId)
    }

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { error: "userIds array is required" },
        { status: 400 }
      )
    }

    // Limit bulk operations to 100 at a time
    if (userIds.length > 100) {
      return NextResponse.json(
        { error: "Maximum 100 users per bulk operation" },
        { status: 400 }
      )
    }

    let result: { success: number; failed: number; errors: string[] }

    switch (action) {
      case "ban":
        result = await bulkBan(userIds, data, session.adminId)
        break
      case "unban":
        result = await bulkUnban(userIds, session.adminId)
        break
      case "addToOrg":
        result = await bulkAddToOrg(userIds, data?.orgId, data?.role, session.adminId)
        break
      case "removeFromOrg":
        result = await bulkRemoveFromOrg(userIds, data?.orgId, session.adminId)
        break
      case "updateRole":
        result = await bulkUpdateRole(userIds, data?.orgId, data?.role, session.adminId)
        break
      case "delete":
        result = await bulkDelete(userIds, session.adminId)
        break
      case "resetPassword":
        result = await bulkResetPassword(userIds, data?.sendEmail, session.adminId)
        break
      case "sendEmail":
        result = await bulkSendEmail(userIds, data, session.adminId)
        break
      case "verifyEmail":
        result = await bulkVerifyEmail(userIds, session.adminId)
        break
      case "revokeAllSessions":
        result = await bulkRevokeSessions(userIds, session.adminId)
        break
      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Bulk user operation error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

async function handleBulkImport(
  data: { users: Array<{ email: string; name?: string; orgId?: string; role?: string }> },
  adminId: string
) {
  const result = { success: 0, failed: 0, errors: [] as string[], created: [] as string[] }

  if (!data?.users || !Array.isArray(data.users)) {
    return NextResponse.json({ error: "users array is required" }, { status: 400 })
  }

  // Limit to 500 users per import
  if (data.users.length > 500) {
    return NextResponse.json({ error: "Maximum 500 users per import" }, { status: 400 })
  }

  for (const userData of data.users) {
    if (!userData.email) {
      result.failed++
      result.errors.push("Missing email")
      continue
    }

    try {
      // Check if user exists
      let user = await prisma.user.findUnique({ where: { email: userData.email } })

      if (user) {
        // If org specified, just add to org
        if (userData.orgId) {
          const existingMembership = await prisma.organizationMember.findUnique({
            where: {
              orgId_userId: {
                orgId: userData.orgId,
                userId: user.id,
              },
            },
          })

          if (!existingMembership) {
            await prisma.organizationMember.create({
              data: {
                orgId: userData.orgId,
                userId: user.id,
                role: (userData.role as Role) || "MEMBER",
              },
            })
          }
        }
        result.success++
        continue
      }

      // Create new user
      user = await prisma.user.create({
        data: {
          email: userData.email,
          name: userData.name || null,
          emailVerified: new Date(),
        },
      })

      // Add to org if specified
      if (userData.orgId) {
        const org = await prisma.organization.findUnique({ where: { id: userData.orgId } })
        if (org) {
          await prisma.organizationMember.create({
            data: {
              orgId: userData.orgId,
              userId: user.id,
              role: (userData.role as Role) || "MEMBER",
            },
          })
        }
      }

      result.created.push(user.id)
      result.success++
    } catch (error) {
      result.failed++
      result.errors.push(`${userData.email}: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  await logPlatformAudit({
    adminId,
    action: "bulk_import_users",
    resourceType: "user",
    details: { total: data.users.length, success: result.success, failed: result.failed },
  })

  return NextResponse.json(result)
}

async function bulkBan(
  userIds: string[],
  data: { reason?: string; banType?: string } = {},
  adminId: string
) {
  const result = { success: 0, failed: 0, errors: [] as string[] }
  const reason = data.reason || "Bulk ban by admin"
  const banType = data.banType || "TEMPORARY"

  for (const userId of userIds) {
    try {
      await prisma.userBan.create({
        data: {
          userId,
          reason,
          bannedBy: adminId,
          banType: banType as "TEMPORARY" | "PERMANENT" | "SHADOW",
        },
      })

      await logPlatformAudit({
        adminId,
        action: "bulk_ban_user",
        resourceType: "user",
        resourceId: userId,
        targetUserId: userId,
        details: { reason, banType },
      })

      result.success++
    } catch (error) {
      result.failed++
      result.errors.push(`${userId}: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  return result
}

async function bulkUnban(userIds: string[], adminId: string) {
  const result = { success: 0, failed: 0, errors: [] as string[] }

  for (const userId of userIds) {
    try {
      await prisma.userBan.deleteMany({
        where: { userId },
      })

      await logPlatformAudit({
        adminId,
        action: "bulk_unban_user",
        resourceType: "user",
        resourceId: userId,
        targetUserId: userId,
      })

      result.success++
    } catch (error) {
      result.failed++
      result.errors.push(`${userId}: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  return result
}

async function bulkAddToOrg(
  userIds: string[],
  orgId: string,
  role: string = "MEMBER",
  adminId: string
) {
  const result = { success: 0, failed: 0, errors: [] as string[] }

  if (!orgId) {
    result.errors.push("orgId is required")
    result.failed = userIds.length
    return result
  }

  const org = await prisma.organization.findUnique({ where: { id: orgId } })
  if (!org) {
    result.errors.push("Organization not found")
    result.failed = userIds.length
    return result
  }

  for (const userId of userIds) {
    try {
      // Check if already a member
      const existing = await prisma.organizationMember.findUnique({
        where: { orgId_userId: { orgId, userId } },
      })

      if (existing) {
        result.success++ // Already a member, count as success
        continue
      }

      await prisma.organizationMember.create({
        data: {
          orgId,
          userId,
          role: role as Role,
        },
      })

      await logPlatformAudit({
        adminId,
        action: "bulk_add_to_org",
        resourceType: "user",
        resourceId: userId,
        targetUserId: userId,
        targetOrgId: orgId,
        details: { role },
      })

      result.success++
    } catch (error) {
      result.failed++
      result.errors.push(`${userId}: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  return result
}

async function bulkRemoveFromOrg(userIds: string[], orgId: string, adminId: string) {
  const result = { success: 0, failed: 0, errors: [] as string[] }

  if (!orgId) {
    result.errors.push("orgId is required")
    result.failed = userIds.length
    return result
  }

  for (const userId of userIds) {
    try {
      await prisma.organizationMember.delete({
        where: { orgId_userId: { orgId, userId } },
      })

      await logPlatformAudit({
        adminId,
        action: "bulk_remove_from_org",
        resourceType: "user",
        resourceId: userId,
        targetUserId: userId,
        targetOrgId: orgId,
      })

      result.success++
    } catch (error) {
      result.failed++
      result.errors.push(`${userId}: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  return result
}

async function bulkUpdateRole(
  userIds: string[],
  orgId: string,
  role: string,
  adminId: string
) {
  const result = { success: 0, failed: 0, errors: [] as string[] }

  if (!orgId || !role) {
    result.errors.push("orgId and role are required")
    result.failed = userIds.length
    return result
  }

  for (const userId of userIds) {
    try {
      await prisma.organizationMember.update({
        where: { orgId_userId: { orgId, userId } },
        data: { role: role as Role },
      })

      await logPlatformAudit({
        adminId,
        action: "bulk_update_role",
        resourceType: "user",
        resourceId: userId,
        targetUserId: userId,
        targetOrgId: orgId,
        details: { role },
      })

      result.success++
    } catch (error) {
      result.failed++
      result.errors.push(`${userId}: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  return result
}

async function bulkDelete(userIds: string[], adminId: string) {
  const result = { success: 0, failed: 0, errors: [] as string[] }

  for (const userId of userIds) {
    try {
      // Check if user is owner of any orgs
      const ownedOrgs = await prisma.organizationMember.findMany({
        where: { userId, role: "OWNER" },
      })

      if (ownedOrgs.length > 0) {
        result.failed++
        result.errors.push(`${userId}: Cannot delete - user is owner of ${ownedOrgs.length} organization(s)`)
        continue
      }

      await logPlatformAudit({
        adminId,
        action: "bulk_delete_user",
        resourceType: "user",
        resourceId: userId,
        targetUserId: userId,
      })

      await prisma.user.delete({
        where: { id: userId },
      })

      result.success++
    } catch (error) {
      result.failed++
      result.errors.push(`${userId}: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  return result
}

async function bulkResetPassword(
  userIds: string[],
  _sendEmail: boolean = false,
  adminId: string
) {
  const result = { success: 0, failed: 0, errors: [] as string[], passwords: [] as { userId: string; tempPassword: string }[] }

  for (const userId of userIds) {
    try {
      // Generate temporary password
      const tempPassword = Math.random().toString(36).slice(-12)
      const passwordHash = await bcrypt.hash(tempPassword, 10)

      await prisma.user.update({
        where: { id: userId },
        data: { passwordHash },
      })

      await logPlatformAudit({
        adminId,
        action: "bulk_reset_password",
        resourceType: "user",
        resourceId: userId,
        targetUserId: userId,
      })

      result.passwords.push({ userId, tempPassword })
      result.success++
    } catch (error) {
      result.failed++
      result.errors.push(`${userId}: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  return result
}

async function bulkSendEmail(
  userIds: string[],
  data: { subject: string; message: string; templateId?: string },
  adminId: string
) {
  const result = { success: 0, failed: 0, errors: [] as string[] }

  if (!data?.subject || !data?.message) {
    result.errors.push("subject and message are required")
    result.failed = userIds.length
    return result
  }

  // Fetch user emails
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, email: true, name: true },
  })

  const userMap = new Map(users.map(u => [u.id, u]))

  for (const userId of userIds) {
    try {
      const user = userMap.get(userId)
      if (!user) {
        result.failed++
        result.errors.push(`${userId}: User not found`)
        continue
      }

      // In production, this would integrate with an email service
      // For now, we log the email intent and mark as success
      await logPlatformAudit({
        adminId,
        action: "bulk_send_email",
        resourceType: "user",
        resourceId: userId,
        targetUserId: userId,
        details: {
          subject: data.subject,
          recipientEmail: user.email,
          templateId: data.templateId,
        },
      })

      result.success++
    } catch (error) {
      result.failed++
      result.errors.push(`${userId}: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  return result
}

async function bulkVerifyEmail(userIds: string[], adminId: string) {
  const result = { success: 0, failed: 0, errors: [] as string[] }

  for (const userId of userIds) {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { emailVerified: new Date() },
      })

      await logPlatformAudit({
        adminId,
        action: "bulk_verify_email",
        resourceType: "user",
        resourceId: userId,
        targetUserId: userId,
      })

      result.success++
    } catch (error) {
      result.failed++
      result.errors.push(`${userId}: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  return result
}

async function bulkRevokeSessions(userIds: string[], adminId: string) {
  const result = { success: 0, failed: 0, errors: [] as string[] }

  for (const userId of userIds) {
    try {
      const deleteResult = await prisma.session.deleteMany({
        where: { userId },
      })

      await logPlatformAudit({
        adminId,
        action: "bulk_revoke_sessions",
        resourceType: "user",
        resourceId: userId,
        targetUserId: userId,
        details: { sessionsRevoked: deleteResult.count },
      })

      result.success++
    } catch (error) {
      result.failed++
      result.errors.push(`${userId}: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  return result
}
