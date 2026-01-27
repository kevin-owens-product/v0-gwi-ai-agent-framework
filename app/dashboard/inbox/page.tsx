"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import {
  Mail,
  MessageSquare,
  Filter,
  CheckCircle2,
  Clock,
  Bot,
  MoreHorizontal,
  Sparkles,
  FileText,
  Users,
  TrendingUp,
  Globe,
  Search,
  Settings,
  Plus,
  Play,
  Pause,
  Zap,
  ArrowRight,
  Eye,
  RotateCcw,
  Trash2,
  Send,
  ChevronRight,
  AlertCircle,
  History,
  BarChart3,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Switch } from "@/components/ui/switch"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { PageTracker } from "@/components/tracking/PageTracker"

const inboxAgents = [
  {
    id: "brief-request",
    name: "Brief Request Handler",
    description: "Automatically processes incoming brief requests from Slack and email",
    icon: FileText,
    status: "active",
    processed: 47,
    avgTime: "2.3 min",
    channels: ["Slack", "Email"],
    successRate: 94,
    lastTriggered: "3 min ago",
    triggers: ["creative brief", "brief request", "need a brief"],
    actions: ["Extract requirements", "Query GWI data", "Generate brief", "Send response"],
  },
  {
    id: "audience-query",
    name: "Audience Query Responder",
    description: "Answers quick audience questions with data-backed responses",
    icon: Users,
    status: "active",
    processed: 156,
    avgTime: "45 sec",
    channels: ["Slack"],
    successRate: 98,
    lastTriggered: "5 min ago",
    triggers: ["audience", "demographics", "who are", "target market"],
    actions: ["Parse question", "Query audience data", "Format response", "Include citations"],
  },
  {
    id: "trend-alert",
    name: "Trend Alert Monitor",
    description: "Monitors data for significant changes and proactively alerts teams",
    icon: TrendingUp,
    status: "paused",
    processed: 23,
    avgTime: "real-time",
    channels: ["Email", "Teams"],
    successRate: 100,
    lastTriggered: "2 hours ago",
    triggers: ["Automatic - runs every 6 hours"],
    actions: ["Scan trend data", "Detect anomalies", "Generate alert", "Notify stakeholders"],
  },
  {
    id: "localization",
    name: "Market Localization",
    description: "Translates and localizes insights for regional teams",
    icon: Globe,
    status: "active",
    processed: 89,
    avgTime: "1.8 min",
    channels: ["Email"],
    successRate: 96,
    lastTriggered: "45 min ago",
    triggers: ["translate", "localize", "regional", "market comparison"],
    actions: ["Detect language/market", "Translate content", "Adapt metrics", "Format for region"],
  },
]

