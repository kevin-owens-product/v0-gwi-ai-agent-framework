import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { cookies } from 'next/headers'
import { getUserMembership } from '@/lib/tenant'
import { hasPermission } from '@/lib/permissions'
import { logAuditEvent, createAuditEventFromRequest } from '@/lib/audit'
import { recordUsage } from '@/lib/billing'
import { executeAgentWithContext } from '@/lib/llm'
import { sendEmail } from '@/lib/email'
import { z } from 'zod'

const runWorkflowSchema = z.object({
  input: z.record(z.unknown()).optional(),
})

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

    const membership = await getUserMembership(session.user.id, orgId)
    if (!membership) {
      return NextResponse.json({ error: 'Not a member of this organization' }, { status: 403 })
    }

    if (!hasPermission(membership.role, 'workflows:execute')) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    const workflow = await prisma.workflow.findFirst({
      where: { id, orgId },
    })

    if (!workflow) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 })
    }

    if (workflow.status !== 'ACTIVE' && workflow.status !== 'DRAFT') {
      return NextResponse.json(
        { error: 'Workflow is not active', status: workflow.status },
        { status: 400 }
      )
    }

    const body = await request.json().catch(() => ({}))
    const validationResult = runWorkflowSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation error', details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const { input } = validationResult.data

    // Create workflow run
    const workflowRun = await prisma.workflowRun.create({
      data: {
        workflowId: id,
        orgId,
        input: input || {},
        status: 'PENDING',
      },
    })

    // Update workflow run count and last run
    await prisma.workflow.update({
      where: { id },
      data: {
        runCount: { increment: 1 },
        lastRun: new Date(),
      },
    })

    await logAuditEvent(createAuditEventFromRequest(request, {
      orgId,
      userId: session.user.id,
      action: 'execute',
      resourceType: 'workflow',
      resourceId: id,
      metadata: { runId: workflowRun.id },
    }))

    recordUsage(orgId, 'API_CALLS', 1).catch(console.error)

    // Execute workflow agents in sequence
    const executeWorkflow = async () => {
      let workflowSucceeded = false
      let errorMessage = ''

      try {
        await prisma.workflowRun.update({
          where: { id: workflowRun.id },
          data: { status: 'RUNNING' },
        })

        const agentIds = workflow.agents
        interface WorkflowOutput {
          input: Record<string, unknown> | undefined
          agentResults: Array<Record<string, unknown>>
        }
        const combinedOutput: WorkflowOutput = { input, agentResults: [] }

        for (const agentId of agentIds) {
          const agent = await prisma.agent.findFirst({
            where: { id: agentId, orgId },
          })

          if (!agent) {
            console.warn(`Agent ${agentId} not found, skipping`)
            continue
          }

          if (agent.status !== 'ACTIVE') {
            console.warn(`Agent ${agent.name} is not active, skipping`)
            continue
          }

          // Create agent run
          const agentRun = await prisma.agentRun.create({
            data: {
              agentId,
              orgId,
              input: combinedOutput,
              status: 'RUNNING',
            },
          })

          try {
            const startTime = Date.now()
            const config = (agent.configuration as Record<string, unknown>) || {}

            // Build prompt from previous outputs
            const previousResults = combinedOutput.agentResults
              .map((r: Record<string, unknown>) => {
                const result = r.result as Record<string, unknown> | undefined
                return `Agent: ${r.agentName}\nResult: ${result?.response || JSON.stringify(result)}`
              })
              .join('\n\n')

            const userMessage = previousResults
              ? `Previous workflow results:\n${previousResults}\n\nOriginal input: ${JSON.stringify(input)}`
              : JSON.stringify(input)

            // Get memory context
            const memoryItems = await prisma.memory.findMany({
              where: {
                orgId,
                OR: [
                  { agentId },
                  { agentId: null },
                ],
                expiresAt: { gt: new Date() },
              },
              orderBy: { createdAt: 'desc' },
              take: 10,
            })

            const memoryContext = memoryItems.map(item => ({
              key: item.key,
              value: item.value,
              createdAt: item.createdAt,
            }))

            // Execute agent with real LLM
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

            const agentOutput = {
              agentId,
              agentName: agent.name,
              agentType: agent.type,
              executedAt: new Date().toISOString(),
              processingTimeMs: processingTime,
              result: {
                response: llmResult.response,
                metadata: llmResult.metadata,
                source: llmResult.provider,
                model: llmResult.model,
              },
              tokensUsed: llmResult.tokensUsed,
            }

            await prisma.agentRun.update({
              where: { id: agentRun.id },
              data: {
                status: 'COMPLETED',
                output: agentOutput,
                tokensUsed: llmResult.tokensUsed,
                completedAt: new Date(),
              },
            })

            // Record token usage
            await recordUsage(orgId, 'TOKENS_CONSUMED', llmResult.tokensUsed)

            combinedOutput.agentResults.push(agentOutput)
          } catch (agentError) {
            console.error(`Error executing agent ${agent.name}:`, agentError)
            await prisma.agentRun.update({
              where: { id: agentRun.id },
              data: {
                status: 'FAILED',
                errorMessage: agentError instanceof Error ? agentError.message : 'Unknown error',
                completedAt: new Date(),
              },
            })

            // Continue with next agent or fail workflow depending on configuration
            if (config.stopOnError !== false) {
              throw agentError
            }
          }
        }

        await prisma.workflowRun.update({
          where: { id: workflowRun.id },
          data: {
            status: 'COMPLETED',
            output: combinedOutput,
            completedAt: new Date(),
          },
        })

        workflowSucceeded = true
      } catch (error) {
        console.error('Workflow execution error:', error)
        errorMessage = error instanceof Error ? error.message : 'Unknown error'
        await prisma.workflowRun.update({
          where: { id: workflowRun.id },
          data: {
            status: 'FAILED',
            errorMessage,
            completedAt: new Date(),
          },
        })
      }

      // Send email notification
      try {
        const user = await prisma.user.findUnique({
          where: { id: session.user.id },
          select: { email: true, name: true },
        })

        if (user?.email) {
          const statusText = workflowSucceeded ? 'completed successfully' : 'failed'
          const html = `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
                <title>Workflow ${statusText}</title>
              </head>
              <body style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #f9fafb;">
                <div style="background: white; border-radius: 12px; padding: 40px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                  <h1 style="font-size: 24px; color: #111827; margin: 0 0 16px 0;">Workflow ${statusText}</h1>
                  <p style="color: #374151; margin-bottom: 16px;">Hi ${user.name || 'there'},</p>
                  <p style="color: #374151; margin-bottom: 24px;">
                    Your workflow <strong>${workflow.name}</strong> has ${statusText}.
                  </p>
                  ${!workflowSucceeded ? `<p style="color: #dc2626; margin-bottom: 24px;"><strong>Error:</strong> ${errorMessage}</p>` : ''}
                  <div style="text-align: center; margin: 32px 0;">
                    <a href="${process.env.NEXTAUTH_URL}/dashboard/workflows/${workflow.id}" style="display: inline-block; padding: 14px 28px; background: #000; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 500;">
                      View Workflow
                    </a>
                  </div>
                </div>
              </body>
            </html>
          `

          await sendEmail({
            to: user.email,
            subject: `Workflow ${statusText}: ${workflow.name}`,
            html,
          })
        }
      } catch (emailError) {
        console.error('Failed to send workflow notification email:', emailError)
        // Don't fail the workflow if email fails
      }
    }

    // Start execution in background
    executeWorkflow()

    return NextResponse.json({
      data: {
        runId: workflowRun.id,
        status: 'RUNNING',
        message: 'Workflow run started successfully',
      },
    }, { status: 202 })
  } catch (error) {
    console.error('Error executing workflow:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
