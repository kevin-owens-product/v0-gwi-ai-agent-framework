"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Search,
  Star,
  Download,
  TrendingUp,
  Sparkles,
  Target,
  FileText,
  BarChart3,
  Users,
  Globe,
  Megaphone,
  ShoppingCart,
  Palette,
  Brain,
  Filter,
  ChevronRight,
  Building2,
  Verified,
} from "lucide-react"
import Link from "next/link"

const categories = [
  { id: "all", label: "All Agents", count: 48 },
  { id: "audience", label: "Audience & Targeting", count: 12 },
  { id: "creative", label: "Creative & Content", count: 8 },
  { id: "competitive", label: "Competitive Intel", count: 6 },
  { id: "trends", label: "Trends & Insights", count: 10 },
  { id: "media", label: "Media & Advertising", count: 7 },
  { id: "reporting", label: "Reporting & Analytics", count: 5 },
]

const featuredAgents = [
  {
    id: "audience-strategist-pro",
    name: "Audience Strategist Pro",
    description: "Advanced audience segmentation with predictive modeling and lookalike expansion",
    author: "GWI Labs",
    verified: true,
    rating: 4.9,
    reviews: 284,
    installs: "12.4k",
    category: "audience",
    icon: Target,
    featured: true,
    price: "Included",
    tags: ["audience", "segmentation", "personas"],
  },
  {
    id: "brand-tracker-360",
    name: "Brand Tracker 360",
    description: "Comprehensive brand health monitoring with sentiment analysis and share of voice",
    author: "GWI Labs",
    verified: true,
    rating: 4.8,
    reviews: 156,
    installs: "8.2k",
    category: "competitive",
    icon: TrendingUp,
    featured: true,
    price: "Included",
    tags: ["brand", "tracking", "sentiment"],
  },
  {
    id: "creative-intelligence",
    name: "Creative Intelligence",
    description: "AI-powered creative brief generation with audience-matched messaging strategies",
    author: "GWI Labs",
    verified: true,
    rating: 4.7,
    reviews: 203,
    installs: "9.8k",
    category: "creative",
    icon: Palette,
    featured: true,
    price: "Included",
    tags: ["creative", "briefs", "messaging"],
  },
]

const allAgents = [
  {
    id: "trend-forecaster",
    name: "Trend Forecaster",
    description: "Predict emerging consumer trends before they hit mainstream",
    author: "GWI Labs",
    verified: true,
    rating: 4.6,
    reviews: 98,
    installs: "5.4k",
    category: "trends",
    icon: Sparkles,
    price: "Included",
    tags: ["trends", "forecasting"],
  },
  {
    id: "media-mix-optimizer",
    name: "Media Mix Optimizer",
    description: "Data-driven media planning and channel allocation recommendations",
    author: "GWI Labs",
    verified: true,
    rating: 4.5,
    reviews: 67,
    installs: "3.2k",
    category: "media",
    icon: Megaphone,
    price: "Included",
    tags: ["media", "planning", "optimization"],
  },
  {
    id: "consumer-journey-mapper",
    name: "Consumer Journey Mapper",
    description: "Map complete customer journeys with touchpoint analysis",
    author: "GWI Labs",
    verified: true,
    rating: 4.7,
    reviews: 112,
    installs: "6.1k",
    category: "audience",
    icon: Users,
    price: "Included",
    tags: ["journey", "touchpoints", "mapping"],
  },
  {
    id: "global-market-scanner",
    name: "Global Market Scanner",
    description: "Cross-market analysis and international expansion insights",
    author: "GWI Labs",
    verified: true,
    rating: 4.4,
    reviews: 45,
    installs: "2.8k",
    category: "trends",
    icon: Globe,
    price: "Pro",
    tags: ["global", "markets", "expansion"],
  },
  {
    id: "competitive-radar",
    name: "Competitive Radar",
    description: "Real-time competitive monitoring with automated alerts",
    author: "GWI Labs",
    verified: true,
    rating: 4.6,
    reviews: 89,
    installs: "4.7k",
    category: "competitive",
    icon: BarChart3,
    price: "Included",
    tags: ["competitive", "monitoring", "alerts"],
  },
  {
    id: "insight-summarizer",
    name: "Insight Summarizer",
    description: "Automatically summarize complex research into executive-ready insights",
    author: "GWI Labs",
    verified: true,
    rating: 4.8,
    reviews: 178,
    installs: "7.9k",
    category: "reporting",
    icon: FileText,
    price: "Included",
    tags: ["insights", "summaries", "reports"],
  },
  {
    id: "purchase-intent-analyzer",
    name: "Purchase Intent Analyzer",
    description: "Predict purchase likelihood and identify high-value segments",
    author: "DataMinds Inc",
    verified: true,
    rating: 4.3,
    reviews: 34,
    installs: "1.9k",
    category: "audience",
    icon: ShoppingCart,
    price: "Pro",
    tags: ["purchase", "intent", "prediction"],
  },
  {
    id: "neural-persona-builder",
    name: "Neural Persona Builder",
    description: "AI-generated personas with deep psychological profiling",
    author: "Cognitive AI",
    verified: false,
    rating: 4.1,
    reviews: 23,
    installs: "890",
    category: "audience",
    icon: Brain,
    price: "Enterprise",
    tags: ["personas", "AI", "psychology"],
  },
]

export default function AgentStorePage() {
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("popular")

  const filteredAgents = allAgents.filter((agent) => {
    const matchesCategory = selectedCategory === "all" || agent.category === selectedCategory
    const matchesSearch =
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="space-y-8">
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
          {featuredAgents.map((agent) => (
            <Card key={agent.id} className="relative overflow-hidden border-primary/20">
              <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-bl-lg">
                Featured
              </div>
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <agent.icon className="h-6 w-6 text-primary" />
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
                    <span className="text-muted-foreground">({agent.reviews})</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Download className="h-4 w-4" />
                    <span>{agent.installs}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex items-center justify-between">
                <Badge variant="secondary">{agent.price}</Badge>
                <Button size="sm" asChild>
                  <Link href={`/dashboard/store/${agent.id}`}>
                    View Details
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
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
          {filteredAgents.map((agent) => (
            <Card key={agent.id} className="hover:border-primary/50 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                    <agent.icon className="h-5 w-5 text-muted-foreground" />
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
              <CardFooter className="pt-0">
                <Button variant="ghost" size="sm" className="w-full" asChild>
                  <Link href={`/dashboard/store/${agent.id}`}>View Details</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
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
