"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Users, Search, Star, TrendingUp, Target, Globe, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

interface AudienceTemplate {
  id: string
  name: string
  description: string
  category: "demographic" | "behavioral" | "psychographic" | "custom"
  estimatedSize: string
  attributes: { dimension: string; operator: string; value: string }[]
  tags: string[]
  popularity: number
}

const audienceTemplates: AudienceTemplate[] = [
  // Demographic Templates
  {
    id: "gen-z",
    name: "Gen Z Consumers",
    description: "Digital natives aged 18-24 who grew up with smartphones and social media",
    category: "demographic",
    estimatedSize: "2.1M",
    attributes: [
      { dimension: "age", operator: "between", value: "18-24" },
    ],
    tags: ["Generation", "Youth", "Digital Native"],
    popularity: 95,
  },
  {
    id: "millennials",
    name: "Millennials",
    description: "Adults aged 25-40 balancing career growth with life milestones",
    category: "demographic",
    estimatedSize: "3.8M",
    attributes: [
      { dimension: "age", operator: "between", value: "25-40" },
    ],
    tags: ["Generation", "Working Age", "Core Demo"],
    popularity: 92,
  },
  {
    id: "gen-x",
    name: "Gen X Adults",
    description: "Established adults aged 41-56 with significant purchasing power",
    category: "demographic",
    estimatedSize: "2.9M",
    attributes: [
      { dimension: "age", operator: "between", value: "41-56" },
    ],
    tags: ["Generation", "Established", "High Income"],
    popularity: 78,
  },
  {
    id: "boomers",
    name: "Baby Boomers",
    description: "Mature consumers aged 57-75 with accumulated wealth",
    category: "demographic",
    estimatedSize: "2.5M",
    attributes: [
      { dimension: "age", operator: "between", value: "57-75" },
    ],
    tags: ["Generation", "Mature", "Wealth"],
    popularity: 72,
  },
  {
    id: "affluent",
    name: "Affluent Consumers",
    description: "High-income individuals with $150K+ household income",
    category: "demographic",
    estimatedSize: "1.2M",
    attributes: [
      { dimension: "income", operator: "gte", value: "150000" },
    ],
    tags: ["Income", "Premium", "Luxury"],
    popularity: 88,
  },
  {
    id: "young-professionals",
    name: "Young Professionals",
    description: "Career-focused adults 25-35 in urban areas",
    category: "demographic",
    estimatedSize: "2.4M",
    attributes: [
      { dimension: "age", operator: "between", value: "25-35" },
      { dimension: "location_type", operator: "is", value: "urban" },
      { dimension: "education", operator: "gte", value: "bachelors" },
    ],
    tags: ["Career", "Urban", "Educated"],
    popularity: 85,
  },
  {
    id: "suburban-families",
    name: "Suburban Families",
    description: "Parents with children living in suburban areas",
    category: "demographic",
    estimatedSize: "3.2M",
    attributes: [
      { dimension: "location_type", operator: "is", value: "suburban" },
      { dimension: "life_stage", operator: "is", value: "parent" },
    ],
    tags: ["Family", "Suburban", "Parents"],
    popularity: 82,
  },

  // Behavioral Templates
  {
    id: "early-adopters",
    name: "Tech Early Adopters",
    description: "First to try new products and technologies, influence others",
    category: "behavioral",
    estimatedSize: "850K",
    attributes: [
      { dimension: "behavior", operator: "is", value: "early_adopter" },
      { dimension: "interests", operator: "contains", value: "technology" },
    ],
    tags: ["Tech", "Innovators", "Influence"],
    popularity: 90,
  },
  {
    id: "online-shoppers",
    name: "Heavy Online Shoppers",
    description: "Consumers who primarily shop online across categories",
    category: "behavioral",
    estimatedSize: "4.5M",
    attributes: [
      { dimension: "shopping_behavior", operator: "is", value: "online_primary" },
    ],
    tags: ["E-commerce", "Digital", "Shopping"],
    popularity: 94,
  },
  {
    id: "content-creators",
    name: "Content Creators",
    description: "Active creators on social platforms with growing audiences",
    category: "behavioral",
    estimatedSize: "1.8M",
    attributes: [
      { dimension: "behavior", operator: "is", value: "content_creator" },
      { dimension: "social_media", operator: "is", value: "heavy" },
    ],
    tags: ["Social", "Creator", "Influence"],
    popularity: 86,
  },
  {
    id: "fitness-enthusiasts",
    name: "Fitness Enthusiasts",
    description: "Health-conscious individuals committed to regular exercise",
    category: "behavioral",
    estimatedSize: "2.8M",
    attributes: [
      { dimension: "interests", operator: "contains", value: "fitness,health" },
      { dimension: "behavior", operator: "is", value: "active_lifestyle" },
    ],
    tags: ["Fitness", "Health", "Active"],
    popularity: 84,
  },
  {
    id: "gamers",
    name: "Gaming Enthusiasts",
    description: "Dedicated gamers who play 10+ hours weekly",
    category: "behavioral",
    estimatedSize: "3.6M",
    attributes: [
      { dimension: "interests", operator: "contains", value: "gaming" },
    ],
    tags: ["Gaming", "Entertainment", "Digital"],
    popularity: 88,
  },

  // Psychographic Templates
  {
    id: "eco-conscious",
    name: "Eco-Conscious Consumers",
    description: "Sustainability-focused individuals who prioritize environmental impact",
    category: "psychographic",
    estimatedSize: "2.2M",
    attributes: [
      { dimension: "interests", operator: "contains", value: "sustainability,environment" },
    ],
    tags: ["Sustainability", "Values", "Green"],
    popularity: 91,
  },
  {
    id: "luxury-seekers",
    name: "Luxury Experience Seekers",
    description: "Consumers who prioritize premium experiences and quality",
    category: "psychographic",
    estimatedSize: "980K",
    attributes: [
      { dimension: "interests", operator: "contains", value: "luxury,premium" },
      { dimension: "income", operator: "gte", value: "100000" },
    ],
    tags: ["Luxury", "Premium", "Experience"],
    popularity: 79,
  },
  {
    id: "value-seekers",
    name: "Value-Conscious Shoppers",
    description: "Price-sensitive consumers who research before purchasing",
    category: "psychographic",
    estimatedSize: "4.1M",
    attributes: [
      { dimension: "shopping_behavior", operator: "is", value: "discount" },
    ],
    tags: ["Value", "Budget", "Research"],
    popularity: 83,
  },
  {
    id: "health-optimizers",
    name: "Health Optimizers",
    description: "Wellness-focused individuals investing in health optimization",
    category: "psychographic",
    estimatedSize: "1.5M",
    attributes: [
      { dimension: "interests", operator: "contains", value: "health,wellness" },
    ],
    tags: ["Wellness", "Health", "Biohacking"],
    popularity: 81,
  },
  {
    id: "foodies",
    name: "Food Enthusiasts",
    description: "Passionate about culinary experiences, dining, and food culture",
    category: "psychographic",
    estimatedSize: "2.9M",
    attributes: [
      { dimension: "interests", operator: "contains", value: "food,dining,culinary" },
    ],
    tags: ["Food", "Dining", "Culinary"],
    popularity: 86,
  },
  {
    id: "travel-lovers",
    name: "Travel Enthusiasts",
    description: "Adventure seekers who prioritize travel experiences",
    category: "psychographic",
    estimatedSize: "3.4M",
    attributes: [
      { dimension: "interests", operator: "contains", value: "travel" },
    ],
    tags: ["Travel", "Adventure", "Experience"],
    popularity: 89,
  },
]

