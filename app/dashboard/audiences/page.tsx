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
  { id: "1", name: "Eco-Conscious Millennials", description: "Sustainability-focused consumers with strong environmental values", size: "1.2M", markets: ["US", "UK", "DE", "FR", "NL"], lastUsed: "2 hours ago", demographics: [{ label: "Age", value: "25-40" }], behaviors: ["eco_shopping"], interests: ["sustainability"] },
  { id: "2", name: "Tech Early Adopters", description: "High-income innovation enthusiasts first to adopt new technologies", size: "850K", markets: ["US", "JP", "KR", "DE", "UK"], lastUsed: "1 day ago", demographics: [{ label: "Income", value: "$100K+" }], behaviors: ["early_adopter"], interests: ["technology"] },
  { id: "3", name: "Gen Z Content Creators", description: "Digital-native creators building personal brands across platforms", size: "2.1M", markets: ["Global"], lastUsed: "3 days ago", demographics: [{ label: "Age", value: "18-24" }], behaviors: ["content_creation"], interests: ["social_media"] },
  { id: "4", name: "Luxury Experience Seekers", description: "Affluent consumers prioritizing premium experiences over goods", size: "680K", markets: ["US", "UK", "UAE", "SG", "HK"], lastUsed: "5 hours ago", demographics: [{ label: "Income", value: "$150K+" }], behaviors: ["luxury_travel"], interests: ["experiences"] },
  { id: "5", name: "Health-Optimized Professionals", description: "Career-focused individuals investing in health optimization", size: "920K", markets: ["US", "UK", "AU", "CA", "DE"], lastUsed: "1 day ago", demographics: [{ label: "Age", value: "30-45" }], behaviors: ["wellness_focus"], interests: ["health", "fitness"] },
  { id: "6", name: "Suburban Family Decision Makers", description: "Parents controlling majority of family purchasing decisions", size: "3.4M", markets: ["US", "UK", "CA", "AU"], lastUsed: "6 hours ago", demographics: [{ label: "Life Stage", value: "Parents" }], behaviors: ["family_shopping"], interests: ["family"] },
  { id: "7", name: "Urban Foodies", description: "City dwellers passionate about culinary experiences and food trends", size: "1.8M", markets: ["US", "UK", "FR", "IT", "JP"], lastUsed: "4 hours ago", demographics: [{ label: "Location", value: "Urban" }], behaviors: ["dining_out"], interests: ["food", "restaurants"] },
  { id: "8", name: "Remote Work Pioneers", description: "Professionals who have fully embraced remote and hybrid work", size: "2.5M", markets: ["US", "UK", "DE", "NL", "AU"], lastUsed: "12 hours ago", demographics: [{ label: "Work Style", value: "Remote" }], behaviors: ["remote_work"], interests: ["productivity", "work_life_balance"] },
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

  useEffect(() => {
    async function fetchAudiences() {
      try {
        const response = await fetch('/api/v1/audiences')
        if (response.ok) {
          const data = await response.json()
          const apiAudiences = data.audiences || data.data || []
          if (apiAudiences.length > 0) {
            const mapped = apiAudiences.map(mapApiAudience)
            setAudiences(mapped)

            // Calculate stats
            const allMarkets = new Set<string>()
            mapped.forEach((a: Audience) => a.markets.forEach((m: string) => allMarkets.add(m)))

            setStats({
              total: mapped.length,
              avgReach: '2.4M',
              markets: allMarkets.size,
              usedThisWeek: Math.min(12, mapped.length),
            })
          } else {
            setAudiences(demoAudiences)
            setStats({ total: 24, avgReach: '2.4M', markets: 48, usedThisWeek: 12 })
          }
        } else {
          setAudiences(demoAudiences)
          setStats({ total: 24, avgReach: '2.4M', markets: 48, usedThisWeek: 12 })
        }
      } catch (error) {
        console.error('Failed to fetch audiences:', error)
        setAudiences(demoAudiences)
        setStats({ total: 24, avgReach: '2.4M', markets: 48, usedThisWeek: 12 })
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
          <h1 className="text-3xl font-bold">Audiences</h1>
          <p className="text-muted-foreground mt-1">Build and analyze custom consumer segments</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowAIBuilder(true)} className="bg-transparent">
            <Sparkles className="h-4 w-4 mr-2" />
            AI Builder
          </Button>
          <Link href="/dashboard/audiences/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Audience
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
              <p className="text-sm text-muted-foreground">Total Audiences</p>
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
              <p className="text-sm text-muted-foreground">Avg. Reach</p>
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
              <p className="text-sm text-muted-foreground">Markets</p>
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
              <p className="text-sm text-muted-foreground">Used This Week</p>
              <p className="text-2xl font-bold">{stats.usedThisWeek}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search audiences..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Audiences</TabsTrigger>
          <TabsTrigger value="recent">Recently Used</TabsTrigger>
          <TabsTrigger value="favorites">Favorites</TabsTrigger>
          <TabsTrigger value="marketplace" className="flex items-center gap-1">
            <Store className="h-4 w-4" />
            Marketplace
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
              AI Audience Builder
            </DialogTitle>
            <DialogDescription>
              Describe your target audience in natural language and let AI generate the criteria for you.
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
              Compare Audiences
            </DialogTitle>
            <DialogDescription>
              Compare demographic and behavioral attributes between audiences.
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
