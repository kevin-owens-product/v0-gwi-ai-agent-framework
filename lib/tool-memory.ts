/**
 * Tool Memory Service
 *
 * Provides state management and caching for tool executions.
 * Features:
 * - Deduplication of identical tool calls
 * - Result caching with TTL
 * - Session-based resource tracking
 * - Cross-step reference resolution
 */

import { prisma } from '@/lib/db'
import crypto from 'crypto'
import type { ToolResult, ResourceReference } from '@/types/tools'

// Memory entry type
export interface ToolMemoryEntry {
  id: string
  sessionId: string
  toolName: string
  inputHash: string
  output: unknown
  resourceIds: string[]
  executionTimeMs: number
  tokensUsed: number
  success: boolean
  error?: string
  createdAt: Date
  expiresAt: Date | null
}

// Memory service configuration
export interface ToolMemoryConfig {
  defaultTTLMs: number      // Default time-to-live for cache entries
  enableDeduplication: boolean
  maxEntriesPerSession: number
}

const DEFAULT_CONFIG: ToolMemoryConfig = {
  defaultTTLMs: 60 * 60 * 1000, // 1 hour
  enableDeduplication: true,
  maxEntriesPerSession: 100,
}

/**
 * Generate a hash for tool input parameters
 * Used for deduplication and cache lookup
 */
export function hashToolInput(params: Record<string, unknown>): string {
  const normalized = JSON.stringify(params, Object.keys(params).sort())
  return crypto.createHash('sha256').update(normalized).digest('hex').slice(0, 32)
}

/**
 * Tool Memory Service
 */
class ToolMemoryService {
  private config: ToolMemoryConfig

