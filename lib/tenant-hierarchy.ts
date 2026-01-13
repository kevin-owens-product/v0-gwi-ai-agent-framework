/**
 * Multi-Level Tenant Hierarchy Service
 *
 * This service provides comprehensive functionality for managing hierarchical
 * organization structures, including:
 * - Hierarchy traversal and queries
 * - Parent-child relationships
 * - Cross-org relationships (partnerships, management, etc.)
 * - Resource sharing across organizations
 * - Permission inheritance
 * - Billing consolidation
 */

import { prisma } from './prisma'
import type {
  Organization,
  OrganizationType,
  OrgRelationshipType,
  RelationshipStatus,
  BillingRelationship,
  ResourceSharingScope,
  SharedResourceType,
  Role,
  HierarchyAction,
  PlanTier,
  CompanySize,
} from '@prisma/client'

// ==================== TYPE DEFINITIONS ====================

export interface CreateChildOrgInput {
  name: string
  slug?: string
  orgType: OrganizationType
  parentOrgId: string
  planTier?: PlanTier
  settings?: Record<string, unknown>
  inheritSettings?: boolean
  industry?: string
  companySize?: CompanySize
  country?: string
  timezone?: string
  logoUrl?: string
  brandColor?: string
  domain?: string
}

export interface CreateRelationshipInput {
  fromOrgId: string
  toOrgId: string
  relationshipType: OrgRelationshipType
  accessLevel?: ResourceSharingScope
  billingRelation?: BillingRelationship
  billingConfig?: Record<string, unknown>
  permissions?: Record<string, unknown>
  contractStart?: Date
  contractEnd?: Date
  notes?: string
  initiatedBy: string
}

export interface ShareResourceInput {
  ownerOrgId: string
  targetOrgId: string
  resourceType: SharedResourceType
  resourceId?: string
  accessLevel: ResourceSharingScope
  canView?: boolean
  canEdit?: boolean
  canDelete?: boolean
  canShare?: boolean
  propagateToChildren?: boolean
  expiresAt?: Date
  grantedBy: string
}

export interface HierarchyNode {
  id: string
  name: string
  slug: string
  orgType: OrganizationType
  level: number
  planTier: PlanTier
  children?: HierarchyNode[]
  memberCount?: number
  childCount?: number
  isAccessible?: boolean
}

export interface OrgWithHierarchy extends Organization {
  parentOrg?: Organization | null
  childOrgs?: Organization[]
  ancestorPath?: Organization[]
  descendantCount?: number
}

export interface EffectivePermissions {
  orgId: string
  directRole: Role | null
  inheritedRole: Role | null
  effectiveRole: Role | null
  accessSource: 'direct' | 'inherited' | 'relationship' | 'none'
  permissions: string[]
  sharedResources: SharedResourceType[]
}

export interface HierarchyStats {
  totalOrgs: number
  totalRelationships: number
  maxDepth: number
  orgsByType: Record<OrganizationType, number>
  orgsByLevel: Record<number, number>
}

// ==================== HIERARCHY MANAGEMENT ====================

/**
 * Create a child organization under a parent
 */
export async function createChildOrganization(
  input: CreateChildOrgInput,
  createdBy: string
): Promise<Organization> {
  const parent = await prisma.organization.findUnique({
    where: { id: input.parentOrgId },
    select: {
      id: true,
      hierarchyPath: true,
      hierarchyLevel: true,
      rootOrgId: true,
      maxChildDepth: true,
      allowChildOrgs: true,
      settings: true,
      planTier: true,
    },
  })

  if (!parent) {
    throw new Error('Parent organization not found')
  }

  if (!parent.allowChildOrgs) {
    throw new Error('Parent organization does not allow child organizations')
  }

  const newLevel = parent.hierarchyLevel + 1
  if (newLevel > parent.maxChildDepth) {
    throw new Error(`Maximum hierarchy depth (${parent.maxChildDepth}) exceeded`)
  }

  // Generate slug if not provided
  const slug = input.slug || (await generateUniqueSlug(input.name))

  // Determine root org (either parent's root or parent if parent is root)
  const rootOrgId = parent.rootOrgId || parent.id

  // Build hierarchy path
  const hierarchyPath = `${parent.hierarchyPath}${parent.id}/`

  // Merge settings if inheriting
  const settings = input.inheritSettings !== false && parent.settings
    ? { ...(parent.settings as Record<string, unknown>), ...(input.settings || {}) }
    : input.settings || {}

  const newOrg = await prisma.$transaction(async (tx) => {
    // Create the organization
    const org = await tx.organization.create({
      data: {
        name: input.name,
        slug,
        orgType: input.orgType,
        parentOrgId: input.parentOrgId,
        rootOrgId,
        hierarchyPath,
        hierarchyLevel: newLevel,
        planTier: input.planTier || parent.planTier,
        settings,
        inheritSettings: input.inheritSettings ?? true,
        allowChildOrgs: canOrgTypeHaveChildren(input.orgType),
        industry: input.industry,
        companySize: input.companySize,
        country: input.country,
        timezone: input.timezone || 'UTC',
        logoUrl: input.logoUrl,
        brandColor: input.brandColor,
        domain: input.domain,
      },
    })

    // Log the hierarchy action
    await tx.hierarchyAuditLog.create({
      data: {
        orgId: org.id,
        actorOrgId: input.parentOrgId,
        actorUserId: createdBy,
        action: 'ORG_CREATED',
        newState: {
          name: org.name,
          orgType: org.orgType,
          parentOrgId: org.parentOrgId,
          hierarchyLevel: org.hierarchyLevel,
        },
      },
    })

    return org
  })

  return newOrg
}

