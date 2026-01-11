/**
 * Tool Registry
 *
 * Central registry for managing and executing GWI tools.
 * Provides:
 * - Tool registration and lookup
 * - Tool execution with context
 * - LLM tool schema generation
 * - Execution logging and auditing
 */

import { prisma } from '@/lib/db'
import { GWI_TOOLS } from '@/lib/gwi-tools'
import { findCachedToolResult, cacheToolResult } from '@/lib/tool-memory'
import type {
  GWITool,
  ToolExecutionContext,
  ToolResult,
  ToolCallRecord,
  LLMToolSchema,
  ResourceReference,
} from '@/types/tools'

// Singleton registry instance
class ToolRegistryClass {
  private tools: Map<string, GWITool> = new Map()
  private initialized = false

  /**
   * Initialize the registry with all GWI tools
   */
  initialize(): void {
    if (this.initialized) return

    for (const tool of GWI_TOOLS) {
      this.tools.set(tool.name, tool)
    }

    this.initialized = true
    console.log(`[ToolRegistry] Initialized with ${this.tools.size} tools`)
  }

  /**
   * Register a new tool or override existing
   */
  registerTool(tool: GWITool): void {
    this.tools.set(tool.name, tool)
  }

  /**
   * Get a tool by name
   */
  getTool(name: string): GWITool | undefined {
    this.ensureInitialized()
    return this.tools.get(name)
  }

  /**
   * Get tools by category
   */
  getToolsByCategory(category: string): GWITool[] {
    this.ensureInitialized()
    return Array.from(this.tools.values()).filter(tool => tool.category === category)
  }

  /**
   * Get all registered tools
   */
  getAllTools(): GWITool[] {
    this.ensureInitialized()
    return Array.from(this.tools.values())
  }

  /**
   * Get tool names
   */
  getToolNames(): string[] {
    this.ensureInitialized()
    return Array.from(this.tools.keys())
  }

  /**
   * Generate LLM-compatible tool schemas for Claude/OpenAI function calling
   */
  getToolSchemas(toolNames?: string[]): LLMToolSchema[] {
    this.ensureInitialized()

    const tools = toolNames
      ? toolNames.map(name => this.tools.get(name)).filter((t): t is GWITool => t !== undefined)
      : Array.from(this.tools.values())

    return tools.map(tool => ({
      name: tool.name,
      description: tool.description,
      input_schema: tool.parameters,
    }))
  }

  /**
   * Execute a tool by name
   */
  async executeTool(
    name: string,
    params: Record<string, unknown>,
    context: ToolExecutionContext,
    options: { useCache?: boolean; cacheTTLMs?: number } = {}
  ): Promise<ToolResult> {
    this.ensureInitialized()

    const tool = this.tools.get(name)
    if (!tool) {
      return {
        success: false,
        error: `Tool not found: ${name}`,
        metadata: { executionTimeMs: 0 },
      }
    }

    const startTime = Date.now()
    const { useCache = true, cacheTTLMs } = options

    try {
      // Validate required parameters
      const validationError = this.validateParams(tool, params)
      if (validationError) {
        return {
          success: false,
          error: validationError,
          metadata: { executionTimeMs: Date.now() - startTime },
        }
      }

      // Check cache for previous result
      if (useCache && context.runId) {
        const cached = await findCachedToolResult(name, params, context.runId, context.orgId)
        if (cached) {
          console.log(`[ToolRegistry] Cache hit for ${name}`)
          return {
            success: cached.success,
            data: cached.output,
            error: cached.error,
            metadata: {
              executionTimeMs: 0,
              cached: true,
              resourcesCreated: cached.resourceIds.map(id => ({
                type: 'insight' as const,
                id,
              })),
            },
          }
        }
      }

      // Execute the tool
      const result = await tool.execute(params, context)

      // Cache the result
      if (useCache && context.runId) {
        await cacheToolResult(name, params, result, context.runId, context.orgId, cacheTTLMs)
      }

      // Log the tool execution
      await this.logToolExecution(name, params, result, context, startTime)

      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error(`[ToolRegistry] Tool execution failed: ${name}`, error)

      return {
        success: false,
        error: errorMessage,
        metadata: { executionTimeMs: Date.now() - startTime },
      }
    }
  }

  /**
   * Execute multiple tools in sequence
   */
  async executeToolsSequentially(
    calls: Array<{ name: string; params: Record<string, unknown> }>,
    context: ToolExecutionContext
  ): Promise<ToolCallRecord[]> {
    const results: ToolCallRecord[] = []

    for (const call of calls) {
      const startedAt = new Date()
      const result = await this.executeTool(call.name, call.params, context)
      const completedAt = new Date()

      results.push({
        toolName: call.name,
        input: call.params,
        result,
        startedAt,
        completedAt,
        context: {
          agentId: context.agentId,
          workflowId: context.workflowId,
          runId: context.runId,
        },
      })

      // If tool failed and it's critical, stop execution
      if (!result.success) {
        break
      }
    }

    return results
  }

