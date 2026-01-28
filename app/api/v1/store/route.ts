import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getValidatedOrgId, getUserMembership } from '@/lib/tenant'
import { hasPermission } from '@/lib/permissions'
import { recordUsage } from '@/lib/billing'

// GET /api/v1/store - List store items (public agents)
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const orgId = await getValidatedOrgId(request, session.user.id)
    if (!orgId) {
      return NextResponse.json({ error: 'No organization found or access denied' }, { status: 404 })
    }

    const membership = await getUserMembership(session.user.id, orgId)
    if (!membership) {
      return NextResponse.json({ error: 'Not a member of this organization' }, { status: 403 })
    }

    if (!hasPermission(membership.role, 'agents:read')) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const featured = searchParams.get('featured') === 'true'

    const where: any = {
      isPublic: true,
    }

    if (category && category !== 'all') {
      // Assuming category is stored in agent metadata or tags
      where.OR = [
        { tags: { has: category } },
        { metadata: { path: ['category'], equals: category } },
      ]
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (featured) {
      // Featured agents could be marked in metadata
      where.metadata = { path: ['featured'], equals: true }
    }

    const agents = await prisma.agent.findMany({
      where,
      orderBy: [
        { createdAt: 'desc' },
      ],
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    })

    // Check which agents are already installed by this org
    const installedAgentIds = await prisma.agent.findMany({
      where: {
        orgId,
        isPublic: false, // Org's own agents
      },
      select: {
        id: true,
      },
    })

    const installedIds = new Set(installedAgentIds.map(a => a.id))

    const storeItems = agents.map(agent => ({
      id: agent.id,
      name: agent.name,
      description: agent.description,
      category: (agent.metadata as any)?.category || 'Uncategorized',
      author: agent.creator.name || agent.creator.email,
      verified: (agent.metadata as any)?.verified || false,
      rating: (agent.metadata as any)?.rating || 0,
      reviewCount: (agent.metadata as any)?.reviewCount || 0,
      installs: (agent.metadata as any)?.installs || '0',
      price: (agent.metadata as any)?.price || 'Included',
      version: (agent.metadata as any)?.version || '1.0.0',
      lastUpdated: agent.updatedAt.toISOString(),
      isInstalled: installedIds.has(agent.id),
      iconName: (agent.metadata as any)?.iconName || 'sparkles',
      color: (agent.metadata as any)?.color || 'text-accent',
      capabilities: (agent.metadata as any)?.capabilities || [],
      examplePrompts: (agent.metadata as any)?.examplePrompts || [],
      greeting: agent.greeting || '',
      systemPrompt: agent.systemPrompt || '',
    }))

    recordUsage(orgId, 'API_CALLS', 1).catch(console.error)

    return NextResponse.json({
      items: storeItems,
      data: storeItems,
      total: storeItems.length,
    })
  } catch (error) {
    console.error('Error fetching store items:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
