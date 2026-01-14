"use client"

import { useState, useEffect, useCallback } from "react"
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  FileText,
  Search,
  RefreshCw,
  User,
  Building2,
  Globe,
  Clock,
  Eye,
} from "lucide-react"
import { AdminDataTable, Column, RowAction } from "@/components/admin/data-table"

interface AuditLog {
  id: string
  adminId: string | null
  action: string
  resourceType: string
  resourceId: string | null
  targetOrgId: string | null
  targetUserId: string | null
  details: Record<string, unknown>
  ipAddress: string | null
  userAgent: string | null
  timestamp: string
  admin?: {
    name: string
    email: string
  }
}

const actionColors: Record<string, string> = {
  login: "bg-green-500",
  logout: "bg-slate-500",
  login_failed: "bg-red-500",
  suspend_organization: "bg-red-500",
  lift_suspension: "bg-green-500",
  ban_user: "bg-red-500",
  lift_ban: "bg-green-500",
  impersonate_user: "bg-amber-500",
  create: "bg-blue-500",
  update: "bg-blue-500",
  delete: "bg-red-500",
}

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [actionFilter, setActionFilter] = useState("all")
  const [resourceFilter, setResourceFilter] = useState("all")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)

  const getActionBadge = (action: string) => {
    const color = actionColors[action] || "bg-secondary"
    return (
      <Badge className={`${color} text-white`}>
        {action.replace(/_/g, " ")}
      </Badge>
    )
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString(),
    }
  }

  const fetchLogs = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "50",
        ...(search && { search }),
        ...(actionFilter !== "all" && { action: actionFilter }),
        ...(resourceFilter !== "all" && { resourceType: resourceFilter }),
      })
      const response = await fetch(`/api/admin/audit?${params}`)
      const data = await response.json()
      setLogs(data.logs)
      setTotalPages(data.totalPages)
      setTotal(data.total)
    } catch (error) {
      console.error("Failed to fetch audit logs:", error)
    } finally {
      setIsLoading(false)
    }
  }, [page, search, actionFilter, resourceFilter])

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchLogs()
    }, 300)
    return () => clearTimeout(debounce)
  }, [fetchLogs])

  // Define columns for AdminDataTable
  const columns: Column<AuditLog>[] = [
    {
      id: "timestamp",
      header: "Timestamp",
      cell: (log) => {
        const { date, time } = formatTimestamp(log.timestamp)
        return (
          <div className="flex items-center gap-2">
            <Clock className="h-3 w-3 text-muted-foreground" />
            <div>
              <p className="text-sm">{date}</p>
              <p className="text-xs text-muted-foreground">{time}</p>
            </div>
          </div>
        )
      },
    },
    {
      id: "admin",
      header: "Admin",
      cell: (log) => {
        if (log.admin) {
          return (
            <div className="flex items-center gap-2">
              <User className="h-3 w-3 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{log.admin.name}</p>
                <p className="text-xs text-muted-foreground">{log.admin.email}</p>
              </div>
            </div>
          )
        }
        return <span className="text-muted-foreground">System</span>
      },
    },
    {
      id: "action",
      header: "Action",
      cell: (log) => getActionBadge(log.action),
    },
    {
      id: "resource",
      header: "Resource",
      cell: (log) => <Badge variant="outline">{log.resourceType}</Badge>,
    },
    {
      id: "target",
      header: "Target",
      cell: (log) => (
        <div className="flex flex-col gap-1">
          {log.targetOrgId && (
            <div className="flex items-center gap-1 text-xs">
              <Building2 className="h-3 w-3" />
              <span className="truncate max-w-[100px]">{log.targetOrgId}</span>
            </div>
          )}
          {log.targetUserId && (
            <div className="flex items-center gap-1 text-xs">
              <User className="h-3 w-3" />
              <span className="truncate max-w-[100px]">{log.targetUserId}</span>
            </div>
          )}
          {!log.targetOrgId && !log.targetUserId && (
            <span className="text-muted-foreground">-</span>
          )}
        </div>
      ),
    },
    {
      id: "ipAddress",
      header: "IP Address",
      cell: (log) => {
        if (log.ipAddress) {
          return (
            <div className="flex items-center gap-1 text-xs">
              <Globe className="h-3 w-3 text-muted-foreground" />
              {log.ipAddress}
            </div>
          )
        }
        return <span className="text-muted-foreground">-</span>
      },
    },
  ]

  // Define row actions for AdminDataTable
  const rowActions: RowAction<AuditLog>[] = [
    {
      label: "View Details",
      icon: <Eye className="h-4 w-4" />,
      onClick: (log) => {
        setSelectedLog(log)
        setSheetOpen(true)
      },
    },
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Platform Audit Log</CardTitle>
              <CardDescription>
                Track all administrative actions on the platform ({total} entries)
              </CardDescription>
            </div>
            <Button onClick={fetchLogs} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by admin, action, or resource..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="login">Login</SelectItem>
                <SelectItem value="logout">Logout</SelectItem>
                <SelectItem value="suspend_organization">Suspend Org</SelectItem>
                <SelectItem value="lift_suspension">Lift Suspension</SelectItem>
                <SelectItem value="ban_user">Ban User</SelectItem>
                <SelectItem value="lift_ban">Lift Ban</SelectItem>
                <SelectItem value="impersonate_user">Impersonate</SelectItem>
              </SelectContent>
            </Select>
            <Select value={resourceFilter} onValueChange={setResourceFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Resource" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Resources</SelectItem>
                <SelectItem value="super_admin">Super Admin</SelectItem>
                <SelectItem value="organization">Organization</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="feature_flag">Feature Flag</SelectItem>
                <SelectItem value="system_rule">System Rule</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <AdminDataTable
            data={logs}
            columns={columns}
            getRowId={(log) => log.id}
            isLoading={isLoading}
            emptyMessage="No audit logs found"
            rowActions={rowActions}
            page={page}
            totalPages={totalPages}
            total={total}
            onPageChange={setPage}
            enableSelection={false}
          />
        </CardContent>
      </Card>

      {/* Detail Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent>
          {selectedLog && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Audit Log Details
                </SheetTitle>
                <SheetDescription>
                  {new Date(selectedLog.timestamp).toLocaleString()}
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Action</p>
                    <div className="mt-1">{getActionBadge(selectedLog.action)}</div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Resource Type</p>
                    <Badge variant="outline" className="mt-1">{selectedLog.resourceType}</Badge>
                  </div>
                  {selectedLog.admin && (
                    <>
                      <div>
                        <p className="text-xs text-muted-foreground">Admin Name</p>
                        <p className="mt-1 text-sm font-medium">{selectedLog.admin.name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Admin Email</p>
                        <p className="mt-1 text-sm">{selectedLog.admin.email}</p>
                      </div>
                    </>
                  )}
                  {selectedLog.targetOrgId && (
                    <div>
                      <p className="text-xs text-muted-foreground">Target Organization</p>
                      <p className="mt-1 text-sm font-mono">{selectedLog.targetOrgId}</p>
                    </div>
                  )}
                  {selectedLog.targetUserId && (
                    <div>
                      <p className="text-xs text-muted-foreground">Target User</p>
                      <p className="mt-1 text-sm font-mono">{selectedLog.targetUserId}</p>
                    </div>
                  )}
                  {selectedLog.ipAddress && (
                    <div>
                      <p className="text-xs text-muted-foreground">IP Address</p>
                      <p className="mt-1 text-sm font-mono">{selectedLog.ipAddress}</p>
                    </div>
                  )}
                </div>

                {selectedLog.userAgent && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">User Agent</p>
                    <p className="text-xs font-mono bg-muted p-2 rounded break-all">
                      {selectedLog.userAgent}
                    </p>
                  </div>
                )}

                {Object.keys(selectedLog.details).length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Details</p>
                    <pre className="text-xs font-mono bg-muted p-3 rounded overflow-auto max-h-[300px]">
                      {JSON.stringify(selectedLog.details, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
