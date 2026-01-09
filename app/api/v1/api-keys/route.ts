import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { cookies } from 'next/headers'
import { getUserMembership } from '@/lib/tenant'
import { hasPermission } from '@/lib/permissions'
import { logAuditEvent, createAuditEventFromRequest } from '@/lib/audit'
import { randomBytes, createHash } from 'crypto'
import { z } from 'zod'

// Helper to get org ID from header or cookies
async function getOrgId(request: NextRequest, userId: string): Promise<string | null> {
  const headerOrgId = request.headers.get('x-organization-id')
  if (headerOrgId) return headerOrgId

  const cookieStore = await cookies()
  const memberships = await prisma.organizationMember.findMany({
    where: { userId },
    include: { organization: true },
    orderBy: { joinedAt: 'asc' },
  })

  if (memberships.length === 0) return null
  return cookieStore.get('currentOrgId')?.value || memberships[0].organization.id
}

const createKeySchema = z.object({
  name: z.string().min(1).max(100),
  permissions: z.array(z.string()).optional(),
  expiresAt: z.string().datetime().optional(),
})

function generateApiKey(): string {
  const prefix = 'gwi_sk_'
  const key = randomBytes(24).toString('hex')
  return `${prefix}${key}`
}

function hashKey(key: string): string {
  return createHash('sha256').update(key).digest('hex')
}

// GET /api/v1/api-keys - List API keys
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const orgId = await getOrgId(request, session.user.id)
    if (!orgId) {
      return NextResponse.json({ error: 'No organization found' }, { status: 404 })
    }

    const membership = await getUserMembership(session.user.id, orgId)
    if (!membership) {
      return NextResponse.json({ error: 'Not a member of this organization' }, { status: 403 })
    }

    if (!hasPermission(membership.role, 'apiKeys:read')) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    // Fetch API keys (excluding the hash)
    const apiKeys = await prisma.apiKey.findMany({
      where: { orgId },
      select: {
        id: true,
        name: true,
        keyPrefix: true,
        permissions: true,
        rateLimit: true,
        lastUsed: true,
        expiresAt: true,
        createdAt: true,
        user: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ apiKeys })
  } catch (error) {
    console.error('GET /api/v1/api-keys error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/v1/api-keys - Create new API key
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const orgId = await getOrgId(request, session.user.id)
    if (!orgId) {
      return NextResponse.json({ error: 'No organization found' }, { status: 404 })
    }

    const membership = await getUserMembership(session.user.id, orgId)
    if (!membership) {
      return NextResponse.json({ error: 'Not a member of this organization' }, { status: 403 })
    }

    if (!hasPermission(membership.role, 'apiKeys:write')) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    const body = await request.json()
    const validation = createKeySchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation error', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { name, permissions, expiresAt } = validation.data

    // Generate the API key
    const rawKey = generateApiKey()
    const keyHash = hashKey(rawKey)
    const keyPrefix = rawKey.slice(0, 12)

    // Create API key record
    const apiKey = await prisma.apiKey.create({
      data: {
        orgId,
        userId: session.user.id,
        name,
        keyPrefix,
        keyHash,
        permissions: permissions || [],
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
      select: {
        id: true,
        name: true,
        keyPrefix: true,
        permissions: true,
        rateLimit: true,
        expiresAt: true,
        createdAt: true,
      },
    })

    // Log audit event
    await logAuditEvent(createAuditEventFromRequest(request, {
      orgId,
      userId: session.user.id,
      action: 'create',
      resourceType: 'api_key',
      resourceId: apiKey.id,
      metadata: { name },
    }))

    // Return the key only on creation - it won't be shown again
    return NextResponse.json({
      apiKey: {
        ...apiKey,
        key: rawKey, // Only returned on creation!
      },
    }, { status: 201 })
  } catch (error) {
    console.error('POST /api/v1/api-keys error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/v1/api-keys - Delete API key
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const orgId = await getOrgId(request, session.user.id)
    if (!orgId) {
      return NextResponse.json({ error: 'No organization found' }, { status: 404 })
    }

    const membership = await getUserMembership(session.user.id, orgId)
    if (!membership) {
      return NextResponse.json({ error: 'Not a member of this organization' }, { status: 403 })
    }

    if (!hasPermission(membership.role, 'apiKeys:write')) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const keyId = searchParams.get('id')

    if (!keyId) {
      return NextResponse.json({ error: 'API key ID is required' }, { status: 400 })
    }

    // Check key exists in org
    const apiKey = await prisma.apiKey.findFirst({
      where: { id: keyId, orgId },
    })

    if (!apiKey) {
      return NextResponse.json({ error: 'API key not found' }, { status: 404 })
    }

    // Delete the key
    await prisma.apiKey.delete({
      where: { id: keyId },
    })

    // Log audit event
    await logAuditEvent(createAuditEventFromRequest(request, {
      orgId,
      userId: session.user.id,
      action: 'delete',
      resourceType: 'api_key',
      resourceId: keyId,
      metadata: { name: apiKey.name },
    }))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/v1/api-keys error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
