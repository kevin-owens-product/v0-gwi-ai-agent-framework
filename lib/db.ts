import { PrismaClient, Prisma } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Configure connection pool for production reliability
const prismaClientOptions: Prisma.PrismaClientOptions = {
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient(prismaClientOptions)

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Retry configuration for transient database failures
const MAX_RETRIES = 3
const INITIAL_DELAY_MS = 100
const MAX_DELAY_MS = 2000

// Errors that indicate transient connection issues worth retrying
const RETRYABLE_ERROR_CODES = [
  'P1001', // Can't reach database server
  'P1002', // Database server reached but timed out
  'P1008', // Operations timed out
  'P1017', // Server closed the connection
  'P2024', // Timed out fetching a new connection from the pool
]

function isRetryableError(error: unknown): boolean {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return RETRYABLE_ERROR_CODES.includes(error.code)
  }
  if (error instanceof Prisma.PrismaClientInitializationError) {
    return true // Always retry initialization errors
  }
  if (error instanceof Error) {
    const message = error.message.toLowerCase()
    return (
      message.includes('connection') ||
      message.includes('timeout') ||
      message.includes('econnrefused') ||
      message.includes('econnreset') ||
      message.includes('socket')
    )
  }
  return false
}

function getRetryDelay(attempt: number): number {
  // Exponential backoff with jitter
  const exponentialDelay = INITIAL_DELAY_MS * Math.pow(2, attempt)
  const jitter = Math.random() * 0.3 * exponentialDelay
  return Math.min(exponentialDelay + jitter, MAX_DELAY_MS)
}

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Execute a database operation with automatic retry for transient failures.
 * This helps handle cold starts and temporary connection issues.
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  operationName = 'database operation'
): Promise<T> {
  let lastError: unknown

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error

      if (!isRetryableError(error)) {
        throw error
      }

      if (attempt < MAX_RETRIES - 1) {
        const delay = getRetryDelay(attempt)
        console.warn(
          `[DB Retry] ${operationName} failed (attempt ${attempt + 1}/${MAX_RETRIES}), ` +
          `retrying in ${Math.round(delay)}ms...`,
          error instanceof Error ? error.message : error
        )
        await sleep(delay)
      }
    }
  }

  console.error(`[DB Retry] ${operationName} failed after ${MAX_RETRIES} attempts`)
  throw lastError
}

/**
 * Ensure database connection is ready, with retry logic for cold starts.
 */
export async function ensureConnection(): Promise<void> {
  await withRetry(async () => {
    await prisma.$queryRaw`SELECT 1`
  }, 'connection check')
}

export default prisma
