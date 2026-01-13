import type {
  User,
  Organization,
  OrganizationMember,
  Agent,
  AgentRun,
  Insight,
  DataSource,
  AuditLog,
  ApiKey,
  Invitation,
  BillingSubscription,
  Role,
  PlanTier,
  AgentType,
  AgentStatus,
  AgentRunStatus,
  DataSourceType,
  DataSourceStatus,
  UsageMetric,
  SubscriptionStatus,
  InvitationStatus,
  // Hierarchy types
  OrganizationType,
  CompanySize,
  OrgRelationshipType,
  RelationshipStatus,
  BillingRelationship,
  ResourceSharingScope,
  SharedResourceType,
  HierarchyAction,
  CrossOrgInviteStatus,
  OrgRelationship,
  SharedResourceAccess,
  RoleInheritanceRule,
  HierarchyAuditLog,
  HierarchyTemplate,
  CrossOrgInvitation,
} from '@prisma/client'

// Re-export Prisma types
export type {
  User,
  Organization,
  OrganizationMember,
  Agent,
  AgentRun,
  Insight,
  DataSource,
  AuditLog,
  ApiKey,
  Invitation,
  BillingSubscription,
  Role,
  PlanTier,
  AgentType,
  AgentStatus,
  AgentRunStatus,
  DataSourceType,
  DataSourceStatus,
  UsageMetric,
  SubscriptionStatus,
  InvitationStatus,
  // Hierarchy types
  OrganizationType,
  CompanySize,
  OrgRelationshipType,
  RelationshipStatus,
  BillingRelationship,
  ResourceSharingScope,
  SharedResourceType,
  HierarchyAction,
  CrossOrgInviteStatus,
  OrgRelationship,
  SharedResourceAccess,
  RoleInheritanceRule,
  HierarchyAuditLog,
  HierarchyTemplate,
  CrossOrgInvitation,
}

// Extended types with relations
export type UserWithMemberships = User & {
  memberships: (OrganizationMember & {
    organization: Organization
  })[]
}

export type OrganizationWithMembers = Organization & {
  members: (OrganizationMember & {
    user: Pick<User, 'id' | 'name' | 'email' | 'avatarUrl'>
  })[]
  subscription: BillingSubscription | null
  _count: {
    members: number
    agents: number
    dataSources: number
  }
}

export type AgentWithDetails = Agent & {
  creator: Pick<User, 'id' | 'name' | 'email'>
  runs?: AgentRun[]
  _count: {
    runs: number
  }
}

export type AgentRunWithInsights = AgentRun & {
  agent: Agent
  insights: Insight[]
}

export type AuditLogWithUser = AuditLog & {
  user: Pick<User, 'id' | 'name' | 'email'> | null
}

// Session types
export interface SessionUser {
  id: string
  email: string
  name: string | null
  image?: string | null
}

export interface OrganizationContext {
  id: string
  name: string
  slug: string
  planTier: PlanTier
  role: Role
}

// API Response types
export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Form types
export interface CreateAgentInput {
  name: string
  description?: string
  type: AgentType
  configuration?: Record<string, unknown>
}

export interface UpdateAgentInput {
  name?: string
  description?: string
  status?: AgentStatus
  configuration?: Record<string, unknown>
}

export interface RunAgentInput {
  input: Record<string, unknown>
}

export interface InviteMemberInput {
  email: string
  role: Role
}

export interface CreateOrganizationInput {
  name: string
}

// Usage & Billing types
export interface UsageSummary {
  agentRuns: number
  tokensConsumed: number
  apiCalls: number
  dataSources: number
  teamSeats: number
  storageGb: number
}

export interface PlanLimits {
  agentRuns: number
  teamSeats: number
  dataSources: number
  apiCallsPerMin: number
  retentionDays: number
  tokensPerMonth: number
}

// Audit types
export interface AuditFilter {
  action?: string
  resourceType?: string
  userId?: string
  startDate?: Date
  endDate?: Date
}

// Notification types
export interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message?: string
  timestamp: Date
  read: boolean
}

// Search types
export interface SearchResult {
  type: 'agent' | 'insight' | 'report' | 'workflow'
  id: string
  title: string
  description?: string
  url: string
}

// ==================== HIERARCHY TYPES ====================

