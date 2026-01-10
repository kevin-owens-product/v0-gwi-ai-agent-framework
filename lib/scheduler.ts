/**
 * Scheduled Jobs Infrastructure
 *
 * Handles background job scheduling for:
 * - Workflow cron executions
 * - Brand tracking snapshots
 * - Memory/session cleanup
 * - Usage report generation
 */

import { prisma } from './db'
import { executeAgentWithContext } from './llm'
import { recordUsage } from './billing'
import { sendEmail } from './email'

interface JobContext {
  jobId: string
  jobType: string
  runAt: Date
}

/**
 * Execute scheduled workflows
 */
export async function executeScheduledWorkflows() {
  console.log('[Scheduler] Checking for scheduled workflows...')

  const now = new Date()

  // Find workflows with cron schedules
  const workflows = await prisma.workflow.findMany({
    where: {
      status: 'ACTIVE',
      schedule: { not: null },
    },
  })

  for (const workflow of workflows) {
    try {
      // Check if workflow should run based on schedule
      const schedule = workflow.schedule as Record<string, unknown> | null
      if (!schedule || !shouldRunNow(schedule, workflow.lastRun || workflow.createdAt, now)) {
        continue
      }

      console.log(`[Scheduler] Executing workflow: ${workflow.name}`)

      // Create workflow run
      const workflowRun = await prisma.workflowRun.create({
        data: {
          workflowId: workflow.id,
          orgId: workflow.orgId,
          input: {},
          status: 'PENDING',
        },
      })

      // Execute workflow (simplified - in production use queue)
      executeWorkflowRun(workflow.id, workflowRun.id, workflow.orgId).catch(error => {
        console.error(`[Scheduler] Workflow execution failed:`, error)
      })

      // Update last run time
      await prisma.workflow.update({
        where: { id: workflow.id },
        data: {
          lastRun: now,
          runCount: { increment: 1 },
        },
      })
    } catch (error) {
      console.error(`[Scheduler] Error processing workflow ${workflow.id}:`, error)
    }
  }
}

/**
 * Execute brand tracking snapshots
 */
export async function executeBrandTrackingSnapshots() {
  console.log('[Scheduler] Executing brand tracking snapshots...')

  const brandTracking = await prisma.brandTracking.findMany({
    where: {
      status: 'ACTIVE',
    },
  })

  for (const brand of brandTracking) {
    try {
      const config = brand.configuration as Record<string, unknown> | null
      const snapshotFrequency = (config?.snapshotFrequency as string) || 'daily'

      // Check if snapshot is due
      const lastSnapshot = await prisma.brandSnapshot.findFirst({
        where: { brandTrackingId: brand.id },
        orderBy: { createdAt: 'desc' },
      })

      if (lastSnapshot && !isSnapshotDue(lastSnapshot.createdAt, snapshotFrequency)) {
        continue
      }

      console.log(`[Scheduler] Creating snapshot for: ${brand.name}`)

      // Create snapshot (simplified metrics)
      await prisma.brandSnapshot.create({
        data: {
          brandTrackingId: brand.id,
          orgId: brand.orgId,
          metrics: {
            awareness: Math.random() * 100,
            consideration: Math.random() * 100,
            preference: Math.random() * 100,
            satisfaction: Math.random() * 100,
            nps: Math.random() * 100 - 50,
            sentiment: Math.random() * 2 - 1,
          },
        },
      })
    } catch (error) {
      console.error(`[Scheduler] Error creating snapshot for ${brand.id}:`, error)
    }
  }
}

/**
 * Clean up expired memory items
 */
export async function cleanupExpiredMemory() {
  console.log('[Scheduler] Cleaning up expired memory items...')

  try {
    const result = await prisma.memory.deleteMany({
      where: {
        expiresAt: {
          lte: new Date(),
        },
      },
    })

    console.log(`[Scheduler] Deleted ${result.count} expired memory items`)
  } catch (error) {
    console.error('[Scheduler] Error cleaning up memory:', error)
  }
}

/**
 * Clean up expired sessions
 */
export async function cleanupExpiredSessions() {
  console.log('[Scheduler] Cleaning up expired sessions...')

  try {
    const result = await prisma.session.deleteMany({
      where: {
        expires: {
          lte: new Date(),
        },
      },
    })

    console.log(`[Scheduler] Deleted ${result.count} expired sessions`)
  } catch (error) {
    console.error('[Scheduler] Error cleaning up sessions:', error)
  }
}

/**
 * Clean up expired verification tokens
 */
export async function cleanupExpiredTokens() {
  console.log('[Scheduler] Cleaning up expired tokens...')

  try {
    const result = await prisma.verificationToken.deleteMany({
      where: {
        expires: {
          lte: new Date(),
        },
      },
    })

    console.log(`[Scheduler] Deleted ${result.count} expired tokens`)
  } catch (error) {
    console.error('[Scheduler] Error cleaning up tokens:', error)
  }
}

