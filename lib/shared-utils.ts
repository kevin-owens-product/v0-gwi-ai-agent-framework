/**
 * Shared Utility Functions
 *
 * Eliminates code duplication across the platform
 */

import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from './db'

/**
 * Get organization ID from request
 * Consolidated helper used across all API routes
 */
export async function getOrgIdFromRequest(
  request: NextRequest,
  userId: string
): Promise<string | null> {
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

/**
 * Get client IP address from request
 */
export function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  )
}

/**
 * Get user agent from request
 */
export function getUserAgent(request: NextRequest): string {
  return request.headers.get('user-agent') || 'unknown'
}

/**
 * Parse pagination parameters
 */
export interface PaginationParams {
  page: number
  limit: number
  skip: number
}

export function getPaginationParams(request: NextRequest): PaginationParams {
  const { searchParams } = new URL(request.url)
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10')))
  const skip = (page - 1) * limit

  return { page, limit, skip }
}

/**
 * Parse cursor pagination parameters (better for large datasets)
 */
export interface CursorPaginationParams {
  cursor?: string
  limit: number
}

export function getCursorPaginationParams(request: NextRequest): CursorPaginationParams {
  const { searchParams } = new URL(request.url)
  const cursor = searchParams.get('cursor') || undefined
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10')))

  return { cursor, limit }
}

/**
 * Build pagination response metadata
 */
export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export function buildPaginationMeta(
  page: number,
  limit: number,
  total: number
): PaginationMeta {
  const totalPages = Math.ceil(total / limit)

  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  }
}

/**
 * Build cursor pagination response metadata
 */
export interface CursorPaginationMeta {
  nextCursor?: string
  hasMore: boolean
}

export function buildCursorPaginationMeta<T extends { id: string }>(
  items: T[],
  limit: number
): CursorPaginationMeta {
  const hasMore = items.length === limit
  const nextCursor = hasMore ? items[items.length - 1].id : undefined

  return {
    nextCursor,
    hasMore,
  }
}

/**
 * Sanitize string input (prevent XSS)
 */
export function sanitizeString(input: string): string {
  return input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim()
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Format duration in milliseconds to human readable
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
  if (ms < 3600000) return `${(ms / 60000).toFixed(1)}m`
  return `${(ms / 3600000).toFixed(1)}h`
}

/**
 * Safely parse JSON with fallback
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json)
  } catch {
    return fallback
  }
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  ms: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout

  return function (...args: Parameters<T>) {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), ms)
  }
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  ms: number
): (...args: Parameters<T>) => void {
  let lastRun = 0

  return function (...args: Parameters<T>) {
    const now = Date.now()
    if (now - lastRun >= ms) {
      fn(...args)
      lastRun = now
    }
  }
}

/**
 * Generate random string
 */
export function randomString(length: number = 16): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * Sleep/delay function
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Chunk array into smaller arrays
 */
export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size))
  }
  return chunks
}

/**
 * Remove duplicates from array
 */
export function unique<T>(array: T[]): T[] {
  return Array.from(new Set(array))
}

/**
 * Group array by key
 */
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((result, item) => {
    const groupKey = String(item[key])
    if (!result[groupKey]) {
      result[groupKey] = []
    }
    result[groupKey].push(item)
    return result
  }, {} as Record<string, T[]>)
}
