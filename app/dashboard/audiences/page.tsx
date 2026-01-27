"use client"

import { useState, useEffect, useCallback } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Plus, Users, TrendingUp, Globe, Clock, Store, Sparkles, ArrowLeftRight, Search } from "lucide-react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { AudienceMarketplace } from "@/components/audiences/audience-marketplace"
import { AIQueryBuilder } from "@/components/audiences/ai-query-builder"
import { AudienceComparison } from "@/components/audiences/audience-comparison"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { PageTracker } from "@/components/tracking/PageTracker"
import { useTranslations } from "next-intl"

interface Audience {
  id: string
  name: string
  description: string
  size: string
  markets: string[]
  lastUsed: string
  demographics?: { label: string; value: string }[]
  behaviors?: string[]
  interests?: string[]
}

// Demo audiences for fallback
const demoAudiences: Audience[] = [
  {
    id: "1",
    name: "Eco-Conscious Millennials",
    description: "Sustainability-focused consumers with strong environmental values",
    size: "1.2M",
    markets: ["US", "UK", "DE", "FR", "NL"],
    lastUsed: "2 hours ago",
    demographics: [
      { label: "Age Range", value: "25-40" },
      { label: "Gender", value: "52% Female" },
      { label: "Income", value: "$65K-$120K" },
      { label: "Education", value: "Bachelor's+" },
      { label: "Location", value: "Urban Metro" },
      { label: "HH Size", value: "2.3 avg" },
    ],
    behaviors: ["eco_shopping", "sustainable_brands", "recycling"],
    interests: ["sustainability", "organic_food", "renewable_energy"],
  },
  {
    id: "2",
    name: "Tech Early Adopters",
    description: "High-income innovation enthusiasts first to adopt new technologies",
    size: "850K",
    markets: ["US", "JP", "KR", "DE", "UK"],
    lastUsed: "1 day ago",
    demographics: [
      { label: "Age Range", value: "28-45" },
      { label: "Gender", value: "62% Male" },
      { label: "Income", value: "$120K+" },
      { label: "Education", value: "Graduate+" },
      { label: "Location", value: "Tech Hubs" },
      { label: "Occupation", value: "Tech/Finance" },
    ],
    behaviors: ["early_adopter", "beta_testing", "tech_influencer"],
    interests: ["technology", "AI", "gadgets", "crypto"],
  },
  {
    id: "3",
    name: "Gen Z Content Creators",
    description: "Digital-native creators building personal brands across platforms",
    size: "2.1M",
    markets: ["Global"],
    lastUsed: "3 days ago",
    demographics: [
      { label: "Age Range", value: "18-24" },
      { label: "Gender", value: "55% Female" },
      { label: "Income", value: "$25K-$75K" },
      { label: "Education", value: "In School/Recent Grad" },
      { label: "Location", value: "Global Urban" },
      { label: "Platform", value: "4.2 avg platforms" },
    ],
    behaviors: ["content_creation", "social_media_active", "trend_setting"],
    interests: ["social_media", "video_editing", "fashion", "music"],
  },
  {
    id: "4",
    name: "Luxury Experience Seekers",
    description: "Affluent consumers prioritizing premium experiences over goods",
    size: "680K",
    markets: ["US", "UK", "UAE", "SG", "HK"],
    lastUsed: "5 hours ago",
    demographics: [
      { label: "Age Range", value: "35-55" },
      { label: "Gender", value: "48% Female" },
      { label: "Income", value: "$200K+" },
      { label: "Education", value: "Graduate+" },
      { label: "Location", value: "Major Cities" },
      { label: "Net Worth", value: "$1M+" },
    ],
    behaviors: ["luxury_travel", "fine_dining", "exclusive_memberships"],
    interests: ["experiences", "travel", "art", "wine"],
  },
  {
    id: "5",
    name: "Health-Optimized Professionals",
    description: "Career-focused individuals investing in health optimization",
    size: "920K",
    markets: ["US", "UK", "AU", "CA", "DE"],
    lastUsed: "1 day ago",
    demographics: [
      { label: "Age Range", value: "30-50" },
      { label: "Gender", value: "58% Male" },
      { label: "Income", value: "$150K+" },
      { label: "Education", value: "Bachelor's+" },
      { label: "Location", value: "Urban Professional" },
      { label: "Work Style", value: "High-Performance" },
    ],
    behaviors: ["wellness_focus", "biohacking", "fitness_tracking"],
    interests: ["health", "fitness", "supplements", "sleep_optimization"],
  },
  {
    id: "6",
    name: "Suburban Family Decision Makers",
    description: "Parents controlling majority of family purchasing decisions",
    size: "3.4M",
    markets: ["US", "UK", "CA", "AU"],
    lastUsed: "6 hours ago",
    demographics: [
      { label: "Age Range", value: "32-48" },
      { label: "Gender", value: "68% Female" },
      { label: "Income", value: "$85K-$175K" },
      { label: "Education", value: "Bachelor's+" },
      { label: "Location", value: "Suburban" },
      { label: "Children", value: "2.1 avg" },
    ],
    behaviors: ["family_shopping", "price_comparison", "bulk_buying"],
    interests: ["family", "education", "home_improvement", "meal_planning"],
  },
  {
    id: "7",
    name: "Urban Foodies",
    description: "City dwellers passionate about culinary experiences and food trends",
    size: "1.8M",
    markets: ["US", "UK", "FR", "IT", "JP"],
    lastUsed: "4 hours ago",
    demographics: [
      { label: "Age Range", value: "26-42" },
      { label: "Gender", value: "54% Female" },
      { label: "Income", value: "$70K-$140K" },
      { label: "Education", value: "Bachelor's+" },
      { label: "Location", value: "Urban Centers" },
      { label: "Dining Out", value: "4+ times/week" },
    ],
    behaviors: ["dining_out", "food_photography", "restaurant_reviews"],
    interests: ["food", "restaurants", "cooking", "wine", "travel"],
  },
  {
    id: "8",
    name: "Remote Work Pioneers",
    description: "Professionals who have fully embraced remote and hybrid work",
    size: "2.5M",
    markets: ["US", "UK", "DE", "NL", "AU"],
    lastUsed: "12 hours ago",
    demographics: [
      { label: "Age Range", value: "28-45" },
      { label: "Gender", value: "51% Male" },
      { label: "Income", value: "$80K-$180K" },
      { label: "Education", value: "Bachelor's+" },
      { label: "Location", value: "Flexible/Variable" },
      { label: "Work Type", value: "Remote/Hybrid" },
    ],
    behaviors: ["remote_work", "digital_nomad", "coworking"],
    interests: ["productivity", "work_life_balance", "travel", "home_office"],
  },
]

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffHours / 24)

  if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  return 'Just now'
}

