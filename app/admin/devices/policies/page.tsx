"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  Shield,
  Plus,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Edit,
  Trash,
  Power,
  PowerOff,
  ArrowLeft,
  RefreshCw,
  Lock,
  Smartphone,
  Fingerprint,
  HardDrive,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import Link from "next/link"

interface DevicePolicy {
  id: string
  name: string
  description: string | null
  scope: string
  targetOrgs: string[]
  targetPlans: string[]
  requireEncryption: boolean
  requirePasscode: boolean
  requireBiometric: boolean
  requireMDM: boolean
  minOSVersion: Record<string, string>
  allowedPlatforms: string[]
  blockedPlatforms: string[]
  blockOnViolation: boolean
  wipeOnViolation: boolean
  notifyOnViolation: boolean
  isActive: boolean
  priority: number
  createdBy: string | null
  createdAt: string
  updatedAt: string
}

interface Stats {
  total: number
  active: number
  enforcing: number
}

const scopeOptions = [
  { value: "PLATFORM", label: "Platform-wide" },
  { value: "ENTERPRISE_ONLY", label: "Enterprise Only" },
  { value: "SPECIFIC_ORGS", label: "Specific Organizations" },
  { value: "SPECIFIC_PLANS", label: "Specific Plans" },
]

export default function DevicePoliciesPage() {
  const router = useRouter()
  const [policies, setPolicies] = useState<DevicePolicy[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [scopeFilter, setScopeFilter] = useState("all")
  const [activeFilter, setActiveFilter] = useState("all")
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [stats, setStats] = useState<Stats>({ total: 0, active: 0, enforcing: 0 })
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  })

  const [newPolicy, setNewPolicy] = useState({
    name: "",
    description: "",
    scope: "PLATFORM",
    requireEncryption: false,
    requirePasscode: false,
    requireBiometric: false,
    requireMDM: false,
    blockOnViolation: false,
    notifyOnViolation: true,
    isActive: true,
    priority: 0,
  })

  const fetchPolicies = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set("page", pagination.page.toString())
      params.set("limit", pagination.limit.toString())
      if (search) params.set("search", search)
      if (scopeFilter !== "all") params.set("scope", scopeFilter)
      if (activeFilter !== "all") params.set("isActive", activeFilter)

      const response = await fetch(`/api/admin/devices/policies?${params}`)
      if (!response.ok) {
        if (response.status === 401) {
          router.push("/admin/login")
          return
        }
        throw new Error("Failed to fetch policies")
      }

      const data = await response.json()
      setPolicies(data.policies || [])
      setStats(data.stats || { total: 0, active: 0, enforcing: 0 })
      if (data.pagination) {
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error("Failed to fetch policies:", error)
      toast.error("Failed to fetch device policies")
    } finally {
      setLoading(false)
    }
  }, [pagination.page, pagination.limit, search, scopeFilter, activeFilter, router])

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchPolicies()
    }, 300)
    return () => clearTimeout(debounce)
  }, [fetchPolicies])

  const handleCreatePolicy = async () => {
    if (!newPolicy.name) {
      toast.error("Policy name is required")
      return
    }

    try {
      const response = await fetch("/api/admin/devices/policies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPolicy),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to create policy")
      }

      toast.success("Device policy created successfully")
      setIsCreateOpen(false)
      setNewPolicy({
        name: "",
        description: "",
        scope: "PLATFORM",
        requireEncryption: false,
        requirePasscode: false,
        requireBiometric: false,
        requireMDM: false,
        blockOnViolation: false,
        notifyOnViolation: true,
        isActive: true,
        priority: 0,
      })
      fetchPolicies()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create policy")
    }
  }

  const handleTogglePolicy = async (policy: DevicePolicy) => {
    try {
      const response = await fetch(`/api/admin/devices/policies/${policy.id}`, {
        method: "PUT",
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
    if (!confirm("Are you sure you want to delete this policy?")) return

    try {
      const response = await fetch(`/api/admin/devices/policies/${policyId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete policy")
      }

      toast.success("Policy deleted successfully")
      fetchPolicies()
    } catch (error) {
      toast.error("Failed to delete policy")
    }
  }

  const getRequirementBadges = (policy: DevicePolicy) => {
    const badges = []
    if (policy.requireEncryption) badges.push({ icon: Lock, label: "Encryption" })
    if (policy.requirePasscode) badges.push({ icon: HardDrive, label: "Passcode" })
    if (policy.requireBiometric) badges.push({ icon: Fingerprint, label: "Biometric" })
    if (policy.requireMDM) badges.push({ icon: Smartphone, label: "MDM" })
    return badges
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/admin/devices">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Devices
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Shield className="h-8 w-8 text-primary" />
              Device Policies
            </h1>
            <p className="text-muted-foreground">
              Configure device compliance and trust requirements
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchPolicies}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Policy
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Device Policy</DialogTitle>
                <DialogDescription>
                  Define device requirements and compliance rules
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
                <div className="grid gap-2">
                  <Label htmlFor="name">Policy Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Enterprise Device Requirements"
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

                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium mb-4">Device Requirements</h4>
                  <div className="grid gap-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Require Encryption</Label>
                        <p className="text-xs text-muted-foreground">
                          Device must have storage encryption enabled
                        </p>
                      </div>
                      <Switch
                        checked={newPolicy.requireEncryption}
                        onCheckedChange={(checked) =>
                          setNewPolicy({ ...newPolicy, requireEncryption: checked })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Require Passcode</Label>
                        <p className="text-xs text-muted-foreground">
                          Device must have a passcode/PIN configured
                        </p>
                      </div>
                      <Switch
                        checked={newPolicy.requirePasscode}
                        onCheckedChange={(checked) =>
                          setNewPolicy({ ...newPolicy, requirePasscode: checked })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Require Biometric</Label>
                        <p className="text-xs text-muted-foreground">
                          Device must have biometric authentication
                        </p>
                      </div>
                      <Switch
                        checked={newPolicy.requireBiometric}
                        onCheckedChange={(checked) =>
                          setNewPolicy({ ...newPolicy, requireBiometric: checked })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Require MDM</Label>
                        <p className="text-xs text-muted-foreground">
                          Device must be enrolled in MDM
                        </p>
                      </div>
                      <Switch
                        checked={newPolicy.requireMDM}
                        onCheckedChange={(checked) =>
                          setNewPolicy({ ...newPolicy, requireMDM: checked })
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium mb-4">Enforcement Actions</h4>
                  <div className="grid gap-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Block on Violation</Label>
                        <p className="text-xs text-muted-foreground">
                          Block access when device is non-compliant
                        </p>
                      </div>
                      <Switch
                        checked={newPolicy.blockOnViolation}
                        onCheckedChange={(checked) =>
                          setNewPolicy({ ...newPolicy, blockOnViolation: checked })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Notify on Violation</Label>
                        <p className="text-xs text-muted-foreground">
                          Send notification when policy is violated
                        </p>
                      </div>
                      <Switch
                        checked={newPolicy.notifyOnViolation}
                        onCheckedChange={(checked) =>
                          setNewPolicy({ ...newPolicy, notifyOnViolation: checked })
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 border-t pt-4">
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
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Total Policies</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-500">{stats.active}</div>
            <p className="text-xs text-muted-foreground">Active Policies</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-500">{stats.enforcing}</div>
            <p className="text-xs text-muted-foreground">Enforcing (Block on Violation)</p>
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
            <Select value={scopeFilter} onValueChange={setScopeFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
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
            <Select value={activeFilter} onValueChange={setActiveFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="true">Active</SelectItem>
                <SelectItem value="false">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Policies Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Policy Name</TableHead>
                <TableHead>Scope</TableHead>
                <TableHead>Requirements</TableHead>
                <TableHead>Enforcement</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={6}>
                      <div className="h-12 bg-muted animate-pulse rounded" />
                    </TableCell>
                  </TableRow>
                ))
              ) : policies.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No device policies found</p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => setIsCreateOpen(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Policy
                    </Button>
                  </TableCell>
                </TableRow>
              ) : (
                policies.map((policy) => (
                  <TableRow key={policy.id}>
                    <TableCell>
                      <Link href={`/admin/devices/policies/${policy.id}`} className="hover:underline">
                        <div>
                          <p className="font-medium">{policy.name}</p>
                          {policy.description && (
                            <p className="text-xs text-muted-foreground truncate max-w-[300px]">
                              {policy.description}
                            </p>
                          )}
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {policy.scope.replace(/_/g, " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {getRequirementBadges(policy).map((req, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            <req.icon className="h-3 w-3 mr-1" />
                            {req.label}
                          </Badge>
                        ))}
                        {getRequirementBadges(policy).length === 0 && (
                          <span className="text-muted-foreground text-sm">None</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {policy.blockOnViolation ? (
                        <Badge variant="destructive">
                          <XCircle className="h-3 w-3 mr-1" />
                          Blocking
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Monitor
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={policy.isActive ? "default" : "outline"}>
                        {policy.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/devices/policies/${policy.id}`}>
                              <Edit className="h-4 w-4 mr-2" />
                              View / Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleTogglePolicy(policy)}>
                            {policy.isActive ? (
                              <>
                                <PowerOff className="h-4 w-4 mr-2" />
                                Disable
                              </>
                            ) : (
                              <>
                                <Power className="h-4 w-4 mr-2" />
                                Enable
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDeletePolicy(policy.id)}
                          >
                            <Trash className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
            {pagination.total} policies
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page === 1}
              onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page === pagination.totalPages}
              onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
