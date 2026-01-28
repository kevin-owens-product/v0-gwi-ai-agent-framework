"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
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

interface Template {
  id: string
  name: string
  description: string | null
  category: string
  prompt: string
  tags: string[]
  usageCount: number
  isFavorite: boolean
  lastUsed: string | null
  creator: {
    id: string
    name: string | null
    email: string
  }
  createdAt: string
}

const categoryIcons: Record<string, typeof Megaphone> = {
  BRIEFS: Megaphone,
  RESEARCH: Users,
  ANALYSIS: TrendingUp,
  CUSTOM: FileText,
}

const categories = [
  { id: "all", name: "All Templates" },
  { id: "research", name: "Research" },
  { id: "analysis", name: "Analysis" },
  { id: "briefs", name: "Briefs & Docs" },
]

export default function TemplatesPage() {
  const t = useTranslations("dashboard.templates")
  const tCommon = useTranslations("common")
  const router = useRouter()
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [starredTemplates, setStarredTemplates] = useState<string[]>([])
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    description: "",
    category: "research",
    prompt: "",
  })

  useEffect(() => {
    fetchTemplates()
  }, [selectedCategory])

  const fetchTemplates = async () => {
    try {
      setLoading(true)
      const categoryParam = selectedCategory === "all" ? "" : `&category=${selectedCategory}`
      const searchParam = searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ""
      const response = await fetch(`/api/v1/templates?${categoryParam}${searchParam}`)
      if (!response.ok) {
        throw new Error('Failed to fetch templates')
      }
      const data = await response.json()
      const fetchedTemplates = (data.templates || data.data || []).map((t: any) => ({
        ...t,
        category: t.category.toLowerCase(),
      }))
      setTemplates(fetchedTemplates)
      // Update starred templates from isFavorite field
      setStarredTemplates(fetchedTemplates.filter((t: Template) => t.isFavorite).map((t: Template) => t.id))
    } catch (error) {
      console.error('Error fetching templates:', error)
      toast.error('Failed to load templates')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery !== undefined) {
        fetchTemplates()
      }
    }, 300)
    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  const handleUseTemplate = (template: Template) => {
    // Navigate to playground with the template prompt pre-filled
    const encodedPrompt = encodeURIComponent(template.prompt)
    router.push(`/dashboard/playground?template=${template.id}&prompt=${encodedPrompt}`)
  }

  const handleDuplicate = (template: Template) => {
    setNewTemplate({
      name: `${template.name} (Copy)`,
      description: template.description || "",
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
        body: JSON.stringify({
          name: newTemplate.name,
          description: newTemplate.description || undefined,
          category: newTemplate.category,
          prompt: newTemplate.prompt,
        }),
      })
      if (response.ok) {
        toast.success('Template created successfully')
        setCreateDialogOpen(false)
        setNewTemplate({ name: "", description: "", category: "research", prompt: "" })
        await fetchTemplates()
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create template')
      }
    } catch (error: any) {
      console.error("Failed to create template:", error)
      toast.error(error.message || 'Failed to create template')
    } finally {
      setIsSaving(false)
    }
  }

  const toggleStar = async (id: string) => {
    const isCurrentlyStarred = starredTemplates.includes(id)
    const newStarred = isCurrentlyStarred 
      ? starredTemplates.filter((t) => t !== id)
      : [...starredTemplates, id]
    setStarredTemplates(newStarred)

    // Update in database
    try {
      await fetch(`/api/v1/templates/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFavorite: !isCurrentlyStarred }),
      })
    } catch (error) {
      console.error('Failed to update favorite status:', error)
      // Revert on error
      setStarredTemplates(starredTemplates)
    }
  }

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return

    try {
      const response = await fetch(`/api/v1/templates/${id}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        toast.success('Template deleted successfully')
        await fetchTemplates()
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete template')
      }
    } catch (error: any) {
      console.error('Failed to delete template:', error)
      toast.error(error.message || 'Failed to delete template')
    }
  }

  const filteredTemplates = templates.filter((template) => {
    const matchesCategory = selectedCategory === "all" || template.category === selectedCategory
    const matchesSearch =
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (template.description || '').toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="space-y-6">
      <PageTracker pageName="Templates List" metadata={{ selectedCategory, searchQuery: !!searchQuery }} />
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("title")}</h1>
          <p className="text-muted-foreground">{t("description")}</p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Plus className="w-4 h-4 mr-2" />
              {t("createTemplate")}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{t("createDialog.title")}</DialogTitle>
              <DialogDescription>{t("createDialog.description")}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>{t("createDialog.templateName")}</Label>
                <Input
                  placeholder={t("createDialog.templateNamePlaceholder")}
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{tCommon("description")}</Label>
                <Input
                  placeholder={t("createDialog.descriptionPlaceholder")}
                  value={newTemplate.description}
                  onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("createDialog.category")}</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={newTemplate.category}
                  onChange={(e) => setNewTemplate({ ...newTemplate, category: e.target.value })}
                >
                  <option value="research">{t("categories.research")}</option>
                  <option value="analysis">{t("categories.analysis")}</option>
                  <option value="briefs">{t("categories.briefs")}</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>{t("createDialog.promptTemplate")}</Label>
                <Textarea
                  placeholder={t("createDialog.promptPlaceholder")}
                  className="min-h-[120px]"
                  value={newTemplate.prompt}
                  onChange={(e) => setNewTemplate({ ...newTemplate, prompt: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  {t("createDialog.promptTip")}
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)} disabled={isSaving}>
                {tCommon("cancel")}
              </Button>
              <Button
                className="bg-accent text-accent-foreground hover:bg-accent/90"
                onClick={handleCreateTemplate}
                disabled={isSaving || !newTemplate.name.trim() || !newTemplate.prompt.trim()}
              >
                {isSaving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{tCommon("creating")}</> : t("createTemplate")}
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
            placeholder={t("searchPlaceholder")}
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
      {!loading && starredTemplates.length > 0 && selectedCategory === "all" && (
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            {t("starredTemplates")}
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {templates
              .filter((t) => starredTemplates.includes(t.id))
              .map((template) => {
                const Icon = categoryIcons[template.category.toUpperCase()] || FileText
                return (
                <Card
                  key={template.id}
                  className="bg-card border-border hover:border-accent/50 transition-colors cursor-pointer group"
                  onClick={() => handleUseTemplate(template)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="p-2 rounded-lg bg-accent/10">
                        <Icon className="w-5 h-5 text-accent" />
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
                          <Star className={`w-4 h-4 ${starredTemplates.includes(template.id) ? 'text-amber-500 fill-amber-500' : ''}`} />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleUseTemplate(template); }}>
                              <Play className="w-4 h-4 mr-2" />
                              {t("actions.useTemplate")}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleDuplicate(template); }}>
                              <Copy className="w-4 h-4 mr-2" />
                              {t("actions.duplicate")}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={(e) => { e.stopPropagation(); handleDeleteTemplate(template.id); }}
                            >
                              {tCommon("delete")}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    <h3 className="font-semibold text-foreground mb-1">{template.name}</h3>
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{template.description || ''}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        {t("uses", { count: template.usageCount })}
                      </span>
                      {template.lastUsed && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(template.lastUsed).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
                )
              })}
          </div>
        </div>
      )}

      {/* All Templates */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground">
            {selectedCategory === "all" ? t("allTemplates") : categories.find((c) => c.id === selectedCategory)?.name}
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredTemplates
              .filter((t) => !starredTemplates.includes(t.id) || selectedCategory !== "all")
              .map((template) => {
                const Icon = categoryIcons[template.category.toUpperCase()] || FileText
                return (
                  <Card
                    key={template.id}
                    className="bg-card border-border hover:border-accent/50 transition-colors cursor-pointer group"
                    onClick={() => handleUseTemplate(template)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="p-2 rounded-lg bg-muted">
                          <Icon className="w-5 h-5 text-foreground" />
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
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleUseTemplate(template); }}>
                                <Play className="w-4 h-4 mr-2" />
                                {t("actions.useTemplate")}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleDuplicate(template); }}>
                                <Copy className="w-4 h-4 mr-2" />
                                {t("actions.duplicate")}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-destructive"
                                onClick={(e) => { e.stopPropagation(); handleDeleteTemplate(template.id); }}
                              >
                                {tCommon("delete")}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                      <h3 className="font-semibold text-foreground mb-1">{template.name}</h3>
                      <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{template.description || ''}</p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {template.creator.name || template.creator.email}
                        </span>
                        <Badge variant="secondary" className="text-[10px]">
                          {template.category}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          {t("uses", { count: template.usageCount })}
                        </span>
                        {template.lastUsed && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(template.lastUsed).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
          </div>
          {filteredTemplates.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold">No templates found</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {searchQuery ? 'Try adjusting your search' : 'Create your first template to get started'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
