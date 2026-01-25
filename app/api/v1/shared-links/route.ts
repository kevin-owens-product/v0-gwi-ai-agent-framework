import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getValidatedOrgId, getUserMembership } from '@/lib/tenant'
import { hasPermission } from '@/lib/permissions'
import { logAuditEvent, createAuditEventFromRequest } from '@/lib/audit'
import { recordUsage } from '@/lib/billing'
import { createSharedLinkSchema } from '@/lib/schemas/collaboration'
import { randomBytes } from 'crypto'
import bcrypt from 'bcryptjs'

function generateToken(): string {
  return randomBytes(32).toString('base64url')
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const orgId = await getValidatedOrgId(request, session.user.id)
    if (!orgId) {
      return NextResponse.json({ error: 'Organization not found or access denied' }, { status: 404 })
    }

    const membership = await getUserMembership(session.user.id, orgId)
    if (!membership) {
      return NextResponse.json({ error: 'Not a member of this organization' }, { status: 403 })
    }

    if (!hasPermission(membership.role, 'sharing:read')) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    // Parse query params
    const { searchParams } = new URL(request.url)
    const entityType = searchParams.get('entityType')
    const entityId = searchParams.get('entityId')
    const onlyMine = searchParams.get('onlyMine') === 'true'
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build where clause
    const where: any = { orgId }

    if (entityType) {
      where.entityType = entityType
    }
    if (entityId) {
      where.entityId = entityId
    }
    if (onlyMine) {
      where.userId = session.user.id
    }

    // Fetch shared links with user info and view counts
    const [sharedLinks, total] = await Promise.all([
      prisma.sharedLink.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          _count: {
            select: { views: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      prisma.sharedLink.count({ where }),
    ])

    // Sanitize the response - don't expose password hashes
    const sanitizedLinks = sharedLinks.map(link => ({
      ...link,
      hasPassword: !!link.password,
      password: undefined,
    }))

    recordUsage(orgId, 'API_CALLS', 1).catch(console.error)

    return NextResponse.json({
      data: sanitizedLinks,
      total,
      limit,
      offset,
    })
  } catch (error) {
    console.error('GET /api/v1/shared-links error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const orgId = await getValidatedOrgId(request, session.user.id)
    if (!orgId) {
      return NextResponse.json({ error: 'Organization not found or access denied' }, { status: 404 })
    }

    const membership = await getUserMembership(session.user.id, orgId)
    if (!membership) {
      return NextResponse.json({ error: 'Not a member of this organization' }, { status: 403 })
    }

    if (!hasPermission(membership.role, 'sharing:write')) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    const body = await request.json()
    const validationResult = createSharedLinkSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation error', details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const { entityType, entityId, password, expiresAt, maxViews, allowedEmails, permissions } = validationResult.data

    // Generate unique token
    const token = generateToken()

    // Hash password if provided
    let hashedPassword: string | null = null
    if (password) {
      hashedPassword = await bcrypt.hash(password, 12)
    }

    const sharedLink = await prisma.sharedLink.create({
      data: {
        orgId,
        userId: session.user.id,
        entityType,
        entityId,
        token,
        password: hashedPassword,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        maxViews: maxViews || null,
        allowedEmails,
        permissions,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    })

    // Build the shareable URL
    const baseUrl = process.env.NEXTAUTH_URL || process.env.RENDER_EXTERNAL_URL || 'http://localhost:3000'
    const shareUrl = `${baseUrl}/shared/${token}`

    await logAuditEvent(createAuditEventFromRequest(request, {
      orgId,
      userId: session.user.id,
      action: 'create',
      resourceType: 'shared_link',
      resourceId: sharedLink.id,
      metadata: { entityType, entityId },
    }))

    recordUsage(orgId, 'API_CALLS', 1).catch(console.error)

    return NextResponse.json({
      data: {
        ...sharedLink,
        hasPassword: !!sharedLink.password,
        password: undefined,
        shareUrl,
      },
    }, { status: 201 })
  } catch (error) {
    console.error('POST /api/v1/shared-links error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
