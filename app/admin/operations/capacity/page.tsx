"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import {
  Server,
  HardDrive,
  Cpu,
  Database,
  Activity,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Plus,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { showErrorToast, showSuccessToast } from "@/lib/toast-utils"

interface CapacityMetric {
  id: string
  metricType: string
  service: string | null
  region: string | null
  currentValue: number
  maxValue: number
  threshold: number
  unit: string
  status: string
  trend: string | null
  forecast: Record<string, number> | null
  recordedAt: string
}

interface Summary {
  healthScore: number
  statusCounts: {
    normal: number
    warning: number
    critical: number
    total: number
  }
}

interface Filters {
  metricTypes: string[]
  regions: string[]
  services: string[]
}

const metricTypeIcons: Record<string, React.ReactNode> = {
  CPU: <Cpu className="h-4 w-4" />,
  MEMORY: <Activity className="h-4 w-4" />,
  STORAGE: <HardDrive className="h-4 w-4" />,
  CONNECTIONS: <Database className="h-4 w-4" />,
  QUEUE_DEPTH: <Server className="h-4 w-4" />,
}

const getTrendIcon = (trend: string | null) => {
  switch (trend) {
    case "INCREASING":
      return <TrendingUp className="h-4 w-4 text-yellow-500" />
    case "DECREASING":
      return <TrendingDown className="h-4 w-4 text-green-500" />
    default:
      return <Minus className="h-4 w-4 text-muted-foreground" />
  }
}

