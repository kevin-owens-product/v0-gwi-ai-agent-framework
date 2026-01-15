import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/v1/organization/hierarchy
 * Get organization hierarchy tree
 */
export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const orgId = request.headers.get('x-organization-id')
    if (!orgId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 })
    }

    // Verify membership
    const member = await prisma.organizationMember.findFirst({
      where: { userId: session.user.id, organizationId: orgId },
    })

    if (!member) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get current organization
    const organization = await prisma.organization.findUnique({
      where: { id: orgId },
      include: {
        plan: true,
        parent: true,
        children: {
          include: {
            plan: true,
          },
        },
      },
    })

    return NextResponse.json({
      current: organization,
      parent: organization?.parent,
      children: organization?.children || [],
    })
  } catch (error) {
    console.error('Error fetching hierarchy:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
