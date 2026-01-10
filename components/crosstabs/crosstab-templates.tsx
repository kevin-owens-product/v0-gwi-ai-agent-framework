"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Table2,
  Search,
  Star,
  TrendingUp,
  Users,
  Globe,
  BarChart3,
  Sparkles,
  Target,
  Zap,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface CrosstabTemplate {
  id: string
  name: string
  description: string
  category: "social" | "commerce" | "brand" | "media" | "custom"
  audiences: string[]
  metrics: string[]
  useCase: string
  popularity: number
}

const crosstabTemplates: CrosstabTemplate[] = [
  // Social Media Templates
  {
    id: "gen-social-platforms",
    name: "Generational Social Media Usage",
    description: "Compare social platform usage across different generations",
    category: "social",
    audiences: ["Gen Z (18-24)", "Millennials (25-40)", "Gen X (41-56)", "Boomers (57+)"],
    metrics: ["TikTok", "Instagram", "Facebook", "YouTube", "LinkedIn", "Twitter/X", "Snapchat", "Pinterest"],
    useCase: "Understand which platforms resonate with each generation for media planning",
    popularity: 95,
  },
  {
    id: "content-format-pref",
    name: "Content Format Preferences",
    description: "Analyze preferred content formats across platforms",
    category: "social",
    audiences: ["TikTok Users", "Instagram Users", "YouTube Users", "LinkedIn Users"],
    metrics: ["Short Video", "Long Video", "Stories", "Static Images", "Carousels", "Live Streams", "Text Posts"],
    useCase: "Optimize content strategy by understanding format preferences per platform",
    popularity: 88,
  },
  {
    id: "influencer-trust",
    name: "Influencer Trust by Category",
    description: "Measure trust in influencer recommendations across product categories",
    category: "social",
    audiences: ["Gen Z", "Millennials", "Gen X", "Affluent Consumers"],
    metrics: ["Beauty", "Fashion", "Tech", "Food", "Fitness", "Finance", "Travel", "Gaming"],
    useCase: "Identify which categories benefit most from influencer marketing",
    popularity: 82,
  },

  // Commerce Templates
  {
    id: "purchase-channel-income",
    name: "Purchase Channels by Income",
    description: "Compare shopping channel preferences across income segments",
    category: "commerce",
    audiences: ["Under $50K", "$50K-$100K", "$100K-$150K", "$150K+"],
    metrics: ["E-commerce", "In-Store", "Mobile Apps", "Social Commerce", "Subscriptions", "D2C Brands", "Marketplaces"],
    useCase: "Optimize channel strategy based on target income demographic",
    popularity: 91,
  },
  {
    id: "purchase-drivers",
    name: "Purchase Decision Drivers",
    description: "Understand what factors drive purchase decisions by segment",
    category: "commerce",
    audiences: ["Value Seekers", "Premium Buyers", "Impulse Shoppers", "Researchers"],
    metrics: ["Price", "Quality", "Brand", "Reviews", "Convenience", "Sustainability", "Exclusivity", "Social Proof"],
    useCase: "Tailor messaging to different buyer motivations",
    popularity: 87,
  },
  {
    id: "subscription-adoption",
    name: "Subscription Service Adoption",
    description: "Compare subscription service usage across demographics",
    category: "commerce",
    audiences: ["Gen Z", "Millennials", "Gen X", "Boomers", "Urban", "Suburban"],
    metrics: ["Streaming Video", "Streaming Music", "Meal Kits", "Beauty Boxes", "Gaming", "News/Media", "Fitness", "Software"],
    useCase: "Identify subscription opportunities by demographic segment",
    popularity: 84,
  },

  // Brand Templates
  {
    id: "brand-health-funnel",
    name: "Brand Health Funnel",
    description: "Track brand metrics through the purchase funnel",
    category: "brand",
    audiences: ["Your Brand", "Competitor A", "Competitor B", "Competitor C", "Market Average"],
    metrics: ["Awareness", "Consideration", "Preference", "Purchase", "Loyalty", "Advocacy", "NPS"],
    useCase: "Benchmark brand performance against competitors",
    popularity: 93,
  },
  {
    id: "brand-attributes",
    name: "Brand Perception Attributes",
    description: "Compare brand perception on key attributes",
    category: "brand",
    audiences: ["Your Brand", "Competitor A", "Competitor B", "Competitor C"],
    metrics: ["Innovative", "Trustworthy", "Good Value", "Premium", "Sustainable", "Customer-Focused", "Authentic"],
    useCase: "Understand brand positioning vs competitors",
    popularity: 89,
  },
  {
    id: "brand-by-generation",
    name: "Brand Affinity by Generation",
    description: "Measure brand preference across generational cohorts",
    category: "brand",
    audiences: ["Gen Z", "Millennials", "Gen X", "Boomers"],
    metrics: ["Awareness", "Consideration", "Current User", "Lapsed User", "Would Recommend", "Favorite Brand"],
    useCase: "Identify which generations to target for growth",
    popularity: 86,
  },

  // Media Templates
  {
    id: "media-daypart",
    name: "Media Consumption by Daypart",
    description: "Understand media consumption patterns throughout the day",
    category: "media",
    audiences: ["Morning (6-9am)", "Daytime (9am-5pm)", "Evening (5-9pm)", "Late Night (9pm-12am)"],
    metrics: ["Linear TV", "Streaming", "Social Media", "Podcasts", "Radio", "News Sites", "Gaming", "Music"],
    useCase: "Optimize media planning and ad scheduling",
    popularity: 90,
  },
  {
    id: "streaming-comparison",
    name: "Streaming Service Comparison",
    description: "Compare streaming platform usage and satisfaction",
    category: "media",
    audiences: ["Netflix", "Disney+", "Amazon Prime", "HBO Max", "Hulu", "Apple TV+", "YouTube Premium"],
    metrics: ["Weekly Usage", "Satisfaction", "Value Perception", "Content Quality", "Would Recommend", "Cancel Intent"],
    useCase: "Competitive analysis for streaming services",
    popularity: 85,
  },
  {
    id: "news-consumption",
    name: "News Source Preferences",
    description: "Analyze news consumption habits across demographics",
    category: "media",
    audiences: ["Gen Z", "Millennials", "Gen X", "Boomers", "Urban", "Rural"],
    metrics: ["Social Media", "TV News", "News Apps", "Newspapers", "Radio", "Podcasts", "News Aggregators"],
    useCase: "Understand how different segments consume news",
    popularity: 78,
  },

  // Custom/Advanced Templates
  {
    id: "sustainability-attitudes",
    name: "Sustainability Attitudes",
    description: "Compare environmental attitudes across consumer segments",
    category: "custom",
    audiences: ["Eco-Activists", "Mainstream Green", "Price-Conscious", "Skeptics"],
    metrics: ["Pay Premium", "Check Ethics", "Reduce Plastic", "Buy Second-Hand", "Carbon Aware", "Support Local", "Boycott Brands"],
    useCase: "Develop sustainability messaging strategy",
    popularity: 83,
  },
  {
    id: "financial-behavior",
    name: "Financial Product Adoption",
    description: "Compare financial product usage by life stage",
    category: "custom",
    audiences: ["Students", "Young Professionals", "Young Families", "Established Families", "Pre-Retirees", "Retirees"],
    metrics: ["Mobile Banking", "Investment Apps", "BNPL", "Crypto", "Insurance", "Retirement Accounts", "Credit Cards"],
    useCase: "Target financial products by life stage",
    popularity: 81,
  },
  {
    id: "health-wellness",
    name: "Health & Wellness Priorities",
    description: "Understand wellness priorities across personas",
    category: "custom",
    audiences: ["Fitness Enthusiasts", "Wellness Seekers", "Busy Professionals", "Health-Conscious Parents", "Active Seniors"],
    metrics: ["Gym", "Home Fitness", "Nutrition Apps", "Mental Wellness", "Sleep Tracking", "Supplements", "Organic Food"],
    useCase: "Product development and positioning in wellness space",
    popularity: 79,
  },
]

