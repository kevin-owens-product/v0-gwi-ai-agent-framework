import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getRateLimitHeaders, getRateLimitIdentifier, type RateLimitResult } from './rate-limit'

// Note: checkRateLimit and checkApiKeyRateLimit require Redis
// and are tested in integration tests

describe('getRateLimitHeaders', () => {
  it('returns correct headers from rate limit result', () => {
    const result: RateLimitResult = {
      success: true,
      limit: 100,
      remaining: 95,
      reset: 1704067200000,
    }

    const headers = getRateLimitHeaders(result)

    expect(headers['X-RateLimit-Limit']).toBe('100')
    expect(headers['X-RateLimit-Remaining']).toBe('95')
    expect(headers['X-RateLimit-Reset']).toBe('1704067200000')
  })

  it('handles zero remaining', () => {
    const result: RateLimitResult = {
      success: false,
      limit: 100,
      remaining: 0,
      reset: 1704067200000,
    }

    const headers = getRateLimitHeaders(result)

    expect(headers['X-RateLimit-Remaining']).toBe('0')
  })

  it('returns string values for all headers', () => {
    const result: RateLimitResult = {
      success: true,
      limit: 500,
      remaining: 499,
      reset: Date.now(),
    }

    const headers = getRateLimitHeaders(result)

    Object.values(headers).forEach((value) => {
      expect(typeof value).toBe('string')
    })
  })
})

describe('getRateLimitIdentifier', () => {
  it('returns org:user format when both provided', () => {
    const request = new Request('http://localhost')
    const identifier = getRateLimitIdentifier(request, 'user-123', 'org-456')

    expect(identifier).toBe('org-456:user-123')
  })

  it('returns org format when only orgId provided', () => {
    const request = new Request('http://localhost')
    const identifier = getRateLimitIdentifier(request, undefined, 'org-456')

    expect(identifier).toBe('org-456')
  })

  it('returns IP from x-forwarded-for when no user/org', () => {
    const request = new Request('http://localhost', {
      headers: {
        'x-forwarded-for': '192.168.1.1',
      },
    })

    const identifier = getRateLimitIdentifier(request)

    expect(identifier).toBe('ip:192.168.1.1')
  })

  it('returns IP from x-real-ip when x-forwarded-for not present', () => {
    const request = new Request('http://localhost', {
      headers: {
        'x-real-ip': '10.0.0.1',
      },
    })

    const identifier = getRateLimitIdentifier(request)

    expect(identifier).toBe('ip:10.0.0.1')
  })

  it('returns anonymous when no IP headers present', () => {
    const request = new Request('http://localhost')

    const identifier = getRateLimitIdentifier(request)

    expect(identifier).toBe('ip:anonymous')
  })

  it('uses first IP from x-forwarded-for list', () => {
    const request = new Request('http://localhost', {
      headers: {
        'x-forwarded-for': '192.168.1.1, 10.0.0.1, 172.16.0.1',
      },
    })

    const identifier = getRateLimitIdentifier(request)

    expect(identifier).toBe('ip:192.168.1.1')
  })

  it('trims whitespace from IP address', () => {
    const request = new Request('http://localhost', {
      headers: {
        'x-forwarded-for': '  192.168.1.1  ',
      },
    })

    const identifier = getRateLimitIdentifier(request)

    expect(identifier).toBe('ip:192.168.1.1')
  })

  it('prioritizes user/org over IP', () => {
    const request = new Request('http://localhost', {
      headers: {
        'x-forwarded-for': '192.168.1.1',
      },
    })

    const identifier = getRateLimitIdentifier(request, 'user-1', 'org-1')

    expect(identifier).toBe('org-1:user-1')
  })
})
