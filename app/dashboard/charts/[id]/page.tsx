"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  BarChart3,
  Download,
  Share2,
  Edit,
  MoreHorizontal,
  Eye,
  Calendar,
  Users,
  LineChart,
  PieChart,
} from "lucide-react"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Mock chart data - in production this would come from an API
const chartData: Record<string, {
  id: string
  name: string
  type: "bar" | "line" | "pie"
  audience: string
  metric: string
  lastModified: string
  views: number
  createdBy: string
  description: string
}> = {
  "1": {
    id: "1",
    name: "Social Media Usage by Age",
    type: "bar",
    audience: "All Adults 18-65",
    metric: "Social Media Usage",
    lastModified: "2 hours ago",
    views: 234,
    createdBy: "John Doe",
    description: "Analysis of social media platform preferences across different age groups",
  },
  "2": {
    id: "2",
    name: "Purchase Intent Trends",
    type: "line",
    audience: "Shoppers",
    metric: "Purchase Intent",
    lastModified: "1 day ago",
    views: 156,
    createdBy: "Jane Smith",
    description: "Tracking purchase intent over the last 12 months",
  },
  "3": {
    id: "3",
    name: "Brand Awareness Comparison",
    type: "bar",
    audience: "Target Demo",
    metric: "Brand Awareness",
    lastModified: "3 days ago",
    views: 89,
    createdBy: "Mike Johnson",
    description: "Comparing brand awareness metrics across competitors",
  },
}

const ChartIcon = ({ type }: { type: "bar" | "line" | "pie" }) => {
  switch (type) {
    case "line":
      return <LineChart className="h-16 w-16 text-muted-foreground" />
    case "pie":
      return <PieChart className="h-16 w-16 text-muted-foreground" />
    default:
      return <BarChart3 className="h-16 w-16 text-muted-foreground" />
  }
}

export default function ChartDetailPage({ params }: { params: { id: string } }) {
  const [isExporting, setIsExporting] = useState(false)
  const chart = chartData[params.id]

  if (!chart) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/charts">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Chart Not Found</h1>
            <p className="text-muted-foreground mt-1">The requested chart could not be found</p>
          </div>
        </div>
        <Card className="p-12 text-center">
          <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Chart not found</h2>
          <p className="text-muted-foreground mb-4">
            The chart you're looking for doesn't exist or has been deleted.
          </p>
          <Link href="/dashboard/charts">
            <Button>Back to Charts</Button>
          </Link>
        </Card>
      </div>
    )
  }

  const handleExport = async () => {
    setIsExporting(true)
    // Simulate export delay
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsExporting(false)
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/charts">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{chart.name}</h1>
            <p className="text-muted-foreground mt-1">{chart.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="bg-transparent">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" size="sm" className="bg-transparent" onClick={handleExport} disabled={isExporting}>
            <Download className="h-4 w-4 mr-2" />
            {isExporting ? "Exporting..." : "Export"}
          </Button>
          <Link href={`/dashboard/charts/new?edit=${chart.id}`}>
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
              <DropdownMenuItem>Add to Dashboard</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Meta info */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <Calendar className="h-4 w-4" />
          <span>Modified {chart.lastModified}</span>
        </div>
        <div className="flex items-center gap-1">
          <Eye className="h-4 w-4" />
          <span>{chart.views} views</span>
        </div>
        <div className="flex items-center gap-1">
          <Users className="h-4 w-4" />
          <span>Created by {chart.createdBy}</span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Chart */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
              <ChartIcon type={chart.type} />
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="p-6 space-y-4">
            <h3 className="font-semibold">Chart Details</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Type</p>
                <Badge variant="secondary" className="mt-1 capitalize">
                  {chart.type} Chart
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Audience</p>
                <p className="font-medium">{chart.audience}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Metric</p>
                <p className="font-medium">{chart.metric}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 space-y-4">
            <h3 className="font-semibold">Quick Actions</h3>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <Download className="h-4 w-4 mr-2" />
                Export as PNG
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <Download className="h-4 w-4 mr-2" />
                Export as CSV
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
