/**
 * Workflow Steps Library
 *
 * Provides step types and execution logic for workflows that can
 * orchestrate both agents and tool operations.
 *
 * Step Types:
 * - agent: Execute an agent (with optional tool support)
 * - tool: Execute a GWI tool directly
 * - condition: Conditional branching based on expressions
 * - transform: Data transformation operations
 * - parallel: Execute multiple steps in parallel
 */

import { prisma } from '@/lib/db'
import { toolRegistry, resolveParameterTemplates } from '@/lib/tool-registry'
import { executeAgentWithContext, executeAgentWithTools } from '@/lib/llm'
import type {
  WorkflowStep,
  WorkflowStepType,
  WorkflowToolStepConfig,
  WorkflowAgentStepConfig,
  WorkflowConditionStepConfig,
  WorkflowTransformStepConfig,
  WorkflowParallelStepConfig,
  ToolExecutionContext,
  ResourceReference,
} from '@/types/tools'

// Step execution result
export interface StepExecutionResult {
  stepId: string
  stepType: WorkflowStepType
  success: boolean
  data?: unknown
  error?: string
  nextStepId?: string
  executionTimeMs: number
  resourcesCreated?: ResourceReference[]
  metadata?: Record<string, unknown>
}

// Workflow execution context
export interface WorkflowExecutionContext {
  workflowId: string
  runId: string
  orgId: string
  userId: string
  variables: Record<string, unknown>  // Accumulated step outputs
  stepResults: Map<string, StepExecutionResult>
}

// Step executor interface
export interface StepExecutor {
  execute(
    step: WorkflowStep,
    context: WorkflowExecutionContext
  ): Promise<StepExecutionResult>
}

/**
 * Execute a tool step
 */
async function executeToolStep(
  step: WorkflowStep,
  context: WorkflowExecutionContext
): Promise<StepExecutionResult> {
  const startTime = Date.now()
  const config = step.config as WorkflowToolStepConfig

  try {
    // Resolve parameter templates using previous step outputs
    const resolvedParams = resolveParameterTemplates(config.parameters, context.variables)

    // Build tool execution context
    const toolContext: ToolExecutionContext = {
      orgId: context.orgId,
      userId: context.userId,
      workflowId: context.workflowId,
      runId: context.runId,
    }

    // Execute the tool
    const result = await toolRegistry.executeTool(
      config.toolName,
      resolvedParams,
      toolContext
    )

    // Map outputs if specified
    if (config.outputMapping && result.success && result.data) {
      for (const [outputKey, variableName] of Object.entries(config.outputMapping)) {
        const value = getNestedValue(result.data as Record<string, unknown>, outputKey)
        if (value !== undefined) {
          context.variables[variableName] = value
        }
      }
    }

    // Store full result in variables
    context.variables[`${step.id}`] = result.data

    return {
      stepId: step.id,
      stepType: 'tool',
      success: result.success,
      data: result.data,
      error: result.error,
      nextStepId: result.success ? step.onSuccess : step.onError,
      executionTimeMs: Date.now() - startTime,
      resourcesCreated: result.metadata?.resourcesCreated,
      metadata: {
        toolName: config.toolName,
        params: resolvedParams,
      },
    }
  } catch (error) {
    return {
      stepId: step.id,
      stepType: 'tool',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      nextStepId: step.onError,
      executionTimeMs: Date.now() - startTime,
    }
  }
}

/**
 * Execute an agent step
 */
