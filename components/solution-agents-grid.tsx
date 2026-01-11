"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Users,
  UserCircle,
  Brain,
  Globe,
  Globe2,
  Heart,
  Target,
  MessageSquare,
  TrendingUp,
  BarChart3,
  BookOpen,
  Package,
  Calendar,
  Presentation,
  Settings,
  FileText,
  PenTool,
  LineChart,
  MessageCircle,
  Search,
  ListOrdered,
  CheckCircle,
  DollarSign,
  Rocket,
  Map,
  ClipboardList,
  Activity,
  Eye,
  PieChart,
  Lightbulb,
  Zap,
  Layers,
  Shield,
  ArrowRight,
  Sparkles
} from "lucide-react"
import {
  type SolutionAgent,
  allSolutionAgents,
  getAgentsBySolution,
  searchAgents,
  solutionAreas
} from "@/lib/solution-agents"

// Icon mapping
const iconMap: { [key: string]: React.ReactNode } = {
  Users: <Users className="h-5 w-5" />,
  UserCircle: <UserCircle className="h-5 w-5" />,
  Brain: <Brain className="h-5 w-5" />,
  Globe: <Globe className="h-5 w-5" />,
  Globe2: <Globe2 className="h-5 w-5" />,
  Heart: <Heart className="h-5 w-5" />,
  Target: <Target className="h-5 w-5" />,
  MessageSquare: <MessageSquare className="h-5 w-5" />,
  TrendingUp: <TrendingUp className="h-5 w-5" />,
  BarChart3: <BarChart3 className="h-5 w-5" />,
  BookOpen: <BookOpen className="h-5 w-5" />,
  Package: <Package className="h-5 w-5" />,
  Calendar: <Calendar className="h-5 w-5" />,
  Presentation: <Presentation className="h-5 w-5" />,
  Settings: <Settings className="h-5 w-5" />,
  FileText: <FileText className="h-5 w-5" />,
  PenTool: <PenTool className="h-5 w-5" />,
  LineChart: <LineChart className="h-5 w-5" />,
  MessageCircle: <MessageCircle className="h-5 w-5" />,
  Search: <Search className="h-5 w-5" />,
  ListOrdered: <ListOrdered className="h-5 w-5" />,
  CheckCircle: <CheckCircle className="h-5 w-5" />,
  DollarSign: <DollarSign className="h-5 w-5" />,
  Rocket: <Rocket className="h-5 w-5" />,
  Map: <Map className="h-5 w-5" />,
  ClipboardList: <ClipboardList className="h-5 w-5" />,
  Activity: <Activity className="h-5 w-5" />,
  Eye: <Eye className="h-5 w-5" />,
  PieChart: <PieChart className="h-5 w-5" />,
  Lightbulb: <Lightbulb className="h-5 w-5" />,
  Zap: <Zap className="h-5 w-5" />,
  Layers: <Layers className="h-5 w-5" />,
  Shield: <Shield className="h-5 w-5" />
}

// Get icon component
function getIcon(iconName: string): React.ReactNode {
  return iconMap[iconName] || <Sparkles className="h-5 w-5" />
}

