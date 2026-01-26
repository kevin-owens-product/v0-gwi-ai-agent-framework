import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getValidatedOrgId } from '@/lib/tenant'

/**
 * GET /api/v1/gwi-insights/taxonomy
 * List taxonomy categories available to user's organization.
 * Returns both global (platform-wide) and organization-specific categories.
 * This is a read-only endpoint for end-users to browse available taxonomy.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
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

    // Parse query params
    const { searchParams } = new URL(request.url)
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 200)
    const offset = parseInt(searchParams.get('offset') || '0')
    const search = searchParams.get('search')
    const parentId = searchParams.get('parentId')
    const includeAttributes = searchParams.get('includeAttributes') === 'true'

    // Build where clause - show both global (orgId=null) and org-specific categories
    const where: Record<string, unknown> = {
      isActive: true,
      OR: [
        { orgId: null },    // Global categories (platform-wide)
        { orgId: orgId },   // Organization-specific categories
      ],
    }

    if (search) {
      where.AND = [
        {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { code: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        },
      ]
    }

    if (parentId === 'root') {
      where.parentId = null // Only top-level categories
    } else if (parentId) {
      where.parentId = parentId
    }

    // Fetch categories with optional attributes
    const [categories, total] = await Promise.all([
      prisma.taxonomyCategory.findMany({
        where,
        select: {
          id: true,
          name: true,
          code: true,
          description: true,
          parentId: true,
          version: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          orgId: true,
          parent: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          _count: {
            select: {
              children: true,
              attributes: true,
            },
          },
          ...(includeAttributes && {
            attributes: {
              select: {
                id: true,
                name: true,
                code: true,
                dataType: true,
                allowedValues: true,
                isRequired: true,
              },
              orderBy: { name: 'asc' as const },
            },
          }),
        },
        orderBy: [
          { parentId: 'asc' },
          { name: 'asc' },
        ],
        skip: offset,
        take: limit,
      }),
      prisma.taxonomyCategory.count({ where }),
    ])

    // Transform to user-friendly format
    const categoriesWithInsights = categories.map((category) => ({
      id: category.id,
      name: category.name,
      code: category.code,
      description: category.description,
      version: category.version,
      scope: category.orgId === null ? 'global' : 'organization',
      hierarchy: {
        parentId: category.parentId,
        parent: category.parent ? {
          id: category.parent.id,
          name: category.parent.name,
          code: category.parent.code,
        } : null,
        childCount: category._count.children,
        hasChildren: category._count.children > 0,
      },
      attributeCount: category._count.attributes,
      ...(includeAttributes && 'attributes' in category && {
        attributes: (category as typeof category & { attributes: Array<{
          id: string
          name: string
          code: string
          dataType: string
          allowedValues: unknown
          isRequired: boolean
        }> }).attributes.map((attr) => ({
          id: attr.id,
          name: attr.name,
          code: attr.code,
          dataType: formatDataType(attr.dataType),
          allowedValues: attr.allowedValues,
          isRequired: attr.isRequired,
        })),
      }),
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    }))

    // Separate into global and org-specific for clarity
    const globalCategories = categoriesWithInsights.filter(c => c.scope === 'global')
    const orgCategories = categoriesWithInsights.filter(c => c.scope === 'organization')

    return NextResponse.json({
      categories: categoriesWithInsights,
      grouped: {
        global: {
          count: globalCategories.length,
          categories: globalCategories,
        },
        organization: {
          count: orgCategories.length,
          categories: orgCategories,
        },
      },
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    })
  } catch (error) {
    console.error('GET /api/v1/gwi-insights/taxonomy error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Format data type for user-friendly display
 */
function formatDataType(dataType: string): string {
  const typeMap: Record<string, string> = {
    string: 'Text',
    number: 'Number',
    boolean: 'Yes/No',
    date: 'Date',
    datetime: 'Date & Time',
    enum: 'Selection',
    array: 'List',
    object: 'Complex',
  }
  return typeMap[dataType.toLowerCase()] || dataType
}
