import { Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Plus, BarChart3, TrendingUp, Eye, Share2 } from "lucide-react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ChartsPage() {
  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Charts</h1>
          <p className="text-muted-foreground mt-1">Visualize consumer data with interactive charts</p>
        </div>
        <Link href="/dashboard/charts/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Chart
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent rounded-lg">
              <BarChart3 className="h-5 w-5 text-accent-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Charts</p>
              <p className="text-2xl font-bold">156</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Eye className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Views</p>
              <p className="text-2xl font-bold">12.4K</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <Share2 className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Shares</p>
              <p className="text-2xl font-bold">234</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <TrendingUp className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Exports</p>
              <p className="text-2xl font-bold">89</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Charts</TabsTrigger>
          <TabsTrigger value="recent">Recent</TabsTrigger>
          <TabsTrigger value="favorites">Favorites</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <Suspense fallback={<ChartsGridSkeleton />}>
            <ChartsGrid />
          </Suspense>
        </TabsContent>
        <TabsContent value="recent">
          <Suspense fallback={<ChartsGridSkeleton />}>
            <ChartsGrid filter="recent" />
          </Suspense>
        </TabsContent>
        <TabsContent value="favorites">
          <Suspense fallback={<ChartsGridSkeleton />}>
            <ChartsGrid filter="favorites" />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function ChartsGridSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-64 rounded-lg" />
      ))}
    </div>
  )
}

function ChartsGrid({ filter }: { filter?: string }) {
  const charts = [
    {
      id: "1",
      name: "Social Media Usage by Age",
      type: "Bar Chart",
      audience: "All Adults 18-65",
      lastModified: "2 hours ago",
      views: 234,
    },
    {
      id: "2",
      name: "Purchase Intent Trends",
      type: "Line Chart",
      audience: "Shoppers",
      lastModified: "1 day ago",
      views: 156,
    },
    {
      id: "3",
      name: "Brand Awareness Comparison",
      type: "Horizontal Bar",
      audience: "Target Demo",
      lastModified: "3 days ago",
      views: 89,
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {charts.map((chart) => (
        <Link key={chart.id} href={`/dashboard/charts/${chart.id}`}>
          <Card className="p-4 hover:bg-accent/50 transition-colors cursor-pointer">
            <div className="aspect-video bg-muted rounded-lg mb-3 flex items-center justify-center">
              <BarChart3 className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="font-semibold">{chart.name}</h3>
            <p className="text-sm text-muted-foreground">{chart.type}</p>
            <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
              <span>{chart.lastModified}</span>
              <span>{chart.views} views</span>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  )
}
