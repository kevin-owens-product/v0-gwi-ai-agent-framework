"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Download, Trash2, Eye, Calendar, Tag, User } from "lucide-react"
import { cn } from "@/lib/utils"

const allMemories = [
  {
    id: "m1",
    type: "insight",
    content:
      "Gen Z consumers show 67% higher engagement with sustainability messaging when it includes specific environmental impact metrics rather than general claims.",
    source: "Audience Strategist",
    project: "Gen Z Sustainability",
    tags: ["gen-z", "sustainability", "messaging"],
    timestamp: "Dec 2, 2025 2:34 PM",
    confidence: 94,
    citations: ["GWI Core Q4 2024", "GWI Zeitgeist Nov 2024"],
  },
  {
    id: "m2",
    type: "preference",
    content:
      "User prefers concise bullet-point summaries over narrative formats for audience insights. Maximum 5 key points preferred.",
    source: "System",
    project: "Global",
    tags: ["preference", "format"],
    timestamp: "Dec 1, 2025 10:15 AM",
    confidence: 100,
    citations: [],
  },
  {
    id: "m3",
    type: "finding",
    content:
      "Cross-market comparison reveals EU markets are 2.3x more likely to pay premium for sustainable products compared to NA markets.",
    source: "Market Expander",
    project: "Gen Z Sustainability",
    tags: ["eu", "na", "premium", "comparison"],
    timestamp: "Nov 30, 2025 4:22 PM",
    confidence: 89,
    citations: ["GWI Core Q4 2024"],
  },
  {
    id: "m4",
    type: "context",
    content:
      "The Q4 Campaign is targeting millennials aged 28-35 in urban areas with household income above $80K who show interest in wellness products.",
    source: "Creative Brief Builder",
    project: "Q4 Campaign Planning",
    tags: ["millennials", "targeting", "wellness"],
    timestamp: "Nov 28, 2025 11:45 AM",
    confidence: 100,
    citations: [],
  },
  {
    id: "m5",
    type: "insight",
    content:
      "Competitor X has increased social media ad spend by 340% YoY, focusing primarily on TikTok and Instagram Reels for Gen Z engagement.",
    source: "Competitive Tracker",
    project: "Competitor Analysis",
    tags: ["competitor", "social-media", "advertising"],
    timestamp: "Nov 27, 2025 3:18 PM",
    confidence: 87,
    citations: ["Market Intelligence Report Q3"],
  },
]

const typeColors = {
  insight: "bg-chart-1/20 text-chart-1",
  preference: "bg-chart-2/20 text-chart-2",
  finding: "bg-chart-3/20 text-chart-3",
  context: "bg-chart-4/20 text-chart-4",
}

export function MemoryBrowser() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedMemory, setSelectedMemory] = useState<string | null>(null)
  const [selectedType, setSelectedType] = useState("all")
  const [selectedProject, setSelectedProject] = useState("all")

  const filteredMemories = allMemories.filter((memory) => {
    const matchesSearch =
      memory.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      memory.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesType = selectedType === "all" || memory.type === selectedType
    const matchesProject = selectedProject === "all" || memory.project === selectedProject
    return matchesSearch && matchesType && matchesProject
  })

  const selected = allMemories.find((m) => m.id === selectedMemory)

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <CardTitle>Memory Browser</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2 bg-transparent">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search memories by content or tags..."
              className="pl-10 bg-secondary"
            />
          </div>
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-[130px] bg-secondary">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="insight">Insights</SelectItem>
              <SelectItem value="finding">Findings</SelectItem>
              <SelectItem value="context">Context</SelectItem>
              <SelectItem value="preference">Preferences</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedProject} onValueChange={setSelectedProject}>
            <SelectTrigger className="w-[180px] bg-secondary">
              <SelectValue placeholder="Project" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              <SelectItem value="Gen Z Sustainability">Gen Z Sustainability</SelectItem>
              <SelectItem value="Q4 Campaign Planning">Q4 Campaign Planning</SelectItem>
              <SelectItem value="Competitor Analysis">Competitor Analysis</SelectItem>
              <SelectItem value="Global">Global</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Memory Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Memory List */}
          <div className="lg:col-span-2 space-y-3">
            {filteredMemories.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No memories found matching your search criteria.
              </div>
            ) : (
              filteredMemories.map((memory) => (
                <button
                  key={memory.id}
                  onClick={() => setSelectedMemory(memory.id)}
                  className={cn(
                    "w-full text-left p-4 rounded-lg border transition-all",
                    selectedMemory === memory.id
                      ? "border-accent bg-accent/5"
                      : "border-border bg-secondary/30 hover:border-muted-foreground/30",
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={cn("text-xs", typeColors[memory.type as keyof typeof typeColors])}>
                          {memory.type}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{memory.project}</span>
                      </div>
                      <p className="text-sm text-foreground line-clamp-2">{memory.content}</p>
                      <div className="flex items-center gap-2 mt-2">
                        {memory.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                            {tag}
                          </span>
                        ))}
                        {memory.tags.length > 3 && (
                          <span className="text-xs text-muted-foreground">+{memory.tags.length - 3}</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="text-xs font-medium text-chart-5">{memory.confidence}%</span>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Memory Detail */}
          <div className="lg:col-span-1">
            {selected ? (
              <div className="sticky top-6 p-4 rounded-lg border border-border bg-secondary/30 space-y-4">
                <div className="flex items-center justify-between">
                  <Badge className={cn("text-xs", typeColors[selected.type as keyof typeof typeColors])}>
                    {selected.type}
                  </Badge>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <p className="text-sm text-foreground">{selected.content}</p>

                <div className="space-y-3 pt-3 border-t border-border">
                  <div className="flex items-center gap-2 text-xs">
                    <User className="h-3 w-3 text-muted-foreground" />
                    <span className="text-muted-foreground">Source:</span>
                    <span className="text-foreground">{selected.source}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    <span className="text-muted-foreground">Created:</span>
                    <span className="text-foreground">{selected.timestamp}</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs">
                    <Tag className="h-3 w-3 text-muted-foreground mt-0.5" />
                    <span className="text-muted-foreground">Tags:</span>
                    <div className="flex flex-wrap gap-1">
                      {selected.tags.map((tag) => (
                        <span key={tag} className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {selected.citations.length > 0 && (
                  <div className="pt-3 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-2">Citations:</p>
                    <div className="space-y-1">
                      {selected.citations.map((citation) => (
                        <div key={citation} className="text-xs px-2 py-1 rounded bg-muted text-foreground">
                          {citation}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-3 border-t border-border">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Confidence Score</span>
                    <span className="font-medium text-chart-5">{selected.confidence}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-muted mt-2 overflow-hidden">
                    <div className="h-full rounded-full bg-chart-5" style={{ width: `${selected.confidence}%` }} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 rounded-lg border border-dashed border-border text-center">
                <Eye className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Select a memory to view details</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
