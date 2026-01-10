"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Download, Trash2, Eye, Calendar, Tag, User, Loader2, RefreshCw, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Memory {
  id: string
  type: "insight" | "preference" | "finding" | "context" | "CONTEXT" | "PREFERENCE" | "FACT" | "CONVERSATION" | "CACHE"
  content: string
  source: string
  project: string
  tags: string[]
  timestamp: string
  confidence: number
  citations: string[]
  key?: string
  value?: any
  metadata?: Record<string, any>
}

// Fallback mock data
const mockMemories: Memory[] = [
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

const typeColors: Record<string, string> = {
  insight: "bg-chart-1/20 text-chart-1",
  preference: "bg-chart-2/20 text-chart-2",
  finding: "bg-chart-3/20 text-chart-3",
  context: "bg-chart-4/20 text-chart-4",
  CONTEXT: "bg-chart-4/20 text-chart-4",
  PREFERENCE: "bg-chart-2/20 text-chart-2",
  FACT: "bg-chart-1/20 text-chart-1",
  CONVERSATION: "bg-chart-3/20 text-chart-3",
  CACHE: "bg-chart-5/20 text-chart-5",
}

function formatApiMemory(apiMemory: any): Memory {
  const value = apiMemory.value || {}
  return {
    id: apiMemory.id,
    type: apiMemory.type?.toLowerCase() || "context",
    content: typeof value === "string" ? value : (value.content || value.text || JSON.stringify(value)),
    source: apiMemory.metadata?.source || apiMemory.agentId || "System",
    project: apiMemory.metadata?.project || "Global",
    tags: apiMemory.metadata?.tags || [apiMemory.key || "untagged"],
    timestamp: formatDate(apiMemory.updatedAt || apiMemory.createdAt),
    confidence: apiMemory.metadata?.confidence || 85,
    citations: apiMemory.metadata?.citations || [],
    key: apiMemory.key,
    value: apiMemory.value,
    metadata: apiMemory.metadata,
  }
}

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    })
  } catch {
    return dateString
  }
}

export function MemoryBrowser() {
  const [memories, setMemories] = useState<Memory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedMemory, setSelectedMemory] = useState<string | null>(null)
  const [selectedType, setSelectedType] = useState("all")
  const [selectedProject, setSelectedProject] = useState("all")
  const [deleteMemoryId, setDeleteMemoryId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Fetch memories from API
  const fetchMemories = useCallback(async (refresh = false) => {
    if (refresh) setIsRefreshing(true)
    else setIsLoading(true)

    try {
      const params = new URLSearchParams({ limit: "100" })
      if (selectedType !== "all") params.append("type", selectedType.toUpperCase())

      const response = await fetch(`/api/v1/memory?${params}`)
      if (response.ok) {
        const data = await response.json()
        const apiMemories = data.memories || data.data || []
        if (apiMemories.length > 0) {
          setMemories(apiMemories.map(formatApiMemory))
        } else {
          // Fall back to mock data if API returns empty
          setMemories(mockMemories)
        }
      } else {
        // Fall back to mock data on error
        setMemories(mockMemories)
      }
    } catch (error) {
      console.error("Failed to fetch memories:", error)
      setMemories(mockMemories)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [selectedType])

  useEffect(() => {
    fetchMemories()
  }, [fetchMemories])

  // Delete memory
  const handleDelete = async () => {
    if (!deleteMemoryId) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/v1/memory?id=${deleteMemoryId}`, {
        method: "DELETE",
      })
      if (response.ok) {
        setMemories(prev => prev.filter(m => m.id !== deleteMemoryId))
        if (selectedMemory === deleteMemoryId) {
          setSelectedMemory(null)
        }
      }
    } catch (error) {
      console.error("Failed to delete memory:", error)
    } finally {
      setIsDeleting(false)
      setDeleteMemoryId(null)
    }
  }

  // Export memories
  const handleExport = () => {
    const exportData = {
      exportedAt: new Date().toISOString(),
      memories: filteredMemories,
    }
    const content = JSON.stringify(exportData, null, 2)
    const blob = new Blob([content], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `memories-export-${new Date().toISOString().split("T")[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Get unique projects
  const projects = [...new Set(memories.map(m => m.project))]

  const filteredMemories = memories.filter((memory) => {
    const matchesSearch =
      searchQuery === "" ||
      memory.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      memory.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesType = selectedType === "all" || memory.type.toLowerCase() === selectedType.toLowerCase()
    const matchesProject = selectedProject === "all" || memory.project === selectedProject
    return matchesSearch && matchesType && matchesProject
  })

  const selected = memories.find((m) => m.id === selectedMemory)

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <CardTitle>Memory Browser</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 bg-transparent"
              onClick={() => fetchMemories(true)}
              disabled={isRefreshing}
            >
              <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
              Refresh
            </Button>
            <Button variant="outline" size="sm" className="gap-2 bg-transparent" onClick={handleExport}>
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
              <SelectItem value="fact">Facts</SelectItem>
              <SelectItem value="conversation">Conversations</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedProject} onValueChange={setSelectedProject}>
            <SelectTrigger className="w-[180px] bg-secondary">
              <SelectValue placeholder="Project" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              {projects.map((project) => (
                <SelectItem key={project} value={project}>
                  {project}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Memory Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Memory List */}
          <div className="lg:col-span-2 space-y-3">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredMemories.length === 0 ? (
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
                        <Badge className={cn("text-xs", typeColors[memory.type] || typeColors.context)}>
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
                  <Badge className={cn("text-xs", typeColors[selected.type] || typeColors.context)}>
                    {selected.type}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => setDeleteMemoryId(selected.id)}
                  >
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

        {/* Results summary */}
        <div className="mt-4 pt-4 border-t text-sm text-muted-foreground">
          Showing {filteredMemories.length} of {memories.length} memories
        </div>
      </CardContent>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteMemoryId} onOpenChange={() => setDeleteMemoryId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Memory</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this memory? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