/**
 * Run all scheduled jobs
 */
export async function runScheduledJobs() {
  console.log('[Scheduler] Running scheduled jobs at', new Date().toISOString())

  await Promise.allSettled([
    executeScheduledWorkflows(),
    executeBrandTrackingSnapshots(),
    cleanupExpiredMemory(),
    cleanupExpiredSessions(),
    cleanupExpiredTokens(),
  ])

  console.log('[Scheduler] Scheduled jobs completed')
}

/**
 * Helper: Check if workflow should run now
 */
function shouldRunNow(schedule: Record<string, unknown>, lastRun: Date, now: Date): boolean {
  const frequency = (schedule.frequency as string) || 'daily'
  const timeSinceLastRun = now.getTime() - lastRun.getTime()

  switch (frequency) {
    case 'hourly':
      return timeSinceLastRun >= 60 * 60 * 1000
    case 'daily':
      return timeSinceLastRun >= 24 * 60 * 60 * 1000
    case 'weekly':
      return timeSinceLastRun >= 7 * 24 * 60 * 60 * 1000
    case 'monthly':
      return timeSinceLastRun >= 30 * 24 * 60 * 60 * 1000
    default:
      return false
  }
}

/**
 * Helper: Check if snapshot is due
 */
function isSnapshotDue(lastSnapshot: Date, frequency: string): boolean {
  const now = new Date()
  const timeSinceLastSnapshot = now.getTime() - lastSnapshot.getTime()

  switch (frequency) {
    case 'hourly':
      return timeSinceLastSnapshot >= 60 * 60 * 1000
    case 'daily':
      return timeSinceLastSnapshot >= 24 * 60 * 60 * 1000
    case 'weekly':
      return timeSinceLastSnapshot >= 7 * 24 * 60 * 60 * 1000
    default:
      return false
  }
}

/**
 * Execute a workflow run (simplified version)
 */
async function executeWorkflowRun(workflowId: string, runId: string, orgId: string) {
  try {
    await prisma.workflowRun.update({
      where: { id: runId },
      data: { status: 'RUNNING' },
    })

    const workflow = await prisma.workflow.findUnique({
      where: { id: workflowId },
    })

    if (!workflow) {
      throw new Error('Workflow not found')
    }

    const agentIds = workflow.agents
    interface WorkflowOutput {
      input: Record<string, unknown>
      agentResults: Array<Record<string, unknown>>
    }
    const combinedOutput: WorkflowOutput = { input: {}, agentResults: [] }

    for (const agentId of agentIds) {
      const agent = await prisma.agent.findFirst({
        where: { id: agentId, orgId },
      })

      if (!agent || agent.status !== 'ACTIVE') continue

      const agentRun = await prisma.agentRun.create({
        data: {
          agentId,
          orgId,
          input: combinedOutput,
          status: 'RUNNING',
        },
      })

      try {
        const config = (agent.configuration as Record<string, unknown>) || {}
        const previousResults = combinedOutput.agentResults
          .map((r: Record<string, unknown>) => `Agent: ${r.agentName}\nResult: ${JSON.stringify(r.result)}`)
          .join('\n\n')

        const llmResult = await executeAgentWithContext({
          agentType: agent.type,
          agentName: agent.name,
          userInput: previousResults || 'Execute scheduled task',
          systemPrompt: config.systemPrompt as string | undefined,
          memoryContext: [],
          config: {
            temperature: config.temperature as number | undefined,
            maxTokens: config.maxTokens as number | undefined,
          },
        })

        const agentOutput = {
          agentId,
          agentName: agent.name,
          agentType: agent.type,
          executedAt: new Date().toISOString(),
          result: {
            response: llmResult.response,
            metadata: llmResult.metadata,
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

        await recordUsage(orgId, 'TOKENS_CONSUMED', llmResult.tokensUsed)
        combinedOutput.agentResults.push(agentOutput)
      } catch (error) {
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

    await prisma.workflowRun.update({
      where: { id: runId },
      data: {
        status: 'COMPLETED',
        output: combinedOutput,
        completedAt: new Date(),
      },
    })
  } catch (error) {
    await prisma.workflowRun.update({
      where: { id: runId },
      data: {
        status: 'FAILED',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        completedAt: new Date(),
      },
    })
  }
}

/**
 * Initialize scheduler (call this from a cron job or background worker)
 */
export function initializeScheduler(intervalMinutes = 15) {
  console.log(`[Scheduler] Initializing with ${intervalMinutes} minute interval`)

  // Run immediately on start
  runScheduledJobs().catch(console.error)

  // Then run periodically
  setInterval(() => {
    runScheduledJobs().catch(console.error)
  }, intervalMinutes * 60 * 1000)
}
