import { Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Table2, Download, Eye, Clock } from "lucide-react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function CrosstabsPage() {
  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Crosstabs</h1>
          <p className="text-muted-foreground mt-1">Compare audiences across multiple dimensions</p>
        </div>
        <Link href="/dashboard/crosstabs/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Crosstab
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent rounded-lg">
              <Table2 className="h-5 w-5 text-accent-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Crosstabs</p>
              <p className="text-2xl font-bold">42</p>
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
              <p className="text-2xl font-bold">3.2K</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <Download className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Exports</p>
              <p className="text-2xl font-bold">156</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <Clock className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Used Today</p>
              <p className="text-2xl font-bold">8</p>
            </div>
          </div>
        </Card>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Crosstabs</TabsTrigger>
          <TabsTrigger value="recent">Recent</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <Suspense fallback={<CrosstabsGridSkeleton />}>
            <CrosstabsGrid />
          </Suspense>
        </TabsContent>
        <TabsContent value="recent">
          <Suspense fallback={<CrosstabsGridSkeleton />}>
            <CrosstabsGrid filter="recent" />
          </Suspense>
        </TabsContent>
        <TabsContent value="templates">
          <Suspense fallback={<CrosstabsGridSkeleton />}>
            <CrosstabsGrid filter="templates" />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function CrosstabsGridSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-48 rounded-lg" />
      ))}
    </div>
  )
}

function CrosstabsGrid({ filter }: { filter?: string }) {
  const crosstabs = [
    { id: "1", name: "Generational Social Media Platform Analysis", audiences: 4, metrics: 8, lastModified: "1 hour ago" },
    { id: "2", name: "Income Segment Purchase Channel Preferences", audiences: 5, metrics: 8, lastModified: "4 hours ago" },
    { id: "3", name: "Global Market Digital Behavior Comparison", audiences: 8, metrics: 8, lastModified: "2 days ago" },
    { id: "4", name: "Sustainability Attitudes by Consumer Segment", audiences: 5, metrics: 8, lastModified: "6 hours ago" },
    { id: "5", name: "Brand Awareness Competitive Landscape", audiences: 6, metrics: 8, lastModified: "3 hours ago" },
    { id: "6", name: "Media Consumption by Daypart", audiences: 5, metrics: 8, lastModified: "8 hours ago" },
    { id: "7", name: "Financial Product Adoption by Life Stage", audiences: 6, metrics: 8, lastModified: "1 day ago" },
    { id: "8", name: "Health & Wellness Priorities by Persona", audiences: 5, metrics: 8, lastModified: "5 hours ago" },
    { id: "9", name: "Luxury Brand Perception Matrix", audiences: 6, metrics: 8, lastModified: "12 hours ago" },
    { id: "10", name: "Content Format Preferences by Platform", audiences: 6, metrics: 8, lastModified: "2 hours ago" },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {crosstabs.map((crosstab) => (
        <Link key={crosstab.id} href={`/dashboard/crosstabs/${crosstab.id}`}>
          <Card className="p-4 hover:bg-accent/50 transition-colors cursor-pointer">
            <h3 className="font-semibold">{crosstab.name}</h3>
            <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
              <span>{crosstab.audiences} audiences</span>
              <span>{crosstab.metrics} metrics</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Modified {crosstab.lastModified}</p>
          </Card>
        </Link>
      ))}
    </div>
  )
}
