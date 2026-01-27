"use client"

import { useState, useEffect, useCallback } from "react"
import { useTranslations } from "next-intl"
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
  const t = useTranslations("admin.audit")
  const tCommon = useTranslations("common")
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
      header: t("timestamp"),
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
      header: t("admin"),
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
        return <span className="text-muted-foreground">{t("system")}</span>
      },
    },
    {
      id: "action",
      header: t("action"),
      cell: (log) => getActionBadge(log.action),
    },
    {
      id: "resource",
      header: t("resource"),
      cell: (log) => <Badge variant="outline">{log.resourceType}</Badge>,
    },
    {
      id: "target",
      header: t("target"),
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
      header: t("ipAddress"),
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
      label: tCommon("viewDetails"),
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
              <CardTitle>{t("title")}</CardTitle>
              <CardDescription>
                {t("description", { count: total })}
              </CardDescription>
            </div>
            <Button onClick={fetchLogs} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              {tCommon("refresh")}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t("searchPlaceholder")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t("action")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("allActions")}</SelectItem>
                <SelectItem value="login">{t("actions.login")}</SelectItem>
                <SelectItem value="logout">{t("actions.logout")}</SelectItem>
                <SelectItem value="suspend_organization">{t("actions.suspendOrg")}</SelectItem>
                <SelectItem value="lift_suspension">{t("actions.liftSuspension")}</SelectItem>
                <SelectItem value="ban_user">{t("actions.banUser")}</SelectItem>
                <SelectItem value="lift_ban">{t("actions.liftBan")}</SelectItem>
                <SelectItem value="impersonate_user">{t("actions.impersonate")}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={resourceFilter} onValueChange={setResourceFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t("resource")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("allResources")}</SelectItem>
                <SelectItem value="super_admin">{t("resources.superAdmin")}</SelectItem>
                <SelectItem value="organization">{t("resources.organization")}</SelectItem>
                <SelectItem value="user">{t("resources.user")}</SelectItem>
                <SelectItem value="feature_flag">{t("resources.featureFlag")}</SelectItem>
                <SelectItem value="system_rule">{t("resources.systemRule")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <AdminDataTable
            data={logs}
            columns={columns}
            getRowId={(log) => log.id}
            isLoading={isLoading}
            emptyMessage={t("noLogs")}
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
                  {t("logDetails")}
                </SheetTitle>
                <SheetDescription>
                  {new Date(selectedLog.timestamp).toLocaleString()}
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">{t("action")}</p>
                    <div className="mt-1">{getActionBadge(selectedLog.action)}</div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t("resourceType")}</p>
                    <Badge variant="outline" className="mt-1">{selectedLog.resourceType}</Badge>
                  </div>
                  {selectedLog.admin && (
                    <>
                      <div>
                        <p className="text-xs text-muted-foreground">{t("adminName")}</p>
                        <p className="mt-1 text-sm font-medium">{selectedLog.admin.name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">{t("adminEmail")}</p>
                        <p className="mt-1 text-sm">{selectedLog.admin.email}</p>
                      </div>
                    </>
                  )}
                  {selectedLog.targetOrgId && (
                    <div>
                      <p className="text-xs text-muted-foreground">{t("targetOrganization")}</p>
                      <p className="mt-1 text-sm font-mono">{selectedLog.targetOrgId}</p>
                    </div>
                  )}
                  {selectedLog.targetUserId && (
                    <div>
                      <p className="text-xs text-muted-foreground">{t("targetUser")}</p>
                      <p className="mt-1 text-sm font-mono">{selectedLog.targetUserId}</p>
                    </div>
                  )}
                  {selectedLog.ipAddress && (
                    <div>
                      <p className="text-xs text-muted-foreground">{t("ipAddress")}</p>
                      <p className="mt-1 text-sm font-mono">{selectedLog.ipAddress}</p>
                    </div>
                  )}
                </div>

                {selectedLog.userAgent && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">{t("userAgent")}</p>
                    <p className="text-xs font-mono bg-muted p-2 rounded break-all">
                      {selectedLog.userAgent}
                    </p>
                  </div>
                )}

                {Object.keys(selectedLog.details).length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">{t("details")}</p>
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
