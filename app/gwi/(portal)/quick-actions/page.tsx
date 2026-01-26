import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Plus,
  Play,
  Upload,
  Download,
  RefreshCw,
  FileText,
  Database,
  Workflow,
  Bot,
  Brain,
  ClipboardList,
  FolderTree,
  BarChart3,
  AlertTriangle,
  Settings,
  Key,
} from "lucide-react"

const quickActions = [
  {
    title: "Create Survey",
    description: "Design a new survey instrument",
    icon: ClipboardList,
    href: "/gwi/surveys/new",
    color: "bg-emerald-100 text-emerald-600",
  },
  {
    title: "Run Pipeline",
    description: "Execute a data pipeline manually",
    icon: Play,
    href: "/gwi/pipelines",
    color: "bg-blue-100 text-blue-600",
  },
  {
    title: "Add Data Source",
    description: "Connect a new external data source",
    icon: Database,
    href: "/gwi/data-sources",
    color: "bg-purple-100 text-purple-600",
  },
  {
    title: "New Agent Template",
    description: "Create a reusable agent configuration",
    icon: Bot,
    href: "/gwi/agents/templates/new",
    color: "bg-orange-100 text-orange-600",
  },
  {
    title: "Configure LLM",
    description: "Add or update LLM model settings",
    icon: Brain,
    href: "/gwi/llm/models/new",
    color: "bg-pink-100 text-pink-600",
  },
  {
    title: "Add Taxonomy",
    description: "Create new taxonomy categories",
    icon: FolderTree,
    href: "/gwi/taxonomy",
    color: "bg-cyan-100 text-cyan-600",
  },
]

const dataActions = [
  {
    title: "Sync All Sources",
    description: "Trigger sync for all active data sources",
    icon: RefreshCw,
    color: "bg-blue-100 text-blue-600",
  },
  {
    title: "Export Data",
    description: "Export survey responses or analytics",
    icon: Download,
    color: "bg-green-100 text-green-600",
  },
  {
    title: "Import Data",
    description: "Bulk import survey data",
    icon: Upload,
    color: "bg-yellow-100 text-yellow-600",
  },
  {
    title: "Generate Report",
    description: "Create analytics report",
    icon: FileText,
    color: "bg-purple-100 text-purple-600",
  },
]

const systemActions = [
  {
    title: "View Errors",
    description: "Check and resolve system errors",
    icon: AlertTriangle,
    href: "/gwi/monitoring/errors",
    color: "bg-red-100 text-red-600",
  },
  {
    title: "System Settings",
    description: "Configure portal settings",
    icon: Settings,
    href: "/gwi/system/settings",
    color: "bg-slate-100 text-slate-600",
  },
  {
    title: "API Keys",
    description: "Manage API keys and access",
    icon: Key,
    href: "/gwi/system/api-keys",
    color: "bg-amber-100 text-amber-600",
  },
  {
    title: "View Metrics",
    description: "Monitor system performance",
    icon: BarChart3,
    href: "/gwi/monitoring/pipelines",
    color: "bg-indigo-100 text-indigo-600",
  },
]

export default function QuickActionsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Quick Actions</h1>
        <p className="text-muted-foreground">
          Frequently used actions and shortcuts
        </p>
      </div>

      {/* Create Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create New
          </CardTitle>
          <CardDescription>Quick access to create new resources</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {quickActions.map((action) => {
              const Icon = action.icon
              return (
                <Link
                  key={action.title}
                  href={action.href}
                  className="flex items-center gap-4 p-4 border rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${action.color.split(" ")[0]}`}>
                    <Icon className={`h-6 w-6 ${action.color.split(" ")[1]}`} />
                  </div>
                  <div>
                    <p className="font-medium">{action.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {action.description}
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Data Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Operations
          </CardTitle>
          <CardDescription>Manage data imports, exports, and syncs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {dataActions.map((action) => {
              const Icon = action.icon
              return (
                <Button
                  key={action.title}
                  variant="outline"
                  className="h-auto flex flex-col items-center justify-center p-6 gap-3"
                >
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${action.color.split(" ")[0]}`}>
                    <Icon className={`h-5 w-5 ${action.color.split(" ")[1]}`} />
                  </div>
                  <div className="text-center">
                    <p className="font-medium">{action.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {action.description}
                    </p>
                  </div>
                </Button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* System Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            System & Monitoring
          </CardTitle>
          <CardDescription>System administration and monitoring</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {systemActions.map((action) => {
              const Icon = action.icon
              return (
                <Link
                  key={action.title}
                  href={action.href}
                  className="flex flex-col items-center justify-center p-6 border rounded-lg hover:bg-slate-50 transition-colors gap-3"
                >
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${action.color.split(" ")[0]}`}>
                    <Icon className={`h-5 w-5 ${action.color.split(" ")[1]}`} />
                  </div>
                  <div className="text-center">
                    <p className="font-medium">{action.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {action.description}
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Actions Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Actions</CardTitle>
          <CardDescription>Your recently performed actions</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Recent actions tracking coming soon...
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