  constructor(config: Partial<ToolMemoryConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  /**
   * Check if an identical tool call was made recently
   * Returns the cached result if found and not expired
   */
  async findPreviousResult(
    toolName: string,
    params: Record<string, unknown>,
    sessionId: string,
    orgId: string
  ): Promise<ToolMemoryEntry | null> {
    if (!this.config.enableDeduplication) {
      return null
    }

    const inputHash = hashToolInput(params)

    const entry = await prisma.toolMemory.findFirst({
      where: {
        orgId,
        sessionId,
        toolName,
        inputHash,
        success: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
      orderBy: { createdAt: 'desc' },
    })

    if (!entry) {
      return null
    }

    return {
      id: entry.id,
      sessionId: entry.sessionId,
      toolName: entry.toolName,
      inputHash: entry.inputHash,
      output: entry.output,
      resourceIds: entry.resourceIds,
      executionTimeMs: entry.executionTimeMs,
      tokensUsed: entry.tokensUsed,
      success: entry.success,
      error: entry.error || undefined,
      createdAt: entry.createdAt,
      expiresAt: entry.expiresAt,
    }
  }

  /**
   * Store a tool execution result
   */
  async storeResult(
    toolName: string,
    params: Record<string, unknown>,
    result: ToolResult,
    sessionId: string,
    orgId: string,
    ttlMs?: number
  ): Promise<ToolMemoryEntry> {
    const inputHash = hashToolInput(params)
    const expiresAt = new Date(Date.now() + (ttlMs || this.config.defaultTTLMs))

    // Extract resource IDs from result
    const resourceIds = result.metadata?.resourcesCreated?.map(r => r.id) || []

    // Clean up old entries if we're at the limit
    const existingCount = await prisma.toolMemory.count({
      where: { orgId, sessionId },
    })

    if (existingCount >= this.config.maxEntriesPerSession) {
      // Delete oldest 10% of entries
      const entriesToDelete = await prisma.toolMemory.findMany({
        where: { orgId, sessionId },
        orderBy: { createdAt: 'asc' },
        take: Math.ceil(this.config.maxEntriesPerSession * 0.1),
        select: { id: true },
      })

      await prisma.toolMemory.deleteMany({
        where: { id: { in: entriesToDelete.map(e => e.id) } },
      })
    }

    const entry = await prisma.toolMemory.create({
      data: {
        orgId,
        sessionId,
        toolName,
        inputHash,
        output: result.data || {},
        resourceIds,
        executionTimeMs: result.metadata?.executionTimeMs || 0,
        tokensUsed: result.metadata?.tokensUsed || 0,
        success: result.success,
        error: result.error,
        expiresAt,
      },
    })

    return {
      id: entry.id,
      sessionId: entry.sessionId,
      toolName: entry.toolName,
      inputHash: entry.inputHash,
      output: entry.output,
      resourceIds: entry.resourceIds,
      executionTimeMs: entry.executionTimeMs,
      tokensUsed: entry.tokensUsed,
      success: entry.success,
      error: entry.error || undefined,
      createdAt: entry.createdAt,
      expiresAt: entry.expiresAt,
    }
  }

  /**
   * Get all resources created in a session
   */
  async getSessionResources(
    sessionId: string,
    orgId: string
  ): Promise<ResourceReference[]> {
    const entries = await prisma.toolMemory.findMany({
      where: {
        orgId,
        sessionId,
        success: true,
        resourceIds: { isEmpty: false },
      },
      select: {
        toolName: true,
        output: true,
        resourceIds: true,
      },
    })

    const resources: ResourceReference[] = []

    for (const entry of entries) {
      for (const resourceId of entry.resourceIds) {
        // Determine resource type from tool name
        let type: ResourceReference['type'] = 'insight'
        if (entry.toolName.includes('audience')) {
          type = 'audience'
        } else if (entry.toolName.includes('crosstab')) {
          type = 'crosstab'
        } else if (entry.toolName.includes('chart')) {
          type = 'chart'
        } else if (entry.toolName.includes('dashboard')) {
          type = 'dashboard'
        }

        // Get name from output if available
        const output = entry.output as Record<string, unknown>
        const name = (output.name || output.audienceName || output.chartName) as string | undefined

        resources.push({ type, id: resourceId, name })
      }
    }

    return resources
  }

  /**
   * Get all tool results from a session
   */
  async getSessionResults(
    sessionId: string,
    orgId: string
  ): Promise<Record<string, unknown>> {
    const entries = await prisma.toolMemory.findMany({
      where: { orgId, sessionId, success: true },
      orderBy: { createdAt: 'asc' },
    })

    const results: Record<string, unknown> = {}

    for (const entry of entries) {
      // Store by tool name (last call wins if multiple)
      results[entry.toolName] = entry.output

      // Also store with index for ordered access
      const existingTools = Object.keys(results).filter(k => k.startsWith(entry.toolName))
      results[`${entry.toolName}_${existingTools.length}`] = entry.output
    }

    return results
  }

  /**
   * Resolve a reference path to a value from session memory
   * Supports paths like "create_audience.audienceId" or "step-1.data.size"
   */
  async resolveReference(
    reference: string,
    sessionId: string,
    orgId: string
  ): Promise<unknown> {
    const results = await this.getSessionResults(sessionId, orgId)
    return this.getNestedValue(results, reference)
  }

  /**
   * Clear expired entries
   */
  async cleanupExpired(): Promise<number> {
    const result = await prisma.toolMemory.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
          not: null,
        },
      },
    })

    return result.count
  }

  /**
   * Clear all entries for a session
   */
  async clearSession(sessionId: string, orgId: string): Promise<void> {
    await prisma.toolMemory.deleteMany({
      where: { orgId, sessionId },
    })
  }

  /**
   * Get session statistics
   */
  async getSessionStats(
    sessionId: string,
    orgId: string
  ): Promise<{
    totalCalls: number
    successfulCalls: number
    failedCalls: number
    totalExecutionTimeMs: number
    totalTokensUsed: number
    resourcesCreated: number
  }> {
    const entries = await prisma.toolMemory.findMany({
      where: { orgId, sessionId },
      select: {
        success: true,
        executionTimeMs: true,
        tokensUsed: true,
        resourceIds: true,
      },
    })

    return {
      totalCalls: entries.length,
      successfulCalls: entries.filter(e => e.success).length,
      failedCalls: entries.filter(e => !e.success).length,
      totalExecutionTimeMs: entries.reduce((sum, e) => sum + e.executionTimeMs, 0),
      totalTokensUsed: entries.reduce((sum, e) => sum + e.tokensUsed, 0),
      resourcesCreated: entries.reduce((sum, e) => sum + e.resourceIds.length, 0),
    }
  }

  /**
   * Get nested value from object using dot notation
   */
  private getNestedValue(obj: Record<string, unknown>, path: string): unknown {
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
}

// Export singleton instance
export const toolMemory = new ToolMemoryService()

// Convenience functions
export async function findCachedToolResult(
  toolName: string,
  params: Record<string, unknown>,
  sessionId: string,
  orgId: string
): Promise<ToolMemoryEntry | null> {
  return toolMemory.findPreviousResult(toolName, params, sessionId, orgId)
}

export async function cacheToolResult(
  toolName: string,
  params: Record<string, unknown>,
  result: ToolResult,
  sessionId: string,
  orgId: string,
  ttlMs?: number
): Promise<ToolMemoryEntry> {
  return toolMemory.storeResult(toolName, params, result, sessionId, orgId, ttlMs)
}

export async function getSessionResources(
  sessionId: string,
  orgId: string
): Promise<ResourceReference[]> {
  return toolMemory.getSessionResources(sessionId, orgId)
}

export async function resolveSessionReference(
  reference: string,
  sessionId: string,
  orgId: string
): Promise<unknown> {
  return toolMemory.resolveReference(reference, sessionId, orgId)
}

export async function clearSessionMemory(
  sessionId: string,
  orgId: string
): Promise<void> {
  return toolMemory.clearSession(sessionId, orgId)
}
