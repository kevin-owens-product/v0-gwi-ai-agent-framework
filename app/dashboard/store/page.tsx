"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Search,
  Star,
  Download,
  Sparkles,
  Filter,
  ChevronRight,
  Building2,
  Verified,
  Play,
  Check,
} from "lucide-react"
import Link from "next/link"
import {
  getAllStoreAgents,
  getFeaturedAgents,
  iconMap,
  installAgent,
  isAgentInstalled,
} from "@/lib/store-agents"
import { PageTracker } from "@/components/tracking/PageTracker"

const categories = [
  { id: "all", label: "All Agents", count: 11 },
  { id: "Audience & Targeting", label: "Audience & Targeting", count: 4 },
  { id: "Creative & Content", label: "Creative & Content", count: 1 },
  { id: "Competitive Intel", label: "Competitive Intel", count: 2 },
  { id: "Trends & Insights", label: "Trends & Insights", count: 2 },
  { id: "Media & Advertising", label: "Media & Advertising", count: 1 },
  { id: "Reporting & Analytics", label: "Reporting & Analytics", count: 1 },
]

export default function AgentStorePage() {
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("popular")
  const [installedAgents, setInstalledAgents] = useState<Set<string>>(new Set())

  const featuredAgents = getFeaturedAgents()
  const allAgents = getAllStoreAgents()

  // Load installed status on mount
  useEffect(() => {
    const loadInstalled = () => {
      const installed = new Set<string>()
      allAgents.forEach(agent => {
        if (isAgentInstalled(agent.id)) {
          installed.add(agent.id)
        }
      })
      setInstalledAgents(installed)
    }

    loadInstalled()

    // Listen for changes
    const handleChange = () => loadInstalled()
    window.addEventListener("agent-installed", handleChange)
    window.addEventListener("agent-uninstalled", handleChange)

    return () => {
      window.removeEventListener("agent-installed", handleChange)
      window.removeEventListener("agent-uninstalled", handleChange)
    }
  }, [])

  const filteredAgents = allAgents
    .filter((agent) => {
      // Exclude featured agents from main list
      if (featuredAgents.some(f => f.id === agent.id)) return false
      const matchesCategory = selectedCategory === "all" || agent.category === selectedCategory
      const matchesSearch =
        agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.description.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesCategory && matchesSearch
    })
    .sort((a, b) => {
      if (sortBy === "popular") {
        const aInstalls = parseFloat(a.installs.replace("k", "")) * (a.installs.includes("k") ? 1000 : 1)
        const bInstalls = parseFloat(b.installs.replace("k", "")) * (b.installs.includes("k") ? 1000 : 1)
        return bInstalls - aInstalls
      }
      if (sortBy === "rating") return b.rating - a.rating
      if (sortBy === "name") return a.name.localeCompare(b.name)
      return 0
    })

  const handleTryInPlayground = (agentId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    installAgent(agentId)
    setInstalledAgents(prev => new Set([...prev, agentId]))
    router.push(`/dashboard/playground?agent=${agentId}`)
  }

  const handleInstall = (agentId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    installAgent(agentId)
    setInstalledAgents(prev => new Set([...prev, agentId]))
  }

  return (
    <div className="space-y-8">
      <PageTracker pageName="Agent Store" metadata={{ selectedCategory, sortBy, searchQuery: !!searchQuery }} />
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Agent Store</h1>
        <p className="text-muted-foreground">Discover and install pre-built agents to supercharge your research</p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search agents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="popular">Most Popular</SelectItem>
            <SelectItem value="rating">Highest Rated</SelectItem>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="name">Name A-Z</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Featured Agents */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Featured Agents</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {featuredAgents.map((agent) => {
            const IconComponent = iconMap[agent.iconName]
            const isInstalled = installedAgents.has(agent.id)
            return (
              <Card key={agent.id} className="relative overflow-hidden border-primary/20 hover:border-primary/40 transition-colors">
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-bl-lg">
                  Featured
                </div>
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      {IconComponent && <IconComponent className="h-6 w-6 text-primary" />}
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {agent.name}
                        {agent.verified && <Verified className="h-4 w-4 text-primary" />}
                      </CardTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{agent.author}</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{agent.description}</p>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{agent.rating}</span>
                      <span className="text-muted-foreground">({agent.reviewCount})</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Download className="h-4 w-4" />
                      <span>{agent.installs}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex items-center justify-between gap-2">
                  <Badge variant="secondary">{agent.price}</Badge>
                  <div className="flex items-center gap-2">
                    {isInstalled ? (
                      <Badge variant="outline" className="gap-1">
                        <Check className="h-3 w-3" />
                        Installed
                      </Badge>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => handleInstall(agent.id, e)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                    <Button size="sm" onClick={(e) => handleTryInPlayground(agent.id, e)}>
                      <Play className="mr-1 h-4 w-4" />
                      Try Now
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      </section>

      {/* Categories and Agents Grid */}
      <div className="grid lg:grid-cols-[240px_1fr] gap-8">
        {/* Categories Sidebar */}
        <aside className="space-y-2">
          <h3 className="font-medium mb-3 flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Categories
          </h3>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                selectedCategory === category.id ? "bg-primary text-primary-foreground" : "hover:bg-muted"
              }`}
            >
              <span>{category.label}</span>
              <span
                className={selectedCategory === category.id ? "text-primary-foreground/80" : "text-muted-foreground"}
              >
                {category.count}
              </span>
            </button>
          ))}
        </aside>

        {/* Agents Grid */}
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredAgents.map((agent) => {
            const IconComponent = iconMap[agent.iconName]
            const isInstalled = installedAgents.has(agent.id)
            return (
              <Card key={agent.id} className="hover:border-primary/50 transition-colors group">
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                      {IconComponent && <IconComponent className="h-5 w-5 text-muted-foreground" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base flex items-center gap-1.5 truncate">
                        {agent.name}
                        {agent.verified && <Verified className="h-3.5 w-3.5 text-primary flex-shrink-0" />}
                      </CardTitle>
                      <div className="text-xs text-muted-foreground truncate">{agent.author}</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-3">
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{agent.description}</p>
                  <div className="flex items-center gap-3 text-xs">
                    <div className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{agent.rating}</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Download className="h-3.5 w-3.5" />
                      <span>{agent.installs}</span>
                    </div>
                    <Badge variant={agent.price === "Included" ? "secondary" : "outline"} className="text-xs">
                      {agent.price}
                    </Badge>
                  </div>
                </CardContent>
                <CardFooter className="pt-0 flex items-center justify-between gap-2">
                  <Button variant="ghost" size="sm" asChild className="flex-1">
                    <Link href={`/dashboard/store/${agent.id}`}>View Details</Link>
                  </Button>
                  <div className="flex items-center gap-1">
                    {isInstalled ? (
                      <Badge variant="outline" className="text-xs gap-1">
                        <Check className="h-3 w-3" />
                        Added
                      </Badge>
                    ) : null}
                    <Button
                      size="sm"
                      variant="default"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => handleTryInPlayground(agent.id, e)}
                    >
                      <Play className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Community Agents */}
      <section className="mt-12">
        <Card className="bg-muted/30">
          <CardContent className="py-8">
            <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Building2 className="h-8 w-8 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2">Build Your Own Agent</h3>
                <p className="text-muted-foreground">
                  Create custom agents tailored to your specific research needs and share them with your team.
                </p>
              </div>
              <Button asChild>
                <Link href="/dashboard/agents/new">
                  Create Agent
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
