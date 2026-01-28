"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
import {
  ArrowLeft,
  FileText,
  Loader2,
  Play,
  Edit,
  Save,
  X,
  Clock,
  Calendar,
  History,
  Settings,
  CheckCircle,
  XCircle,
  AlertCircle,
  Trash2,
} from "lucide-react"
import Link from "next/link"

interface CustomReport {
  id: string
  name: string
  description: string | null
  type: string
  query: Record<string, unknown>
  schedule: string | null
  recipients: string[]
  format: string
  isActive: boolean
  lastRunAt: string | null
  nextRunAt: string | null
  lastResult: Record<string, unknown> | null
  createdBy: string | null
  metadata: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

interface RunHistory {
  id: string
  action: string
  details: Record<string, unknown>
  timestamp: string
}

interface AuditLog {
  id: string
  action: string
  details: Record<string, unknown>
  timestamp: string
}

export default function ReportDetailPage() {
  const params = useParams()
  const router = useRouter()
  const reportId = params.id as string
  const t = useTranslations("admin.analytics.reports.detail")
  const tCommon = useTranslations("admin.analytics.reports")

  const REPORT_TYPES = [
    { value: "USAGE", label: tCommon("types.usage") },
    { value: "REVENUE", label: tCommon("types.revenue") },
    { value: "SECURITY", label: tCommon("types.security") },
    { value: "COMPLIANCE", label: tCommon("types.compliance") },
    { value: "USER_ACTIVITY", label: tCommon("types.userActivity") },
    { value: "CUSTOM_SQL", label: tCommon("types.customSql") },
  ]

  const SCHEDULES = [
    { value: "", label: tCommon("schedules.onDemand") },
    { value: "daily", label: tCommon("schedules.daily") },
    { value: "weekly", label: tCommon("schedules.weekly") },
    { value: "monthly", label: tCommon("schedules.monthly") },
  ]

  const FORMATS = [
    { value: "csv", label: t("formats.csv") },
    { value: "json", label: t("formats.json") },
    { value: "pdf", label: t("formats.pdf") },
    { value: "xlsx", label: t("formats.xlsx") },
  ]

  const [report, setReport] = useState<CustomReport | null>(null)
  const [runHistory, setRunHistory] = useState<RunHistory[]>([])
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRunning, setIsRunning] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    type: "",
    schedule: "",
    format: "",
    isActive: true,
    recipients: [] as string[],
    query: {} as Record<string, unknown>,
  })

  const fetchReport = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/analytics/reports/${reportId}`)
      if (!response.ok) {
        throw new Error(t("errors.fetchFailed"))
      }
      const data = await response.json()
      setReport(data.report)
      setRunHistory(data.runHistory || [])
      setAuditLogs(data.auditLogs || [])

      // Initialize edit form
      setEditForm({
        name: data.report.name,
        description: data.report.description || "",
        type: data.report.type,
        schedule: data.report.schedule || "",
        format: data.report.format,
        isActive: data.report.isActive,
        recipients: data.report.recipients || [],
        query: data.report.query || {},
      })
    } catch (err) {
      console.error("Failed to fetch report:", err)
      setError(err instanceof Error ? err.message : t("errors.fetchFailed"))
    } finally {
      setIsLoading(false)
    }
  }, [reportId, t])

  useEffect(() => {
    fetchReport()
  }, [fetchReport])

  const handleRunReport = async () => {
    setIsRunning(true)
    try {
      const response = await fetch(`/api/admin/analytics/reports/${reportId}/run`, {
        method: "POST",
      })

      if (response.ok) {
        fetchReport()
      }
    } catch (err) {
      console.error("Failed to run report:", err)
    } finally {
      setIsRunning(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    setError(null)

    try {
      const response = await fetch(`/api/admin/analytics/reports/${reportId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || t("errors.updateFailed"))
      }

      setIsEditing(false)
      fetchReport()
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errors.updateFailed"))
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/admin/analytics/reports/${reportId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        router.push("/admin/analytics/reports")
      }
    } catch (err) {
      console.error("Failed to delete report:", err)
    } finally {
      setShowDeleteDialog(false)
    }
  }

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      USAGE: "bg-green-500/10 text-green-500",
      REVENUE: "bg-yellow-500/10 text-yellow-500",
      SECURITY: "bg-red-500/10 text-red-500",
      COMPLIANCE: "bg-purple-500/10 text-purple-500",
      USER_ACTIVITY: "bg-blue-500/10 text-blue-500",
      CUSTOM_SQL: "bg-orange-500/10 text-orange-500",
    }
    return colors[type] || "bg-gray-500/10 text-gray-500"
  }

  const getRunStatusIcon = (action: string) => {
    if (action === "CUSTOM_REPORT_COMPLETED") {
      return <CheckCircle className="h-4 w-4 text-green-500" />
    } else if (action === "CUSTOM_REPORT_FAILED") {
      return <XCircle className="h-4 w-4 text-red-500" />
    }
    return <Clock className="h-4 w-4 text-muted-foreground" />
  }

  const getRunStatusLabel = (action: string) => {
    if (action === "CUSTOM_REPORT_COMPLETED") return t("runStatus.completed")
    if (action === "CUSTOM_REPORT_FAILED") return t("runStatus.failed")
    return t("runStatus.running")
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!report) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t("back")}
        </Button>
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">{t("notFound")}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/admin/analytics/reports">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t("back")}
            </Link>
          </Button>
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              {report.name}
              <Badge className={getTypeColor(report.type)}>{report.type}</Badge>
            </h1>
            {report.description && (
              <p className="text-sm text-muted-foreground">{report.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 mr-4">
            <span className="text-sm text-muted-foreground">{t("status")}:</span>
            <Switch
              checked={report.isActive}
              onCheckedChange={async (checked) => {
                await fetch(`/api/admin/analytics/reports/${reportId}`, {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ isActive: checked }),
                })
                fetchReport()
              }}
            />
            <Badge variant={report.isActive ? "default" : "secondary"}>
              {report.isActive ? t("statusActive") : t("statusInactive")}
            </Badge>
          </div>
          <Button
            variant="outline"
            onClick={handleRunReport}
            disabled={isRunning || !report.isActive}
          >
            {isRunning ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t("running")}
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                {t("runNow")}
              </>
            )}
          </Button>
          <Button
            variant="destructive"
            size="icon"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <ConfirmationDialog
            open={showDeleteDialog}
            onOpenChange={setShowDeleteDialog}
            title={t("deleteDialog.title")}
            description={t("deleteDialog.description")}
            confirmText={t("deleteDialog.confirm")}
            variant="destructive"
            onConfirm={handleDelete}
          />
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 bg-destructive/10 text-destructive rounded-lg">
          <AlertCircle className="h-5 w-5" />
          {error}
        </div>
      )}

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">{t("tabs.overview")}</TabsTrigger>
          <TabsTrigger value="configuration">
            <Settings className="h-4 w-4 mr-2" />
            {t("tabs.configuration")}
          </TabsTrigger>
          <TabsTrigger value="run-history">
            <History className="h-4 w-4 mr-2" />
            {t("tabs.runHistory")}
          </TabsTrigger>
          <TabsTrigger value="last-result">{t("tabs.lastResult")}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{t("overview.schedule")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-lg font-medium">
                    {report.schedule
                      ? SCHEDULES.find(s => s.value === report.schedule)?.label
                      : tCommon("schedules.onDemand")}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{t("overview.lastRun")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-lg font-medium">
                    {report.lastRunAt
                      ? new Date(report.lastRunAt).toLocaleDateString()
                      : t("overview.never")}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{t("overview.nextRun")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-lg font-medium">
                    {report.nextRunAt
                      ? new Date(report.nextRunAt).toLocaleDateString()
                      : t("overview.notScheduled")}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{t("overview.recipients")}</CardTitle>
              </CardHeader>
              <CardContent>
                <span className="text-lg font-medium">
                  {report.recipients.length || 0}
                </span>
              </CardContent>
            </Card>
          </div>

          {/* Report Details */}
          <Card>
            <CardHeader>
              <CardTitle>{t("overview.reportDetails")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">{t("overview.type")}</p>
                  <Badge className={getTypeColor(report.type)}>{report.type}</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("overview.format")}</p>
                  <p className="font-medium">{report.format.toUpperCase()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("overview.created")}</p>
                  <p className="font-medium">{new Date(report.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("overview.lastUpdated")}</p>
                  <p className="font-medium">{new Date(report.updatedAt).toLocaleString()}</p>
                </div>
              </div>

              {report.recipients.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">{t("overview.recipientsList")}</p>
                  <div className="flex flex-wrap gap-2">
                    {report.recipients.map((email) => (
                      <Badge key={email} variant="secondary">{email}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="configuration" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{t("config.title")}</CardTitle>
                  <CardDescription>{t("config.description")}</CardDescription>
                </div>
                {isEditing ? (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsEditing(false)
                        setEditForm({
                          name: report.name,
                          description: report.description || "",
                          type: report.type,
                          schedule: report.schedule || "",
                          format: report.format,
                          isActive: report.isActive,
                          recipients: report.recipients || [],
                          query: report.query || {},
                        })
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <Button size="sm" onClick={handleSave} disabled={isSaving}>
                      {isSaving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                ) : (
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>{t("config.name")}</Label>
                  <Input
                    value={editForm.name}
                    onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("config.type")}</Label>
                  <Select
                    value={editForm.type}
                    onValueChange={(v) => setEditForm(prev => ({ ...prev, type: v }))}
                    disabled={!isEditing}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {REPORT_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t("config.description")}</Label>
                <Textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                  disabled={!isEditing}
                  rows={2}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>{t("config.schedule")}</Label>
                  <Select
                    value={editForm.schedule}
                    onValueChange={(v) => setEditForm(prev => ({ ...prev, schedule: v }))}
                    disabled={!isEditing}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SCHEDULES.map((schedule) => (
                        <SelectItem key={schedule.value} value={schedule.value}>
                          {schedule.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t("config.format")}</Label>
                  <Select
                    value={editForm.format}
                    onValueChange={(v) => setEditForm(prev => ({ ...prev, format: v }))}
                    disabled={!isEditing}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FORMATS.map((format) => (
                        <SelectItem key={format.value} value={format.value}>
                          {format.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {editForm.type !== "CUSTOM_SQL" && (
                <div className="space-y-2">
                  <Label>{t("config.reportPeriod")}</Label>
                  <Input
                    type="number"
                    value={(editForm.query as { days?: number }).days || 30}
                    onChange={(e) => setEditForm(prev => ({
                      ...prev,
                      query: { ...prev.query, days: parseInt(e.target.value) || 30 },
                    }))}
                    disabled={!isEditing}
                    min={1}
                    max={365}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="run-history">
          <Card>
            <CardHeader>
              <CardTitle>{t("history.title")}</CardTitle>
              <CardDescription>{t("history.description")}</CardDescription>
            </CardHeader>
            <CardContent>
              {runHistory.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("history.status")}</TableHead>
                      <TableHead>{t("history.date")}</TableHead>
                      <TableHead>{t("history.details")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {runHistory.map((run) => (
                      <TableRow key={run.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getRunStatusIcon(run.action)}
                            <span className="text-sm">
                              {getRunStatusLabel(run.action)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{new Date(run.timestamp).toLocaleString()}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {run.details && (run.details as { error?: string }).error
                            ? (run.details as { error: string }).error
                            : (run.details as { resultSummary?: { recordCount?: number } })?.resultSummary?.recordCount !== undefined
                            ? t("history.records", { count: (run.details as { resultSummary: { recordCount: number } }).resultSummary.recordCount })
                            : "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  {t("history.noHistory")}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Audit Logs */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>{t("audit.title")}</CardTitle>
              <CardDescription>{t("audit.description")}</CardDescription>
            </CardHeader>
            <CardContent>
              {auditLogs.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("audit.action")}</TableHead>
                      <TableHead>{t("audit.date")}</TableHead>
                      <TableHead>{t("audit.details")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auditLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          <Badge variant="outline">{log.action}</Badge>
                        </TableCell>
                        <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {(log.details as { changes?: string[] })?.changes
                            ? t("audit.changed", { fields: (log.details as { changes: string[] }).changes.join(", ") })
                            : "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  {t("audit.noLogs")}
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="last-result">
          <Card>
            <CardHeader>
              <CardTitle>{t("result.title")}</CardTitle>
              <CardDescription>
                {report.lastRunAt
                  ? t("result.generatedOn", { date: new Date(report.lastRunAt).toLocaleString() })
                  : t("result.noResults")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {report.lastResult ? (
                <div className="space-y-4">
                  {/* Result Summary */}
                  {(report.lastResult as { period?: string }).period && (
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">{t("result.period")}</p>
                      <p className="font-medium">{(report.lastResult as { period: string }).period}</p>
                    </div>
                  )}

                  {/* Metrics */}
                  {(report.lastResult as { metrics?: Record<string, unknown> }).metrics && (
                    <div>
                      <h4 className="font-medium mb-3">{t("result.metrics")}</h4>
                      <div className="grid gap-3 md:grid-cols-3">
                        {Object.entries((report.lastResult as { metrics: Record<string, unknown> }).metrics).map(([key, value]) => (
                          <Card key={key}>
                            <CardContent className="pt-4">
                              <p className="text-sm text-muted-foreground capitalize">
                                {key.replace(/([A-Z])/g, " $1").trim()}
                              </p>
                              <p className="text-xl font-bold">
                                {typeof value === "object"
                                  ? JSON.stringify(value)
                                  : String(value)}
                              </p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Raw Result */}
                  <div>
                    <h4 className="font-medium mb-3">{t("result.rawData")}</h4>
                    <pre className="p-4 bg-muted rounded-lg overflow-auto text-sm">
                      {JSON.stringify(report.lastResult, null, 2)}
                    </pre>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  {t("result.runToSee")}
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