async function executeAgentStep(
  step: WorkflowStep,
  context: WorkflowExecutionContext
): Promise<StepExecutionResult> {
  const startTime = Date.now()
  const config = step.config as WorkflowAgentStepConfig

  try {
    // Resolve input templates
    const resolvedInput = resolveParameterTemplates(config.input, context.variables)
    const inputMessage = typeof resolvedInput === 'object'
      ? (resolvedInput as Record<string, unknown>).prompt as string || JSON.stringify(resolvedInput)
      : String(resolvedInput)

    // Fetch agent details
    const agent = await prisma.agent.findFirst({
      where: { id: config.agentId, orgId: context.orgId },
    })

    if (!agent) {
      throw new Error(`Agent not found: ${config.agentId}`)
    }

    const agentConfig = (agent.configuration as Record<string, unknown>) || {}
    let result: Record<string, unknown>
    let resourcesCreated: ResourceReference[] = []

    if (config.enableTools) {
      // Execute with tools
      const toolContext: ToolExecutionContext = {
        orgId: context.orgId,
        userId: context.userId,
        workflowId: context.workflowId,
        runId: context.runId,
        agentId: config.agentId,
      }

      const toolResult = await executeAgentWithTools({
        agentType: agent.type,
        agentName: agent.name,
        userInput: inputMessage,
        systemPrompt: agentConfig.systemPrompt as string | undefined,
        toolContext,
        enabledTools: config.allowedTools,
        config: {
          temperature: agentConfig.temperature as number | undefined,
          maxTokens: agentConfig.maxTokens as number | undefined,
          model: agentConfig.model as string | undefined,
        },
      })

      result = {
        response: toolResult.response,
        toolCalls: toolResult.toolCalls.length,
        tokensUsed: toolResult.tokensUsed,
      }
      resourcesCreated = toolResult.resourcesCreated
    } else {
      // Execute without tools
      const llmResult = await executeAgentWithContext({
        agentType: agent.type,
        agentName: agent.name,
        userInput: inputMessage,
        systemPrompt: agentConfig.systemPrompt as string | undefined,
        config: {
          temperature: agentConfig.temperature as number | undefined,
          maxTokens: agentConfig.maxTokens as number | undefined,
          model: agentConfig.model as string | undefined,
        },
      })

      result = {
        response: llmResult.response,
        tokensUsed: llmResult.tokensUsed,
      }
    }

    // Store result in variables
    context.variables[step.id] = result

    return {
      stepId: step.id,
      stepType: 'agent',
      success: true,
      data: result,
      nextStepId: step.onSuccess,
      executionTimeMs: Date.now() - startTime,
      resourcesCreated,
      metadata: {
        agentId: config.agentId,
        agentName: agent.name,
      },
    }
  } catch (error) {
    return {
      stepId: step.id,
      stepType: 'agent',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      nextStepId: step.onError,
      executionTimeMs: Date.now() - startTime,
    }
  }
}

/**
 * Execute a condition step
 */
async function executeConditionStep(
  step: WorkflowStep,
  context: WorkflowExecutionContext
): Promise<StepExecutionResult> {
  const startTime = Date.now()
  const config = step.config as WorkflowConditionStepConfig

  try {
    // Evaluate the condition expression
    const result = evaluateExpression(config.expression, context.variables)

    return {
      stepId: step.id,
      stepType: 'condition',
      success: true,
      data: { condition: config.expression, result },
      nextStepId: result ? config.trueStep : config.falseStep,
      executionTimeMs: Date.now() - startTime,
      metadata: {
        expression: config.expression,
        evaluatedTo: result,
      },
    }
  } catch (error) {
    return {
      stepId: step.id,
      stepType: 'condition',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      nextStepId: step.onError,
      executionTimeMs: Date.now() - startTime,
    }
  }
}

/**
 * Execute a transform step
 */
async function executeTransformStep(
  step: WorkflowStep,
  context: WorkflowExecutionContext
): Promise<StepExecutionResult> {
  const startTime = Date.now()
  const config = step.config as WorkflowTransformStepConfig

  try {
    // Gather input data based on input mapping
    const inputData: Record<string, unknown> = {}
    for (const [key, path] of Object.entries(config.inputMapping)) {
      inputData[key] = getNestedValue(context.variables, path)
    }

    // Apply transformations
    let transformedData = inputData

    for (const transform of config.transformations) {
      transformedData = applyTransformation(transformedData, transform)
    }

    // Store result in variables
    context.variables[config.outputVariable] = transformedData
    context.variables[step.id] = transformedData

    return {
      stepId: step.id,
      stepType: 'transform',
      success: true,
      data: transformedData,
      nextStepId: step.onSuccess,
      executionTimeMs: Date.now() - startTime,
      metadata: {
        transformations: config.transformations.length,
        outputVariable: config.outputVariable,
      },
    }
  } catch (error) {
    return {
      stepId: step.id,
      stepType: 'transform',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      nextStepId: step.onError,
      executionTimeMs: Date.now() - startTime,
    }
  }
}

/**
 * Execute parallel steps
 */
