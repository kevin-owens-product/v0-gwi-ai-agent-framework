"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Download,
  Share2,
  Edit,
  MoreHorizontal,
  Eye,
  Calendar,
  Users,
  Table2,
  BarChart3,
} from "lucide-react"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

// Mock crosstab data - in production this would come from an API
const crosstabData: Record<string, {
  id: string
  name: string
  audiences: string[]
  metrics: string[]
  lastModified: string
  views: number
  createdBy: string
  description: string
  data: { metric: string; values: Record<string, number> }[]
}> = {
  "1": {
    id: "1",
    name: "Age vs Social Media Platforms",
    audiences: ["18-24", "25-34", "35-44", "45-54"],
    metrics: ["Facebook", "Instagram", "TikTok", "Twitter", "LinkedIn", "YouTube"],
    lastModified: "1 hour ago",
    views: 342,
    createdBy: "John Doe",
    description: "Comparison of social media platform usage across age demographics",
    data: [
      { metric: "Facebook", values: { "18-24": 45, "25-34": 62, "35-44": 71, "45-54": 78 } },
      { metric: "Instagram", values: { "18-24": 78, "25-34": 72, "35-44": 54, "45-54": 38 } },
      { metric: "TikTok", values: { "18-24": 82, "25-34": 56, "35-44": 28, "45-54": 12 } },
      { metric: "Twitter", values: { "18-24": 34, "25-34": 42, "35-44": 38, "45-54": 35 } },
      { metric: "LinkedIn", values: { "18-24": 18, "25-34": 45, "35-44": 52, "45-54": 48 } },
      { metric: "YouTube", values: { "18-24": 89, "25-34": 85, "35-44": 78, "45-54": 72 } },
    ],
  },
  "2": {
    id: "2",
    name: "Income vs Purchase Behavior",
    audiences: ["<$50K", "$50K-$100K", "$100K+"],
    metrics: ["Online Shopping", "In-Store", "Mobile App", "Social Commerce", "Subscription", "Second-hand", "Luxury", "Budget"],
    lastModified: "2 days ago",
    views: 189,
    createdBy: "Jane Smith",
    description: "Analysis of purchasing behavior patterns across income brackets",
    data: [
      { metric: "Online Shopping", values: { "<$50K": 68, "$50K-$100K": 75, "$100K+": 82 } },
      { metric: "In-Store", values: { "<$50K": 72, "$50K-$100K": 65, "$100K+": 58 } },
      { metric: "Mobile App", values: { "<$50K": 54, "$50K-$100K": 62, "$100K+": 71 } },
      { metric: "Social Commerce", values: { "<$50K": 38, "$50K-$100K": 42, "$100K+": 35 } },
      { metric: "Subscription", values: { "<$50K": 28, "$50K-$100K": 45, "$100K+": 68 } },
      { metric: "Second-hand", values: { "<$50K": 42, "$50K-$100K": 35, "$100K+": 22 } },
      { metric: "Luxury", values: { "<$50K": 12, "$50K-$100K": 28, "$100K+": 56 } },
      { metric: "Budget", values: { "<$50K": 78, "$50K-$100K": 52, "$100K+": 28 } },
    ],
  },
  "3": {
    id: "3",
    name: "Gen Z Preferences Across Markets",
    audiences: ["US", "UK", "Germany", "France", "Japan"],
    metrics: ["Streaming", "Gaming", "Social Media", "Shopping", "Travel", "Food Delivery", "Fitness", "Finance Apps", "News", "Podcasts"],
    lastModified: "5 days ago",
    views: 256,
    createdBy: "Mike Johnson",
    description: "Cross-market comparison of Gen Z preferences and behaviors",
    data: [
      { metric: "Streaming", values: { "US": 92, "UK": 88, "Germany": 82, "France": 85, "Japan": 78 } },
      { metric: "Gaming", values: { "US": 75, "UK": 72, "Germany": 78, "France": 68, "Japan": 88 } },
      { metric: "Social Media", values: { "US": 95, "UK": 92, "Germany": 85, "France": 88, "Japan": 82 } },
      { metric: "Shopping", values: { "US": 82, "UK": 78, "Germany": 72, "France": 75, "Japan": 68 } },
      { metric: "Travel", values: { "US": 68, "UK": 72, "Germany": 75, "France": 78, "Japan": 62 } },
      { metric: "Food Delivery", values: { "US": 78, "UK": 75, "Germany": 68, "France": 72, "Japan": 82 } },
      { metric: "Fitness", values: { "US": 62, "UK": 58, "Germany": 55, "France": 52, "Japan": 45 } },
      { metric: "Finance Apps", values: { "US": 48, "UK": 52, "Germany": 45, "France": 42, "Japan": 38 } },
      { metric: "News", values: { "US": 35, "UK": 42, "Germany": 48, "France": 45, "Japan": 52 } },
      { metric: "Podcasts", values: { "US": 58, "UK": 52, "Germany": 42, "France": 45, "Japan": 35 } },
    ],
  },
}

