import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getOrganizationFeatures } from '@/lib/features'
import { getValidatedOrgId } from '@/lib/tenant'

/**
 * GET /api/v1/organization/features
 * Get all features for the organization
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get validated organization ID (validates user membership)
    const orgId = await getValidatedOrgId(request, session.user.id!)

    if (!orgId) {
      return NextResponse.json(
        { error: 'Organization not found or access denied' },
        { status: 403 }
      )
    }

    // Get all features
    const features = await getOrganizationFeatures(orgId)

    return NextResponse.json(features)
  } catch (error) {
    console.error('Error fetching organization features:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
