"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
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

const REPORT_TYPES = [
  { value: "USAGE", label: "Usage" },
  { value: "REVENUE", label: "Revenue" },
  { value: "SECURITY", label: "Security" },
  { value: "COMPLIANCE", label: "Compliance" },
  { value: "USER_ACTIVITY", label: "User Activity" },
  { value: "CUSTOM_SQL", label: "Custom SQL" },
]

const SCHEDULES = [
  { value: "", label: "On-demand" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
]

const FORMATS = [
  { value: "csv", label: "CSV" },
  { value: "json", label: "JSON" },
  { value: "pdf", label: "PDF" },
  { value: "xlsx", label: "Excel (XLSX)" },
]

export default function ReportDetailPage() {
  const params = useParams()
  const router = useRouter()
  const reportId = params.id as string

  const [report, setReport] = useState<CustomReport | null>(null)
  const [runHistory, setRunHistory] = useState<RunHistory[]>([])
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRunning, setIsRunning] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
        throw new Error("Failed to fetch report")
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
      setError(err instanceof Error ? err.message : "Failed to fetch report")
    } finally {
      setIsLoading(false)
    }
  }, [reportId])

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
        throw new Error(data.error || "Failed to update report")
      }

      setIsEditing(false)
      fetchReport()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update report")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this report?")) return

    try {
      const response = await fetch(`/api/admin/analytics/reports/${reportId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        router.push("/admin/analytics/reports")
      }
    } catch (err) {
      console.error("Failed to delete report:", err)
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
          Back
        </Button>
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Report not found</p>
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
              Back
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
            <span className="text-sm text-muted-foreground">Status:</span>
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
              {report.isActive ? "Active" : "Inactive"}
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
                Running...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Run Now
              </>
            )}
          </Button>
          <Button
            variant="destructive"
            size="icon"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
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
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="configuration">
            <Settings className="h-4 w-4 mr-2" />
            Configuration
          </TabsTrigger>
          <TabsTrigger value="run-history">
            <History className="h-4 w-4 mr-2" />
            Run History
          </TabsTrigger>
          <TabsTrigger value="last-result">Last Result</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-lg font-medium">
                    {report.schedule
                      ? SCHEDULES.find(s => s.value === report.schedule)?.label
                      : "On-demand"}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Last Run</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-lg font-medium">
                    {report.lastRunAt
                      ? new Date(report.lastRunAt).toLocaleDateString()
                      : "Never"}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Next Run</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-lg font-medium">
                    {report.nextRunAt
                      ? new Date(report.nextRunAt).toLocaleDateString()
                      : "Not scheduled"}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Recipients</CardTitle>
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
              <CardTitle>Report Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Type</p>
                  <Badge className={getTypeColor(report.type)}>{report.type}</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Format</p>
                  <p className="font-medium">{report.format.toUpperCase()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p className="font-medium">{new Date(report.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Last Updated</p>
                  <p className="font-medium">{new Date(report.updatedAt).toLocaleString()}</p>
                </div>
              </div>

              {report.recipients.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Recipients</p>
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
                  <CardTitle>Report Configuration</CardTitle>
                  <CardDescription>Edit the report settings</CardDescription>
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
                  <Label>Name</Label>
                  <Input
                    value={editForm.name}
                    onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
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
                <Label>Description</Label>
                <Textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                  disabled={!isEditing}
                  rows={2}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Schedule</Label>
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
                  <Label>Format</Label>
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
                  <Label>Report Period (days)</Label>
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
              <CardTitle>Run History</CardTitle>
              <CardDescription>Previous executions of this report</CardDescription>
            </CardHeader>
            <CardContent>
              {runHistory.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {runHistory.map((run) => (
                      <TableRow key={run.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getRunStatusIcon(run.action)}
                            <span className="text-sm">
                              {run.action === "CUSTOM_REPORT_COMPLETED"
                                ? "Completed"
                                : run.action === "CUSTOM_REPORT_FAILED"
                                ? "Failed"
                                : "Running"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{new Date(run.timestamp).toLocaleString()}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {run.details && (run.details as { error?: string }).error
                            ? (run.details as { error: string }).error
                            : (run.details as { resultSummary?: { recordCount?: number } })?.resultSummary?.recordCount !== undefined
                            ? `${(run.details as { resultSummary: { recordCount: number } }).resultSummary.recordCount} records`
                            : "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  No run history available
                </p>
              )}
            </CardContent>
          </Card>

          {/* Audit Logs */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Audit Logs</CardTitle>
              <CardDescription>Configuration changes</CardDescription>
            </CardHeader>
            <CardContent>
              {auditLogs.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Action</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Details</TableHead>
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
                            ? `Changed: ${(log.details as { changes: string[] }).changes.join(", ")}`
                            : "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  No audit logs available
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="last-result">
          <Card>
            <CardHeader>
              <CardTitle>Last Result</CardTitle>
              <CardDescription>
                {report.lastRunAt
                  ? `Generated on ${new Date(report.lastRunAt).toLocaleString()}`
                  : "No results available"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {report.lastResult ? (
                <div className="space-y-4">
                  {/* Result Summary */}
                  {(report.lastResult as { period?: string }).period && (
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">Period</p>
                      <p className="font-medium">{(report.lastResult as { period: string }).period}</p>
                    </div>
                  )}

                  {/* Metrics */}
                  {(report.lastResult as { metrics?: Record<string, unknown> }).metrics && (
                    <div>
                      <h4 className="font-medium mb-3">Metrics</h4>
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
                    <h4 className="font-medium mb-3">Raw Data</h4>
                    <pre className="p-4 bg-muted rounded-lg overflow-auto text-sm">
                      {JSON.stringify(report.lastResult, null, 2)}
                    </pre>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  Run the report to see results
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