/**
 * Move an organization to a new parent
 */
export async function moveOrganization(
  orgId: string,
  newParentOrgId: string | null,
  movedBy: string
): Promise<Organization> {
  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    include: {
      childOrgs: true,
    },
  })

  if (!org) {
    throw new Error('Organization not found')
  }

  // Validate new parent
  let newParent = null
  let newHierarchyPath = '/'
  let newLevel = 0
  let newRootOrgId: string | null = null

  if (newParentOrgId) {
    newParent = await prisma.organization.findUnique({
      where: { id: newParentOrgId },
    })

    if (!newParent) {
      throw new Error('New parent organization not found')
    }

    if (!newParent.allowChildOrgs) {
      throw new Error('New parent does not allow child organizations')
    }

    // Prevent circular references
    if (await isDescendantOf(newParentOrgId, orgId)) {
      throw new Error('Cannot move organization to its own descendant')
    }

    newLevel = newParent.hierarchyLevel + 1
    if (newLevel > newParent.maxChildDepth) {
      throw new Error(`Would exceed maximum hierarchy depth (${newParent.maxChildDepth})`)
    }

    newHierarchyPath = `${newParent.hierarchyPath}${newParent.id}/`
    newRootOrgId = newParent.rootOrgId || newParent.id
  }

  const previousState = {
    parentOrgId: org.parentOrgId,
    hierarchyPath: org.hierarchyPath,
    hierarchyLevel: org.hierarchyLevel,
    rootOrgId: org.rootOrgId,
  }

  // Update org and all descendants
  const updatedOrg = await prisma.$transaction(async (tx) => {
    // Update the organization
    const updated = await tx.organization.update({
      where: { id: orgId },
      data: {
        parentOrgId: newParentOrgId,
        hierarchyPath: newHierarchyPath,
        hierarchyLevel: newLevel,
        rootOrgId: newRootOrgId,
      },
    })

    // Update all descendants' paths
    const oldPathPrefix = org.hierarchyPath + org.id + '/'
    const newPathPrefix = newHierarchyPath + org.id + '/'
    const levelDiff = newLevel - org.hierarchyLevel

    await updateDescendantPaths(tx, oldPathPrefix, newPathPrefix, levelDiff, newRootOrgId || orgId)

    // Log the action
    await tx.hierarchyAuditLog.create({
      data: {
        orgId,
        actorOrgId: newParentOrgId,
        actorUserId: movedBy,
        action: 'ORG_MOVED',
        targetOrgId: newParentOrgId,
        previousState,
        newState: {
          parentOrgId: newParentOrgId,
          hierarchyPath: newHierarchyPath,
          hierarchyLevel: newLevel,
          rootOrgId: newRootOrgId,
        },
      },
    })

    return updated
  })

  return updatedOrg
}

/**
 * Helper to update descendant paths when an org is moved
 */
async function updateDescendantPaths(
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
  oldPathPrefix: string,
  newPathPrefix: string,
  levelDiff: number,
  newRootOrgId: string
): Promise<void> {
  // Find all descendants
  const descendants = await tx.organization.findMany({
    where: {
      hierarchyPath: {
        startsWith: oldPathPrefix,
      },
    },
  })

  // Update each descendant
  for (const desc of descendants) {
    const newPath = desc.hierarchyPath.replace(oldPathPrefix, newPathPrefix)
    await tx.organization.update({
      where: { id: desc.id },
      data: {
        hierarchyPath: newPath,
        hierarchyLevel: desc.hierarchyLevel + levelDiff,
        rootOrgId: newRootOrgId,
      },
    })
  }
}

