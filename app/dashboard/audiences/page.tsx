import { Suspense } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Plus, Users, TrendingUp, Globe, Clock } from "lucide-react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function AudiencesPage() {
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
              <p className="text-2xl font-bold">24</p>
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
              <p className="text-2xl font-bold">2.4M</p>
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
              <p className="text-2xl font-bold">48</p>
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
              <p className="text-2xl font-bold">12</p>
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
          <Suspense fallback={<AudiencesGridSkeleton />}>
            <AudiencesGrid />
          </Suspense>
        </TabsContent>
        <TabsContent value="recent">
          <Suspense fallback={<AudiencesGridSkeleton />}>
            <AudiencesGrid filter="recent" />
          </Suspense>
        </TabsContent>
        <TabsContent value="favorites">
          <Suspense fallback={<AudiencesGridSkeleton />}>
            <AudiencesGrid filter="favorites" />
          </Suspense>
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

function AudiencesGrid({ filter }: { filter?: string }) {
  const audiences = [
    {
      id: "1",
      name: "Eco-Conscious Millennials",
      description: "25-40, urban, high engagement with sustainability brands",
      size: "1.2M",
      markets: ["US", "UK", "DE"],
      lastUsed: "2 hours ago",
    },
    {
      id: "2",
      name: "Tech Early Adopters",
      description: "High-income professionals, first to try new technology",
      size: "850K",
      markets: ["US", "JP", "KR"],
      lastUsed: "1 day ago",
    },
    {
      id: "3",
      name: "Gen Z Content Creators",
      description: "16-25, active on social media, creating content weekly",
      size: "2.1M",
      markets: ["Global"],
      lastUsed: "3 days ago",
    },
  ]

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
