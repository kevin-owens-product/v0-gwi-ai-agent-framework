import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { hasPermission } from '@/lib/permissions'

/**
 * GET /api/v1/organization/security/policies
 * Get security policies for the organization
 */
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const orgId = request.headers.get('x-organization-id')
    if (!orgId) {
      return NextResponse.json(
        { error: 'Organization ID required' },
        { status: 400 }
      )
    }

    // Verify membership
    const member = await prisma.organizationMember.findFirst({
      where: { userId: session.user.id, organizationId: orgId },
    })

    if (!member || !hasPermission(member.role, 'security:view')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get security policies
    const policies = await prisma.securityPolicy.findMany({
      where: { organizationId: orgId },
    })

    // Transform to settings object
    const settings = policies.reduce((acc, policy) => {
      acc[policy.policyType] = {
        enabled: policy.enabled,
        settings: policy.settings,
        enforcedAt: policy.enforcedAt,
      }
      return acc
    }, {} as Record<string, any>)

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error fetching security policies:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/v1/organization/security/policies
 * Update security policies
 */
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const orgId = request.headers.get('x-organization-id')
    if (!orgId) {
      return NextResponse.json(
        { error: 'Organization ID required' },
        { status: 400 }
      )
    }

    // Verify membership and permission
    const member = await prisma.organizationMember.findFirst({
      where: { userId: session.user.id, organizationId: orgId },
    })

    if (!member || !hasPermission(member.role, 'security:manage-policies')) {
      return NextResponse.json(
        { error: 'You do not have permission to manage security policies' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { policyType, enabled, settings } = body

    // Upsert policy
    const policy = await prisma.securityPolicy.upsert({
      where: {
        organizationId_policyType: {
          organizationId: orgId,
          policyType,
        },
      },
      update: {
        enabled,
        settings,
        enforcedAt: enabled ? new Date() : null,
      },
      create: {
        organizationId: orgId,
        policyType,
        enabled,
        settings,
        enforcedAt: enabled ? new Date() : null,
      },
    })

    // Log action
    await prisma.auditLog.create({
      data: {
        action: 'SECURITY_POLICY_UPDATED',
        entityType: 'SECURITY_POLICY',
        entityId: policy.id,
        userId: session.user.id,
        organizationId: orgId,
        metadata: {
          policyType,
          enabled,
          settings,
        },
      },
    })

    return NextResponse.json(policy)
  } catch (error) {
    console.error('Error updating security policy:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
