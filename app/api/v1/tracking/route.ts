/**
 * Client-Side Event Tracking API Endpoint
 *
 * Receives batched tracking events from the client and stores them
 * in the audit log system for analytics and reporting.
 *
 * @route POST /api/v1/tracking
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { logBatchAuditEvents, type AuditAction, type AuditResourceType } from '@/lib/audit';
import type { TrackingEvent } from '@/lib/client-tracking';

/**
 * Rate limiting configuration
 */
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 100; // Max 100 batch requests per minute
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

/**
 * Check rate limit for a given identifier
 */
function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const limit = rateLimitMap.get(identifier);

  if (!limit || now > limit.resetAt) {
    rateLimitMap.set(identifier, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW,
    });
    return true;
  }

  if (limit.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  limit.count++;
  return true;
}

/**
 * Map tracking event category to audit resource type
 */
function mapCategoryToResourceType(category: string): AuditResourceType {
  const mapping: Record<string, AuditResourceType> = {
    agent: 'agent',
    workflow: 'workflow',
    report: 'report',
    audience: 'audience',
    crosstab: 'crosstab',
    chart: 'chart',
    dashboard: 'dashboard',
    brand_tracking: 'brand_tracking',
    data_source: 'data_source',
    team: 'team_member',
    api_key: 'api_key',
    settings: 'settings',
    authentication: 'user',
  };

  return mapping[category] || 'agent'; // Default to agent
}

/**
 * Map tracking action to audit action
 */
function mapActionToAuditAction(action: string): AuditAction {
  // Extract base action
  if (action.includes('create')) return 'create';
  if (action.includes('edit') || action.includes('update')) return 'update';
  if (action.includes('delete')) return 'delete';
  if (action.includes('view')) return 'read';
  if (action.includes('run') || action.includes('execute')) return 'execute';
  if (action.includes('export')) return 'export';
  if (action.includes('analyze')) return 'analyze';
  if (action.includes('login')) return 'login';
  if (action.includes('logout')) return 'logout';
  if (action.includes('invite')) return 'invite';
  if (action.includes('join')) return 'join';
  if (action.includes('leave')) return 'leave';

  return 'read'; // Default to read
}

/**
 * POST /api/v1/tracking
 *
 * Receive and store batched tracking events from the client
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    // Get user ID (or use anonymous if not authenticated)
    const userId = session?.user?.id || 'anonymous';
    const orgId = (session?.user as any)?.currentOrgId;

    // Rate limiting by user ID or IP
    const identifier = userId !== 'anonymous' ? userId : req.headers.get('x-forwarded-for') || 'unknown';
    if (!checkRateLimit(identifier)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    // Parse request body
    const body = await req.json();
    const { events, sessionId } = body;

    if (!Array.isArray(events) || events.length === 0) {
      return NextResponse.json(
        { error: 'Invalid events array' },
        { status: 400 }
      );
    }

    // Validate and limit batch size
    if (events.length > 100) {
      return NextResponse.json(
        { error: 'Batch size too large (max 100 events)' },
        { status: 400 }
      );
    }

    // Extract IP and user agent
    const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    // Convert tracking events to audit events
    // Only log if we have an orgId (skip anonymous users without org)
    if (orgId) {
      const auditEvents = events.map((event: TrackingEvent) => ({
        orgId,
        userId: userId !== 'anonymous' ? userId : undefined,
        action: mapActionToAuditAction(event.action),
        resourceType: mapCategoryToResourceType(event.category),
        resourceId: event.metadata?.resourceId || undefined,
        metadata: {
          category: event.category,
          action: event.action,
          label: event.label,
          value: event.value,
          sessionId,
          timestamp: event.timestamp,
          ...event.metadata,
        } as Record<string, unknown>,
        ipAddress,
        userAgent,
      }));

      // Log events in batch
      await logBatchAuditEvents(auditEvents);
    }

    return NextResponse.json({
      success: true,
      processed: events.length,
    });
  } catch (error) {
    console.error('[Tracking API] Error processing events:', error);
    return NextResponse.json(
      { error: 'Failed to process tracking events' },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS /api/v1/tracking
 *
 * CORS preflight handler
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
