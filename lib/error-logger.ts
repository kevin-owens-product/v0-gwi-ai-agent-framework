/**
 * Structured Error Logging with Sentry Integration
 *
 * This module provides a centralized error logging system that works with Sentry
 * for production error tracking and monitoring.
 */

import * as Sentry from '@sentry/nextjs';

export type LogLevel = 'debug' | 'info' | 'warning' | 'error' | 'fatal';

export interface LogContext {
  userId?: string;
  orgId?: string;
  requestId?: string;
  path?: string;
  method?: string;
  statusCode?: number;
  duration?: number;
  [key: string]: any;
}

export interface ErrorLogOptions {
  level?: LogLevel;
  context?: LogContext;
  tags?: Record<string, string>;
  fingerprint?: string[];
  user?: {
    id?: string;
    email?: string;
    username?: string;
  };
}

/**
 * Logger class for structured logging with Sentry integration
 */
class Logger {
  /**
   * Log a debug message (not sent to Sentry in production)
   */
  debug(message: string, context?: LogContext): void {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[DEBUG] ${message}`, context);
    }
  }

  /**
   * Log an info message
   */
  info(message: string, context?: LogContext): void {
    console.info(`[INFO] ${message}`, context);

    if (process.env.NODE_ENV === 'production') {
      Sentry.captureMessage(message, {
        level: 'info',
        contexts: { custom: context },
      });
    }
  }

  /**
   * Log a warning message
   */
  warn(message: string, context?: LogContext): void {
    console.warn(`[WARN] ${message}`, context);

    if (process.env.NODE_ENV === 'production') {
      Sentry.captureMessage(message, {
        level: 'warning',
        contexts: { custom: context },
      });
    }
  }

  /**
   * Log an error with full Sentry integration
   */
  error(error: Error | string, options?: ErrorLogOptions): void {
    const errorObj = typeof error === 'string' ? new Error(error) : error;
    const { level = 'error', context, tags, fingerprint, user } = options || {};

    console.error(`[ERROR] ${errorObj.message}`, { context, stack: errorObj.stack });

    // Send to Sentry in non-development environments
    if (process.env.NODE_ENV !== 'development') {
      Sentry.captureException(errorObj, {
        level,
        contexts: context ? { custom: context } : undefined,
        tags,
        fingerprint,
        user,
      });
    }
  }

  /**
   * Log a fatal error (requires immediate attention)
   */
  fatal(error: Error | string, options?: ErrorLogOptions): void {
    this.error(error, { ...options, level: 'fatal' });
  }

  /**
   * Set user context for all subsequent error logs
   */
  setUser(user: { id?: string; email?: string; username?: string; }): void {
    Sentry.setUser(user);
  }

  /**
   * Clear user context
   */
  clearUser(): void {
    Sentry.setUser(null);
  }

  /**
   * Add breadcrumb for debugging error context
   */
  addBreadcrumb(message: string, data?: Record<string, any>, level?: LogLevel): void {
    Sentry.addBreadcrumb({
      message,
      data,
      level: level || 'info',
      timestamp: Date.now() / 1000,
    });
  }

  /**
   * Set tag for filtering errors in Sentry
   */
  setTag(key: string, value: string): void {
    Sentry.setTag(key, value);
  }

  /**
   * Set multiple tags at once
   */
  setTags(tags: Record<string, string>): void {
    Sentry.setTags(tags);
  }

  /**
   * Set context for additional debugging information
   */
  setContext(name: string, context: Record<string, any>): void {
    Sentry.setContext(name, context);
  }

  /**
   * Wrap an async function with error logging
   */
  async wrap<T>(
    fn: () => Promise<T>,
    context?: LogContext
  ): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      this.error(error as Error, { context });
      throw error;
    }
  }

  /**
   * Create a child logger with preset context
   */
  child(context: LogContext): Logger {
    const childLogger = new Logger();

    // Override methods to include parent context
    const originalError = childLogger.error.bind(childLogger);
    childLogger.error = (error: Error | string, options?: ErrorLogOptions) => {
      originalError(error, {
        ...options,
        context: { ...context, ...options?.context },
      });
    };

    return childLogger;
  }
}

// Export singleton instance
export const logger = new Logger();

/**
 * API Error Logger - specialized for API route error handling
 */
export class ApiErrorLogger {
  static log(
    error: Error | unknown,
    req: Request | { method?: string; url?: string },
    additionalContext?: Record<string, any>
  ): void {
    const errorObj = error instanceof Error ? error : new Error(String(error));

    const context: LogContext = {
      method: req.method,
      path: req.url,
      ...additionalContext,
    };

    // Extract user info from request if available
    const user = (req as any).user;
    if (user) {
      context.userId = user.id;
      context.orgId = user.organizationId;
    }

    logger.error(errorObj, { context });
  }

  /**
   * Log slow API requests (performance monitoring)
   */
  static logSlowRequest(
    path: string,
    method: string,
    duration: number,
    threshold: number = 2000
  ): void {
    if (duration > threshold) {
      logger.warn('Slow API request detected', {
        path,
        method,
        duration,
        threshold,
      });
    }
  }

  /**
   * Log API request with timing
   */
  static logRequest(
    method: string,
    path: string,
    statusCode: number,
    duration: number,
    context?: Record<string, any>
  ): void {
    const level: LogLevel = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warning' : 'info';

    logger.addBreadcrumb(`${method} ${path}`, {
      statusCode,
      duration,
      ...context,
    }, level);

    // Log slow requests
    this.logSlowRequest(path, method, duration);
  }
}

/**
 * Database Error Logger - specialized for database error handling
 */
export class DbErrorLogger {
  static log(error: Error, operation: string, context?: Record<string, any>): void {
    logger.error(error, {
      context: {
        operation,
        type: 'database',
        ...context,
      },
      tags: {
        errorType: 'database',
        operation,
      },
    });
  }

  /**
   * Log slow database queries
   */
  static logSlowQuery(
    query: string,
    duration: number,
    threshold: number = 1000
  ): void {
    if (duration > threshold) {
      logger.warn('Slow database query detected', {
        query: query.substring(0, 200), // Truncate long queries
        duration,
        threshold,
      });
    }
  }
}

/**
 * External API Error Logger - for third-party API errors
 */
export class ExternalApiErrorLogger {
  static log(
    error: Error,
    service: string,
    endpoint: string,
    context?: Record<string, any>
  ): void {
    logger.error(error, {
      context: {
        service,
        endpoint,
        type: 'external_api',
        ...context,
      },
      tags: {
        errorType: 'external_api',
        service,
      },
    });
  }
}

// Re-export Sentry for advanced usage
export { Sentry };
