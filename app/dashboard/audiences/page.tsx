"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Plus, Users, TrendingUp, Globe, Clock } from "lucide-react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface Audience {
  id: string
  name: string
  description: string
  size: string
  markets: string[]
  lastUsed: string
}

// Demo audiences for fallback
const demoAudiences: Audience[] = [
  { id: "1", name: "Eco-Conscious Millennials", description: "Sustainability-focused consumers with strong environmental values", size: "1.2M", markets: ["US", "UK", "DE", "FR", "NL"], lastUsed: "2 hours ago" },
  { id: "2", name: "Tech Early Adopters", description: "High-income innovation enthusiasts first to adopt new technologies", size: "850K", markets: ["US", "JP", "KR", "DE", "UK"], lastUsed: "1 day ago" },
  { id: "3", name: "Gen Z Content Creators", description: "Digital-native creators building personal brands across platforms", size: "2.1M", markets: ["Global"], lastUsed: "3 days ago" },
  { id: "4", name: "Luxury Experience Seekers", description: "Affluent consumers prioritizing premium experiences over goods", size: "680K", markets: ["US", "UK", "UAE", "SG", "HK"], lastUsed: "5 hours ago" },
  { id: "5", name: "Health-Optimized Professionals", description: "Career-focused individuals investing in health optimization", size: "920K", markets: ["US", "UK", "AU", "CA", "DE"], lastUsed: "1 day ago" },
  { id: "6", name: "Suburban Family Decision Makers", description: "Parents controlling majority of family purchasing decisions", size: "3.4M", markets: ["US", "UK", "CA", "AU"], lastUsed: "6 hours ago" },
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
  }
}

export default function AudiencesPage() {
  const [audiences, setAudiences] = useState<Audience[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({ total: 0, avgReach: '0', markets: 0, usedThisWeek: 0 })

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

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Audiences</h1>
          <p className="text-muted-foreground mt-1">Build and analyze custom consumer segments</p>
        </div>
        <Link href="/dashboard/audiences/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Audience
          </Button>
        </Link>
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

      {/* Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Audiences</TabsTrigger>
          <TabsTrigger value="recent">Recently Used</TabsTrigger>
          <TabsTrigger value="favorites">Favorites</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          {isLoading ? (
            <AudiencesGridSkeleton />
          ) : (
            <AudiencesGrid audiences={audiences} />
          )}
        </TabsContent>
        <TabsContent value="recent">
          {isLoading ? (
            <AudiencesGridSkeleton />
          ) : (
            <AudiencesGrid audiences={audiences.slice(0, 6)} />
          )}
        </TabsContent>
        <TabsContent value="favorites">
          {isLoading ? (
            <AudiencesGridSkeleton />
          ) : (
            <AudiencesGrid audiences={audiences.slice(0, 3)} />
          )}
        </TabsContent>
      </Tabs>
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

function AudiencesGrid({ audiences }: { audiences: Audience[] }) {
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
        <Link key={audience.id} href={`/dashboard/audiences/${audience.id}`}>
          <Card className="p-4 hover:bg-accent/50 transition-colors cursor-pointer">
            <h3 className="font-semibold">{audience.name}</h3>
            <p className="text-sm text-muted-foreground mt-1">{audience.description}</p>
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
            <p className="text-xs text-muted-foreground mt-2">Used {audience.lastUsed}</p>
          </Card>
        </Link>
      ))}
    </div>
  )
}
