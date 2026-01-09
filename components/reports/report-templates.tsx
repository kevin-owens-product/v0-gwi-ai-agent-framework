"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Users, Target, BarChart3, Globe, Lightbulb, Zap, TrendingUp, Layers, Search, ArrowRight } from "lucide-react"

const templates = [
  {
    id: "persona-deep-dive",
    name: "Persona Deep Dive",
    description: "Create detailed persona cards with demographics, psychographics, media habits, and brand affinities",
    icon: Users,
    category: "Audience",
    popular: true,
    outputs: ["Persona Cards", "PDF Report", "Slide Deck"],
  },
  {
    id: "segment-comparison",
    name: "Segment Comparison",
    description: "Compare multiple audience segments side-by-side across key metrics and behaviors",
    icon: Layers,
    category: "Audience",
    popular: true,
    outputs: ["Comparison Table", "Interactive Dashboard", "Export"],
  },
  {
    id: "market-snapshot",
    name: "Market Snapshot",
    description: "Get a quick overview of market size, growth trends, and key players in any industry",
    icon: Globe,
    category: "Market",
    popular: false,
    outputs: ["Dashboard", "PDF Summary", "Data Export"],
  },
  {
    id: "trend-forecast",
    name: "Trend Forecast",
    description: "Identify emerging trends and predict future consumer behaviors with confidence intervals",
    icon: TrendingUp,
    category: "Trends",
    popular: true,
    outputs: ["Trend Report", "Forecast Charts", "Slide Deck"],
  },
  {
    id: "competitive-intel",
    name: "Competitive Intelligence",
    description: "Analyze competitor positioning, audience overlap, and market share dynamics",
    icon: Target,
    category: "Strategy",
    popular: false,
    outputs: ["Competitive Matrix", "SWOT Analysis", "PDF Report"],
  },
  {
    id: "campaign-planner",
    name: "Campaign Planner",
    description: "Build data-driven campaign briefs with audience targeting, messaging, and channel mix",
    icon: Zap,
    category: "Strategy",
    popular: false,
    outputs: ["Creative Brief", "Media Plan", "Presentation"],
  },
  {
    id: "brand-health",
    name: "Brand Health Tracker",
    description: "Monitor brand perception, awareness, and sentiment across your target audience",
    icon: BarChart3,
    category: "Brand",
    popular: true,
    outputs: ["Health Dashboard", "Trend Report", "Alerts"],
  },
  {
    id: "insight-generator",
    name: "Insight Generator",
    description: "Automatically surface key insights and opportunities from GWI data",
    icon: Lightbulb,
    category: "Discovery",
    popular: false,
    outputs: ["Insight Cards", "Opportunity Map", "PDF Export"],
  },
]

export function ReportTemplates() {
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const categories = [...new Set(templates.map((t) => t.category))]

  const filteredTemplates = templates.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) || t.description.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = !selectedCategory || t.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(null)}
          >
            All
          </Button>
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="group hover:shadow-lg transition-all hover:border-primary/50">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <template.icon className="h-5 w-5 text-primary" />
                </div>
                {template.popular && (
                  <Badge variant="secondary" className="text-xs">
                    Popular
                  </Badge>
                )}
              </div>
              <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">{template.name}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{template.description}</p>
              <div className="flex flex-wrap gap-1">
                {template.outputs.map((output) => (
                  <span key={output} className="text-xs bg-muted px-2 py-0.5 rounded">
                    {output}
                  </span>
                ))}
              </div>
            </CardContent>
            <CardFooter className="p-4 pt-0">
              <Button
                variant="ghost"
                size="sm"
                className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
              >
                Use Template
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