// ==================== HIERARCHY QUERIES ====================

/**
 * Get the full hierarchy tree for an organization
 */
export async function getHierarchyTree(
  rootOrgId: string,
  maxDepth: number = 10
): Promise<HierarchyNode | null> {
  const rootOrg = await prisma.organization.findUnique({
    where: { id: rootOrgId },
    include: {
      _count: {
        select: {
          members: true,
          childOrgs: true,
        },
      },
    },
  })

  if (!rootOrg) return null

  const buildTree = async (
    org: typeof rootOrg,
    currentDepth: number
  ): Promise<HierarchyNode> => {
    const node: HierarchyNode = {
      id: org.id,
      name: org.name,
      slug: org.slug,
      orgType: org.orgType,
      level: org.hierarchyLevel,
      planTier: org.planTier,
      memberCount: org._count.members,
      childCount: org._count.childOrgs,
    }

    if (currentDepth < maxDepth && org._count.childOrgs > 0) {
      const children = await prisma.organization.findMany({
        where: { parentOrgId: org.id },
        include: {
          _count: {
            select: {
              members: true,
              childOrgs: true,
            },
          },
        },
        orderBy: { displayOrder: 'asc' },
      })

      node.children = await Promise.all(
        children.map((child) => buildTree(child, currentDepth + 1))
      )
    }

    return node
  }

  return buildTree(rootOrg, 0)
}

/**
 * Get all ancestors of an organization (from immediate parent to root)
 */
export async function getAncestors(orgId: string): Promise<Organization[]> {
  const org = await prisma.organization.findUnique({
    where: { id: orgId },
  })

  if (!org || !org.parentOrgId) return []

  // Parse the hierarchy path to get ancestor IDs
  const pathParts = org.hierarchyPath.split('/').filter(Boolean)
  if (pathParts.length === 0) return []

  const ancestors = await prisma.organization.findMany({
    where: {
      id: { in: pathParts },
    },
    orderBy: { hierarchyLevel: 'asc' },
  })

  return ancestors
}

/**
 * Get all descendants of an organization
 */
export async function getDescendants(
  orgId: string,
  options?: {
    maxDepth?: number
    orgTypes?: OrganizationType[]
    includeInactive?: boolean
  }
): Promise<Organization[]> {
  const org = await prisma.organization.findUnique({
    where: { id: orgId },
  })

  if (!org) return []

  const pathPrefix = `${org.hierarchyPath}${org.id}/`

  const whereClause: Parameters<typeof prisma.organization.findMany>[0]['where'] = {
    hierarchyPath: {
      startsWith: pathPrefix,
    },
  }

  if (options?.maxDepth !== undefined) {
    whereClause.hierarchyLevel = {
      lte: org.hierarchyLevel + options.maxDepth,
    }
  }

  if (options?.orgTypes?.length) {
    whereClause.orgType = { in: options.orgTypes }
  }

  const descendants = await prisma.organization.findMany({
    where: whereClause,
    orderBy: [{ hierarchyLevel: 'asc' }, { displayOrder: 'asc' }],
  })

  return descendants
}

/**
 * Get direct children of an organization
 */
export async function getDirectChildren(
  orgId: string,
  options?: {
    orgTypes?: OrganizationType[]
    planTiers?: PlanTier[]
  }
): Promise<Organization[]> {
  const whereClause: Parameters<typeof prisma.organization.findMany>[0]['where'] = {
    parentOrgId: orgId,
  }

  if (options?.orgTypes?.length) {
    whereClause.orgType = { in: options.orgTypes }
  }

  if (options?.planTiers?.length) {
    whereClause.planTier = { in: options.planTiers }
  }

  return prisma.organization.findMany({
    where: whereClause,
    orderBy: { displayOrder: 'asc' },
  })
}

/**
 * Check if an organization is a descendant of another
 */
export async function isDescendantOf(
  potentialDescendantId: string,
  ancestorId: string
): Promise<boolean> {
  const descendant = await prisma.organization.findUnique({
    where: { id: potentialDescendantId },
    select: { hierarchyPath: true },
  })

  if (!descendant) return false

  return descendant.hierarchyPath.includes(`/${ancestorId}/`)
}

/**
 * Get siblings of an organization
 */
export async function getSiblings(orgId: string): Promise<Organization[]> {
  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    select: { parentOrgId: true },
  })

  if (!org) return []

  return prisma.organization.findMany({
    where: {
      parentOrgId: org.parentOrgId,
      id: { not: orgId },
    },
    orderBy: { displayOrder: 'asc' },
  })
}