function formatSize(size: number): string {
  if (size >= 1000000) return `${(size / 1000000).toFixed(1)}M`
  if (size >= 1000) return `${(size / 1000).toFixed(0)}K`
  return size.toString()
}

function mapApiAudience(apiAudience: any): Audience {
  const criteria = apiAudience.criteria || {}
  return {
    id: apiAudience.id,
    name: apiAudience.name,
    description: apiAudience.description || '',
    size: formatSize(apiAudience.size || 0),
    markets: criteria.markets || ['Global'],
    lastUsed: formatTimeAgo(apiAudience.updatedAt),
    demographics: criteria.demographics || [],
    behaviors: criteria.behaviors || [],
    interests: criteria.interests || [],
  }
}

export default function AudiencesPage() {
  const [audiences, setAudiences] = useState<Audience[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({ total: 0, avgReach: '0', markets: 0, usedThisWeek: 0 })
  const [searchQuery, setSearchQuery] = useState("")
  const [showAIBuilder, setShowAIBuilder] = useState(false)
  const [showComparison, setShowComparison] = useState(false)
  const [selectedAudience, setSelectedAudience] = useState<Audience | null>(null)
  const [activeTab, setActiveTab] = useState("all")
  const t = useTranslations('dashboard.pages.audiences')

  useEffect(() => {
    async function fetchAudiences() {
      // Helper to calculate stats from audience list
      const calculateStats = (audienceList: Audience[]) => {
        const allMarkets = new Set<string>()
        let totalSize = 0

        audienceList.forEach((a) => {
          a.markets.forEach((m) => allMarkets.add(m))
          // Parse size string like "1.2M", "850K" to number
          const sizeStr = a.size
          if (sizeStr.includes('M')) {
            totalSize += parseFloat(sizeStr) * 1000000
          } else if (sizeStr.includes('K')) {
            totalSize += parseFloat(sizeStr) * 1000
          } else {
            totalSize += parseInt(sizeStr) || 0
          }
        })

        const avgReach = audienceList.length > 0 ? totalSize / audienceList.length : 0
        const avgReachFormatted = avgReach >= 1000000
          ? `${(avgReach / 1000000).toFixed(1)}M`
          : avgReach >= 1000
            ? `${(avgReach / 1000).toFixed(0)}K`
            : avgReach.toString()

        return {
          total: audienceList.length,
          avgReach: avgReachFormatted,
          markets: allMarkets.size,
          usedThisWeek: Math.min(audienceList.length, Math.ceil(audienceList.length * 0.75)),
        }
      }

      try {
        const response = await fetch('/api/v1/audiences')
        if (response.ok) {
          const data = await response.json()
          const apiAudiences = data.audiences || data.data || []

          // Always include demo audiences, then add valid API audiences
          const existingIds = new Set(demoAudiences.map(a => a.id))
          const validApiAudiences = apiAudiences
            .map(mapApiAudience)
            .filter((a: Audience) => !existingIds.has(a.id))
          const allAudiences = [...demoAudiences, ...validApiAudiences]

          setAudiences(allAudiences)
          setStats(calculateStats(allAudiences))
        } else {
          setAudiences(demoAudiences)
          setStats(calculateStats(demoAudiences))
        }
      } catch (error) {
        console.error('Failed to fetch audiences:', error)
        setAudiences(demoAudiences)
        setStats(calculateStats(demoAudiences))
      } finally {
        setIsLoading(false)
      }
    }
    fetchAudiences()
  }, [])

  const filteredAudiences = audiences.filter(a =>
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleAIAttributesGenerated = useCallback((attributes: any[]) => {
    console.log("AI generated attributes:", attributes)
  }, [])

  const handleEstimatedSizeChange = useCallback((size: number) => {
    console.log("Estimated size:", size)
  }, [])

  const handleAddFromMarketplace = useCallback((audience: any) => {
    const newAudience: Audience = {
      id: `mp-${audience.id}`,
      name: audience.name,
      description: audience.description,
      size: audience.estimatedSize,
      markets: audience.markets,
      lastUsed: "Just added",
      demographics: [],
      behaviors: [],
      interests: [],
    }
    setAudiences(prev => [newAudience, ...prev])
  }, [])

  const handleCompareAudience = useCallback((audience: Audience) => {
    setSelectedAudience(audience)
    setShowComparison(true)
  }, [])

  return (
    <div className="flex-1 space-y-6 p-6">
      <PageTracker pageName="Audiences List" metadata={{ activeTab, searchQuery: !!searchQuery }} />
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground mt-1">{t('description')}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowAIBuilder(true)} className="bg-transparent">
            <Sparkles className="h-4 w-4 mr-2" />
            {t('aiBuilder')}
          </Button>
          <Link href="/dashboard/audiences/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {t('newAudience')}
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent rounded-lg">
              <Users className="h-5 w-5 text-accent-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('totalAudiences')}</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('avgReach')}</p>
              <p className="text-2xl font-bold">{stats.avgReach}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Globe className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('markets')}</p>
              <p className="text-2xl font-bold">{stats.markets}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <Clock className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('usedThisWeek')}</p>
              <p className="text-2xl font-bold">{stats.usedThisWeek}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t('searchPlaceholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">{t('allAudiences')}</TabsTrigger>
          <TabsTrigger value="recent">{t('recentlyUsed')}</TabsTrigger>
          <TabsTrigger value="favorites">{t('favorites')}</TabsTrigger>
          <TabsTrigger value="marketplace" className="flex items-center gap-1">
            <Store className="h-4 w-4" />
            {t('marketplace')}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          {isLoading ? (
            <AudiencesGridSkeleton />
          ) : (
            <AudiencesGrid audiences={filteredAudiences} onCompare={handleCompareAudience} />
          )}
        </TabsContent>
        <TabsContent value="recent">
          {isLoading ? (
            <AudiencesGridSkeleton />
          ) : (
            <AudiencesGrid audiences={filteredAudiences.slice(0, 6)} onCompare={handleCompareAudience} />
          )}
        </TabsContent>
        <TabsContent value="favorites">
          {isLoading ? (
            <AudiencesGridSkeleton />
          ) : (
            <AudiencesGrid audiences={filteredAudiences.slice(0, 3)} onCompare={handleCompareAudience} />
          )}
        </TabsContent>
        <TabsContent value="marketplace">
          <AudienceMarketplace onAddAudience={handleAddFromMarketplace} />
        </TabsContent>
      </Tabs>

      {/* AI Query Builder Dialog */}
      <Dialog open={showAIBuilder} onOpenChange={setShowAIBuilder}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              {t('aiAudienceBuilder')}
            </DialogTitle>
            <DialogDescription>
              {t('aiBuilderDescription')}
            </DialogDescription>
          </DialogHeader>
          <AIQueryBuilder
            onAttributesGenerated={handleAIAttributesGenerated}
            onEstimatedSizeChange={handleEstimatedSizeChange}
            markets={["US", "UK", "DE", "FR", "JP", "AU"]}
          />
        </DialogContent>
      </Dialog>

      {/* Comparison Dialog */}
      <Dialog open={showComparison} onOpenChange={setShowComparison}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowLeftRight className="h-5 w-5" />
              {t('compareAudiences')}
            </DialogTitle>
            <DialogDescription>
              {t('compareDescription')}
            </DialogDescription>
          </DialogHeader>
          {selectedAudience && (
            <AudienceComparison
              primaryAudience={selectedAudience}
              availableAudiences={audiences}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function AudiencesGridSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-48 rounded-lg" />
      ))}
    </div>
  )
}

