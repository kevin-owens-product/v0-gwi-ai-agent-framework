"use client"

import { useEffect, useState } from "react"
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
  DialogTrigger,
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
      toast.error("Failed to fetch domain verifications")
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
        throw new Error("Verification failed")
      }

      toast.success("Domain verification initiated")
      fetchDomains()
    } catch (error) {
      toast.error("Failed to verify domain")
    }
  }

  const handleDeleteDomain = async (domain: Domain) => {
    try {
      const response = await fetch(`/api/admin/identity/domains/${domain.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Delete failed")
      }

      toast.success("Domain deleted successfully")
      fetchDomains()
    } catch (error) {
      toast.error("Failed to delete domain")
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
      toast.success(`Verification initiated for ${ids.length} domain${ids.length !== 1 ? "s" : ""}`)
      fetchDomains()
    } catch (error) {
      toast.error("Failed to verify domains")
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
      toast.success(`Deleted ${ids.length} domain${ids.length !== 1 ? "s" : ""}`)
      fetchDomains()
    } catch (error) {
      toast.error("Failed to delete domains")
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "VERIFIED":
        return (
          <Badge className="bg-green-500">
            <CheckCircle className="h-3 w-3 mr-1" />
            Verified
          </Badge>
        )
      case "PENDING":
        return (
          <Badge variant="secondary">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        )
      case "FAILED":
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Failed
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
      header: "Domain",
      cell: (domain) => (
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{domain.domain}</span>
        </div>
      ),
    },
    {
      id: "organization",
      header: "Organization",
      cell: (domain) => (
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <span>{domain.orgName || domain.orgId}</span>
        </div>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: (domain) => getStatusBadge(domain.status),
    },
    {
      id: "verificationMethod",
      header: "Verification Method",
      cell: (domain) => (
        <Badge variant="outline">
          {domain.verificationMethod.replace("_", " ")}
        </Badge>
      ),
    },
    {
      id: "features",
      header: "Features",
      cell: (domain) => (
        <div className="flex gap-1">
          {domain.autoJoin && (
            <Badge variant="secondary" className="text-xs">
              Auto-Join
            </Badge>
          )}
          {domain.ssoEnforced && (
            <Badge variant="secondary" className="text-xs">
              <Shield className="h-3 w-3 mr-1" />
              SSO
            </Badge>
          )}
        </div>
      ),
    },
    {
      id: "verified",
      header: "Verified",
      cell: (domain) =>
        domain.verifiedAt
          ? new Date(domain.verifiedAt).toLocaleDateString()
          : "-",
    },
  ]

  // Row actions
  const rowActions: RowAction<Domain>[] = [
    {
      label: "Verify Now",
      icon: <RefreshCw className="h-4 w-4" />,
      onClick: (domain) => handleVerifyDomain(domain.id),
      hidden: (domain) => domain.status !== "PENDING",
    },
  ]

  // Bulk actions
  const bulkActions: BulkAction[] = [
    {
      label: "Verify Selected",
      icon: <RefreshCw className="h-4 w-4" />,
      onClick: handleBulkVerify,
      confirmTitle: "Verify Domains",
      confirmDescription: "Are you sure you want to initiate verification for the selected domains?",
    },
    {
      label: "Delete Selected",
      icon: <Trash className="h-4 w-4" />,
      onClick: handleBulkDelete,
      variant: "destructive",
      separator: true,
      confirmTitle: "Delete Domains",
      confirmDescription: "Are you sure you want to delete the selected domains? This action cannot be undone.",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Globe className="h-8 w-8 text-primary" />
            Domain Management
          </h1>
          <p className="text-muted-foreground">
            Verify and manage organization domains for SSO and auto-provisioning
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/identity/domains/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Domain
          </Link>
        </Button>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Domain Verification</DialogTitle>
              <DialogDescription>
                Add a domain to verify ownership for an organization
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="domain">Domain</Label>
                <Input
                  id="domain"
                  placeholder="example.com"
                  value={newDomain.domain}
                  onChange={(e) =>
                    setNewDomain({ ...newDomain, domain: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="orgId">Organization ID</Label>
                <Input
                  id="orgId"
                  placeholder="Organization ID"
                  value={newDomain.orgId}
                  onChange={(e) =>
                    setNewDomain({ ...newDomain, orgId: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>Verification Method</Label>
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
                    <SelectItem value="DNS_TXT">DNS TXT Record</SelectItem>
                    <SelectItem value="DNS_CNAME">DNS CNAME Record</SelectItem>
                    <SelectItem value="META_TAG">Meta Tag</SelectItem>
                    <SelectItem value="FILE_UPLOAD">File Upload</SelectItem>
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
                <Label htmlFor="autoJoin">Auto-join users with this domain</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="ssoEnforced"
                  checked={newDomain.ssoEnforced}
                  onCheckedChange={(checked) =>
                    setNewDomain({ ...newDomain, ssoEnforced: checked })
                  }
                />
                <Label htmlFor="ssoEnforced">Enforce SSO for this domain</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button disabled={!newDomain.domain || !newDomain.orgId}>
                Add Domain
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
            <p className="text-xs text-muted-foreground">Total Domains</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-500">
              {domains.filter((d) => d.status === "VERIFIED").length}
            </div>
            <p className="text-xs text-muted-foreground">Verified</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-500">
              {domains.filter((d) => d.status === "PENDING").length}
            </div>
            <p className="text-xs text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-500">
              {domains.filter((d) => d.autoJoin).length}
            </div>
            <p className="text-xs text-muted-foreground">Auto-Join Enabled</p>
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
                  placeholder="Search domains..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="VERIFIED">Verified</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="FAILED">Failed</SelectItem>
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
        emptyMessage={
          <div className="text-center py-12">
            <Globe className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No domains found</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => setIsCreateOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add First Domain
            </Button>
          </div>
        }
        onDelete={handleDeleteDomain}
        deleteConfirmTitle="Delete Domain"
        deleteConfirmDescription={(domain) =>
          `Are you sure you want to delete the domain "${domain.domain}"? This action cannot be undone.`
        }
        rowActions={rowActions}
        bulkActions={bulkActions}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
      />
    </div>
  )
}
