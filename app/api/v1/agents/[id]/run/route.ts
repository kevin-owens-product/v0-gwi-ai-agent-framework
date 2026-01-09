import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getUserMembership } from '@/lib/tenant'
import { hasPermission } from '@/lib/permissions'
import { logAuditEvent, createAuditEventFromRequest } from '@/lib/audit'
import { recordUsage, checkUsageLimit } from '@/lib/billing'
import { z } from 'zod'

// Validation schema for running an agent
const runAgentSchema = z.object({
  input: z.record(z.unknown()),
})

// POST /api/v1/agents/[id]/run - Execute an agent
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

    const orgId = request.headers.get('x-organization-id')
    if (!orgId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 })
    }

    // Check membership and permissions
    const membership = await getUserMembership(session.user.id, orgId)
    if (!membership) {
      return NextResponse.json({ error: 'Not a member of this organization' }, { status: 403 })
    }

    if (!hasPermission(membership.role, 'agents:execute')) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    // Check usage limits
    const usageCheck = await checkUsageLimit(orgId, 'agentRuns')
    if (!usageCheck.allowed) {
      return NextResponse.json(
        {
          error: 'Agent run limit exceeded',
          current: usageCheck.current,
          limit: usageCheck.limit,
        },
        { status: 429 }
      )
    }

    // Check agent exists and is active
    const agent = await prisma.agent.findFirst({
      where: { id, orgId },
    })

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
    }

    if (agent.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Agent is not active', status: agent.status },
        { status: 400 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validationResult = runAgentSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation error', details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const { input } = validationResult.data

    // Create agent run
    const agentRun = await prisma.agentRun.create({
      data: {
        agentId: id,
        orgId,
        input,
        status: 'PENDING',
      },
    })

    // Log audit event
    await logAuditEvent(createAuditEventFromRequest(request, {
      orgId,
      userId: session.user.id,
      action: 'execute',
      resourceType: 'agent',
      resourceId: id,
      metadata: { runId: agentRun.id },
    }))

    // Record usage
    await recordUsage(orgId, 'AGENT_RUNS', 1)
    await recordUsage(orgId, 'API_CALLS', 1)

    // In production, you would dispatch the actual agent execution here
    // For now, we'll simulate by updating the run status
    // This would typically be handled by a background job/queue

    // Simulate starting the run
    await prisma.agentRun.update({
      where: { id: agentRun.id },
      data: { status: 'RUNNING' },
    })

    return NextResponse.json({
      data: {
        runId: agentRun.id,
        status: 'RUNNING',
        message: 'Agent run started successfully',
      },
    }, { status: 202 })
  } catch (error) {
    console.error('Error executing agent:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