// ==================== CROSS-ORG RELATIONSHIPS ====================

/**
 * Create a relationship between organizations
 */
export async function createOrgRelationship(
  input: CreateRelationshipInput
): Promise<{ id: string }> {
  // Validate orgs exist
  const [fromOrg, toOrg] = await Promise.all([
    prisma.organization.findUnique({ where: { id: input.fromOrgId } }),
    prisma.organization.findUnique({ where: { id: input.toOrgId } }),
  ])

  if (!fromOrg || !toOrg) {
    throw new Error('One or both organizations not found')
  }

  // Prevent self-relationship
  if (input.fromOrgId === input.toOrgId) {
    throw new Error('Cannot create a relationship with self')
  }

  const relationship = await prisma.$transaction(async (tx) => {
    const rel = await tx.orgRelationship.create({
      data: {
        fromOrgId: input.fromOrgId,
        toOrgId: input.toOrgId,
        relationshipType: input.relationshipType,
        accessLevel: input.accessLevel || 'READ_ONLY',
        billingRelation: input.billingRelation || 'INDEPENDENT',
        billingConfig: input.billingConfig || {},
        permissions: input.permissions || {},
        contractStart: input.contractStart,
        contractEnd: input.contractEnd,
        notes: input.notes,
        initiatedBy: input.initiatedBy,
        status: 'PENDING',
      },
    })

    // Log the action
    await tx.hierarchyAuditLog.create({
      data: {
        orgId: input.fromOrgId,
        actorUserId: input.initiatedBy,
        action: 'RELATIONSHIP_CREATED',
        targetOrgId: input.toOrgId,
        newState: {
          relationshipType: input.relationshipType,
          accessLevel: input.accessLevel,
          billingRelation: input.billingRelation,
        },
      },
    })

    return rel
  })

  return { id: relationship.id }
}

/**
 * Update relationship status (accept, suspend, terminate)
 */
export async function updateRelationshipStatus(
  relationshipId: string,
  status: RelationshipStatus,
  updatedBy: string,
  approvedBy?: string
): Promise<void> {
  const relationship = await prisma.orgRelationship.findUnique({
    where: { id: relationshipId },
  })

  if (!relationship) {
    throw new Error('Relationship not found')
  }

  const previousStatus = relationship.status

  await prisma.$transaction(async (tx) => {
    await tx.orgRelationship.update({
      where: { id: relationshipId },
      data: {
        status,
        approvedBy: status === 'ACTIVE' ? approvedBy : undefined,
        approvedAt: status === 'ACTIVE' ? new Date() : undefined,
      },
    })

    await tx.hierarchyAuditLog.create({
      data: {
        orgId: relationship.fromOrgId,
        actorUserId: updatedBy,
        action: 'RELATIONSHIP_UPDATED',
        targetOrgId: relationship.toOrgId,
        previousState: { status: previousStatus },
        newState: { status },
      },
    })
  })
}

/**
 * Get all relationships for an organization
 */
export async function getOrgRelationships(
  orgId: string,
  options?: {
    direction?: 'from' | 'to' | 'both'
    types?: OrgRelationshipType[]
    status?: RelationshipStatus[]
  }
): Promise<{
  outgoing: Array<{ relationship: any; org: Organization }>
  incoming: Array<{ relationship: any; org: Organization }>
}> {
  const direction = options?.direction || 'both'

  const outgoing =
    direction === 'to'
      ? []
      : await prisma.orgRelationship.findMany({
          where: {
            fromOrgId: orgId,
            ...(options?.types?.length && { relationshipType: { in: options.types } }),
            ...(options?.status?.length && { status: { in: options.status } }),
          },
          include: {
            toOrg: true,
          },
        })

  const incoming =
    direction === 'from'
      ? []
      : await prisma.orgRelationship.findMany({
          where: {
            toOrgId: orgId,
            ...(options?.types?.length && { relationshipType: { in: options.types } }),
            ...(options?.status?.length && { status: { in: options.status } }),
          },
          include: {
            fromOrg: true,
          },
        })

  return {
    outgoing: outgoing.map((r) => ({ relationship: r, org: r.toOrg })),
    incoming: incoming.map((r) => ({ relationship: r, org: r.fromOrg })),
  }
}

// ==================== RESOURCE SHARING ====================

/**
 * Share resources with another organization
 */