export default function CapacityPage() {
  const t = useTranslations("admin.operations.capacity")
  const tCommon = useTranslations("common")
  const [metrics, setMetrics] = useState<CapacityMetric[]>([])
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "CRITICAL":
      case "OVER_CAPACITY":
        return <Badge variant="destructive">{t(`status.${status.toLowerCase().replace("_", "")}`) || status}</Badge>
      case "WARNING":
        return <Badge className="bg-yellow-500">{t("status.warning")}</Badge>
      default:
        return <Badge className="bg-green-500">{t("status.normal")}</Badge>
    }
  }
  const [summary, setSummary] = useState<Summary | null>(null)
  const [filters, setFilters] = useState<Filters | null>(null)
  const [loading, setLoading] = useState(true)
  const [metricTypeFilter, setMetricTypeFilter] = useState("all")
  const [regionFilter, setRegionFilter] = useState("all")
  const [serviceFilter, setServiceFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const [newMetric, setNewMetric] = useState({
    metricType: "CPU",
    service: "",
    region: "",
    currentValue: 0,
    maxValue: 100,
    threshold: 80,
    unit: "percent",
  })

  useEffect(() => {
    fetchMetrics()
  }, [metricTypeFilter, regionFilter, serviceFilter, statusFilter])

  const fetchMetrics = async () => {
    try {
      const params = new URLSearchParams()
      if (metricTypeFilter !== "all") params.set("metricType", metricTypeFilter)
      if (regionFilter !== "all") params.set("region", regionFilter)
      if (serviceFilter !== "all") params.set("service", serviceFilter)
      if (statusFilter !== "all") params.set("status", statusFilter)

      const response = await fetch(`/api/admin/operations/capacity?${params}`)
      const data = await response.json()
      setMetrics(data.metrics || [])
      setSummary(data.summary || null)
      setFilters(data.filters || null)
    } catch (error) {
      console.error("Failed to fetch capacity metrics:", error)
      showErrorToast(t("errors.createFailed"))
    } finally {
      setLoading(false)
    }
  }

  const handleCreateMetric = async () => {
    try {
      const response = await fetch("/api/admin/operations/capacity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newMetric,
          service: newMetric.service || null,
          region: newMetric.region || null,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create metric")
      }

      showSuccessToast(tCommon("success"))
      setIsCreateOpen(false)
      setNewMetric({
        metricType: "CPU",
        service: "",
        region: "",
        currentValue: 0,
        maxValue: 100,
        threshold: 80,
        unit: "percent",
      })
      fetchMetrics()
    } catch (error) {
      showErrorToast(t("errors.createFailed"))
    }
  }

  const getUsagePercent = (current: number, max: number) => {
    return Math.min((current / max) * 100, 100)
  }

  // getUsageColor function removed - unused

  const formatValue = (value: number, unit: string) => {
    if (unit === "percent") return `${value.toFixed(1)}%`
    if (unit === "TB") return `${value.toFixed(2)} TB`
    if (unit === "GB") return `${value.toFixed(0)} GB`
    if (unit === "connections") return `${value.toLocaleString()}`
    if (unit === "messages") return `${value.toLocaleString()}`
    return value.toFixed(2)
  }

  // Group metrics by service for overview
  const serviceMetrics = metrics.reduce((acc, metric) => {
    const service = metric.service || "Platform"
    if (!acc[service]) {
      acc[service] = []
    }
    acc[service].push(metric)
    return acc
  }, {} as Record<string, CapacityMetric[]>)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Server className="h-8 w-8 text-primary" />
            {t("title")}
          </h1>
          <p className="text-muted-foreground">
            {t("description")}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchMetrics} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            {tCommon("refresh")}
          </Button>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                {t("createMetric")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("dialog.createTitle")}</DialogTitle>
                <DialogDescription>
                  {t("dialog.createDescription")}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t("fields.metricType")}</Label>
                    <Select
                      value={newMetric.metricType}
                      onValueChange={(v) => setNewMetric({ ...newMetric, metricType: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CPU">{t("metricTypes.cpu")}</SelectItem>
                        <SelectItem value="MEMORY">{t("metricTypes.memory")}</SelectItem>
                        <SelectItem value="STORAGE">{t("metricTypes.storage")}</SelectItem>
                        <SelectItem value="CONNECTIONS">{t("metricTypes.connections")}</SelectItem>
                        <SelectItem value="QUEUE_DEPTH">{t("metricTypes.queueDepth")}</SelectItem>
                        <SelectItem value="BANDWIDTH">{t("metricTypes.bandwidth")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{tCommon("unit")}</Label>
                    <Select
                      value={newMetric.unit}
                      onValueChange={(v) => setNewMetric({ ...newMetric, unit: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percent">{t("units.percent")}</SelectItem>
                        <SelectItem value="GB">{t("units.gb")}</SelectItem>
                        <SelectItem value="TB">{t("units.tb")}</SelectItem>
                        <SelectItem value="connections">{t("units.connections")}</SelectItem>
                        <SelectItem value="messages">{t("units.messages")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t("fields.service")}</Label>
                    <Input
                      placeholder={t("placeholders.serviceExample")}
                      value={newMetric.service}
                      onChange={(e) => setNewMetric({ ...newMetric, service: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("fields.region")}</Label>
                    <Input
                      placeholder={t("placeholders.regionExample")}
                      value={newMetric.region}
                      onChange={(e) => setNewMetric({ ...newMetric, region: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>{t("fields.currentValue")}</Label>
                    <Input
                      type="number"
                      value={newMetric.currentValue}
                      onChange={(e) => setNewMetric({ ...newMetric, currentValue: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("fields.maxValue")}</Label>
                    <Input
                      type="number"
                      value={newMetric.maxValue}
                      onChange={(e) => setNewMetric({ ...newMetric, maxValue: parseFloat(e.target.value) || 100 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("fields.threshold")} (%)</Label>
                    <Input
                      type="number"
                      value={newMetric.threshold}
                      onChange={(e) => setNewMetric({ ...newMetric, threshold: parseFloat(e.target.value) || 80 })}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  {tCommon("cancel")}
                </Button>
                <Button onClick={handleCreateMetric}>{t("createMetric")}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">{summary.healthScore}%</div>
                  <p className="text-xs text-muted-foreground">{t("healthScore")}</p>
                </div>
                {summary.healthScore >= 80 ? (
                  <CheckCircle className="h-8 w-8 text-green-500" />
                ) : summary.healthScore >= 60 ? (
                  <AlertTriangle className="h-8 w-8 text-yellow-500" />
                ) : (
                  <AlertTriangle className="h-8 w-8 text-red-500" />
                )}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-500">{summary.statusCounts.normal}</div>
              <p className="text-xs text-muted-foreground">{t("statusCounts.normal")}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-yellow-500">{summary.statusCounts.warning}</div>
              <p className="text-xs text-muted-foreground">{t("statusCounts.warning")}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-red-500">{summary.statusCounts.critical}</div>
              <p className="text-xs text-muted-foreground">{t("statusCounts.critical")}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 flex-wrap">
            <Select value={metricTypeFilter} onValueChange={setMetricTypeFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder={t("filters.metricType")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("filters.all")}</SelectItem>
                {filters?.metricTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={regionFilter} onValueChange={setRegionFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder={t("filters.region")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("filters.all")}</SelectItem>
                {filters?.regions.map((region) => (
                  <SelectItem key={region} value={region}>
                    {region}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={serviceFilter} onValueChange={setServiceFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t("filters.service")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("filters.all")}</SelectItem>
                {filters?.services.map((service) => (
                  <SelectItem key={service} value={service}>
                    {service}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder={t("filters.status")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("filters.all")}</SelectItem>
                <SelectItem value="NORMAL">{t("status.normal")}</SelectItem>
                <SelectItem value="WARNING">{t("status.warning")}</SelectItem>
                <SelectItem value="CRITICAL">{t("status.critical")}</SelectItem>
                <SelectItem value="OVER_CAPACITY">{t("status.overCapacity")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Service Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Object.entries(serviceMetrics).map(([service, serviceMetricList]) => {
          const criticalCount = serviceMetricList.filter(m => m.status === "CRITICAL" || m.status === "OVER_CAPACITY").length
          const warningCount = serviceMetricList.filter(m => m.status === "WARNING").length

          return (
            <Card key={service}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{service}</CardTitle>
                  {criticalCount > 0 ? (
                    <Badge variant="destructive">{criticalCount} {t("statusCounts.critical")}</Badge>
                  ) : warningCount > 0 ? (
                    <Badge className="bg-yellow-500">{warningCount} {t("statusCounts.warning")}</Badge>
                  ) : (
                    <Badge className="bg-green-500">{t("statusCounts.normal")}</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {serviceMetricList.slice(0, 4).map((metric) => {
                  const percent = getUsagePercent(metric.currentValue, metric.maxValue)
                  return (
                    <div key={metric.id} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          {metricTypeIcons[metric.metricType] || <Activity className="h-4 w-4" />}
                          <span>{t(`metricTypes.${metric.metricType.toLowerCase()}`)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {getTrendIcon(metric.trend)}
                          <span className="font-mono text-xs">
                            {formatValue(metric.currentValue, metric.unit)}
                          </span>
                        </div>
                      </div>
                      <Progress
                        value={percent}
                        className="h-2"
                      />
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Detailed Metrics Table */}
      <Card>
        <CardHeader>
          <CardTitle>{tCommon("all")} {t("title")}</CardTitle>
          <CardDescription>{t("description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("columns.metric")}</TableHead>
                <TableHead>{t("columns.service")}</TableHead>
                <TableHead>{t("columns.region")}</TableHead>
                <TableHead>{t("columns.current")}</TableHead>
                <TableHead>{t("columns.threshold")}</TableHead>
                <TableHead>{t("columns.trend")}</TableHead>
                <TableHead>{t("columns.status")}</TableHead>
                <TableHead>{tCommon("recorded")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={8}>
                      <div className="h-12 bg-muted animate-pulse rounded" />
                    </TableCell>
                  </TableRow>
                ))
              ) : metrics.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12">
                    <Server className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">{t("noMetrics")}</p>
                  </TableCell>
                </TableRow>
              ) : (
                metrics.map((metric) => {
                  const percent = getUsagePercent(metric.currentValue, metric.maxValue)
                  return (
                    <TableRow key={metric.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {metricTypeIcons[metric.metricType] || <Activity className="h-4 w-4" />}
                          <span>{t(`metricTypes.${metric.metricType.toLowerCase()}`)}</span>
                        </div>
                      </TableCell>
                      <TableCell>{metric.service || "-"}</TableCell>
                      <TableCell>{metric.region || "-"}</TableCell>
                      <TableCell>
                        <div className="space-y-1 min-w-[120px]">
                          <div className="flex justify-between text-xs">
                            <span>{formatValue(metric.currentValue, metric.unit)}</span>
                            <span className="text-muted-foreground">/ {formatValue(metric.maxValue, metric.unit)}</span>
                          </div>
                          <Progress value={percent} className="h-2" />
                          <div className="text-xs text-muted-foreground">{percent.toFixed(1)}%</div>
                        </div>
                      </TableCell>
                      <TableCell>{metric.threshold}%</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {getTrendIcon(metric.trend)}
                          <span className="text-xs text-muted-foreground">
                            {metric.trend ? t(`trend.${metric.trend.toLowerCase()}`) : t("trend.stable")}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(metric.status)}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {new Date(metric.recordedAt).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