interface AudienceTemplatesProps {
  onSelect: (template: AudienceTemplate) => void
  className?: string
}

export function AudienceTemplates({ onSelect, className }: AudienceTemplatesProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [previewTemplate, setPreviewTemplate] = useState<AudienceTemplate | null>(null)

  const categories = [
    { id: "all", label: "All Templates", icon: <Star className="h-4 w-4" /> },
    { id: "demographic", label: "Demographic", icon: <Users className="h-4 w-4" /> },
    { id: "behavioral", label: "Behavioral", icon: <TrendingUp className="h-4 w-4" /> },
    { id: "psychographic", label: "Psychographic", icon: <Target className="h-4 w-4" /> },
  ]

  const filteredTemplates = audienceTemplates.filter((template) => {
    const matchesSearch =
      searchQuery === "" ||
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesCategory =
      selectedCategory === "all" || template.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  const sortedTemplates = [...filteredTemplates].sort((a, b) => b.popularity - a.popularity)

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "demographic":
        return <Users className="h-3 w-3" />
      case "behavioral":
        return <TrendingUp className="h-3 w-3" />
      case "psychographic":
        return <Target className="h-3 w-3" />
      default:
        return <Globe className="h-3 w-3" />
    }
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid grid-cols-4 w-full">
          {categories.map((cat) => (
            <TabsTrigger key={cat.id} value={cat.id} className="flex items-center gap-2">
              {cat.icon}
              <span className="hidden sm:inline">{cat.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Templates Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sortedTemplates.map((template) => (
          <Card
            key={template.id}
            className="p-4 cursor-pointer hover:border-primary transition-colors"
            onClick={() => setPreviewTemplate(template)}
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {getCategoryIcon(template.category)}
                  <h4 className="font-medium">{template.name}</h4>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {template.estimatedSize}
                </Badge>
              </div>

              <p className="text-sm text-muted-foreground line-clamp-2">
                {template.description}
              </p>

              <div className="flex flex-wrap gap-1">
                {template.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>

              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
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
          <p className="text-sm">Try adjusting your search or filters</p>
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent className="max-w-lg">
          {previewTemplate && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {getCategoryIcon(previewTemplate.category)}
                  {previewTemplate.name}
                </DialogTitle>
                <DialogDescription>{previewTemplate.description}</DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Estimated Size</p>
                    <p className="text-2xl font-bold">{previewTemplate.estimatedSize}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Popularity</p>
                    <p className="text-2xl font-bold">{previewTemplate.popularity}%</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">Included Attributes</p>
                  <div className="space-y-2">
                    {previewTemplate.attributes.map((attr, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                        <Badge variant="outline">{attr.dimension}</Badge>
                        <span className="text-sm text-muted-foreground">{attr.operator}</span>
                        <span className="text-sm font-medium">{attr.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {previewTemplate.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
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