export default function CrosstabDetailPage({ params }: { params: { id: string } }) {
  const [isExporting, setIsExporting] = useState(false)
  const crosstab = crosstabData[params.id]

  if (!crosstab) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/crosstabs">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Crosstab Not Found</h1>
            <p className="text-muted-foreground mt-1">The requested crosstab could not be found</p>
          </div>
        </div>
        <Card className="p-12 text-center">
          <Table2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Crosstab not found</h2>
          <p className="text-muted-foreground mb-4">
            The crosstab you're looking for doesn't exist or has been deleted.
          </p>
          <Link href="/dashboard/crosstabs">
            <Button>Back to Crosstabs</Button>
          </Link>
        </Card>
      </div>
    )
  }

  const handleExport = async () => {
    setIsExporting(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsExporting(false)
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/crosstabs">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{crosstab.name}</h1>
            <p className="text-muted-foreground mt-1">{crosstab.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="bg-transparent">
            <BarChart3 className="h-4 w-4 mr-2" />
            Visualize
          </Button>
          <Button variant="outline" size="sm" className="bg-transparent">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" size="sm" className="bg-transparent" onClick={handleExport} disabled={isExporting}>
            <Download className="h-4 w-4 mr-2" />
            {isExporting ? "Exporting..." : "Export"}
          </Button>
          <Link href={`/dashboard/crosstabs/new?edit=${crosstab.id}`}>
            <Button size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Duplicate</DropdownMenuItem>
              <DropdownMenuItem>Add to Report</DropdownMenuItem>
              <DropdownMenuItem>Save as Template</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Meta info */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <Calendar className="h-4 w-4" />
          <span>Modified {crosstab.lastModified}</span>
        </div>
        <div className="flex items-center gap-1">
          <Eye className="h-4 w-4" />
          <span>{crosstab.views} views</span>
        </div>
        <div className="flex items-center gap-1">
          <Users className="h-4 w-4" />
          <span>Created by {crosstab.createdBy}</span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Main Table */}
        <div className="lg:col-span-3">
          <Card className="p-6">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-semibold">Metric</TableHead>
                    {crosstab.audiences.map((audience) => (
                      <TableHead key={audience} className="text-center font-semibold">
                        {audience}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {crosstab.data.map((row) => (
                    <TableRow key={row.metric}>
                      <TableCell className="font-medium">{row.metric}</TableCell>
                      {crosstab.audiences.map((audience) => (
                        <TableCell key={audience} className="text-center">
                          <span className={`font-mono ${row.values[audience] >= 70 ? "text-emerald-600 font-semibold" : row.values[audience] <= 30 ? "text-amber-600" : ""}`}>
                            {row.values[audience]}%
                          </span>
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="p-6 space-y-4">
            <h3 className="font-semibold">Crosstab Details</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Audiences</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {crosstab.audiences.map((audience) => (
                    <Badge key={audience} variant="secondary" className="text-xs">
                      {audience}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Metrics</p>
                <p className="font-medium">{crosstab.metrics.length} metrics</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 space-y-4">
            <h3 className="font-semibold">Quick Actions</h3>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <Download className="h-4 w-4 mr-2" />
                Export as Excel
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <Download className="h-4 w-4 mr-2" />
                Export as CSV
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <BarChart3 className="h-4 w-4 mr-2" />
                Create Chart
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <Share2 className="h-4 w-4 mr-2" />
                Copy Link
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
