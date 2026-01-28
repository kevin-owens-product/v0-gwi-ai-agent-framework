"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
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
import { Card, CardContent } from "@/components/ui/card"
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

// scopeOptions moved inside component to use translations

export default function DevicePoliciesPage() {
  const router = useRouter()
  const t = useTranslations("admin.devices.policies")
  const tCommon = useTranslations("common")
  
  const scopeOptions = [
    { value: "PLATFORM", label: t("scopes.platform") },
    { value: "ENTERPRISE_ONLY", label: t("scopes.enterprise_only") },
    { value: "SPECIFIC_ORGS", label: t("scopes.specific_orgs") },
    { value: "SPECIFIC_PLANS", label: t("scopes.specific_plans") },
  ]
  
  const [policies, setPolicies] = useState<DevicePolicy[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [scopeFilter, setScopeFilter] = useState("all")
  const [activeFilter, setActiveFilter] = useState("all")
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [stats, setStats] = useState<Stats>({ total: 0, active: 0, enforcing: 0 })
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [policyToDelete, setPolicyToDelete] = useState<string | null>(null)
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
          router.push("/login?type=admin")
          return
        }
        throw new Error(t("errors.fetchFailed"))
      }

      const data = await response.json()
      setPolicies(data.policies || [])
      setStats(data.stats || { total: 0, active: 0, enforcing: 0 })
      if (data.pagination) {
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error("Failed to fetch policies:", error)
      toast.error(t("errors.fetchFailed"))
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
      toast.error(t("validation.policyNameRequired"))
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
        throw new Error(error.error || t("errors.createFailed"))
      }

      toast.success(t("messages.policyCreated"))
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
      toast.error(error instanceof Error ? error.message : t("errors.createFailed"))
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
        throw new Error(t("errors.updateFailed"))
      }

      toast.success(policy.isActive ? t("messages.policyDisabled") : t("messages.policyEnabled"))
      fetchPolicies()
    } catch (error) {
      toast.error(t("errors.updateFailed"))
    }
  }

  const handleDeleteClick = (policyId: string) => {
    setPolicyToDelete(policyId)
    setShowDeleteConfirm(true)
  }

  const handleConfirmDelete = async () => {
    if (!policyToDelete) return

    try {
      const response = await fetch(`/api/admin/devices/policies/${policyToDelete}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error(t("errors.deleteFailed"))
      }

      toast.success(t("messages.policyDeleted"))
      fetchPolicies()
    } catch (error) {
      toast.error(t("errors.deleteFailed"))
    } finally {
      setShowDeleteConfirm(false)
      setPolicyToDelete(null)
    }
  }

  const getRequirementBadges = (policy: DevicePolicy) => {
    const badges = []
    if (policy.requireEncryption) badges.push({ icon: Lock, label: t("requirements.encryption") })
    if (policy.requirePasscode) badges.push({ icon: HardDrive, label: t("requirements.passcode") })
    if (policy.requireBiometric) badges.push({ icon: Fingerprint, label: t("requirements.biometric") })
    if (policy.requireMDM) badges.push({ icon: Smartphone, label: t("requirements.mdm") })
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
              {t("backToDevices")}
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Shield className="h-8 w-8 text-primary" />
              {t("title")}
            </h1>
            <p className="text-muted-foreground">
              {t("description")}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchPolicies}>
            <RefreshCw className="h-4 w-4 mr-2" />
            {tCommon("refresh")}
          </Button>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                {t("createPolicy")}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{t("dialogs.createTitle")}</DialogTitle>
                <DialogDescription>
                  {t("dialogs.createDescription")}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
                <div className="grid gap-2">
                  <Label htmlFor="name">{t("form.policyName")}</Label>
                  <Input
                    id="name"
                    placeholder={t("form.policyNamePlaceholder")}
                    value={newPolicy.name}
                    onChange={(e) =>
                      setNewPolicy({ ...newPolicy, name: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">{tCommon("description")}</Label>
                  <Textarea
                    id="description"
                    placeholder={t("form.descriptionPlaceholder")}
                    value={newPolicy.description}
                    onChange={(e) =>
                      setNewPolicy({ ...newPolicy, description: e.target.value })
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>{t("form.scope")}</Label>
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
                            {t(`scopes.${scope.value.toLowerCase()}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="priority">{t("form.priority")}</Label>
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
                  <h4 className="text-sm font-medium mb-4">{t("sections.deviceRequirements")}</h4>
                  <div className="grid gap-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>{t("form.requireEncryption")}</Label>
                        <p className="text-xs text-muted-foreground">
                          {t("form.requireEncryptionHelp")}
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
                        <Label>{t("form.requirePasscode")}</Label>
                        <p className="text-xs text-muted-foreground">
                          {t("form.requirePasscodeHelp")}
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
                        <Label>{t("form.requireBiometric")}</Label>
                        <p className="text-xs text-muted-foreground">
                          {t("form.requireBiometricHelp")}
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
                        <Label>{t("form.requireMDM")}</Label>
                        <p className="text-xs text-muted-foreground">
                          {t("form.requireMDMHelp")}
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
                  <h4 className="text-sm font-medium mb-4">{t("sections.enforcementActions")}</h4>
                  <div className="grid gap-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>{t("form.blockOnViolation")}</Label>
                        <p className="text-xs text-muted-foreground">
                          {t("form.blockOnViolationHelp")}
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
                        <Label>{t("form.notifyOnViolation")}</Label>
                        <p className="text-xs text-muted-foreground">
                          {t("form.notifyOnViolationHelp")}
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
                  <Label htmlFor="isActive">{t("form.enableImmediately")}</Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  {tCommon("cancel")}
                </Button>
                <Button onClick={handleCreatePolicy} disabled={!newPolicy.name}>
                  {t("createPolicy")}
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
            <p className="text-xs text-muted-foreground">{t("stats.totalPolicies")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-500">{stats.active}</div>
            <p className="text-xs text-muted-foreground">{t("stats.activePolicies")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-500">{stats.enforcing}</div>
            <p className="text-xs text-muted-foreground">{t("stats.enforcing")}</p>
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
                  placeholder={t("searchPlaceholder")}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={scopeFilter} onValueChange={setScopeFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder={t("form.scope")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("filters.allScopes")}</SelectItem>
                {scopeOptions.map((scope) => (
                  <SelectItem key={scope.value} value={scope.value}>
                    {t(`scopes.${scope.value.toLowerCase()}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={activeFilter} onValueChange={setActiveFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder={tCommon("status")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("filters.allStatus")}</SelectItem>
                <SelectItem value="true">{tCommon("active")}</SelectItem>
                <SelectItem value="false">{tCommon("inactive")}</SelectItem>
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
                <TableHead>{t("columns.policyName")}</TableHead>
                <TableHead>{t("columns.scope")}</TableHead>
                <TableHead>{t("columns.requirements")}</TableHead>
                <TableHead>{t("columns.enforcement")}</TableHead>
                <TableHead>{tCommon("status")}</TableHead>
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
                    <p className="text-muted-foreground">{t("noPolicies")}</p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => setIsCreateOpen(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {t("createFirstPolicy")}
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
                        {t(`scopes.${policy.scope.toLowerCase()}`)}
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
                          <span className="text-muted-foreground text-sm">{tCommon("none")}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {policy.blockOnViolation ? (
                        <Badge variant="destructive">
                          <XCircle className="h-3 w-3 mr-1" />
                          {t("enforcement.blocking")}
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          {t("enforcement.monitor")}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={policy.isActive ? "default" : "outline"}>
                        {policy.isActive ? tCommon("active") : tCommon("inactive")}
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
                              {t("actions.viewEdit")}
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleTogglePolicy(policy)}>
                            {policy.isActive ? (
                              <>
                                <PowerOff className="h-4 w-4 mr-2" />
                                {t("actions.disable")}
                              </>
                            ) : (
                              <>
                                <Power className="h-4 w-4 mr-2" />
                                {t("actions.enable")}
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDeleteClick(policy.id)}
                          >
                            <Trash className="h-4 w-4 mr-2" />
                            {tCommon("delete")}
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
            {t("pagination.showing", {
              start: (pagination.page - 1) * pagination.limit + 1,
              end: Math.min(pagination.page * pagination.limit, pagination.total),
              total: pagination.total
            })}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page === 1}
              onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
            >
              {tCommon("previous")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page === pagination.totalPages}
              onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
            >
              {tCommon("next")}
            </Button>
          </div>
        </div>
      )}

      <ConfirmationDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title={t("dialogs.deleteTitle")}
        description={t("dialogs.deleteDescription")}
        confirmText={tCommon("delete")}
        variant="destructive"
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}
