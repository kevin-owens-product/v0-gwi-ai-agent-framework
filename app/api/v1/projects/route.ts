import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getUserMembership, getValidatedOrgId } from '@/lib/tenant'
import { hasPermission } from '@/lib/permissions'
import { recordUsage } from '@/lib/billing'

// Demo projects to return when no real project data exists
// This matches the structure expected by ProjectsOverview component
const demoProjects = [
  {
    id: "gen-z-sustainability",
    name: "Gen Z Sustainability",
    status: "active",
    progress: 68,
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "q4-campaign",
    name: "Q4 Campaign",
    status: "active",
    progress: 45,
    updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "market-expansion",
    name: "Market Expansion",
    status: "on_hold",
    progress: 25,
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "brand-refresh",
    name: "Brand Refresh 2024",
    status: "completed",
    progress: 100,
    updatedAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
  },
]

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

    if (!hasPermission(membership.role, 'dashboards:read')) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    const searchParams = request.nextUrl.searchParams
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)

    // For now, return demo projects since there's no Project model in the database
    // In a production app, you would add a Project model to the Prisma schema
    // and fetch real project data here
    const projects = demoProjects.slice(0, limit)

    recordUsage(orgId, 'API_CALLS', 1).catch(console.error)

    return NextResponse.json({
      projects,
      data: projects,
      total: demoProjects.length,
      meta: {
        page: 1,
        limit,
        total: demoProjects.length,
        totalPages: 1,
      },
    })
  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
