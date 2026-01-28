import { describe, it, expect } from 'vitest'
import {
  parsePaginationParams,
  isValidUUID,
  isValidCUID,
  isValidId,
  sanitizeString,
  isValidEmail,
  parsePositiveInt,
  createPaginationMeta,
  sanitizeHtml,
} from './validation'

describe('parsePaginationParams', () => {
  it('should return default values when no params provided', () => {
    const params = new URLSearchParams()
    const result = parsePaginationParams(params)

    expect(result.page).toBe(1)
    expect(result.limit).toBe(20)
    expect(result.offset).toBe(0)
  })

  it('should parse valid page and limit', () => {
    const params = new URLSearchParams({ page: '2', limit: '10' })
    const result = parsePaginationParams(params)

    expect(result.page).toBe(2)
    expect(result.limit).toBe(10)
    expect(result.offset).toBe(10)
  })

  it('should use custom defaults', () => {
    const params = new URLSearchParams()
    const result = parsePaginationParams(params, {
      defaultLimit: 50,
      defaultPage: 2,
    })

    expect(result.page).toBe(2)
    expect(result.limit).toBe(50)
    expect(result.offset).toBe(50)
  })

  it('should enforce max limit', () => {
    const params = new URLSearchParams({ limit: '200' })
    const result = parsePaginationParams(params, { maxLimit: 100 })

    expect(result.limit).toBe(100)
  })

  it('should reject invalid page values', () => {
    const params = new URLSearchParams({ page: '0', limit: '10' })
    const result = parsePaginationParams(params)

    expect(result.page).toBe(1) // defaults to 1
  })

  it('should reject negative page values', () => {
    const params = new URLSearchParams({ page: '-1', limit: '10' })
    const result = parsePaginationParams(params)

    expect(result.page).toBe(1)
  })

  it('should reject non-numeric page values', () => {
    const params = new URLSearchParams({ page: 'abc', limit: '10' })
    const result = parsePaginationParams(params)

    expect(result.page).toBe(1)
  })

  it('should calculate offset correctly', () => {
    const params = new URLSearchParams({ page: '3', limit: '25' })
    const result = parsePaginationParams(params)

    expect(result.offset).toBe(50) // (3-1) * 25
  })
})

describe('isValidUUID', () => {
  it('should validate correct UUID v4', () => {
    expect(isValidUUID('550e8400-e29b-41d4-a716-446655440000')).toBe(true)
  })

  it('should reject invalid UUID format', () => {
    expect(isValidUUID('not-a-uuid')).toBe(false)
    expect(isValidUUID('550e8400-e29b-41d4-a716')).toBe(false)
    expect(isValidUUID('')).toBe(false)
  })

  it('should validate uppercase UUID', () => {
    expect(isValidUUID('550E8400-E29B-41D4-A716-446655440000')).toBe(true)
  })

  it('should accept UUID v1 format', () => {
    // The regex accepts UUID v1 format as well
    expect(isValidUUID('6ba7b810-9dad-11d1-80b4-00c04fd430c8')).toBe(true)
  })
})

describe('isValidCUID', () => {
  it('should validate correct CUID', () => {
    expect(isValidCUID('cjld2cjxh0000qzrmn831i7rn')).toBe(true)
  })

  it('should reject invalid CUID format', () => {
    expect(isValidCUID('not-a-cuid')).toBe(false)
    expect(isValidCUID('cjld2cjxh0000qzrmn831i7')).toBe(false) // too short
    expect(isValidCUID('')).toBe(false)
  })

  it('should reject CUIDs that do not start with c', () => {
    expect(isValidCUID('ajld2cjxh0000qzrmn831i7rn')).toBe(false)
  })
})

describe('isValidId', () => {
  it('should validate UUID', () => {
    expect(isValidId('550e8400-e29b-41d4-a716-446655440000')).toBe(true)
  })

  it('should validate CUID', () => {
    expect(isValidId('cjld2cjxh0000qzrmn831i7rn')).toBe(true)
  })

  it('should reject invalid IDs', () => {
    expect(isValidId('not-an-id')).toBe(false)
    expect(isValidId('')).toBe(false)
  })
})

