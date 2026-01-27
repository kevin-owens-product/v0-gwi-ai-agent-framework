"use client"

import { useState, useEffect, useCallback } from "react"
import { useTranslations } from "next-intl"
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
import { toast } from "sonner"

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

// These labels are used for display and will be translated via component
const ORG_TYPE_KEYS: Record<string, string> = {
  STANDARD: "standard",
  AGENCY: "agency",
  HOLDING_COMPANY: "holdingCompany",
  SUBSIDIARY: "subsidiary",
  BRAND: "brand",
  SUB_BRAND: "subBrand",
  DIVISION: "division",
  DEPARTMENT: "department",
  FRANCHISE: "franchise",
  FRANCHISEE: "franchisee",
  RESELLER: "reseller",
  CLIENT: "client",
  REGIONAL: "regional",
  PORTFOLIO_COMPANY: "portfolioCompany",
}

const RELATIONSHIP_TYPE_KEYS: Record<string, string> = {
  OWNERSHIP: "ownership",
  MANAGEMENT: "management",
  PARTNERSHIP: "partnership",
  LICENSING: "licensing",
  RESELLER: "reseller",
  WHITE_LABEL: "whiteLabel",
  DATA_SHARING: "dataSharing",
  CONSORTIUM: "consortium",
}

function OrgTreeNode({
  node,
  level = 0,
  onAddChild,
  onViewDetails,
  onMove,
  t,
}: {
  node: HierarchyNode
  level?: number
  onAddChild: (orgId: string, orgName: string) => void
  onViewDetails: (orgId: string) => void
  onMove: (orgId: string, orgName: string) => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: (key: string, values?: Record<string, unknown>) => any
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
              {t(`orgTypes.${ORG_TYPE_KEYS[node.orgType]}`) || node.orgType}
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
              {t("membersCount", { count: node._count.members })}
            </span>
            {node._count.childOrgs > 0 && (
              <span className="flex items-center gap-1">
                <GitBranch className="h-3 w-3" />
                {t("childrenCount", { count: node._count.childOrgs })}
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
                {t("viewDetails")}
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/admin/tenants/${node.id}`}>
                  <Settings className="h-4 w-4 mr-2" />
                  {t("manageTenant")}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {node.allowChildOrgs && (
                <DropdownMenuItem onClick={() => onAddChild(node.id, node.name)}>
                  <Plus className="h-4 w-4 mr-2" />
                  {t("addChildOrganization")}
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => onMove(node.id, node.name)}>
                <Move className="h-4 w-4 mr-2" />
                {t("moveOrganization")}
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
              t={t}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function HierarchyPage() {
  const t = useTranslations("admin.hierarchy")
  const tCommon = useTranslations("common")
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
      toast.error(error instanceof Error ? error.message : "Failed to create child organization")
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
      toast.error(error instanceof Error ? error.message : "Failed to create relationship")
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
      toast.error(error instanceof Error ? error.message : "Failed to move organization")
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
      toast.error(error instanceof Error ? error.message : "Failed to update relationship")
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
              {t("stats.totalOrganizations")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalOrgs || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("stats.withChildren")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalWithChildren || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("stats.childOrganizations")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalWithParent || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("stats.maxDepth")}
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
                {t("title")}
              </CardTitle>
              <CardDescription>
                {t("description")}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => { fetchHierarchy(); fetchRelationships(); }} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                {tCommon("refresh")}
              </Button>
              <Button onClick={() => setAddRelDialogOpen(true)} variant="outline" size="sm">
                <Link2 className="h-4 w-4 mr-2" />
                {t("addRelationship")}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="tree">{t("tabs.hierarchyTree")}</TabsTrigger>
              <TabsTrigger value="relationships">
                {t("tabs.crossOrgRelationships")} ({relationships.length})
              </TabsTrigger>
              <TabsTrigger value="types">{t("tabs.byType")}</TabsTrigger>
            </TabsList>

            <TabsContent value="tree" className="mt-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : organizations.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Network className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>{t("noOrganizationsFound")}</p>
                  <p className="text-sm mt-2">{t("createFirstOrganization")}</p>
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
                      t={t as (key: string, values?: Record<string, unknown>) => string}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="relationships" className="mt-4">
              {relationships.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Link2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>{t("noRelationships")}</p>
                  <p className="text-sm mt-2">{t("createRelationshipsHint")}</p>
                  <Button
                    onClick={() => setAddRelDialogOpen(true)}
                    variant="outline"
                    className="mt-4"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {t("addRelationship")}
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
                            {t(`orgTypes.${ORG_TYPE_KEYS[rel.fromOrg.orgType]}`)}
                          </div>
                        </div>
                        <div className="flex flex-col items-center">
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                          <Badge variant="secondary" className="text-xs mt-1">
                            {t(`relationshipTypes.${RELATIONSHIP_TYPE_KEYS[rel.relationshipType]}`)}
                          </Badge>
                        </div>
                        <div className="text-center">
                          <div className="font-medium">{rel.toOrg.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {t(`orgTypes.${ORG_TYPE_KEYS[rel.toOrg.orgType]}`)}
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
                          {t(`statuses.${rel.status.toLowerCase()}`)}
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
                                {t("actions.approve")}
                              </DropdownMenuItem>
                            )}
                            {rel.status === "ACTIVE" && (
                              <DropdownMenuItem
                                onClick={() => handleUpdateRelationshipStatus(rel.id, "SUSPENDED")}
                              >
                                {t("actions.suspend")}
                              </DropdownMenuItem>
                            )}
                            {rel.status === "SUSPENDED" && (
                              <DropdownMenuItem
                                onClick={() => handleUpdateRelationshipStatus(rel.id, "ACTIVE")}
                              >
                                {t("actions.reactivate")}
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleUpdateRelationshipStatus(rel.id, "TERMINATED")}
                            >
                              {t("actions.terminate")}
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
                          {t(`orgTypes.${ORG_TYPE_KEYS[type]}`) || type}
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
            <DialogTitle>{t("dialogs.addChild.title")}</DialogTitle>
            <DialogDescription>
              {t("dialogs.addChild.description", { name: parentOrg?.name ?? "" })}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="childName">{t("dialogs.addChild.organizationName")} *</Label>
              <Input
                id="childName"
                placeholder={t("dialogs.addChild.placeholder")}
                value={newChild.name}
                onChange={(e) => setNewChild({ ...newChild, name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("dialogs.addChild.organizationType")}</Label>
                <Select
                  value={newChild.orgType}
                  onValueChange={(value) => setNewChild({ ...newChild, orgType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(ORG_TYPE_KEYS).map(([value, key]) => (
                      <SelectItem key={value} value={value}>
                        {t(`orgTypes.${key}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("dialogs.addChild.planTier")}</Label>
                <Select
                  value={newChild.planTier}
                  onValueChange={(value) => setNewChild({ ...newChild, planTier: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="STARTER">{t("planTiers.starter")}</SelectItem>
                    <SelectItem value="PROFESSIONAL">{t("planTiers.professional")}</SelectItem>
                    <SelectItem value="ENTERPRISE">{t("planTiers.enterprise")}</SelectItem>
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
                {t("dialogs.addChild.inheritSettings")}
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddChildDialogOpen(false)}>
              {tCommon("cancel")}
            </Button>
            <Button onClick={handleAddChild} disabled={!newChild.name || isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {tCommon("creating")}
                </>
              ) : (
                t("dialogs.addChild.createChild")
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Relationship Dialog */}
      <Dialog open={addRelDialogOpen} onOpenChange={setAddRelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("dialogs.addRelationship.title")}</DialogTitle>
            <DialogDescription>
              {t("dialogs.addRelationship.description")}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>{t("dialogs.addRelationship.fromOrganization")}</Label>
              <Select
                value={newRelationship.fromOrgId}
                onValueChange={(value) =>
                  setNewRelationship({ ...newRelationship, fromOrgId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("dialogs.addRelationship.selectOrganization")} />
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
              <Label>{t("dialogs.addRelationship.toOrganization")}</Label>
              <Select
                value={newRelationship.toOrgId}
                onValueChange={(value) =>
                  setNewRelationship({ ...newRelationship, toOrgId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("dialogs.addRelationship.selectOrganization")} />
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
                <Label>{t("dialogs.addRelationship.relationshipType")}</Label>
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
                    {Object.entries(RELATIONSHIP_TYPE_KEYS).map(([value, key]) => (
                      <SelectItem key={value} value={value}>
                        {t(`relationshipTypes.${key}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("dialogs.addRelationship.accessLevel")}</Label>
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
                    <SelectItem value="NONE">{t("accessLevels.none")}</SelectItem>
                    <SelectItem value="READ_ONLY">{t("accessLevels.readOnly")}</SelectItem>
                    <SelectItem value="FULL_ACCESS">{t("accessLevels.fullAccess")}</SelectItem>
                    <SelectItem value="INHERIT">{t("accessLevels.inherit")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddRelDialogOpen(false)}>
              {tCommon("cancel")}
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
                  {tCommon("creating")}
                </>
              ) : (
                t("dialogs.addRelationship.createRelationship")
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Move Organization Dialog */}
      <Dialog open={moveDialogOpen} onOpenChange={setMoveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("dialogs.move.title")}</DialogTitle>
            <DialogDescription>
              {t("dialogs.move.description", { name: moveOrg?.name ?? "" })}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>{t("dialogs.move.newParentOrganization")}</Label>
              <Select value={newParentId} onValueChange={setNewParentId}>
                <SelectTrigger>
                  <SelectValue placeholder={t("dialogs.move.selectNewParent")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="root">{t("dialogs.move.makeRootOrganization")}</SelectItem>
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
              {tCommon("cancel")}
            </Button>
            <Button onClick={handleMoveOrg} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t("dialogs.move.moving")}
                </>
              ) : (
                t("dialogs.move.moveOrganization")
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
