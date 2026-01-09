import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { cookies } from 'next/headers'
import { getUserMembership } from '@/lib/tenant'
import { hasPermission } from '@/lib/permissions'
import { logAuditEvent, createAuditEventFromRequest } from '@/lib/audit'
import { recordUsage, checkUsageLimit } from '@/lib/billing'
import { z } from 'zod'

// Validation schema for running an agent
const runAgentSchema = z.object({
  input: z.record(z.unknown()),
})

// Helper to get org ID from header or cookies
async function getOrgId(request: NextRequest, userId: string): Promise<string | null> {
  // First try header
  const headerOrgId = request.headers.get('x-organization-id')
  if (headerOrgId) return headerOrgId

  // Fall back to cookies
  const cookieStore = await cookies()
  const memberships = await prisma.organizationMember.findMany({
    where: { userId },
    include: { organization: true },
    orderBy: { joinedAt: 'asc' },
  })

  if (memberships.length === 0) return null

  return cookieStore.get('currentOrgId')?.value || memberships[0].organization.id
}

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

    const orgId = await getOrgId(request, session.user.id)
    if (!orgId) {
      return NextResponse.json({ error: 'No organization found' }, { status: 404 })
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

    // Execute the agent in background
    const executeAgent = async () => {
      try {
        await prisma.agentRun.update({
          where: { id: agentRun.id },
          data: { status: 'RUNNING' },
        })

        // Simulate agent processing
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))

        // Generate agent output based on type
        const outputByType: Record<string, any> = {
          RESEARCH: {
            findings: [
              'Consumer segment analysis completed',
              'Key demographic patterns identified',
              'Behavioral trends mapped',
            ],
            insights: {
              primaryAudience: 'Adults 25-44',
              keyBehaviors: ['Digital-first', 'Value-conscious', 'Brand-loyal'],
              recommendations: ['Focus on mobile engagement', 'Emphasize sustainability'],
            },
            confidence: 0.89,
          },
          ANALYSIS: {
            metrics: {
              dataPointsAnalyzed: Math.floor(Math.random() * 10000) + 5000,
              patternsIdentified: Math.floor(Math.random() * 20) + 5,
              anomaliesDetected: Math.floor(Math.random() * 5),
            },
            summary: 'Analysis completed successfully with high confidence scores',
            trends: ['Increasing digital engagement', 'Shift to sustainable products'],
          },
          REPORTING: {
            reportGenerated: true,
            sections: ['Executive Summary', 'Key Findings', 'Recommendations', 'Appendix'],
            format: 'PDF',
            pageCount: Math.floor(Math.random() * 20) + 10,
          },
          MONITORING: {
            alertsGenerated: Math.floor(Math.random() * 5),
            metricsTracked: Math.floor(Math.random() * 50) + 20,
            status: 'All systems nominal',
            lastCheck: new Date().toISOString(),
          },
          CUSTOM: {
            result: 'Custom agent execution completed',
            customData: input,
            processingTime: `${(Math.random() * 5 + 1).toFixed(2)}s`,
          },
        }

        const tokensUsed = Math.floor(Math.random() * 5000) + 1000
        const output = {
          agentId: id,
          agentName: agent.name,
          agentType: agent.type,
          executedAt: new Date().toISOString(),
          input,
          result: outputByType[agent.type] || outputByType.CUSTOM,
          tokensUsed,
        }

        // Create insight from the run
        await prisma.insight.create({
          data: {
            orgId,
            agentRunId: agentRun.id,
            type: agent.type.toLowerCase(),
            title: `${agent.name} Run Results`,
            data: output.result,
            confidenceScore: output.result.confidence || 0.85,
          },
        })

        await prisma.agentRun.update({
          where: { id: agentRun.id },
          data: {
            status: 'COMPLETED',
            output,
            tokensUsed,
            completedAt: new Date(),
          },
        })

        // Record token usage
        await recordUsage(orgId, 'TOKENS_CONSUMED', tokensUsed)
      } catch (error) {
        console.error('Agent execution error:', error)
        await prisma.agentRun.update({
          where: { id: agentRun.id },
          data: {
            status: 'FAILED',
            errorMessage: error instanceof Error ? error.message : 'Unknown error',
            completedAt: new Date(),
          },
        })
      }
    }

    // Start execution in background
    executeAgent()

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