describe('sanitizeString', () => {
  it('should trim whitespace', () => {
    expect(sanitizeString('  hello  ')).toBe('hello')
  })

  it('should truncate to max length', () => {
    const longString = 'a'.repeat(2000)
    const result = sanitizeString(longString, 100)

    expect(result.length).toBe(100)
  })

  it('should use default max length', () => {
    const longString = 'a'.repeat(2000)
    const result = sanitizeString(longString)

    expect(result.length).toBe(1000)
  })

  it('should handle empty string', () => {
    expect(sanitizeString('')).toBe('')
  })
})

describe('isValidEmail', () => {
  it('should validate correct email addresses', () => {
    expect(isValidEmail('test@example.com')).toBe(true)
    expect(isValidEmail('user.name@domain.co.uk')).toBe(true)
    expect(isValidEmail('user+tag@example.com')).toBe(true)
  })

  it('should reject invalid email addresses', () => {
    expect(isValidEmail('not-an-email')).toBe(false)
    expect(isValidEmail('@example.com')).toBe(false)
    expect(isValidEmail('user@')).toBe(false)
    expect(isValidEmail('user@domain')).toBe(false)
    expect(isValidEmail('')).toBe(false)
  })
})

describe('parsePositiveInt', () => {
  it('should parse valid positive integers', () => {
    expect(parsePositiveInt('42', 10)).toBe(42)
    expect(parsePositiveInt('0', 10)).toBe(0)
  })

  it('should return default for null', () => {
    expect(parsePositiveInt(null, 10)).toBe(10)
  })

  it('should return default for invalid values', () => {
    expect(parsePositiveInt('abc', 10)).toBe(10)
    expect(parsePositiveInt('-5', 10)).toBe(10)
    expect(parsePositiveInt('', 10)).toBe(10)
  })
})

describe('createPaginationMeta', () => {
  it('should create correct pagination metadata', () => {
    const params = { page: 2, limit: 20, offset: 20 }
    const result = createPaginationMeta(100, params)

    expect(result.page).toBe(2)
    expect(result.limit).toBe(20)
    expect(result.total).toBe(100)
    expect(result.totalPages).toBe(5)
    expect(result.hasMore).toBe(true)
  })

  it('should set hasMore to false on last page', () => {
    const params = { page: 5, limit: 20, offset: 80 }
    const result = createPaginationMeta(100, params)

    expect(result.hasMore).toBe(false)
  })

  it('should handle empty results', () => {
    const params = { page: 1, limit: 20, offset: 0 }
    const result = createPaginationMeta(0, params)

    expect(result.total).toBe(0)
    expect(result.totalPages).toBe(0)
    expect(result.hasMore).toBe(false)
  })

  it('should calculate total pages correctly', () => {
    const params = { page: 1, limit: 25, offset: 0 }
    const result = createPaginationMeta(100, params)

    expect(result.totalPages).toBe(4) // ceil(100/25)
  })
})

describe('sanitizeHtml', () => {
  it('should return null for null input', () => {
    expect(sanitizeHtml(null)).toBeNull()
  })

  it('should return null for undefined input', () => {
    expect(sanitizeHtml(undefined)).toBeNull()
  })

  it('should sanitize dangerous HTML', () => {
    const dangerous = '<script>alert("xss")</script><p>Safe content</p>'
    const result = sanitizeHtml(dangerous)

    expect(result).not.toContain('<script>')
    expect(result).toContain('<p>Safe content</p>')
  })

  it('should allow safe HTML tags', () => {
    const safe = '<p>Hello</p><strong>World</strong><a href="https://example.com">Link</a>'
    const result = sanitizeHtml(safe)

    expect(result).toContain('<p>')
    expect(result).toContain('<strong>')
    expect(result).toContain('<a')
  })

  it('should add security attributes to links', () => {
    const html = '<a href="https://example.com">Link</a>'
    const result = sanitizeHtml(html)

    expect(result).toContain('target="_blank"')
    expect(result).toContain('rel="noopener noreferrer"')
  })
})
