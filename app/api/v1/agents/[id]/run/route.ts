import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { cookies } from 'next/headers'
import { getUserMembership } from '@/lib/tenant'
import { hasPermission } from '@/lib/permissions'
import { logAuditEvent, createAuditEventFromRequest } from '@/lib/audit'
import { recordUsage, checkUsageLimit } from '@/lib/billing'
import { executeAgentWithContext } from '@/lib/llm'
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

        const startTime = Date.now()
        const config = (agent.configuration as Record<string, unknown>) || {}

        // Build the prompt from input
        const userMessage = typeof input === 'object' && input !== null
          ? ((input as Record<string, unknown>).prompt || (input as Record<string, unknown>).message || JSON.stringify(input)) as string
          : String(input)

        // Get relevant memory context for this agent
        const memoryItems = await prisma.memory.findMany({
          where: {
            orgId,
            OR: [
              { agentId: id },
              { agentId: null }, // Global context
            ],
            expiresAt: {
              gt: new Date(),
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        })

        const memoryContext = memoryItems.map(item => ({
          key: item.key,
          value: item.value,
          createdAt: item.createdAt,
        }))

        // Execute with real LLM
        const llmResult = await executeAgentWithContext({
          agentType: agent.type,
          agentName: agent.name,
          userInput: userMessage,
          systemPrompt: config.systemPrompt as string | undefined,
          memoryContext,
          config: {
            temperature: config.temperature as number | undefined,
            maxTokens: config.maxTokens as number | undefined,
            model: config.model as string | undefined,
            provider: config.provider as 'anthropic' | 'openai' | 'gwi-spark' | undefined,
          },
        })

        const processingTime = Date.now() - startTime

        const result = {
          response: llmResult.response,
          metadata: llmResult.metadata || {},
          source: llmResult.provider,
          model: llmResult.model,
          confidence: 0.9,
        }

        const output = {
          agentId: id,
          agentName: agent.name,
          agentType: agent.type,
          executedAt: new Date().toISOString(),
          processingTimeMs: processingTime,
          input,
          result,
          tokensUsed: llmResult.tokensUsed,
        }

        // Extract title for the insight
        const insightTitle = `${agent.name}: ${llmResult.response.split('\n')[0].replace(/^#+ /, '').substring(0, 100)}`

        // Create insight from the run
        await prisma.insight.create({
          data: {
            orgId,
            agentRunId: agentRun.id,
            type: agent.type.toLowerCase(),
            title: insightTitle,
            data: result,
            confidenceScore: 0.9,
          },
        })

        await prisma.agentRun.update({
          where: { id: agentRun.id },
          data: {
            status: 'COMPLETED',
            output,
            tokensUsed: llmResult.tokensUsed,
            completedAt: new Date(),
          },
        })

        // Record token usage
        await recordUsage(orgId, 'TOKENS_CONSUMED', llmResult.tokensUsed)
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