export async function shareResource(input: ShareResourceInput): Promise<{ id: string }> {
  // Validate orgs exist
  const [ownerOrg, targetOrg] = await Promise.all([
    prisma.organization.findUnique({ where: { id: input.ownerOrgId } }),
    prisma.organization.findUnique({ where: { id: input.targetOrgId } }),
  ])

  if (!ownerOrg || !targetOrg) {
    throw new Error('One or both organizations not found')
  }

  const access = await prisma.$transaction(async (tx) => {
    const shared = await tx.sharedResourceAccess.create({
      data: {
        ownerOrgId: input.ownerOrgId,
        targetOrgId: input.targetOrgId,
        resourceType: input.resourceType,
        resourceId: input.resourceId,
        accessLevel: input.accessLevel,
        canView: input.canView ?? true,
        canEdit: input.canEdit ?? false,
        canDelete: input.canDelete ?? false,
        canShare: input.canShare ?? false,
        propagateToChildren: input.propagateToChildren ?? false,
        expiresAt: input.expiresAt,
        grantedBy: input.grantedBy,
      },
    })

    await tx.hierarchyAuditLog.create({
      data: {
        orgId: input.ownerOrgId,
        actorUserId: input.grantedBy,
        action: 'RESOURCE_SHARED',
        targetOrgId: input.targetOrgId,
        newState: {
          resourceType: input.resourceType,
          resourceId: input.resourceId,
          accessLevel: input.accessLevel,
        },
      },
    })

    return shared
  })

  return { id: access.id }
}

/**
 * Revoke shared resource access
 */
export async function revokeResourceAccess(
  accessId: string,
  revokedBy: string
): Promise<void> {
  const access = await prisma.sharedResourceAccess.findUnique({
    where: { id: accessId },
  })

  if (!access) {
    throw new Error('Shared access not found')
  }

  await prisma.$transaction(async (tx) => {
    await tx.sharedResourceAccess.update({
      where: { id: accessId },
      data: { isActive: false },
    })

    await tx.hierarchyAuditLog.create({
      data: {
        orgId: access.ownerOrgId,
        actorUserId: revokedBy,
        action: 'RESOURCE_UNSHARED',
        targetOrgId: access.targetOrgId,
        previousState: {
          resourceType: access.resourceType,
          resourceId: access.resourceId,
        },
      },
    })
  })
}

/**
 * Get shared resources accessible to an organization
 */
export async function getAccessibleResources(
  orgId: string,
  resourceType?: SharedResourceType
): Promise<Array<{
  ownerOrg: Organization
  resourceType: SharedResourceType
  resourceId: string | null
  accessLevel: ResourceSharingScope
  canView: boolean
  canEdit: boolean
  canDelete: boolean
  canShare: boolean
}>> {
  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    select: { hierarchyPath: true },
  })

  if (!org) return []

  // Get direct access
  const directAccess = await prisma.sharedResourceAccess.findMany({
    where: {
      targetOrgId: orgId,
      isActive: true,
      ...(resourceType && { resourceType }),
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    },
    include: { ownerOrg: true },
  })

  // Get access through ancestry (propagated to children)
  const ancestorIds = org.hierarchyPath.split('/').filter(Boolean)
  const inheritedAccess =
    ancestorIds.length > 0
      ? await prisma.sharedResourceAccess.findMany({
          where: {
            targetOrgId: { in: ancestorIds },
            propagateToChildren: true,
            isActive: true,
            ...(resourceType && { resourceType }),
            OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
          },
          include: { ownerOrg: true },
        })
      : []

  return [...directAccess, ...inheritedAccess].map((a) => ({
    ownerOrg: a.ownerOrg,
    resourceType: a.resourceType,
    resourceId: a.resourceId,
    accessLevel: a.accessLevel,
    canView: a.canView,
    canEdit: a.canEdit,
    canDelete: a.canDelete,
    canShare: a.canShare,
  }))
}

// ==================== PERMISSION INHERITANCE ====================

/**
 * Get effective permissions for a user across the hierarchy
 */
