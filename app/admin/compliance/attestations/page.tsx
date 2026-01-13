"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Search,
  MoreHorizontal,
  Eye,
  Loader2,
  RefreshCw,
  FileText,
  Shield,
  Building2,
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  Clock,
} from "lucide-react"
import Link from "next/link"

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
          window.location.href = "/admin/login"
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

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Organization</TableHead>
                  <TableHead>Framework</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Score</TableHead>
                  <TableHead>Findings</TableHead>
                  <TableHead>Valid Until</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : attestations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No attestations found
                    </TableCell>
                  </TableRow>
                ) : (
                  attestations.map((attestation) => (
                    <TableRow key={attestation.id}>
                      <TableCell>
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
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{attestation.framework.name}</p>
                            <Badge variant="outline" className="text-xs">
                              {attestation.framework.code}
                            </Badge>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(attestation.status)}</TableCell>
                      <TableCell className="text-center">
                        <span className={`font-bold ${getScoreColor(attestation.score)}`}>
                          {attestation.score !== null ? `${attestation.score}%` : "-"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {attestation.findings.length} findings
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {attestation.validUntil
                          ? new Date(attestation.validUntil).toLocaleDateString()
                          : "-"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(attestation.updatedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/compliance/attestations/${attestation.id}`}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/tenants/${attestation.orgId}`}>
                                <Building2 className="h-4 w-4 mr-2" />
                                View Organization
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/compliance/frameworks/${attestation.frameworkId}`}>
                                <Shield className="h-4 w-4 mr-2" />
                                View Framework
                              </Link>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Page {page} of {totalPages} ({total} total)
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
