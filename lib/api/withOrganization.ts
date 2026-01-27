import { NextApiRequest, NextApiResponse } from 'next'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { Role } from '@prisma/client'

export interface OrganizationContext {
  id: string
  role: Role
}

export interface AuthenticatedRequest extends NextApiRequest {
  session: {
    user: {
      id: string
      email: string
      name?: string | null
    }
  }
  organization: OrganizationContext
}

type ApiHandler = (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => Promise<void> | void

/**
 * Middleware to add organization context to API requests
 * Validates that the user is a member of the requested organization
 */
export function withOrganization(handler: ApiHandler) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      // Get session
      const session = await auth()

      if (!session?.user) {
        return res.status(401).json({ error: 'Unauthorized' })
      }

      // Get organization ID from header or query
      const orgIdFromHeader = req.headers['x-organization-id'] as string
      const orgIdFromQuery = req.query.organizationId as string
      const organizationId = orgIdFromHeader || orgIdFromQuery

      if (!organizationId) {
        return res.status(400).json({
          error: 'Organization ID required',
          message: 'Please provide organization ID in X-Organization-Id header or organizationId query parameter'
        })
      }

      // Verify user is a member of this organization
      const member = await prisma.organizationMember.findFirst({
        where: {
          userId: session.user.id,
          orgId: organizationId,
        },
      })

      if (!member) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'You are not a member of this organization'
        })
      }

      // Add organization context to request
      const authenticatedReq = req as AuthenticatedRequest
      authenticatedReq.session = {
        user: {
          id: session.user.id!,
          email: session.user.email!,
          name: session.user.name,
        }
      }
      authenticatedReq.organization = {
        id: organizationId,
        role: member.role,
      }

      return handler(authenticatedReq, res)
    } catch (error) {
      console.error('withOrganization middleware error:', error)
      return res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to authenticate request'
      })
    }
  }
}