async function executeParallelStep(
  step: WorkflowStep,
  context: WorkflowExecutionContext,
  allSteps: Map<string, WorkflowStep>
): Promise<StepExecutionResult> {
  const startTime = Date.now()
  const config = step.config as WorkflowParallelStepConfig

  try {
    // Get the steps to execute in parallel
    const parallelSteps = config.steps
      .map(stepId => allSteps.get(stepId))
      .filter((s): s is WorkflowStep => s !== undefined)

    // Execute all steps in parallel
    const results = await Promise.all(
      parallelSteps.map(s => executeStep(s, context, allSteps))
    )

    // Check if all succeeded
    const allSucceeded = results.every(r => r.success)
    const allResourcesCreated = results.flatMap(r => r.resourcesCreated || [])

    // Store parallel results
    context.variables[step.id] = {
      results: results.map(r => ({
        stepId: r.stepId,
        success: r.success,
        data: r.data,
      })),
    }

    return {
      stepId: step.id,
      stepType: 'parallel',
      success: config.waitForAll ? allSucceeded : results.some(r => r.success),
      data: { parallelResults: results.map(r => ({ stepId: r.stepId, success: r.success })) },
      nextStepId: allSucceeded ? step.onSuccess : step.onError,
      executionTimeMs: Date.now() - startTime,
      resourcesCreated: allResourcesCreated,
      metadata: {
        parallelStepCount: parallelSteps.length,
        successCount: results.filter(r => r.success).length,
        failedCount: results.filter(r => !r.success).length,
      },
    }
  } catch (error) {
    return {
      stepId: step.id,
      stepType: 'parallel',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      nextStepId: step.onError,
      executionTimeMs: Date.now() - startTime,
    }
  }
}

/**
 * Main step execution function
 */
export async function executeStep(
  step: WorkflowStep,
  context: WorkflowExecutionContext,
  allSteps: Map<string, WorkflowStep>
): Promise<StepExecutionResult> {
  switch (step.type) {
    case 'tool':
      return executeToolStep(step, context)
    case 'agent':
      return executeAgentStep(step, context)
    case 'condition':
      return executeConditionStep(step, context)
    case 'transform':
      return executeTransformStep(step, context)
    case 'parallel':
      return executeParallelStep(step, context, allSteps)
    default:
      return {
        stepId: step.id,
        stepType: step.type,
        success: false,
        error: `Unknown step type: ${step.type}`,
        executionTimeMs: 0,
      }
  }
}

/**
 * Execute a complete workflow
 */
export async function executeWorkflow(
  steps: WorkflowStep[],
  context: WorkflowExecutionContext,
  startStepId?: string
): Promise<{
  success: boolean
  results: StepExecutionResult[]
  totalExecutionTimeMs: number
  resourcesCreated: ResourceReference[]
}> {
  const startTime = Date.now()
  const results: StepExecutionResult[] = []
  const resourcesCreated: ResourceReference[] = []

  // Build step map for quick lookup
  const stepMap = new Map<string, WorkflowStep>()
  for (const step of steps) {
    stepMap.set(step.id, step)
  }

  // Start from the specified step or the first step
  let currentStepId = startStepId || steps[0]?.id

  while (currentStepId) {
    const step = stepMap.get(currentStepId)
    if (!step) {
      results.push({
        stepId: currentStepId,
        stepType: 'agent', // default
        success: false,
        error: `Step not found: ${currentStepId}`,
        executionTimeMs: 0,
      })
      break
    }

    // Execute the step
    const result = await executeStep(step, context, stepMap)
    results.push(result)
    context.stepResults.set(step.id, result)

    // Collect resources
    if (result.resourcesCreated) {
      resourcesCreated.push(...result.resourcesCreated)
    }

    // Handle retries
    if (!result.success && step.retryConfig) {
      let retryCount = 0
      while (retryCount < step.retryConfig.maxRetries && !result.success) {
        await sleep(step.retryConfig.backoffMs * Math.pow(2, retryCount))
        const retryResult = await executeStep(step, context, stepMap)
        results.push(retryResult)
        retryCount++

        if (retryResult.success) {
          result.success = true
          result.data = retryResult.data
          result.nextStepId = retryResult.nextStepId
          break
        }
      }
    }

    // Move to next step
    currentStepId = result.nextStepId
  }

  return {
    success: results.every(r => r.success),
    results,
    totalExecutionTimeMs: Date.now() - startTime,
    resourcesCreated,
  }
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Get nested value from object using dot notation
 */
function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  const parts = path.split('.')
  let current: unknown = obj

  for (const part of parts) {
    if (current === null || current === undefined) {
      return undefined
    }
    if (typeof current !== 'object') {
      return undefined
    }
    current = (current as Record<string, unknown>)[part]
  }

  return current
}

/**
 * Evaluate a simple expression
 * Supports: comparisons (>, <, >=, <=, ==, !=), logical (&&, ||, !)
 */
