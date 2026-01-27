import { NextApiResponse } from 'next'
import type { Role } from '@prisma/client'
import type { AuthenticatedRequest } from './withOrganization'

type ApiHandler = (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => Promise<void> | void

/**
 * Middleware to check if user has required role(s) in the organization
 * Must be used after withOrganization middleware
 */
export function withRole(allowedRoles: Role[], handler: ApiHandler) {
  return async (req: AuthenticatedRequest, res: NextApiResponse) => {
    if (!req.organization) {
      return res.status(500).json({
        error: 'Internal server error',
        message: 'withRole must be used after withOrganization'
      })
    }

    if (!allowedRoles.includes(req.organization.role)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: `This action requires one of the following roles: ${allowedRoles.join(', ')}`,
        requiredRoles: allowedRoles,
        currentRole: req.organization.role
      })
    }

    return handler(req, res)
  }
}
