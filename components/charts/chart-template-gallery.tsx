"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import {
  BarChart3,
  LineChart,
  PieChart,
  Activity,
  Target,
  TrendingUp,
  Users,
  Globe,
  Search,
  Plus,
  Eye,
  Copy,
  Sparkles,
} from "lucide-react"
import { AdvancedChartRenderer, type GWIChartTemplate } from "./advanced-chart-renderer"
import { gwiChartTemplates } from "./data/gwi-sample-data"
import { cn } from "@/lib/utils"

interface ChartTemplateGalleryProps {
  onSelectTemplate?: (template: GWIChartTemplate) => void
  onCreateChart?: (template: GWIChartTemplate, config: any) => void
  className?: string
}

const templateCategories = {
  popular: ["social-platform-reach", "generation-comparison", "brand-health-tracker", "market-share"],
  audience: ["generation-comparison", "audience-correlation", "regional-breakdown"],
  brand: ["brand-health-tracker", "benchmark-comparison", "market-share"],
  media: ["social-platform-reach", "media-consumption-trend", "content-preference"],
  conversion: ["conversion-funnel", "purchase-drivers", "attribution-waterfall"],
} as const

const templateIcons: Record<GWIChartTemplate, any> = {
  "social-platform-reach": BarChart3,
  "generation-comparison": Users,
  "brand-health-tracker": Activity,
  "media-consumption-trend": LineChart,
  "purchase-drivers": Target,
  "market-share": PieChart,
  "conversion-funnel": TrendingUp,
  "content-preference": Sparkles,
  "regional-breakdown": Globe,
  "benchmark-comparison": BarChart3,
  "audience-correlation": Activity,
  "attribution-waterfall": TrendingUp,
}

const templateTags: Record<GWIChartTemplate, string[]> = {
  "social-platform-reach": ["Social", "Platforms", "Reach"],
  "generation-comparison": ["Demographics", "Age", "Behavior"],
  "brand-health-tracker": ["Brand", "KPIs", "Tracking"],
  "media-consumption-trend": ["Media", "Trends", "Time Series"],
  "purchase-drivers": ["Consumer", "Insights", "Drivers"],
  "market-share": ["Market", "Competition", "Share"],
  "conversion-funnel": ["Funnel", "Conversion", "Journey"],
  "content-preference": ["Content", "Preference", "Format"],
  "regional-breakdown": ["Geographic", "Regional", "Markets"],
  "benchmark-comparison": ["Benchmark", "Comparison", "Performance"],
  "audience-correlation": ["Segments", "Correlation", "Analysis"],
  "attribution-waterfall": ["Attribution", "Marketing", "Impact"],
}