const inboxItems = [
  {
    id: 1,
    type: "slack",
    from: "Sarah Chen",
    avatar: "/professional-woman.png",
    email: "sarah.chen@acme.com",
    subject: "Quick question about Gen Z sustainability preferences",
    preview:
      "Hey team, I need some quick stats on Gen Z sustainability preferences for a client call in 2 hours. Can you help?",
    fullMessage:
      "Hey team, I need some quick stats on Gen Z sustainability preferences for a client call in 2 hours. Specifically looking for:\n\n1. What % of Gen Z say sustainability influences their purchase decisions?\n2. Top 3 sustainability concerns for this demographic\n3. Any comparison with Millennials would be great\n\nThanks!",
    time: "5 min ago",
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    status: "processing",
    agent: "Audience Query Responder",
    priority: "high",
    response: null,
    processingSteps: [
      { step: "Parse question", status: "completed", time: "2s" },
      { step: "Query audience data", status: "completed", time: "8s" },
      { step: "Format response", status: "in-progress", time: "..." },
      { step: "Include citations", status: "pending", time: "-" },
    ],
  },
  {
    id: 2,
    type: "email",
    from: "Marcus Johnson",
    avatar: "/professional-man.png",
    email: "mjohnson@brandco.com",
    subject: "Creative Brief: Q1 Campaign - Wellness Audience",
    preview: "Please prepare a creative brief targeting health-conscious millennials for our wellness campaign...",
    fullMessage:
      "Hi GWI Team,\n\nPlease prepare a creative brief targeting health-conscious millennials for our wellness campaign launching in Q1.\n\nKey requirements:\n- Target: Millennials (25-40) interested in wellness\n- Markets: US, UK, Germany\n- Focus: Mental health and fitness apps\n- Budget tier: Premium\n\nDeadline: End of this week\n\nBest,\nMarcus",
    time: "23 min ago",
    timestamp: new Date(Date.now() - 23 * 60 * 1000),
    status: "completed",
    agent: "Brief Request Handler",
    priority: "medium",
    response: {
      summary: "Creative brief generated successfully",
      outputType: "Creative Brief",
      confidence: 96,
      citations: 12,
      link: "/dashboard/reports/wellness-brief-q1",
    },
    processingSteps: [
      { step: "Extract requirements", status: "completed", time: "3s" },
      { step: "Query GWI data", status: "completed", time: "12s" },
      { step: "Generate brief", status: "completed", time: "45s" },
      { step: "Send response", status: "completed", time: "2s" },
    ],
  },
  {
    id: 3,
    type: "slack",
    from: "Emily Rodriguez",
    avatar: "/woman-marketing-strategy.png",
    email: "emily.r@mediagroup.com",
    subject: "Need APAC market comparison",
    preview: "Can you pull together a comparison of consumer attitudes towards premium brands across APAC markets?",
    fullMessage:
      "Can you pull together a comparison of consumer attitudes towards premium brands across APAC markets?\n\nNeed to cover:\n- Japan\n- South Korea\n- Australia\n- Singapore\n\nLooking at luxury goods, tech products, and automotive. Thanks!",
    time: "1 hour ago",
    timestamp: new Date(Date.now() - 60 * 60 * 1000),
    status: "completed",
    agent: "Market Localization",
    priority: "medium",
    response: {
      summary: "APAC premium brand analysis complete",
      outputType: "Market Comparison Report",
      confidence: 94,
      citations: 28,
      link: "/dashboard/reports/apac-premium-brands",
    },
    processingSteps: [
      { step: "Detect language/market", status: "completed", time: "1s" },
      { step: "Translate content", status: "completed", time: "0s" },
      { step: "Adapt metrics", status: "completed", time: "18s" },
      { step: "Format for region", status: "completed", time: "5s" },
    ],
  },
  {
    id: 4,
    type: "email",
    from: "David Kim",
    avatar: "/man-asian-professional.jpg",
    email: "d.kim@enterprise.io",
    subject: "Urgent: Competitor analysis for board meeting",
    preview: "We need a competitive landscape analysis for tomorrow's board meeting. Focus on market share...",
    fullMessage:
      "Hi,\n\nURGENT REQUEST\n\nWe need a competitive landscape analysis for tomorrow's board meeting.\n\nFocus areas:\n- Market share trends (last 2 years)\n- Consumer perception vs competitors\n- Brand awareness metrics\n- Purchase intent signals\n\nCompetitors: Nike, Adidas, Under Armour, Lululemon\n\nNeed this by EOD today if possible.\n\nThanks,\nDavid",
    time: "2 hours ago",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    status: "pending",
    agent: null,
    priority: "high",
    response: null,
    processingSteps: [],
  },
  {
    id: 5,
    type: "slack",
    from: "Lisa Thompson",
    avatar: "/woman-executive.png",
    email: "lthompson@insights.com",
    subject: "Monthly trend report request",
    preview: "Please generate the monthly consumer trend report for the executive team...",
    fullMessage:
      "Please generate the monthly consumer trend report for the executive team.\n\nStandard format, but this month please add a section on:\n- AI adoption trends among consumers\n- Privacy concerns evolution\n- Subscription fatigue indicators",
    time: "3 hours ago",
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
    status: "completed",
    agent: "Trend Alert Monitor",
    priority: "low",
    response: {
      summary: "Monthly trend report generated",
      outputType: "Trend Report",
      confidence: 98,
      citations: 45,
      link: "/dashboard/reports/monthly-trends-dec",
    },
    processingSteps: [
      { step: "Scan trend data", status: "completed", time: "22s" },
      { step: "Detect anomalies", status: "completed", time: "8s" },
      { step: "Generate alert", status: "completed", time: "35s" },
      { step: "Notify stakeholders", status: "completed", time: "3s" },
    ],
  },
]

