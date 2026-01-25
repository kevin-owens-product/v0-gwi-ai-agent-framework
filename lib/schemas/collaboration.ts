import { z } from 'zod'

// Comment schemas
export const createCommentSchema = z.object({
  entityType: z.string().min(1, 'Entity type is required'),
  entityId: z.string().min(1, 'Entity ID is required'),
  content: z.string().min(1, 'Comment content is required').max(10000, 'Comment too long'),
  parentId: z.string().optional(),
  mentions: z.array(z.string()).default([]),
})

export const updateCommentSchema = z.object({
  content: z.string().min(1, 'Comment content is required').max(10000, 'Comment too long').optional(),
  isResolved: z.boolean().optional(),
})

export type CreateCommentPayload = z.infer<typeof createCommentSchema>
export type UpdateCommentPayload = z.infer<typeof updateCommentSchema>

// Shared link permission enum
export const SharedLinkPermission = {
  VIEW: 'VIEW',
  COMMENT: 'COMMENT',
  DOWNLOAD: 'DOWNLOAD',
} as const

export type SharedLinkPermissionType = keyof typeof SharedLinkPermission

// Shared link schemas
export const createSharedLinkSchema = z.object({
  entityType: z.string().min(1, 'Entity type is required'),
  entityId: z.string().min(1, 'Entity ID is required'),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
  expiresAt: z.string().datetime().optional(),
  maxViews: z.number().int().positive().optional(),
  allowedEmails: z.array(z.string().email()).default([]),
  permissions: z.enum(['VIEW', 'COMMENT', 'DOWNLOAD']).default('VIEW'),
})

export const updateSharedLinkSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters').optional().nullable(),
  expiresAt: z.string().datetime().optional().nullable(),
  maxViews: z.number().int().positive().optional().nullable(),
  allowedEmails: z.array(z.string().email()).optional(),
  permissions: z.enum(['VIEW', 'COMMENT', 'DOWNLOAD']).optional(),
  isActive: z.boolean().optional(),
})

export const accessSharedLinkSchema = z.object({
  password: z.string().optional(),
  viewerEmail: z.string().email().optional(),
})

export type CreateSharedLinkPayload = z.infer<typeof createSharedLinkSchema>
export type UpdateSharedLinkPayload = z.infer<typeof updateSharedLinkSchema>
export type AccessSharedLinkPayload = z.infer<typeof accessSharedLinkSchema>