// Organization with hierarchy information
export type OrganizationWithHierarchy = Organization & {
  parentOrg?: Organization | null
  childOrgs?: Organization[]
  rootOrg?: Organization | null
  ancestorPath?: Organization[]
  descendantCount?: number
  memberCount?: number
}

// Hierarchy tree node for tree visualization
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
  metadata?: Record<string, unknown>
}

// Effective permissions for a user in an organization
export interface EffectivePermissions {
  orgId: string
  directRole: Role | null
  inheritedRole: Role | null
  effectiveRole: Role | null
  accessSource: 'direct' | 'inherited' | 'relationship' | 'none'
  permissions: string[]
  sharedResources: SharedResourceType[]
}

// Hierarchy statistics
export interface HierarchyStats {
  totalOrgs: number
  totalRelationships: number
  maxDepth: number
  orgsByType: Partial<Record<OrganizationType, number>>
  orgsByLevel: Record<number, number>
}

// Input types for hierarchy operations
export interface CreateChildOrgInput {
  name: string
  slug?: string
  orgType: OrganizationType
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
  toOrgId: string
  relationshipType: OrgRelationshipType
  accessLevel?: ResourceSharingScope
  billingRelation?: BillingRelationship
  billingConfig?: Record<string, unknown>
  permissions?: Record<string, unknown>
  contractStart?: string | Date
  contractEnd?: string | Date
  notes?: string
}

export interface ShareResourceInput {
  targetOrgId: string
  resourceType: SharedResourceType
  resourceId?: string
  accessLevel: ResourceSharingScope
  canView?: boolean
  canEdit?: boolean
  canDelete?: boolean
  canShare?: boolean
  propagateToChildren?: boolean
  expiresAt?: string | Date
}

export interface MoveOrgInput {
  orgId: string
  newParentOrgId: string | null
}

// Relationship with org details
export interface RelationshipWithOrg {
  relationship: OrgRelationship
  org: Organization
}

// Accessible organization with access type
export interface AccessibleOrganization {
  org: Organization
  accessType: 'direct' | 'inherited' | 'relationship'
}

// Shared resource with owner details
export interface SharedResourceWithOwner {
  ownerOrg: Organization
  resourceType: SharedResourceType
  resourceId: string | null
  accessLevel: ResourceSharingScope
  canView: boolean
  canEdit: boolean
  canDelete: boolean
  canShare: boolean
}

// Organization context extended with hierarchy
export interface OrganizationContextWithHierarchy extends OrganizationContext {
  orgType: OrganizationType
  parentOrgId: string | null
  rootOrgId: string | null
  hierarchyLevel: number
  allowChildOrgs: boolean
  effectivePermissions?: EffectivePermissions
}

// Hierarchy template structure
export interface HierarchyTemplateStructure {
  name: string
  orgType: OrganizationType
  settings?: Record<string, unknown>
  children?: HierarchyTemplateStructure[]
}

// Cross-org invitation with org details
export interface CrossOrgInvitationWithDetails extends CrossOrgInvitation {
  fromOrg?: Pick<Organization, 'id' | 'name' | 'slug' | 'orgType'>
  toOrg?: Pick<Organization, 'id' | 'name' | 'slug' | 'orgType'> | null
}

// Billing consolidation summary
export interface BillingConsolidationSummary {
  totalOrgs: number
  totalUsage: Record<string, number>
  byOrg: Array<{
    org: Pick<Organization, 'id' | 'name' | 'planTier'>
    usage: Record<string, number>
    billingRelation: BillingRelationship
  }>
}

// Role inheritance configuration
export interface RoleInheritanceConfig {
  sourceRole: Role
  targetRole: Role
  inheritUp: boolean
  inheritDown: boolean
  inheritLevels: number
  sourceOrgType?: OrganizationType
  requiresApproval: boolean
}

// Organization type metadata
export interface OrgTypeMetadata {
  type: OrganizationType
  label: string
  description: string
  canHaveChildren: boolean
  recommendedChildTypes: OrganizationType[]
  recommendedRelationships: OrgRelationshipType[]
  defaultSettings?: Record<string, unknown>
}

