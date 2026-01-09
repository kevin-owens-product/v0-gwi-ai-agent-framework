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
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'anonymous'

  return `ip:${ip}`
}
