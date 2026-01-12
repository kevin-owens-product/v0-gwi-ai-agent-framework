import { prisma } from './db'
import { Prisma } from '@prisma/client'

export type AuditAction =
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'execute'
  | 'export'
  | 'login'
  | 'logout'
  | 'invite'
  | 'join'
  | 'leave'
  | 'analyze'

export type AuditResourceType =
  | 'agent'
  | 'insight'
  | 'data_source'
  | 'user'
  | 'settings'
  | 'api_key'
  | 'invitation'
  | 'organization'
  | 'agent_run'
  | 'workflow'
  | 'report'
  | 'brand_tracking'
  | 'brand_tracking_snapshot'
  | 'dashboard'
  | 'audience'
  | 'crosstab'
  | 'chart'
  | 'template'
  | 'team_member'
  | 'team_invitation'
  | 'memory'

export interface AuditEvent {
  orgId: string
  userId?: string
  action: AuditAction
  resourceType: AuditResourceType
  resourceId?: string
  metadata?: Record<string, unknown>
  ipAddress?: string
  userAgent?: string
}

export async function logAuditEvent(event: AuditEvent) {
  try {
    await prisma.auditLog.create({
      data: {
        orgId: event.orgId,
        userId: event.userId,
        action: event.action,
        resourceType: event.resourceType,
        resourceId: event.resourceId,
        metadata: (event.metadata || {}) as Prisma.InputJsonValue,
        ipAddress: event.ipAddress,
        userAgent: event.userAgent,
      }
    })
  } catch (error) {
    console.error('Failed to log audit event:', error)
  }
}

export interface AuditLogQueryOptions {
  limit?: number
  offset?: number
  action?: string
  resourceType?: string
  userId?: string
  startDate?: Date
  endDate?: Date
}

export async function getAuditLogs(
  orgId: string,
  options: AuditLogQueryOptions = {}
) {
  const {
    limit = 50,
    offset = 0,
    action,
    resourceType,
    userId,
    startDate,
    endDate
  } = options

  const where: Record<string, unknown> = { orgId }

  if (action) where.action = action
  if (resourceType) where.resourceType = resourceType
  if (userId) where.userId = userId
  if (startDate || endDate) {
    where.timestamp = {}
    if (startDate) (where.timestamp as Record<string, Date>).gte = startDate
    if (endDate) (where.timestamp as Record<string, Date>).lte = endDate
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { timestamp: 'desc' },
      take: limit,
      skip: offset,
    }),
    prisma.auditLog.count({ where })
  ])

  return { logs, total }
}

// Helper to create audit event from request
export function createAuditEventFromRequest(
  request: Request,
  event: Omit<AuditEvent, 'ipAddress' | 'userAgent'>
): AuditEvent {
  const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || undefined
  const userAgent = request.headers.get('user-agent') || undefined

  return {
    ...event,
    ipAddress,
    userAgent,
  }
}

// Batch audit logging for bulk operations
export async function logBatchAuditEvents(events: AuditEvent[]) {
  try {
    await prisma.auditLog.createMany({
      data: events.map(event => ({
        orgId: event.orgId,
        userId: event.userId,
        action: event.action,
        resourceType: event.resourceType,
        resourceId: event.resourceId,
        metadata: (event.metadata || {}) as Prisma.InputJsonValue,
        ipAddress: event.ipAddress,
        userAgent: event.userAgent,
      }))
    })
  } catch (error) {
    console.error('Failed to log batch audit events:', error)
  }
}
