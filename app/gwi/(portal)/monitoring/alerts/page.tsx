import { Suspense } from "react"
import { prisma } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Bell,
  Plus,
  Search,
  Edit,
  Trash2,
  MoreHorizontal,
  AlertTriangle,
  Workflow,
  Brain,
  Database,
  Server,
  CheckCircle,
  Clock,
  BellRing,
} from "lucide-react"

const alertTypeConfig: Record<string, { icon: typeof Bell; color: string; label: string }> = {
  pipeline: { icon: Workflow, color: "bg-blue-100 text-blue-600", label: "Pipeline" },
  llm: { icon: Brain, color: "bg-purple-100 text-purple-600", label: "LLM" },
  data_quality: { icon: Database, color: "bg-green-100 text-green-600", label: "Data Quality" },
  system: { icon: Server, color: "bg-orange-100 text-orange-600", label: "System" },
}

async function getAlertsData() {
  const alerts = await prisma.gWIMonitoringAlert.findMany({
    include: {
      createdBy: { select: { name: true } },
    },
    orderBy: [{ lastTriggeredAt: "desc" }, { createdAt: "desc" }],
  })

  const activeCount = alerts.filter((a) => a.isActive).length
  const triggeredToday = alerts.filter((a) => {
    if (!a.lastTriggeredAt) return false
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return new Date(a.lastTriggeredAt) >= today
  }).length

  return { alerts, activeCount, triggeredToday }
}

async function AlertsContent() {
  const { alerts, activeCount, triggeredToday } = await getAlertsData()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Alerts Management</h1>
          <p className="text-muted-foreground">
            Configure and manage monitoring alerts
          </p>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="mr-2 h-4 w-4" />
          Create Alert
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Bell className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{alerts.length}</p>
                <p className="text-sm text-muted-foreground">Total Alerts</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeCount}</p>
                <p className="text-sm text-muted-foreground">Active Alerts</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                <BellRing className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{triggeredToday}</p>
                <p className="text-sm text-muted-foreground">Triggered Today</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {alerts.reduce((sum, a) => sum + a.triggerCount, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Total Triggers</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search alerts..." className="pl-9" />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="pipeline">Pipeline</SelectItem>
                <SelectItem value="llm">LLM</SelectItem>
                <SelectItem value="data_quality">Data Quality</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all">
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Alerts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Configured Alerts</CardTitle>
          <CardDescription>
            All monitoring alerts and their trigger history
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {alerts.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Alert</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Recipients</TableHead>
                  <TableHead>Last Triggered</TableHead>
                  <TableHead>Trigger Count</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alerts.map((alert) => {
                  const typeConfig = alertTypeConfig[alert.type] || alertTypeConfig.system
                  const TypeIcon = typeConfig.icon
                  return (
                    <TableRow key={alert.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${typeConfig.color.split(" ")[0]}`}>
                            <TypeIcon className={`h-5 w-5 ${typeConfig.color.split(" ")[1]}`} />
                          </div>
                          <div>
                            <p className="font-medium">{alert.name}</p>
                            <p className="text-xs text-muted-foreground">
                              by {alert.createdBy.name}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={typeConfig.color}>
                          {typeConfig.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {alert.recipients.slice(0, 2).map((email, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {email.split("@")[0]}
                            </Badge>
                          ))}
                          {alert.recipients.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{alert.recipients.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {alert.lastTriggeredAt ? (
                          <div>
                            <p className="text-sm">
                              {new Date(alert.lastTriggeredAt).toLocaleDateString()}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(alert.lastTriggeredAt).toLocaleTimeString()}
                            </p>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Never</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{alert.triggerCount}</span>
                      </TableCell>
                      <TableCell>
                        <Switch checked={alert.isActive} />
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Alert
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Bell className="mr-2 h-4 w-4" />
                              Test Alert
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <Bell className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No Alerts Configured</h3>
              <p className="text-muted-foreground mb-4">
                Create alerts to monitor your pipelines, LLMs, and data quality
              </p>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create First Alert
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alert Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Setup Templates</CardTitle>
          <CardDescription>
            Common alert configurations you can set up instantly
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                name: "Pipeline Failure",
                description: "Alert when any pipeline run fails",
                type: "pipeline",
              },
              {
                name: "High LLM Latency",
                description: "Alert when LLM response time exceeds threshold",
                type: "llm",
              },
              {
                name: "Data Quality Drop",
                description: "Alert when quality score falls below target",
                type: "data_quality",
              },
              {
                name: "Sync Error",
                description: "Alert when data source sync fails",
                type: "system",
              },
              {
                name: "Cost Threshold",
                description: "Alert when LLM costs exceed budget",
                type: "llm",
              },
              {
                name: "Error Rate Spike",
                description: "Alert on unusual error rate increase",
                type: "system",
              },
            ].map((template) => {
              const config = alertTypeConfig[template.type]
              const Icon = config.icon
              return (
                <div
                  key={template.name}
                  className="flex items-center gap-4 p-4 border rounded-lg hover:bg-slate-50 cursor-pointer"
                >
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${config.color.split(" ")[0]}`}>
                    <Icon className={`h-5 w-5 ${config.color.split(" ")[1]}`} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{template.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {template.description}
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Setup
                  </Button>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function AlertsPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Alerts Management</h1>
            <p className="text-muted-foreground">Loading alerts...</p>
          </div>
        </div>
      }
    >
      <AlertsContent />
    </Suspense>
  )
}
