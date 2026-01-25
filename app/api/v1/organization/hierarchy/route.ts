import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getValidatedOrgId } from '@/lib/tenant'

/**
 * GET /api/v1/organization/hierarchy
 * Get organization hierarchy tree
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
