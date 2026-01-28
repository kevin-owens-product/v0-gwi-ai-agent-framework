import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getValidatedOrgId, getUserMembership } from '@/lib/tenant'
import { hasPermission } from '@/lib/permissions'
import { logAuditEvent, createAuditEventFromRequest } from '@/lib/audit'
import { recordUsage } from '@/lib/billing'

// POST /api/v1/store/[id]/install - Install a store agent
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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

    if (!hasPermission(membership.role, 'agents:write')) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    // Find the public agent
    const publicAgent = await prisma.agent.findFirst({
      where: {
        id,
        isPublic: true,
      },
    })

    if (!publicAgent) {
      return NextResponse.json({ error: 'Store item not found' }, { status: 404 })
    }

    // Check if already installed
    const existing = await prisma.agent.findFirst({
      where: {
        orgId,
        name: publicAgent.name,
        isPublic: false,
      },
    })

    if (existing) {
      return NextResponse.json({
        success: true,
        agent: existing,
        message: 'Agent already installed',
      })
    }

    // Create a copy of the agent for this organization
    const installedAgent = await prisma.agent.create({
      data: {
        orgId,
        name: publicAgent.name,
        description: publicAgent.description,
        type: publicAgent.type,
        systemPrompt: publicAgent.systemPrompt,
        greeting: publicAgent.greeting,
        tools: publicAgent.tools,
        config: publicAgent.config,
        metadata: publicAgent.metadata,
        isPublic: false, // Private to this org
        status: 'ACTIVE',
        createdBy: session.user.id,
      },
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

    await logAuditEvent(createAuditEventFromRequest(request, {
      orgId,
      userId: session.user.id,
      action: 'create',
      resourceType: 'agent',
      resourceId: installedAgent.id,
      metadata: { 
        name: installedAgent.name,
        installedFrom: 'store',
        sourceAgentId: id,
      },
    }))

    recordUsage(orgId, 'API_CALLS', 1).catch(console.error)

    return NextResponse.json({
      success: true,
      agent: installedAgent,
    }, { status: 201 })
  } catch (error) {
    console.error('Error installing store item:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/v1/store/[id]/install - Uninstall a store agent
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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

    if (!hasPermission(membership.role, 'agents:delete')) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    // Find the installed agent (not the public one)
    const installedAgent = await prisma.agent.findFirst({
      where: {
        id,
        orgId,
        isPublic: false,
      },
    })

    if (!installedAgent) {
      return NextResponse.json({ error: 'Installed agent not found' }, { status: 404 })
    }

    // Check if it was installed from store (has sourceAgentId in metadata)
    const metadata = installedAgent.metadata as any
    if (!metadata?.installedFrom || metadata.installedFrom !== 'store') {
      return NextResponse.json({ 
        error: 'This agent was not installed from the store' 
      }, { status: 400 })
    }

    await prisma.agent.delete({
      where: { id },
    })

    await logAuditEvent(createAuditEventFromRequest(request, {
      orgId,
      userId: session.user.id,
      action: 'delete',
      resourceType: 'agent',
      resourceId: id,
      metadata: { name: installedAgent.name },
    }))

    recordUsage(orgId, 'API_CALLS', 1).catch(console.error)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error uninstalling store item:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
