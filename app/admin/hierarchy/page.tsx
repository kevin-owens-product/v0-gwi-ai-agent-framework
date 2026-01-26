"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Building2,
  ChevronRight,
  ChevronDown,
  Plus,
  MoreHorizontal,
  Users,
  Network,
  ArrowRight,
  Loader2,
  RefreshCw,
  GitBranch,
  Link2,
  Settings,
  Eye,
  Move,
} from "lucide-react"
import Link from "next/link"

interface HierarchyNode {
  id: string
  name: string
  slug: string
  orgType: string
  planTier: string
  hierarchyLevel: number
  allowChildOrgs: boolean
  _count: {
    members: number
    childOrgs: number
  }
  childOrgs?: HierarchyNode[]
}

interface Relationship {
  id: string
  fromOrgId: string
  toOrgId: string
  relationshipType: string
  status: string
  accessLevel: string
  billingRelation: string
  fromOrg: {
    id: string
    name: string
    slug: string
    orgType: string
  }
  toOrg: {
    id: string
    name: string
    slug: string
    orgType: string
  }
  createdAt: string
}

interface Stats {
  totalOrgs: number
  totalWithChildren: number
  totalWithParent: number
  maxDepth: number
  orgsByType: Record<string, number>
}

const ORG_TYPE_LABELS: Record<string, string> = {
  STANDARD: "Standard",
  AGENCY: "Agency",
  HOLDING_COMPANY: "Holding Company",
  SUBSIDIARY: "Subsidiary",
  BRAND: "Brand",
  SUB_BRAND: "Sub-Brand",
  DIVISION: "Division",
  DEPARTMENT: "Department",
  FRANCHISE: "Franchise",
  FRANCHISEE: "Franchisee",
  RESELLER: "Reseller",
  CLIENT: "Client",
  REGIONAL: "Regional",
  PORTFOLIO_COMPANY: "Portfolio Company",
}

const RELATIONSHIP_TYPE_LABELS: Record<string, string> = {
  OWNERSHIP: "Ownership",
  MANAGEMENT: "Management",
  PARTNERSHIP: "Partnership",
  LICENSING: "Licensing",
  RESELLER: "Reseller",
  WHITE_LABEL: "White Label",
  DATA_SHARING: "Data Sharing",
  CONSORTIUM: "Consortium",
}