interface CrosstabTemplatesProps {
  onSelect: (template: CrosstabTemplate) => void
  className?: string
}

export function CrosstabTemplates({ onSelect, className }: CrosstabTemplatesProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [previewTemplate, setPreviewTemplate] = useState<CrosstabTemplate | null>(null)

  const categories = [
    { id: "all", label: "All", icon: <Star className="h-4 w-4" /> },
    { id: "social", label: "Social", icon: <Users className="h-4 w-4" /> },
    { id: "commerce", label: "Commerce", icon: <Zap className="h-4 w-4" /> },
    { id: "brand", label: "Brand", icon: <Target className="h-4 w-4" /> },
    { id: "media", label: "Media", icon: <BarChart3 className="h-4 w-4" /> },
    { id: "custom", label: "Other", icon: <Globe className="h-4 w-4" /> },
  ]

  const filteredTemplates = crosstabTemplates.filter((template) => {
    const matchesSearch =
      searchQuery === "" ||
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory =
      selectedCategory === "all" || template.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  const sortedTemplates = [...filteredTemplates].sort((a, b) => b.popularity - a.popularity)

  const getCategoryIcon = (category: string) => {
    const cat = categories.find(c => c.id === category)
    return cat?.icon || <Globe className="h-4 w-4" />
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search templates..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <Button
            key={cat.id}
            variant={selectedCategory === cat.id ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(cat.id)}
            className="gap-2"
          >
            {cat.icon}
            {cat.label}
          </Button>
        ))}
      </div>

      {/* Templates Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {sortedTemplates.map((template) => (
          <Card
            key={template.id}
            className="p-4 cursor-pointer hover:border-primary transition-colors"
            onClick={() => setPreviewTemplate(template)}
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Table2 className="h-4 w-4" />
                  <h4 className="font-medium">{template.name}</h4>
                </div>
                {getCategoryIcon(template.category)}
              </div>

              <p className="text-sm text-muted-foreground line-clamp-2">
                {template.description}
              </p>

              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>{template.audiences.length} audiences</span>
                <span>{template.metrics.length} metrics</span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <TrendingUp className="h-3 w-3" />
                  {template.popularity}% popular
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation()
                    onSelect(template)
                  }}
                >
                  Use Template
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {sortedTemplates.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <h3 className="font-medium mb-1">No templates found</h3>
          <p className="text-sm">Try adjusting your search</p>
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent className="max-w-lg">
          {previewTemplate && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Table2 className="h-5 w-5" />
                  {previewTemplate.name}
                </DialogTitle>
                <DialogDescription>{previewTemplate.description}</DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm font-medium mb-1">Use Case</p>
                  <p className="text-sm text-muted-foreground">{previewTemplate.useCase}</p>
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">
                    Audiences ({previewTemplate.audiences.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {previewTemplate.audiences.map((audience) => (
                      <Badge key={audience} variant="secondary">
                        {audience}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">
                    Metrics ({previewTemplate.metrics.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {previewTemplate.metrics.map((metric) => (
                      <Badge key={metric} variant="outline">
                        {metric}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setPreviewTemplate(null)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    onSelect(previewTemplate)
                    setPreviewTemplate(null)
                  }}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Use This Template
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