export async function getEffectivePermissions(
  userId: string,
  targetOrgId: string
): Promise<EffectivePermissions> {
  // Get direct membership
  const directMembership = await prisma.organizationMember.findUnique({
    where: {
      orgId_userId: {
        orgId: targetOrgId,
        userId,
      },
    },
  })

  if (directMembership) {
    return {
      orgId: targetOrgId,
      directRole: directMembership.role,
      inheritedRole: null,
      effectiveRole: directMembership.role,
      accessSource: 'direct',
      permissions: getRolePermissions(directMembership.role),
      sharedResources: [],
    }
  }

  // Get target org's ancestors
  const targetOrg = await prisma.organization.findUnique({
    where: { id: targetOrgId },
    select: { hierarchyPath: true },
  })

  if (!targetOrg) {
    return {
      orgId: targetOrgId,
      directRole: null,
      inheritedRole: null,
      effectiveRole: null,
      accessSource: 'none',
      permissions: [],
      sharedResources: [],
    }
  }

  // Check for inherited access through parent orgs
  const ancestorIds = targetOrg.hierarchyPath.split('/').filter(Boolean)

  for (const ancestorId of ancestorIds.reverse()) {
    const ancestorMembership = await prisma.organizationMember.findUnique({
      where: {
        orgId_userId: {
          orgId: ancestorId,
          userId,
        },
      },
    })

    if (ancestorMembership) {
      // Check if there's an inheritance rule
      const inheritedRole = await getInheritedRole(ancestorId, targetOrgId, ancestorMembership.role)

      if (inheritedRole) {
        return {
          orgId: targetOrgId,
          directRole: null,
          inheritedRole,
          effectiveRole: inheritedRole,
          accessSource: 'inherited',
          permissions: getRolePermissions(inheritedRole),
          sharedResources: [],
        }
      }
    }
  }

  // Check for access through relationships
  const relationships = await prisma.orgRelationship.findMany({
    where: {
      toOrgId: targetOrgId,
      status: 'ACTIVE',
    },
    include: {
      fromOrg: {
        include: {
          members: {
            where: { userId },
          },
        },
      },
    },
  })

  for (const rel of relationships) {
    if (rel.fromOrg.members.length > 0) {
      const memberRole = rel.fromOrg.members[0].role
      const grantedRole = getRelationshipRole(rel.relationshipType, memberRole, rel.accessLevel)

      if (grantedRole) {
        return {
          orgId: targetOrgId,
          directRole: null,
          inheritedRole: null,
          effectiveRole: grantedRole,
          accessSource: 'relationship',
          permissions: getRolePermissions(grantedRole),
          sharedResources: [],
        }
      }
    }
  }

  return {
    orgId: targetOrgId,
    directRole: null,
    inheritedRole: null,
    effectiveRole: null,
    accessSource: 'none',
    permissions: [],
    sharedResources: [],
  }
}

/**
 * Get inherited role based on rules
 */
async function getInheritedRole(
  sourceOrgId: string,
  targetOrgId: string,
  sourceRole: Role
): Promise<Role | null> {
  const targetOrg = await prisma.organization.findUnique({
    where: { id: targetOrgId },
  })

  if (!targetOrg) return null

  // Find applicable inheritance rules
  const rules = await prisma.roleInheritanceRule.findMany({
    where: {
      OR: [{ orgId: sourceOrgId }, { orgId: targetOrgId }],
      sourceRole,
      isActive: true,
      inheritDown: true,
    },
    orderBy: { priority: 'desc' },
  })

  for (const rule of rules) {
    // Check if org type matches (if specified)
    if (rule.sourceOrgType && targetOrg.orgType !== rule.sourceOrgType) {
      continue
    }

    // Check inheritance levels
    if (rule.inheritLevels !== -1) {
      const sourceOrg = await prisma.organization.findUnique({
        where: { id: sourceOrgId },
        select: { hierarchyLevel: true },
      })

      if (sourceOrg) {
        const levelDiff = targetOrg.hierarchyLevel - sourceOrg.hierarchyLevel
        if (levelDiff > rule.inheritLevels) {
          continue
        }
      }
    }

    return rule.targetRole
  }

  // Default inheritance: OWNER/ADMIN in parent -> ADMIN in child
  if (sourceRole === 'OWNER' || sourceRole === 'ADMIN') {
    return 'ADMIN'
  }

  return null
}

/**
 * Get role granted through a relationship
 */