// Color schemes for solution areas
const solutionColors: { [key: string]: { bg: string; text: string; border: string } } = {
  core: { bg: "bg-purple-50", text: "text-purple-600", border: "border-purple-200" },
  sales: { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-200" },
  insights: { bg: "bg-cyan-50", text: "text-cyan-600", border: "border-cyan-200" },
  "ad-sales": { bg: "bg-orange-50", text: "text-orange-600", border: "border-orange-200" },
  marketing: { bg: "bg-pink-50", text: "text-pink-600", border: "border-pink-200" },
  "product-development": { bg: "bg-green-50", text: "text-green-600", border: "border-green-200" },
  "market-research": { bg: "bg-indigo-50", text: "text-indigo-600", border: "border-indigo-200" },
  innovation: { bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-200" }
}

interface SolutionAgentCardProps {
  agent: SolutionAgent
  compact?: boolean
}

export function SolutionAgentCard({ agent, compact = false }: SolutionAgentCardProps) {
  const colors = solutionColors[agent.solutionAreaSlug] || solutionColors.core

  if (compact) {
    return (
      <Link href={`/dashboard/agents/${agent.id}`}>
        <Card className={`hover:shadow-md transition-shadow cursor-pointer h-full border ${colors.border}`}>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${colors.bg} ${colors.text}`}>
                {getIcon(agent.icon)}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm truncate">{agent.name}</h4>
                <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                  {agent.description}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    )
  }

  return (
    <Link href={`/dashboard/agents/${agent.id}`}>
      <Card className={`hover:shadow-md transition-shadow cursor-pointer h-full border ${colors.border}`}>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className={`p-2 rounded-lg ${colors.bg} ${colors.text}`}>
              {getIcon(agent.icon)}
            </div>
            <Badge variant="outline" className={`${colors.text} ${colors.border}`}>
              {agent.solutionArea}
            </Badge>
          </div>
          <CardTitle className="text-lg mt-3">{agent.name}</CardTitle>
          <CardDescription className="line-clamp-2">
            {agent.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">Capabilities</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                {agent.capabilities.slice(0, 3).map((cap, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span className="line-clamp-1">{cap}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-wrap gap-1">
              {agent.tags.slice(0, 3).map((tag, idx) => (
                <Badge key={idx} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
            <Button variant="ghost" size="sm" className="w-full mt-2 group">
              Open Agent
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

interface SolutionAgentsGridProps {
  solutionSlug?: string
  showSearch?: boolean
  showTabs?: boolean
  limit?: number
  compact?: boolean
}

export function SolutionAgentsGrid({
  solutionSlug,
  showSearch = true,
  showTabs = true,
  limit,
  compact = false
}: SolutionAgentsGridProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState(solutionSlug || "all")

  // Get agents based on filters
  let agents: SolutionAgent[] = []
  if (searchQuery) {
    agents = searchAgents(searchQuery)
  } else if (activeTab === "all") {
    agents = allSolutionAgents
  } else {
    agents = getAgentsBySolution(activeTab)
  }

  // Apply limit if specified
  if (limit) {
    agents = agents.slice(0, limit)
  }

  return (
    <div className="space-y-6">
      {showSearch && (
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search agents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <p className="text-sm text-muted-foreground">
            {agents.length} agent{agents.length !== 1 ? 's' : ''} found
          </p>
        </div>
      )}

      {showTabs && !searchQuery && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="flex flex-wrap h-auto gap-1 bg-transparent p-0">
            <TabsTrigger
              value="all"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              All ({allSolutionAgents.length})
            </TabsTrigger>
            {solutionAreas.map((area) => (
              <TabsTrigger
                key={area.slug}
                value={area.slug}
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                {area.name} ({area.agentCount})
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      )}

      <div className={`grid gap-4 ${compact ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
        {agents.map((agent) => (
          <SolutionAgentCard key={agent.id} agent={agent} compact={compact} />
        ))}
      </div>

      {agents.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No agents found matching your search.</p>
        </div>
      )}
    </div>
  )
}

// Component for displaying agents for a specific solution on solution pages
interface SolutionPageAgentsProps {
  solutionSlug: string
  title?: string
}

export function SolutionPageAgents({ solutionSlug, title }: SolutionPageAgentsProps) {
  const agents = getAgentsBySolution(solutionSlug)
  const solutionArea = solutionAreas.find(s => s.slug === solutionSlug)

  return (
    <section className="py-12 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">
            {title || `${solutionArea?.name || 'Solution'} AI Agents`}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {solutionArea?.description || 'Specialized AI agents to help you succeed'}
          </p>
        </div>
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {agents.map((agent) => (
            <SolutionAgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      </div>
    </section>
  )
}

// Compact list for sidebar or featured sections
interface AgentListCompactProps {
  agents: SolutionAgent[]
  title?: string
}

export function AgentListCompact({ agents, title }: AgentListCompactProps) {
  return (
    <div className="space-y-4">
      {title && <h3 className="font-semibold">{title}</h3>}
      <div className="space-y-2">
        {agents.map((agent) => {
          const colors = solutionColors[agent.solutionAreaSlug] || solutionColors.core
          return (
            <Link
              key={agent.id}
              href={`/dashboard/agents/${agent.id}`}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors"
            >
              <div className={`p-2 rounded-lg ${colors.bg} ${colors.text}`}>
                {getIcon(agent.icon)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{agent.name}</p>
                <p className="text-xs text-muted-foreground truncate">{agent.solutionArea}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export default SolutionAgentsGrid
