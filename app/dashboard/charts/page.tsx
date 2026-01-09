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
    { id: "1", name: "Social Media Platform Penetration by Generation", type: "Bar Chart", audience: "All Adults 18-65", lastModified: "2 hours ago", views: 1234 },
    { id: "2", name: "E-commerce Purchase Intent Trajectory", type: "Line Chart", audience: "Online Shoppers", lastModified: "4 hours ago", views: 892 },
    { id: "3", name: "Competitive Brand Health Dashboard", type: "Bar Chart", audience: "Category Buyers", lastModified: "1 day ago", views: 567 },
    { id: "4", name: "Media Consumption Time Share", type: "Pie Chart", audience: "Eco-Conscious Millennials", lastModified: "6 hours ago", views: 445 },
    { id: "5", name: "Cross-Market Sustainability Attitudes", type: "Bar Chart", audience: "Premium Consumers", lastModified: "2 days ago", views: 723 },
    { id: "6", name: "Streaming Service Subscriber Journey", type: "Line Chart", audience: "Cord-Cutters", lastModified: "12 hours ago", views: 1089 },
    { id: "7", name: "Gen Z Financial Product Adoption", type: "Bar Chart", audience: "Gen Z (18-25)", lastModified: "1 day ago", views: 634 },
    { id: "8", name: "Influencer Trust by Category", type: "Pie Chart", audience: "Social Media Active Users", lastModified: "3 days ago", views: 512 },
    { id: "9", name: "Health & Wellness Spending Trends", type: "Line Chart", audience: "Health-Optimized Professionals", lastModified: "8 hours ago", views: 378 },
    { id: "10", name: "Luxury Purchase Drivers Analysis", type: "Bar Chart", audience: "Luxury Experience Seekers", lastModified: "5 hours ago", views: 456 },
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
