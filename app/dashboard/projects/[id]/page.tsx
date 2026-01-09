"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Bot,
  FileText,
  MoreHorizontal,
  Plus,
  Settings,
  Workflow,
  Play,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

const projectsData: Record<
  string,
  {
    id: string
    name: string
    description: string
    status: string
    createdAt: string
    members: { name: string; role: string; initials: string }[]
    workflows: { id: string; name: string; status: string; lastRun: string }[]
    reports: { id: string; name: string; type: string; createdAt: string }[]
    agents: { id: string; name: string; type: string; runs: number }[]
  }
> = {
  "gen-z-sustainability": {
    id: "gen-z-sustainability",
    name: "Gen Z Sustainability",
    description: "Research project exploring Gen Z attitudes towards sustainable brands and eco-friendly products",
    status: "active",
    createdAt: "2024-01-15",
    members: [
      { name: "Sarah Chen", role: "Lead Researcher", initials: "SC" },
      { name: "Mike Johnson", role: "Data Analyst", initials: "MJ" },
      { name: "Emily Davis", role: "Strategist", initials: "ED" },
      { name: "Alex Kim", role: "Researcher", initials: "AK" },
    ],
    workflows: [
      { id: "1", name: "Weekly Trend Analysis", status: "running", lastRun: "2 hours ago" },
      { id: "2", name: "Competitor Sustainability Audit", status: "completed", lastRun: "1 day ago" },
      { id: "3", name: "Consumer Sentiment Tracker", status: "completed", lastRun: "3 days ago" },
      { id: "4", name: "Brand Perception Study", status: "failed", lastRun: "5 days ago" },
    ],
    reports: [
      { id: "1", name: "Q1 Sustainability Trends Report", type: "Presentation", createdAt: "2024-03-15" },
      { id: "2", name: "Gen Z Purchase Drivers Analysis", type: "Dashboard", createdAt: "2024-03-10" },
      { id: "3", name: "Eco-Brand Competitive Landscape", type: "Report", createdAt: "2024-03-05" },
    ],
    agents: [
      { id: "1", name: "Audience Strategist", type: "Pre-built", runs: 45 },
      { id: "2", name: "Trend Analyzer", type: "Pre-built", runs: 32 },
      { id: "3", name: "Custom Sustainability Agent", type: "Custom", runs: 28 },
    ],
  },
  "q4-campaign": {
    id: "q4-campaign",
    name: "Q4 Campaign",
    description: "Holiday season marketing campaign analysis and audience targeting strategy",
    status: "active",
    createdAt: "2024-02-20",
    members: [
      { name: "John Smith", role: "Campaign Manager", initials: "JS" },
      { name: "Lisa Wong", role: "Media Planner", initials: "LW" },
      { name: "Tom Brown", role: "Creative Lead", initials: "TB" },
      { name: "Amy Lee", role: "Analyst", initials: "AL" },
      { name: "Chris Park", role: "Strategist", initials: "CP" },
      { name: "Diana Ross", role: "Researcher", initials: "DR" },
    ],
    workflows: [
      { id: "1", name: "Holiday Audience Segmentation", status: "completed", lastRun: "4 hours ago" },
      { id: "2", name: "Creative Performance Tracker", status: "running", lastRun: "1 hour ago" },
      { id: "3", name: "Channel Mix Optimizer", status: "completed", lastRun: "2 days ago" },
    ],
    reports: [
      { id: "1", name: "Q4 Campaign Strategy Deck", type: "Presentation", createdAt: "2024-03-20" },
      { id: "2", name: "Audience Targeting Recommendations", type: "Report", createdAt: "2024-03-18" },
    ],
    agents: [
      { id: "1", name: "Campaign Optimizer", type: "Pre-built", runs: 78 },
      { id: "2", name: "Audience Strategist", type: "Pre-built", runs: 56 },
    ],
  },
  "market-expansion": {
    id: "market-expansion",
    name: "Market Expansion",
    description: "Research initiative for expanding into new geographic markets in APAC region",
    status: "active",
    createdAt: "2024-03-10",
    members: [
      { name: "Rachel Green", role: "Project Lead", initials: "RG" },
      { name: "David Chen", role: "APAC Specialist", initials: "DC" },
      { name: "Nina Patel", role: "Market Analyst", initials: "NP" },
    ],
    workflows: [
      { id: "1", name: "APAC Consumer Analysis", status: "running", lastRun: "30 minutes ago" },
      { id: "2", name: "Market Entry Assessment", status: "completed", lastRun: "1 day ago" },
    ],
    reports: [{ id: "1", name: "APAC Market Opportunity Report", type: "Report", createdAt: "2024-03-25" }],
    agents: [
      { id: "1", name: "Market Analyzer", type: "Pre-built", runs: 23 },
      { id: "2", name: "Regional Trend Scout", type: "Custom", runs: 15 },
    ],
  },
}

