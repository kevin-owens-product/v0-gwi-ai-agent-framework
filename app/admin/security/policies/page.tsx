"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
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
  Edit,
  Trash,
  Power,
  PowerOff,
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

const POLICY_TYPE_KEYS = [
  "PASSWORD", "SESSION", "MFA", "IP_ALLOWLIST", "DATA_ACCESS", "FILE_SHARING",
  "EXTERNAL_SHARING", "DLP", "ENCRYPTION", "DEVICE_TRUST", "API_ACCESS", "RETENTION"
] as const

const SCOPE_KEYS = ["PLATFORM", "ENTERPRISE_ONLY", "SPECIFIC_ORGS", "SPECIFIC_PLANS"] as const

const ENFORCEMENT_MODE_KEYS = ["MONITOR", "WARN", "ENFORCE", "STRICT"] as const

export default function SecurityPoliciesPage() {
  const t = useTranslations("admin.securityPolicies")
  const tCommon = useTranslations("common")

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
      toast.error(t("errors.fetchFailed"))
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
        throw new Error(t("errors.createFailed"))
      }

      toast.success(t("messages.policyCreated"))
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
      toast.error(t("errors.createFailed"))
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
        throw new Error(t("errors.updateFailed"))
      }

      toast.success(policy.isActive ? t("messages.policyDisabled") : t("messages.policyEnabled"))
      fetchPolicies()
    } catch (error) {
      toast.error(t("errors.updateFailed"))
    }
  }

  const handleDeletePolicy = async (policyId: string) => {
    try {
      const response = await fetch(`/api/admin/security/policies/${policyId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error(t("errors.deleteFailed"))
      }

      toast.success(t("messages.policyDeleted"))
      fetchPolicies()
    } catch (error) {
      toast.error(t("errors.deleteFailed"))
      throw error
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
      header: t("columns.policyName"),
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
      header: t("columns.type"),
      cell: (policy) => (
        <Badge variant="outline">
          {t(`policyTypes.${policy.type.toLowerCase()}`)}
        </Badge>
      ),
    },
    {
      id: "scope",
      header: t("columns.scope"),
      cell: (policy) => (
        <Badge variant="secondary">
          {t(`scopes.${policy.scope.toLowerCase()}`)}
        </Badge>
      ),
    },
    {
      id: "enforcement",
      header: t("columns.enforcement"),
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
          {t(`enforcementModes.${policy.enforcementMode.toLowerCase()}`)}
        </Badge>
      ),
    },
    {
      id: "status",
      header: tCommon("status"),
      cell: (policy) => (
        <Badge variant={policy.isActive ? "default" : "outline"}>
          {policy.isActive ? tCommon("active") : tCommon("inactive")}
        </Badge>
      ),
    },
    {
      id: "violations",
      header: t("columns.violations"),
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
      label: t("actions.editPolicy"),
      icon: <Edit className="h-4 w-4" />,
      onClick: () => {
        toast.info(t("messages.editComingSoon"))
      },
    },
    {
      label: t("actions.enable"),
      icon: <Power className="h-4 w-4" />,
      onClick: handleTogglePolicy,
      hidden: (policy) => policy.isActive,
    },
    {
      label: t("actions.disable"),
      icon: <PowerOff className="h-4 w-4" />,
      onClick: handleTogglePolicy,
      hidden: (policy) => !policy.isActive,
    },
  ]

  // Define bulk actions
  const bulkActions: BulkAction[] = [
    {
      label: t("actions.enableSelected"),
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
          toast.success(t("messages.bulkEnabled", { count: ids.length }))
          fetchPolicies()
        } catch (error) {
          toast.error(t("errors.bulkEnableFailed"))
        }
      },
      confirmTitle: t("dialogs.enablePolicies"),
      confirmDescription: t("dialogs.enablePoliciesDescription"),
    },
    {
      label: t("actions.disableSelected"),
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
          toast.success(t("messages.bulkDisabled", { count: ids.length }))
          fetchPolicies()
        } catch (error) {
          toast.error(t("errors.bulkDisableFailed"))
        }
      },
      confirmTitle: t("dialogs.disablePolicies"),
      confirmDescription: t("dialogs.disablePoliciesDescription"),
    },
    {
      label: t("actions.deleteSelected"),
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
          toast.success(t("messages.bulkDeleted", { count: ids.length }))
          fetchPolicies()
        } catch (error) {
          toast.error(t("errors.bulkDeleteFailed"))
        }
      },
      variant: "destructive",
      separator: true,
      confirmTitle: t("dialogs.deletePolicies"),
      confirmDescription: t("dialogs.deletePoliciesDescription"),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Lock className="h-8 w-8 text-primary" />
            {t("title")}
          </h1>
          <p className="text-muted-foreground">
            {t("description")}
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {t("createPolicy")}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{t("dialogs.createPolicy")}</DialogTitle>
              <DialogDescription>
                {t("dialogs.createPolicyDescription")}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
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
                  <Label>{t("form.policyType")}</Label>
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
                      {POLICY_TYPE_KEYS.map((type) => (
                        <SelectItem key={type} value={type}>
                          {t(`policyTypes.${type.toLowerCase()}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
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
                      {SCOPE_KEYS.map((scope) => (
                        <SelectItem key={scope} value={scope}>
                          {t(`scopes.${scope.toLowerCase()}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>{t("form.enforcementMode")}</Label>
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
                      {ENFORCEMENT_MODE_KEYS.map((mode) => (
                        <SelectItem key={mode} value={mode}>
                          {t(`enforcementModes.${mode.toLowerCase()}`)}
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
              <div className="flex items-center gap-2">
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

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{policies.length}</div>
            <p className="text-xs text-muted-foreground">{t("stats.totalPolicies")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-500">
              {policies.filter((p) => p.isActive).length}
            </div>
            <p className="text-xs text-muted-foreground">{t("stats.activePolicies")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-500">
              {policies.filter((p) => p.enforcementMode === "ENFORCE" || p.enforcementMode === "STRICT").length}
            </div>
            <p className="text-xs text-muted-foreground">{t("stats.enforcingPolicies")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-500">
              {policies.reduce((acc, p) => acc + (p.violationCount || 0), 0)}
            </div>
            <p className="text-xs text-muted-foreground">{t("stats.totalViolations")}</p>
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
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder={t("form.policyType")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("filters.allTypes")}</SelectItem>
                {POLICY_TYPE_KEYS.map((type) => (
                  <SelectItem key={type} value={type}>
                    {t(`policyTypes.${type.toLowerCase()}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={scopeFilter} onValueChange={setScopeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t("form.scope")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("filters.allScopes")}</SelectItem>
                {SCOPE_KEYS.map((scope) => (
                  <SelectItem key={scope} value={scope}>
                    {t(`scopes.${scope.toLowerCase()}`)}
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
            emptyMessage={t("noPolicies")}
            onDelete={async (policy) => {
              await handleDeletePolicy(policy.id)
            }}
            deleteConfirmTitle={t("dialogs.deletePolicy")}
            deleteConfirmDescription={(policy) =>
              t("dialogs.deletePolicyDescription", { name: policy.name })
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
