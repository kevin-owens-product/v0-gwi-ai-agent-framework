import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { PLAN_LIMITS } from './billing'
import type { PlanTier } from '@prisma/client'

// Create Redis client - will be null if credentials not available
function createRedisClient() {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN

  if (!url || !token) {
    console.warn('Upstash Redis credentials not configured. Rate limiting will be disabled.')
    return null
  }

  return new Redis({ url, token })
}

const redis = createRedisClient()

// Create rate limiters for different plan tiers
const rateLimiters: Record<PlanTier, Ratelimit | null> = {
  STARTER: redis ? new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(PLAN_LIMITS.STARTER.apiCallsPerMin, '1 m'),
    analytics: true,
    prefix: 'ratelimit:starter',
  }) : null,
  PROFESSIONAL: redis ? new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(PLAN_LIMITS.PROFESSIONAL.apiCallsPerMin, '1 m'),
    analytics: true,
    prefix: 'ratelimit:professional',
  }) : null,
  ENTERPRISE: redis ? new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(PLAN_LIMITS.ENTERPRISE.apiCallsPerMin, '1 m'),
    analytics: true,
    prefix: 'ratelimit:enterprise',
  }) : null,
}

export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number
}

export async function checkRateLimit(
  identifier: string,
  planTier: PlanTier = 'STARTER'
): Promise<RateLimitResult> {
  const limiter = rateLimiters[planTier]

  // If rate limiting is not configured, allow all requests
  if (!limiter) {
    return {
      success: true,
      limit: PLAN_LIMITS[planTier].apiCallsPerMin,
      remaining: PLAN_LIMITS[planTier].apiCallsPerMin,
      reset: Date.now() + 60000,
    }
  }

  const result = await limiter.limit(identifier)

  return {
    success: result.success,
    limit: result.limit,
    remaining: result.remaining,
    reset: result.reset,
  }
}

// Check rate limit with API key
export async function checkApiKeyRateLimit(
  apiKeyId: string,
  customLimit?: number
): Promise<RateLimitResult> {
  if (!redis) {
    return {
      success: true,
      limit: customLimit || 100,
      remaining: customLimit || 100,
      reset: Date.now() + 60000,
    }
  }

  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(customLimit || 100, '1 m'),
    analytics: true,
    prefix: 'ratelimit:apikey',
  })

  const result = await limiter.limit(apiKeyId)

  return {
    success: result.success,
    limit: result.limit,
    remaining: result.remaining,
    reset: result.reset,
  }
}

// Generate rate limit headers for response
export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': result.reset.toString(),
  }
}

// Helper to get identifier from request
export function getRateLimitIdentifier(request: Request, userId?: string, orgId?: string): string {
  if (userId && orgId) {
    return `${orgId}:${userId}`
  }

  if (orgId) {
    return orgId
  }

  // Fall back to IP address
  return getIpFromRequest(request)
}

// Extract IP address from request
export function getIpFromRequest(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'anonymous'

  return `ip:${ip}`
}

// Auth endpoint rate limit configurations
const AUTH_RATE_LIMITS = {
  // Login: 5 attempts per 15 minutes per IP
  login: { requests: 5, window: '15 m' as const },
  // Admin login: 5 attempts per 15 minutes per IP (stricter due to higher privilege)
  adminLogin: { requests: 5, window: '15 m' as const },
  // GWI login: 5 attempts per 15 minutes per IP (same as admin due to privileged access)
  gwiLogin: { requests: 5, window: '15 m' as const },
  // Registration: 3 accounts per hour per IP
  register: { requests: 3, window: '1 h' as const },
  // Forgot password: 3 requests per 15 minutes per IP (prevent email spam)
  forgotPassword: { requests: 3, window: '15 m' as const },
  // Reset password: 5 attempts per 15 minutes per IP
  resetPassword: { requests: 5, window: '15 m' as const },
} as const

type AuthRateLimitType = keyof typeof AUTH_RATE_LIMITS

// Create auth rate limiters lazily to avoid creating all at startup
const authRateLimiters: Partial<Record<AuthRateLimitType, Ratelimit>> = {}

function getAuthRateLimiter(type: AuthRateLimitType): Ratelimit | null {
  if (!redis) return null

  if (!authRateLimiters[type]) {
    const config = AUTH_RATE_LIMITS[type]
    authRateLimiters[type] = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(config.requests, config.window),
      analytics: true,
      prefix: `ratelimit:auth:${type}`,
    })
  }

  return authRateLimiters[type]!
}

/**
 * Check rate limit for authentication endpoints.
 * Uses IP-based limiting to prevent brute force attacks.
 */
export async function checkAuthRateLimit(
  request: Request,
  type: AuthRateLimitType
): Promise<RateLimitResult> {
  const config = AUTH_RATE_LIMITS[type]
  const limiter = getAuthRateLimiter(type)
  const identifier = getIpFromRequest(request)

  // If rate limiting is not configured, allow all requests
  if (!limiter) {
    return {
      success: true,
      limit: config.requests,
      remaining: config.requests,
      reset: Date.now() + 60000,
    }
  }

  const result = await limiter.limit(identifier)

  return {
    success: result.success,
    limit: result.limit,
    remaining: result.remaining,
    reset: result.reset,
  }
}
