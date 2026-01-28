"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import {
  Ban,
  Plus,
  Search,
  Filter,
  Globe,
  Clock,
  Trash,
  Power,
  PowerOff,
  Calendar,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
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
import { showErrorToast, showSuccessToast } from "@/lib/toast-utils"
import { AdminDataTable, Column, RowAction, BulkAction } from "@/components/admin/data-table"

interface IPBlocklistEntry {
  id: string
  ipAddress: string
  ipRange: string | null
  type: string
  reason: string
  orgId: string | null
  blockedBy: string | null
  expiresAt: string | null
  isActive: boolean
  metadata: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

export default function IPBlocklistPage() {
  const t = useTranslations("admin.security.ipBlocklist")
  const tCommon = useTranslations("common")

  const blockTypes = [
    { value: "MANUAL", label: t("types.manual") },
    { value: "AUTOMATIC", label: t("types.automatic") },
    { value: "THREAT_INTEL", label: t("types.threatIntel") },
    { value: "BRUTE_FORCE", label: t("types.bruteForce") },
    { value: "GEOGRAPHIC", label: t("types.geographic") },
  ]
  const [blocklist, setBlocklist] = useState<IPBlocklistEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [activeFilter, setActiveFilter] = useState("all")
  const [sortBy] = useState("createdAt")
  const [sortOrder] = useState("desc")
  const [stats, setStats] = useState<Record<string, number>>({})
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 20,
    offset: 0,
    hasMore: false,
    page: 1,
    totalPages: 1,
  })

  const [newEntry, setNewEntry] = useState({
    ipAddress: "",
    ipRange: "",
    type: "MANUAL",
    reason: "",
    expiresAt: "",
    isActive: true,
  })

  useEffect(() => {
    fetchBlocklist()
  }, [typeFilter, activeFilter, sortBy, sortOrder, pagination.page])

  const fetchBlocklist = async () => {
    try {
      setLoading(true)
      const offset = (pagination.page - 1) * pagination.limit
      const params = new URLSearchParams()
      if (typeFilter !== "all") params.set("type", typeFilter)
      if (activeFilter !== "all") params.set("isActive", activeFilter)
      if (search) params.set("search", search)
      params.set("sortBy", sortBy)
      params.set("sortOrder", sortOrder)
      params.set("limit", pagination.limit.toString())
      params.set("offset", offset.toString())
      params.set("includeExpired", "true")

      const response = await fetch(`/api/admin/security/ip-blocklist?${params}`)
      const data = await response.json()
      setBlocklist(data.blocklist || [])
      setStats(data.stats || {})
      const total = data.pagination?.total || 0
      const totalPages = Math.ceil(total / pagination.limit)
      setPagination((prev) => ({
        ...prev,
        total,
        hasMore: data.pagination?.hasMore || false,
        totalPages,
        offset,
      }))
    } catch (error) {
      console.error("Failed to fetch blocklist:", error)
      showErrorToast(t("toast.fetchError"))
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, page: 1, offset: 0 }))
    fetchBlocklist()
  }

  const handleCreateEntry = async () => {
    try {
      const response = await fetch("/api/admin/security/ip-blocklist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newEntry,
          ipRange: newEntry.ipRange || undefined,
          expiresAt: newEntry.expiresAt || undefined,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to create entry")
      }

      showSuccessToast(t("toast.addSuccess"))
      setIsCreateOpen(false)
      setNewEntry({
        ipAddress: "",
        ipRange: "",
        type: "MANUAL",
        reason: "",
        expiresAt: "",
        isActive: true,
      })
      fetchBlocklist()
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : t("toast.addError")
      showErrorToast(message)
    }
  }

  const handleToggleEntry = async (entry: IPBlocklistEntry) => {
    try {
      const response = await fetch(`/api/admin/security/ip-blocklist/${entry.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !entry.isActive }),
      })

      if (!response.ok) {
        throw new Error("Failed to update entry")
      }

      showSuccessToast(entry.isActive ? t("toast.disableSuccess") : t("toast.enableSuccess"))
      fetchBlocklist()
    } catch (error) {
      showErrorToast(t("toast.updateError"))
    }
  }

  const handleDeleteEntry = async (entry: IPBlocklistEntry) => {
    try {
      const response = await fetch(`/api/admin/security/ip-blocklist/${entry.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete entry")
      }

      showSuccessToast(t("toast.removeSuccess"))
      fetchBlocklist()
    } catch (error) {
      showErrorToast(t("toast.removeError"))
    }
  }

  const handleBulkDelete = async (ids: string[]) => {
    try {
      await Promise.all(
        ids.map((id) =>
          fetch(`/api/admin/security/ip-blocklist/${id}`, {
            method: "DELETE",
          })
        )
      )
      showSuccessToast(t("toast.bulkRemoveSuccess", { count: ids.length }))
      fetchBlocklist()
    } catch (error) {
      showErrorToast(t("toast.bulkRemoveError"))
    }
  }

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }))
  }

  // handleSort function removed - unused

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "MANUAL":
        return <Badge variant="outline">{t(`types.${type.toLowerCase()}`)}</Badge>
      case "AUTOMATIC":
        return <Badge variant="default">{t(`types.${type.toLowerCase()}`)}</Badge>
      case "THREAT_INTEL":
        return <Badge variant="destructive">{t("types.threatIntelShort")}</Badge>
      case "BRUTE_FORCE":
        return <Badge variant="destructive">{t(`types.${type.toLowerCase()}`)}</Badge>
      case "GEOGRAPHIC":
        return <Badge variant="secondary">{t(`types.${type.toLowerCase()}`)}</Badge>
      default:
        return <Badge variant="outline">{t(`types.${type.toLowerCase()}`, { defaultValue: type })}</Badge>
    }
  }

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false
    return new Date(expiresAt) < new Date()
  }

  const filteredBlocklist = blocklist.filter(
    (entry) =>
      entry.ipAddress?.toLowerCase().includes(search.toLowerCase()) ||
      entry.reason?.toLowerCase().includes(search.toLowerCase())
  )

  const totalActive = Object.values(stats).reduce((a, b) => a + b, 0)

  // Define columns for AdminDataTable
  const columns: Column<IPBlocklistEntry>[] = [
    {
      id: "ipAddress",
      header: (
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4" />
          {t("table.ipAddress")}
        </div>
      ),
      cell: (entry) => <code className="font-mono text-sm">{entry.ipAddress}</code>,
    },
    {
      id: "ipRange",
      header: t("table.range"),
      cell: (entry) =>
        entry.ipRange ? (
          <code className="font-mono text-sm text-muted-foreground">{entry.ipRange}</code>
        ) : (
          <span className="text-muted-foreground">-</span>
        ),
    },
    {
      id: "type",
      header: t("table.type"),
      cell: (entry) => getTypeBadge(entry.type),
    },
    {
      id: "reason",
      header: t("table.reason"),
      cell: (entry) => <p className="truncate max-w-[200px]">{entry.reason}</p>,
    },
    {
      id: "status",
      header: t("table.status"),
      cell: (entry) => {
        if (!entry.isActive) {
          return <Badge variant="outline">{t("status.disabled")}</Badge>
        } else if (isExpired(entry.expiresAt)) {
          return <Badge variant="secondary">{t("status.expired")}</Badge>
        } else {
          return (
            <Badge variant="default" className="bg-green-500">
              {t("status.active")}
            </Badge>
          )
        }
      },
    },
    {
      id: "expiresAt",
      header: t("table.expires"),
      cell: (entry) =>
        entry.expiresAt ? (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {new Date(entry.expiresAt).toLocaleDateString()}
          </div>
        ) : (
          <span className="text-muted-foreground">{t("expiresNever")}</span>
        ),
    },
    {
      id: "createdAt",
      header: t("table.blockedAt"),
      cell: (entry) => (
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Clock className="h-3 w-3" />
          {new Date(entry.createdAt).toLocaleDateString()}
        </div>
      ),
    },
  ]

  // Define row actions
  const rowActions: RowAction<IPBlocklistEntry>[] = [
    {
      label: t("actions.disable"),
      icon: <PowerOff className="h-4 w-4" />,
      onClick: handleToggleEntry,
      hidden: (entry) => !entry.isActive,
    },
    {
      label: t("actions.enable"),
      icon: <Power className="h-4 w-4" />,
      onClick: handleToggleEntry,
      hidden: (entry) => entry.isActive,
    },
  ]

  // Define bulk actions
  const bulkActions: BulkAction[] = [
    {
      label: t("actions.removeSelected"),
      icon: <Trash className="h-4 w-4" />,
      onClick: handleBulkDelete,
      variant: "destructive",
      confirmTitle: t("confirmations.bulkRemoveTitle"),
      confirmDescription: t("confirmations.bulkRemoveDescription"),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Ban className="h-8 w-8 text-destructive" />
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
              {t("blockIp")}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{t("dialog.addTitle")}</DialogTitle>
              <DialogDescription>
                {t("dialog.addDescription")}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="ipAddress">{t("form.ipAddress")} *</Label>
                <Input
                  id="ipAddress"
                  placeholder={t("form.ipAddressPlaceholder")}
                  value={newEntry.ipAddress}
                  onChange={(e) =>
                    setNewEntry({ ...newEntry, ipAddress: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="ipRange">{t("form.ipRange")}</Label>
                <Input
                  id="ipRange"
                  placeholder={t("form.ipRangePlaceholder")}
                  value={newEntry.ipRange}
                  onChange={(e) =>
                    setNewEntry({ ...newEntry, ipRange: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>{t("form.blockType")}</Label>
                <Select
                  value={newEntry.type}
                  onValueChange={(value) =>
                    setNewEntry({ ...newEntry, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {blockTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="reason">{t("form.reason")} *</Label>
                <Textarea
                  id="reason"
                  placeholder={t("form.reasonPlaceholder")}
                  value={newEntry.reason}
                  onChange={(e) =>
                    setNewEntry({ ...newEntry, reason: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="expiresAt">{t("form.expiresAt")}</Label>
                <Input
                  id="expiresAt"
                  type="datetime-local"
                  value={newEntry.expiresAt}
                  onChange={(e) =>
                    setNewEntry({ ...newEntry, expiresAt: e.target.value })
                  }
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="isActive"
                  checked={newEntry.isActive}
                  onCheckedChange={(checked) =>
                    setNewEntry({ ...newEntry, isActive: checked })
                  }
                />
                <Label htmlFor="isActive">{t("form.blockImmediately")}</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                {tCommon("cancel")}
              </Button>
              <Button
                onClick={handleCreateEntry}
                disabled={!newEntry.ipAddress || !newEntry.reason}
              >
                {t("addToBlocklist")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{pagination.total}</div>
            <p className="text-xs text-muted-foreground">{t("stats.totalEntries")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-500">{totalActive}</div>
            <p className="text-xs text-muted-foreground">{t("stats.activeBlocks")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-500">{stats.MANUAL || 0}</div>
            <p className="text-xs text-muted-foreground">{t("types.manual")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-orange-500">{stats.AUTOMATIC || 0}</div>
            <p className="text-xs text-muted-foreground">{t("types.automatic")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-500">{stats.BRUTE_FORCE || 0}</div>
            <p className="text-xs text-muted-foreground">{t("types.bruteForce")}</p>
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
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder={t("filters.type")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("filters.allTypes")}</SelectItem>
                {blockTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={activeFilter} onValueChange={setActiveFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder={t("filters.status")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("filters.all")}</SelectItem>
                <SelectItem value="true">{t("filters.activeOnly")}</SelectItem>
                <SelectItem value="false">{t("filters.inactiveOnly")}</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleSearch}>
              {tCommon("search")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Blocklist Table */}
      <AdminDataTable
        data={filteredBlocklist}
        columns={columns}
        getRowId={(entry) => entry.id}
        isLoading={loading}
        emptyMessage={t("noBlockedIps")}
        onDelete={handleDeleteEntry}
        deleteConfirmTitle={t("confirmations.removeTitle")}
        deleteConfirmDescription={(entry) =>
          t("confirmations.removeDescription", { ipAddress: entry.ipAddress })
        }
        rowActions={rowActions}
        bulkActions={bulkActions}
        page={pagination.page}
        totalPages={pagination.totalPages}
        total={pagination.total}
        onPageChange={handlePageChange}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
      />
    </div>
  )
}