function getRelationshipRole(
  relationshipType: OrgRelationshipType,
  memberRole: Role,
  accessLevel: ResourceSharingScope
): Role | null {
  // Define role mapping based on relationship type and access level
  const roleMap: Record<OrgRelationshipType, Record<ResourceSharingScope, Role | null>> = {
    OWNERSHIP: {
      NONE: null,
      READ_ONLY: 'VIEWER',
      FULL_ACCESS: 'ADMIN',
      INHERIT: 'ADMIN',
    },
    MANAGEMENT: {
      NONE: null,
      READ_ONLY: 'VIEWER',
      FULL_ACCESS: 'MEMBER',
      INHERIT: 'MEMBER',
    },
    PARTNERSHIP: {
      NONE: null,
      READ_ONLY: 'VIEWER',
      FULL_ACCESS: 'VIEWER',
      INHERIT: 'VIEWER',
    },
    LICENSING: {
      NONE: null,
      READ_ONLY: 'VIEWER',
      FULL_ACCESS: 'MEMBER',
      INHERIT: 'VIEWER',
    },
    RESELLER: {
      NONE: null,
      READ_ONLY: 'VIEWER',
      FULL_ACCESS: 'MEMBER',
      INHERIT: 'MEMBER',
    },
    WHITE_LABEL: {
      NONE: null,
      READ_ONLY: 'VIEWER',
      FULL_ACCESS: 'ADMIN',
      INHERIT: 'ADMIN',
    },
    DATA_SHARING: {
      NONE: null,
      READ_ONLY: 'VIEWER',
      FULL_ACCESS: 'VIEWER',
      INHERIT: 'VIEWER',
    },
    CONSORTIUM: {
      NONE: null,
      READ_ONLY: 'VIEWER',
      FULL_ACCESS: 'VIEWER',
      INHERIT: 'VIEWER',
    },
  }

  // Only grant access if member has sufficient role in parent
  if (memberRole === 'OWNER' || memberRole === 'ADMIN') {
    return roleMap[relationshipType][accessLevel]
  }

  // Members/Viewers don't get access through relationships
  return null
}

/**
 * Get permissions for a role
 */
function getRolePermissions(role: Role): string[] {
  const permissions: Record<Role, string[]> = {
    OWNER: [
      'admin:*',
      'agents:*',
      'workflows:*',
      'reports:*',
      'dashboards:*',
      'audiences:*',
      'insights:*',
      'data:*',
      'team:*',
      'billing:*',
      'settings:*',
      'hierarchy:*',
    ],
    ADMIN: [
      'agents:*',
      'workflows:*',
      'reports:*',
      'dashboards:*',
      'audiences:*',
      'insights:*',
      'data:*',
      'team:manage',
      'settings:read',
      'hierarchy:read',
    ],
    MEMBER: [
      'agents:create',
      'agents:read',
      'agents:update',
      'workflows:create',
      'workflows:read',
      'workflows:update',
      'reports:create',
      'reports:read',
      'dashboards:create',
      'dashboards:read',
      'audiences:read',
      'insights:read',
      'data:read',
    ],
    VIEWER: [
      'agents:read',
      'workflows:read',
      'reports:read',
      'dashboards:read',
      'audiences:read',
      'insights:read',
    ],
  }

  return permissions[role] || []
}

// ==================== UTILITY FUNCTIONS ====================

/**
 * Determine if an org type can have children
 */
export function canOrgTypeHaveChildren(orgType: OrganizationType): boolean {
  const typesWithChildren: OrganizationType[] = [
    'AGENCY',
    'HOLDING_COMPANY',
    'BRAND',
    'DIVISION',
    'FRANCHISE',
    'RESELLER',
    'REGIONAL',
  ]
  return typesWithChildren.includes(orgType)
}

/**
 * Get recommended child types for an org type
 */
export function getRecommendedChildTypes(orgType: OrganizationType): OrganizationType[] {
  const recommendations: Partial<Record<OrganizationType, OrganizationType[]>> = {
    AGENCY: ['CLIENT', 'BRAND'],
    HOLDING_COMPANY: ['SUBSIDIARY', 'PORTFOLIO_COMPANY', 'BRAND'],
    BRAND: ['SUB_BRAND', 'REGIONAL'],
    DIVISION: ['DEPARTMENT'],
    FRANCHISE: ['FRANCHISEE'],
    RESELLER: ['CLIENT'],
    REGIONAL: ['STANDARD', 'BRAND'],
    SUBSIDIARY: ['DIVISION', 'DEPARTMENT'],
  }

  return recommendations[orgType] || ['STANDARD']
}

/**
 * Generate a unique slug
 */