export default function ProjectDetailPage() {
  const params = useParams()
  const id = params.id as string
  const [activeTab, setActiveTab] = useState("overview")

  const project = projectsData[id] || {
    id,
    name: id
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" "),
    description: "Project description",
    status: "active",
    createdAt: new Date().toISOString().split("T")[0],
    members: [],
    workflows: [],
    reports: [],
    agents: [],
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "running":
        return <Play className="h-3.5 w-3.5 text-blue-500" />
      case "completed":
        return <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
      case "failed":
        return <XCircle className="h-3.5 w-3.5 text-red-500" />
      default:
        return <Clock className="h-3.5 w-3.5 text-muted-foreground" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/projects">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground">{project.name}</h1>
            <Badge variant={project.status === "active" ? "default" : "secondary"}>{project.status}</Badge>
          </div>
          <p className="text-muted-foreground">{project.description}</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              Project Settings
            </DropdownMenuItem>
            <DropdownMenuItem>Archive Project</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">Delete Project</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Team Members</CardDescription>
            <CardTitle className="text-2xl">{project.members.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex -space-x-2">
              {project.members.slice(0, 4).map((member) => (
                <Avatar key={member.name} className="h-8 w-8 border-2 border-background">
                  <AvatarFallback className="text-xs">{member.initials}</AvatarFallback>
                </Avatar>
              ))}
              {project.members.length > 4 && (
                <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-muted text-xs">
                  +{project.members.length - 4}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Workflows</CardDescription>
            <CardTitle className="text-2xl">{project.workflows.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {project.workflows.filter((w) => w.status === "running").length} running
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Reports</CardDescription>
            <CardTitle className="text-2xl">{project.reports.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Generated outputs</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Agents Used</CardDescription>
            <CardTitle className="text-2xl">{project.agents.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {project.agents.reduce((acc, a) => acc + a.runs, 0)} total runs
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="agents">Agents</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Recent Workflows</CardTitle>
                <Link href="/dashboard/workflows/new">
                  <Button variant="ghost" size="sm" className="gap-1">
                    <Plus className="h-3.5 w-3.5" />
                    New
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="space-y-3">
                {project.workflows.slice(0, 3).map((workflow) => (
                  <div key={workflow.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(workflow.status)}
                      <span className="text-sm">{workflow.name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{workflow.lastRun}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Recent Reports</CardTitle>
                <Link href="/dashboard/reports/new">
                  <Button variant="ghost" size="sm" className="gap-1">
                    <Plus className="h-3.5 w-3.5" />
                    New
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="space-y-3">
                {project.reports.slice(0, 3).map((report) => (
                  <div key={report.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-sm">{report.name}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {report.type}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="workflows" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Project Workflows</CardTitle>
              <Link href="/dashboard/workflows/new">
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  New Workflow
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {project.workflows.map((workflow) => (
                  <div key={workflow.id} className="flex items-center justify-between rounded-lg border p-4">
                    <div className="flex items-center gap-3">
                      <Workflow className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{workflow.name}</p>
                        <p className="text-sm text-muted-foreground">Last run: {workflow.lastRun}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        variant={
                          workflow.status === "running"
                            ? "default"
                            : workflow.status === "completed"
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {workflow.status}
                      </Badge>
                      <Button variant="outline" size="sm">
                        Run
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Project Reports</CardTitle>
              <Link href="/dashboard/reports/new">
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  New Report
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {project.reports.map((report) => (
                  <div key={report.id} className="flex items-center justify-between rounded-lg border p-4">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{report.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Created: {new Date(report.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">{report.type}</Badge>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="agents" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Agents Used</CardTitle>
              <Link href="/dashboard/agents">
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Agent
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {project.agents.map((agent) => (
                  <div key={agent.id} className="flex items-center justify-between rounded-lg border p-4">
                    <div className="flex items-center gap-3">
                      <Bot className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{agent.name}</p>
                        <p className="text-sm text-muted-foreground">{agent.runs} runs in this project</p>
                      </div>
                    </div>
                    <Badge variant={agent.type === "Custom" ? "default" : "secondary"}>{agent.type}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Team Members</CardTitle>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Member
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {project.members.map((member) => (
                  <div key={member.name} className="flex items-center justify-between rounded-lg border p-4">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>{member.initials}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-muted-foreground">{member.role}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
