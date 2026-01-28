"use client"

import { useState, useMemo } from "react"
import { useTranslations } from "next-intl"
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
import {
  Store,
  Search,
  Star,
  Users,
  Download,
  Shield,
  Clock,
  CheckCircle2,
  Globe,
  Sparkles,
  Heart,
  Copy,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface MarketplaceAudience {
  id: string
  name: string
  description: string
  category: "demographic" | "behavioral" | "psychographic" | "industry" | "custom"
  publisher: {
    name: string
    verified: boolean
    type: "gwi" | "partner" | "community"
  }
  estimatedSize: string
  markets: string[]
  rating: number
  reviews: number
  downloads: number
  lastUpdated: string
  tags: string[]
  isFeatured: boolean
  isPremium: boolean
  attributes: { dimension: string; value: string }[]
}

const marketplaceAudiences: MarketplaceAudience[] = [
  {
    id: "mp-1",
    name: "Sustainable Fashion Enthusiasts",
    description: "Consumers passionate about eco-friendly and ethical fashion brands, willing to pay premium for sustainable products",
    category: "psychographic",
    publisher: { name: "GWI", verified: true, type: "gwi" },
    estimatedSize: "2.4M",
    markets: ["US", "UK", "DE", "FR", "NL"],
    rating: 4.8,
    reviews: 156,
    downloads: 2340,
    lastUpdated: "2025-01-05",
    tags: ["Sustainability", "Fashion", "Premium", "Values"],
    isFeatured: true,
    isPremium: false,
    attributes: [
      { dimension: "interests", value: "sustainable_fashion" },
      { dimension: "behavior", value: "premium_buyer" },
      { dimension: "values", value: "environmental_conscious" },
    ],
  },
  {
    id: "mp-2",
    name: "Crypto-Curious Investors",
    description: "Individuals interested in cryptocurrency and decentralized finance who haven't yet invested",
    category: "behavioral",
    publisher: { name: "FinTech Partners", verified: true, type: "partner" },
    estimatedSize: "1.8M",
    markets: ["US", "UK", "SG", "KR"],
    rating: 4.5,
    reviews: 89,
    downloads: 1560,
    lastUpdated: "2025-01-03",
    tags: ["Finance", "Crypto", "Investing", "Tech"],
    isFeatured: true,
    isPremium: true,
    attributes: [
      { dimension: "interests", value: "cryptocurrency" },
      { dimension: "behavior", value: "not_investor" },
      { dimension: "income", value: "75000+" },
    ],
  },
  {
    id: "mp-3",
    name: "Remote Work Professionals",
    description: "Full-time remote workers optimizing their home office setup and work-life balance",
    category: "behavioral",
    publisher: { name: "GWI", verified: true, type: "gwi" },
    estimatedSize: "5.2M",
    markets: ["Global"],
    rating: 4.9,
    reviews: 234,
    downloads: 4120,
    lastUpdated: "2025-01-08",
    tags: ["Remote Work", "Professional", "Lifestyle"],
    isFeatured: true,
    isPremium: false,
    attributes: [
      { dimension: "work_type", value: "remote_full_time" },
      { dimension: "interests", value: "productivity" },
    ],
  },
  {
    id: "mp-4",
    name: "Plant-Based Lifestyle Adopters",
    description: "Consumers transitioning to or maintaining a plant-based diet and lifestyle",
    category: "psychographic",
    publisher: { name: "Health Insights Co", verified: true, type: "partner" },
    estimatedSize: "3.1M",
    markets: ["US", "UK", "AU", "CA"],
    rating: 4.6,
    reviews: 128,
    downloads: 1890,
    lastUpdated: "2025-01-02",
    tags: ["Health", "Diet", "Lifestyle", "Values"],
    isFeatured: false,
    isPremium: false,
    attributes: [
      { dimension: "diet", value: "plant_based" },
      { dimension: "values", value: "animal_welfare" },
    ],
  },
  {
    id: "mp-5",
    name: "Smart Home Early Adopters",
    description: "Tech-savvy homeowners with 5+ connected devices actively expanding their smart home ecosystem",
    category: "behavioral",
    publisher: { name: "GWI", verified: true, type: "gwi" },
    estimatedSize: "1.5M",
    markets: ["US", "UK", "DE", "JP", "KR"],
    rating: 4.7,
    reviews: 167,
    downloads: 2890,
    lastUpdated: "2025-01-06",
    tags: ["Technology", "Smart Home", "IoT", "Early Adopter"],
    isFeatured: false,
    isPremium: true,
    attributes: [
      { dimension: "tech_adoption", value: "early_adopter" },
      { dimension: "smart_devices", value: "5+" },
      { dimension: "housing", value: "homeowner" },
    ],
  },
  {
    id: "mp-6",
    name: "Gen Z Gaming Streamers",
    description: "Young gamers who stream content and engage with gaming communities",
    category: "demographic",
    publisher: { name: "Community", verified: false, type: "community" },
    estimatedSize: "890K",
    markets: ["Global"],
    rating: 4.3,
    reviews: 45,
    downloads: 780,
    lastUpdated: "2024-12-28",
    tags: ["Gaming", "Streaming", "Gen Z", "Content"],
    isFeatured: false,
    isPremium: false,
    attributes: [
      { dimension: "age", value: "16-24" },
      { dimension: "behavior", value: "gaming_streamer" },
    ],
  },
  {
    id: "mp-7",
    name: "Luxury Travel Seekers",
    description: "Affluent travelers seeking premium experiences and exclusive destinations",
    category: "psychographic",
    publisher: { name: "GWI", verified: true, type: "gwi" },
    estimatedSize: "680K",
    markets: ["US", "UK", "UAE", "SG", "HK"],
    rating: 4.8,
    reviews: 201,
    downloads: 3450,
    lastUpdated: "2025-01-07",
    tags: ["Travel", "Luxury", "Premium", "Experience"],
    isFeatured: true,
    isPremium: true,
    attributes: [
      { dimension: "income", value: "200000+" },
      { dimension: "interests", value: "luxury_travel" },
      { dimension: "travel_frequency", value: "4+_international" },
    ],
  },
  {
    id: "mp-8",
    name: "Wellness App Power Users",
    description: "Health-focused individuals using 3+ wellness and fitness apps daily",
    category: "behavioral",
    publisher: { name: "Health Insights Co", verified: true, type: "partner" },
    estimatedSize: "2.1M",
    markets: ["US", "UK", "AU", "CA", "DE"],
    rating: 4.4,
    reviews: 98,
    downloads: 1670,
    lastUpdated: "2025-01-04",
    tags: ["Wellness", "Fitness", "Apps", "Health"],
    isFeatured: false,
    isPremium: false,
    attributes: [
      { dimension: "app_usage", value: "wellness_heavy" },
      { dimension: "interests", value: "fitness,nutrition" },
    ],
  },
]

interface AudienceMarketplaceProps {
  onAddAudience?: (audience: MarketplaceAudience) => void
  className?: string
}

export function AudienceMarketplace({ onAddAudience, className }: AudienceMarketplaceProps) {
  const t = useTranslations("audiences")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedPublisher, setSelectedPublisher] = useState<string>("all")
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false)
  const [previewAudience, setPreviewAudience] = useState<MarketplaceAudience | null>(null)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  const categories = [
    { id: "all", label: t("marketplace.categories.all") },
    { id: "demographic", label: t("marketplace.categories.demographic") },
    { id: "behavioral", label: t("marketplace.categories.behavioral") },
    { id: "psychographic", label: t("marketplace.categories.psychographic") },
    { id: "industry", label: t("marketplace.categories.industry") },
  ]

  const filteredAudiences = useMemo(() => {
    return marketplaceAudiences.filter((aud) => {
      const matchesSearch =
        searchQuery === "" ||
        aud.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        aud.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        aud.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesCategory = selectedCategory === "all" || aud.category === selectedCategory
      const matchesPublisher = selectedPublisher === "all" || aud.publisher.type === selectedPublisher
      const matchesFeatured = !showFeaturedOnly || aud.isFeatured

      return matchesSearch && matchesCategory && matchesPublisher && matchesFeatured
    })
  }, [searchQuery, selectedCategory, selectedPublisher, showFeaturedOnly])

  const featuredAudiences = filteredAudiences.filter((a) => a.isFeatured)
  const regularAudiences = filteredAudiences.filter((a) => !a.isFeatured)

  const toggleFavorite = (id: string) => {
    const newFavorites = new Set(favorites)
    if (newFavorites.has(id)) {
      newFavorites.delete(id)
    } else {
      newFavorites.add(id)
    }
    setFavorites(newFavorites)
  }

  const getPublisherBadge = (publisher: MarketplaceAudience["publisher"]) => {
    switch (publisher.type) {
      case "gwi":
        return (
          <Badge className="bg-primary text-primary-foreground">
            <Shield className="h-3 w-3 mr-1" />
            {t("marketplace.publisher.gwiOfficial")}
          </Badge>
        )
      case "partner":
        return (
          <Badge variant="secondary">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            {t("marketplace.publisher.verifiedPartner")}
          </Badge>
        )
      default:
        return (
          <Badge variant="outline">
            <Users className="h-3 w-3 mr-1" />
            {t("marketplace.publisher.community")}
          </Badge>
        )
    }
  }

  const AudienceCard = ({ audience }: { audience: MarketplaceAudience }) => (
    <Card
      className={cn(
        "p-4 cursor-pointer transition-all hover:border-primary",
        audience.isFeatured && "border-primary/50 bg-primary/5"
      )}
      onClick={() => setPreviewAudience(audience)}
    >
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h4 className="font-medium">{audience.name}</h4>
              {audience.isPremium && (
                <Badge className="bg-amber-100 text-amber-700 text-xs">
                  <Sparkles className="h-3 w-3 mr-1" />
                  {t("marketplace.premium")}
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {audience.description}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={(e) => {
              e.stopPropagation()
              toggleFavorite(audience.id)
            }}
          >
            <Heart
              className={cn(
                "h-4 w-4",
                favorites.has(audience.id) && "fill-red-500 text-red-500"
              )}
            />
          </Button>
        </div>

        {/* Publisher & Stats */}
        <div className="flex items-center justify-between">
          {getPublisherBadge(audience.publisher)}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              {audience.rating}
            </span>
            <span className="flex items-center gap-1">
              <Download className="h-3 w-3" />
              {audience.downloads}
            </span>
          </div>
        </div>

        {/* Size & Markets */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>{audience.estimatedSize}</span>
          </div>
          <div className="flex items-center gap-1">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <span>{t("marketplace.marketsCount", { count: audience.markets.length })}</span>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {audience.tags.slice(0, 4).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </div>
    </Card>
  )

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Store className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-semibold">{t("marketplace.title")}</h2>
        </div>
        <Badge variant="secondary">
          {t("marketplace.audiencesAvailable", { count: marketplaceAudiences.length })}
        </Badge>
      </div>

      {/* Search & Filters */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("marketplace.searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex items-center gap-4">
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList>
              {categories.map((cat) => (
                <TabsTrigger key={cat.id} value={cat.id}>
                  {cat.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-2 ml-auto">
            <Button
              variant={selectedPublisher === "gwi" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedPublisher(selectedPublisher === "gwi" ? "all" : "gwi")}
            >
              <Shield className="h-4 w-4 mr-1" />
              {t("marketplace.publisher.gwiOfficial")}
            </Button>
            <Button
              variant={showFeaturedOnly ? "default" : "outline"}
              size="sm"
              onClick={() => setShowFeaturedOnly(!showFeaturedOnly)}
            >
              <Star className="h-4 w-4 mr-1" />
              {t("marketplace.featured")}
            </Button>
          </div>
        </div>
      </div>

      {/* Featured Section */}
      {featuredAudiences.length > 0 && !showFeaturedOnly && (
        <div className="space-y-3">
          <h3 className="font-medium flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            {t("marketplace.featuredAudiences")}
          </h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {featuredAudiences.map((aud) => (
              <AudienceCard key={aud.id} audience={aud} />
            ))}
          </div>
        </div>
      )}

      {/* All Audiences */}
      <div className="space-y-3">
        <h3 className="font-medium">
          {showFeaturedOnly ? t("marketplace.featuredAudiences") : t("marketplace.allAudiences")}
        </h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {(showFeaturedOnly ? featuredAudiences : regularAudiences).map((aud) => (
            <AudienceCard key={aud.id} audience={aud} />
          ))}
        </div>
      </div>

      {/* Empty State */}
      {filteredAudiences.length === 0 && (
        <Card className="p-12 text-center">
          <Store className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="font-medium mb-2">{t("marketplace.noAudiencesFound")}</h3>
          <p className="text-sm text-muted-foreground">
            {t("marketplace.tryAdjustingFilters")}
          </p>
        </Card>
      )}

      {/* Preview Dialog */}
      <Dialog open={!!previewAudience} onOpenChange={() => setPreviewAudience(null)}>
        <DialogContent className="max-w-lg">
          {previewAudience && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <DialogTitle className="flex items-center gap-2">
                      {previewAudience.name}
                      {previewAudience.isPremium && (
                        <Badge className="bg-amber-100 text-amber-700">Premium</Badge>
                      )}
                    </DialogTitle>
                    <DialogDescription className="mt-2">
                      {previewAudience.description}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-4">
                {/* Publisher */}
                <div className="flex items-center justify-between">
                  {getPublisherBadge(previewAudience.publisher)}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {t("marketplace.dialog.updated", { date: previewAudience.lastUpdated })}
                    </span>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <Card className="p-3 text-center">
                    <Users className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                    <div className="font-bold">{previewAudience.estimatedSize}</div>
                    <div className="text-xs text-muted-foreground">{t("marketplace.dialog.size")}</div>
                  </Card>
                  <Card className="p-3 text-center">
                    <Star className="h-4 w-4 mx-auto mb-1 text-amber-500" />
                    <div className="font-bold">{previewAudience.rating}</div>
                    <div className="text-xs text-muted-foreground">{t("marketplace.dialog.reviews", { count: previewAudience.reviews })}</div>
                  </Card>
                  <Card className="p-3 text-center">
                    <Download className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                    <div className="font-bold">{previewAudience.downloads}</div>
                    <div className="text-xs text-muted-foreground">{t("marketplace.dialog.downloads")}</div>
                  </Card>
                </div>

                {/* Markets */}
                <div>
                  <span className="text-sm font-medium">{t("marketplace.dialog.availableMarkets")}</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {previewAudience.markets.map((market) => (
                      <Badge key={market} variant="outline">
                        {market}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Attributes */}
                <div>
                  <span className="text-sm font-medium">{t("marketplace.dialog.includedAttributes")}</span>
                  <div className="space-y-2 mt-2">
                    {previewAudience.attributes.map((attr, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                        <Badge variant="secondary">{attr.dimension}</Badge>
                        <span className="text-sm">{attr.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {previewAudience.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setPreviewAudience(null)}>
                  {t("marketplace.dialog.close")}
                </Button>
                <Button
                  onClick={() => {
                    onAddAudience?.(previewAudience)
                    setPreviewAudience(null)
                  }}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  {t("marketplace.dialog.addToMyAudiences")}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