async function generateUniqueSlug(name: string): Promise<string> {
  const baseSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

  let slug = baseSlug
  let counter = 1

  while (await prisma.organization.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter}`
    counter++
  }

  return slug
}

/**
 * Get hierarchy statistics for a root org
 */
export async function getHierarchyStats(rootOrgId: string): Promise<HierarchyStats> {
  const rootOrg = await prisma.organization.findUnique({
    where: { id: rootOrgId },
  })

  if (!rootOrg) {
    throw new Error('Organization not found')
  }

  const pathPrefix = rootOrg.hierarchyLevel === 0 ? `/${rootOrgId}/` : `${rootOrg.hierarchyPath}${rootOrgId}/`

  const descendants = await prisma.organization.findMany({
    where: {
      OR: [{ id: rootOrgId }, { hierarchyPath: { startsWith: pathPrefix } }],
    },
    select: {
      orgType: true,
      hierarchyLevel: true,
    },
  })

  const relationships = await prisma.orgRelationship.count({
    where: {
      OR: [{ fromOrgId: rootOrgId }, { toOrgId: rootOrgId }],
      status: 'ACTIVE',
    },
  })

  const orgsByType = descendants.reduce(
    (acc, org) => {
      acc[org.orgType] = (acc[org.orgType] || 0) + 1
      return acc
    },
    {} as Record<OrganizationType, number>
  )

  const orgsByLevel = descendants.reduce(
    (acc, org) => {
      acc[org.hierarchyLevel] = (acc[org.hierarchyLevel] || 0) + 1
      return acc
    },
    {} as Record<number, number>
  )

  const maxDepth = Math.max(...descendants.map((o) => o.hierarchyLevel))

  return {
    totalOrgs: descendants.length,
    totalRelationships: relationships,
    maxDepth,
    orgsByType,
    orgsByLevel,
  }
}

/**
 * Validate hierarchy integrity
 */
export async function validateHierarchyIntegrity(
  orgId: string
): Promise<{ valid: boolean; issues: string[] }> {
  const issues: string[] = []

  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    include: {
      parentOrg: true,
      childOrgs: true,
    },
  })

  if (!org) {
    return { valid: false, issues: ['Organization not found'] }
  }

  // Check hierarchy path consistency
  if (org.parentOrg) {
    const expectedPath = `${org.parentOrg.hierarchyPath}${org.parentOrg.id}/`
    if (org.hierarchyPath !== expectedPath) {
      issues.push(
        `Hierarchy path mismatch: expected ${expectedPath}, found ${org.hierarchyPath}`
      )
    }

    if (org.hierarchyLevel !== org.parentOrg.hierarchyLevel + 1) {
      issues.push(
        `Hierarchy level mismatch: expected ${org.parentOrg.hierarchyLevel + 1}, found ${org.hierarchyLevel}`
      )
    }
  } else if (org.hierarchyLevel !== 0) {
    issues.push(`Root org should have hierarchyLevel 0, found ${org.hierarchyLevel}`)
  }

  // Check root org reference
  if (org.parentOrg && !org.rootOrgId) {
    issues.push('Non-root org missing rootOrgId')
  }

  // Check for circular references (should not be possible, but validate)
  if (org.hierarchyPath.split('/').filter(Boolean).includes(org.id)) {
    issues.push('Circular reference detected in hierarchy path')
  }

  return { valid: issues.length === 0, issues }
}

/**
 * Get organizations accessible to a user across all hierarchies
 */
export async function getAccessibleOrganizations(
  userId: string
): Promise<Array<{ org: Organization; accessType: 'direct' | 'inherited' | 'relationship' }>> {
  // Get direct memberships
  const memberships = await prisma.organizationMember.findMany({
    where: { userId },
    include: { organization: true },
  })

  const directOrgs = memberships.map((m) => ({
    org: m.organization,
    accessType: 'direct' as const,
  }))

  // Get descendants of direct memberships (where user is OWNER/ADMIN)
  const adminMemberships = memberships.filter(
    (m) => m.role === 'OWNER' || m.role === 'ADMIN'
  )

  const inheritedOrgs: Array<{ org: Organization; accessType: 'inherited' }> = []
  for (const membership of adminMemberships) {
    const descendants = await getDescendants(membership.organization.id)
    for (const desc of descendants) {
      if (!directOrgs.some((d) => d.org.id === desc.id)) {
        inheritedOrgs.push({ org: desc, accessType: 'inherited' })
      }
    }
  }

  // Get orgs through relationships
  const directOrgIds = memberships.map((m) => m.organization.id)
  const relationships = await prisma.orgRelationship.findMany({
    where: {
      fromOrgId: { in: directOrgIds },
      status: 'ACTIVE',
    },
    include: { toOrg: true },
  })

  const relationshipOrgs = relationships
    .filter(
      (r) =>
        !directOrgs.some((d) => d.org.id === r.toOrgId) &&
        !inheritedOrgs.some((i) => i.org.id === r.toOrgId)
    )
    .map((r) => ({ org: r.toOrg, accessType: 'relationship' as const }))

  return [...directOrgs, ...inheritedOrgs, ...relationshipOrgs]
}
