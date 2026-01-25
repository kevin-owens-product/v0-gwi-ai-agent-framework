import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { accessSharedLinkSchema } from '@/lib/schemas/collaboration'
import bcrypt from 'bcryptjs'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params

    // Find the shared link by token
    const sharedLink = await prisma.sharedLink.findUnique({
      where: { token },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    })

    if (!sharedLink) {
      return NextResponse.json({ error: 'Shared link not found' }, { status: 404 })
    }

    // Check if link is active
    if (!sharedLink.isActive) {
      return NextResponse.json({ error: 'This shared link has been revoked' }, { status: 403 })
    }

    // Check expiration
    if (sharedLink.expiresAt && new Date() > sharedLink.expiresAt) {
      return NextResponse.json({ error: 'This shared link has expired' }, { status: 403 })
    }

    // Check max views
    if (sharedLink.maxViews && sharedLink.viewCount >= sharedLink.maxViews) {
      return NextResponse.json({ error: 'This shared link has reached its maximum views' }, { status: 403 })
    }

    // Return metadata about the shared link (what's being shared, requires password, etc.)
    return NextResponse.json({
      data: {
        entityType: sharedLink.entityType,
        entityId: sharedLink.entityId,
        permissions: sharedLink.permissions,
        requiresPassword: !!sharedLink.password,
        requiresEmail: sharedLink.allowedEmails.length > 0,
        sharedBy: sharedLink.user,
        createdAt: sharedLink.createdAt,
      },
    })
  } catch (error) {
    console.error('GET /api/public/shared/[token] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params

    // Find the shared link by token
    const sharedLink = await prisma.sharedLink.findUnique({
      where: { token },
    })

    if (!sharedLink) {
      return NextResponse.json({ error: 'Shared link not found' }, { status: 404 })
    }

    // Check if link is active
    if (!sharedLink.isActive) {
      return NextResponse.json({ error: 'This shared link has been revoked' }, { status: 403 })
    }

    // Check expiration
    if (sharedLink.expiresAt && new Date() > sharedLink.expiresAt) {
      return NextResponse.json({ error: 'This shared link has expired' }, { status: 403 })
    }

    // Check max views
    if (sharedLink.maxViews && sharedLink.viewCount >= sharedLink.maxViews) {
      return NextResponse.json({ error: 'This shared link has reached its maximum views' }, { status: 403 })
    }

    // Parse and validate request body
    const body = await request.json()
    const validationResult = accessSharedLinkSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation error', details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const { password, viewerEmail } = validationResult.data

    // Check password if required
    if (sharedLink.password) {
      if (!password) {
        return NextResponse.json({ error: 'Password is required' }, { status: 401 })
      }

      const isValidPassword = await bcrypt.compare(password, sharedLink.password)
      if (!isValidPassword) {
        return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
      }
    }

    // Check allowed emails if specified
    if (sharedLink.allowedEmails.length > 0) {
      if (!viewerEmail) {
        return NextResponse.json({ error: 'Email is required to access this link' }, { status: 401 })
      }

      const isEmailAllowed = sharedLink.allowedEmails.some(
        email => email.toLowerCase() === viewerEmail.toLowerCase()
      )

      if (!isEmailAllowed) {
        return NextResponse.json({ error: 'Your email is not authorized to access this content' }, { status: 403 })
      }
    }

    // Get client info for logging
    const userAgent = request.headers.get('user-agent') || undefined
    const forwardedFor = request.headers.get('x-forwarded-for')
    const viewerIp = forwardedFor ? forwardedFor.split(',')[0].trim() : undefined

    // Record the view and update link stats in a transaction
    const [view, updatedLink] = await prisma.$transaction([
      prisma.sharedLinkView.create({
        data: {
          sharedLinkId: sharedLink.id,
          viewerEmail: viewerEmail || null,
          viewerIp,
          userAgent,
        },
      }),
      prisma.sharedLink.update({
        where: { id: sharedLink.id },
        data: {
          viewCount: { increment: 1 },
          lastViewedAt: new Date(),
        },
      }),
    ])

    // Fetch the actual content based on entityType
    let content: any = null

    switch (sharedLink.entityType) {
      case 'report':
        content = await prisma.report.findFirst({
          where: {
            id: sharedLink.entityId,
            orgId: sharedLink.orgId,
          },
          select: {
            id: true,
            title: true,
            description: true,
            type: true,
            content: true,
            thumbnail: true,
            createdAt: true,
            updatedAt: true,
          },
        })
        break

      case 'dashboard':
        content = await prisma.dashboard.findFirst({
          where: {
            id: sharedLink.entityId,
            orgId: sharedLink.orgId,
          },
          select: {
            id: true,
            name: true,
            description: true,
            layout: true,
            widgets: true,
            createdAt: true,
            updatedAt: true,
          },
        })
        break

      case 'chart':
        content = await prisma.chart.findFirst({
          where: {
            id: sharedLink.entityId,
            orgId: sharedLink.orgId,
          },
          select: {
            id: true,
            title: true,
            chartType: true,
            config: true,
            data: true,
            createdAt: true,
            updatedAt: true,
          },
        })
        break

      case 'insight':
        content = await prisma.insight.findFirst({
          where: {
            id: sharedLink.entityId,
            orgId: sharedLink.orgId,
          },
          select: {
            id: true,
            title: true,
            type: true,
            data: true,
            confidenceScore: true,
            createdAt: true,
          },
        })
        break

      default:
        return NextResponse.json({ error: 'Unsupported entity type' }, { status: 400 })
    }

    if (!content) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 })
    }

    return NextResponse.json({
      data: {
        content,
        entityType: sharedLink.entityType,
        permissions: sharedLink.permissions,
        viewId: view.id,
      },
    })
  } catch (error) {
    console.error('POST /api/public/shared/[token] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
