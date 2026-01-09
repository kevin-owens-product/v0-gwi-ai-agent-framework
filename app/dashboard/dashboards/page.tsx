import { Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Plus, LayoutDashboard, Eye, Share2, Download } from "lucide-react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function DashboardsPage() {
  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboards</h1>
          <p className="text-muted-foreground mt-1">Combine charts and insights into shareable dashboards</p>
        </div>
        <Link href="/dashboard/dashboards/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Dashboard
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent rounded-lg">
              <LayoutDashboard className="h-5 w-5 text-accent-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Dashboards</p>
              <p className="text-2xl font-bold">28</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Eye className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Views</p>
              <p className="text-2xl font-bold">8.9K</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <Share2 className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Shared</p>
              <p className="text-2xl font-bold">145</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <Download className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Exports</p>
              <p className="text-2xl font-bold">67</p>
            </div>
          </div>
        </Card>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Dashboards</TabsTrigger>
          <TabsTrigger value="recent">Recent</TabsTrigger>
          <TabsTrigger value="favorites">Favorites</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <Suspense fallback={<DashboardsGridSkeleton />}>
            <DashboardsGrid />
          </Suspense>
        </TabsContent>
        <TabsContent value="recent">
          <Suspense fallback={<DashboardsGridSkeleton />}>
            <DashboardsGrid filter="recent" />
          </Suspense>
        </TabsContent>
        <TabsContent value="favorites">
          <Suspense fallback={<DashboardsGridSkeleton />}>
            <DashboardsGrid filter="favorites" />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function DashboardsGridSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-64 rounded-lg" />
      ))}
    </div>
  )
}

function DashboardsGrid({ filter }: { filter?: string }) {
  const dashboards = [
    { id: "1", name: "Q4 2024 Campaign Performance Hub", charts: 10, lastModified: "1 hour ago", views: 2341 },
    { id: "2", name: "Global Consumer Trends 2024", charts: 12, lastModified: "4 hours ago", views: 5672 },
    { id: "3", name: "Competitive Brand Health Tracker", charts: 8, lastModified: "2 days ago", views: 3892 },
    { id: "4", name: "Gen Z Insights Command Center", charts: 9, lastModified: "6 hours ago", views: 4521 },
    { id: "5", name: "E-commerce Performance Analytics", charts: 10, lastModified: "3 hours ago", views: 2987 },
    { id: "6", name: "Media Mix Optimization Center", charts: 8, lastModified: "8 hours ago", views: 1876 },
    { id: "7", name: "Sustainability & ESG Tracker", charts: 9, lastModified: "1 day ago", views: 2234 },
    { id: "8", name: "Streaming & Entertainment Landscape", charts: 10, lastModified: "5 hours ago", views: 3456 },
    { id: "9", name: "Financial Services Consumer Insights", charts: 9, lastModified: "12 hours ago", views: 2789 },
    { id: "10", name: "Health & Wellness Market Monitor", charts: 10, lastModified: "2 hours ago", views: 1923 },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {dashboards.map((dashboard) => (
        <Link key={dashboard.id} href={`/dashboard/dashboards/${dashboard.id}`}>
          <Card className="p-4 hover:bg-accent/50 transition-colors cursor-pointer">
            <div className="aspect-video bg-muted rounded-lg mb-3 flex items-center justify-center">
              <LayoutDashboard className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="font-semibold">{dashboard.name}</h3>
            <p className="text-sm text-muted-foreground">{dashboard.charts} charts</p>
            <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
              <span>{dashboard.lastModified}</span>
              <span>{dashboard.views} views</span>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  )
}