function OrgTreeNode({
  node,
  level = 0,
  onAddChild,
  onViewDetails,
  onMove,
}: {
  node: HierarchyNode
  level?: number
  onAddChild: (orgId: string, orgName: string) => void
  onViewDetails: (orgId: string) => void
  onMove: (orgId: string, orgName: string) => void
}) {
  const [expanded, setExpanded] = useState(level < 2)
  const hasChildren = node._count.childOrgs > 0 || (node.childOrgs && node.childOrgs.length > 0)

  return (
    <div className="select-none">
      <div
        className={`flex items-center gap-2 py-2 px-3 rounded-md hover:bg-muted/50 group ${
          level > 0 ? "ml-6" : ""
        }`}
        style={{ marginLeft: level > 0 ? `${level * 24}px` : 0 }}
      >
        <button
          onClick={() => setExpanded(!expanded)}
          className="p-0.5 hover:bg-muted rounded"
          disabled={!hasChildren}
        >
          {hasChildren ? (
            expanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )
          ) : (
            <div className="w-4" />
          )}
        </button>

        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Building2 className="h-4 w-4 text-primary" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium truncate">{node.name}</span>
            <Badge variant="outline" className="text-xs">
              {ORG_TYPE_LABELS[node.orgType] || node.orgType}
            </Badge>
            <Badge
              variant={
                node.planTier === "ENTERPRISE"
                  ? "default"
                  : node.planTier === "PROFESSIONAL"
                  ? "secondary"
                  : "outline"
              }
              className="text-xs"
            >
              {node.planTier}
            </Badge>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {node._count.members} members
            </span>
            {node._count.childOrgs > 0 && (
              <span className="flex items-center gap-1">
                <GitBranch className="h-3 w-3" />
                {node._count.childOrgs} children
              </span>
            )}
          </div>
        </div>

        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onViewDetails(node.id)}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/admin/tenants/${node.id}`}>
                  <Settings className="h-4 w-4 mr-2" />
                  Manage Tenant
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {node.allowChildOrgs && (
                <DropdownMenuItem onClick={() => onAddChild(node.id, node.name)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Child Organization
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => onMove(node.id, node.name)}>
                <Move className="h-4 w-4 mr-2" />
                Move Organization
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {expanded && node.childOrgs && node.childOrgs.length > 0 && (
        <div className="border-l border-muted ml-4">
          {node.childOrgs.map((child) => (
            <OrgTreeNode
              key={child.id}
              node={child}
              level={level + 1}
              onAddChild={onAddChild}
              onViewDetails={onViewDetails}
              onMove={onMove}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function HierarchyPage() {
  const [organizations, setOrganizations] = useState<HierarchyNode[]>([])
  const [relationships, setRelationships] = useState<Relationship[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("tree")

  // Add child dialog
  const [addChildDialogOpen, setAddChildDialogOpen] = useState(false)
  const [parentOrg, setParentOrg] = useState<{ id: string; name: string } | null>(null)
  const [newChild, setNewChild] = useState({
    name: "",
    orgType: "STANDARD",
    planTier: "STARTER",
    inheritSettings: true,
  })

  // Add relationship dialog
  const [addRelDialogOpen, setAddRelDialogOpen] = useState(false)
  const [newRelationship, setNewRelationship] = useState({
    fromOrgId: "",
    toOrgId: "",
    relationshipType: "PARTNERSHIP",
    accessLevel: "READ_ONLY",
  })

  // Move org dialog
  const [moveDialogOpen, setMoveDialogOpen] = useState(false)
  const [moveOrg, setMoveOrg] = useState<{ id: string; name: string } | null>(null)
  const [newParentId, setNewParentId] = useState("")

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [allOrgs, setAllOrgs] = useState<Array<{ id: string; name: string; slug: string }>>([])

  const fetchHierarchy = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/admin/hierarchy", {
        credentials: "include",
      })

      if (!response.ok) {
        if (response.status === 401) {
          console.error("Unauthorized - redirecting to login")
          window.location.href = "/login?type=admin"
          return
        }
        throw new Error(`HTTP error: ${response.status}`)
      }

      const data = await response.json()
      setOrganizations(data.organizations || [])
      setStats(data.stats || null)
    } catch (error) {
      console.error("Failed to fetch hierarchy:", error)
      setOrganizations([])
      setStats(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const fetchRelationships = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/hierarchy/relationships", {
        credentials: "include",
      })

      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = "/login?type=admin"
          return
        }
        throw new Error(`HTTP error: ${response.status}`)
      }

      const data = await response.json()
      setRelationships(data.relationships || [])
    } catch (error) {
      console.error("Failed to fetch relationships:", error)
      setRelationships([])
    }
  }, [])

  const fetchAllOrgs = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/tenants?limit=200", {
        credentials: "include",
      })

      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = "/login?type=admin"
          return
        }
        throw new Error(`HTTP error: ${response.status}`)
      }

      const data = await response.json()
      setAllOrgs(
        (data.tenants || []).map((t: { id: string; name: string; slug: string }) => ({
          id: t.id,
          name: t.name,
          slug: t.slug,
        }))
      )
    } catch (error) {
      console.error("Failed to fetch all orgs:", error)
      setAllOrgs([])
    }
  }, [])

  useEffect(() => {
    fetchHierarchy()
    fetchRelationships()
    fetchAllOrgs()
  }, [fetchHierarchy, fetchRelationships, fetchAllOrgs])

  const handleAddChild = async () => {
    if (!parentOrg || !newChild.name) return
    setIsSubmitting(true)
    try {
      const response = await fetch("/api/admin/hierarchy", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newChild,
          parentOrgId: parentOrg.id,
        }),
      })

      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = "/login?type=admin"
          return
        }
        const data = await response.json()
        throw new Error(data.error || "Failed to create child organization")
      }

      setAddChildDialogOpen(false)
      setNewChild({
        name: "",
        orgType: "STANDARD",
        planTier: "STARTER",
        inheritSettings: true,
      })
      setParentOrg(null)
      fetchHierarchy()
      fetchAllOrgs()
    } catch (error) {
      console.error("Failed to create child:", error)
      alert(error instanceof Error ? error.message : "Failed to create child organization")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAddRelationship = async () => {
    if (!newRelationship.fromOrgId || !newRelationship.toOrgId) return
    setIsSubmitting(true)
    try {
      const response = await fetch("/api/admin/hierarchy/relationships", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRelationship),
      })

      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = "/login?type=admin"
          return
        }
        const data = await response.json()
        throw new Error(data.error || "Failed to create relationship")
      }

      setAddRelDialogOpen(false)
      setNewRelationship({
        fromOrgId: "",
        toOrgId: "",
        relationshipType: "PARTNERSHIP",
        accessLevel: "READ_ONLY",
      })
      fetchRelationships()
    } catch (error) {
      console.error("Failed to create relationship:", error)
      alert(error instanceof Error ? error.message : "Failed to create relationship")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleMoveOrg = async () => {
    if (!moveOrg) return
    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/admin/hierarchy/${moveOrg.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newParentOrgId: newParentId && newParentId !== "root" ? newParentId : null,
        }),
      })

      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = "/login?type=admin"
          return
        }
        const data = await response.json()
        throw new Error(data.error || "Failed to move organization")
      }

      setMoveDialogOpen(false)
      setMoveOrg(null)
      setNewParentId("")
      fetchHierarchy()
    } catch (error) {
      console.error("Failed to move org:", error)
      alert(error instanceof Error ? error.message : "Failed to move organization")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateRelationshipStatus = async (id: string, status: string) => {
    try {
      const response = await fetch("/api/admin/hierarchy/relationships", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ relationshipId: id, status }),
      })
      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = "/login?type=admin"
          return
        }
        const data = await response.json()
        throw new Error(data.error || "Failed to update relationship")
      }
      fetchRelationships()
    } catch (error) {
      console.error("Failed to update relationship:", error)
      alert(error instanceof Error ? error.message : "Failed to update relationship")
    }
  }

  const openAddChildDialog = (orgId: string, orgName: string) => {
    setParentOrg({ id: orgId, name: orgName })
    setAddChildDialogOpen(true)
  }

  const openMoveDialog = (orgId: string, orgName: string) => {
    setMoveOrg({ id: orgId, name: orgName })
    setMoveDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Organizations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalOrgs || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              With Children
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalWithChildren || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Child Organizations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalWithParent || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Max Depth
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.maxDepth || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Network className="h-5 w-5" />
                Organization Hierarchy
              </CardTitle>
              <CardDescription>
                View and manage the multi-level organization structure
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => { fetchHierarchy(); fetchRelationships(); }} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button onClick={() => setAddRelDialogOpen(true)} variant="outline" size="sm">
                <Link2 className="h-4 w-4 mr-2" />
                Add Relationship
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="tree">Hierarchy Tree</TabsTrigger>
              <TabsTrigger value="relationships">
                Cross-Org Relationships ({relationships.length})
              </TabsTrigger>
              <TabsTrigger value="types">By Type</TabsTrigger>
            </TabsList>

            <TabsContent value="tree" className="mt-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : organizations.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Network className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No organizations found</p>
                  <p className="text-sm mt-2">Create your first organization from the Tenants page</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {organizations.map((org) => (
                    <OrgTreeNode
                      key={org.id}
                      node={org}
                      onAddChild={openAddChildDialog}
                      onViewDetails={(id) => window.open(`/admin/tenants/${id}`, "_blank")}
                      onMove={openMoveDialog}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="relationships" className="mt-4">
              {relationships.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Link2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No cross-organization relationships</p>
                  <p className="text-sm mt-2">Create relationships to connect organizations</p>
                  <Button
                    onClick={() => setAddRelDialogOpen(true)}
                    variant="outline"
                    className="mt-4"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Relationship
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {relationships.map((rel) => (
                    <div
                      key={rel.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <div className="font-medium">{rel.fromOrg.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {ORG_TYPE_LABELS[rel.fromOrg.orgType]}
                          </div>
                        </div>
                        <div className="flex flex-col items-center">
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                          <Badge variant="secondary" className="text-xs mt-1">
                            {RELATIONSHIP_TYPE_LABELS[rel.relationshipType]}
                          </Badge>
                        </div>
                        <div className="text-center">
                          <div className="font-medium">{rel.toOrg.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {ORG_TYPE_LABELS[rel.toOrg.orgType]}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            rel.status === "ACTIVE"
                              ? "default"
                              : rel.status === "PENDING"
                              ? "secondary"
                              : "destructive"
                          }
                        >
                          {rel.status}
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {rel.status === "PENDING" && (
                              <DropdownMenuItem
                                onClick={() => handleUpdateRelationshipStatus(rel.id, "ACTIVE")}
                              >
                                Approve
                              </DropdownMenuItem>
                            )}
                            {rel.status === "ACTIVE" && (
                              <DropdownMenuItem
                                onClick={() => handleUpdateRelationshipStatus(rel.id, "SUSPENDED")}
                              >
                                Suspend
                              </DropdownMenuItem>
                            )}
                            {rel.status === "SUSPENDED" && (
                              <DropdownMenuItem
                                onClick={() => handleUpdateRelationshipStatus(rel.id, "ACTIVE")}
                              >
                                Reactivate
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleUpdateRelationshipStatus(rel.id, "TERMINATED")}
                            >
                              Terminate
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="types" className="mt-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats?.orgsByType &&
                  Object.entries(stats.orgsByType).map(([type, count]) => (
                    <Card key={type}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">
                          {ORG_TYPE_LABELS[type] || type}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{count}</div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Add Child Dialog */}
      <Dialog open={addChildDialogOpen} onOpenChange={setAddChildDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Child Organization</DialogTitle>
            <DialogDescription>
              Create a new organization under {parentOrg?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="childName">Organization Name *</Label>
              <Input
                id="childName"
                placeholder="Child Organization"
                value={newChild.name}
                onChange={(e) => setNewChild({ ...newChild, name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Organization Type</Label>
                <Select
                  value={newChild.orgType}
                  onValueChange={(value) => setNewChild({ ...newChild, orgType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(ORG_TYPE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Plan Tier</Label>
                <Select
                  value={newChild.planTier}
                  onValueChange={(value) => setNewChild({ ...newChild, planTier: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="STARTER">Starter</SelectItem>
                    <SelectItem value="PROFESSIONAL">Professional</SelectItem>
                    <SelectItem value="ENTERPRISE">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="inheritSettings"
                checked={newChild.inheritSettings}
                onChange={(e) =>
                  setNewChild({ ...newChild, inheritSettings: e.target.checked })
                }
                className="rounded border-gray-300"
              />
              <Label htmlFor="inheritSettings" className="text-sm">
                Inherit settings from parent
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddChildDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddChild} disabled={!newChild.name || isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Child"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Relationship Dialog */}
      <Dialog open={addRelDialogOpen} onOpenChange={setAddRelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Cross-Organization Relationship</DialogTitle>
            <DialogDescription>
              Define a relationship between two organizations
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>From Organization</Label>
              <Select
                value={newRelationship.fromOrgId}
                onValueChange={(value) =>
                  setNewRelationship({ ...newRelationship, fromOrgId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select organization" />
                </SelectTrigger>
                <SelectContent>
                  {allOrgs.map((org) => (
                    <SelectItem key={org.id} value={org.id}>
                      {org.name} ({org.slug})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>To Organization</Label>
              <Select
                value={newRelationship.toOrgId}
                onValueChange={(value) =>
                  setNewRelationship({ ...newRelationship, toOrgId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select organization" />
                </SelectTrigger>
                <SelectContent>
                  {allOrgs
                    .filter((o) => o.id !== newRelationship.fromOrgId)
                    .map((org) => (
                      <SelectItem key={org.id} value={org.id}>
                        {org.name} ({org.slug})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Relationship Type</Label>
                <Select
                  value={newRelationship.relationshipType}
                  onValueChange={(value) =>
                    setNewRelationship({ ...newRelationship, relationshipType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(RELATIONSHIP_TYPE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Access Level</Label>
                <Select
                  value={newRelationship.accessLevel}
                  onValueChange={(value) =>
                    setNewRelationship({ ...newRelationship, accessLevel: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NONE">None</SelectItem>
                    <SelectItem value="READ_ONLY">Read Only</SelectItem>
                    <SelectItem value="FULL_ACCESS">Full Access</SelectItem>
                    <SelectItem value="INHERIT">Inherit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddRelDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddRelationship}
              disabled={
                !newRelationship.fromOrgId || !newRelationship.toOrgId || isSubmitting
              }
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Relationship"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Move Organization Dialog */}
      <Dialog open={moveDialogOpen} onOpenChange={setMoveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Move Organization</DialogTitle>
            <DialogDescription>
              Move {moveOrg?.name} to a new parent organization or make it a root organization
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>New Parent Organization</Label>
              <Select value={newParentId} onValueChange={setNewParentId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select new parent (or leave empty for root)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="root">Make Root Organization</SelectItem>
                  {allOrgs
                    .filter((o) => o.id !== moveOrg?.id)
                    .map((org) => (
                      <SelectItem key={org.id} value={org.id}>
                        {org.name} ({org.slug})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMoveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleMoveOrg} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Moving...
                </>
              ) : (
                "Move Organization"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
