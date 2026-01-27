"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
import {
  Key,
  Plus,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Settings,
  Clock,
  Play,
  Pause,
  TestTube,
  Building2,
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
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import Link from "next/link"
import { AdminDataTable, Column, RowAction, BulkAction } from "@/components/admin/data-table"

interface Organization {
  id: string
  name: string
  slug: string
}

interface SSOConfig {
  id: string
  orgId: string
  provider: string
  status: string
  displayName: string | null
  jitProvisioning: boolean
  autoDeactivate: boolean
  defaultRole: string
  lastSyncAt: string | null
  createdAt: string
  organization: Organization | null
}

const SSO_PROVIDER_KEYS = ["SAML", "OIDC", "AZURE_AD", "OKTA", "GOOGLE_WORKSPACE", "ONELOGIN", "PING_IDENTITY", "CUSTOM"] as const
const STATUS_KEYS = ["CONFIGURING", "TESTING", "ACTIVE", "DISABLED", "ERROR"] as const

export default function SSOListingPage() {
  const router = useRouter()
  const t = useTranslations("admin.sso")
  const tCommon = useTranslations("common")

  const [ssoConfigs, setSsoConfigs] = useState<SSOConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [providerFilter, setProviderFilter] = useState("all")
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [configToDelete, setConfigToDelete] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  })

  const [newConfig, setNewConfig] = useState({
    orgId: "",
    provider: "SAML",
    displayName: "",
    jitProvisioning: true,
    autoDeactivate: false,
    defaultRole: "MEMBER",
  })

  useEffect(() => {
    fetchSSOConfigs()
  }, [statusFilter, providerFilter, pagination.page])

  const fetchSSOConfigs = async () => {
    try {
      const params = new URLSearchParams()
      if (statusFilter !== "all") params.set("status", statusFilter)
      if (providerFilter !== "all") params.set("provider", providerFilter)
      if (search) params.set("search", search)
      params.set("page", pagination.page.toString())
      params.set("limit", pagination.limit.toString())

      const response = await fetch(`/api/admin/identity/sso?${params}`)
      const data = await response.json()
      setSsoConfigs(data.ssoConfigs || [])
      if (data.pagination) {
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error("Failed to fetch SSO configs:", error)
      toast.error(t("errors.fetchFailed"))
    } finally {
      setLoading(false)
    }
  }

  const handleCreateConfig = async () => {
    if (!newConfig.orgId || !newConfig.provider) {
      toast.error(t("errors.orgIdAndProviderRequired"))
      return
    }

    try {
      const response = await fetch("/api/admin/identity/sso", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newConfig),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || t("errors.createFailed"))
      }

      toast.success(t("messages.configCreated"))
      setIsCreateOpen(false)
      setNewConfig({
        orgId: "",
        provider: "SAML",
        displayName: "",
        jitProvisioning: true,
        autoDeactivate: false,
        defaultRole: "MEMBER",
      })
      fetchSSOConfigs()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("errors.createFailed"))
    }
  }

  const handleToggleStatus = async (config: SSOConfig) => {
    const newStatus = config.status === "ACTIVE" ? "DISABLED" : "ACTIVE"

    try {
      const response = await fetch(`/api/admin/identity/sso/${config.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error(t("errors.statusUpdateFailed"))
      }

      toast.success(newStatus === "ACTIVE" ? t("messages.configActivated") : t("messages.configDisabled"))
      fetchSSOConfigs()
    } catch (error) {
      toast.error(t("errors.statusUpdateFailed"))
    }
  }

  const handleDeleteClick = (configId: string) => {
    setConfigToDelete(configId)
    setShowDeleteConfirm(true)
  }

  const handleConfirmDelete = async () => {
    if (!configToDelete) return

    try {
      const response = await fetch(`/api/admin/identity/sso/${configToDelete}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || t("errors.deleteFailed"))
      }

      toast.success(t("messages.configDeleted"))
      fetchSSOConfigs()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("errors.deleteFailed"))
    } finally {
      setShowDeleteConfirm(false)
      setConfigToDelete(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return (
          <Badge className="bg-green-500">
            <CheckCircle className="h-3 w-3 mr-1" />
            {t("statuses.active")}
          </Badge>
        )
      case "CONFIGURING":
        return (
          <Badge variant="secondary">
            <Settings className="h-3 w-3 mr-1" />
            {t("statuses.configuring")}
          </Badge>
        )
      case "TESTING":
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-700">
            <TestTube className="h-3 w-3 mr-1" />
            {t("statuses.testing")}
          </Badge>
        )
      case "DISABLED":
        return (
          <Badge variant="outline">
            <Pause className="h-3 w-3 mr-1" />
            {t("statuses.disabled")}
          </Badge>
        )
      case "ERROR":
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            {t("statuses.error")}
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getProviderIcon = (provider: string) => {
    return <Key className="h-4 w-4" />
  }

  const handleBulkEnable = async (ids: string[]) => {
    try {
      await Promise.all(
        ids.map((id) =>
          fetch(`/api/admin/identity/sso/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "ACTIVE" }),
          })
        )
      )
      toast.success(t("messages.bulkEnabled", { count: ids.length }))
      fetchSSOConfigs()
      setSelectedIds(new Set())
    } catch (error) {
      toast.error(t("errors.bulkEnableFailed"))
    }
  }

  const handleBulkDisable = async (ids: string[]) => {
    try {
      await Promise.all(
        ids.map((id) =>
          fetch(`/api/admin/identity/sso/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "DISABLED" }),
          })
        )
      )
      toast.success(t("messages.bulkDisabled", { count: ids.length }))
      fetchSSOConfigs()
      setSelectedIds(new Set())
    } catch (error) {
      toast.error(t("errors.bulkDisableFailed"))
    }
  }

  // Define columns for AdminDataTable
  const columns: Column<SSOConfig>[] = [
    {
      id: "organization",
      header: t("columns.organization"),
      cell: (config) => (
        <Link href={`/admin/identity/sso/${config.id}`} className="hover:underline">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="font-medium">
                {config.displayName || config.organization?.name || config.orgId}
              </p>
              {config.organization && (
                <p className="text-xs text-muted-foreground">
                  {config.organization.slug}
                </p>
              )}
            </div>
          </div>
        </Link>
      ),
    },
    {
      id: "provider",
      header: t("columns.provider"),
      cell: (config) => (
        <div className="flex items-center gap-2">
          {getProviderIcon(config.provider)}
          <Badge variant="outline">
            {t(`providers.${config.provider.toLowerCase()}`)}
          </Badge>
        </div>
      ),
    },
    {
      id: "status",
      header: tCommon("status"),
      cell: (config) => getStatusBadge(config.status),
    },
    {
      id: "provisioning",
      header: t("columns.provisioning"),
      cell: (config) => (
        <div className="flex flex-col gap-1">
          <Badge variant={config.jitProvisioning ? "default" : "secondary"} className="text-xs w-fit">
            {t("jit")}: {config.jitProvisioning ? t("on") : t("off")}
          </Badge>
          {config.autoDeactivate && (
            <Badge variant="outline" className="text-xs w-fit">
              {t("autoDeactivate")}
            </Badge>
          )}
        </div>
      ),
    },
    {
      id: "lastSync",
      header: t("columns.lastSync"),
      cell: (config) =>
        config.lastSyncAt ? (
          <span className="flex items-center gap-1 text-sm">
            <Clock className="h-3 w-3" />
            {new Date(config.lastSyncAt).toLocaleDateString()}
          </span>
        ) : (
          <span className="text-muted-foreground text-sm">{t("never")}</span>
        ),
    },
  ]

  // Define row actions
  const rowActions: RowAction<SSOConfig>[] = [
    {
      label: t("actions.activate"),
      icon: <Play className="h-4 w-4" />,
      onClick: handleToggleStatus,
      hidden: (config) => config.status === "ACTIVE",
    },
    {
      label: t("actions.disable"),
      icon: <Pause className="h-4 w-4" />,
      onClick: handleToggleStatus,
      hidden: (config) => config.status !== "ACTIVE",
    },
  ]

  // Define bulk actions
  const bulkActions: BulkAction[] = [
    {
      label: t("actions.enableSelected"),
      icon: <Play className="h-4 w-4" />,
      onClick: handleBulkEnable,
      confirmTitle: t("dialogs.enableConfigs"),
      confirmDescription: t("dialogs.enableConfigsDescription"),
    },
    {
      label: t("actions.disableSelected"),
      icon: <Pause className="h-4 w-4" />,
      onClick: handleBulkDisable,
      confirmTitle: t("dialogs.disableConfigs"),
      confirmDescription: t("dialogs.disableConfigsDescription"),
    },
  ]

  const filteredConfigs = ssoConfigs.filter(
    (config) =>
      config.displayName?.toLowerCase().includes(search.toLowerCase()) ||
      config.organization?.name.toLowerCase().includes(search.toLowerCase()) ||
      config.orgId.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Key className="h-8 w-8 text-primary" />
            {t("title")}
          </h1>
          <p className="text-muted-foreground">
            {t("description")}
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/admin/identity/sso/new">
              <Plus className="h-4 w-4 mr-2" />
              {t("addConfiguration")}
            </Link>
          </Button>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{t("dialogs.createConfig")}</DialogTitle>
              <DialogDescription>
                {t("dialogs.createConfigDescription")}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="orgId">{t("form.organizationId")}</Label>
                <Input
                  id="orgId"
                  placeholder={t("form.organizationIdPlaceholder")}
                  value={newConfig.orgId}
                  onChange={(e) =>
                    setNewConfig({ ...newConfig, orgId: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>{t("form.ssoProvider")}</Label>
                <Select
                  value={newConfig.provider}
                  onValueChange={(value) =>
                    setNewConfig({ ...newConfig, provider: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SSO_PROVIDER_KEYS.map((provider) => (
                      <SelectItem key={provider} value={provider}>
                        {t(`providers.${provider.toLowerCase()}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="displayName">{t("form.displayName")}</Label>
                <Input
                  id="displayName"
                  placeholder={t("form.displayNamePlaceholder")}
                  value={newConfig.displayName}
                  onChange={(e) =>
                    setNewConfig({ ...newConfig, displayName: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>{t("form.defaultRole")}</Label>
                <Select
                  value={newConfig.defaultRole}
                  onValueChange={(value) =>
                    setNewConfig({ ...newConfig, defaultRole: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MEMBER">{t("roles.member")}</SelectItem>
                    <SelectItem value="VIEWER">{t("roles.viewer")}</SelectItem>
                    <SelectItem value="ADMIN">{t("roles.admin")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="jitProvisioning"
                  checked={newConfig.jitProvisioning}
                  onCheckedChange={(checked) =>
                    setNewConfig({ ...newConfig, jitProvisioning: checked })
                  }
                />
                <Label htmlFor="jitProvisioning">{t("form.enableJit")}</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="autoDeactivate"
                  checked={newConfig.autoDeactivate}
                  onCheckedChange={(checked) =>
                    setNewConfig({ ...newConfig, autoDeactivate: checked })
                  }
                />
                <Label htmlFor="autoDeactivate">{t("form.autoDeactivateUsers")}</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                {tCommon("cancel")}
              </Button>
              <Button onClick={handleCreateConfig} disabled={!newConfig.orgId}>
                {t("form.createConfiguration")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{ssoConfigs.length}</div>
            <p className="text-xs text-muted-foreground">{t("stats.totalConfigurations")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-500">
              {ssoConfigs.filter((c) => c.status === "ACTIVE").length}
            </div>
            <p className="text-xs text-muted-foreground">{t("statuses.active")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-500">
              {ssoConfigs.filter((c) => c.status === "CONFIGURING" || c.status === "TESTING").length}
            </div>
            <p className="text-xs text-muted-foreground">{t("stats.inSetup")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-500">
              {ssoConfigs.filter((c) => c.status === "ERROR").length}
            </div>
            <p className="text-xs text-muted-foreground">{t("stats.errors")}</p>
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
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder={tCommon("status")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("filters.allStatus")}</SelectItem>
                {STATUS_KEYS.map((status) => (
                  <SelectItem key={status} value={status}>
                    {t(`statuses.${status.toLowerCase()}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={providerFilter} onValueChange={setProviderFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t("columns.provider")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("filters.allProviders")}</SelectItem>
                {SSO_PROVIDER_KEYS.map((provider) => (
                  <SelectItem key={provider} value={provider}>
                    {t(`providers.${provider.toLowerCase()}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* SSO Configs Table */}
      <AdminDataTable
        data={filteredConfigs}
        columns={columns}
        getRowId={(config) => config.id}
        isLoading={loading}
        emptyMessage={t("noConfigurations")}
        viewHref={(config) => `/admin/identity/sso/${config.id}`}
        onDelete={handleDeleteClick}
        deleteConfirmTitle={t("dialogs.deleteConfig")}
        deleteConfirmDescription={(config) =>
          t("dialogs.deleteConfigDescription", { name: config.displayName || config.organization?.name || config.orgId })
        }
        rowActions={rowActions}
        bulkActions={bulkActions}
        page={pagination.page}
        totalPages={pagination.totalPages}
        total={pagination.total}
        onPageChange={(page) => setPagination({ ...pagination, page })}
        enableSelection={true}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
      />

      <ConfirmationDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title={t("dialogs.deleteConfig")}
        description={t("dialogs.deleteConfigWarning")}
        confirmText={tCommon("delete")}
        variant="destructive"
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}
