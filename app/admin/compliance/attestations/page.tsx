"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  RefreshCw,
  FileText,
  Shield,
  Building2,
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  Clock,
  Trash2,
  RotateCcw,
  Play,
} from "lucide-react"
import Link from "next/link"
import { AdminDataTable, Column, RowAction, BulkAction } from "@/components/admin/data-table"

interface Framework {
  id: string
  name: string
  code: string
}

interface Organization {
  id: string
  name: string
  slug: string
}

interface Attestation {
  id: string
  frameworkId: string
  orgId: string
  status: string
  score: number | null
  findings: unknown[]
  evidence: unknown[]
  attestedBy: string | null
  attestedAt: string | null
  validUntil: string | null
  createdAt: string
  updatedAt: string
  framework: Framework
  organization: Organization | null
}

const STATUS_OPTIONS = [
  { value: "all", label: "All Status" },
  { value: "NOT_STARTED", label: "Not Started" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "COMPLIANT", label: "Compliant" },
  { value: "NON_COMPLIANT", label: "Non-Compliant" },
  { value: "EXPIRED", label: "Expired" },
]

export default function AttestationsPage() {
  const [attestations, setAttestations] = useState<Attestation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("all")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const fetchAttestations = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        ...(statusFilter !== "all" && { status: statusFilter }),
      })
      const response = await fetch(`/api/admin/compliance/attestations?${params}`, {
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
      setAttestations(data.attestations || [])
      setTotalPages(data.totalPages || 1)
      setTotal(data.total || 0)
    } catch (error) {
      console.error("Failed to fetch attestations:", error)
      setAttestations([])
    } finally {
      setIsLoading(false)
    }
  }, [page, statusFilter])

  useEffect(() => {
    fetchAttestations()
  }, [fetchAttestations])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLIANT":
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Compliant</Badge>
      case "NON_COMPLIANT":
        return <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" />Non-Compliant</Badge>
      case "IN_PROGRESS":
        return <Badge className="bg-blue-500"><Clock className="h-3 w-3 mr-1" />In Progress</Badge>
      case "NOT_STARTED":
        return <Badge variant="secondary">Not Started</Badge>
      case "EXPIRED":
        return <Badge variant="outline" className="text-orange-500 border-orange-500">Expired</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getScoreColor = (score: number | null) => {
    if (score === null) return "text-muted-foreground"
    if (score >= 90) return "text-green-500"
    if (score >= 70) return "text-yellow-500"
    return "text-red-500"
  }

  // Define columns for AdminDataTable
  const columns: Column<Attestation>[] = [
    {
      id: "organization",
      header: "Organization",
      cell: (attestation) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <Building2 className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="font-medium">
              {attestation.organization?.name || "Unknown Org"}
            </p>
            <p className="text-xs text-muted-foreground">
              {attestation.organization?.slug || attestation.orgId.slice(0, 8)}
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "framework",
      header: "Framework",
      cell: (attestation) => (
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="font-medium">{attestation.framework.name}</p>
            <Badge variant="outline" className="text-xs">
              {attestation.framework.code}
            </Badge>
          </div>
        </div>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: (attestation) => getStatusBadge(attestation.status),
    },
    {
      id: "score",
      header: "Score",
      headerClassName: "text-center",
      className: "text-center",
      cell: (attestation) => (
        <span className={`font-bold ${getScoreColor(attestation.score)}`}>
          {attestation.score !== null ? `${attestation.score}%` : "-"}
        </span>
      ),
    },
    {
      id: "findings",
      header: "Findings",
      cell: (attestation) => (
        <Badge variant="outline">
          {attestation.findings.length} findings
        </Badge>
      ),
    },
    {
      id: "validUntil",
      header: "Valid Until",
      cell: (attestation) => (
        <span className="text-muted-foreground">
          {attestation.validUntil
            ? new Date(attestation.validUntil).toLocaleDateString()
            : "-"}
        </span>
      ),
    },
    {
      id: "updatedAt",
      header: "Updated",
      cell: (attestation) => (
        <span className="text-muted-foreground">
          {new Date(attestation.updatedAt).toLocaleDateString()}
        </span>
      ),
    },
  ]

  // Handle delete attestation
  const handleDeleteAttestation = async (attestation: Attestation) => {
    try {
      const response = await fetch(`/api/admin/compliance/attestations/${attestation.id}`, {
        method: "DELETE",
        credentials: "include",
      })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to delete attestation")
      }
      fetchAttestations()
    } catch (error) {
      console.error("Failed to delete attestation:", error)
      throw error
    }
  }

  // Handle update status
  const handleUpdateStatus = async (attestation: Attestation, status: string) => {
    try {
      const response = await fetch(`/api/admin/compliance/attestations/${attestation.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to update attestation")
      }
      fetchAttestations()
    } catch (error) {
      console.error("Failed to update attestation:", error)
      alert(error instanceof Error ? error.message : "Failed to update attestation")
    }
  }

  // Define row actions
  const rowActions: RowAction<Attestation>[] = [
    {
      label: "Start Assessment",
      icon: <Play className="h-4 w-4" />,
      onClick: (attestation) => handleUpdateStatus(attestation, "IN_PROGRESS"),
      hidden: (attestation) => attestation.status !== "NOT_STARTED",
    },
    {
      label: "Reset to Not Started",
      icon: <RotateCcw className="h-4 w-4" />,
      onClick: (attestation) => handleUpdateStatus(attestation, "NOT_STARTED"),
      hidden: (attestation) => attestation.status === "NOT_STARTED",
    },
    {
      label: "View Organization",
      icon: <Building2 className="h-4 w-4" />,
      href: (attestation) => `/admin/tenants/${attestation.orgId}`,
      separator: true,
    },
    {
      label: "View Framework",
      icon: <Shield className="h-4 w-4" />,
      href: (attestation) => `/admin/compliance/frameworks/${attestation.frameworkId}`,
    },
  ]

  // Bulk actions
  const bulkActions: BulkAction[] = [
    {
      label: "Start Selected",
      icon: <Play className="h-4 w-4" />,
      onClick: async (ids) => {
        const notStarted = attestations.filter((a) => ids.includes(a.id) && a.status === "NOT_STARTED")
        if (notStarted.length === 0) {
          alert("No 'Not Started' attestations selected")
          return
        }
        try {
          await Promise.all(
            notStarted.map((attestation) =>
              fetch(`/api/admin/compliance/attestations/${attestation.id}`, {
                method: "PATCH",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "IN_PROGRESS" }),
              })
            )
          )
          fetchAttestations()
          setSelectedIds(new Set())
        } catch (error) {
          console.error("Failed to start attestations:", error)
        }
      },
      confirmTitle: "Start Assessments",
      confirmDescription: "Are you sure you want to start the selected attestation assessments?",
    },
    {
      label: "Reset Selected",
      icon: <RotateCcw className="h-4 w-4" />,
      onClick: async (ids) => {
        try {
          await Promise.all(
            ids.map((id) =>
              fetch(`/api/admin/compliance/attestations/${id}`, {
                method: "PATCH",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "NOT_STARTED", score: null }),
              })
            )
          )
          fetchAttestations()
          setSelectedIds(new Set())
        } catch (error) {
          console.error("Failed to reset attestations:", error)
        }
      },
      confirmTitle: "Reset Attestations",
      confirmDescription: "Are you sure you want to reset the selected attestations to 'Not Started'? This will clear any progress.",
    },
    {
      separator: true,
      label: "Delete Selected",
      icon: <Trash2 className="h-4 w-4" />,
      onClick: async (ids) => {
        try {
          await Promise.all(
            ids.map((id) =>
              fetch(`/api/admin/compliance/attestations/${id}`, {
                method: "DELETE",
                credentials: "include",
              })
            )
          )
          fetchAttestations()
          setSelectedIds(new Set())
        } catch (error) {
          console.error("Failed to delete attestations:", error)
        }
      },
      variant: "destructive",
      confirmTitle: "Delete Attestations",
      confirmDescription: "Are you sure you want to delete the selected attestations? This action cannot be undone.",
    },
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin/compliance">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Link>
              </Button>
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Compliance Attestations
                </CardTitle>
                <CardDescription>
                  Organization compliance attestations across all frameworks - {total} total
                </CardDescription>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={fetchAttestations} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Data Table */}
          <AdminDataTable
            data={attestations}
            columns={columns}
            getRowId={(attestation) => attestation.id}
            isLoading={isLoading}
            emptyMessage="No attestations found"
            viewHref={(attestation) => `/admin/compliance/attestations/${attestation.id}`}
            rowActions={rowActions}
            bulkActions={bulkActions}
            onDelete={handleDeleteAttestation}
            deleteConfirmTitle="Delete Attestation"
            deleteConfirmDescription={(attestation) =>
              `Are you sure you want to delete the ${attestation.framework.name} attestation for ${attestation.organization?.name || "this organization"}? This action cannot be undone.`
            }
            page={page}
            totalPages={totalPages}
            total={total}
            onPageChange={setPage}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
          />
        </CardContent>
      </Card>
    </div>
  )
}
