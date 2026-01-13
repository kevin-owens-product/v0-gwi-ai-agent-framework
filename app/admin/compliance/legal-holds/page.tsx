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
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Search,
  MoreHorizontal,
  Eye,
  Loader2,
  RefreshCw,
  Plus,
  Building2,
  ArrowLeft,
  Gavel,
  Users,
  Download,
  CheckCircle,
  XCircle,
  Calendar,
  AlertTriangle,
} from "lucide-react"
import Link from "next/link"

interface Organization {
  id: string
  name: string
  slug: string
}

interface LegalHold {
  id: string
  name: string
  description: string | null
  caseNumber: string | null
  orgId: string | null
  custodians: string[]
  startDate: string
  endDate: string | null
  status: string
  scope: Record<string, unknown>
  notes: string | null
  createdBy: string
  releasedBy: string | null
  releasedAt: string | null
  createdAt: string
  organization: Organization | null
  exportCount: number
  custodianCount: number
}

const STATUS_OPTIONS = [
  { value: "all", label: "All Status" },
  { value: "ACTIVE", label: "Active" },
  { value: "RELEASED", label: "Released" },
  { value: "EXPIRED", label: "Expired" },
]

export default function LegalHoldsPage() {
  const [legalHolds, setLegalHolds] = useState<LegalHold[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newHold, setNewHold] = useState({
    name: "",
    description: "",
    caseNumber: "",
    startDate: new Date().toISOString().split("T")[0],
  })

  const fetchLegalHolds = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        ...(search && { search }),
        ...(statusFilter !== "all" && { status: statusFilter }),
      })
      const response = await fetch(`/api/admin/compliance/legal-holds?${params}`, {
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
      setLegalHolds(data.legalHolds || [])
      setTotalPages(data.totalPages || 1)
      setTotal(data.total || 0)
    } catch (error) {
      console.error("Failed to fetch legal holds:", error)
      setLegalHolds([])
    } finally {
      setIsLoading(false)
    }
  }, [page, search, statusFilter])

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchLegalHolds()
    }, 300)
    return () => clearTimeout(debounce)
  }, [fetchLegalHolds])

  const handleCreateHold = async () => {
    if (!newHold.name) return
    setIsSubmitting(true)
    try {
      const response = await fetch("/api/admin/compliance/legal-holds", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newHold),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to create legal hold")
      }

      setCreateDialogOpen(false)
      setNewHold({
        name: "",
        description: "",
        caseNumber: "",
        startDate: new Date().toISOString().split("T")[0],
      })
      fetchLegalHolds()
    } catch (error) {
      console.error("Failed to create legal hold:", error)
      alert(error instanceof Error ? error.message : "Failed to create legal hold")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReleaseHold = async (hold: LegalHold) => {
    if (!confirm(`Are you sure you want to release the legal hold "${hold.name}"?`)) return

    try {
      const response = await fetch(`/api/admin/compliance/legal-holds/${hold.id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "RELEASED" }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to release legal hold")
      }

      fetchLegalHolds()
    } catch (error) {
      console.error("Failed to release legal hold:", error)
      alert(error instanceof Error ? error.message : "Failed to release legal hold")
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" />Active</Badge>
      case "RELEASED":
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Released</Badge>
      case "EXPIRED":
        return <Badge variant="secondary">Expired</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
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
                  <Gavel className="h-5 w-5 text-primary" />
                  Legal Holds
                </CardTitle>
                <CardDescription>
                  Manage data preservation orders and legal holds - {total} total
                </CardDescription>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={fetchLegalHolds} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button onClick={() => setCreateDialogOpen(true)} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Create Legal Hold
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name, case number, or description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
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
                  <TableHead>Legal Hold</TableHead>
                  <TableHead>Case Number</TableHead>
                  <TableHead>Organization</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Custodians</TableHead>
                  <TableHead className="text-center">Exports</TableHead>
                  <TableHead>Start Date</TableHead>
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
                ) : legalHolds.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No legal holds found
                    </TableCell>
                  </TableRow>
                ) : (
                  legalHolds.map((hold) => (
                    <TableRow key={hold.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-lg bg-red-500/10 flex items-center justify-center">
                            <Gavel className="h-4 w-4 text-red-500" />
                          </div>
                          <div>
                            <p className="font-medium">{hold.name}</p>
                            {hold.description && (
                              <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                                {hold.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {hold.caseNumber ? (
                          <Badge variant="outline" className="font-mono">
                            {hold.caseNumber}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {hold.organization ? (
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            <span>{hold.organization.name}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Platform-wide</span>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(hold.status)}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Users className="h-3 w-3 text-muted-foreground" />
                          {hold.custodianCount}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Download className="h-3 w-3 text-muted-foreground" />
                          {hold.exportCount}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {new Date(hold.startDate).toLocaleDateString()}
                        </div>
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
                              <Link href={`/admin/compliance/legal-holds/${hold.id}`}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            {hold.organization && (
                              <DropdownMenuItem asChild>
                                <Link href={`/admin/tenants/${hold.orgId}`}>
                                  <Building2 className="h-4 w-4 mr-2" />
                                  View Organization
                                </Link>
                              </DropdownMenuItem>
                            )}
                            {hold.status === "ACTIVE" && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleReleaseHold(hold)}>
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Release Hold
                                </DropdownMenuItem>
                              </>
                            )}
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

      {/* Create Legal Hold Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Legal Hold</DialogTitle>
            <DialogDescription>
              Create a new data preservation order.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Legal Hold Name *</Label>
              <Input
                id="name"
                placeholder="Investigation Q1 2024"
                value={newHold.name}
                onChange={(e) => setNewHold({ ...newHold, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="caseNumber">Case Number</Label>
                <Input
                  id="caseNumber"
                  placeholder="CASE-2024-001"
                  value={newHold.caseNumber}
                  onChange={(e) => setNewHold({ ...newHold, caseNumber: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={newHold.startDate}
                  onChange={(e) => setNewHold({ ...newHold, startDate: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the purpose and scope of this legal hold..."
                value={newHold.description}
                onChange={(e) => setNewHold({ ...newHold, description: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateHold}
              disabled={!newHold.name || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Legal Hold"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
