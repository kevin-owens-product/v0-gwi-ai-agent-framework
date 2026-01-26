import { Suspense } from "react"
import { prisma } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Puzzle,
  Search,
  Plus,
  Database,
  BarChart3,
  FileText,
  MessageSquare,
  Workflow,
  Shield,
  Brain,
  Wrench,
  Zap,
} from "lucide-react"

const capabilityIcons: Record<string, typeof Puzzle> = {
  analysis: BarChart3,
  data_access: Database,
  reporting: FileText,
  communication: MessageSquare,
  workflow: Workflow,
  security: Shield,
  ai: Brain,
  tool: Wrench,
}

const capabilityColors: Record<string, string> = {
  analysis: "bg-blue-100 text-blue-600",
  data_access: "bg-purple-100 text-purple-600",
  reporting: "bg-green-100 text-green-600",
  communication: "bg-orange-100 text-orange-600",
  workflow: "bg-cyan-100 text-cyan-600",
  security: "bg-red-100 text-red-600",
  ai: "bg-pink-100 text-pink-600",
  tool: "bg-slate-100 text-slate-600",
}

// Define built-in capabilities
const builtInCapabilities = [
  {
    id: "data-analysis",
    name: "Data Analysis",
    type: "analysis",
    description: "Analyze survey data and generate insights",
    isActive: true,
  },
  {
    id: "data-query",
    name: "Database Query",
    type: "data_access",
    description: "Execute read-only queries on data sources",
    isActive: true,
  },
  {
    id: "report-gen",
    name: "Report Generation",
    type: "reporting",
    description: "Generate formatted reports and exports",
    isActive: true,
  },
  {
    id: "data-classification",
    name: "Data Classification",
    type: "ai",
    description: "Classify data using taxonomy rules",
    isActive: true,
  },
  {
    id: "pipeline-trigger",
    name: "Pipeline Trigger",
    type: "workflow",
    description: "Trigger data pipeline executions",
    isActive: false,
  },
  {
    id: "notification",
    name: "Notifications",
    type: "communication",
    description: "Send alerts and notifications",
    isActive: true,
  },
]

async function getCapabilitiesData() {
  const tools = await prisma.systemToolConfiguration.findMany({
    orderBy: { name: "asc" },
  })

  const activeTools = tools.filter((t) => t.isActive).length
  const toolTypes = [...new Set(tools.map((t) => t.type))]

  return { tools, activeTools, toolTypes }
}

async function CapabilitiesContent() {
  const { tools, activeTools, toolTypes } = await getCapabilitiesData()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agent Capabilities</h1>
          <p className="text-muted-foreground">
            Configure what agents can do and access
          </p>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="mr-2 h-4 w-4" />
          Add Capability
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Puzzle className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{builtInCapabilities.length}</p>
                <p className="text-sm text-muted-foreground">Core Capabilities</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Wrench className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{tools.length}</p>
                <p className="text-sm text-muted-foreground">Custom Tools</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Zap className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeTools}</p>
                <p className="text-sm text-muted-foreground">Active Tools</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center">
                <Shield className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{toolTypes.length}</p>
                <p className="text-sm text-muted-foreground">Tool Types</p>
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
              <Input placeholder="Search capabilities..." className="pl-9" />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="analysis">Analysis</SelectItem>
                <SelectItem value="data_access">Data Access</SelectItem>
                <SelectItem value="reporting">Reporting</SelectItem>
                <SelectItem value="workflow">Workflow</SelectItem>
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

      {/* Core Capabilities */}
      <Card>
        <CardHeader>
          <CardTitle>Core Capabilities</CardTitle>
          <CardDescription>
            Built-in capabilities available for all agents
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {builtInCapabilities.map((cap) => {
              const Icon = capabilityIcons[cap.type] || Puzzle
              const colorClass = capabilityColors[cap.type] || "bg-slate-100 text-slate-600"
              return (
                <div
                  key={cap.id}
                  className="flex items-start gap-4 p-4 border rounded-lg hover:bg-slate-50"
                >
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${colorClass.split(" ")[0]}`}>
                    <Icon className={`h-5 w-5 ${colorClass.split(" ")[1]}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{cap.name}</p>
                      <Switch checked={cap.isActive} />
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {cap.description}
                    </p>
                    <Badge variant="outline" className="mt-2">
                      {cap.type.replace("_", " ")}
                    </Badge>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Custom Tools */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Custom Tools</CardTitle>
            <CardDescription>
              Additional tools configured for specific use cases
            </CardDescription>
          </div>
          <Button variant="outline" asChild>
            <a href="/gwi/agents/tools">View All Tools</a>
          </Button>
        </CardHeader>
        <CardContent>
          {tools.length > 0 ? (
            <div className="space-y-3">
              {tools.slice(0, 6).map((tool) => (
                <div
                  key={tool.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded bg-slate-100 flex items-center justify-center">
                      <Wrench className="h-4 w-4 text-slate-600" />
                    </div>
                    <div>
                      <p className="font-medium">{tool.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {tool.description || tool.type}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">{tool.type}</Badge>
                    <Switch checked={tool.isActive} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Wrench className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No custom tools configured</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function AgentCapabilitiesPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Agent Capabilities</h1>
            <p className="text-muted-foreground">Loading capabilities...</p>
          </div>
        </div>
      }
    >
      <CapabilitiesContent />
    </Suspense>
  )
}
