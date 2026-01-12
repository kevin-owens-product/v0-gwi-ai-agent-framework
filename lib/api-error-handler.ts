/**
 * API Error Handler Wrapper
 *
 * Provides a consistent way to handle errors in API routes with
 * automatic logging to Sentry and structured error responses.
 */

import { NextRequest, NextResponse } from 'next/server';
import { ApiErrorLogger, logger } from './error-logger';
import { ZodError } from 'zod';

export interface ApiErrorResponse {
  error: string;
  message?: string;
  details?: any;
  requestId?: string;
}

/**
 * Wrap an API route handler with error logging
 *
 * @example
 * ```ts
 * export const GET = withErrorHandler(async (request: NextRequest) => {
 *   const data = await fetchSomeData();
 *   return NextResponse.json(data);
 * });
 * ```
 */
export function withErrorHandler(
  handler: (request: NextRequest, context?: any) => Promise<NextResponse>
) {
  return async (request: NextRequest, context?: any): Promise<NextResponse> => {
    const startTime = Date.now();
    const requestId = crypto.randomUUID();

    try {
      // Add request ID to logger context
      logger.setTag('requestId', requestId);

      // Execute the handler
      const response = await handler(request, context);

      // Log request metrics
      const duration = Date.now() - startTime;
      ApiErrorLogger.logRequest(
        request.method,
        request.url,
        response.status,
        duration
      );

      // Add request ID to response headers
      response.headers.set('X-Request-Id', requestId);

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;

      // Log the error with context
      ApiErrorLogger.log(error, request, {
        requestId,
        duration,
      });

      // Return appropriate error response
      return handleError(error, requestId);
    }
  };
}

/**
 * Handle different types of errors and return appropriate responses
 */
function handleError(error: unknown, requestId: string): NextResponse {
  // Zod validation errors
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: 'Validation error',
        message: 'Invalid request data',
        details: error.errors,
        requestId,
      } as ApiErrorResponse,
      { status: 400 }
    );
  }

  // Custom application errors with status codes
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        error: error.name,
        message: error.message,
        requestId,
      } as ApiErrorResponse,
      { status: error.statusCode }
    );
  }

  // Prisma errors
  if (error && typeof error === 'object' && 'code' in error) {
    const prismaError = error as any;

    // Handle known Prisma error codes
    if (prismaError.code === 'P2002') {
      return NextResponse.json(
        {
          error: 'Conflict',
          message: 'A record with this unique field already exists',
          requestId,
        } as ApiErrorResponse,
        { status: 409 }
      );
    }

    if (prismaError.code === 'P2025') {
      return NextResponse.json(
        {
          error: 'Not found',
          message: 'The requested record was not found',
          requestId,
        } as ApiErrorResponse,
        { status: 404 }
      );
    }
  }

  // Generic errors
  const errorMessage = error instanceof Error ? error.message : 'Internal server error';

  // Don't expose internal error details in production
  const message = process.env.NODE_ENV === 'development'
    ? errorMessage
    : 'An unexpected error occurred';

  return NextResponse.json(
    {
      error: 'Internal server error',
      message,
      requestId,
    } as ApiErrorResponse,
    { status: 500 }
  );
}

/**
 * Custom application error class with status code
 */
export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = code || 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string): AppError {
    return new AppError(400, message, 'BadRequest');
  }

  static unauthorized(message: string = 'Unauthorized'): AppError {
    return new AppError(401, message, 'Unauthorized');
  }

  static forbidden(message: string = 'Forbidden'): AppError {
    return new AppError(403, message, 'Forbidden');
  }

  static notFound(message: string = 'Not found'): AppError {
    return new AppError(404, message, 'NotFound');
  }

  static conflict(message: string): AppError {
    return new AppError(409, message, 'Conflict');
  }

  static tooManyRequests(message: string = 'Too many requests'): AppError {
    return new AppError(429, message, 'TooManyRequests');
  }

  static internal(message: string = 'Internal server error'): AppError {
    return new AppError(500, message, 'InternalError');
  }
}

/**
 * Async try-catch wrapper with error logging
 */
export async function tryCatch<T>(
  fn: () => Promise<T>,
  errorMessage: string
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    logger.error(error as Error, {
      context: { operation: errorMessage },
    });
    throw error;
  }
}

/**
 * Measure and log execution time of async operations
 */
export async function measureTime<T>(
  fn: () => Promise<T>,
  operationName: string,
  threshold: number = 1000
): Promise<T> {
  const startTime = Date.now();

  try {
    const result = await fn();
    const duration = Date.now() - startTime;

    if (duration > threshold) {
      logger.warn(`Slow operation: ${operationName}`, {
        duration,
        threshold,
        operation: operationName,
      });
    }

    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error(error as Error, {
      context: {
        operation: operationName,
        duration,
      },
    });
    throw error;
  }
}