function evaluateExpression(expression: string, variables: Record<string, unknown>): boolean {
  // Replace template variables with actual values
  let resolved = expression.replace(/\{\{([^}]+)\}\}/g, (_, path) => {
    const value = getNestedValue(variables, path.trim())
    if (typeof value === 'string') {
      return `"${value}"`
    }
    return String(value ?? 'null')
  })

  // Simple safe evaluation for common patterns
  // Check for comparison operators
  const comparisonMatch = resolved.match(/^(.+?)\s*(>=|<=|>|<|==|!=)\s*(.+)$/)
  if (comparisonMatch) {
    const [, left, operator, right] = comparisonMatch
    const leftVal = parseValue(left.trim())
    const rightVal = parseValue(right.trim())

    switch (operator) {
      case '>': return Number(leftVal) > Number(rightVal)
      case '<': return Number(leftVal) < Number(rightVal)
      case '>=': return Number(leftVal) >= Number(rightVal)
      case '<=': return Number(leftVal) <= Number(rightVal)
      case '==': return leftVal == rightVal
      case '!=': return leftVal != rightVal
    }
  }

  // Boolean check
  if (resolved === 'true') return true
  if (resolved === 'false') return false

  // Truthy check for variables
  const value = parseValue(resolved)
  return Boolean(value)
}

/**
 * Parse a string value to its appropriate type
 */
function parseValue(str: string): unknown {
  str = str.trim()

  // Remove quotes from strings
  if ((str.startsWith('"') && str.endsWith('"')) ||
      (str.startsWith("'") && str.endsWith("'"))) {
    return str.slice(1, -1)
  }

  // Numbers
  if (/^-?\d+(\.\d+)?$/.test(str)) {
    return parseFloat(str)
  }

  // Booleans
  if (str === 'true') return true
  if (str === 'false') return false
  if (str === 'null' || str === 'undefined') return null

  return str
}

/**
 * Apply a transformation to data
 */
function applyTransformation(
  data: Record<string, unknown>,
  transform: { field: string; operation: string; config: Record<string, unknown> }
): Record<string, unknown> {
  const result = { ...data }
  const value = data[transform.field]

  switch (transform.operation) {
    case 'extract':
      if (typeof value === 'object' && value !== null) {
        const extractPath = transform.config.path as string
        result[transform.field] = getNestedValue(value as Record<string, unknown>, extractPath)
      }
      break

    case 'map':
      if (Array.isArray(value)) {
        const mapField = transform.config.field as string
        result[transform.field] = value.map(item =>
          typeof item === 'object' && item !== null
            ? (item as Record<string, unknown>)[mapField]
            : item
        )
      }
      break

    case 'filter':
      if (Array.isArray(value)) {
        const filterField = transform.config.field as string
        const filterValue = transform.config.value
        result[transform.field] = value.filter(item =>
          typeof item === 'object' && item !== null
            ? (item as Record<string, unknown>)[filterField] === filterValue
            : item === filterValue
        )
      }
      break

    case 'aggregate':
      if (Array.isArray(value)) {
        const aggField = transform.config.field as string
        const aggOp = transform.config.operation as string

        const values = value
          .map(item => typeof item === 'object' && item !== null
            ? (item as Record<string, unknown>)[aggField]
            : item
          )
          .filter((v): v is number => typeof v === 'number')

        switch (aggOp) {
          case 'sum':
            result[transform.field] = values.reduce((a, b) => a + b, 0)
            break
          case 'avg':
            result[transform.field] = values.length > 0
              ? values.reduce((a, b) => a + b, 0) / values.length
              : 0
            break
          case 'min':
            result[transform.field] = Math.min(...values)
            break
          case 'max':
            result[transform.field] = Math.max(...values)
            break
          case 'count':
            result[transform.field] = values.length
            break
        }
      }
      break

    case 'format':
      const template = transform.config.template as string
      if (typeof value === 'object' && value !== null) {
        result[transform.field] = template.replace(/\{(\w+)\}/g, (_, key) =>
          String((value as Record<string, unknown>)[key] ?? '')
        )
      }
      break
  }

  return result
}

/**
 * Sleep helper
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Convert legacy workflow agents array to new step format
 */
export function convertLegacyWorkflow(
  agents: string[],
  configuration?: Record<string, unknown>
): WorkflowStep[] {
  return agents.map((agentId, index) => ({
    id: `step-${index + 1}`,
    type: 'agent' as WorkflowStepType,
    name: `Agent Step ${index + 1}`,
    config: {
      agentId,
      input: index === 0
        ? { prompt: '{{input.prompt}}' }
        : { prompt: '{{step-' + index + '.response}}' },
      enableTools: (configuration?.enableTools as boolean) || false,
    } as WorkflowAgentStepConfig,
    onSuccess: index < agents.length - 1 ? `step-${index + 2}` : undefined,
  }))
}
