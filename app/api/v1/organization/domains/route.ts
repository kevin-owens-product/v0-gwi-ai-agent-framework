import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { hasPermission } from '@/lib/permissions'
import { getValidatedOrgId } from '@/lib/tenant'
import crypto from 'crypto'

/**
 * GET /api/v1/organization/domains
 * Get verified domains
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get validated organization ID (validates user membership)
    const orgId = await getValidatedOrgId(request, session.user.id)
    if (!orgId) {
      return NextResponse.json(
        { error: 'Organization not found or access denied' },
        { status: 403 }
      )
    }

    // Check permission
    const member = await prisma.organizationMember.findFirst({
      where: { userId: session.user.id, organizationId: orgId },
    })

    if (!member || !hasPermission(member.role, 'domains:manage')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get domains
    const domains = await prisma.domainVerification.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(domains)
  } catch (error) {
    console.error('Error fetching domains:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/v1/organization/domains
 * Add a domain for verification
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get validated organization ID (validates user membership)
    const orgId = await getValidatedOrgId(request, session.user.id)
    if (!orgId) {
      return NextResponse.json(
        { error: 'Organization not found or access denied' },
        { status: 403 }
      )
    }

    // Check permission
    const member = await prisma.organizationMember.findFirst({
      where: { userId: session.user.id, organizationId: orgId },
    })

    if (!member || !hasPermission(member.role, 'domains:manage')) {
      return NextResponse.json(
        { error: 'You do not have permission to manage domains' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { domain } = body

    if (!domain) {
      return NextResponse.json(
        { error: 'Domain required' },
        { status: 400 }
      )
    }

    // Check if domain already exists
    const existingDomain = await prisma.domainVerification.findFirst({
      where: { domain },
    })

    if (existingDomain) {
      return NextResponse.json(
        { error: 'Domain already claimed by another organization' },
        { status: 400 }
      )
    }

    // Generate verification token
    const verificationToken = `gwi-verify-${crypto.randomBytes(32).toString('hex')}`

    // Create domain verification record
    const domainVerification = await prisma.domainVerification.create({
      data: {
        organizationId: orgId,
        domain,
        verificationToken,
        verificationMethod: 'DNS_TXT',
        verified: false,
      },
    })

    // Log action
    await prisma.auditLog.create({
      data: {
        action: 'DOMAIN_ADDED',
        entityType: 'DOMAIN_VERIFICATION',
        entityId: domainVerification.id,
        userId: session.user.id,
        organizationId: orgId,
        metadata: { domain },
      },
    })

    return NextResponse.json({
      success: true,
      domain: domainVerification,
      instructions: {
        type: 'DNS_TXT',
        record: {
          name: `_gwi-verification.${domain}`,
          type: 'TXT',
          value: verificationToken,
        },
        message: 'Add the following TXT record to your DNS configuration and click verify.',
      },
    })
  } catch (error) {
    console.error('Error adding domain:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