function AudiencesGrid({ audiences, onCompare }: { audiences: Audience[]; onCompare?: (audience: Audience) => void }) {
  if (audiences.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="font-semibold mb-2">No audiences yet</h3>
        <p className="text-sm text-muted-foreground mb-4">Create your first audience to get started</p>
        <Link href="/dashboard/audiences/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Audience
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {audiences.map((audience) => (
        <Card key={audience.id} className="p-4 hover:bg-accent/50 transition-colors group">
          <div className="flex items-start justify-between">
            <Link href={`/dashboard/audiences/${audience.id}`} className="flex-1">
              <h3 className="font-semibold">{audience.name}</h3>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{audience.description}</p>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
              onClick={(e) => {
                e.preventDefault()
                onCompare?.(audience)
              }}
            >
              <ArrowLeftRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-4 mt-4 text-sm">
            <span className="text-muted-foreground">
              <Users className="h-4 w-4 inline mr-1" />
              {audience.size}
            </span>
            <span className="text-muted-foreground">
              <Globe className="h-4 w-4 inline mr-1" />
              {audience.markets.length} markets
            </span>
          </div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-muted-foreground">Used {audience.lastUsed}</p>
            <div className="flex gap-1">
              {audience.markets.slice(0, 3).map(market => (
                <Badge key={market} variant="outline" className="text-xs">
                  {market}
                </Badge>
              ))}
              {audience.markets.length > 3 && (
                <Badge variant="outline" className="text-xs">+{audience.markets.length - 3}</Badge>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
