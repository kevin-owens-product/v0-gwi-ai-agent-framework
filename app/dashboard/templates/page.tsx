"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Search,
  Plus,
  MoreHorizontal,
  FileText,
  Users,
  TrendingUp,
  Sparkles,
  Copy,
  Star,
  StarOff,
  Play,
  Clock,
  User,
  Globe,
  BarChart3,
  Lightbulb,
  Megaphone,
  Target,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { PageTracker } from "@/components/tracking/PageTracker"

const templates = [
  {
    id: 1,
    name: "Creative Brief Generator",
    description: "Generate comprehensive creative briefs from audience insights and campaign objectives",
    icon: Megaphone,
    category: "briefs",
    uses: 234,
    starred: true,
    author: "Marketing Team",
    lastUsed: "2 hours ago",
    prompt:
      "Create a creative brief for [CAMPAIGN] targeting [AUDIENCE] with the objective of [GOAL]. Include key insights, messaging recommendations, and creative considerations.",
  },
  {
    id: 2,
    name: "Audience Profile Summary",
    description: "Create detailed audience profiles with demographics, psychographics, and behaviors",
    icon: Users,
    category: "research",
    uses: 189,
    starred: true,
    author: "Research Team",
    lastUsed: "5 hours ago",
    prompt:
      "Generate a comprehensive audience profile for [SEGMENT] including demographics, interests, values, media consumption, and purchase behaviors.",
  },
  {
    id: 3,
    name: "Trend Analysis Report",
    description: "Analyze emerging trends and their implications for your brand or category",
    icon: TrendingUp,
    category: "analysis",
    uses: 156,
    starred: false,
    author: "Strategy Team",
    lastUsed: "1 day ago",
    prompt:
      "Analyze the trend of [TREND] and its implications for [BRAND/CATEGORY]. Include data points, consumer sentiment, and strategic recommendations.",
  },
  {
    id: 4,
    name: "Competitive Landscape",
    description: "Map competitive positioning based on consumer perceptions and market data",
    icon: Target,
    category: "analysis",
    uses: 98,
    starred: false,
    author: "Strategy Team",
    lastUsed: "2 days ago",
    prompt:
      "Create a competitive analysis for [BRAND] in the [CATEGORY] space. Include brand perceptions, share of voice, and differentiation opportunities.",
  },
  {
    id: 5,
    name: "Market Entry Assessment",
    description: "Evaluate market opportunities for expansion into new regions or segments",
    icon: Globe,
    category: "research",
    uses: 67,
    starred: true,
    author: "International Team",
    lastUsed: "3 days ago",
    prompt:
      "Assess the opportunity for [BRAND] to enter the [MARKET] market. Include consumer readiness, competitive landscape, and cultural considerations.",
  },
  {
    id: 6,
    name: "Campaign Performance Debrief",
    description: "Analyze campaign results and extract learnings for future optimization",
    icon: BarChart3,
    category: "analysis",
    uses: 145,
    starred: false,
    author: "Performance Team",
    lastUsed: "4 days ago",
    prompt:
      "Create a campaign debrief for [CAMPAIGN] including performance metrics, audience response, and recommendations for optimization.",
  },
  {
    id: 7,
    name: "Consumer Insight Extraction",
    description: "Extract actionable insights from survey data or research findings",
    icon: Lightbulb,
    category: "research",
    uses: 201,
    starred: true,
    author: "Insights Team",
    lastUsed: "6 hours ago",
    prompt:
      "Extract key consumer insights from [DATA SOURCE] about [TOPIC]. Highlight surprising findings, opportunity areas, and strategic implications.",
  },
  {
    id: 8,
    name: "Presentation Narrative",
    description: "Generate compelling presentation narratives from research findings",
    icon: FileText,
    category: "briefs",
    uses: 178,
    starred: false,
    author: "Insights Team",
    lastUsed: "1 day ago",
    prompt:
      "Create a presentation narrative for [TOPIC] that tells a compelling story. Include an executive summary, key findings, and clear recommendations.",
  },
]

const categories = [
  { id: "all", name: "All Templates" },
  { id: "research", name: "Research" },
  { id: "analysis", name: "Analysis" },
  { id: "briefs", name: "Briefs & Docs" },
]