  /**
   * Execute multiple tools in parallel
   */
  async executeToolsParallel(
    calls: Array<{ name: string; params: Record<string, unknown> }>,
    context: ToolExecutionContext
  ): Promise<ToolCallRecord[]> {
    const promises = calls.map(async call => {
      const startedAt = new Date()
      const result = await this.executeTool(call.name, call.params, context)
      const completedAt = new Date()

      return {
        toolName: call.name,
        input: call.params,
        result,
        startedAt,
        completedAt,
        context: {
          agentId: context.agentId,
          workflowId: context.workflowId,
          runId: context.runId,
        },
      }
    })

    return Promise.all(promises)
  }

  /**
   * Get resources created across multiple tool calls
   */
  getResourcesCreated(toolCalls: ToolCallRecord[]): ResourceReference[] {
    return toolCalls.flatMap(
      call => call.result.metadata?.resourcesCreated || []
    )
  }

  /**
   * Validate tool parameters against schema
   */
  private validateParams(tool: GWITool, params: Record<string, unknown>): string | null {
    const required = tool.parameters.required || []

    for (const param of required) {
      if (!(param in params) || params[param] === undefined || params[param] === null) {
        return `Missing required parameter: ${param}`
      }
    }

    // Type validation
    for (const [key, value] of Object.entries(params)) {
      const schema = tool.parameters.properties[key]
      if (!schema) continue

      if (schema.type === 'array' && !Array.isArray(value)) {
        return `Parameter ${key} must be an array`
      }

      if (schema.type === 'object' && (typeof value !== 'object' || value === null || Array.isArray(value))) {
        return `Parameter ${key} must be an object`
      }

      if (schema.type === 'string' && typeof value !== 'string') {
        return `Parameter ${key} must be a string`
      }

      if (schema.type === 'number' && typeof value !== 'number') {
        return `Parameter ${key} must be a number`
      }

      if (schema.type === 'boolean' && typeof value !== 'boolean') {
        return `Parameter ${key} must be a boolean`
      }

      if (schema.enum && !schema.enum.includes(value as string)) {
        return `Parameter ${key} must be one of: ${schema.enum.join(', ')}`
      }
    }

    return null
  }

  /**
   * Log tool execution for auditing
   */
  private async logToolExecution(
    toolName: string,
    params: Record<string, unknown>,
    result: ToolResult,
    context: ToolExecutionContext,
    startTime: number
  ): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          orgId: context.orgId,
          userId: context.userId,
          action: 'tool_execute',
          resourceType: 'tool',
          resourceId: toolName,
          metadata: {
            toolName,
            params,
            success: result.success,
            executionTimeMs: Date.now() - startTime,
            agentId: context.agentId,
            workflowId: context.workflowId,
            runId: context.runId,
            resourcesCreated: result.metadata?.resourcesCreated?.map(r => r.id),
            error: result.error,
          },
        },
      })
    } catch (error) {
      console.error('[ToolRegistry] Failed to log tool execution:', error)
    }
  }

  /**
   * Ensure registry is initialized
   */
  private ensureInitialized(): void {
    if (!this.initialized) {
      this.initialize()
    }
  }
}

// Export singleton instance
export const toolRegistry = new ToolRegistryClass()

// Initialize on import
toolRegistry.initialize()

// Convenience functions
export function getToolSchemas(toolNames?: string[]): LLMToolSchema[] {
  return toolRegistry.getToolSchemas(toolNames)
}

export async function executeTool(
  name: string,
  params: Record<string, unknown>,
  context: ToolExecutionContext
): Promise<ToolResult> {
  return toolRegistry.executeTool(name, params, context)
}

export function getAllToolNames(): string[] {
  return toolRegistry.getToolNames()
}

export function getAvailableTools(): GWITool[] {
  return toolRegistry.getAllTools()
}

/**
 * Resolve template variables in parameters
 * Supports syntax like "{{step-1.audienceId}}" or "{{previousResult.data}}"
 */
export function resolveParameterTemplates(
  params: Record<string, unknown>,
  context: Record<string, unknown>
): Record<string, unknown> {
  const resolved: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(params)) {
    if (typeof value === 'string') {
      resolved[key] = resolveTemplateString(value, context)
    } else if (Array.isArray(value)) {
      resolved[key] = value.map(v =>
        typeof v === 'string' ? resolveTemplateString(v, context) : v
      )
    } else if (typeof value === 'object' && value !== null) {
      resolved[key] = resolveParameterTemplates(value as Record<string, unknown>, context)
    } else {
      resolved[key] = value
    }
  }

  return resolved
}

/**
 * Resolve a single template string
 */
function resolveTemplateString(str: string, context: Record<string, unknown>): string {
  return str.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
    const value = getNestedValue(context, path.trim())
    return value !== undefined ? String(value) : match
  })
}

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
