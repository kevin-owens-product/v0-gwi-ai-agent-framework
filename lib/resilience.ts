/**
 * Resilience and Error Handling Layer
 *
 * Provides:
 * - Circuit breaker pattern for external services
 * - Request correlation IDs
 * - Structured error handling
 * - Fallback strategies
 */

export interface CircuitBreakerConfig {
  failureThreshold: number
  resetTimeout: number
  monitoringPeriod: number
}

export enum CircuitState {
  CLOSED = 'CLOSED',     // Normal operation
  OPEN = 'OPEN',         // Failing, reject requests
  HALF_OPEN = 'HALF_OPEN' // Testing if service recovered
}

class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED
  private failures = 0
  private lastFailureTime?: number
  private successCount = 0

  constructor(private config: CircuitBreakerConfig) {}

  async execute<T>(fn: () => Promise<T>, fallback?: () => T): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (this.shouldAttemptReset()) {
        this.state = CircuitState.HALF_OPEN
      } else {
        if (fallback) {
          console.warn('[CircuitBreaker] Circuit OPEN, using fallback')
          return fallback()
        }
        throw new Error('Circuit breaker is OPEN')
      }
    }

    try {
      const result = await fn()
      this.onSuccess()
      return result
    } catch (error) {
      this.onFailure()
      // After onFailure, state may have changed to OPEN
      // Use getState() to bypass TypeScript's control flow narrowing
      if (fallback && this.getState() === CircuitState.OPEN) {
        console.warn('[CircuitBreaker] Execution failed, using fallback')
        return fallback()
      }
      throw error
    }
  }

  private onSuccess() {
    this.failures = 0
    if (this.state === CircuitState.HALF_OPEN) {
      this.successCount++
      if (this.successCount >= 2) {
        this.state = CircuitState.CLOSED
        this.successCount = 0
        console.log('[CircuitBreaker] Circuit CLOSED after successful recovery')
      }
    }
  }

  private onFailure() {
    this.failures++
    this.lastFailureTime = Date.now()

    if (this.failures >= this.config.failureThreshold) {
      this.state = CircuitState.OPEN
      console.error('[CircuitBreaker] Circuit OPEN due to failures')
    }
  }

  private shouldAttemptReset(): boolean {
    if (!this.lastFailureTime) return false
    return Date.now() - this.lastFailureTime >= this.config.resetTimeout
  }

  getState(): CircuitState {
    return this.state
  }
}

// Circuit breakers for different services
const circuitBreakers = {
  gwi: new CircuitBreaker({
    failureThreshold: 5,
    resetTimeout: 60000, // 1 minute
    monitoringPeriod: 10000,
  }),
  llm: new CircuitBreaker({
    failureThreshold: 3,
    resetTimeout: 30000, // 30 seconds
    monitoringPeriod: 10000,
  }),
  database: new CircuitBreaker({
    failureThreshold: 10,
    resetTimeout: 5000, // 5 seconds
    monitoringPeriod: 10000,
  }),
}

export function getCircuitBreaker(service: 'gwi' | 'llm' | 'database'): CircuitBreaker {
  return circuitBreakers[service]
}

/**
 * Generate correlation ID for request tracking
 */
export function generateCorrelationId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Structured error class
 */
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: Record<string, unknown>,
    public correlationId?: string
  ) {
    super(message)
    this.name = 'AppError'
  }

  toJSON() {
    return {
      error: this.message,
      code: this.code,
      details: this.details,
      correlationId: this.correlationId,
    }
  }
}

/**
 * Standard error codes
 */
export const ErrorCodes = {
  // Auth errors
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  INVALID_TOKEN: 'INVALID_TOKEN',

  // Resource errors
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',

  // Validation errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',

  // Rate limiting
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  QUOTA_EXCEEDED: 'QUOTA_EXCEEDED',

  // External service errors
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
  CIRCUIT_BREAKER_OPEN: 'CIRCUIT_BREAKER_OPEN',

  // Internal errors
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',

  // Business logic errors
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  INVALID_STATE: 'INVALID_STATE',
} as const

/**
 * Error handler middleware helper
 */
export function handleError(error: unknown, correlationId?: string): AppError {
  if (error instanceof AppError) {
    return error
  }

  if (error instanceof Error) {
    return new AppError(
      error.message,
      ErrorCodes.INTERNAL_ERROR,
      500,
      { originalError: error.name },
      correlationId
    )
  }

  return new AppError(
    'An unexpected error occurred',
    ErrorCodes.INTERNAL_ERROR,
    500,
    undefined,
    correlationId
  )
}

/**
 * Async error wrapper
 */
export function asyncHandler<T>(
  fn: () => Promise<T>,
  fallback?: (error: Error) => T
): Promise<T> {
  return fn().catch((error) => {
    console.error('[AsyncHandler] Error:', error)
    if (fallback) {
      return fallback(error)
    }
    throw error
  })
}
