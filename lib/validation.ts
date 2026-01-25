/**
 * Input validation utilities for API endpoints
 */

/**
 * Pagination parameters with validated defaults and bounds
 */
export interface PaginationParams {
  page: number
  limit: number
  offset: number
}

/**
 * Parse and validate pagination parameters from URL search params.
 * Returns safe defaults if parameters are missing or invalid.
 *
 * @param searchParams - URL search params
 * @param options - Configuration options
 * @returns Validated pagination parameters
 */
export function parsePaginationParams(
  searchParams: URLSearchParams,
  options: {
    defaultLimit?: number
    maxLimit?: number
    defaultPage?: number
  } = {}
): PaginationParams {
  const { defaultLimit = 20, maxLimit = 100, defaultPage = 1 } = options

  // Parse page - must be positive integer, default to 1
  const rawPage = searchParams.get('page')
  let page = defaultPage
  if (rawPage !== null) {
    const parsed = parseInt(rawPage, 10)
    if (!isNaN(parsed) && parsed >= 1) {
      page = parsed
    }
  }

  // Parse limit - must be positive integer within bounds
  const rawLimit = searchParams.get('limit')
  let limit = defaultLimit
  if (rawLimit !== null) {
    const parsed = parseInt(rawLimit, 10)
    if (!isNaN(parsed) && parsed >= 1) {
      limit = Math.min(parsed, maxLimit)
    }
  }

  // Calculate offset
  const offset = (page - 1) * limit

  return { page, limit, offset }
}

/**
 * Validate a UUID string format
 */
export function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(str)
}

/**
 * Validate a CUID string format (Prisma default IDs)
 */
export function isValidCUID(str: string): boolean {
  // CUIDs start with 'c' and are 25 characters
  return /^c[a-z0-9]{24}$/.test(str)
}

/**
 * Validate an ID (either UUID or CUID)
 */
export function isValidId(str: string): boolean {
  return isValidUUID(str) || isValidCUID(str)
}

/**
 * Sanitize a string for safe database queries (removes potential injection)
 * Note: This is a belt-and-suspenders approach - Prisma handles SQL injection,
 * but this adds extra safety for string fields.
 */
export function sanitizeString(str: string, maxLength: number = 1000): string {
  return str.slice(0, maxLength).trim()
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Parse and validate a positive integer from string
 */
export function parsePositiveInt(value: string | null, defaultValue: number): number {
  if (value === null) return defaultValue
  const parsed = parseInt(value, 10)
  if (isNaN(parsed) || parsed < 0) return defaultValue
  return parsed
}

/**
 * Create pagination metadata for API responses
 */
export function createPaginationMeta(
  total: number,
  params: PaginationParams
): {
  page: number
  limit: number
  total: number
  totalPages: number
  hasMore: boolean
} {
  const totalPages = Math.ceil(total / params.limit)
  return {
    page: params.page,
    limit: params.limit,
    total,
    totalPages,
    hasMore: params.page < totalPages,
  }
}

/**
 * Sanitize HTML content to prevent XSS attacks.
 * Allows safe tags for rich text content while removing potentially dangerous elements.
 */
export function sanitizeHtml(html: string | null | undefined): string | null {
  if (!html) return null

  // Use DOMPurify for robust HTML sanitization
  const DOMPurify = require('isomorphic-dompurify')

  // Configure DOMPurify with safe defaults
  const clean = DOMPurify.sanitize(html, {
    // Allow common formatting tags
    ALLOWED_TAGS: [
      'p', 'br', 'b', 'i', 'u', 'strong', 'em', 'strike', 's',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li',
      'a', 'blockquote', 'code', 'pre',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'div', 'span', 'hr',
    ],
    // Allow safe attributes
    ALLOWED_ATTR: [
      'href', 'target', 'rel', 'class', 'id',
      'colspan', 'rowspan',
    ],
    // Force all links to open in new tab with noopener
    ADD_ATTR: ['target', 'rel'],
    // Prevent protocol-based attacks
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i,
  })

  // Post-process to add security attributes to links
  return clean.replace(/<a\s/gi, '<a target="_blank" rel="noopener noreferrer" ')
}