export default function TemplatesPage() {
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [starredTemplates, setStarredTemplates] = useState<number[]>(
    templates.filter((t) => t.starred).map((t) => t.id),
  )
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    description: "",
    category: "research",
    prompt: "",
  })

  const handleUseTemplate = (template: typeof templates[0]) => {
    // Navigate to playground with the template prompt pre-filled
    const encodedPrompt = encodeURIComponent(template.prompt)
    router.push(`/dashboard/playground?template=${template.id}&prompt=${encodedPrompt}`)
  }

  const handleDuplicate = (template: typeof templates[0]) => {
    setNewTemplate({
      name: `${template.name} (Copy)`,
      description: template.description,
      category: template.category,
      prompt: template.prompt,
    })
    setCreateDialogOpen(true)
  }

  const handleCreateTemplate = async () => {
    if (!newTemplate.name.trim() || !newTemplate.prompt.trim()) return

    setIsSaving(true)
    try {
      const response = await fetch("/api/v1/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTemplate),
      })
      if (response.ok) {
        setCreateDialogOpen(false)
        setNewTemplate({ name: "", description: "", category: "research", prompt: "" })
        // In production, would refresh the templates list
      }
    } catch (error) {
      console.error("Failed to create template:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const filteredTemplates = templates.filter((template) => {
    const matchesCategory = selectedCategory === "all" || template.category === selectedCategory
    const matchesSearch =
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const toggleStar = (id: number) => {
    setStarredTemplates((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]))
  }

  return (
    <div className="space-y-6">
      <PageTracker pageName="Templates List" metadata={{ selectedCategory, searchQuery: !!searchQuery }} />
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Prompt Templates</h1>
          <p className="text-muted-foreground">Reusable templates for common insights tasks</p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Plus className="w-4 h-4 mr-2" />
              Create Template
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create Template</DialogTitle>
              <DialogDescription>Save a prompt as a reusable template for your team</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Template Name</Label>
                <Input
                  placeholder="e.g., Audience Deep Dive"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  placeholder="What does this template do?"
                  value={newTemplate.description}
                  onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={newTemplate.category}
                  onChange={(e) => setNewTemplate({ ...newTemplate, category: e.target.value })}
                >
                  <option value="research">Research</option>
                  <option value="analysis">Analysis</option>
                  <option value="briefs">Briefs & Docs</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Prompt Template</Label>
                <Textarea
                  placeholder="Use [BRACKETS] for variables that users will fill in..."
                  className="min-h-[120px]"
                  value={newTemplate.prompt}
                  onChange={(e) => setNewTemplate({ ...newTemplate, prompt: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Tip: Use [VARIABLE_NAME] syntax for parts that should be customized when using the template
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)} disabled={isSaving}>
                Cancel
              </Button>
              <Button
                className="bg-accent text-accent-foreground hover:bg-accent/90"
                onClick={handleCreateTemplate}
                disabled={isSaving || !newTemplate.name.trim() || !newTemplate.prompt.trim()}
              >
                {isSaving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating...</> : "Create Template"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            className="pl-9 bg-background"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList className="bg-muted/50">
            {categories.map((cat) => (
              <TabsTrigger key={cat.id} value={cat.id}>
                {cat.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Starred Templates */}
      {starredTemplates.length > 0 && selectedCategory === "all" && (
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            Starred Templates
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {templates
              .filter((t) => starredTemplates.includes(t.id))
              .map((template) => (
                <Card
                  key={template.id}
                  className="bg-card border-border hover:border-accent/50 transition-colors cursor-pointer group"
                  onClick={() => handleUseTemplate(template)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="p-2 rounded-lg bg-accent/10">
                        <template.icon className="w-5 h-5 text-accent" />
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleStar(template.id)
                          }}
                        >
                          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleUseTemplate(template)}>
                              <Play className="w-4 h-4 mr-2" />
                              Use Template
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDuplicate(template)}>
                              <Copy className="w-4 h-4 mr-2" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    <h3 className="font-semibold text-foreground mb-1">{template.name}</h3>
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{template.description}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        {template.uses} uses
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {template.lastUsed}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      )}

      {/* All Templates */}
      <div className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground">
          {selectedCategory === "all" ? "All Templates" : categories.find((c) => c.id === selectedCategory)?.name}
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTemplates.map((template) => (
            <Card
              key={template.id}
              className="bg-card border-border hover:border-accent/50 transition-colors cursor-pointer group"
              onClick={() => handleUseTemplate(template)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2 rounded-lg bg-muted">
                    <template.icon className="w-5 h-5 text-foreground" />
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleStar(template.id)
                      }}
                    >
                      {starredTemplates.includes(template.id) ? (
                        <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      ) : (
                        <StarOff className="w-4 h-4 text-muted-foreground" />
                      )}
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleUseTemplate(template)}>
                          <Play className="w-4 h-4 mr-2" />
                          Use Template
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicate(template)}>
                          <Copy className="w-4 h-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                <h3 className="font-semibold text-foreground mb-1">{template.name}</h3>
                <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{template.description}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {template.author}
                  </span>
                  <Badge variant="secondary" className="text-[10px]">
                    {template.category}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