export default function InboxPage() {
  const t = useTranslations("dashboard.inbox")
  const tCommon = useTranslations("common")
  const [selectedTab, setSelectedTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRequest, setSelectedRequest] = useState<(typeof inboxItems)[0] | null>(null)
  const [selectedAgent, setSelectedAgent] = useState<(typeof inboxAgents)[0] | null>(null)
  const [showCreateAgent, setShowCreateAgent] = useState(false)
  const [agentStatuses, setAgentStatuses] = useState<Record<string, boolean>>({
    "brief-request": true,
    "audience-query": true,
    "trend-alert": false,
    localization: true,
  })

  const [newAgent, setNewAgent] = useState({
    name: "",
    description: "",
    triggers: "",
    channels: [] as string[],
    actions: "",
    autoRespond: true,
    requireApproval: false,
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            {tCommon("completed")}
          </Badge>
        )
      case "processing":
        return (
          <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">
            <Sparkles className="w-3 h-3 mr-1 animate-pulse" />
            {t("status.processing")}
          </Badge>
        )
      case "pending":
        return (
          <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20">
            <Clock className="w-3 h-3 mr-1" />
            {tCommon("pending")}
          </Badge>
        )
      default:
        return null
    }
  }

  const getPriorityIndicator = (priority: string) => {
    switch (priority) {
      case "high":
        return <span className="w-2 h-2 rounded-full bg-red-500" />
      case "medium":
        return <span className="w-2 h-2 rounded-full bg-amber-500" />
      case "low":
        return <span className="w-2 h-2 rounded-full bg-emerald-500" />
      default:
        return null
    }
  }

  const toggleAgentStatus = (agentId: string) => {
    setAgentStatuses((prev) => ({
      ...prev,
      [agentId]: !prev[agentId],
    }))
  }

  const handleAssignAgent = (_requestId: number, _agentId: string) => {
    // In a real app, this would trigger the agent assignment
  }

  const filteredItems = inboxItems
    .filter((item) => selectedTab === "all" || item.status === selectedTab)
    .filter(
      (item) =>
        searchQuery === "" ||
        item.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.from.toLowerCase().includes(searchQuery.toLowerCase()),
    )

  return (
    <div className="space-y-6">
      <PageTracker pageName="Inbox" metadata={{ selectedTab, searchQuery: !!searchQuery }} />
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("title")}</h1>
          <p className="text-muted-foreground">{t("description")}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            {t("configureChannels")}
          </Button>
          <Button
            size="sm"
            className="bg-accent text-accent-foreground hover:bg-accent/90"
            onClick={() => setShowCreateAgent(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            {t("createAgent")}
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">{t("stats.processedToday")}</p>
                <p className="text-2xl font-bold text-foreground">127</p>
              </div>
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <p className="text-xs text-emerald-400 mt-2">{t("stats.fromYesterday", { percent: "+23%" })}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">{t("stats.avgResponseTime")}</p>
                <p className="text-2xl font-bold text-foreground">1.2m</p>
              </div>
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Zap className="w-5 h-5 text-blue-400" />
              </div>
            </div>
            <p className="text-xs text-blue-400 mt-2">{t("stats.fasterThanLastWeek", { percent: "-18%" })}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">{t("stats.successRate")}</p>
                <p className="text-2xl font-bold text-foreground">96.4%</p>
              </div>
              <div className="p-2 rounded-lg bg-accent/10">
                <BarChart3 className="w-5 h-5 text-accent" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">{t("stats.basedOnRequests", { count: 315 })}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">{t("stats.pendingReview")}</p>
                <p className="text-2xl font-bold text-foreground">3</p>
              </div>
              <div className="p-2 rounded-lg bg-amber-500/10">
                <AlertCircle className="w-5 h-5 text-amber-400" />
              </div>
            </div>
            <p className="text-xs text-amber-400 mt-2">{t("stats.highPriority", { count: 1 })}</p>
          </CardContent>
        </Card>
      </div>

      {/* Active Agents */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">{t("activeAgents")}</h2>
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            {tCommon("viewAll")}
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {inboxAgents.map((agent) => (
            <Card
              key={agent.id}
              className="bg-card border-border hover:border-accent/50 transition-colors cursor-pointer"
              onClick={() => setSelectedAgent(agent)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2 rounded-lg ${agentStatuses[agent.id] ? "bg-accent/10" : "bg-muted"}`}>
                    <agent.icon
                      className={`w-5 h-5 ${agentStatuses[agent.id] ? "text-accent" : "text-muted-foreground"}`}
                    />
                  </div>
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <Switch checked={agentStatuses[agent.id]} onCheckedChange={() => toggleAgentStatus(agent.id)} />
                  </div>
                </div>
                <h3 className="font-semibold text-foreground mb-1">{agent.name}</h3>
                <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{agent.description}</p>

                <div className="mb-3">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted-foreground">{t("agents.successRate")}</span>
                    <span className="text-foreground">{agent.successRate}%</span>
                  </div>
                  <Progress value={agent.successRate} className="h-1" />
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{t("agents.processed", { count: agent.processed })}</span>
                  <span className="text-muted-foreground">~{agent.avgTime}</span>
                </div>
                <div className="flex gap-1 mt-2">
                  {agent.channels.map((channel) => (
                    <Badge key={channel} variant="secondary" className="text-[10px] px-1.5 py-0">
                      {channel}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Inbox */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>{t("incomingRequests.title")}</CardTitle>
              <CardDescription>{t("incomingRequests.description")}</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder={t("incomingRequests.searchPlaceholder")}
                  className="pl-9 w-[200px] bg-background"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                {tCommon("filter")}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="bg-muted/50 mb-4">
              <TabsTrigger value="all">
                {tCommon("all")}
                <Badge variant="secondary" className="ml-2 text-[10px] px-1.5">
                  {inboxItems.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="pending">
                {tCommon("pending")}
                <Badge variant="secondary" className="ml-2 text-[10px] px-1.5">
                  {inboxItems.filter((i) => i.status === "pending").length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="processing">
                {t("status.processing")}
                <Badge variant="secondary" className="ml-2 text-[10px] px-1.5">
                  {inboxItems.filter((i) => i.status === "processing").length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="completed">
                {tCommon("completed")}
                <Badge variant="secondary" className="ml-2 text-[10px] px-1.5">
                  {inboxItems.filter((i) => i.status === "completed").length}
                </Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value={selectedTab} className="mt-0">
              <div className="space-y-2">
                {filteredItems.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>{t("incomingRequests.noRequests")}</p>
                  </div>
                ) : (
                  filteredItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start gap-4 p-4 rounded-lg border border-border bg-background hover:bg-muted/50 hover:border-accent/30 transition-colors cursor-pointer group"
                      onClick={() => setSelectedRequest(item)}
                    >
                      <div className="flex items-center gap-3">
                        {getPriorityIndicator(item.priority)}
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={item.avatar || "/placeholder.svg"} />
                          <AvatarFallback>
                            {item.from
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-foreground">{item.from}</span>
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                            {item.type === "slack" ? (
                              <MessageSquare className="w-3 h-3 mr-1" />
                            ) : (
                              <Mail className="w-3 h-3 mr-1" />
                            )}
                            {item.type}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{item.time}</span>
                        </div>
                        <h4 className="font-medium text-sm text-foreground mb-1 truncate">{item.subject}</h4>
                        <p className="text-xs text-muted-foreground line-clamp-1">{item.preview}</p>
                        {item.agent && (
                          <div className="flex items-center gap-1 mt-2 text-xs text-accent">
                            <Bot className="w-3 h-3" />
                            <span>{item.agent}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(item.status)}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedRequest(item)
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setSelectedRequest(item)}>
                              <Eye className="w-4 h-4 mr-2" />
                              {tCommon("viewDetails")}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <Bot className="w-4 h-4 mr-2" />
                              {t("actions.assignToBriefHandler")}
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Users className="w-4 h-4 mr-2" />
                              {t("actions.assignToAudienceQuery")}
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Globe className="w-4 h-4 mr-2" />
                              {t("actions.assignToLocalization")}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <RotateCcw className="w-4 h-4 mr-2" />
                              {t("actions.reprocess")}
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-400">
                              <Trash2 className="w-4 h-4 mr-2" />
                              {t("actions.archive")}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Request Detail Sheet */}
      <Sheet open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          {selectedRequest && (
            <>
              <SheetHeader>
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={selectedRequest.avatar || "/placeholder.svg"} />
                    <AvatarFallback>
                      {selectedRequest.from
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <SheetTitle className="text-left">{selectedRequest.from}</SheetTitle>
                    <SheetDescription className="text-left">{selectedRequest.email}</SheetDescription>
                  </div>
                </div>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                {/* Request Info */}
                <div className="flex items-center gap-4 text-sm">
                  <Badge variant="outline">
                    {selectedRequest.type === "slack" ? (
                      <MessageSquare className="w-3 h-3 mr-1" />
                    ) : (
                      <Mail className="w-3 h-3 mr-1" />
                    )}
                    {selectedRequest.type}
                  </Badge>
                  {getStatusBadge(selectedRequest.status)}
                  <div className="flex items-center gap-1">
                    {getPriorityIndicator(selectedRequest.priority)}
                    <span className="text-muted-foreground capitalize">{t(`priority.${selectedRequest.priority}`)}</span>
                  </div>
                </div>

                {/* Subject & Message */}
                <div>
                  <h3 className="font-semibold text-foreground mb-2">{selectedRequest.subject}</h3>
                  <div className="p-4 rounded-lg bg-muted/50 border border-border">
                    <p className="text-sm text-foreground whitespace-pre-wrap">{selectedRequest.fullMessage}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">{t("request.received", { time: selectedRequest.time })}</p>
                </div>

                {/* Processing Steps */}
                {selectedRequest.processingSteps.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                      <Bot className="w-4 h-4 text-accent" />
                      {selectedRequest.agent}
                    </h4>
                    <div className="space-y-2">
                      {selectedRequest.processingSteps.map((step, idx) => (
                        <div
                          key={idx}
                          className={`flex items-center justify-between p-3 rounded-lg border ${
                            step.status === "completed"
                              ? "bg-emerald-500/5 border-emerald-500/20"
                              : step.status === "in-progress"
                                ? "bg-blue-500/5 border-blue-500/20"
                                : "bg-muted/30 border-border"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {step.status === "completed" ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            ) : step.status === "in-progress" ? (
                              <Sparkles className="w-4 h-4 text-blue-400 animate-pulse" />
                            ) : (
                              <Clock className="w-4 h-4 text-muted-foreground" />
                            )}
                            <span
                              className={`text-sm ${step.status === "pending" ? "text-muted-foreground" : "text-foreground"}`}
                            >
                              {step.step}
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground">{step.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Response Output */}
                {selectedRequest.response && (
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-3">{t("request.generatedOutput")}</h4>
                    <Card className="bg-emerald-500/5 border-emerald-500/20">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="font-medium text-foreground">{selectedRequest.response.outputType}</p>
                            <p className="text-sm text-muted-foreground">{selectedRequest.response.summary}</p>
                          </div>
                          <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                            {t("request.confidence", { percent: selectedRequest.response.confidence })}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>{t("request.citations", { count: selectedRequest.response.citations })}</span>
                        </div>
                        <Button className="w-full mt-4 bg-transparent" variant="outline" asChild>
                          <a href={selectedRequest.response.link}>
                            {t("request.viewFullReport")}
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </a>
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Actions for Pending */}
                {selectedRequest.status === "pending" && (
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-3">{t("request.assignAgent")}</h4>
                    <div className="grid gap-2">
                      {inboxAgents
                        .filter((a) => agentStatuses[a.id])
                        .map((agent) => (
                          <Button
                            key={agent.id}
                            variant="outline"
                            className="justify-start h-auto py-3 bg-transparent"
                            onClick={() => handleAssignAgent(selectedRequest.id, agent.id)}
                          >
                            <agent.icon className="w-4 h-4 mr-3 text-accent" />
                            <div className="text-left">
                              <p className="font-medium">{agent.name}</p>
                              <p className="text-xs text-muted-foreground">{agent.description}</p>
                            </div>
                          </Button>
                        ))}
                    </div>
                    <Separator className="my-4" />
                    <Button className="w-full" variant="secondary">
                      <Send className="w-4 h-4 mr-2" />
                      {t("request.respondManually")}
                    </Button>
                  </div>
                )}

                {/* History */}
                <div>
                  <Button variant="ghost" className="w-full justify-start text-muted-foreground">
                    <History className="w-4 h-4 mr-2" />
                    {t("request.viewHistory")}
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Agent Detail Sheet */}
      <Sheet open={!!selectedAgent} onOpenChange={() => setSelectedAgent(null)}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          {selectedAgent && (
            <>
              <SheetHeader>
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-lg ${agentStatuses[selectedAgent.id] ? "bg-accent/10" : "bg-muted"}`}>
                    <selectedAgent.icon
                      className={`w-6 h-6 ${agentStatuses[selectedAgent.id] ? "text-accent" : "text-muted-foreground"}`}
                    />
                  </div>
                  <div>
                    <SheetTitle className="text-left">{selectedAgent.name}</SheetTitle>
                    <SheetDescription className="text-left">{selectedAgent.description}</SheetDescription>
                  </div>
                </div>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                {/* Status Toggle */}
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border">
                  <div className="flex items-center gap-3">
                    {agentStatuses[selectedAgent.id] ? (
                      <Play className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <Pause className="w-5 h-5 text-muted-foreground" />
                    )}
                    <div>
                      <p className="font-medium text-foreground">
                        {agentStatuses[selectedAgent.id] ? t("agentDetail.agentActive") : t("agentDetail.agentPaused")}
                      </p>
                      <p className="text-xs text-muted-foreground">{t("agentDetail.lastTriggered", { time: selectedAgent.lastTriggered })}</p>
                    </div>
                  </div>
                  <Switch
                    checked={agentStatuses[selectedAgent.id]}
                    onCheckedChange={() => toggleAgentStatus(selectedAgent.id)}
                  />
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 rounded-lg bg-muted/30">
                    <p className="text-2xl font-bold text-foreground">{selectedAgent.processed}</p>
                    <p className="text-xs text-muted-foreground">{t("agentDetail.processed")}</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/30">
                    <p className="text-2xl font-bold text-foreground">{selectedAgent.successRate}%</p>
                    <p className="text-xs text-muted-foreground">{t("agentDetail.successRate")}</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/30">
                    <p className="text-2xl font-bold text-foreground">{selectedAgent.avgTime}</p>
                    <p className="text-xs text-muted-foreground">{t("agentDetail.avgTime")}</p>
                  </div>
                </div>

                {/* Triggers */}
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-3">{t("agentDetail.triggerKeywords")}</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedAgent.triggers.map((trigger, idx) => (
                      <Badge key={idx} variant="secondary">
                        {trigger}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Channels */}
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-3">{t("agentDetail.connectedChannels")}</h4>
                  <div className="flex gap-2">
                    {selectedAgent.channels.map((channel) => (
                      <Badge key={channel} variant="outline" className="px-3 py-1">
                        {channel === "Slack" && <MessageSquare className="w-3 h-3 mr-1" />}
                        {channel === "Email" && <Mail className="w-3 h-3 mr-1" />}
                        {channel === "Teams" && <Users className="w-3 h-3 mr-1" />}
                        {channel}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Actions Pipeline */}
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-3">{t("agentDetail.processingPipeline")}</h4>
                  <div className="space-y-2">
                    {selectedAgent.actions.map((action, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border"
                      >
                        <span className="w-6 h-6 rounded-full bg-accent/20 text-accent text-xs font-medium flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="text-sm text-foreground">{action}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 bg-transparent">
                    <Settings className="w-4 h-4 mr-2" />
                    {t("agentDetail.configure")}
                  </Button>
                  <Button variant="outline" className="flex-1 bg-transparent">
                    <History className="w-4 h-4 mr-2" />
                    {t("agentDetail.viewLogs")}
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Create Agent Dialog */}
      <Dialog open={showCreateAgent} onOpenChange={setShowCreateAgent}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("createAgentDialog.title")}</DialogTitle>
            <DialogDescription>{t("createAgentDialog.description")}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="agent-name">{t("createAgentDialog.agentName")}</Label>
              <Input
                id="agent-name"
                placeholder={t("createAgentDialog.agentNamePlaceholder")}
                value={newAgent.name}
                onChange={(e) => setNewAgent({ ...newAgent, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="agent-description">{tCommon("description")}</Label>
              <Textarea
                id="agent-description"
                placeholder={t("createAgentDialog.descriptionPlaceholder")}
                value={newAgent.description}
                onChange={(e) => setNewAgent({ ...newAgent, description: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="agent-triggers">{t("createAgentDialog.triggerKeywords")}</Label>
              <Input
                id="agent-triggers"
                placeholder={t("createAgentDialog.triggerKeywordsPlaceholder")}
                value={newAgent.triggers}
                onChange={(e) => setNewAgent({ ...newAgent, triggers: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">{t("createAgentDialog.triggerKeywordsHelp")}</p>
            </div>

            <div className="space-y-2">
              <Label>{t("createAgentDialog.channels")}</Label>
              <div className="flex gap-4">
                {["Slack", "Email", "Teams"].map((channel) => (
                  <div key={channel} className="flex items-center space-x-2">
                    <Checkbox
                      id={`channel-${channel}`}
                      checked={newAgent.channels.includes(channel)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setNewAgent({ ...newAgent, channels: [...newAgent.channels, channel] })
                        } else {
                          setNewAgent({ ...newAgent, channels: newAgent.channels.filter((c) => c !== channel) })
                        }
                      }}
                    />
                    <label htmlFor={`channel-${channel}`} className="text-sm">
                      {channel}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t("createAgentDialog.baseAgent")}</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder={t("createAgentDialog.selectAgent")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="audience">{t("createAgentDialog.agents.audienceExplorer")}</SelectItem>
                  <SelectItem value="persona">{t("createAgentDialog.agents.personaArchitect")}</SelectItem>
                  <SelectItem value="culture">{t("createAgentDialog.agents.cultureTracker")}</SelectItem>
                  <SelectItem value="brand">{t("createAgentDialog.agents.brandRelationshipAnalyst")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label>{t("createAgentDialog.autoRespond")}</Label>
                  <p className="text-xs text-muted-foreground">{t("createAgentDialog.autoRespondHelp")}</p>
                </div>
                <Switch
                  checked={newAgent.autoRespond}
                  onCheckedChange={(checked) => setNewAgent({ ...newAgent, autoRespond: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>{t("createAgentDialog.requireApproval")}</Label>
                  <p className="text-xs text-muted-foreground">{t("createAgentDialog.requireApprovalHelp")}</p>
                </div>
                <Switch
                  checked={newAgent.requireApproval}
                  onCheckedChange={(checked) => setNewAgent({ ...newAgent, requireApproval: checked })}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateAgent(false)}>
              {tCommon("cancel")}
            </Button>
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Bot className="w-4 h-4 mr-2" />
              {t("createAgent")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
