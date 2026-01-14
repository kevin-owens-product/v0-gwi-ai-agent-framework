"use client"

import { useEffect, useState } from "react"
import {
  Lock,
  Plus,
  Search,
  Filter,
  Shield,
  Key,
  Smartphone,
  Globe,
  FileText,
  Clock,
  Users,
  Edit,
  Trash,
  Power,
  PowerOff,
  AlertCircle,
} from "lucide-react"
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
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { AdminDataTable, Column, RowAction, BulkAction } from "@/components/admin/data-table"

interface SecurityPolicy {
  id: string
  name: string
  description: string | null
  type: string
  scope: string
  isActive: boolean
  enforcementMode: string
  priority: number
  targetOrgs: string[]
  targetPlans: string[]
  settings: Record<string, unknown>
  violationCount: number
  createdAt: string
  updatedAt: string
}

const policyTypeIcons: Record<string, React.ReactNode> = {
  PASSWORD: <Key className="h-4 w-4" />,
  SESSION: <Clock className="h-4 w-4" />,
  MFA: <Smartphone className="h-4 w-4" />,
  IP_ALLOWLIST: <Globe className="h-4 w-4" />,
  DLP: <FileText className="h-4 w-4" />,
  DEVICE_TRUST: <Smartphone className="h-4 w-4" />,
  API_ACCESS: <Key className="h-4 w-4" />,
  DEFAULT: <Shield className="h-4 w-4" />,
}

const policyTypes = [
  { value: "PASSWORD", label: "Password Policy" },
  { value: "SESSION", label: "Session Policy" },
  { value: "MFA", label: "MFA Requirements" },
  { value: "IP_ALLOWLIST", label: "IP Allowlist" },
  { value: "DATA_ACCESS", label: "Data Access" },
  { value: "FILE_SHARING", label: "File Sharing" },
  { value: "EXTERNAL_SHARING", label: "External Sharing" },
  { value: "DLP", label: "Data Loss Prevention" },
  { value: "ENCRYPTION", label: "Encryption" },
  { value: "DEVICE_TRUST", label: "Device Trust" },
  { value: "API_ACCESS", label: "API Access" },
  { value: "RETENTION", label: "Data Retention" },
]

const scopeOptions = [
  { value: "PLATFORM", label: "Platform-wide" },
  { value: "ENTERPRISE_ONLY", label: "Enterprise Only" },
  { value: "SPECIFIC_ORGS", label: "Specific Organizations" },
  { value: "SPECIFIC_PLANS", label: "Specific Plans" },
]

const enforcementModes = [
  { value: "MONITOR", label: "Monitor Only" },
  { value: "WARN", label: "Warn" },
  { value: "ENFORCE", label: "Enforce" },
  { value: "STRICT", label: "Strict" },
]

