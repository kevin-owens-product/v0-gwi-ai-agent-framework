"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import {
  Globe,
  Plus,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Trash,
  Shield,
  Building2,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { AdminDataTable, Column, RowAction, BulkAction } from "@/components/admin/data-table"
import Link from "next/link"

interface Domain {
  id: string
  domain: string
  orgId: string
  orgName?: string
  status: string
  verificationMethod: string
  verificationToken: string
  autoJoin: boolean
  ssoEnforced: boolean
  verifiedAt: string | null
  createdAt: string
}

export default function DomainManagementPage() {
  const t = useTranslations("admin.domains")
  const tCommon = useTranslations("common")

  const [domains, setDomains] = useState<Domain[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const [newDomain, setNewDomain] = useState({
    domain: "",
    orgId: "",
    verificationMethod: "DNS_TXT",
    autoJoin: false,
    ssoEnforced: false,
  })

  useEffect(() => {
    fetchDomains()
  }, [statusFilter])

  const fetchDomains = async () => {
    try {
      const params = new URLSearchParams()
      if (statusFilter !== "all") params.set("status", statusFilter)
      if (search) params.set("search", search)

      const response = await fetch(`/api/admin/identity/domains?${params}`)
      const data = await response.json()
      setDomains(data.domains || [])
    } catch (error) {
      console.error("Failed to fetch domains:", error)
      toast.error(t("errors.fetchFailed"))
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyDomain = async (domainId: string) => {
    try {
      const response = await fetch(`/api/admin/identity/domains/${domainId}/verify`, {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error(t("errors.verificationFailed"))
      }

      toast.success(t("messages.verificationInitiated"))
      fetchDomains()
    } catch (error) {
      toast.error(t("errors.verificationFailed"))
    }
  }

  const handleDeleteDomain = async (domain: Domain) => {
    try {
      const response = await fetch(`/api/admin/identity/domains/${domain.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error(t("errors.deleteFailed"))
      }

      toast.success(t("messages.domainDeleted"))
      fetchDomains()
    } catch (error) {
      toast.error(t("errors.deleteFailed"))
    }
  }

  const handleBulkVerify = async (ids: string[]) => {
    try {
      const promises = ids.map((id) =>
        fetch(`/api/admin/identity/domains/${id}/verify`, {
          method: "POST",
        })
      )

      await Promise.all(promises)
      toast.success(t("messages.bulkVerificationInitiated", { count: ids.length }))
      fetchDomains()
    } catch (error) {
      toast.error(t("errors.bulkVerificationFailed"))
    }
  }

  const handleBulkDelete = async (ids: string[]) => {
    try {
      const promises = ids.map((id) =>
        fetch(`/api/admin/identity/domains/${id}`, {
          method: "DELETE",
        })
      )

      await Promise.all(promises)
      toast.success(t("messages.bulkDeleted", { count: ids.length }))
      fetchDomains()
    } catch (error) {
      toast.error(t("errors.bulkDeleteFailed"))
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "VERIFIED":
        return (
          <Badge className="bg-green-500">
            <CheckCircle className="h-3 w-3 mr-1" />
            {t("statuses.verified")}
          </Badge>
        )
      case "PENDING":
        return (
          <Badge variant="secondary">
            <Clock className="h-3 w-3 mr-1" />
            {t("statuses.pending")}
          </Badge>
        )
      case "FAILED":
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            {t("statuses.failed")}
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const filteredDomains = domains.filter(
    (domain) =>
      domain.domain.toLowerCase().includes(search.toLowerCase()) ||
      domain.orgName?.toLowerCase().includes(search.toLowerCase())
  )

  // Column definitions
  const columns: Column<Domain>[] = [
    {
      id: "domain",
      header: t("columns.domain"),
      cell: (domain) => (
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{domain.domain}</span>
        </div>
      ),
    },
    {
      id: "organization",
      header: t("columns.organization"),
      cell: (domain) => (
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <span>{domain.orgName || domain.orgId}</span>
        </div>
      ),
    },
    {
      id: "status",
      header: tCommon("status"),
      cell: (domain) => getStatusBadge(domain.status),
    },
    {
      id: "verificationMethod",
      header: t("columns.verificationMethod"),
      cell: (domain) => (
        <Badge variant="outline">
          {t(`verificationMethods.${domain.verificationMethod.toLowerCase().replace("_", "")}`)}
        </Badge>
      ),
    },
    {
      id: "features",
      header: t("columns.features"),
      cell: (domain) => (
        <div className="flex gap-1">
          {domain.autoJoin && (
            <Badge variant="secondary" className="text-xs">
              {t("features.autoJoin")}
            </Badge>
          )}
          {domain.ssoEnforced && (
            <Badge variant="secondary" className="text-xs">
              <Shield className="h-3 w-3 mr-1" />
              {t("features.sso")}
            </Badge>
          )}
        </div>
      ),
    },
    {
      id: "verified",
      header: t("columns.verified"),
      cell: (domain) =>
        domain.verifiedAt
          ? new Date(domain.verifiedAt).toLocaleDateString()
          : "-",
    },
  ]

  // Row actions
  const rowActions: RowAction<Domain>[] = [
    {
      label: t("actions.verifyNow"),
      icon: <RefreshCw className="h-4 w-4" />,
      onClick: (domain) => handleVerifyDomain(domain.id),
      hidden: (domain) => domain.status !== "PENDING",
    },
  ]

  // Bulk actions
  const bulkActions: BulkAction[] = [
    {
      label: t("actions.verifySelected"),
      icon: <RefreshCw className="h-4 w-4" />,
      onClick: handleBulkVerify,
      confirmTitle: t("dialogs.verifyDomains"),
      confirmDescription: t("dialogs.verifyDomainsDescription"),
    },
    {
      label: t("actions.deleteSelected"),
      icon: <Trash className="h-4 w-4" />,
      onClick: handleBulkDelete,
      variant: "destructive",
      separator: true,
      confirmTitle: t("dialogs.deleteDomains"),
      confirmDescription: t("dialogs.deleteDomainsDescription"),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Globe className="h-8 w-8 text-primary" />
            {t("title")}
          </h1>
          <p className="text-muted-foreground">
            {t("description")}
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/identity/domains/new">
            <Plus className="h-4 w-4 mr-2" />
            {t("addDomain")}
          </Link>
        </Button>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("dialogs.addDomainVerification")}</DialogTitle>
              <DialogDescription>
                {t("dialogs.addDomainVerificationDescription")}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="domain">{t("form.domain")}</Label>
                <Input
                  id="domain"
                  placeholder={t("form.domainPlaceholder")}
                  value={newDomain.domain}
                  onChange={(e) =>
                    setNewDomain({ ...newDomain, domain: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="orgId">{t("form.organizationId")}</Label>
                <Input
                  id="orgId"
                  placeholder={t("form.organizationIdPlaceholder")}
                  value={newDomain.orgId}
                  onChange={(e) =>
                    setNewDomain({ ...newDomain, orgId: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>{t("form.verificationMethod")}</Label>
                <Select
                  value={newDomain.verificationMethod}
                  onValueChange={(value) =>
                    setNewDomain({ ...newDomain, verificationMethod: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DNS_TXT">{t("verificationMethods.dnstxt")}</SelectItem>
                    <SelectItem value="DNS_CNAME">{t("verificationMethods.dnscname")}</SelectItem>
                    <SelectItem value="META_TAG">{t("verificationMethods.metatag")}</SelectItem>
                    <SelectItem value="FILE_UPLOAD">{t("verificationMethods.fileupload")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="autoJoin"
                  checked={newDomain.autoJoin}
                  onCheckedChange={(checked) =>
                    setNewDomain({ ...newDomain, autoJoin: checked })
                  }
                />
                <Label htmlFor="autoJoin">{t("form.autoJoinUsers")}</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="ssoEnforced"
                  checked={newDomain.ssoEnforced}
                  onCheckedChange={(checked) =>
                    setNewDomain({ ...newDomain, ssoEnforced: checked })
                  }
                />
                <Label htmlFor="ssoEnforced">{t("form.enforceSso")}</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                {tCommon("cancel")}
              </Button>
              <Button disabled={!newDomain.domain || !newDomain.orgId}>
                {t("addDomain")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{domains.length}</div>
            <p className="text-xs text-muted-foreground">{t("stats.totalDomains")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-500">
              {domains.filter((d) => d.status === "VERIFIED").length}
            </div>
            <p className="text-xs text-muted-foreground">{t("statuses.verified")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-500">
              {domains.filter((d) => d.status === "PENDING").length}
            </div>
            <p className="text-xs text-muted-foreground">{t("statuses.pending")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-500">
              {domains.filter((d) => d.autoJoin).length}
            </div>
            <p className="text-xs text-muted-foreground">{t("stats.autoJoinEnabled")}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
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
                <SelectValue placeholder={tCommon("status")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("filters.allStatus")}</SelectItem>
                <SelectItem value="VERIFIED">{t("statuses.verified")}</SelectItem>
                <SelectItem value="PENDING">{t("statuses.pending")}</SelectItem>
                <SelectItem value="FAILED">{t("statuses.failed")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Domains Table */}
      <AdminDataTable
        data={filteredDomains}
        columns={columns}
        getRowId={(domain) => domain.id}
        isLoading={loading}
        emptyMessage={t("noDomains")}
        onDelete={handleDeleteDomain}
        deleteConfirmTitle={t("dialogs.deleteDomain")}
        deleteConfirmDescription={(domain) =>
          t("dialogs.deleteDomainDescription", { domain: domain.domain })
        }
        rowActions={rowActions}
        bulkActions={bulkActions}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
      />
    </div>
  )
}