export function ChartTemplateGallery({
  onSelectTemplate,
  onCreateChart,
  className,
}: ChartTemplateGalleryProps) {
  const t = useTranslations('dashboard.charts.templateGallery')
  const [activeTab, setActiveTab] = useState<string>("popular")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTemplate, setSelectedTemplate] = useState<GWIChartTemplate | null>(null)
  const [previewTemplate, setPreviewTemplate] = useState<GWIChartTemplate | null>(null)

  const templates = Object.entries(gwiChartTemplates) as [GWIChartTemplate, typeof gwiChartTemplates[GWIChartTemplate]][]

  const filteredTemplates = templates.filter(([key, template]) => {
    // Filter by search
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase()
      const matchesTitle = template.title.toLowerCase().includes(searchLower)
      const matchesDescription = template.description.toLowerCase().includes(searchLower)
      const matchesTags = templateTags[key]?.some((tag) => tag.toLowerCase().includes(searchLower))
      if (!matchesTitle && !matchesDescription && !matchesTags) return false
    }

    // Filter by category
    if (activeTab !== "all" && activeTab !== "popular") {
      const categoryTemplates = templateCategories[activeTab as keyof typeof templateCategories] as readonly string[]
      if (categoryTemplates && !categoryTemplates.includes(key)) return false
    }

    if (activeTab === "popular") {
      return (templateCategories.popular as readonly string[]).includes(key)
    }

    return true
  })

  const handleSelectTemplate = (key: GWIChartTemplate) => {
    setSelectedTemplate(key)
    if (onSelectTemplate) {
      onSelectTemplate(key)
    }
  }

  const handleCreateChart = (key: GWIChartTemplate) => {
    const template = gwiChartTemplates[key]
    if (onCreateChart) {
      onCreateChart(key, {
        name: template.title,
        description: template.description,
        type: template.chartType,
        data: template.data,
        config: template.config,
      })
    }
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">{t('title')}</h2>
          <p className="text-sm text-muted-foreground">
            {t('description')}
          </p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t('searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="popular" className="text-xs">
            <Sparkles className="h-3 w-3 mr-1" />
            {t('tabs.popular')}
          </TabsTrigger>
          <TabsTrigger value="all" className="text-xs">{t('tabs.all')}</TabsTrigger>
          <TabsTrigger value="audience" className="text-xs">
            <Users className="h-3 w-3 mr-1" />
            {t('tabs.audience')}
          </TabsTrigger>
          <TabsTrigger value="brand" className="text-xs">
            <Activity className="h-3 w-3 mr-1" />
            {t('tabs.brand')}
          </TabsTrigger>
          <TabsTrigger value="media" className="text-xs">
            <BarChart3 className="h-3 w-3 mr-1" />
            {t('tabs.media')}
          </TabsTrigger>
          <TabsTrigger value="conversion" className="text-xs">
            <TrendingUp className="h-3 w-3 mr-1" />
            {t('tabs.conversion')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {filteredTemplates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Search className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">{t('noTemplatesFound')}</h3>
              <p className="text-sm text-muted-foreground">{t('adjustSearch')}</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredTemplates.map(([key, template]) => {
                const Icon = templateIcons[key]
                const isSelected = selectedTemplate === key
                const isPreview = previewTemplate === key

                return (
                  <Card
                    key={key}
                    className={cn(
                      "group cursor-pointer transition-all hover:shadow-lg",
                      isSelected && "ring-2 ring-primary",
                      isPreview && "ring-2 ring-primary/50"
                    )}
                    onMouseEnter={() => setPreviewTemplate(key)}
                    onMouseLeave={() => setPreviewTemplate(null)}
                    onClick={() => handleSelectTemplate(key)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <Icon className="h-4 w-4 text-primary" />
                          </div>
                          <CardTitle className="text-base line-clamp-1">{template.title}</CardTitle>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {template.chartType.replace("_", " ")}
                        </Badge>
                      </div>
                      <CardDescription className="text-xs line-clamp-2 mt-1">
                        {template.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      {/* Chart Preview */}
                      <div className="aspect-video bg-muted/50 rounded-lg overflow-hidden mb-3">
                        <AdvancedChartRenderer
                          type={template.chartType as any}
                          data={template.data}
                          config={{
                            ...template.config,
                            showLegend: false,
                            showGrid: false,
                            height: 140,
                            animate: false,
                          }}
                          template={key}
                        />
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1 mb-3">
                        {templateTags[key]?.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs px-2 py-0">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleCreateChart(key)
                          }}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          {t('useTemplate')}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation()
                            setPreviewTemplate(key)
                          }}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Preview Modal */}
      {previewTemplate && (
        <Card className="mt-6 border-2 border-primary/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{gwiChartTemplates[previewTemplate].title}</CardTitle>
                <CardDescription>{gwiChartTemplates[previewTemplate].description}</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => setPreviewTemplate(null)}>
                  {t('closePreview')}
                </Button>
                <Button size="sm" onClick={() => handleCreateChart(previewTemplate)}>
                  <Plus className="h-4 w-4 mr-1" />
                  {t('useTemplate')}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-muted/30 rounded-lg p-4">
              <AdvancedChartRenderer
                type={gwiChartTemplates[previewTemplate].chartType as any}
                data={gwiChartTemplates[previewTemplate].data}
                config={{
                  ...gwiChartTemplates[previewTemplate].config,
                  height: 400,
                  showLegend: true,
                  showGrid: true,
                  showTooltip: true,
                  showBenchmark: true,
                }}
                template={previewTemplate}
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