// Predefined organization type metadata
export const ORG_TYPE_METADATA: Record<OrganizationType, OrgTypeMetadata> = {
  STANDARD: {
    type: 'STANDARD',
    label: 'Standard Organization',
    description: 'A standard organization without specific hierarchy features',
    canHaveChildren: false,
    recommendedChildTypes: [],
    recommendedRelationships: ['PARTNERSHIP', 'DATA_SHARING'],
  },
  AGENCY: {
    type: 'AGENCY',
    label: 'Agency',
    description: 'Marketing or advertising agency managing multiple clients',
    canHaveChildren: true,
    recommendedChildTypes: ['CLIENT', 'BRAND'],
    recommendedRelationships: ['MANAGEMENT', 'WHITE_LABEL'],
  },
  HOLDING_COMPANY: {
    type: 'HOLDING_COMPANY',
    label: 'Holding Company',
    description: 'Parent company owning multiple subsidiaries',
    canHaveChildren: true,
    recommendedChildTypes: ['SUBSIDIARY', 'PORTFOLIO_COMPANY', 'BRAND'],
    recommendedRelationships: ['OWNERSHIP'],
  },
  SUBSIDIARY: {
    type: 'SUBSIDIARY',
    label: 'Subsidiary',
    description: 'Company owned by a holding company',
    canHaveChildren: true,
    recommendedChildTypes: ['DIVISION', 'DEPARTMENT'],
    recommendedRelationships: ['PARTNERSHIP'],
  },
  BRAND: {
    type: 'BRAND',
    label: 'Brand',
    description: 'Individual brand entity',
    canHaveChildren: true,
    recommendedChildTypes: ['SUB_BRAND', 'REGIONAL'],
    recommendedRelationships: ['PARTNERSHIP', 'LICENSING'],
  },
  SUB_BRAND: {
    type: 'SUB_BRAND',
    label: 'Sub-Brand',
    description: 'Sub-brand under a parent brand',
    canHaveChildren: false,
    recommendedChildTypes: [],
    recommendedRelationships: ['DATA_SHARING'],
  },
  DIVISION: {
    type: 'DIVISION',
    label: 'Division',
    description: 'Business division within an enterprise',
    canHaveChildren: true,
    recommendedChildTypes: ['DEPARTMENT'],
    recommendedRelationships: ['DATA_SHARING'],
  },
  DEPARTMENT: {
    type: 'DEPARTMENT',
    label: 'Department',
    description: 'Department within a division or organization',
    canHaveChildren: false,
    recommendedChildTypes: [],
    recommendedRelationships: ['DATA_SHARING'],
  },
  FRANCHISE: {
    type: 'FRANCHISE',
    label: 'Franchise',
    description: 'Franchise organization (franchisor)',
    canHaveChildren: true,
    recommendedChildTypes: ['FRANCHISEE'],
    recommendedRelationships: ['LICENSING'],
  },
  FRANCHISEE: {
    type: 'FRANCHISEE',
    label: 'Franchisee',
    description: 'Individual franchise location',
    canHaveChildren: false,
    recommendedChildTypes: [],
    recommendedRelationships: ['DATA_SHARING'],
  },
  RESELLER: {
    type: 'RESELLER',
    label: 'Reseller',
    description: 'Partner that resells to clients',
    canHaveChildren: true,
    recommendedChildTypes: ['CLIENT'],
    recommendedRelationships: ['RESELLER', 'WHITE_LABEL'],
  },
  CLIENT: {
    type: 'CLIENT',
    label: 'Client',
    description: 'Client organization managed by agency or reseller',
    canHaveChildren: false,
    recommendedChildTypes: [],
    recommendedRelationships: ['DATA_SHARING'],
  },
  REGIONAL: {
    type: 'REGIONAL',
    label: 'Regional Entity',
    description: 'Regional entity (e.g., EMEA, APAC)',
    canHaveChildren: true,
    recommendedChildTypes: ['STANDARD', 'BRAND'],
    recommendedRelationships: ['DATA_SHARING'],
  },
  PORTFOLIO_COMPANY: {
    type: 'PORTFOLIO_COMPANY',
    label: 'Portfolio Company',
    description: 'Company within a PE/VC portfolio',
    canHaveChildren: true,
    recommendedChildTypes: ['DIVISION', 'DEPARTMENT'],
    recommendedRelationships: ['PARTNERSHIP', 'DATA_SHARING'],
  },
}