export default function SecurityPoliciesPage() {
  const [policies, setPolicies] = useState<SecurityPolicy[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [scopeFilter, setScopeFilter] = useState("all")
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const [newPolicy, setNewPolicy] = useState({
    name: "",
    description: "",
    type: "PASSWORD",
    scope: "PLATFORM",
    enforcementMode: "ENFORCE",
    priority: 0,
    isActive: true,
  })

  useEffect(() => {
    fetchPolicies()
  }, [typeFilter, scopeFilter])

  const fetchPolicies = async () => {
    try {
      const params = new URLSearchParams()
      if (typeFilter !== "all") params.set("type", typeFilter)
      if (scopeFilter !== "all") params.set("scope", scopeFilter)
      if (search) params.set("search", search)

      const response = await fetch(`/api/admin/security/policies?${params}`)
      const data = await response.json()
      setPolicies(data.policies || [])
    } catch (error) {
      console.error("Failed to fetch policies:", error)
      toast.error("Failed to fetch security policies")
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePolicy = async () => {
    try {
      const response = await fetch("/api/admin/security/policies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPolicy),
      })

      if (!response.ok) {
        throw new Error("Failed to create policy")
      }

      toast.success("Security policy created successfully")
      setIsCreateOpen(false)
      setNewPolicy({
        name: "",
        description: "",
        type: "PASSWORD",
        scope: "PLATFORM",
        enforcementMode: "ENFORCE",
        priority: 0,
        isActive: true,
      })
      fetchPolicies()
    } catch (error) {
      toast.error("Failed to create security policy")
    }
  }

  const handleTogglePolicy = async (policy: SecurityPolicy) => {
    try {
      const response = await fetch(`/api/admin/security/policies/${policy.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !policy.isActive }),
      })

      if (!response.ok) {
        throw new Error("Failed to update policy")
      }

      toast.success(`Policy ${policy.isActive ? "disabled" : "enabled"} successfully`)
      fetchPolicies()
    } catch (error) {
      toast.error("Failed to update policy")
    }
  }

  const handleDeletePolicy = async (policyId: string) => {
    try {
      const response = await fetch(`/api/admin/security/policies/${policyId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete policy")
      }

      toast.success("Policy deleted successfully")
      fetchPolicies()
    } catch (error) {
      toast.error("Failed to delete policy")
      throw error // Re-throw to let AdminDataTable handle the error state
    }
  }

  const filteredPolicies = policies.filter(
    (policy) =>
      policy.name.toLowerCase().includes(search.toLowerCase()) ||
      policy.description?.toLowerCase().includes(search.toLowerCase())
  )

  const getPolicyIcon = (type: string) => policyTypeIcons[type] || policyTypeIcons.DEFAULT

  // Define columns for AdminDataTable
  const columns: Column<SecurityPolicy>[] = [
    {
      id: "icon",
      header: "",
      cell: (policy) => getPolicyIcon(policy.type),
      className: "w-[40px]",
    },
    {
      id: "name",
      header: "Policy Name",
      cell: (policy) => (
        <div>
          <p className="font-medium">{policy.name}</p>
          {policy.description && (
            <p className="text-xs text-muted-foreground truncate max-w-[300px]">
              {policy.description}
            </p>
          )}
        </div>
      ),
    },
    {
      id: "type",
      header: "Type",
      cell: (policy) => (
        <Badge variant="outline">
          {policy.type.replace(/_/g, " ")}
        </Badge>
      ),
    },
    {
      id: "scope",
      header: "Scope",
      cell: (policy) => (
        <Badge variant="secondary">
          {policy.scope.replace(/_/g, " ")}
        </Badge>
      ),
    },
    {
      id: "enforcement",
      header: "Enforcement",
      cell: (policy) => (
        <Badge
          variant={
            policy.enforcementMode === "STRICT"
              ? "destructive"
              : policy.enforcementMode === "ENFORCE"
              ? "default"
              : "secondary"
          }
        >
          {policy.enforcementMode}
        </Badge>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: (policy) => (
        <Badge variant={policy.isActive ? "default" : "outline"}>
          {policy.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      id: "violations",
      header: "Violations",
      cell: (policy) =>
        policy.violationCount > 0 ? (
          <Badge variant="destructive">{policy.violationCount}</Badge>
        ) : (
          <span className="text-muted-foreground">0</span>
        ),
    },
  ]

  // Define row actions
  const rowActions: RowAction<SecurityPolicy>[] = [
    {
      label: "Edit Policy",
      icon: <Edit className="h-4 w-4" />,
      onClick: (policy) => {
        // TODO: Implement edit functionality
        toast.info("Edit functionality coming soon")
      },
    },
    {
      label: "Enable",
      icon: <Power className="h-4 w-4" />,
      onClick: handleTogglePolicy,
      hidden: (policy) => policy.isActive,
    },
    {
      label: "Disable",
      icon: <PowerOff className="h-4 w-4" />,
      onClick: handleTogglePolicy,
      hidden: (policy) => !policy.isActive,
    },
  ]

  // Define bulk actions
  const bulkActions: BulkAction[] = [
    {
      label: "Enable Selected",
      icon: <Power className="h-4 w-4" />,
      onClick: async (ids) => {
        try {
          await Promise.all(
            ids.map((id) => {
              const policy = policies.find((p) => p.id === id)
              if (policy && !policy.isActive) {
                return fetch(`/api/admin/security/policies/${id}`, {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ isActive: true }),
                })
              }
              return Promise.resolve()
            })
          )
          toast.success(`Enabled ${ids.length} policies`)
          fetchPolicies()
        } catch (error) {
          toast.error("Failed to enable policies")
        }
      },
      confirmTitle: "Enable Policies",
      confirmDescription: "Are you sure you want to enable the selected policies?",
    },
    {
      label: "Disable Selected",
      icon: <PowerOff className="h-4 w-4" />,
      onClick: async (ids) => {
        try {
          await Promise.all(
            ids.map((id) => {
              const policy = policies.find((p) => p.id === id)
              if (policy && policy.isActive) {
                return fetch(`/api/admin/security/policies/${id}`, {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ isActive: false }),
                })
              }
              return Promise.resolve()
            })
          )
          toast.success(`Disabled ${ids.length} policies`)
          fetchPolicies()
        } catch (error) {
          toast.error("Failed to disable policies")
        }
      },
      confirmTitle: "Disable Policies",
      confirmDescription: "Are you sure you want to disable the selected policies?",
    },
    {
      label: "Delete Selected",
      icon: <Trash className="h-4 w-4" />,
      onClick: async (ids) => {
        try {
          await Promise.all(
            ids.map((id) =>
              fetch(`/api/admin/security/policies/${id}`, {
                method: "DELETE",
              })
            )
          )
          toast.success(`Deleted ${ids.length} policies`)
          fetchPolicies()
        } catch (error) {
          toast.error("Failed to delete policies")
        }
      },
      variant: "destructive",
      separator: true,
      confirmTitle: "Delete Policies",
      confirmDescription: "Are you sure you want to delete the selected policies? This action cannot be undone.",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Lock className="h-8 w-8 text-primary" />
            Security Policies
          </h1>
          <p className="text-muted-foreground">
            Configure and manage platform-wide security enforcement rules
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Policy
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Security Policy</DialogTitle>
              <DialogDescription>
                Define a new security policy to enforce across the platform
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Policy Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Enterprise Password Policy"
                  value={newPolicy.name}
                  onChange={(e) =>
                    setNewPolicy({ ...newPolicy, name: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what this policy enforces..."
                  value={newPolicy.description}
                  onChange={(e) =>
                    setNewPolicy({ ...newPolicy, description: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Policy Type</Label>
                  <Select
                    value={newPolicy.type}
                    onValueChange={(value) =>
                      setNewPolicy({ ...newPolicy, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {policyTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Scope</Label>
                  <Select
                    value={newPolicy.scope}
                    onValueChange={(value) =>
                      setNewPolicy({ ...newPolicy, scope: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {scopeOptions.map((scope) => (
                        <SelectItem key={scope.value} value={scope.value}>
                          {scope.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Enforcement Mode</Label>
                  <Select
                    value={newPolicy.enforcementMode}
                    onValueChange={(value) =>
                      setNewPolicy({ ...newPolicy, enforcementMode: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {enforcementModes.map((mode) => (
                        <SelectItem key={mode.value} value={mode.value}>
                          {mode.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="priority">Priority (higher = first)</Label>
                  <Input
                    id="priority"
                    type="number"
                    value={newPolicy.priority}
                    onChange={(e) =>
                      setNewPolicy({ ...newPolicy, priority: parseInt(e.target.value) || 0 })
                    }
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="isActive"
                  checked={newPolicy.isActive}
                  onCheckedChange={(checked) =>
                    setNewPolicy({ ...newPolicy, isActive: checked })
                  }
                />
                <Label htmlFor="isActive">Enable policy immediately</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreatePolicy} disabled={!newPolicy.name}>
                Create Policy
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{policies.length}</div>
            <p className="text-xs text-muted-foreground">Total Policies</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-500">
              {policies.filter((p) => p.isActive).length}
            </div>
            <p className="text-xs text-muted-foreground">Active Policies</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-500">
              {policies.filter((p) => p.enforcementMode === "ENFORCE" || p.enforcementMode === "STRICT").length}
            </div>
            <p className="text-xs text-muted-foreground">Enforcing Policies</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-500">
              {policies.reduce((acc, p) => acc + (p.violationCount || 0), 0)}
            </div>
            <p className="text-xs text-muted-foreground">Total Violations</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search policies..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Policy Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {policyTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={scopeFilter} onValueChange={setScopeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Scope" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Scopes</SelectItem>
                {scopeOptions.map((scope) => (
                  <SelectItem key={scope.value} value={scope.value}>
                    {scope.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Policies Table */}
      <Card>
        <CardContent className="p-0">
          <AdminDataTable
            data={filteredPolicies}
            columns={columns}
            getRowId={(policy) => policy.id}
            isLoading={loading}
            emptyMessage={
              <div className="text-center py-12">
                <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No security policies found</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setIsCreateOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Policy
                </Button>
              </div>
            }
            onDelete={async (policy) => {
              await handleDeletePolicy(policy.id)
            }}
            deleteConfirmTitle="Delete Security Policy"
            deleteConfirmDescription={(policy) =>
              `Are you sure you want to delete "${policy.name}"? This action cannot be undone.`
            }
            rowActions={rowActions}
            bulkActions={bulkActions}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            enableSelection={true}
          />
        </CardContent>
      </Card>
    </div>
  )
}
